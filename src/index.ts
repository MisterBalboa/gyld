/// <reference types="node" />

var cluster = require('hierarchical-clustering');
const util = require('util');
const xlsx = require('xlsx');
const { analyzeAndScaleDataset } = require('./stats-helpers');

type CliArgs = {
  teams: number | null;
  seed: number | null;
};

type Color = {
  name: string;
  value: number[];
};

type ClusterLevel = {
  clusters: number[][];
};

type ClusterOptions = {
  input: Color[];
  distance: (a: Color, b: Color) => number;
  linkage: (distances: number[]) => number;
  minClusters: number;
};

function parseArgs(argv: string[]): CliArgs {
  let teams: number | null = null;
  let seed: number | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--teams") {
      const value = argv[i + 1];
      if (value == null || value.startsWith("--")) {
        throw new Error("--teams requires a number");
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("--teams must be a non-negative number");
      }
      teams = parsed;
      i++;
      continue;
    }
    if (arg === "--seed") {
      const value = argv[i + 1];
      if (value == null || value.startsWith("--")) {
        throw new Error("--seed requires a number");
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new Error("--seed must be a number");
      }
      seed = parsed;
      i++;
      continue;
    }
  }

  return { teams, seed };
}



function readExcelData(): any[] {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile('data/level_a_players.xlsx');
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    // Transform to match colors variable shape using the actual Excel columns
    const transformedData = jsonData.map((row: any, index: number) => {
      // Extract relevant fields from the row using the actual column names
      const name = row.player_id || `player_${index}`;
      
      // Create a value array using the numeric columns from the Excel data
      const value = [
        row.historical_events_participated || 0,
        row.historical_event_engagements || 0,
        row.historical_points_earned || 0,
        row.historical_points_spent || 0,
        row.historical_messages_sent || 0,
        row.current_total_points || 0,
        row.days_active_last_30 || 0,
        row.current_streak_value || 0,
        row.last_active_ts || 0,
        row.current_team_id || 0
      ];
      
      return { name, value };
    });
    
    return transformedData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

function main(): void {
  try {
    const args = parseArgs(process.argv.slice(2));

    // Read data from Excel file
    const excelData = readExcelData();
    console.log('Excel data loaded:', excelData.length, 'entries');

    // var colors = [
    //   { name: "dark_blue", value: [20, 20, 80] },
    //   { name: "navy_blue", value: [22, 22, 90] },
    //   { name: "off_white", value: [250, 255, 253] },
    //   { name: "purple", value: [100, 54, 255] }
    // ];
     
    // Use Excel data instead of colors for clustering
    const dataToCluster = excelData;
    
    // Analyze and scale the data for clustering
    const { featureStats, scaledData } = analyzeAndScaleDataset(dataToCluster);
    console.log('Feature statistics calculated for', Object.keys(featureStats).length, 'features');
    console.log('Sample feature stats:', Object.entries(featureStats).slice(0, 2));
    console.log('Sample scaled data:', scaledData.slice(0, 2));
     
    // Euclidean distance
    function distance(a: any, b: any) {
      var d = 0;
      for (var i = 0; i < a.value.length; i++) {
        d += Math.pow(a.value[i] - b.value[i], 2);
      }
      return Math.sqrt(d);
    }
     
    // Single-linkage clustering
    function linkage(distances: number[]): number {
      return Math.min.apply(null, distances);
    }
     
    var levels: ClusterLevel[] = cluster({
      input: scaledData,
      distance: distance,
      linkage: linkage,
      minClusters: 3,
    });
     
    var clusters: number[][] = levels[levels.length - 1].clusters;
    // console.log(clusters);

    var colorClusters: Color[][] = clusters.map(function (cluster, index) {
      console.log('cluster length: ', index, cluster.length)
      return cluster.map(function (index) {
        return dataToCluster[index];
      });
    });

    // console.log(util.inspect(colorClusters, { depth: 1000 }));

    console.log("Finished script.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    process.exitCode = 1;
  }
}

main();


