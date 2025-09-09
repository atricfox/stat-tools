/**
 * Test suite for GPADataInput component
 * Tests manual entry, transcript parsing, batch import, and file upload functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GPADataInput from '../GPADataInput';
import { DEFAULT_GRADE_SYSTEMS } from '@/lib/gpaCalculation';
import { Course } from '@/types/gpa';

describe('GPADataInput', () => {
  const mockOnCoursesChange = jest.fn();
  const mockOnAddCourse = jest.fn();
  const mockOnUpdateCourse = jest.fn();
  const mockOnRemoveCourse = jest.fn();
  const mockOnClearAll = jest.fn();
  
  const defaultSystem = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
  const sampleCourses: Course[] = [
    {
      id: '1',
      name: 'Calculus I',
      credits: 4,
      grade: 'A',
      semester: 'Fall 2023'
    },
    {
      id: '2',
      name: 'English Composition',
      credits: 3,
      grade: 'B+',
      semester: 'Fall 2023'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with manual input mode by default', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('Add courses one by one')).toBeInTheDocument();
    expect(screen.getByText('Add Course')).toBeInTheDocument();
  });

  test('displays input mode selector with all options', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('Paste Transcript')).toBeInTheDocument();
    expect(screen.getByText('Spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  test('switches to transcript input mode', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    expect(screen.getByText('Paste Transcript Text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste your transcript text here/)).toBeInTheDocument();
    expect(screen.getByText('Parse Transcript')).toBeInTheDocument();
  });

  test('switches to batch input mode', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Spreadsheet'));
    
    expect(screen.getByText('Paste Spreadsheet Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  test('switches to file upload mode', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Upload File'));
    
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    expect(screen.getByText('Select File')).toBeInTheDocument();
  });

  test('calls onAddCourse when Add Course button is clicked', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Add Course'));
    
    expect(mockOnAddCourse).toHaveBeenCalledWith({
      name: '',
      credits: 3,
      grade: '',
      semester: 'Current'
    });
  });

  test('calls onAddCourse when Load Sample Data button is clicked', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Load Sample Data'));
    
    expect(mockOnAddCourse).toHaveBeenCalledTimes(5);
    expect(mockOnAddCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        credits: expect.any(Number),
        grade: expect.any(String),
        semester: expect.any(String)
      })
    );
  });

  test('displays course list when courses are provided', () => {
    render(
      <GPADataInput
        courses={sampleCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByDisplayValue('Calculus I')).toBeInTheDocument();
    expect(screen.getByDisplayValue('English Composition')).toBeInTheDocument();
    expect(screen.getByText('Courses (2/50)')).toBeInTheDocument();
  });

  test('calls onUpdateCourse when course field is modified', () => {
    render(
      <GPADataInput
        courses={sampleCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    const nameInput = screen.getByDisplayValue('Calculus I');
    fireEvent.change(nameInput, { target: { value: 'Advanced Calculus' } });
    
    expect(mockOnUpdateCourse).toHaveBeenCalledWith('1', { name: 'Advanced Calculus' });
  });

  test('calls onRemoveCourse when remove button is clicked', () => {
    render(
      <GPADataInput
        courses={sampleCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove course');
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnRemoveCourse).toHaveBeenCalledWith('1');
  });

  test('calls onClearAll when Clear All button is clicked', () => {
    render(
      <GPADataInput
        courses={sampleCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Clear All'));
    
    expect(mockOnClearAll).toHaveBeenCalled();
  });

  test('parses transcript text correctly - comma separated format', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    const textarea = screen.getByPlaceholderText(/Paste your transcript text here/);
    fireEvent.change(textarea, {
      target: {
        value: 'Calculus I, 4, A\nEnglish Composition, 3, B+\nChemistry, 4, A-'
      }
    });

    fireEvent.click(screen.getByText('Parse Transcript'));
    
    expect(mockOnAddCourse).toHaveBeenCalledTimes(3);
    expect(mockOnAddCourse).toHaveBeenCalledWith({
      name: 'Calculus I',
      credits: 4,
      grade: 'A',
      semester: 'Imported'
    });
  });

  test('parses transcript text correctly - space separated format', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    const textarea = screen.getByPlaceholderText(/Paste your transcript text here/);
    fireEvent.change(textarea, {
      target: {
        value: 'Calculus I    4    A\nEnglish Composition    3    B+'
      }
    });

    fireEvent.click(screen.getByText('Parse Transcript'));
    
    expect(mockOnAddCourse).toHaveBeenCalledTimes(2);
    expect(mockOnAddCourse).toHaveBeenCalledWith({
      name: 'Calculus I',
      credits: 4,
      grade: 'A',
      semester: 'Imported'
    });
  });

  test('parses batch text correctly - tab separated', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Spreadsheet'));
    
    const textarea = screen.getByPlaceholderText(/Course Name/);
    fireEvent.change(textarea, {
      target: {
        value: 'Calculus I\t4\tA\tFall 2023\nEnglish Composition\t3\tB+\tSpring 2024'
      }
    });

    fireEvent.click(screen.getByText('Import Data'));
    
    expect(mockOnAddCourse).toHaveBeenCalledTimes(2);
    expect(mockOnAddCourse).toHaveBeenCalledWith({
      name: 'Calculus I',
      credits: 4,
      grade: 'A',
      semester: 'Fall 2023'
    });
  });

  test('handles parsing errors gracefully', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    const textarea = screen.getByPlaceholderText(/Paste your transcript text here/);
    fireEvent.change(textarea, {
      target: {
        value: 'Invalid line format\nAnother bad line'
      }
    });

    fireEvent.click(screen.getByText('Parse Transcript'));
    
    expect(screen.getByText('Parsing Errors')).toBeInTheDocument();
    expect(mockOnAddCourse).not.toHaveBeenCalled();
  });

  test('shows warnings for invalid grades', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    const textarea = screen.getByPlaceholderText(/Paste your transcript text here/);
    fireEvent.change(textarea, {
      target: {
        value: 'Calculus I, 4, X' // Invalid grade
      }
    });

    fireEvent.click(screen.getByText('Parse Transcript'));
    
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(mockOnAddCourse).toHaveBeenCalledWith({
      name: 'Calculus I',
      credits: 4,
      grade: 'X',
      semester: 'Imported'
    });
  });

  test('disables add course button when at max courses', () => {
    const maxCourses = Array.from({ length: 5 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Course ${i + 1}`,
      credits: 3,
      grade: 'A',
      semester: 'Current'
    }));

    render(
      <GPADataInput
        courses={maxCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
        maxCourses={5}
      />
    );

    const addButton = screen.getByText('Add Course');
    expect(addButton).toBeDisabled();
  });

  test('displays empty state when no courses', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText('No courses added yet')).toBeInTheDocument();
    expect(screen.getByText('Use the options above to add your courses')).toBeInTheDocument();
  });

  test('displays correct course count', () => {
    render(
      <GPADataInput
        courses={sampleCourses}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
        maxCourses={10}
      />
    );

    expect(screen.getByText('Courses (2/10)')).toBeInTheDocument();
  });

  test('clears transcript text after successful parsing', () => {
    render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
      />
    );

    fireEvent.click(screen.getByText('Paste Transcript'));
    
    const textarea = screen.getByPlaceholderText(/Paste your transcript text here/);
    fireEvent.change(textarea, {
      target: { value: 'Calculus I, 4, A' }
    });

    fireEvent.click(screen.getByText('Parse Transcript'));
    
    // Should return to manual mode and clear text
    expect(screen.getByText('Add Course')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <GPADataInput
        courses={[]}
        gradeSystem={defaultSystem}
        onCoursesChange={mockOnCoursesChange}
        onAddCourse={mockOnAddCourse}
        onUpdateCourse={mockOnUpdateCourse}
        onRemoveCourse={mockOnRemoveCourse}
        onClearAll={mockOnClearAll}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});