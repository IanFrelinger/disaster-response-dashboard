import React, { useState, useEffect, useRef } from 'react'
import { Map, Source, Layer, GeolocateControl } from 'react-map-gl'
import { useAppStore } from '@/stores/useAppStore'
import { AlertBanner } from '@/components/field/AlertBanner'
import { NavigationPanel } from '@/components/field/NavigationPanel'
import { QuickActions } from '@/components/field/QuickActions'
import { ResourceStatus } from '@/components/field/ResourceStatus'
import { VoiceCommand } from '@/components/field/VoiceCommand'
import { Button } from '@/components/common/Button'
import tileService from '@/services/tileService'
import { 
  MapPinIcon,
  SignalIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Mapbox token (in production, use environment variable)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'

interface HazardReport {
  id: string
  type: 'fire' | 'flood' | 'chemical' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: { latitude: number; longitude: number }
  description: string
  reported_at: string
  reporter: string
}

interface NavigationStep {
  instruction: string
  distance: number
  duration: number
  maneuver: string
  coordinates: [number, number]
}

interface CurrentLocation {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
}

export const FieldView: React.FC = () => {
  const { api } = useAppStore()
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 15
  })
  const [mapStyle] = useState(tileService.getDisasterResponseStyle())
  const [tileServerHealthy, setTileServerHealthy] = useState(true)
  
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null)
  const [hazardReports, setHazardReports] = useState<HazardReport[]>([])
  const [navigationRoute] = useState<NavigationStep[]>([])
  const [isNavigating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [signalStrength, setSignalStrength] = useState(4)
  const [batteryLevel] = useState(85)
  const [activeIncident] = useState<string | null>(null)
  const [unitStatus] = useState<'available' | 'en_route' | 'on_scene' | 'returning'>('available')
  const [_crewMembers] = useState([
    { id: '1', name: 'Capt. Rodriguez', status: 'on_duty', role: 'commander' },
    { id: '2', name: 'Lt. Johnson', status: 'on_duty', role: 'driver' },
    { id: '3', name: 'FF Martinez', status: 'on_duty', role: 'firefighter' }
  ])
  
  const mapRef = useRef<any>(null)
  const locationWatchId = useRef<number | null>(null)

  useEffect(() => {
    checkTileServerHealth()
    initializeLocationTracking()
    loadFieldData()
    setupOfflineDetection()
    
    const interval = setInterval(loadFieldData, 15000) // Refresh every 15 seconds
    return () => {
      clearInterval(interval)
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current)
      }
    }
  }, [])

  const checkTileServerHealth = async () => {
    const isHealthy = await tileService.checkHealth()
    setTileServerHealthy(isHealthy)
    if (!isHealthy) {
      toast.error('Tile server unavailable - using fallback map')
    }
  }

  const initializeLocationTracking = () => {
    if ('geolocation' in navigator) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }
          
          setCurrentLocation(newLocation)
          setViewState(prev => ({
            ...prev,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
          }))
          
          // Update position to backend if online
          if (!isOffline) {
            updatePosition(newLocation)
          }
        },
        (error) => {
          console.error('Location error:', error)
          toast.error('Unable to get location')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      )
    }
  }

  const loadFieldData = async () => {
    try {
      if (isOffline) {
        // Load cached data
        loadCachedData()
        return
      }
      
      // Load hazard reports
      const hazardResponse = await api.get('/api/v1/hazards/nearby', {
        params: {
          latitude: currentLocation?.latitude || 37.7749,
          longitude: currentLocation?.longitude || -122.4194,
          radius_km: 10
        }
      })
      setHazardReports(hazardResponse.data.hazards || [])
      
      // Load active incident if assigned
      if (activeIncident) {
        /*
        const _incidentResponse = await api.get(`/api/v1/incidents/${activeIncident}`)
        */
        // Update incident data
      }
      
    } catch (error) {
      console.error('Error loading field data:', error)
      setIsOffline(true)
      loadCachedData()
    }
  }

  const loadCachedData = () => {
    // Load data from localStorage/cache
    const cachedHazards = localStorage.getItem('cached_hazards')
    if (cachedHazards) {
      setHazardReports(JSON.parse(cachedHazards))
    }
  }

  const setupOfflineDetection = () => {
    const handleOnline = () => {
      setIsOffline(false)
      setSignalStrength(4)
      toast.success('Connection restored')
    }
    
    const handleOffline = () => {
      setIsOffline(true)
      setSignalStrength(0)
      toast.error('Connection lost - switching to offline mode')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  const updatePosition = async (location: CurrentLocation) => {
    try {
      await api.post('/api/v1/resources/position', {
        resource_id: 'engine_1', // In production, get from auth context
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      })
    } catch (error) {
      console.error('Error updating position:', error)
    }
  }

  /*
  const _reportHazard = async (hazardData: Omit<HazardReport, 'id' | 'reported_at' | 'reporter'>) => {
    try {
      if (!currentLocation) {
        toast.error('Location not available')
        return
      }
      
      const report = {
        ...hazardData,
        location: currentLocation,
        reporter: 'Engine 1', // In production, get from auth context
        reported_at: new Date().toISOString()
      }
      
      if (!isOffline) {
        // Send to backend
        await api.post('/api/v1/hazards/report', report)
        toast.success('Hazard reported successfully')
      } else {
        // Store locally for later sync
        const offlineReports = JSON.parse(localStorage.getItem('offline_reports') || '[]')
        offlineReports.push(report)
        localStorage.setItem('offline_reports', JSON.stringify(offlineReports))
        toast.success('Hazard saved for later sync')
      }
      
      // Add to local state
      setHazardReports(prev => [{ ...report, id: Date.now().toString() }, ...prev])
      
    } catch (error) {
      console.error('Error reporting hazard:', error)
      toast.error('Failed to report hazard')
    }
  }
  */

  /*
  const _calculateRoute = async (destination: { latitude: number; longitude: number }) => {
    try {
      if (!currentLocation) {
        toast.error('Current location not available')
        return
      }
      
      const routeResponse = await api.post('/api/v1/routes/calculate', {
        origin: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        },
        destination,
        vehicle_type: 'engine',
        priority: 'safest',
        avoid_hazard_types: ['fire', 'flood']
      })
      
      if (routeResponse.data.success) {
        setNavigationRoute(routeResponse.data.steps || [])
        setIsNavigating(true)
        toast.success('Route calculated successfully')
      } else {
        toast.error('No safe route found')
      }
      
    } catch (error) {
      console.error('Error calculating route:', error)
      toast.error('Failed to calculate route')
    }
  }
  */

  /*
  const _updateUnitStatus = async (status: typeof unitStatus) => {
    try {
      setUnitStatus(status)
      
      if (!isOffline) {
        await api.patch('/api/v1/resources/status', {
          resource_id: 'engine_1',
          status,
          timestamp: new Date().toISOString()
        })
      }
      
      toast.success(`Status updated to ${status}`)
      
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }
  */

  /*
  const _handleEmergencyCall = () => {
    // In production, integrate with emergency communication system
    toast.success('Emergency call initiated')
  }

  const _handleBackupRequest = () => {
    // Request backup from nearby units
    toast.success('Backup request sent')
  }
  */

  const getHazardLayerStyle = (hazard: HazardReport) => {
    const severityColors = {
      low: '#ffff00',
      medium: '#ffa500',
      high: '#ff0000',
      critical: '#8b0000'
    }
    
    return {
      id: `hazard-${hazard.id}`,
      type: 'circle' as const,
      paint: {
        'circle-radius': 12,
        'circle-color': severityColors[hazard.severity],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3
      }
    }
  }

  const getCurrentLocationStyle = () => {
    return {
      id: 'current-location',
      type: 'circle' as const,
      paint: {
        'circle-radius': 8,
        'circle-color': '#00ff00',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    }
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Status Bar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <SignalIcon className={`w-4 h-4 ${isOffline ? 'text-red-500' : 'text-green-500'}`} />
            <span className="text-xs">
              {isOffline ? 'OFFLINE' : `${signalStrength}/4`}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 text-green-500">🔋</div>
            <span className="text-xs">{batteryLevel}%</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Engine 1</span>
          <div className={`w-2 h-2 rounded-full ${
            unitStatus === 'available' ? 'bg-green-500' :
            unitStatus === 'en_route' ? 'bg-yellow-500' :
            unitStatus === 'on_scene' ? 'bg-red-500' :
            'bg-blue-500'
          }`}></div>
        </div>
      </div>

      {/* Alert Banner */}
      {activeIncident && (
        <AlertBanner />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Map View */}
        <div className="flex-1 relative">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle={tileServerHealthy ? mapStyle : "mapbox://styles/mapbox/dark-v11"}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <GeolocateControl position="top-right" />
            
            {/* Current Location */}
            {currentLocation && (
              <Source
                type="geojson"
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [currentLocation.longitude, currentLocation.latitude]
                  },
                  properties: {}
                }}
              >
                <Layer {...getCurrentLocationStyle()} />
              </Source>
            )}
            
            {/* Hazard Reports */}
            {hazardReports.map(hazard => (
              <Source
                key={hazard.id}
                type="geojson"
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [hazard.location.longitude, hazard.location.latitude]
                  },
                  properties: hazard
                }}
              >
                <Layer {...getHazardLayerStyle(hazard)} />
              </Source>
            ))}
          </Map>
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (currentLocation) {
                  setViewState(prev => ({
                    ...prev,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    zoom: 15
                  }))
                }
              }}
            >
              <div className="w-4 h-4">📍</div>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Toggle map layers
                toast.success('Map layers toggled')
              }}
            >
              <MapPinIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Panel */}
        {isNavigating && navigationRoute.length > 0 && (
          <NavigationPanel />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Resource Status */}
        <ResourceStatus />
      </div>

      {/* Voice Command */}
      <VoiceCommand />
    </div>
  )
}
