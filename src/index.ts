/// <reference types="node" />

var cluster = require('hierarchical-clustering');
const util = require('util');

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

function main(): void {
  try {
    const args = parseArgs(process.argv.slice(2));

    var colors = [
      { name: "dark_blue", value: [20, 20, 80] },
      { name: "navy_blue", value: [22, 22, 90] },
      { name: "off_white", value: [250, 255, 253] },
      { name: "purple", value: [100, 54, 255] }
    ];
     
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
      input: colors,
      distance: distance,
      linkage: linkage,
      minClusters: 2, // only want two clusters
    });
     
    var clusters: number[][] = levels[levels.length - 1].clusters;
    // console.log(clusters);

    var colorClusters: Color[][] = clusters.map(function (cluster) {
      return cluster.map(function (index) {
        return colors[index];
      });
    });

    console.log(util.inspect(colorClusters, { depth: 1000 }));

    console.log("Finished script.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    process.exitCode = 1;
  }
}

main();


