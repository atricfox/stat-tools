import { calculateCumulativeGPA } from '@/lib/gradeCalculations';
import { Course } from '@/types/education';

describe('Cumulative GPA Calculation Steps', () => {
  const sampleCourses: Course[] = [
    {
      id: 'course-1',
      name: 'Calculus I',
      grade: 'A',
      credits: 4,
      semester: 'Fall 2023',
      isIncluded: true
    },
    {
      id: 'course-2', 
      name: 'Physics I',
      grade: 'B+',
      credits: 3,
      semester: 'Fall 2023',
      isIncluded: true
    },
    {
      id: 'course-3',
      name: 'Chemistry I',
      grade: 'A-',
      credits: 4,
      semester: 'Spring 2024',
      isIncluded: true
    },
    {
      id: 'course-4',
      name: 'English Composition',
      grade: 'B',
      credits: 3,
      semester: 'Spring 2024',
      isIncluded: true
    }
  ];

  test('should generate complete calculation steps', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    expect(result.calculationSteps).toBeDefined();
    expect(result.calculationSteps).toHaveLength(5);
    
    // Check step structure
    result.calculationSteps.forEach((step, index) => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('formula');
      expect(step).toHaveProperty('calculation');
      expect(step).toHaveProperty('result');
      expect(step).toHaveProperty('explanation');
      expect(step).toHaveProperty('difficulty');
      expect(step.id).toBe(`step-${index + 1}`);
    });
  });

  test('should have correct step titles', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    const expectedTitles = [
      'Grade System Conversion',
      'Calculate Quality Points by Semester',
      'Sum Total Credits Across All Semesters',
      'Calculate Cumulative GPA',
      'Competitive Analysis'
    ];
    
    result.calculationSteps.forEach((step, index) => {
      expect(step.title).toBe(expectedTitles[index]);
    });
  });

  test('should show conversion when grading systems differ', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.3', '4.0');
    
    const conversionStep = result.calculationSteps[0];
    expect(conversionStep.description).toContain('Convert all grades from 4.3 to 4.0 system');
    expect(conversionStep.formula).toContain('4.3 → 4.0');
  });

  test('should show no conversion when grading systems are same', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    const conversionStep = result.calculationSteps[0];
    expect(conversionStep.description).toContain('All grades are already in 4.0 system');
    expect(conversionStep.formula).toBe('No conversion needed');
  });

  test('should group courses by semester in quality points step', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    const qualityPointsStep = result.calculationSteps[1];
    expect(qualityPointsStep.calculation).toContain('Fall 2023');
    expect(qualityPointsStep.calculation).toContain('Spring 2024');
  });

  test('should show correct GPA calculation', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    const gpaStep = result.calculationSteps[3];
    expect(gpaStep.formula).toBe('Cumulative GPA = Total Quality Points ÷ Total Credits');
    expect(gpaStep.result).toContain(`Cumulative GPA: ${result.cumulativeGPA.toFixed(2)}`);
  });

  test('should provide competitive analysis', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    const competitiveStep = result.calculationSteps[4];
    expect(competitiveStep.title).toBe('Competitive Analysis');
    expect(competitiveStep.calculation).toContain('percentile');
    expect(competitiveStep.explanation).toContain('graduate programs');
  });

  test('should handle single semester courses', () => {
    const singleSemesterCourses: Course[] = [
      {
        id: 'course-1',
        name: 'Math 101',
        grade: 'A',
        credits: 3,
        semester: 'Fall 2023',
        isIncluded: true
      }
    ];
    
    const result = calculateCumulativeGPA(singleSemesterCourses, '4.0', '4.0');
    
    expect(result.calculationSteps).toHaveLength(5);
    expect(result.calculationSteps[2].result).toContain('1 semesters');
  });

  test('should handle courses without semester assignment', () => {
    const coursesNoSemester: Course[] = [
      {
        id: 'course-1',
        name: 'Independent Study',
        grade: 'A',
        credits: 3,
        isIncluded: true
      }
    ];
    
    const result = calculateCumulativeGPA(coursesNoSemester, '4.0', '4.0');
    
    const qualityPointsStep = result.calculationSteps[1];
    expect(qualityPointsStep.calculation).toContain('Unassigned');
  });

  test('should show appropriate difficulty levels', () => {
    const result = calculateCumulativeGPA(sampleCourses, '4.0', '4.0');
    
    expect(result.calculationSteps[0].difficulty).toBe('basic');      // Conversion
    expect(result.calculationSteps[1].difficulty).toBe('intermediate'); // Quality points
    expect(result.calculationSteps[2].difficulty).toBe('basic');      // Total credits
    expect(result.calculationSteps[3].difficulty).toBe('basic');      // GPA calculation
    expect(result.calculationSteps[4].difficulty).toBe('advanced');   // Competitive analysis
  });
});
