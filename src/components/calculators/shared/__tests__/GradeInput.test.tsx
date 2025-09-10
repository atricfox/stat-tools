/**
 * Test suite for GradeInput component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradeInput from '../GradeInput';
import type { GradeItem } from '@/types/education';

const mockGrades: GradeItem[] = [
  {
    id: '1',
    name: '期中考试',
    score: 85,
    weight: 40,
    category: 'exam'
  },
  {
    id: '2',
    name: '作业',
    score: 92,
    weight: 30,
    category: 'homework'
  }
];

describe('GradeInput Component', () => {
  const mockOnGradesChange = jest.fn();

  beforeEach(() => {
    mockOnGradesChange.mockClear();
  });

  it('should render grade input table with existing grades', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
      />
    );

    expect(screen.getByText('成绩输入')).toBeInTheDocument();
    expect(screen.getByDisplayValue('期中考试')).toBeInTheDocument();
    expect(screen.getByDisplayValue('作业')).toBeInTheDocument();
    expect(screen.getByDisplayValue('85')).toBeInTheDocument();
    expect(screen.getByDisplayValue('92')).toBeInTheDocument();
  });

  it('should display total weight correctly', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
        showWeightTotal={true}
      />
    );

    // Total weight should be 40 + 30 = 70
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });

  it('should add new grade item when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
      />
    );

    const addButton = screen.getByText('添加成绩项目');
    await user.click(addButton);

    expect(mockOnGradesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        ...mockGrades,
        expect.objectContaining({
          name: '',
          score: 0,
          weight: 30 // Should be 100 - 70 = 30
        })
      ])
    );
  });

  it('should remove grade item when remove button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
      />
    );

    const removeButtons = screen.getAllByTitle('删除该项');
    await user.click(removeButtons[0]);

    expect(mockOnGradesChange).toHaveBeenCalledWith([mockGrades[1]]);
  });

  it('should update grade item when input values change', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
      />
    );

    const nameInput = screen.getByDisplayValue('期中考试');
    fireEvent.change(nameInput, { target: { value: '期末考试' } });

    expect(mockOnGradesChange).toHaveBeenCalledWith([
      {
        ...mockGrades[0],
        name: '期末考试'
      },
      mockGrades[1]
    ]);
  });

  it('should validate input values and show errors', async () => {
    const user = userEvent.setup();
    
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
      />
    );

    // Test invalid score
    const scoreInput = screen.getByDisplayValue('85');
    await user.clear(scoreInput);
    await user.type(scoreInput, '150');

    expect(screen.getByText('分数必须在0-100之间')).toBeInTheDocument();
  });

  it('should show weight warning when total is not 100%', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
        showWeightTotal={true}
      />
    );

    expect(screen.getByText(/权重总和为 70.0%，建议调整至100%/)).toBeInTheDocument();
  });

  it('should respect maxItems limit', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
        maxItems={2}
      />
    );

    // Add button should not be visible when at max capacity
    expect(screen.queryByText('添加成绩项目')).not.toBeInTheDocument();
  });

  it('should disable weight editing when allowWeightEdit is false', () => {
    render(
      <GradeInput
        grades={mockGrades}
        onGradesChange={mockOnGradesChange}
        allowWeightEdit={false}
      />
    );

    const weightInputs = screen.getAllByDisplayValue('40');
    expect(weightInputs[0]).toBeDisabled();
  });
});