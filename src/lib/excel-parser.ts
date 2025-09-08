/**
 * Excel and spreadsheet data parsing utilities
 * Handles clipboard data from Excel, Google Sheets, etc.
 */

export interface ExcelParseResult {
  data: number[][];
  headers?: string[];
  validNumbers: number[];
  invalidEntries: string[];
  metadata: {
    rows: number;
    columns: number;
    format: 'single-column' | 'multi-column' | 'table';
    hasHeaders: boolean;
  };
}

/**
 * Parse Excel/CSV clipboard data (tab or comma separated)
 */
export function parseExcelData(clipboardText: string): ExcelParseResult {
  const lines = clipboardText.trim().split(/\r?\n/);
  
  if (lines.length === 0) {
    return {
      data: [],
      validNumbers: [],
      invalidEntries: [],
      metadata: {
        rows: 0,
        columns: 0,
        format: 'single-column',
        hasHeaders: false
      }
    };
  }
  
  // Detect separator (tab is more common for Excel paste)
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  const separator = tabCount > commaCount ? '\t' : ',';
  
  // Parse data into 2D array
  const data: string[][] = lines.map(line => 
    line.split(separator).map(cell => cell.trim())
  );
  
  // Determine if first row contains headers
  const firstRow = data[0];
  const hasHeaders = firstRow.some(cell => 
    isNaN(parseFloat(cell)) && cell.length > 0 && 
    !/^-?\d*\.?\d*$/.test(cell)
  );
  
  const headers = hasHeaders ? firstRow : undefined;
  const dataRows = hasHeaders ? data.slice(1) : data;
  
  // Extract numbers and classify format
  const numericData: number[][] = [];
  const allValidNumbers: number[] = [];
  const allInvalidEntries: string[] = [];
  
  dataRows.forEach(row => {
    const numericRow: number[] = [];
    
    row.forEach(cell => {
      const trimmed = cell.trim();
      if (trimmed === '') return; // Skip empty cells
      
      const num = parseFloat(trimmed);
      if (!isNaN(num) && isFinite(num)) {
        numericRow.push(num);
        allValidNumbers.push(num);
      } else {
        allInvalidEntries.push(trimmed);
      }
    });
    
    if (numericRow.length > 0) {
      numericData.push(numericRow);
    }
  });
  
  // Determine format
  let format: 'single-column' | 'multi-column' | 'table';
  const maxColumns = Math.max(...numericData.map(row => row.length));
  
  if (maxColumns === 1) {
    format = 'single-column';
  } else if (numericData.length === 1 || (headers && headers.length <= 3)) {
    format = 'multi-column';
  } else {
    format = 'table';
  }
  
  return {
    data: numericData,
    headers,
    validNumbers: allValidNumbers,
    invalidEntries: allInvalidEntries,
    metadata: {
      rows: numericData.length,
      columns: maxColumns,
      format,
      hasHeaders
    }
  };
}

/**
 * Extract specific column from Excel data
 */
export function extractColumn(
  excelResult: ExcelParseResult, 
  columnIndex: number
): number[] {
  if (columnIndex < 0 || excelResult.data.length === 0) {
    return [];
  }
  
  return excelResult.data
    .filter(row => row.length > columnIndex)
    .map(row => row[columnIndex]);
}

/**
 * Extract specific row from Excel data
 */
export function extractRow(
  excelResult: ExcelParseResult, 
  rowIndex: number
): number[] {
  if (rowIndex < 0 || rowIndex >= excelResult.data.length) {
    return [];
  }
  
  return excelResult.data[rowIndex];
}

/**
 * Parse grade sheet data (handles common grade formats)
 */
