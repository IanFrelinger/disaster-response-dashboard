import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/stores/useAppStore'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useAppStore.setState({
        dashboardData: null,
        hazards: [],
        routes: [],
        loading: false,
        error: null,
        lastUpdated: null,
      })
    })
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useAppStore())
    
    expect(result.current.dashboardData).toBeNull()
    expect(result.current.hazards).toEqual([])
    expect(result.current.routes).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.lastUpdated).toBeNull()
  }, 5000) // 5 second timeout

  it('should set dashboard data', () => {
    const { result } = renderHook(() => useAppStore())
    const mockData = {
      hazards: [],
      routes: [],
      summary: {
        totalHazards: 0,
        riskDistribution: {},
        dataSources: {},
        lastUpdated: new Date().toISOString()
      }
    }

    act(() => {
      result.current.setDashboardData(mockData)
    })

    expect(result.current.dashboardData).toEqual(mockData)
    expect(result.current.lastUpdated).toBeInstanceOf(Date)
  }, 5000) // 5 second timeout

  it('should set loading state', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.loading).toBe(true)
  }, 5000) // 5 second timeout

  it('should set and clear error', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setError('Test error')
    })

    expect(result.current.error).toBe('Test error')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  }, 5000) // 5 second timeout

  it('should set hazards', () => {
    const { result } = renderHook(() => useAppStore())
    const mockHazards = [
      {
        id: '1',
        geometry: { type: 'Polygon', coordinates: [] },
        riskLevel: 'high' as const,
        lastUpdated: new Date().toISOString(),
        dataSource: 'test',
        riskScore: 0.8
      }
    ]

    act(() => {
      result.current.setHazards(mockHazards)
    })

    expect(result.current.hazards).toEqual(mockHazards)
  }, 5000) // 5 second timeout
})
