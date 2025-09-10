/**
 * Temporarily disabled Excel parser to fix SSR compatibility issues
 * The xlsx library causes "self is not defined" errors in Next.js server environment
 * TODO: Re-enable with proper dynamic imports once SSR issues are resolved
 */

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
  headers: string[];
  rowCount: number;
  columnCount: number;
  hasData: boolean;
}

export interface ParsedExcelData {
  sheets: ExcelSheet[];
  selectedSheet: ExcelSheet | null;
  numbers: number[];
  originalData: any[];
  metadata: {
    warnings: string[];
    dataQuality: number;
    parseTime: number;
    cleanupApplied: boolean;
  };
}

export interface TeacherDataFormat {
  type: 'gradebook' | 'attendance' | 'scores' | 'generic';
  confidence: number;
  structure: {
    hasHeaders: boolean;
    headerRow: number;
    dataStartRow: number;
    studentNameColumn: number | null;
    dataColumns: number[];
    gradeColumns: number[];
  };
  metadata: {
    totalStudents: number;
    totalAssignments: number;
    dataType: 'percentage' | 'points' | 'letter' | 'mixed';
    dateRange?: { start: Date; end: Date };
  };
}

/**
 * Disabled Excel parser class
 * All methods throw informative errors about the temporary disable
 */
class AdvancedExcelParser {
  private static readonly DISABLED_MESSAGE = 
    'Excel parsing is temporarily disabled due to SSR compatibility issues. ' +
    'Please use manual data input or wait for the feature to be re-enabled.';

  static async parseFile(file: File, options: ExcelParseOptions = {}): Promise<ParsedExcelData> {
    throw new Error(this.DISABLED_MESSAGE);
  }

  static async parseBuffer(
    buffer: ArrayBuffer | string,
    options: ExcelParseOptions = {}
  ): Promise<ParsedExcelData> {
    throw new Error(this.DISABLED_MESSAGE);
  }

  static analyzeTeacherData(sheet: ExcelSheet): TeacherDataFormat {
    throw new Error(this.DISABLED_MESSAGE);
  }

  static extractGrades(
    sheet: ExcelSheet,
    columnIndex: number,
    options: { skipStudentNames?: boolean; convertToPercentage?: boolean } = {}
  ): {
    grades: number[];
    studentNames: string[];
    statistics: any;
  } {
    throw new Error(this.DISABLED_MESSAGE);
  }

  static batchProcessGradebook(
    sheet: ExcelSheet,
    columnIndices: number[],
    options: { assignmentNames?: string[] } = {}
  ): {
    assignments: Array<{
      name: string;
      grades: number[];
      statistics: any;
    }>;
  } {
    throw new Error(this.DISABLED_MESSAGE);
  }
}

export default AdvancedExcelParser;