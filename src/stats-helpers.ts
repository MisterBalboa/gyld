// ============================================================================
// NUMERIC STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate basic statistics for numeric data
 * @param values - Array of numeric values
 * @returns Object with statistical measures
 */
export function calculateNumericStats(values: number[]): {
  count: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  mode: number | null;
  standardDeviation: number;
  variance: number;
  sum: number;
} {
  if (values.length === 0) {
    throw new Error('Cannot calculate statistics for empty array');
  }

  // Filter out non-numeric values
  const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  
  if (numericValues.length === 0) {
    throw new Error('No valid numeric values found');
  }

  // Sort for median calculation
  const sorted = [...numericValues].sort((a, b) => a - b);
  
  // Basic calculations
  const count = numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min;
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  
  // Median
  const median = count % 2 === 0 
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];
  
  // Mode
  const frequencyMap = new Map<number, number>();
  numericValues.forEach(val => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  });
  
  let mode: number | null = null;
  let maxFreq = 0;
  frequencyMap.forEach((freq, val) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = val;
    }
  });
  
  // Variance and Standard Deviation
  const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    count,
    min,
    max,
    range,
    mean,
    median,
    mode,
    standardDeviation,
    variance,
    sum
  };
}

/**
 * Calculate statistics for a specific column in the dataset
 * @param data - Array of objects (dataset)
 * @param columnName - Name of the column to analyze
 * @returns Statistical measures for the column
 */
export function analyzeNumericColumn(data: any[], columnName: string) {
  const values = data.map(row => row[columnName]).filter(val => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) {
    throw new Error(`No numeric values found in column '${columnName}'`);
  }
  
  return calculateNumericStats(values);
}

// ============================================================================
// CATEGORICAL STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Count unique values in categorical data
 * @param values - Array of categorical values
 * @returns Number of unique values
 */
export function countUniqueValues(values: any[]): number {
  const uniqueSet = new Set(values);
  return uniqueSet.size;
}

/**
 * Find the mode (most frequent value) in categorical data
 * @param values - Array of categorical values
 * @returns The most frequent value(s) and their count
 */
export function findMode(values: any[]): {
  mode: any[];
  count: number;
} {
  const frequencyMap = new Map<any, number>();
  
  values.forEach(val => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  });
  
  let maxFreq = 0;
  let modes: any[] = [];
  
  frequencyMap.forEach((freq, val) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      modes = [val];
    } else if (freq === maxFreq) {
      modes.push(val);
    }
  });
  
  return {
    mode: modes,
    count: maxFreq
  };
}

/**
 * Create a frequency table for categorical data
 * @param values - Array of categorical values
 * @returns Array of objects with value, count, and percentage
 */
export function createFrequencyTable(values: any[]): Array<{
  value: any;
  count: number;
  percentage: number;
}> {
  const frequencyMap = new Map<any, number>();
  const total = values.length;
  
  values.forEach(val => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  });
  
  const frequencyTable = Array.from(frequencyMap.entries()).map(([value, count]) => ({
    value,
    count,
    percentage: (count / total) * 100
  }));
  
  // Sort by count (descending)
  return frequencyTable.sort((a, b) => b.count - a.count);
}

/**
 * Analyze a categorical column in the dataset
 * @param data - Array of objects (dataset)
 * @param columnName - Name of the column to analyze
 * @returns Categorical analysis results
 */
export function analyzeCategoricalColumn(data: any[], columnName: string) {
  const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined);
  
  if (values.length === 0) {
    throw new Error(`No values found in column '${columnName}'`);
  }
  
  const uniqueCount = countUniqueValues(values);
  const modeResult = findMode(values);
  const frequencyTable = createFrequencyTable(values);
  
  return {
    totalCount: values.length,
    uniqueCount,
    mode: modeResult.mode,
    modeCount: modeResult.count,
    frequencyTable
  };
}

// ============================================================================
// FEATURE STATISTICS FOR CLUSTERING
// ============================================================================

/**
 * Interface for feature statistics used in data scaling
 */
export interface FeatureStats {
  min: number;
  max: number;
  mean: number;
  stddev: number;
}

/**
 * Analyze dataset and create FeatureStats for each numeric feature
 * @param data - Array of objects with 'value' property containing numeric arrays
 * @returns Object mapping feature index to FeatureStats
 */
