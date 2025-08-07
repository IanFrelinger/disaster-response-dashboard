import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DashboardData, HazardZone, SafeRoute } from '@/types/api'

interface AppState {
  // Data
  dashboardData: DashboardData | null
  hazards: HazardZone[]
  routes: SafeRoute[]
  
  // UI State
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  setDashboardData: (data: DashboardData) => void
  setHazards: (hazards: HazardZone[]) => void
  setRoutes: (routes: SafeRoute[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      dashboardData: null,
      hazards: [],
      routes: [],
      loading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setDashboardData: (data) => 
        set({ dashboardData: data, lastUpdated: new Date() }),
      
      setHazards: (hazards) => set({ hazards }),
      
      setRoutes: (routes) => set({ routes }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
)
