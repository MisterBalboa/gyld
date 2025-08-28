import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import {
  analyzeDataset,
  analyzeNumericColumn,
  analyzeCategoricalColumn
} from './stats-helpers';

/**
 * Read an Excel file and return the data as JSON
 * @param filePath - Path to the Excel file
 * @param sheetName - Optional sheet name (defaults to first sheet)
 * @returns Array of objects representing the sheet data
 */
export function readExcelFile(filePath: string, sheetName?: string): any[] {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get the sheet name (use first sheet if not specified)
    const sheetToRead = sheetName || workbook.SheetNames[0];
    
    if (!workbook.SheetNames.includes(sheetToRead)) {
      throw new Error(`Sheet '${sheetToRead}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
    }

    // Get the worksheet
    const worksheet = workbook.Sheets[sheetToRead];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

/**
 * Get information about an Excel file (sheets, dimensions, etc.)
 * @param filePath - Path to the Excel file
 * @returns Object with file information
 */
export function getExcelFileInfo(filePath: string): {
  sheetNames: string[];
  sheets: Array<{
    name: string;
    range: string;
    rows: number;
    cols: number;
  }>;
} {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    const sheets = sheetNames.map(name => {
      const worksheet = workbook.Sheets[name];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      return {
        name,
        range: worksheet['!ref'] || 'A1',
        rows: range.e.r + 1,
        cols: range.e.c + 1
      };
    });

    return { sheetNames, sheets };
  } catch (error) {
    console.error('Error getting Excel file info:', error);
    throw error;
  }
}

/**
 * Example function to read the level_a_players.xlsx file
 */
export function readLevelAPlayers(): any[] {
  const dataPath = path.join(__dirname, '..', 'data', 'level_a_players.xlsx');
  return readExcelFile(dataPath);
}

// Example usage
if (require.main === module) {
  try {
    console.log('Excel file reading and statistical analysis examples:');
    
    // Example 1: Get file information
    const dataPath = path.join(__dirname, '..', 'data', 'level_a_players.xlsx');
    if (fs.existsSync(dataPath)) {
      console.log('\n1. File information:');
      const fileInfo = getExcelFileInfo(dataPath);
      console.log('Sheet names:', fileInfo.sheetNames);
      console.log('Sheets:', fileInfo.sheets);
      
      // Example 2: Read the data
      console.log('\n2. Reading data:');
      const data = readExcelFile(dataPath);
      console.log(`Found ${data.length} rows of data`);
      if (data.length > 0) {
        console.log('Column headers:', Object.keys(data[0]));
        
        // Example 3: Analyze all columns
        console.log('\n3. Complete dataset analysis:');
        const analysis = analyzeDataset(data);
        console.log('Column types:', analysis.columnTypes);
        
        // Example 4: Show numeric column statistics
        console.log('\n4. Numeric column statistics:');
        Object.entries(analysis.numericColumns).forEach(([column, stats]) => {
          console.log(`\n${column}:`);
          console.log(`  Count: ${stats.count}`);
          console.log(`  Range: ${stats.min} - ${stats.max} (${stats.range})`);
          console.log(`  Mean: ${stats.mean.toFixed(2)}`);
          console.log(`  Median: ${stats.median.toFixed(2)}`);
          console.log(`  Mode: ${stats.mode}`);
          console.log(`  Std Dev: ${stats.standardDeviation.toFixed(2)}`);
          console.log(`  Variance: ${stats.variance.toFixed(2)}`);
        });
        
        // Example 5: Show categorical column statistics
        console.log('\n5. Categorical column statistics:');
        Object.entries(analysis.categoricalColumns).forEach(([column, stats]) => {
          console.log(`\n${column}:`);
          console.log(`  Total count: ${stats.totalCount}`);
          console.log(`  Unique values: ${stats.uniqueCount}`);
          console.log(`  Mode: ${stats.mode} (count: ${stats.modeCount})`);
          console.log('  Top 5 values:');
          stats.frequencyTable.slice(0, 5).forEach((item: { value: any; count: number; percentage: number }) => {
            console.log(`    ${item.value}: ${item.count} (${item.percentage.toFixed(1)}%)`);
          });
        });
        
        // Example 6: Specific column analysis examples
        console.log('\n6. Specific column analysis examples:');
        
        // Numeric example
        try {
          const pointsStats = analyzeNumericColumn(data, 'current_total_points');
          console.log('\ncurrent_total_points (numeric analysis):');
          console.log(`  Mean: ${pointsStats.mean.toFixed(2)}`);
          console.log(`  Standard deviation: ${pointsStats.standardDeviation.toFixed(2)}`);
          console.log(`  Range: ${pointsStats.min} - ${pointsStats.max}`);
        } catch (error) {
          console.log('Error analyzing current_total_points:', error);
        }
        
        // Categorical example
        try {
          const teamStats = analyzeCategoricalColumn(data, 'current_team_name');
          console.log('\ncurrent_team_name (categorical analysis):');
          console.log(`  Unique teams: ${teamStats.uniqueCount}`);
          console.log(`  Most common team: ${teamStats.mode} (${teamStats.modeCount} players)`);
          console.log('  Team distribution:');
          teamStats.frequencyTable.forEach(item => {
            console.log(`    ${item.value}: ${item.count} players (${item.percentage.toFixed(1)}%)`);
          });
        } catch (error) {
          console.log('Error analyzing current_team_name:', error);
        }
      }
    } else {
      console.log('level_a_players.xlsx not found in data directory');
    }
  } catch (error) {
    console.error('Error in example:', error);
  }
}