export function createFeatureStats(data: Array<{ name: string; value: number[] }>): { [featureIndex: number]: FeatureStats } {
  if (data.length === 0) {
    throw new Error('Cannot create feature stats for empty dataset');
  }

  const numFeatures = data[0].value.length;
  const featureStats: { [featureIndex: number]: FeatureStats } = {};

  // For each feature dimension
  for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
    // Extract all values for this feature
    const featureValues = data.map(item => item.value[featureIndex]).filter(val => typeof val === 'number' && !isNaN(val));
    
    if (featureValues.length === 0) {
      throw new Error(`No valid numeric values found for feature ${featureIndex}`);
    }

    // Calculate statistics for this feature
    const stats = calculateNumericStats(featureValues);
    
    featureStats[featureIndex] = {
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      stddev: stats.standardDeviation
    };
  }

  return featureStats;
}

/**
 * Scale a single value using feature statistics
 * @param value - The value to scale
 * @param featStats - Feature statistics for the dimension
 * @returns Scaled value
 */
export function scaleFeature(value: number, featStats: FeatureStats): number {
  // First normalize (min-max scaling to [0,1])
  const normalized = (value - featStats.min) / (featStats.max - featStats.min);
  
  // Then standardize (z-score normalization)
  return (normalized - featStats.mean) / featStats.stddev;
}

/**
 * Scale an entire dataset using feature statistics
 * @param data - Array of objects with 'value' property containing numeric arrays
 * @param featureStats - Feature statistics for each dimension
 * @returns Scaled dataset with same structure
 */
export function scaleDataset(data: Array<{ name: string; value: number[] }>, featureStats: { [featureIndex: number]: FeatureStats }): Array<{ name: string; value: number[] }> {
  return data.map(item => ({
    name: item.name,
    value: item.value.map((val, featureIndex) => {
      const stats = featureStats[featureIndex];
      if (!stats) {
        throw new Error(`No statistics found for feature ${featureIndex}`);
      }
      return scaleFeature(val, stats);
    })
  }));
}

/**
 * Complete pipeline: analyze dataset and return scaled data
 * @param data - Array of objects with 'value' property containing numeric arrays
 * @returns Object containing feature stats and scaled data
 */
export function analyzeAndScaleDataset(data: Array<{ name: string; value: number[] }>): {
  featureStats: { [featureIndex: number]: FeatureStats };
  scaledData: Array<{ name: string; value: number[] }>;
} {
  const featureStats = createFeatureStats(data);
  const scaledData = scaleDataset(data, featureStats);
  
  return {
    featureStats,
    scaledData
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine if a column is numeric or categorical
 * @param data - Array of objects (dataset)
 * @param columnName - Name of the column to check
 * @returns 'numeric' or 'categorical'
 */
export function getColumnType(data: any[], columnName: string): 'numeric' | 'categorical' {
  const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined);
  
  if (values.length === 0) {
    return 'categorical'; // Default to categorical for empty columns
  }
  
  // Check if more than 80% of values are numeric
  const numericCount = values.filter(val => typeof val === 'number' && !isNaN(val)).length;
  const numericPercentage = (numericCount / values.length) * 100;
  
  return numericPercentage >= 80 ? 'numeric' : 'categorical';
}

/**
 * Analyze all columns in a dataset
 * @param data - Array of objects (dataset)
 * @returns Analysis results for all columns
 */
export function analyzeDataset(data: any[]): {
  numericColumns: { [key: string]: any };
  categoricalColumns: { [key: string]: any };
  columnTypes: { [key: string]: 'numeric' | 'categorical' };
} {
  if (data.length === 0) {
    throw new Error('Cannot analyze empty dataset');
  }
  
  const columns = Object.keys(data[0]);
  const columnTypes: { [key: string]: 'numeric' | 'categorical' } = {};
  const numericColumns: { [key: string]: any } = {};
  const categoricalColumns: { [key: string]: any } = {};
  
  columns.forEach(column => {
    const type = getColumnType(data, column);
    columnTypes[column] = type;
    
    try {
      if (type === 'numeric') {
        numericColumns[column] = analyzeNumericColumn(data, column);
      } else {
        categoricalColumns[column] = analyzeCategoricalColumn(data, column);
      }
    } catch (error) {
      console.warn(`Error analyzing column '${column}':`, error);
    }
  });
  
  return {
    numericColumns,
    categoricalColumns,
    columnTypes
  };
}
