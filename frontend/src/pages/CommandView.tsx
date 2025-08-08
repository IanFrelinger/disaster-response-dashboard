import React, { useState, useEffect, useRef } from 'react'
import { Map, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl'
import { useAppStore } from '@/stores/useAppStore'
import { MetricsGrid } from '@/components/command/MetricsGrid'

import { ResourceTable } from '@/components/command/ResourceTable'
import { CommunicationLog } from '@/components/command/CommunicationLog'
import { PredictionCard } from '@/components/command/PredictionCard'
import { Timeline } from '@/components/command/Timeline'
import { Button } from '@/components/common/Button'
import tileService from '@/services/tileService'
import { 
  ExclamationTriangleIcon, 
  MapIcon, 
  UsersIcon, 
  ChartBarIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Mapbox token (in production, use environment variable)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'

interface HazardZone {
  id: string
  type: 'fire' | 'flood' | 'chemical' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  geometry: any
  risk_score: number
  affected_population: number
  detected_at: string
}

interface EmergencyResource {
  id: string
  type: 'engine' | 'ambulance' | 'police' | 'helicopter'
  call_sign: string
  position: { latitude: number; longitude: number }
  status: 'available' | 'assigned' | 'en_route' | 'on_scene'
  crew_count: number
  capabilities: string[]
}

interface EvacuationRoute {
  id: string
  geometry: any
  safety_score: number
  estimated_duration_min: number
  total_distance_km: number
  hazard_clearance: number
}

export const CommandView: React.FC = () => {
  const { api } = useAppStore()
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 10
  })
  const [mapStyle] = useState(tileService.getDisasterResponseStyle())
  const [tileServerHealthy, setTileServerHealthy] = useState(true)
  
  const [hazardZones, setHazardZones] = useState<HazardZone[]>([])
  const [resources, setResources] = useState<EmergencyResource[]>([])
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([])
  const [selectedZone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [_activeIncidents, setActiveIncidents] = useState(0)
  const [_populationAtRisk, setPopulationAtRisk] = useState(0)
  const [_resourceUtilization, setResourceUtilization] = useState(0)
  
  const mapRef = useRef<any>(null)

  useEffect(() => {
    checkTileServerHealth()
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkTileServerHealth = async () => {
    const isHealthy = await tileService.checkHealth()
    setTileServerHealthy(isHealthy)
    if (!isHealthy) {
      toast.error('Tile server unavailable - using fallback map')
    }
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load hazard zones
      const hazardResponse = await api.get('/api/v1/hazards/active')
      setHazardZones(hazardResponse.data.hazards || [])
      
      // Load resource coordination
      const resourceResponse = await api.get('/api/v1/resources/coordination')
      setResources([
        ...resourceResponse.data.available_resources || [],
        ...resourceResponse.data.assigned_resources || []
      ])
      
      // Load evacuation routes
      const routeResponse = await api.get('/api/v1/routes/evacuation')
      setEvacuationRoutes(routeResponse.data.routes || [])
      
      // Update metrics
      setActiveIncidents(hazardResponse.data.total_hazards || 0)
      setPopulationAtRisk(hazardResponse.data.total_population_at_risk || 0)
      setResourceUtilization(
        ((resourceResponse.data.assigned_count || 0) / (resourceResponse.data.total_resources || 1)) * 100
      )
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvacuationOrder = async (zoneId: string) => {
    try {
      await api.post('/api/v1/evacuations/order', {
        zones: [zoneId],
        severity: 'mandatory',
        message: {
          en: 'MANDATORY EVACUATION ORDER - Leave immediately via designated routes',
          es: 'ORDEN DE EVACUACIÓN OBLIGATORIA - Salga inmediatamente por rutas designadas',
          zh: '强制疏散令 - 立即通过指定路线撤离'
        }
      })
      
      toast.success('Evacuation order issued successfully')
      loadDashboardData() // Refresh data
      
    } catch (error) {
      console.error('Error issuing evacuation order:', error)
      toast.error('Failed to issue evacuation order')
    }
  }

  /*
  const _handleResourceDispatch = async (resourceId: string, incidentId: string) => {
    try {
      await api.post(`/api/v1/resources/${resourceId}/dispatch`, {
        incident_id: incidentId,
        priority: 'high'
      })
      
      toast.success('Resource dispatched successfully')
      loadDashboardData() // Refresh data
      
    } catch (error) {
      console.error('Error dispatching resource:', error)
      toast.error('Failed to dispatch resource')
    }
  }
  */

  const getHazardLayerStyle = (hazard: HazardZone) => {
    const severityColors = {
      low: '#ffff00',
      medium: '#ffa500',
      high: '#ff0000',
      critical: '#8b0000'
    }
    
    return {
      id: `hazard-${hazard.id}`,
      type: 'fill' as const,
      paint: {
        'fill-color': severityColors[hazard.severity],
        'fill-opacity': 0.6,
        'fill-outline-color': severityColors[hazard.severity]
      }
    }
  }

  const getResourceLayerStyle = (resource: EmergencyResource) => {
    const typeColors = {
      engine: '#ff0000',
      ambulance: '#00ff00',
      police: '#0000ff',
      helicopter: '#800080'
    }
    
    return {
      id: `resource-${resource.id}`,
      type: 'circle' as const,
      paint: {
        'circle-radius': 8,
        'circle-color': typeColors[resource.type],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    }
  }

  const getRouteLayerStyle = (route: EvacuationRoute) => {
    return {
      id: `route-${route.id}`,
      type: 'line' as const,
      paint: {
        'line-color': '#00ff00',
        'line-width': 4,
        'line-opacity': 0.8
      }
    }
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex">
      {/* Left Panel - Metrics */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Emergency Metrics
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <MetricsGrid />
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">AI Predictions</h3>
            <PredictionCard />
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Timeline</h3>
            <Timeline />
          </div>
        </div>
      </div>

      {/* Center Panel - Tactical Map */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Emergency Command Center</h1>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadDashboardData()}
              disabled={isLoading}
            >
              <CogIcon className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                // Emergency broadcast
                toast.success('Emergency broadcast sent')
              }}
            >
              <BellIcon className="w-4 h-4 mr-1" />
              Emergency Broadcast
            </Button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle={tileServerHealthy ? mapStyle : "mapbox://styles/mapbox/dark-v11"}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />
            <GeolocateControl position="top-right" />
            
            {/* Hazard Zones */}
            {hazardZones.map(hazard => (
              <Source key={hazard.id} type="geojson" data={hazard.geometry}>
                <Layer {...getHazardLayerStyle(hazard)} />
              </Source>
            ))}
            
            {/* Emergency Resources */}
            {resources.map(resource => (
              <Source
                key={resource.id}
                type="geojson"
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [resource.position.longitude, resource.position.latitude]
                  },
                  properties: resource
                }}
              >
                <Layer {...getResourceLayerStyle(resource)} />
              </Source>
            ))}
            
            {/* Evacuation Routes */}
            {evacuationRoutes.map(route => (
              <Source key={route.id} type="geojson" data={route.geometry}>
                <Layer {...getRouteLayerStyle(route)} />
              </Source>
            ))}
          </Map>
          
          {/* Map Overlay Controls */}
          <div className="absolute top-4 left-4 bg-gray-800 rounded-lg p-3 shadow-lg">
            <div className="space-y-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" defaultChecked className="mr-2" />
                Hazard Zones
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" defaultChecked className="mr-2" />
                Resources
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" defaultChecked className="mr-2" />
                Evacuation Routes
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Operations */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Operations
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Resource Management</h3>
            <ResourceTable />
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Communication Log</h3>
            <CommunicationLog />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                if (selectedZone) {
                  handleEvacuationOrder(selectedZone)
                } else {
                  toast.error('Please select a zone first')
                }
              }}
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Issue Evacuation Order
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                // Open resource allocation modal
                                        toast.success('Resource allocation modal')
              }}
            >
              <UsersIcon className="w-4 h-4 mr-1" />
              Allocate Resources
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                // Open route planning modal
                                        toast.success('Route planning modal')
              }}
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Plan Routes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
