/**
 * Unit tests for NumberInput component
 * Tests input handling, validation display, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumberInput from '../NumberInput'

describe('NumberInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<NumberInput {...defaultProps} />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('Numbers')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter numbers separated by/)).toBeInTheDocument()
  })

  it('should render with custom label and placeholder', () => {
    render(
      <NumberInput
        {...defaultProps}
        label="Custom Label"
        placeholder="Custom placeholder"
      />
    )
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('should call onChange when input changes', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<NumberInput {...defaultProps} onChange={onChange} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '1, 2, 3')
    
    expect(onChange).toHaveBeenCalledWith('1, 2, 3')
  })

  it('should display character count', () => {
    render(<NumberInput {...defaultProps} value="1, 2, 3" maxLength={100} />)
    
    expect(screen.getByText('7/100')).toBeInTheDocument()
  })

  it('should respect maxLength', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(
      <NumberInput {...defaultProps} onChange={onChange} maxLength={5} />
    )
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '1, 2, 3, 4, 5')
    
    // Should not call onChange for characters beyond maxLength
    expect(onChange).toHaveBeenLastCalledWith('1, 2,')
  })

  it('should validate and show valid numbers count', async () => {
    render(<NumberInput {...defaultProps} value="1, 2, 3, 4, 5" />)
    
    await waitFor(() => {
      expect(screen.getByText('5 valid numbers found')).toBeInTheDocument()
    })
    
    const checkIcon = screen.getByTestId('check-circle') || document.querySelector('[data-lucide="check-circle"]')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should show preview of valid numbers', async () => {
    render(<NumberInput {...defaultProps} value="1, 2, 3, 4, 5" showPreview={true} />)
    
    await waitFor(() => {
      expect(screen.getByText('Preview:')).toBeInTheDocument()
      expect(screen.getByText('1, 2, 3, 4, 5')).toBeInTheDocument()
    })
  })

  it('should truncate preview for many numbers', async () => {
    render(<NumberInput {...defaultProps} value="1, 2, 3, 4, 5, 6, 7, 8, 9, 10" showPreview={true} />)
    
    await waitFor(() => {
      expect(screen.getByText(/1, 2, 3, 4, 5... \(\+5 more\)/)).toBeInTheDocument()
    })
  })

  it('should show invalid entries warning', async () => {
    render(<NumberInput {...defaultProps} value="1, abc, 3, def, 5" />)
    
    await waitFor(() => {
      expect(screen.getByText('3 valid numbers found')).toBeInTheDocument()
      expect(screen.getByText('2 invalid entries will be ignored')).toBeInTheDocument()
      expect(screen.getByText('abc, def')).toBeInTheDocument()
    })
  })

  it('should truncate invalid entries list', async () => {
    render(<NumberInput {...defaultProps} value="1, a, b, c, d, e, f, g" />)
    
    await waitFor(() => {
      expect(screen.getByText(/a, b, c, d, e \(\+2 more\)/)).toBeInTheDocument()
    })
  })

  it('should show error state for no valid numbers', async () => {
    render(<NumberInput {...defaultProps} value="abc, def, ghi" />)
    
    await waitFor(() => {
      expect(screen.getByText('No valid numbers found')).toBeInTheDocument()
    })
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-300')
  })

  it('should call onValidation callback', async () => {
    const onValidation = jest.fn()
    
    render(
      <NumberInput
        {...defaultProps}
        value="1, 2, abc, 4"
        onValidation={onValidation}
      />
    )
    
    await waitFor(() => {
      expect(onValidation).toHaveBeenCalledWith(true, 3, ['abc'])
    })
  })

  it('should handle empty input', async () => {
    const onValidation = jest.fn()
    
    render(
      <NumberInput
        {...defaultProps}
        value=""
        onValidation={onValidation}
      />
    )
    
    await waitFor(() => {
      expect(onValidation).toHaveBeenCalledWith(true, 0, [])
    })
    
    expect(screen.queryByText(/valid numbers found/)).not.toBeInTheDocument()
    expect(screen.queryByText('Preview:')).not.toBeInTheDocument()
  })

  it('should handle decimal numbers', async () => {
    render(<NumberInput {...defaultProps} value="1.5, 2.7, 3.14159" />)
    
    await waitFor(() => {
      expect(screen.getByText('3 valid numbers found')).toBeInTheDocument()
      expect(screen.getByText('1.5, 2.7, 3.14159')).toBeInTheDocument()
    })
  })

  it('should handle negative numbers', async () => {
    render(<NumberInput {...defaultProps} value="-1, -2.5, 3" />)
    
    await waitFor(() => {
      expect(screen.getByText('3 valid numbers found')).toBeInTheDocument()
      expect(screen.getByText('-1, -2.5, 3')).toBeInTheDocument()
    })
  })

  it('should handle scientific notation', async () => {
    render(<NumberInput {...defaultProps} value="1e3, 2.5e-2, 3.14e0" />)
    
    await waitFor(() => {
      expect(screen.getByText('3 valid numbers found')).toBeInTheDocument()
    })
  })

  it('should handle mixed separators', async () => {
    render(<NumberInput {...defaultProps} value="1, 2\n3 4\t5" />)
    
    await waitFor(() => {
      expect(screen.getByText('5 valid numbers found')).toBeInTheDocument()
    })
  })

  it('should show singular form for single number', async () => {
    render(<NumberInput {...defaultProps} value="42" />)
    
    await waitFor(() => {
      expect(screen.getByText('1 valid number found')).toBeInTheDocument()
    })
  })

  it('should show singular form for single invalid entry', async () => {
    render(<NumberInput {...defaultProps} value="abc" />)
    
    await waitFor(() => {
      expect(screen.getByText('1 invalid entry will be ignored')).toBeInTheDocument()
    })
  })

  it('should not show preview when disabled', async () => {
    render(<NumberInput {...defaultProps} value="1, 2, 3" showPreview={false} />)
    
    await waitFor(() => {
      expect(screen.getByText('3 valid numbers found')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Preview:')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<NumberInput {...defaultProps} className="custom-class" />)
    
    const container = screen.getByRole('textbox').parentElement?.parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('should render without label when not provided', () => {
    render(<NumberInput {...defaultProps} label="" />)
    
    expect(screen.queryByText('Numbers')).not.toBeInTheDocument()
  })
})