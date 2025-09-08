/**
 * Unit tests for Excel and spreadsheet data parsing
 * Tests boundary conditions, edge cases, and real-world scenarios
 */

import {
  parseExcelData,
  parseGradeSheet,
  parseResearchData,
  extractColumn,
  extractRow,
  formatExcelData,
  cleanExcelData,
  excelUtils
} from '../excel-parser';

describe('parseExcelData', () => {
  it('should parse tab-separated data (Excel format)', () => {
    const input = 'Name\tScore\tGrade\nJohn\t85\tB\nJane\t92\tA\nBob\t78\tC';
    const result = parseExcelData(input);
    
    expect(result.headers).toEqual(['Name', 'Score', 'Grade']);
    expect(result.validNumbers).toEqual([85, 92, 78]);
    expect(result.metadata.format).toBe('table');
    expect(result.metadata.hasHeaders).toBe(true);
  });

  it('should parse comma-separated data', () => {
    const input = '85,92,78,96,88';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([85, 92, 78, 96, 88]);
    expect(result.metadata.format).toBe('multi-column');
    expect(result.metadata.hasHeaders).toBe(false);
  });

  it('should handle single column data', () => {
    const input = '85\n92\n78\n96\n88';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([85, 92, 78, 96, 88]);
    expect(result.metadata.format).toBe('single-column');
    expect(result.metadata.columns).toBe(1);
  });

  it('should detect headers correctly', () => {
    const input = 'Student ID\tMidterm\tFinal\n12345\t85\t90\n12346\t78\t82';
    const result = parseExcelData(input);
    
    expect(result.headers).toEqual(['Student ID', 'Midterm', 'Final']);
    expect(result.metadata.hasHeaders).toBe(true);
    expect(result.validNumbers).toEqual([12345, 85, 90, 12346, 78, 82]);
  });

  it('should handle mixed data types', () => {
    const input = 'Name\tScore\nJohn\t85\nJane\tabc\nBob\t78';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([85, 78]);
    expect(result.invalidEntries).toContain('abc');
  });

  it('should handle empty cells', () => {
    const input = '85\t\t92\n78\t88\t\n\t90\t95';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([85, 92, 78, 88, 90, 95]);
  });

  it('should handle empty input', () => {
    const result = parseExcelData('');
    
    expect(result.data).toEqual([]);
    expect(result.validNumbers).toEqual([]);
    expect(result.metadata.rows).toBe(0);
  });
});

describe('extractColumn', () => {
  it('should extract specific column', () => {
    const excelResult = parseExcelData('1\t2\t3\n4\t5\t6\n7\t8\t9');
    
    expect(extractColumn(excelResult, 0)).toEqual([1, 4, 7]);
    expect(extractColumn(excelResult, 1)).toEqual([2, 5, 8]);
    expect(extractColumn(excelResult, 2)).toEqual([3, 6, 9]);
  });

  it('should handle out of bounds column', () => {
    const excelResult = parseExcelData('1\t2\n3\t4');
    
    expect(extractColumn(excelResult, 5)).toEqual([]);
    expect(extractColumn(excelResult, -1)).toEqual([]);
  });

  it('should handle ragged data', () => {
    const excelResult = parseExcelData('1\t2\t3\n4\t5\n6');
    
    expect(extractColumn(excelResult, 0)).toEqual([1, 4, 6]);
    expect(extractColumn(excelResult, 1)).toEqual([2, 5]);
    expect(extractColumn(excelResult, 2)).toEqual([3]);
  });
});

describe('extractRow', () => {
  it('should extract specific row', () => {
    const excelResult = parseExcelData('1\t2\t3\n4\t5\t6\n7\t8\t9');
    
    expect(extractRow(excelResult, 0)).toEqual([1, 2, 3]);
    expect(extractRow(excelResult, 1)).toEqual([4, 5, 6]);
    expect(extractRow(excelResult, 2)).toEqual([7, 8, 9]);
  });

  it('should handle out of bounds row', () => {
    const excelResult = parseExcelData('1\t2\n3\t4');
    
    expect(extractRow(excelResult, 5)).toEqual([]);
    expect(extractRow(excelResult, -1)).toEqual([]);
  });
});

