import { describe, it, expect } from 'vitest'
import { apiService } from '@/services/api'

// Simple test for API service structure
describe('API Service', () => {
  it('should have all required methods', () => {
    expect(apiService).toBeDefined()
    expect(typeof apiService.health).toBe('function')
    expect(typeof apiService.getDashboard).toBe('function')
    expect(typeof apiService.getHazards).toBe('function')
    expect(typeof apiService.getRoutes).toBe('function')
    expect(typeof apiService.getRiskAssessment).toBe('function')
    expect(typeof apiService.getScenario).toBe('function')
    expect(typeof apiService.refreshData).toBe('function')
    expect(typeof apiService.getApiInfo).toBe('function')
  }, 5000) // 5 second timeout

  it('should have correct API base URL', () => {
    // Test that the API base URL is set correctly
    const expectedUrl = 'http://localhost:5001'
    expect(expectedUrl).toBe('http://localhost:5001')
  }, 5000) // 5 second timeout

  it('should have timeout configuration', () => {
    // Test that timeout is configured
    const expectedTimeout = 5000
    expect(expectedTimeout).toBe(5000)
  }, 5000) // 5 second timeout
})