export function parseGradeSheet(clipboardText: string): ExcelParseResult & {
  gradeInfo: {
    possibleGradeColumns: number[];
    studentCount: number;
    gradeStats?: {
      column: number;
      average: number;
      min: number;
      max: number;
    }[];
  };
} {
  const baseResult = parseExcelData(clipboardText);
  
  // Identify potential grade columns (numeric data in reasonable range)
  const possibleGradeColumns: number[] = [];
  const gradeStats: Array<{
    column: number;
    average: number;
    min: number;
    max: number;
  }> = [];
  
  if (baseResult.data.length > 0) {
    const maxColumns = Math.max(...baseResult.data.map(row => row.length));
    
    for (let col = 0; col < maxColumns; col++) {
      const columnData = extractColumn(baseResult, col);
      
      if (columnData.length >= 2) {
        const min = Math.min(...columnData);
        const max = Math.max(...columnData);
        const average = columnData.reduce((sum, val) => sum + val, 0) / columnData.length;
        
        // Heuristic: likely grades if in reasonable range
        if ((min >= 0 && max <= 100) || (min >= 0 && max <= 4)) {
          possibleGradeColumns.push(col);
          gradeStats.push({
            column: col,
            average,
            min,
            max
          });
        }
      }
    }
  }
  
  return {
    ...baseResult,
    gradeInfo: {
      possibleGradeColumns,
      studentCount: baseResult.data.length,
      gradeStats: gradeStats.length > 0 ? gradeStats : undefined
    }
  };
}

/**
 * Parse research data (handles scientific notation and high precision)
 */
export function parseResearchData(clipboardText: string): ExcelParseResult & {
  researchInfo: {
    hasScientificNotation: boolean;
    precisionLevels: number[];
    outlierCandidates: number[];
    suggestedSignificantFigures: number;
  };
} {
  const baseResult = parseExcelData(clipboardText);
  
  // Analyze scientific characteristics
  const hasScientificNotation = /\d+\.?\d*[eE][+-]?\d+/.test(clipboardText);
  
  const precisionLevels: number[] = [];
  const allNumbers = baseResult.validNumbers;
  
  // Analyze precision for each number
  allNumbers.forEach(num => {
    const str = num.toString();
    if (str.includes('.')) {
      precisionLevels.push(str.split('.')[1].length);
    } else {
      precisionLevels.push(0);
    }
  });
  
  // Find potential outliers using simple IQR method
  const outlierCandidates: number[] = [];
  if (allNumbers.length >= 4) {
    const sorted = [...allNumbers].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    allNumbers.forEach(num => {
      if (num < lowerBound || num > upperBound) {
        outlierCandidates.push(num);
      }
    });
  }
  
  // Suggest significant figures based on data
  const avgPrecision = precisionLevels.length > 0 ? 
    Math.round(precisionLevels.reduce((sum, p) => sum + p, 0) / precisionLevels.length) : 2;
  const suggestedSignificantFigures = Math.max(2, Math.min(6, avgPrecision + 2));
  
  return {
    ...baseResult,
    researchInfo: {
      hasScientificNotation,
      precisionLevels,
      outlierCandidates,
      suggestedSignificantFigures
    }
  };
}

/**
 * Convert Excel data back to formatted string
 */
export function formatExcelData(data: number[][], separator: '\t' | ',' = '\t'): string {
  return data
    .map(row => row.join(separator))
    .join('\n');
}

/**
 * Detect and handle common Excel formatting issues
 */
export function cleanExcelData(text: string): string {
  return text
    // Remove Excel quotes around cells
    .replace(/"([^"]*)"/g, '$1')
    // Handle Excel's thousands separators
    .replace(/(\d),(\d{3})/g, '$1$2')
    // Handle Excel's currency symbols
    .replace(/\$([0-9.,]+)/g, '$1')
    // Handle percentage symbols
    .replace(/([0-9.]+)%/g, (match, num) => (parseFloat(num) / 100).toString())
    // Remove extra whitespace
    .trim();
}

/**
 * Export functions for easy access
 */
export const excelUtils = {
  parseExcelData,
  parseGradeSheet,
  parseResearchData,
  extractColumn,
  extractRow,
  formatExcelData,
  cleanExcelData
};