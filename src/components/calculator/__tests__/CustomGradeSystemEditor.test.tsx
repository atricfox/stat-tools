/**
 * Test suite for CustomGradeSystemEditor component
 * Tests custom grading system creation, editing, validation, import/export functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomGradeSystemEditor from '../CustomGradeSystemEditor';
import { GradePointSystem } from '@/types/gpa';

describe('CustomGradeSystemEditor', () => {
  const mockOnSystemChange = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  
  const sampleSystem: GradePointSystem = {
    id: 'test-system',
    name: 'Test System',
    scale: 4.0,
    country: 'Test Country',
    description: 'Test description',
    isOfficial: false,
    mappings: [
      {
        letterGrade: 'A',
        numericMin: 90,
        numericMax: 100,
        gradePoints: 4.0,
        percentageMin: 90,
        percentageMax: 100,
        description: 'Excellent'
      },
      {
        letterGrade: 'B',
        numericMin: 80,
        numericMax: 89,
        gradePoints: 3.0,
        percentageMin: 80,
        percentageMax: 89,
        description: 'Good'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default empty system', () => {
    render(
      <CustomGradeSystemEditor
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Custom Grading System')).toBeInTheDocument();
    expect(screen.getByText('System Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('My Custom Grading System')).toBeInTheDocument();
  });

  test('renders with existing system', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByDisplayValue('Test System')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Country')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    
    // Check for the scale input specifically (there are multiple "4" values)
    const scaleInputs = screen.getAllByDisplayValue('4');
    expect(scaleInputs.length).toBeGreaterThan(0);
  });

  test('displays grade mappings when provided', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Excellent')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Good')).toBeInTheDocument();
  });

  test('calls onSystemChange when system name is updated', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const nameInput = screen.getByDisplayValue('Test System');
    fireEvent.change(nameInput, { target: { value: 'Updated System' } });

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated System'
      })
    );
  });

  test('calls onSystemChange when scale is updated', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    // Get all inputs with value "4" and find the one that's the scale input (has max="10")
    const scaleInputElement = screen.getAllByDisplayValue('4').find(
      (input) => input.getAttribute('max') === '10'
    );
    
    expect(scaleInputElement).toBeTruthy();
    fireEvent.change(scaleInputElement!, { target: { value: '5' } });

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: 5
      })
    );
  });

  test('adds new grade mapping when Add Grade button is clicked', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const addButton = screen.getByText('Add Grade');
    fireEvent.click(addButton);

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: expect.arrayContaining([
          expect.objectContaining({
            letterGrade: '',
            gradePoints: 0
          })
        ])
      })
    );
  });

  test('updates grade mapping when field is changed', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const gradeInputs = screen.getAllByDisplayValue('A');
    fireEvent.change(gradeInputs[0], { target: { value: 'A+' } });

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: expect.arrayContaining([
          expect.objectContaining({
            letterGrade: 'A+'
          })
        ])
      })
    );
  });

  test('removes grade mapping when remove button is clicked', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove mapping');
    fireEvent.click(removeButtons[0]);

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: expect.arrayContaining([
          expect.objectContaining({
            letterGrade: 'B'
          })
        ])
      })
    );
    
    // Should only have one mapping left
    const lastCall = mockOnSystemChange.mock.calls[mockOnSystemChange.mock.calls.length - 1][0];
    expect(lastCall.mappings).toHaveLength(1);
  });

  test('shows validation errors for invalid system', () => {
    const invalidSystem = {
      ...sampleSystem,
      name: '', // Missing required name
      mappings: [] // No mappings
    };

    render(
      <CustomGradeSystemEditor
        system={invalidSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText(/System name is required/)).toBeInTheDocument();
    expect(screen.getByText(/At least one grade mapping is required/)).toBeInTheDocument();
  });

  test('shows validation warnings for incomplete system', () => {
    const incompleteSystem = {
      ...sampleSystem,
      country: '',
      description: ''
    };

    render(
      <CustomGradeSystemEditor
        system={incompleteSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText(/Country\/region is recommended/)).toBeInTheDocument();
    expect(screen.getByText(/Description helps users understand/)).toBeInTheDocument();
  });

  test('detects duplicate letter grades', () => {
    const systemWithDuplicates = {
      ...sampleSystem,
      mappings: [
        ...sampleSystem.mappings,
        {
          letterGrade: 'A', // Duplicate
          numericMin: 95,
          numericMax: 100,
          gradePoints: 4.0,
          percentageMin: 95,
          percentageMax: 100
        }
      ]
    };

    render(
      <CustomGradeSystemEditor
        system={systemWithDuplicates}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText(/Duplicate letter grades: A/)).toBeInTheDocument();
  });

  test('validates grade points within scale', () => {
    const systemWithInvalidPoints = {
      ...sampleSystem,
      mappings: [
        {
          letterGrade: 'A',
          numericMin: 90,
          numericMax: 100,
          gradePoints: 5.0, // Exceeds scale of 4.0
          percentageMin: 90,
          percentageMax: 100
        }
      ]
    };

    render(
      <CustomGradeSystemEditor
        system={systemWithInvalidPoints}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText(/Grade points must be between 0 and 4/)).toBeInTheDocument();
  });

  test('shows template selector when Use Template is clicked', () => {
    render(
      <CustomGradeSystemEditor
        onSystemChange={mockOnSystemChange}
      />
    );

    fireEvent.click(screen.getByText('Use Template'));
    
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    expect(screen.getByText('Basic 4.0 Scale')).toBeInTheDocument();
    expect(screen.getByText('Plus/Minus System')).toBeInTheDocument();
    expect(screen.getByText('Numerical Grades (1-5)')).toBeInTheDocument();
  });

  test('loads template when template is selected', () => {
    render(
      <CustomGradeSystemEditor
        onSystemChange={mockOnSystemChange}
      />
    );

    fireEvent.click(screen.getByText('Use Template'));
    fireEvent.click(screen.getByText('Basic 4.0 Scale'));

    expect(mockOnSystemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Basic 4.0 Scale',
        scale: 4.0,
        mappings: expect.arrayContaining([
          expect.objectContaining({
            letterGrade: 'A'
          }),
          expect.objectContaining({
            letterGrade: 'B'
          })
        ])
      })
    );
  });

  test('closes template selector when X is clicked', () => {
    render(
      <CustomGradeSystemEditor
        onSystemChange={mockOnSystemChange}
      />
    );

    fireEvent.click(screen.getByText('Use Template'));
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    fireEvent.click(closeButton);

    expect(screen.queryByText('Choose a Template')).not.toBeInTheDocument();
  });

  test('calls onSave when Save System button is clicked with valid system', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Save System');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(sampleSystem);
  });

  test('disables Save System button for invalid system', () => {
    const invalidSystem = {
      ...sampleSystem,
      name: '', // Invalid - missing name
    };

    render(
      <CustomGradeSystemEditor
        system={invalidSystem}
        onSystemChange={mockOnSystemChange}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Save System');
    expect(saveButton).toBeDisabled();
  });

  test('calls onCancel when Cancel button is clicked', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('shows unsaved indicator when system is modified', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const nameInput = screen.getByDisplayValue('Test System');
    fireEvent.change(nameInput, { target: { value: 'Modified System' } });

    expect(screen.getByText('Unsaved')).toBeInTheDocument();
  });

  test('enables Reset button when system is modified', () => {
    render(
      <CustomGradeSystemEditor
        system={sampleSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDisabled();

    const nameInput = screen.getByDisplayValue('Test System');
    fireEvent.change(nameInput, { target: { value: 'Modified System' } });

    expect(resetButton).not.toBeDisabled();
  });

  test('disables Export button when system has no name', () => {
    const systemWithoutName = {
      ...sampleSystem,
      name: ''
    };

    render(
      <CustomGradeSystemEditor
        system={systemWithoutName}
        onSystemChange={mockOnSystemChange}
      />
    );

    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeDisabled();
  });

  test('displays empty state when no mappings exist', () => {
    const systemWithoutMappings = {
      ...sampleSystem,
      mappings: []
    };

    render(
      <CustomGradeSystemEditor
        system={systemWithoutMappings}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('No grade mappings defined')).toBeInTheDocument();
    expect(screen.getByText('Add grade mappings to define your grading system')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <CustomGradeSystemEditor
        onSystemChange={mockOnSystemChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('validates numeric range consistency', () => {
    const systemWithBadRanges = {
      ...sampleSystem,
      mappings: [
        {
          letterGrade: 'A',
          numericMin: 100, // Min greater than max
          numericMax: 90,
          gradePoints: 4.0,
          percentageMin: 100,
          percentageMax: 90
        }
      ]
    };

    render(
      <CustomGradeSystemEditor
        system={systemWithBadRanges}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText(/Minimum must be less than maximum/)).toBeInTheDocument();
  });
});