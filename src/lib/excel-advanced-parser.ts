/**
 * Advanced Excel data parser for teacher scenarios
 * Supports complex Excel formats, multiple sheets, and batch processing
 */

import { read, utils, WorkBook, WorkSheet } from 'xlsx';

export interface ExcelParseOptions {
  sheetName?: string;
  headerRow?: number;
  dataStartRow?: number;
  dataColumn?: string | number;
  skipEmptyRows?: boolean;
  skipEmptyColumns?: boolean;
  maxRows?: number;
  detectDataTypes?: boolean;
  ignoreFormulas?: boolean;
  dateFormats?: string[];
}

export interface ExcelSheet {
  name: string;
  data: any[][];
  headers?: string[];
  rowCount: number;
  columnCount: number;
  hasData: boolean;
}

export interface ParsedExcelData {
  sheets: ExcelSheet[];
  selectedSheet?: ExcelSheet;
  numbers: number[];
  originalData: any[];
  metadata: {
    fileName?: string;
    fileSize?: number;
    totalSheets: number;
    totalRows: number;
    totalColumns: number;
    parseTime: number;
    warnings: string[];
    dataTypes: Record<string, string>;
  };
}

export interface TeacherDataFormat {
  type: 'grades' | 'attendance' | 'scores' | 'generic';
  structure: {
    hasHeaders: boolean;
    nameColumn?: number;
    dataColumns: number[];
    totalRows: number;
    pattern: string;
  };
  suggestions: {
    columnToUse: number;
    dataRange: string;
    expectedFormat: string;
  };
}

export class AdvancedExcelParser {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_ROWS = 10000;
  private static readonly MAX_COLUMNS = 100;
  
