import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeightedDataInput from '../WeightedDataInput';
import { InputMode, UserMode } from '@/types/weightedMean';

// Mock the icons
jest.mock('lucide-react', () => ({
  Calculator: ({ className }: { className?: string }) => <div className={className} data-testid="calculator-icon" />,
  FileText: ({ className }: { className?: string }) => <div className={className} data-testid="filetext-icon" />,
  Edit3: ({ className }: { className?: string }) => <div className={className} data-testid="edit3-icon" />,
  HelpCircle: ({ className }: { className?: string }) => <div className={className} data-testid="help-icon" />,
  AlertTriangle: ({ className }: { className?: string }) => <div className={className} data-testid="alert-icon" />,
  CheckCircle: ({ className }: { className?: string }) => <div className={className} data-testid="check-icon" />,
  Info: ({ className }: { className?: string }) => <div className={className} data-testid="info-icon" />,
  Plus: ({ className }: { className?: string }) => <div className={className} data-testid="plus-icon" />,
  Trash2: ({ className }: { className?: string }) => <div className={className} data-testid="trash-icon" />,
  RotateCcw: ({ className }: { className?: string }) => <div className={className} data-testid="rotate-icon" />
}));

describe('WeightedDataInput', () => {
  const defaultProps = {
    inputMode: 'pairs' as InputMode,
    onModeChange: jest.fn(),
    onDataChange: jest.fn(),
    userMode: 'student' as UserMode,
    className: '',
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization and rendering', () => {
    test('renders with default props', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      expect(screen.getByText('Data Input')).toBeInTheDocument();
      expect(screen.getAllByText('Value:Weight Pairs')).toHaveLength(2); // Button and label
      expect(screen.getByText('Separate Columns')).toBeInTheDocument();
      expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    });

    test('shows correct mode as selected', () => {
      render(<WeightedDataInput {...defaultProps} inputMode="columns" />);
      
      const columnsButton = screen.getByText('Separate Columns');
      expect(columnsButton.closest('button')).toHaveClass('bg-white', 'text-blue-600');
    });

    test('renders help button', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      expect(screen.getByTestId('help-icon')).toBeInTheDocument();
    });
  });

  describe('pairs input mode', () => {
    test('renders pairs input textarea', () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('font-mono');
    });

    test('handles pairs input change and validation', async () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      
      // Type valid pairs input
      fireEvent.change(textarea, {
        target: { value: '92:3\n88:4\n95:2' }
      });

      // Wait for debounced validation
      await waitFor(() => {
        expect(defaultProps.onDataChange).toHaveBeenCalledWith([
          { value: 92, weight: 3, id: 'pair-0' },
          { value: 88, weight: 4, id: 'pair-1' },
          { value: 95, weight: 2, id: 'pair-2' }
        ]);
      }, { timeout: 1000 });

      // Check validation feedback
      await waitFor(() => {
        expect(screen.getByText(/Successfully parsed 3 value:weight pairs/)).toBeInTheDocument();
      });
    });

    test('handles different pair formats', async () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      
      // Test different formats: colon, comma, space
      fireEvent.change(textarea, {
        target: { value: '90:3\n85,4\n92 2' }
      });

      await waitFor(() => {
        expect(defaultProps.onDataChange).toHaveBeenCalledWith([
          { value: 90, weight: 3, id: 'pair-0' },
          { value: 85, weight: 4, id: 'pair-1' },
          { value: 92, weight: 2, id: 'pair-2' }
        ]);
      });
    });

    test('handles scientific notation in pairs', async () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" userMode="research" />);
      
      const textarea = screen.getByPlaceholderText(/Enter value:weight pairs/);
      
      fireEvent.change(textarea, {
        target: { value: '1.23e2:0.3\n4.56e-1:0.7' }
      });

      await waitFor(() => {
        expect(defaultProps.onDataChange).toHaveBeenCalledWith([
          { value: 123, weight: 0.3, id: 'pair-0' },
          { value: 0.456, weight: 0.7, id: 'pair-1' }
        ]);
      });
    });

    test('shows error for invalid pairs input', async () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      
      // Type invalid input
      fireEvent.change(textarea, {
        target: { value: 'invalid input\nmore invalid' }
      });

      await waitFor(() => {
        expect(screen.getByText(/No valid pairs found/)).toBeInTheDocument();
      });

      expect(defaultProps.onDataChange).toHaveBeenCalledWith([]);
    });
  });

  describe('mode switching', () => {
    test('calls onModeChange when mode button is clicked', () => {
      render(<WeightedDataInput {...defaultProps} inputMode="pairs" />);
      
      const columnsButton = screen.getByText('Separate Columns');
      fireEvent.click(columnsButton);
      
      expect(defaultProps.onModeChange).toHaveBeenCalledWith('columns');
    });

    test('does not switch modes when disabled', () => {
      render(<WeightedDataInput {...defaultProps} disabled={true} />);
      
      const columnsButton = screen.getByText('Separate Columns');
      fireEvent.click(columnsButton);
      
      expect(defaultProps.onModeChange).not.toHaveBeenCalled();
    });
  });

  describe('user mode adaptation', () => {
    test('shows student-specific placeholders and labels', () => {
      render(<WeightedDataInput {...defaultProps} userMode="student" />);
      
      expect(screen.getByPlaceholderText(/grade:credits pairs/)).toBeInTheDocument();
    });

    test('shows research-specific placeholders', () => {
      render(<WeightedDataInput {...defaultProps} userMode="research" />);
      
      expect(screen.getByPlaceholderText(/value:weight pairs/)).toBeInTheDocument();
    });

    test('shows teacher-specific placeholders', () => {
      render(<WeightedDataInput {...defaultProps} userMode="teacher" />);
      
      expect(screen.getByPlaceholderText(/score:weight pairs/)).toBeInTheDocument();
    });
  });

  describe('help functionality', () => {
    test('toggles help text when help button is clicked', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      const helpButton = screen.getByTestId('help-icon').closest('button');
      
      // Help should not be visible initially
      expect(screen.queryByText(/One pair per line/)).not.toBeInTheDocument();
      
      // Click help button
      fireEvent.click(helpButton!);
      
      // Help should now be visible
      expect(screen.getByText(/One pair per line/)).toBeInTheDocument();
      
      // Click again to hide
      fireEvent.click(helpButton!);
      
      // Help should be hidden again
      expect(screen.queryByText(/One pair per line/)).not.toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    test('renders load example button', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      expect(screen.getByText('Load Example')).toBeInTheDocument();
    });

    test('renders clear button', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    test('load example populates input based on user mode', () => {
      render(<WeightedDataInput {...defaultProps} userMode="student" />);
      
      const loadButton = screen.getByText('Load Example');
      fireEvent.click(loadButton);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      expect(textarea).toHaveValue('92:3\n88:4\n95:3\n87:2\n91:3');
    });

    test('clear button resets all inputs', () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      fireEvent.change(textarea, { target: { value: '90:3\n85:4' } });
      
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
      
      expect(textarea).toHaveValue('');
    });

    test('buttons are disabled when component is disabled', () => {
      render(<WeightedDataInput {...defaultProps} disabled={true} />);
      
      const loadButton = screen.getByText('Load Example');
      const clearButton = screen.getByText('Clear');
      
      expect(loadButton).toBeDisabled();
      expect(clearButton).toBeDisabled();
    });
  });

  describe('validation feedback', () => {
    test('shows success validation message', async () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      fireEvent.change(textarea, { target: { value: '90:3\n85:4' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
        expect(screen.getByText(/Successfully parsed 2 value:weight pairs/)).toBeInTheDocument();
      });
    });

    test('shows error validation message', async () => {
      render(<WeightedDataInput {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/Enter grade:credits pairs/);
      fireEvent.change(textarea, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
        expect(screen.getByText(/No valid pairs found/)).toBeInTheDocument();
      });
    });
  });
});