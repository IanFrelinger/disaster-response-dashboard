import axios from 'axios'
import type { DashboardData, HazardZone, SafeRoute, RiskAssessment, ApiResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const apiService = {
  // Health check
  health: () => api.get<ApiResponse<{ status: string; service: string }>>('/api/health'),

  // Dashboard data
  getDashboard: () => api.get<ApiResponse<DashboardData>>('/api/dashboard'),

  // Hazard zones
  getHazards: (count?: number) => 
    api.get<ApiResponse<HazardZone[]>>('/api/hazards', {
      params: { count }
    }),

  // Safe routes
  getRoutes: (count?: number) => 
    api.get<ApiResponse<SafeRoute[]>>('/api/routes', {
      params: { count }
    }),

  // Risk assessment
  getRiskAssessment: (lat: number, lng: number) => 
    api.get<ApiResponse<RiskAssessment>>('/api/risk-assessment', {
      params: { lat, lng }
    }),

  // Scenario data
  getScenario: (scenarioId: string) => 
    api.get<ApiResponse<any>>(`/api/scenario/${scenarioId}`),

  // Refresh data
  refreshData: () => api.post<ApiResponse<DashboardData>>('/api/refresh'),

  // API info
  getApiInfo: () => api.get<ApiResponse<any>>('/api/info'),
}

export default api