  /**
   * Parse Excel file from File object
   */
  static async parseFile(
    file: File,
    options: ExcelParseOptions = {}
  ): Promise<ParsedExcelData> {
    const startTime = performance.now();
    
    // Validate file
    this.validateFile(file);
    
    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      // Parse all sheets
      const sheets = this.parseAllSheets(workbook, options);
      const selectedSheet = this.selectBestSheet(sheets, options.sheetName);
      
      // Extract numerical data
      const { numbers, originalData } = this.extractNumbers(selectedSheet, options);
      
      // Generate metadata
      const metadata = this.generateMetadata(workbook, sheets, file, startTime);
      
      return {
        sheets,
        selectedSheet,
        numbers,
        originalData,
        metadata
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Excel data from raw buffer or base64
   */
  static parseBuffer(
    buffer: ArrayBuffer | string,
    options: ExcelParseOptions = {}
  ): ParsedExcelData {
    const startTime = performance.now();
    
    try {
      const workbook = read(buffer, {
        type: typeof buffer === 'string' ? 'base64' : 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const sheets = this.parseAllSheets(workbook, options);
      const selectedSheet = this.selectBestSheet(sheets, options.sheetName);
      const { numbers, originalData } = this.extractNumbers(selectedSheet, options);
      const metadata = this.generateMetadata(workbook, sheets, null, startTime);

      return {
        sheets,
        selectedSheet,
        numbers,
        originalData,
        metadata
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze teacher data format and provide suggestions
   */
  static analyzeTeacherData(sheet: ExcelSheet): TeacherDataFormat {
    const data = sheet.data;
    const firstRow = data[0] || [];
    const hasHeaders = this.detectHeaders(firstRow);
    
    // Detect data pattern
    const pattern = this.detectDataPattern(data);
    const dataColumns = this.findDataColumns(data, hasHeaders);
    
    let type: TeacherDataFormat['type'] = 'generic';
    
    // Detect specific formats
    if (this.isGradesheet(data, firstRow)) {
      type = 'grades';
    } else if (this.isAttendanceSheet(data, firstRow)) {
      type = 'attendance';
    } else if (this.isScoreSheet(data, firstRow)) {
      type = 'scores';
    }

    return {
      type,
      structure: {
        hasHeaders,
        nameColumn: this.findNameColumn({ data }),
        dataColumns,
        totalRows: data.length,
        pattern
      },
      suggestions: {
        columnToUse: dataColumns[0] || 0,
        dataRange: this.formatDataRange(hasHeaders ? 1 : 0, data.length - 1, dataColumns),
        expectedFormat: this.getExpectedFormat(type)
      }
    };
  }

  /**
   * Extract grades from a typical gradebook format
   */
  static extractGrades(
    sheet: ExcelSheet,
    assignmentColumn: number | string,
    options: { 
      skipStudentNames?: boolean;
      maxPoints?: number;
      convertToPercentage?: boolean;
    } = {}
  ): {
    grades: number[];
    studentNames?: string[];
    statistics: {
      submitted: number;
      missing: number;
      average: number;
      highest: number;
      lowest: number;
    };
  } {
    const data = sheet.data;
    const colIndex = typeof assignmentColumn === 'string' 
      ? this.columnLetterToIndex(assignmentColumn)
      : assignmentColumn;
    
    const grades: number[] = [];
    const studentNames: string[] = [];
    let submitted = 0;
    let missing = 0;
    
    const startRow = sheet.headers ? 1 : 0;
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // Extract student name if requested
      if (!options.skipStudentNames) {
        const nameCol = this.findNameColumn({ data });
        if (nameCol !== undefined && row[nameCol]) {
          studentNames.push(String(row[nameCol]).trim());
        }
      }
      
      // Extract grade
      const cellValue = row[colIndex];
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        missing++;
        continue;
      }
      
      const grade = this.parseNumericValue(cellValue);
      if (!isNaN(grade)) {
        let processedGrade = grade;
        
        // Convert to percentage if needed
        if (options.convertToPercentage && options.maxPoints) {
          processedGrade = (grade / options.maxPoints) * 100;
        }
        
        grades.push(processedGrade);
        submitted++;
      } else {
        missing++;
      }
    }
    
    // Calculate statistics
    const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
    const highest = grades.length > 0 ? Math.max(...grades) : 0;
    const lowest = grades.length > 0 ? Math.min(...grades) : 0;
    
    return {
      grades,
      ...(studentNames.length > 0 && { studentNames }),
      statistics: {
        submitted,
        missing,
        average,
        highest,
        lowest
      }
    };
  }

  /**
   * Batch process multiple assignments from a gradebook
   */
  static batchProcessGradebook(
    sheet: ExcelSheet,
    assignmentColumns: (number | string)[],
    options: {
      assignmentNames?: string[];
      maxPoints?: number[];
      convertToPercentage?: boolean;
    } = {}
  ): {
    assignments: Array<{
      name: string;
      grades: number[];
      statistics: {
        submitted: number;
        missing: number;
        average: number;
        highest: number;
        lowest: number;
      };
    }>;
    overallStatistics: {
      totalStudents: number;
      averageCompletion: number;
      classAverages: number[];
    };
  } {
    const assignments: any[] = [];
    const classAverages: number[] = [];
    
    assignmentColumns.forEach((col, index) => {
      const assignmentName = options.assignmentNames?.[index] || `Assignment ${index + 1}`;
      const maxPoints = options.maxPoints?.[index];
      
      const result = this.extractGrades(sheet, col, {
        skipStudentNames: index > 0, // Only get names once
        maxPoints,
        convertToPercentage: options.convertToPercentage
      });
      
      assignments.push({
        name: assignmentName,
        grades: result.grades,
        statistics: result.statistics
      });
      
      classAverages.push(result.statistics.average);
    });
    
    const totalStudents = assignments[0]?.grades.length || 0;
    const averageCompletion = assignments.reduce((acc, assignment) => {
      return acc + (assignment.statistics.submitted / totalStudents);
    }, 0) / assignments.length;
    
    return {
      assignments,
      overallStatistics: {
        totalStudents,
        averageCompletion: averageCompletion * 100,
        classAverages
      }
    };
  }

  // Private helper methods
  private static validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      '.xlsx',
      '.xls',
      '.csv'
    ];
    
    const isValidType = allowedTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValidType) {
      throw new Error('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files.');
    }
  }

  private static parseAllSheets(workbook: WorkBook, options: ExcelParseOptions): ExcelSheet[] {
    const sheets: ExcelSheet[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = this.parseWorksheet(worksheet, options);
      
      sheets.push({
        name: sheetName,
        data: sheetData,
        headers: this.extractHeaders(sheetData, options.headerRow),
        rowCount: sheetData.length,
        columnCount: sheetData[0]?.length || 0,
        hasData: sheetData.length > 0 && sheetData.some(row => row.some(cell => cell !== null && cell !== undefined))
      });
    });
    
    return sheets;
  }

  private static parseWorksheet(worksheet: WorkSheet, options: ExcelParseOptions): any[][] {
    const range = utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const data: any[][] = [];
    
    const maxRows = Math.min(range.e.r + 1, options.maxRows || this.MAX_ROWS);
    const maxCols = Math.min(range.e.c + 1, this.MAX_COLUMNS);
    
    for (let row = 0; row < maxRows; row++) {
      const rowData: any[] = [];
      let hasData = false;
      
      for (let col = 0; col < maxCols; col++) {
        const cellAddress = utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        let cellValue = null;
        if (cell) {
          if (options.ignoreFormulas && cell.f) {
            cellValue = cell.v; // Use calculated value
          } else {
            cellValue = cell.v;
          }
          
          if (cellValue !== null && cellValue !== undefined) {
            hasData = true;
          }
        }
        
        rowData.push(cellValue);
      }
      
      if (hasData || !options.skipEmptyRows) {
        data.push(rowData);
      }
    }
    
    return data;
  }

  private static selectBestSheet(sheets: ExcelSheet[], preferredName?: string): ExcelSheet | undefined {
    if (sheets.length === 0) return undefined;
    
    // Use preferred sheet if specified and exists
    if (preferredName) {
      const preferred = sheets.find(sheet => 
        sheet.name.toLowerCase() === preferredName.toLowerCase()
      );
      if (preferred) return preferred;
    }
    
    // Find sheet with most numerical data
    return sheets.reduce((best, current) => {
      const currentScore = this.scoreSheetForNumericalData(current);
      const bestScore = this.scoreSheetForNumericalData(best);
      return currentScore > bestScore ? current : best;
    });
  }

  private static scoreSheetForNumericalData(sheet: ExcelSheet): number {
    let score = 0;
    
    sheet.data.forEach(row => {
      row.forEach(cell => {
        if (typeof cell === 'number' && !isNaN(cell)) {
          score += 2;
        } else if (typeof cell === 'string' && !isNaN(parseFloat(cell))) {
          score += 1;
        }
      });
    });
    
    return score;
  }

  private static extractNumbers(sheet: ExcelSheet | undefined, options: ExcelParseOptions): {
    numbers: number[];
    originalData: any[];
  } {
    if (!sheet) return { numbers: [], originalData: [] };
    
    const numbers: number[] = [];
    const originalData: any[] = [];
    
    const startRow = options.dataStartRow || (sheet.headers ? 1 : 0);
    
    for (let i = startRow; i < sheet.data.length; i++) {
      const row = sheet.data[i];
      if (!row) continue;
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        originalData.push(cell);
        
        const num = this.parseNumericValue(cell);
        if (!isNaN(num)) {
          numbers.push(num);
        }
      }
    }
    
    return { numbers, originalData };
  }

