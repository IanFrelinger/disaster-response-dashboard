import React, { useState, useEffect } from 'react'
import { Map, Source, Layer, NavigationControl } from 'react-map-gl'
import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/common/Button'
import tileService from '@/services/tileService'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  UserGroupIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface SafetyStatus {
  status: 'SAFE' | 'PREPARE' | 'EVACUATE'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  nearby_hazards: Array<{
    type: string
    distance_km: number
    direction: string
    risk_level: string
  }>
  messages: {
    en: { title: string; body: string; action: string }
    es: { title: string; body: string; action: string }
    zh: { title: string; body: string; action: string }
  }
  last_updated: string
}

interface FamilyMember {
  id: string
  name: string
  status: 'safe' | 'checking_in' | 'missing' | 'evacuated'
  location?: string
  last_seen?: string
  phone?: string
}

interface EmergencyShelter {
  id: string
  name: string
  address: string
  distance_km: number
  capacity: number
  available_capacity: number
  coordinates: [number, number]
}

interface EvacuationRoute {
  id: string
  name: string
  distance_km: number
  estimated_time_min: number
  status: 'open' | 'congested' | 'closed'
  instructions: string[]
}

export const PublicView: React.FC = () => {
  const { api } = useAppStore()
  const [currentAddress, setCurrentAddress] = useState('')
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [nearbyShelters, setNearbyShelters] = useState<EmergencyShelter[]>([])
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'zh'>('en')
  const [, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 12
  })
  const [mapStyle] = useState(tileService.getDisasterResponseStyle())
  const [tileServerHealthy, setTileServerHealthy] = useState(true)

  useEffect(() => {
    checkTileServerHealth()
    initializeLocation()
    loadPublicData()
    
    const interval = setInterval(loadPublicData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [userLocation])

  const checkTileServerHealth = async () => {
    const isHealthy = await tileService.checkHealth()
    setTileServerHealthy(isHealthy)
    if (!isHealthy) {
      toast.error('Tile server unavailable - using fallback map')
    }
  }

  const initializeLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setUserLocation(location)
          
          // Reverse geocode to get address
          reverseGeocode(location)
        },
        (error) => {
          console.error('Location error:', error)
          // Use default location (San Francisco)
          setUserLocation({ latitude: 37.7749, longitude: -122.4194 })
          setCurrentAddress('San Francisco, CA')
        }
      )
    }
  }

  const reverseGeocode = async (_location: { latitude: number; longitude: number }) => {
    try {
      // In production, use a proper geocoding service
      // For now, use a mock response
      setCurrentAddress('123 Main St, San Francisco, CA')
    } catch (error) {
      console.error('Geocoding error:', error)
      setCurrentAddress('San Francisco, CA')
    }
  }

  const loadPublicData = async () => {
    try {
      setIsLoading(true)
      
      if (!userLocation) return
      
      // Load safety status
      const statusResponse = await api.get('/api/public/status', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      })
      setSafetyStatus(statusResponse.data)
      
      // Load nearby shelters
      const shelterResponse = await api.get('/api/public/shelters/nearby', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_km: 20
        }
      })
      setNearbyShelters(shelterResponse.data.shelters || [])
      
      // Load evacuation routes if evacuation is active
      if (statusResponse.data.status === 'EVACUATE') {
        const routeResponse = await api.get('/api/public/routes/evacuation', {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        })
        setEvacuationRoutes(routeResponse.data.routes || [])
      }
      
    } catch (error) {
      console.error('Error loading public data:', error)
      toast.error('Failed to load safety information')
    } finally {
      setIsLoading(false)
    }
  }

  const checkInFamilyMember = async (memberId: string) => {
    try {
      await api.post('/api/public/family/checkin', {
        member_id: memberId,
        location: currentAddress,
        timestamp: new Date().toISOString()
      })
      
      setFamilyMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, status: 'safe', last_seen: new Date().toISOString() }
            : member
        )
      )
      
      toast.success('Family member checked in successfully')
      
    } catch (error) {
      console.error('Error checking in family member:', error)
      toast.error('Failed to check in family member')
    }
  }

  const reportMissingFamilyMember = async (memberId: string) => {
    try {
      await api.post('/api/public/family/missing', {
        member_id: memberId,
        reported_at: new Date().toISOString()
      })
      
      setFamilyMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, status: 'missing' }
            : member
        )
      )
      
      toast.success('Missing person report submitted')
      
    } catch (error) {
      console.error('Error reporting missing family member:', error)
      toast.error('Failed to submit missing person report')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAFE': return 'bg-green-500'
      case 'PREPARE': return 'bg-yellow-500'
      case 'EVACUATE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SAFE': return <ShieldCheckIcon className="w-6 h-6" />
      case 'PREPARE': return <InformationCircleIcon className="w-6 h-6" />
      case 'EVACUATE': return <ExclamationTriangleIcon className="w-6 h-6" />
      default: return <InformationCircleIcon className="w-6 h-6" />
    }
  }

  const getFamilyStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'checking_in': return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'missing': return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'evacuated': return <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getRouteStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600'
      case 'congested': return 'text-yellow-600'
      case 'closed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emergency Response Dashboard</h1>
                <p className="text-sm text-gray-600">Public Safety Information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'es' | 'zh')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Location Display */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Your Location:</span>
            <span className="font-medium">{currentAddress || 'Detecting location...'}</span>
          </div>
        </div>

        {/* Map View */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Map</h3>
              <p className="text-sm text-gray-600">View hazards, shelters, and evacuation routes</p>
            </div>
            <div className="h-96 relative">
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={tileServerHealthy ? mapStyle : "mapbox://styles/mapbox/light-v11"}
                mapboxAccessToken="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-right" />
                
                {/* User Location */}
                {userLocation && (
                  <Source
                    type="geojson"
                    data={{
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [userLocation.longitude, userLocation.latitude]
                      },
                      properties: { type: 'user_location' }
                    }}
                  >
                    <Layer
                      id="user-location"
                      type="circle"
                      paint={{
                        'circle-radius': 8,
                        'circle-color': '#3b82f6',
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 2
                      }}
                    />
                  </Source>
                )}

                {/* Nearby Shelters */}
                {nearbyShelters.map(shelter => (
                  <Source
                    key={shelter.id}
                    type="geojson"
                    data={{
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: shelter.coordinates
                      },
                      properties: shelter
                    }}
                  >
                    <Layer
                      id={`shelter-${shelter.id}`}
                      type="circle"
                      paint={{
                        'circle-radius': 6,
                        'circle-color': '#10b981',
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 2
                      }}
                    />
                  </Source>
                ))}

                {/* Evacuation Routes */}
                {evacuationRoutes.map(route => (
                  <Source
                    key={route.id}
                    type="geojson"
                    data={{
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: [
                          [userLocation?.longitude || -122.4194, userLocation?.latitude || 37.7749],
                          [userLocation?.longitude || -122.4194 + 0.01, userLocation?.latitude || 37.7749 + 0.01]
                        ]
                      },
                      properties: route
                    }}
                  >
                    <Layer
                      id={`route-${route.id}`}
                      type="line"
                      paint={{
                        'line-color': route.status === 'open' ? '#10b981' : route.status === 'congested' ? '#f59e0b' : '#ef4444',
                        'line-width': 3,
                        'line-dasharray': [2, 2]
                      }}
                    />
                  </Source>
                ))}
              </Map>
            </div>
          </div>
        </div>

        {/* Safety Status Card */}
        {safetyStatus && (
          <div className="mb-6">
            <div className={`p-6 rounded-lg shadow-sm border-l-4 ${getStatusColor(safetyStatus.status)} border-l-4`}>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${getStatusColor(safetyStatus.status)} bg-opacity-10`}>
                  {getStatusIcon(safetyStatus.status)}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {safetyStatus.messages[selectedLanguage].title}
                  </h2>
                  
                  <p className="text-gray-700 mb-4">
                    {safetyStatus.messages[selectedLanguage].body}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={safetyStatus.status === 'EVACUATE' ? 'danger' : 'primary'}
                      size="md"
                      onClick={() => {
                        if (safetyStatus.status === 'EVACUATE') {
                          // Show evacuation routes
                          toast.success('Showing evacuation routes')
                        } else {
                          // Show more information
                          toast.success('Showing detailed information')
                        }
                      }}
                    >
                      {safetyStatus.messages[selectedLanguage].action}
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(safetyStatus.last_updated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Hazards */}
        {safetyStatus?.nearby_hazards && safetyStatus.nearby_hazards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nearby Hazards</h3>
            <div className="grid gap-3">
              {safetyStatus.nearby_hazards.map((hazard, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{hazard.type}</div>
                      <div className="text-sm text-gray-600">
                        {hazard.distance_km}km {hazard.direction} • Risk: {hazard.risk_level}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hazard.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                      hazard.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hazard.risk_level.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Tracker */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Family Safety Tracker
          </h3>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {familyMembers.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No family members added yet</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Add family member modal
                    toast.success('Add family member modal')
                  }}
                >
                  Add Family Member
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFamilyStatusIcon(member.status)}
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">
                          {member.status === 'safe' && member.location && `Safe at ${member.location}`}
                          {member.status === 'checking_in' && 'Checking in...'}
                          {member.status === 'missing' && 'Missing - please report'}
                          {member.status === 'evacuated' && 'Evacuated to shelter'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {member.status === 'missing' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => reportMissingFamilyMember(member.id)}
                        >
                          Report Missing
                        </Button>
                      )}
                      
                      {member.status !== 'safe' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => checkInFamilyMember(member.id)}
                        >
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Shelters */}
        {nearbyShelters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Shelters</h3>
            <div className="grid gap-3">
              {nearbyShelters.slice(0, 3).map((shelter) => (
                <div key={shelter.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{shelter.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{shelter.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{shelter.distance_km}km away</span>
                        <span>Capacity: {shelter.available_capacity}/{shelter.capacity}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Get directions to shelter
                        toast.success(`Getting directions to ${shelter.name}`)
                      }}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evacuation Routes */}
        {evacuationRoutes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Evacuation Routes</h3>
            <div className="grid gap-3">
              {evacuationRoutes.map((route) => (
                <div key={route.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{route.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{route.distance_km}km</span>
                        <span>{route.estimated_time_min} min</span>
                        <span className={`font-medium ${getRouteStatusColor(route.status)}`}>
                          {route.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        // Start navigation
                        toast.success(`Starting navigation via ${route.name}`)
                      }}
                    >
                      Start Navigation
                    </Button>
                  </div>
                  
                  {route.instructions.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {route.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 font-medium">{index + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">Emergency Services</div>
                  <div className="text-sm text-gray-600">911</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Emergency Management</div>
                  <div className="text-sm text-gray-600">(555) 123-4567</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-500">
          <p>This information is updated every 30 seconds</p>
          <p className="mt-1">
            For the most current information, listen to local emergency broadcasts
          </p>
        </div>
      </div>
    </div>
  )
}
