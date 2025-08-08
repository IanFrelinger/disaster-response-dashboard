import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types for our simplified data structure
export interface Hazard {
  id: string
  type: 'wildfire' | 'flood' | 'earthquake'
  name: string
  severity: 'low' | 'medium' | 'high'
  coordinates: [number, number]
  radius: number
  affected_population: number
  last_updated: string
  status: 'active' | 'monitoring' | 'resolved'
}

export interface Route {
  id: string
  name: string
  start: [number, number]
  end: [number, number]
  distance: number
  duration: number
  status: 'open' | 'closed' | 'congested'
  hazards_avoided: string[]
}

export interface Resource {
  id: string
  type: 'fire_truck' | 'ambulance' | 'police_car' | 'helicopter'
  name: string
  location: [number, number]
  status: 'available' | 'deployed' | 'responding' | 'maintenance'
  capacity: string
  crew: number
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

export interface Metrics {
  total_hazards: number
  active_hazards: number
  total_population_at_risk: number
  available_resources: number
  deployed_resources: number
  open_routes: number
  response_time_avg: number
  evacuation_progress: number
}

export interface DisasterData {
  hazards: Hazard[]
  routes: Route[]
  resources: Resource[]
  metrics: Metrics
  alerts: Alert[]
}

interface AppState {
  // Data
  disasterData: DisasterData | null
  lastUpdated: Date | null
  
  // UI State
  loading: boolean
  error: string | null
  
  // Map State
  mapLayers: {
    hazards: boolean
    routes: boolean
    resources: boolean
    boundaries: boolean
  }
  
  // Actions
  fetchDisasterData: () => Promise<void>
  setDisasterData: (data: DisasterData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  toggleMapLayer: (layer: keyof AppState['mapLayers']) => void
  updateResourceStatus: (resourceId: string, status: Resource['status']) => Promise<void>
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => Promise<void>
}

// Simple API client
const api = {
  async fetchDisasterData(): Promise<DisasterData> {
    const response = await fetch('http://localhost:5001/api/disaster-data')
    if (!response.ok) {
      throw new Error('Failed to fetch disaster data')
    }
    const result = await response.json()
    return result.data
  },
  
  async updateResourceStatus(resourceId: string, status: Resource['status']): Promise<void> {
    const response = await fetch('http://localhost:5001/api/update-resource-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resource_id: resourceId, status }),
    })
    if (!response.ok) {
      throw new Error('Failed to update resource status')
    }
  },
  
  async addAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    const response = await fetch('http://localhost:5001/api/add-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    })
    if (!response.ok) {
      throw new Error('Failed to add alert')
    }
    const result = await response.json()
    return result.alert
  }
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      disasterData: null,
      lastUpdated: null,
      loading: false,
      error: null,
      mapLayers: {
        hazards: true,
        routes: true,
        resources: true,
        boundaries: true,
      },

      // Actions
      fetchDisasterData: async () => {
        set({ loading: true, error: null })
        try {
          const data = await api.fetchDisasterData()
          set({ 
            disasterData: data, 
            lastUpdated: new Date(),
            loading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          })
        }
      },
      
      setDisasterData: (data) => 
        set({ disasterData: data, lastUpdated: new Date() }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      toggleMapLayer: (layer) => {
        const currentLayers = get().mapLayers
        set({
          mapLayers: {
            ...currentLayers,
            [layer]: !currentLayers[layer]
          }
        })
      },
      
      updateResourceStatus: async (resourceId, status) => {
        try {
          await api.updateResourceStatus(resourceId, status)
          // Refresh data after update
          await get().fetchDisasterData()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update resource status'
          })
        }
      },
      
      addAlert: async (alert) => {
        try {
          await api.addAlert(alert)
          // Refresh data after adding alert
          await get().fetchDisasterData()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add alert'
          })
          throw error
        }
      },
    }),
    {
      name: 'disaster-response-store',
    }
  )
)