describe('parseGradeSheet', () => {
  it('should identify grade columns', () => {
    const input = 'Name\tMidterm\tFinal\tExtra\nJohn\t85\t90\t150\nJane\t78\t82\t200';
    const result = parseGradeSheet(input);
    
    expect(result.gradeInfo.possibleGradeColumns).toEqual([1, 2]); // Midterm and Final
    expect(result.gradeInfo.studentCount).toBe(2);
    expect(result.gradeInfo.gradeStats).toHaveLength(2);
  });

  it('should calculate grade statistics', () => {
    const input = 'Student\tScore\nA\t85\nB\t95\nC\t75';
    const result = parseGradeSheet(input);
    
    const gradeStats = result.gradeInfo.gradeStats![0];
    expect(gradeStats.column).toBe(1);
    expect(gradeStats.average).toBeCloseTo(85, 0);
    expect(gradeStats.min).toBe(75);
    expect(gradeStats.max).toBe(95);
  });

  it('should handle 4.0 scale grades', () => {
    const input = 'Course\tGPA\nMath\t3.8\nEnglish\t3.2\nScience\t3.9';
    const result = parseGradeSheet(input);
    
    expect(result.gradeInfo.possibleGradeColumns).toEqual([1]);
  });

  it('should ignore non-grade columns', () => {
    const input = 'ID\tName\tAge\tScore\n1\tJohn\t20\t85\n2\tJane\t21\t92';
    const result = parseGradeSheet(input);
    
    expect(result.gradeInfo.possibleGradeColumns).toEqual([0, 3]); // ID and Score
  });
});

describe('parseResearchData', () => {
  it('should detect scientific notation', () => {
    const input = '1.23e-4\t5.67e+2\t890.12';
    const result = parseResearchData(input);
    
    expect(result.researchInfo.hasScientificNotation).toBe(true);
  });

  it('should analyze precision levels', () => {
    const input = '1.23\t45.6789\t890.12345';
    const result = parseResearchData(input);
    
    expect(result.researchInfo.precisionLevels).toEqual([2, 4, 5]);
  });

  it('should detect outlier candidates', () => {
    const input = '1\t2\t3\t4\t100'; // 100 is an outlier
    const result = parseResearchData(input);
    
    expect(result.researchInfo.outlierCandidates).toContain(100);
  });

  it('should suggest significant figures', () => {
    const input = '1.234\t5.678\t9.012';
    const result = parseResearchData(input);
    
    expect(result.researchInfo.suggestedSignificantFigures).toBe(5); // precision 3 + 2
  });

  it('should handle high precision data', () => {
    const input = '3.14159265359\t2.71828182846';
    const result = parseResearchData(input);
    
    expect(result.researchInfo.precisionIssues).toHaveLength(2);
  });
});

describe('cleanExcelData', () => {
  it('should remove Excel quotes', () => {
    expect(cleanExcelData('"Hello World","123"')).toBe('Hello World,123');
  });

  it('should handle thousands separators', () => {
    expect(cleanExcelData('1,234,567')).toBe('1234567');
    expect(cleanExcelData('1,234')).toBe('1234');
  });

  it('should handle currency symbols', () => {
    expect(cleanExcelData('$123.45')).toBe('123.45');
    expect(cleanExcelData('$1,234.56')).toBe('1234.56');
  });

  it('should handle percentages', () => {
    expect(cleanExcelData('50%')).toBe('0.5');
    expect(cleanExcelData('100%')).toBe('1');
    expect(cleanExcelData('25.5%')).toBe('0.255');
  });

  it('should handle mixed formatting', () => {
    expect(cleanExcelData('"$1,234.56",75%,"Normal"')).toBe('1234.56,0.75,Normal');
  });
});

describe('formatExcelData', () => {
  it('should format data with tabs', () => {
    const data = [[1, 2, 3], [4, 5, 6]];
    expect(formatExcelData(data, '\t')).toBe('1\t2\t3\n4\t5\t6');
  });

  it('should format data with commas', () => {
    const data = [[1, 2, 3], [4, 5, 6]];
    expect(formatExcelData(data, ',')).toBe('1,2,3\n4,5,6');
  });
});

