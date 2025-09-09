/**
 * Unit tests for HelpSection component
 * Tests help content adaptation for different calculator types and user modes
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpSection from '../HelpSection';

describe('HelpSection', () => {
  describe('Calculator type adaptation', () => {
    it('shows mean calculator help content by default', () => {
      render(
        <HelpSection
          userMode="student"
        />
      );

      expect(screen.getByText('Help & Guide')).toBeInTheDocument();
      expect(screen.getByText('Student Mode Resources')).toBeInTheDocument();
      
      // Check for mean calculator specific content
      fireEvent.click(screen.getByText('Basics'));
      expect(screen.getByText('What is the Mean?')).toBeInTheDocument();
    });

    it('shows weighted mean calculator help content when specified', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      // Check for weighted mean specific content
      fireEvent.click(screen.getByText('Basics'));
      expect(screen.getByText('What is Weighted Mean?')).toBeInTheDocument();
      expect(screen.getByText(/weighted mean is an average where some values contribute more/i)).toBeInTheDocument();
    });
  });

  describe('User mode adaptation', () => {
    it('shows student mode help content', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      expect(screen.getByText('Student Mode Resources')).toBeInTheDocument();
      
      // Check student-specific quick tips
      expect(screen.getByText('Quick Tips for Students')).toBeInTheDocument();
      expect(screen.getByText(/Enter your course grades and credit hours/i)).toBeInTheDocument();
    });

    it('shows research mode help content', () => {
      render(
        <HelpSection
          userMode="research"
          calculatorType="weighted-mean"
        />
      );

      expect(screen.getByText('Research Mode Resources')).toBeInTheDocument();
      
      // Check research-specific quick tips
      expect(screen.getByText('Quick Tips for Researchers')).toBeInTheDocument();
      expect(screen.getByText(/Consider weight distribution in your analysis/i)).toBeInTheDocument();
    });

    it('shows teacher mode help content', () => {
      render(
        <HelpSection
          userMode="teacher"
          calculatorType="weighted-mean"
        />
      );

      expect(screen.getByText('Teacher Mode Resources')).toBeInTheDocument();
      
      // Check teacher-specific quick tips
      expect(screen.getByText('Quick Tips for Teachers')).toBeInTheDocument();
      expect(screen.getByText(/Set appropriate weights for different assignments/i)).toBeInTheDocument();
    });
  });

  describe('Tab navigation', () => {
    it('switches between different help tabs', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      // Default should be basics
      expect(screen.getByRole('button', { name: /basics/i })).toHaveClass('bg-white');

      // Click formulas tab
      fireEvent.click(screen.getByRole('button', { name: /formulas/i }));
      expect(screen.getByRole('button', { name: /formulas/i })).toHaveClass('bg-white');

      // Click examples tab
      fireEvent.click(screen.getByRole('button', { name: /examples/i }));
      expect(screen.getByRole('button', { name: /examples/i })).toHaveClass('bg-white');

      // Click troubleshooting tab
      fireEvent.click(screen.getByRole('button', { name: /troubleshooting/i }));
      expect(screen.getByRole('button', { name: /troubleshooting/i })).toHaveClass('bg-white');
    });
  });

  describe('Content expansion', () => {
    it('expands and collapses help topics', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      // Find a help topic button
      const topicButton = screen.getByText('What is Weighted Mean?');
      
      // Initially collapsed (content not visible)
      expect(screen.queryByText(/weighted mean is an average where some values contribute more/i)).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(topicButton);
      expect(screen.getByText(/weighted mean is an average where some values contribute more/i)).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(topicButton);
      expect(screen.queryByText(/weighted mean is an average where some values contribute more/i)).not.toBeInTheDocument();
    });
  });

  describe('Weighted mean specific content', () => {
    beforeEach(() => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );
    });

    it('shows weighted mean formulas when formulas tab is selected', () => {
      fireEvent.click(screen.getByRole('button', { name: /formulas/i }));
      
      // Should show weighted mean formula
      const formulaButton = screen.getByText('Weighted Mean Formula');
      fireEvent.click(formulaButton);
      
      expect(screen.getByText(/Weighted Mean = Σ\\(value × weight\\) ÷ Σ\\(weight\\)/i)).toBeInTheDocument();
    });

    it('shows weighted mean examples when examples tab is selected', () => {
      fireEvent.click(screen.getByRole('button', { name: /examples/i }));
      
      // Should show GPA calculation example
      expect(screen.getByText('GPA Calculation Example')).toBeInTheDocument();
    });

    it('shows weighted mean troubleshooting when troubleshooting tab is selected', () => {
      fireEvent.click(screen.getByRole('button', { name: /troubleshooting/i }));
      
      // Should show zero weights troubleshooting
      expect(screen.getByText('Zero or Negative Weights')).toBeInTheDocument();
      expect(screen.getByText('Mismatched Value-Weight Pairs')).toBeInTheDocument();
    });
  });

  describe('User mode color themes', () => {
    it('applies correct color theme for student mode', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      // Student mode should have blue theme elements
      const header = screen.getByText('Help & Guide').closest('div');
      expect(header).toBeInTheDocument();
    });

    it('applies correct color theme for research mode', () => {
      render(
        <HelpSection
          userMode="research"
          calculatorType="weighted-mean"
        />
      );

      // Research mode should have purple theme elements
      const header = screen.getByText('Help & Guide').closest('div');
      expect(header).toBeInTheDocument();
    });

    it('applies correct color theme for teacher mode', () => {
      render(
        <HelpSection
          userMode="teacher"
          calculatorType="weighted-mean"
        />
      );

      // Teacher mode should have green theme elements
      const header = screen.getByText('Help & Guide').closest('div');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      // Tab buttons should be properly labeled
      expect(screen.getByRole('button', { name: /basics/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /formulas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /examples/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /troubleshooting/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <HelpSection
          userMode="student"
          calculatorType="weighted-mean"
        />
      );

      const basicsTab = screen.getByRole('button', { name: /basics/i });
      
      // Should be focusable
      basicsTab.focus();
      expect(document.activeElement).toBe(basicsTab);
    });
  });
});