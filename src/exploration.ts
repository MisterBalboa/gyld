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