describe('Edge cases and boundary conditions', () => {
  it('should handle very large spreadsheet', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => 
      Array.from({ length: 10 }, (_, j) => i * 10 + j).join('\t')
    );
    const input = rows.join('\n');
    
    const result = parseExcelData(input);
    expect(result.validNumbers).toHaveLength(10000);
    expect(result.metadata.rows).toBe(1000);
  });

  it('should handle single cell', () => {
    const result = parseExcelData('42');
    expect(result.validNumbers).toEqual([42]);
    expect(result.metadata.format).toBe('single-column');
  });

  it('should handle inconsistent row lengths', () => {
    const input = '1\t2\t3\n4\t5\n6\t7\t8\t9';
    const result = parseExcelData(input);
    
    expect(result.data).toEqual([[1, 2, 3], [4, 5], [6, 7, 8, 9]]);
    expect(result.metadata.columns).toBe(4); // Max columns
  });

  it('should handle all-text data', () => {
    const input = 'Name\tCity\nJohn\tNYC\nJane\tLA';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([]);
    expect(result.invalidEntries).toEqual(['Name', 'City', 'John', 'NYC', 'Jane', 'LA']);
  });

  it('should handle mixed separators in input', () => {
    const input = '1,2\t3\n4;5\t6'; // Mixed commas, tabs, semicolons
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toContain(1);
    expect(result.validNumbers).toContain(6);
  });

  it('should handle Unicode characters', () => {
    const input = 'Naïve\t42\nCafé\t24';
    const result = parseExcelData(input);
    
    expect(result.validNumbers).toEqual([42, 24]);
    expect(result.invalidEntries).toEqual(['Naïve', 'Café']);
  });

  it('should handle Windows line endings', () => {
    const input = '1\t2\r\n3\t4\r\n';
    const result = parseExcelData(input);
    
    expect(result.data).toEqual([[1, 2], [3, 4]]);
  });

  it('should handle empty rows', () => {
    const input = '1\t2\n\n3\t4\n\n';
    const result = parseExcelData(input);
    
    expect(result.data).toEqual([[1, 2], [3, 4]]);
  });
});

describe('Performance tests', () => {
  it('should handle large datasets efficiently', () => {
    const start = performance.now();
    
    // Create large dataset
    const rows = Array.from({ length: 1000 }, (_, i) => 
      Array.from({ length: 50 }, (_, j) => Math.random()).join('\t')
    );
    const input = rows.join('\n');
    
    const result = parseExcelData(input);
    const end = performance.now();
    
    expect(result.validNumbers).toHaveLength(50000);
    expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle grade analysis efficiently', () => {
    const start = performance.now();
    
    // Create large grade dataset
    const header = 'ID\tName\tMidterm\tFinal\tHomework';
    const rows = Array.from({ length: 10000 }, (_, i) => 
      `${i}\tStudent${i}\t${Math.floor(Math.random() * 100)}\t${Math.floor(Math.random() * 100)}\t${Math.floor(Math.random() * 100)}`
    );
    const input = [header, ...rows].join('\n');
    
    const result = parseGradeSheet(input);
    const end = performance.now();
    
    expect(result.gradeInfo.studentCount).toBe(10000);
    expect(end - start).toBeLessThan(10000); // Should complete within 10 seconds
  });
});

describe('Real-world scenarios', () => {
  it('should handle typical Excel grade export', () => {
    const input = `Student Name\tStudent ID\tMidterm Exam\tFinal Exam\tTotal Points
John Smith\t12345\t85\t90\t175
Jane Doe\t12346\t92\t88\t180
Bob Johnson\t12347\t78\t82\t160`;
    
    const result = parseGradeSheet(input);
    expect(result.gradeInfo.possibleGradeColumns).toEqual([2, 3, 4]); // Exams and total
    expect(result.headers).toEqual(['Student Name', 'Student ID', 'Midterm Exam', 'Final Exam', 'Total Points']);
  });

  it('should handle Google Sheets export format', () => {
    const input = `"Student Name","Midterm","Final","Average"
"John Smith",85.5,90.2,87.85
"Jane Doe",92.0,88.7,90.35`;
    
    const result = parseExcelData(input);
    expect(result.validNumbers).toEqual([85.5, 90.2, 87.85, 92.0, 88.7, 90.35]);
    expect(result.metadata.hasHeaders).toBe(true);
  });

  it('should handle scientific research data', () => {
    const input = `Sample\tConcentration (M)\tAbsorbance\tTemperature (K)
1\t1.23e-4\t0.456\t298.15
2\t2.45e-4\t0.891\t298.15
3\t3.67e-4\t1.234\t298.15`;
    
    const result = parseResearchData(input);
    expect(result.researchInfo.hasScientificNotation).toBe(true);
    expect(result.researchInfo.suggestedSignificantFigures).toBeGreaterThan(3);
  });
});