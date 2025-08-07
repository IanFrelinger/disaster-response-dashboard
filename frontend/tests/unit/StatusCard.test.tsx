import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusCard, StatusType } from '@/components/public/StatusCard'

describe('StatusCard', () => {
  it('should render safe status correctly', () => {
    render(<StatusCard status="safe" />)
    
    expect(screen.getByTestId('status-card')).toBeInTheDocument()
    expect(screen.getByText('CURRENTLY SAFE')).toBeInTheDocument()
    expect(screen.getByText('No immediate threats detected in your area')).toBeInTheDocument()
    expect(screen.getByText('🟢')).toBeInTheDocument()
  }, 5000)

  it('should render prepare status correctly', () => {
    render(<StatusCard status="prepare" />)
    
    expect(screen.getByText('PREPARE TO EVACUATE')).toBeInTheDocument()
    expect(screen.getByText('Monitor conditions and prepare to leave if needed')).toBeInTheDocument()
    expect(screen.getByText('🟡')).toBeInTheDocument()
    expect(screen.getByText('⚠️ PREPARATION ALERT')).toBeInTheDocument()
  }, 5000)

  it('should render evacuate status correctly', () => {
    render(<StatusCard status="evacuate" />)
    
    expect(screen.getByText('EVACUATE NOW')).toBeInTheDocument()
    expect(screen.getByText('Leave immediately - danger is imminent')).toBeInTheDocument()
    expect(screen.getByText('🔴')).toBeInTheDocument()
    expect(screen.getByText('⚠️ EMERGENCY ALERT')).toBeInTheDocument()
  }, 5000)

  it('should display last updated timestamp', () => {
    const timestamp = '2024-01-01T12:00:00.000Z'
    render(<StatusCard status="safe" lastUpdated={timestamp} />)
    
    expect(screen.getByText(/Updated:/)).toBeInTheDocument()
  }, 5000)

  it('should apply correct CSS classes for each status', () => {
    const { rerender } = render(<StatusCard status="safe" />)
    expect(screen.getByTestId('status-card')).toHaveClass('bg-success-500')
    
    rerender(<StatusCard status="prepare" />)
    expect(screen.getByTestId('status-card')).toHaveClass('bg-warning-500', 'animate-pulse-slow')
    
    rerender(<StatusCard status="evacuate" />)
    expect(screen.getByTestId('status-card')).toHaveClass('bg-danger-500', 'animate-attention')
  }, 5000)

  it('should apply custom className', () => {
    render(<StatusCard status="safe" className="custom-class" />)
    expect(screen.getByTestId('status-card')).toHaveClass('custom-class')
  }, 5000)

  it('should show status in footer', () => {
    render(<StatusCard status="prepare" />)
    expect(screen.getByText('Status: PREPARE')).toBeInTheDocument()
  }, 5000)

  it('should show emergency response active message', () => {
    render(<StatusCard status="safe" />)
    expect(screen.getByText('Emergency Response Active')).toBeInTheDocument()
  }, 5000)
})
