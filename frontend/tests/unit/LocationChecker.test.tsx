import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocationChecker } from '@/components/public/LocationChecker'

describe('LocationChecker', () => {
  const mockOnLocationCheck = vi.fn()

  beforeEach(() => {
    mockOnLocationCheck.mockClear()
  })

  it('should render location checker form', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    expect(screen.getByTestId('location-checker')).toBeInTheDocument()
    expect(screen.getByText('Check Your Location')).toBeInTheDocument()
    expect(screen.getByTestId('address-input')).toBeInTheDocument()
    expect(screen.getByTestId('check-status')).toBeInTheDocument()
  }, 5000)

  it('should show error for short address', async () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    const input = screen.getByTestId('address-input')
    fireEvent.change(input, { target: { value: '123' } })
    
    const submitButton = screen.getByTestId('check-status')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid address (at least 5 characters)')).toBeInTheDocument()
    })
    
    expect(mockOnLocationCheck).not.toHaveBeenCalled()
  }, 5000)

  it('should call onLocationCheck with valid address', async () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    const input = screen.getByTestId('address-input')
    fireEvent.change(input, { target: { value: '123 Main Street' } })
    
    const submitButton = screen.getByTestId('check-status')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnLocationCheck).toHaveBeenCalledWith('123 Main Street')
    })
  }, 5000)

  it('should clear error when user starts typing', async () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    // First, trigger an error with short address
    const input = screen.getByTestId('address-input')
    fireEvent.change(input, { target: { value: '123' } })
    
    const submitButton = screen.getByTestId('check-status')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    // Then, start typing to clear the error
    fireEvent.change(input, { target: { value: '123 Main Street' } })
    
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  }, 5000)

  it('should show loading state when loading prop is true', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} loading={true} />)
    
    const input = screen.getByTestId('address-input')
    const button = screen.getByTestId('check-status')
    
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  }, 5000)

  it('should disable button when input is empty', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    const button = screen.getByTestId('check-status')
    expect(button).toBeDisabled()
  }, 5000)

  it('should enable button when input has content', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    
    const input = screen.getByTestId('address-input')
    const button = screen.getByTestId('check-status')
    
    fireEvent.change(input, { target: { value: '123 Main Street' } })
    expect(button).not.toBeDisabled()
  }, 5000)

  it('should apply custom className', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} className="custom-class" />)
    expect(screen.getByTestId('location-checker')).toHaveClass('custom-class')
  }, 5000)

  it('should show note about location checking', () => {
    render(<LocationChecker onLocationCheck={mockOnLocationCheck} />)
    expect(screen.getByText(/This will check the current emergency status/)).toBeInTheDocument()
  }, 5000)
})
