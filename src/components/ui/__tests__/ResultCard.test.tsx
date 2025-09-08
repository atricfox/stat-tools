/**
 * Unit tests for ResultCard component
 * Tests result display, highlighting, and different sizes
 */

import { render, screen } from '@testing-library/react'
import ResultCard from '../ResultCard'

describe('ResultCard', () => {
  const defaultProps = {
    value: 42,
    label: 'Test Result',
  }

  it('should render with default props', () => {
    render(<ResultCard {...defaultProps} />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Test Result')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(<ResultCard {...defaultProps} value="N/A" />)
    
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should render with unit', () => {
    render(<ResultCard {...defaultProps} unit="°C" />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('°C')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<ResultCard {...defaultProps} description="Additional info" />)
    
    expect(screen.getByText('Additional info')).toBeInTheDocument()
  })

  it('should apply highlighted styles', () => {
    render(<ResultCard {...defaultProps} highlighted={true} />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('bg-blue-50', 'border-blue-200')
    
    const value = screen.getByText('42')
    expect(value).toHaveClass('text-blue-600')
    
    const label = screen.getByText('Test Result')
    expect(label).toHaveClass('text-blue-600')
  })

  it('should apply normal styles when not highlighted', () => {
    render(<ResultCard {...defaultProps} highlighted={false} />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('bg-gray-50', 'border-gray-200')
    
    const value = screen.getByText('42')
    expect(value).toHaveClass('text-gray-900')
    
    const label = screen.getByText('Test Result')
    expect(label).toHaveClass('text-gray-600')
  })

  it('should apply small size classes', () => {
    render(<ResultCard {...defaultProps} size="small" />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('p-3')
    
    const value = screen.getByText('42')
    expect(value).toHaveClass('text-lg', 'font-semibold')
    
    const label = screen.getByText('Test Result')
    expect(label).toHaveClass('text-xs')
  })

  it('should apply medium size classes (default)', () => {
    render(<ResultCard {...defaultProps} size="medium" />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('p-4')
    
    const value = screen.getByText('42')
    expect(value).toHaveClass('text-2xl', 'font-bold')
    
    const label = screen.getByText('Test Result')
    expect(label).toHaveClass('text-sm')
  })

  it('should apply large size classes', () => {
    render(<ResultCard {...defaultProps} size="large" />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('p-6')
    
    const value = screen.getByText('42')
    expect(value).toHaveClass('text-3xl', 'font-bold')
    
    const label = screen.getByText('Test Result')
    expect(label).toHaveClass('text-base')
  })

  it('should apply custom className', () => {
    render(<ResultCard {...defaultProps} className="custom-class" />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveClass('custom-class')
  })

  it('should render decimal values correctly', () => {
    render(<ResultCard {...defaultProps} value={3.14159} />)
    
    expect(screen.getByText('3.14159')).toBeInTheDocument()
  })

  it('should render negative values correctly', () => {
    render(<ResultCard {...defaultProps} value={-42} />)
    
    expect(screen.getByText('-42')).toBeInTheDocument()
  })

  it('should render zero correctly', () => {
    render(<ResultCard {...defaultProps} value={0} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render large numbers correctly', () => {
    render(<ResultCard {...defaultProps} value={1000000} />)
    
    expect(screen.getByText('1000000')).toBeInTheDocument()
  })

  it('should handle complex units', () => {
    render(<ResultCard {...defaultProps} value={42} unit="kg/m²" />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('kg/m²')).toBeInTheDocument()
  })

  it('should handle long descriptions', () => {
    const longDescription = 'This is a very long description that should wrap properly'
    render(<ResultCard {...defaultProps} description={longDescription} />)
    
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<ResultCard {...defaultProps} />)
    
    // Check that no description text is present
    const card = screen.getByText('42').parentElement
    expect(card?.textContent).not.toMatch(/Additional info|description/i)
  })

  it('should not render unit when not provided', () => {
    render(<ResultCard {...defaultProps} />)
    
    // Should only contain the value, not any unit
    const valueElement = screen.getByText('42')
    expect(valueElement.textContent).toBe('42')
  })

  it('should handle special characters in units', () => {
    render(<ResultCard {...defaultProps} unit="±%" />)
    
    expect(screen.getByText('±%')).toBeInTheDocument()
  })

  it('should maintain accessibility', () => {
    render(<ResultCard {...defaultProps} />)
    
    const card = screen.getByText('42').parentElement
    expect(card).toHaveAttribute('class')
    
    // Verify text content is accessible
    expect(screen.getByText('42')).toBeVisible()
    expect(screen.getByText('Test Result')).toBeVisible()
  })
})