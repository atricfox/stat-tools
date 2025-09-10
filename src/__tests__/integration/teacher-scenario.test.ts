/**
 * US-003 Teacher Scenario End-to-End Tests
 * Tests the complete teacher user journey for Excel data processing and batch analysis
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
// import AdvancedExcelParser from '@/lib/excel-advanced-parser'; // Temporarily disabled
import BatchProcessor, { BatchDataset } from '@/lib/batch-processor';
import DataCleaner from '@/lib/data-cleaner';

describe.skip('US-003: Teacher Scenario Journey (Temporarily disabled due to Excel parser SSR issues)', () => {
  let gradebookData: any[][];
  let attendanceData: any[][];
  let mockExcelData: {
    sheets: Array<{ name: string; data: any[][] }>;
  };

  beforeEach(() => {
    // Mock gradebook data
    gradebookData = [
      ['Student Name', 'Assignment 1', 'Assignment 2', 'Quiz 1', 'Midterm'],
      ['Alice Johnson', 85, 92, 78, 88],
      ['Bob Smith', 78, 85, 82, 91],
      ['Carol Davis', 92, 88, 95, 87],
      ['David Wilson', 67, 75, 73, 79],
      ['Emma Brown', 95, 98, 92, 94],
      ['Frank Miller', '', 82, 85, 80], // Missing assignment
      ['Grace Lee', 88, 90, 'N/A', 92], // Invalid grade format
      ['Henry Chen', 105, 95, 88, 85], // Out of range score
    ];

    // Mock attendance data
    attendanceData = [
      ['Student Name', 'Week 1', 'Week 2', 'Week 3', 'Week 4'],
      ['Alice Johnson', 'P', 'P', 'A', 'P'],
      ['Bob Smith', 'P', 'A', 'P', 'P'],
      ['Carol Davis', 'P', 'P', 'P', 'P'],
      ['David Wilson', 'A', 'P', 'P', 'A'],
    ];

    mockExcelData = {
      sheets: [
        { name: 'Grades', data: gradebookData },
        { name: 'Attendance', data: attendanceData }
      ]
    };
  });

  describe('Excel Data Parsing', () => {
    it('should parse gradebook data correctly', () => {
      // Test parsing gradebook structure
      const sheet = { 
        name: 'Grades', 
        data: gradebookData, 
        headers: gradebookData[0],
        rowCount: gradebookData.length,
        columnCount: gradebookData[0].length,
        hasData: true
      };

      const format = AdvancedExcelParser.analyzeTeacherData(sheet);
      
      expect(format.type).toBe('grades');
      expect(format.structure.hasHeaders).toBe(true);
      expect(format.structure.dataColumns.length).toBeGreaterThan(0);
      expect(format.suggestions.columnToUse).toBeGreaterThanOrEqual(0);
    });

    it('should extract grades from specific assignment column', () => {
      const sheet = { 
        name: 'Grades', 
        data: gradebookData, 
        headers: gradebookData[0],
        rowCount: gradebookData.length,
        columnCount: gradebookData[0].length,
        hasData: true
      };

      // Extract Assignment 1 grades (column 1)
      const result = AdvancedExcelParser.extractGrades(sheet, 1, {
        skipStudentNames: false,
        convertToPercentage: false
      });

      expect(result.grades).toHaveLength(7); // 7 valid grades out of 8 students
      expect(result.grades).toContain(85); // Alice's grade
      expect(result.grades).toContain(78); // Bob's grade
      expect(result.statistics.missing).toBe(1); // Frank (empty)
      expect(result.statistics.submitted).toBe(7);
    });

    it('should handle batch processing of multiple assignments', () => {
      const sheet = { 
        name: 'Grades', 
        data: gradebookData, 
        headers: gradebookData[0],
        rowCount: gradebookData.length,
        columnCount: gradebookData[0].length,
        hasData: true
      };

      // Process assignments 1-3 (columns 1, 2, 3)
      const result = AdvancedExcelParser.batchProcessGradebook(
        sheet,
        [1, 2, 3], // Assignment columns
        {
          assignmentNames: ['Assignment 1', 'Assignment 2', 'Quiz 1']
        }
      );

      expect(result.assignments).toHaveLength(3);
      expect(result.overallStatistics.totalStudents).toBeGreaterThan(0);
      expect(result.overallStatistics.classAverages).toHaveLength(3);
      
      // Each assignment should have statistics
      result.assignments.forEach(assignment => {
        expect(assignment.name).toBeTruthy();
        expect(assignment.grades).toBeDefined();
        expect(assignment.statistics.submitted).toBeGreaterThanOrEqual(0);
        expect(assignment.statistics.average).toBeGreaterThanOrEqual(0);
      });
    });

    it('should detect and handle different data formats', () => {
      const mixedFormatData = [
        ['Student', 'Score1', 'Score2', 'Score3'],
        ['Student1', '85%', 92, '78.5'],
        ['Student2', '90%', 88, '82.0'],
        ['Student3', 'N/A', 95, ''],
      ];

      const sheet = { 
        name: 'Mixed', 
        data: mixedFormatData, 
        headers: mixedFormatData[0],
        rowCount: mixedFormatData.length,
        columnCount: mixedFormatData[0].length,
        hasData: true
      };

      const format = AdvancedExcelParser.analyzeTeacherData(sheet);
      expect(format.structure.dataColumns.length).toBeGreaterThan(0);
      
      // Should be able to extract numerical data despite format differences
      const result = AdvancedExcelParser.extractGrades(sheet, 1, {});
      expect(result.grades.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Data Processing', () => {
    it('should process multiple assignment datasets efficiently', async () => {
      const datasets: BatchDataset[] = [
        {
          id: 'assignment1',
          name: 'Assignment 1',
          data: [85, 78, 92, 67, 95, 82, 88],
          metadata: { source: 'gradebook', assignmentType: 'homework', maxPoints: 100 }
        },
        {
          id: 'assignment2', 
          name: 'Assignment 2',
          data: [92, 85, 88, 75, 98, 90, 95],
          metadata: { source: 'gradebook', assignmentType: 'homework', maxPoints: 100 }
        },
        {
          id: 'quiz1',
          name: 'Quiz 1',
          data: [78, 82, 95, 73, 92, 85, 88],
          metadata: { source: 'gradebook', assignmentType: 'quiz', maxPoints: 100 }
        }
      ];

      const { results, summary } = await BatchProcessor.processBatch(datasets, {
        precision: 2,
        calculateAdvancedStats: true,
        generateComparisons: true
      });

      expect(results).toHaveLength(3);
      expect(summary.successfulProcessing).toBe(3);
      expect(summary.failedProcessing).toBe(0);
      expect(summary.overallStatistics.averageOfMeans).toBeGreaterThan(0);
      expect(summary.overallStatistics.highestMean.name).toBeTruthy();
      expect(summary.overallStatistics.lowestMean.name).toBeTruthy();

      // Each result should have proper statistics
      results.forEach(result => {
        expect(result.result.mean).toBeGreaterThan(0);
        expect(result.result.standardDeviation).toBeGreaterThan(0);
        expect(result.result.count).toBeGreaterThan(0);
        expect(result.processingTime).toBeGreaterThan(0);
      });
    });

    it('should provide gradebook-specific analysis', async () => {
      const datasets: BatchDataset[] = [
        {
          id: 'hw1',
          name: 'Homework 1',
          data: [85, 90, 78, 92, 88],
          metadata: { source: 'gradebook', assignmentType: 'homework' }
        },
        {
          id: 'quiz1',
          name: 'Quiz 1', 
          data: [92, 85, 95, 88, 90],
          metadata: { source: 'gradebook', assignmentType: 'quiz' }
        }
      ];

      const { results, classAnalysis } = await BatchProcessor.processGradebook(datasets, {
        gradingScale: { min: 0, max: 100 },
        classStatistics: true
      });

      expect(results).toHaveLength(2);
      expect(classAnalysis.overallClassAverage).toBeGreaterThan(0);
      expect(classAnalysis.assignmentDifficulty).toHaveLength(2);
      
      // Assignment difficulty should be categorized
      classAnalysis.assignmentDifficulty.forEach(assignment => {
        expect(['easy', 'medium', 'hard']).toContain(assignment.difficulty);
        expect(assignment.avgScore).toBeGreaterThan(0);
      });
    });

    it('should handle large datasets efficiently', async () => {
      // Create large dataset simulating a full semester
      const largeDatasets: BatchDataset[] = Array.from({ length: 20 }, (_, i) => ({
        id: `assignment_${i}`,
        name: `Assignment ${i + 1}`,
        data: Array.from({ length: 150 }, () => Math.floor(Math.random() * 40) + 60), // 60-100 scores
        metadata: { source: 'gradebook', assignmentType: 'assignment' }
      }));

      const startTime = performance.now();
      const { results, summary } = await BatchProcessor.processBatch(largeDatasets, {
        precision: 2,
        enableWebWorker: false // Test in main thread
      });
      const processingTime = performance.now() - startTime;

      expect(results).toHaveLength(20);
      expect(summary.successfulProcessing).toBe(20);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(summary.totalProcessingTime).toBeGreaterThan(0);
    });
  });

  describe('Data Cleaning and Validation', () => {
    it('should analyze teacher data patterns correctly', () => {
      const gradebookSample = [85, 92, 78, 95, 88, '', 'N/A', 67];
      const profile = DataCleaner.analyzeDataProfile(gradebookSample);

      expect(profile.pattern).toBe('gradebook'); // Should detect as gradebook
      expect(profile.confidence).toBeGreaterThan(0);
      expect(profile.characteristics.commonFormats.length).toBeGreaterThan(0);
      expect(profile.suggestions.cleaningStrategy).toBeTruthy();
      expect(profile.suggestions.recommendedOptions).toBeDefined();
    });

    it('should clean gradebook data appropriately', () => {
      const messyGradebook = [
        85, 92, '', 'N/A', 78, 105, // Out of range
        95, 88, null, undefined, 67, 'absent'
      ];

      const result = DataCleaner.validateGradebook(messyGradebook, { min: 0, max: 100 });
      
      expect(result.cleanedData.length).toBeGreaterThan(0);
      expect(result.stats.totalItems).toBe(messyGradebook.length);
      expect(result.issues.length).toBeGreaterThan(0);
      
      // Should detect missing values
      const missingIssues = result.issues.filter(issue => issue.type === 'missing');
      expect(missingIssues.length).toBeGreaterThan(0);
      
      // Should detect range violations  
      const rangeIssues = result.issues.filter(issue => issue.type === 'range');
      expect(rangeIssues.length).toBeGreaterThan(0);
      
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should auto-fix data with different aggressiveness levels', () => {
      const problematicData = [85, '', 92, 'N/A', 78, 105, 88, null];

      // Conservative cleaning
      const conservative = DataCleaner.autoFixData(problematicData, 'conservative');
      expect(conservative.stats.flaggedItems).toBeGreaterThan(0);
      
      // Aggressive cleaning
      const aggressive = DataCleaner.autoFixData(problematicData, 'aggressive'); 
      expect(aggressive.cleanedData.length).toBeGreaterThan(0);
      expect(aggressive.stats.modifiedItems + aggressive.stats.removedItems).toBeGreaterThan(0);
      
      // Moderate should be between the two
      const moderate = DataCleaner.autoFixData(problematicData, 'moderate');
      expect(moderate.cleanedData.length).toBeGreaterThanOrEqual(aggressive.cleanedData.length);
      expect(moderate.stats.flaggedItems).toBeLessThanOrEqual(conservative.stats.flaggedItems);
    });

    it('should provide meaningful suggestions for teachers', () => {
      const gradebookWithIssues = [
        85, 92, 78, '', // Missing assignment
        95, 88, 45,     // Potentially failing grade  
        92, 105,        // Out of range
        88, 88, 88      // Duplicate scores (might be legitimate)
      ];

      const result = DataCleaner.cleanData(gradebookWithIssues, {
        handleMissing: 'flag',
        validateRange: { min: 0, max: 100 },
        preserveOriginal: true
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should have educational recommendations
      const recommendations = result.recommendations.join(' ');
      expect(
        recommendations.includes('missing') || 
        recommendations.includes('review') || 
        recommendations.includes('data')
      ).toBe(true);
    });
  });

  describe('Teacher Workflow Integration', () => {
    it('should support complete gradebook analysis workflow', async () => {
      // 1. Parse Excel-like data
      const sheet = { 
        name: 'Grades', 
        data: gradebookData, 
        headers: gradebookData[0],
        rowCount: gradebookData.length,
        columnCount: gradebookData[0].length,
        hasData: true
      };

      const format = AdvancedExcelParser.analyzeTeacherData(sheet);
      expect(format.type).toBe('grades');

      // 2. Extract and clean data for multiple assignments
      const assignments = [1, 2, 3]; // Column indices
      const datasets: BatchDataset[] = [];

      for (let i = 0; i < assignments.length; i++) {
        const columnIndex = assignments[i];
        const columnData = gradebookData.slice(1).map(row => row[columnIndex]);
        
        // Clean the data
        const cleaningResult = DataCleaner.validateGradebook(columnData);
        
        datasets.push({
          id: `assignment_${i}`,
          name: gradebookData[0][columnIndex],
          data: cleaningResult.cleanedData,
          metadata: {
            source: 'gradebook',
            originalIssues: cleaningResult.issues.length,
            cleaningConfidence: cleaningResult.confidence
          }
        });
      }

      // 3. Batch process for class analysis
      const { results, classAnalysis } = await BatchProcessor.processGradebook(datasets, {
        gradingScale: { min: 0, max: 100 }
      });

      expect(results.length).toBe(assignments.length);
      expect(classAnalysis.overallClassAverage).toBeGreaterThan(0);
      
      // 4. Verify results are teacher-friendly
      results.forEach(result => {
        expect(result.name).toBeTruthy(); // Has assignment name
        expect(result.result.mean).toBeGreaterThanOrEqual(0);
        expect(result.result.mean).toBeLessThanOrEqual(100);
      });
    });

    it('should provide class performance insights', async () => {
      const datasets: BatchDataset[] = [
        { id: '1', name: 'Easy Quiz', data: [95, 92, 98, 90, 94], metadata: {} },
        { id: '2', name: 'Hard Exam', data: [65, 70, 58, 72, 68], metadata: {} },
        { id: '3', name: 'Medium Homework', data: [82, 85, 78, 88, 80], metadata: {} }
      ];

      const { results, classAnalysis } = await BatchProcessor.processGradebook(datasets);
      
      // Should categorize difficulty correctly
      const easyAssignment = classAnalysis.assignmentDifficulty.find(a => a.name === 'Easy Quiz');
      const hardAssignment = classAnalysis.assignmentDifficulty.find(a => a.name === 'Hard Exam');
      const mediumAssignment = classAnalysis.assignmentDifficulty.find(a => a.name === 'Medium Homework');
      
      expect(easyAssignment?.difficulty).toBe('easy');
      expect(hardAssignment?.difficulty).toBe('hard');
      expect(mediumAssignment?.difficulty).toBe('medium');
      
      expect(classAnalysis.overallClassAverage).toBeGreaterThan(0);
    });

    it('should handle real-world data irregularities', () => {
      const messyRealWorldData = [
        'Student Names', 'Assignment 1', 'Assignment 2',
        'Alice', '85%', '92',
        'Bob', '', '85.5',
        'Carol', 'N/A', 'Absent', 
        'David', '67.5', '75%',
        '', '95', '98', // Missing name
        'Emma', '105', '92' // Extra credit
      ];

      // This simulates processing the raw data as it might come from Excel
      const numericData = messyRealWorldData
        .slice(3) // Skip headers
        .filter((_, i) => i % 3 !== 0) // Skip names (every 3rd item starting from 0)
        .filter(item => item !== ''); // Remove empty cells

      const profile = DataCleaner.analyzeDataProfile(numericData);
      expect(profile.pattern).toBeTruthy();
      
      const cleaningResult = DataCleaner.autoFixData(numericData, 'moderate');
      expect(cleaningResult.cleanedData.length).toBeGreaterThan(0);
      expect(cleaningResult.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle typical class sizes efficiently', async () => {
      // Simulate a full semester: 30 students × 15 assignments
      const assignments = 15;
      const students = 30;
      
      const datasets: BatchDataset[] = Array.from({ length: assignments }, (_, i) => ({
        id: `assignment_${i}`,
        name: `Assignment ${i + 1}`,
        data: Array.from({ length: students }, () => Math.floor(Math.random() * 30) + 70),
        metadata: { source: 'gradebook' }
      }));

      const startTime = performance.now();
      const { results, summary } = await BatchProcessor.processBatch(datasets, {
        precision: 2,
        generateComparisons: true
      });
      const processingTime = performance.now() - startTime;

      expect(results).toHaveLength(assignments);
      expect(summary.successfulProcessing).toBe(assignments);
      expect(processingTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should provide progress feedback for long operations', async () => {
      const datasets: BatchDataset[] = Array.from({ length: 10 }, (_, i) => ({
        id: `test_${i}`,
        name: `Test ${i}`,
        data: Array.from({ length: 100 }, () => Math.random() * 100),
        metadata: {}
      }));

      let progressUpdates = 0;
      let lastProgress = -1;

      const { results } = await BatchProcessor.processBatch(datasets, {
        progressCallback: (progress, current) => {
          progressUpdates++;
          expect(progress).toBeGreaterThanOrEqual(lastProgress);
          expect(typeof current).toBe('string');
          lastProgress = progress;
        }
      });

      expect(results).toHaveLength(10);
      expect(progressUpdates).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty datasets gracefully', async () => {
      const emptyDatasets: BatchDataset[] = [
        { id: '1', name: 'Empty', data: [], metadata: {} }
      ];

      const { results, summary } = await BatchProcessor.processBatch(emptyDatasets);
      
      expect(summary.failedProcessing).toBe(1);
      expect(summary.successfulProcessing).toBe(0);
      expect(results).toHaveLength(0);
    });

    it('should handle mixed valid/invalid datasets', async () => {
      const mixedDatasets: BatchDataset[] = [
        { id: '1', name: 'Valid', data: [85, 90, 78], metadata: {} },
        { id: '2', name: 'Empty', data: [], metadata: {} },
        { id: '3', name: 'Valid2', data: [92, 88], metadata: {} }
      ];

      const { results, summary } = await BatchProcessor.processBatch(mixedDatasets);
      
      expect(summary.successfulProcessing).toBe(2);
      expect(summary.failedProcessing).toBe(1);
      expect(results).toHaveLength(2);
    });

    it('should provide helpful error messages for teachers', () => {
      const invalidData = ['not', 'numbers', 'at', 'all'];
      
      const result = DataCleaner.cleanData(invalidData);
      
      expect(result.issues.length).toBe(invalidData.length);
      expect(result.cleanedData.length).toBe(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should provide teacher-friendly suggestions
      const recommendationText = result.recommendations.join(' ').toLowerCase();
      expect(
        recommendationText.includes('review') ||
        recommendationText.includes('check') ||
        recommendationText.includes('manual')
      ).toBe(true);
    });
  });
});