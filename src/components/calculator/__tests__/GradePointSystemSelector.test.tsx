/**
 * Test suite for GradePointSystemSelector component
 * Tests system selection, mapping table display, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GradePointSystemSelector from '../GradePointSystemSelector';
import { DEFAULT_GRADE_SYSTEMS } from '@/lib/gpaCalculation';
import { GradePointSystem } from '@/types/gpa';

describe('GradePointSystemSelector', () => {
  const mockOnSystemChange = jest.fn();
  const systems = Object.values(DEFAULT_GRADE_SYSTEMS);
  const defaultSystem = systems[0];

  beforeEach(() => {
    mockOnSystemChange.mockClear();
  });

  test('renders with default system', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText('Grading System')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue(defaultSystem.id);
  });

  test('displays system information', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    expect(screen.getByText(defaultSystem.name)).toBeInTheDocument();
    expect(screen.getByText(defaultSystem.country)).toBeInTheDocument();
    expect(screen.getByText(defaultSystem.description)).toBeInTheDocument();
  });

  test('shows official badge for official systems', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    if (defaultSystem.isOfficial) {
      expect(screen.getByText('Official Standard')).toBeInTheDocument();
    }
  });

  test('calls onSystemChange when system is selected', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        supportedSystems={systems}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: systems[1].id } });

    expect(mockOnSystemChange).toHaveBeenCalledWith(systems[1]);
  });

  test('toggles conversion table visibility', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        showConversionTable={true}
      />
    );

    const toggleButton = screen.getByText('Grade Conversion Table');
    
    // Initially hidden
    expect(screen.queryByText('Letter Grade')).not.toBeInTheDocument();
    
    // Click to show
    fireEvent.click(toggleButton);
    expect(screen.getByText('Letter Grade')).toBeInTheDocument();
    expect(screen.getByText('Grade Points')).toBeInTheDocument();
    
    // Click to hide again
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Letter Grade')).not.toBeInTheDocument();
  });

  test('displays grade mappings in conversion table', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        showConversionTable={true}
      />
    );

    // Open conversion table
    fireEvent.click(screen.getByText('Grade Conversion Table'));

    // Check table headers
    expect(screen.getByText('Letter Grade')).toBeInTheDocument();
    expect(screen.getByText('Grade Points')).toBeInTheDocument();
    
    // Check if some grade mappings are displayed (first mapping)
    const firstMapping = defaultSystem.mappings[0];
    if (firstMapping) {
      expect(screen.getByText(firstMapping.letterGrade)).toBeInTheDocument();
      // Use getAllByText for grade points since there might be multiple 4.0s
      const gradePointElements = screen.getAllByText(firstMapping.gradePoints.toFixed(1));
      expect(gradePointElements.length).toBeGreaterThan(0);
    }
  });

  test('displays official source link when available', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
      />
    );

    // Check if the official source link exists (defaultSystem has source)
    const sourceLinks = screen.getAllByText('Official Source');
    expect(sourceLinks.length).toBeGreaterThan(0);
    
    const sourceLink = sourceLinks[0];
    expect(sourceLink.closest('a')).toHaveAttribute('href', defaultSystem.source);
    expect(sourceLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('shows comparison helper when multiple systems available', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        supportedSystems={systems}
      />
    );

    expect(screen.getByText('Quick Comparison:')).toBeInTheDocument();
    expect(screen.getByText(/4.0 Scale:/)).toBeInTheDocument();
    expect(screen.getByText(/Most common in US universities/)).toBeInTheDocument();
    expect(screen.getByText(/4.3 Scale:/)).toBeInTheDocument();
    expect(screen.getByText(/Used in Canada/)).toBeInTheDocument();
  });

  test('shows custom system notice when custom is selected', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        allowCustom={true}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Check for the custom system notice (there are multiple "Custom Grading System" texts)
    expect(screen.getByText(/Define your own grade mappings/)).toBeInTheDocument();
    // Check that the h4 element for Custom Grading System exists (not the option)
    const customSystemElements = screen.getAllByText('Custom Grading System');
    const customNoticeHeader = customSystemElements.find(el => el.tagName.toLowerCase() === 'h4');
    expect(customNoticeHeader).toBeInTheDocument();
  });

  test('hides conversion table when showConversionTable is false', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        showConversionTable={false}
      />
    );

    expect(screen.queryByText('Grade Conversion Table')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('displays all supported systems in dropdown', () => {
    render(
      <GradePointSystemSelector
        system={defaultSystem}
        onSystemChange={mockOnSystemChange}
        supportedSystems={systems}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Check that options exist for each system
    systems.forEach(system => {
      const options = screen.getAllByRole('option');
      const matchingOption = options.find(option => 
        option.textContent?.includes(system.name) && 
        option.getAttribute('value') === system.id
      );
      expect(matchingOption).toBeInTheDocument();
    });
  });
});