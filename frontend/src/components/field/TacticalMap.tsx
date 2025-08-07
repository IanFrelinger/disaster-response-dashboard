import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Shield } from 'lucide-react'

interface TacticalMapProps {
  currentLocation?: { lat: number; lng: number }
  hazardZones?: Array<{
    id: string
    type: 'fire' | 'flood' | 'earthquake'
    severity: 'low' | 'medium' | 'high' | 'critical'
    coordinates: Array<{ lat: number; lng: number }>
  }>
  safeRoutes?: Array<{
    id: string
    coordinates: Array<{ lat: number; lng: number }>
    distance: number
    duration: number
  }>
  onLocationUpdate?: (location: { lat: number; lng: number }) => void
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  currentLocation,
  hazardZones = [],
  safeRoutes = [],
  onLocationUpdate
}) => {
  const [isTracking, setIsTracking] = useState(false)
  const [mapZoom, setMapZoom] = useState(15)
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null)

  // Mock location tracking
  useEffect(() => {
    if (isTracking && onLocationUpdate) {
      const interval = setInterval(() => {
        // Simulate GPS updates
        const mockLocation = {
          lat: 37.7749 + (Math.random() - 0.5) * 0.01,
          lng: -122.4194 + (Math.random() - 0.5) * 0.01
        }
        onLocationUpdate(mockLocation)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isTracking, onLocationUpdate])

  const getHazardColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-400'
      case 'medium': return 'bg-orange-400'
      case 'high': return 'bg-red-500'
      case 'critical': return 'bg-red-700'
      default: return 'bg-gray-400'
    }
  }

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'fire': return '🔥'
      case 'flood': return '🌊'
      case 'earthquake': return '🌋'
      default: return '⚠️'
    }
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-96">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span className="font-semibold">Tactical Map</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isTracking 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-200'
              }`}
            >
              {isTracking ? 'Tracking' : 'Track'}
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => setMapZoom(Math.max(10, mapZoom - 1))}
                className="w-8 h-8 bg-black bg-opacity-50 rounded flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
                className="w-8 h-8 bg-black bg-opacity-50 rounded flex items-center justify-center"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative h-full bg-gradient-to-br from-blue-900 to-green-900">
        {/* Mock Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-white border-opacity-10" />
            ))}
          </div>
        </div>

        {/* Current Location */}
        {currentLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <MapPin className="w-8 h-8 text-blue-400 drop-shadow-lg" />
              <div className="absolute inset-0 animate-ping">
                <MapPin className="w-8 h-8 text-blue-400 opacity-75" />
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              You are here
            </div>
          </div>
        )}

        {/* Hazard Zones */}
        {hazardZones.map((hazard, index) => (
          <div
            key={hazard.id}
            className={`absolute z-10 cursor-pointer transition-all duration-200 ${
              selectedHazard === hazard.id ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + (index * 10)}%`
            }}
            onClick={() => setSelectedHazard(selectedHazard === hazard.id ? null : hazard.id)}
          >
            <div className={`${getHazardColor(hazard.severity)} rounded-full p-3 shadow-lg`}>
              <span className="text-2xl">{getHazardIcon(hazard.type)}</span>
            </div>
            {selectedHazard === hazard.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black bg-opacity-90 text-white text-xs px-3 py-2 rounded whitespace-nowrap">
                {hazard.type.toUpperCase()} - {hazard.severity}
              </div>
            )}
          </div>
        ))}

        {/* Safe Routes */}
        {safeRoutes.map((route, index) => (
          <div
            key={route.id}
            className="absolute z-5"
            style={{
              left: `${40 + (index * 10)}%`,
              top: `${60 + (index * 5)}%`
            }}
          >
            <div className="bg-green-500 rounded-full p-2 shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>Your Location</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Hazard Zone</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Safe Route</span>
            </div>
          </div>
          <div className="text-gray-400">
            Zoom: {mapZoom}x
          </div>
        </div>
      </div>
    </div>
  )
}