  private static parseNumericValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Handle percentages
      if (value.endsWith('%')) {
        return parseFloat(value.slice(0, -1));
      }
      
      // Handle currency and other formats
      const cleaned = value.replace(/[,$%\s]/g, '');
      return parseFloat(cleaned);
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    
    return NaN;
  }

  private static generateMetadata(
    workbook: WorkBook,
    sheets: ExcelSheet[],
    file: File | null,
    startTime: number
  ): ParsedExcelData['metadata'] {
    const warnings: string[] = [];
    const dataTypes: Record<string, string> = {};
    
    // Analyze data types
    sheets.forEach(sheet => {
      sheet.data.forEach(row => {
        row.forEach((cell, index) => {
          const type = typeof cell;
          const key = `col_${index}`;
          if (!dataTypes[key]) {
            dataTypes[key] = type;
          } else if (dataTypes[key] !== type && type !== 'undefined') {
            dataTypes[key] = 'mixed';
          }
        });
      });
    });
    
    // Generate warnings
    if (sheets.some(sheet => sheet.rowCount > 1000)) {
      warnings.push('Large dataset detected. Performance may be impacted.');
    }
    
    if (Object.values(dataTypes).includes('mixed')) {
      warnings.push('Mixed data types detected in some columns.');
    }
    
    return {
      fileName: file?.name,
      fileSize: file?.size,
      totalSheets: sheets.length,
      totalRows: sheets.reduce((acc, sheet) => acc + sheet.rowCount, 0),
      totalColumns: Math.max(...sheets.map(sheet => sheet.columnCount)),
      parseTime: performance.now() - startTime,
      warnings,
      dataTypes
    };
  }

  private static extractHeaders(data: any[][], headerRow: number = 0): string[] | undefined {
    if (data.length <= headerRow) return undefined;
    
    const headerRowData = data[headerRow];
    if (!headerRowData) return undefined;
    
    return headerRowData.map(cell => 
      cell ? String(cell).trim() : `Column ${headerRowData.indexOf(cell) + 1}`
    );
  }

  private static detectHeaders(firstRow: any[]): boolean {
    if (!firstRow || firstRow.length === 0) return false;
    
    // Check if first row contains mostly strings
    const stringCount = firstRow.filter(cell => 
      typeof cell === 'string' && cell.trim().length > 0
    ).length;
    
    return stringCount > firstRow.length * 0.7;
  }

  private static detectDataPattern(data: any[][]): string {
    if (data.length < 2) return 'insufficient_data';
    
    const patterns = [];
    
    // Check consistency of data types per column
    for (let col = 0; col < (data[0]?.length || 0); col++) {
      const types = new Set();
      for (let row = 0; row < Math.min(data.length, 10); row++) {
        if (data[row] && data[row][col] !== null && data[row][col] !== undefined) {
          types.add(typeof data[row][col]);
        }
      }
      patterns.push(Array.from(types).join('|'));
    }
    
    return patterns.join(',');
  }

  private static findDataColumns(data: any[][], hasHeaders: boolean): number[] {
    const startRow = hasHeaders ? 1 : 0;
    const columns: number[] = [];
    
    for (let col = 0; col < (data[0]?.length || 0); col++) {
      let numericCount = 0;
      let totalCount = 0;
      
      for (let row = startRow; row < Math.min(data.length, startRow + 10); row++) {
        if (data[row] && data[row][col] !== null && data[row][col] !== undefined) {
          totalCount++;
          if (!isNaN(this.parseNumericValue(data[row][col]))) {
            numericCount++;
          }
        }
      }
      
      if (totalCount > 0 && numericCount / totalCount > 0.7) {
        columns.push(col);
      }
    }
    
    return columns;
  }

  private static findNameColumn(sheet: { data: any[][] }): number | undefined {
    const data = sheet.data;
    if (!data || data.length === 0) return undefined;
    
    for (let col = 0; col < (data[0]?.length || 0); col++) {
      let stringCount = 0;
      let totalCount = 0;
      
      for (let row = 0; row < Math.min(data.length, 10); row++) {
        const cell = data[row]?.[col];
        if (cell !== null && cell !== undefined && cell !== '') {
          totalCount++;
          if (typeof cell === 'string' && cell.trim().length > 2) {
            stringCount++;
          }
        }
      }
      
      if (totalCount > 0 && stringCount / totalCount > 0.8) {
        return col;
      }
    }
    
    return undefined;
  }

  private static isGradesheet(data: any[][], firstRow: any[]): boolean {
    const gradeKeywords = ['grade', 'score', 'points', 'mark', 'assignment', 'quiz', 'test', 'exam'];
    const headerText = firstRow.map(cell => String(cell || '').toLowerCase()).join(' ');
    
    return gradeKeywords.some(keyword => headerText.includes(keyword));
  }

  private static isAttendanceSheet(data: any[][], firstRow: any[]): boolean {
    const attendanceKeywords = ['attendance', 'present', 'absent', 'late', 'tardy'];
    const headerText = firstRow.map(cell => String(cell || '').toLowerCase()).join(' ');
    
    return attendanceKeywords.some(keyword => headerText.includes(keyword));
  }

  private static isScoreSheet(data: any[][], firstRow: any[]): boolean {
    const scoreKeywords = ['total', 'sum', 'average', 'mean', 'final'];
    const headerText = firstRow.map(cell => String(cell || '').toLowerCase()).join(' ');
    
    return scoreKeywords.some(keyword => headerText.includes(keyword));
  }

  private static columnLetterToIndex(letter: string): number {
    let result = 0;
    for (let i = 0; i < letter.length; i++) {
      result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result - 1;
  }

  private static formatDataRange(startRow: number, endRow: number, columns: number[]): string {
    if (columns.length === 0) return 'No data columns detected';
    
    const colLetters = columns.map(col => String.fromCharCode(65 + col)).join(', ');
    return `Rows ${startRow + 1}-${endRow + 1}, Columns ${colLetters}`;
  }

  private static getExpectedFormat(type: TeacherDataFormat['type']): string {
    switch (type) {
      case 'grades':
        return 'Student names in first column, grades as numbers (0-100 or 0-points)';
      case 'attendance':
        return 'Student names in first column, attendance as Present/Absent or 1/0';
      case 'scores':
        return 'Student names in first column, scores as numbers';
      default:
        return 'Numerical data in spreadsheet format';
    }
  }
}

export default AdvancedExcelParser;