/**
 * Test suite for FinalGradeCalculator component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import FinalGradeCalculator from '../FinalGradeCalculator';

// Mock the hook to avoid complex integration testing
jest.mock('@/hooks/useFinalGradeCalculation', () => ({
  __esModule: true,
  default: () => ({
    grades: [
      { id: 'sample-1', name: '期中考试', score: 85, weight: 30, category: 'exam' }
    ],
    finalExamWeight: 50,
    targetGrade: 85,
    gradingScale: 'percentage',
    result: {
      requiredScore: 85.0,
      isAchievable: true,
      currentWeightedScore: 85.0,
      maxPossibleGrade: 92.5,
      difficultyLevel: 'moderate',
      recommendation: '期末考试需要85分，需要适度加强复习。',
      calculationSteps: ['当前成绩加权平均: 85.0%', '期末考试需得分: 85.0%']
    },
    isCalculating: false,
    error: null,
    setGrades: jest.fn(),
    setFinalExamWeight: jest.fn(),
    setTargetGrade: jest.fn(),
    setGradingScale: jest.fn(),
    calculate: jest.fn(),
    reset: jest.fn(),
    isValid: true,
    validationErrors: [],
    currentWeightedScore: 85.0,
    remainingWeight: 20,
    canCalculate: true
  })
}));

describe('FinalGradeCalculator Component', () => {
  it('should render calculator header and description', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('期末成绩预测计算器')).toBeInTheDocument();
    expect(screen.getByText(/输入当前已有成绩和权重，设定目标分数/)).toBeInTheDocument();
  });

  it('should render current status summary', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('当前状态')).toBeInTheDocument();
    expect(screen.getByText('已有成绩数量:')).toBeInTheDocument();
    expect(screen.getByText('当前加权分数:')).toBeInTheDocument();
    expect(screen.getByText('期末考试权重:')).toBeInTheDocument();
    expect(screen.getByText('目标总分:')).toBeInTheDocument();
  });

  it('should render grading scale selection buttons', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('百分制')).toBeInTheDocument();
    expect(screen.getByText('4.0制')).toBeInTheDocument();
    expect(screen.getByText('5.0制')).toBeInTheDocument();
  });

  it('should render calculation controls', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('重新计算')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('should render usage tips', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('💡 使用提示')).toBeInTheDocument();
    expect(screen.getByText(/权重总和应该等于100%/)).toBeInTheDocument();
  });

  it('should render motivation message based on difficulty level', () => {
    render(<FinalGradeCalculator />);

    expect(screen.getByText('📈 努力可达')).toBeInTheDocument();
    expect(screen.getByText(/适当增加学习时间，制定复习计划/)).toBeInTheDocument();
  });

  it('should render grade input component', () => {
    render(<FinalGradeCalculator />);

    // Grade input should render the sample grade
    expect(screen.getByDisplayValue('期中考试')).toBeInTheDocument();
    // Use getAllByDisplayValue since there are multiple inputs with value 85
    expect(screen.getAllByDisplayValue('85')).toHaveLength(3); // score input, target grade slider input, and range input
  });

  it('should render result display component', () => {
    render(<FinalGradeCalculator />);

    // Should render the result from the mock
    expect(screen.getByText('期末考试分数预测')).toBeInTheDocument();
    expect(screen.getByText('建议')).toBeInTheDocument();
  });
});