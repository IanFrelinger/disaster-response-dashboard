import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Shield, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Minimize
} from 'lucide-react'

interface MapLayer {
  id: string
  name: string
  visible: boolean
  color: string
  icon: React.ReactNode
}

interface MapEntity {
  id: string
  type: 'responder' | 'hazard' | 'safe-zone' | 'incident' | 'resource'
  position: { lat: number; lng: number }
  status: 'active' | 'inactive' | 'critical'
  data: any
}

interface CommandTacticalMapProps {
  onEntityClick?: (entity: MapEntity) => void
  onLayerToggle?: (layerId: string, visible: boolean) => void
  onMapAction?: (action: string) => void
}

export const CommandTacticalMap: React.FC<CommandTacticalMapProps> = ({
  onEntityClick,
  onLayerToggle,
  onMapAction
}) => {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [entities, setEntities] = useState<MapEntity[]>([])
  const [selectedLayer] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(12)

  // Initialize map layers
  useEffect(() => {
    const initialLayers: MapLayer[] = [
      {
        id: 'responders',
        name: 'Responders',
        visible: true,
        color: 'blue',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'hazards',
        name: 'Hazards',
        visible: true,
        color: 'red',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        id: 'safe-zones',
        name: 'Safe Zones',
        visible: true,
        color: 'green',
        icon: <Shield className="w-4 h-4" />
      },
      {
        id: 'incidents',
        name: 'Incidents',
        visible: true,
        color: 'orange',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        id: 'resources',
        name: 'Resources',
        visible: false,
        color: 'purple',
        icon: <MapPin className="w-4 h-4" />
      }
    ]
    setLayers(initialLayers)
  }, [])

  // Mock entities data
  useEffect(() => {
    const mockEntities: MapEntity[] = [
      // Responders
      {
        id: 'responder-1',
        type: 'responder',
        position: { lat: 37.7749, lng: -122.4194 },
        status: 'active',
        data: { name: 'Team Alpha', unit: 'Fire', members: 4 }
      },
      {
        id: 'responder-2',
        type: 'responder',
        position: { lat: 37.7849, lng: -122.4094 },
        status: 'active',
        data: { name: 'Team Beta', unit: 'EMS', members: 3 }
      },
      {
        id: 'responder-3',
        type: 'responder',
        position: { lat: 37.7649, lng: -122.4294 },
        status: 'critical',
        data: { name: 'Team Gamma', unit: 'Police', members: 2 }
      },
      // Hazards
      {
        id: 'hazard-1',
        type: 'hazard',
        position: { lat: 37.7749, lng: -122.4194 },
        status: 'critical',
        data: { type: 'Fire', severity: 'high', area: '2.3 sq mi' }
      },
      {
        id: 'hazard-2',
        type: 'hazard',
        position: { lat: 37.7849, lng: -122.4094 },
        status: 'active',
        data: { type: 'Flood', severity: 'medium', area: '1.1 sq mi' }
      },
      // Safe Zones
      {
        id: 'safe-zone-1',
        type: 'safe-zone',
        position: { lat: 37.7649, lng: -122.4294 },
        status: 'active',
        data: { name: 'Community Center', capacity: 500, occupied: 247 }
      },
      {
        id: 'safe-zone-2',
        type: 'safe-zone',
        position: { lat: 37.7949, lng: -122.3994 },
        status: 'active',
        data: { name: 'High School', capacity: 1200, occupied: 892 }
      },
      // Incidents
      {
        id: 'incident-1',
        type: 'incident',
        position: { lat: 37.7749, lng: -122.4194 },
        status: 'critical',
        data: { type: 'Medical Emergency', priority: 'high', eta: '3 min' }
      },
      // Resources
      {
        id: 'resource-1',
        type: 'resource',
        position: { lat: 37.7849, lng: -122.4094 },
        status: 'active',
        data: { type: 'Water Truck', status: 'en route', eta: '8 min' }
      }
    ]
    setEntities(mockEntities)
  }, [])

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
    onLayerToggle?.(layerId, !layers.find(l => l.id === layerId)?.visible)
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'responder': return <Users className="w-4 h-4" />
      case 'hazard': return <AlertTriangle className="w-4 h-4" />
      case 'safe-zone': return <Shield className="w-4 h-4" />
      case 'incident': return <AlertTriangle className="w-4 h-4" />
      case 'resource': return <MapPin className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getEntityColor = (type: string, status: string) => {
    const baseColors = {
      responder: 'blue',
      hazard: 'red',
      'safe-zone': 'green',
      incident: 'orange',
      resource: 'purple'
    }
    
    const statusModifiers = {
      active: '500',
      inactive: '300',
      critical: '700'
    }
    
    return `bg-${baseColors[type as keyof typeof baseColors]}-${statusModifiers[status as keyof typeof statusModifiers]}`
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(20, prev + 1))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(8, prev - 1))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    onMapAction?.(isFullscreen ? 'minimize' : 'maximize')
  }

  const visibleEntities = entities.filter(entity => {
    const layer = layers.find(l => l.id === `${entity.type}s`)
    return layer?.visible
  })

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Tactical Map</h3>
              <p className="text-gray-300 text-sm">
                {visibleEntities.length} entities visible • Zoom: {zoom}x
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-blue-900 to-green-900 h-96">
        {/* Mock Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 grid-rows-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white border-opacity-10" />
            ))}
          </div>
        </div>

        {/* Map Entities */}
        {visibleEntities.map((entity, index) => (
          <div
            key={entity.id}
            onClick={() => onEntityClick?.(entity)}
            className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
              selectedLayer === entity.type ? 'ring-2 ring-white ring-opacity-50' : ''
            }`}
            style={{
              left: `${20 + (index * 8) % 60}%`,
              top: `${30 + (index * 6) % 40}%`
            }}
          >
            <div className={`${getEntityColor(entity.type, entity.status)} rounded-full p-3 shadow-lg text-white`}>
              {getEntityIcon(entity.type)}
            </div>
            
            {/* Entity Label */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {entity.data.name || entity.data.type}
            </div>
          </div>
        ))}

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
          <div className="space-y-2">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center space-x-2 p-2 rounded text-sm transition-colors ${
                  layer.visible 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <div className={`text-${layer.color}-400`}>
                  {layer.icon}
                </div>
                <span>{layer.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Responders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Hazards</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Safe Zones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span>Incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Details Panel */}
      {selectedLayer && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Selected Layer: {selectedLayer}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {visibleEntities
              .filter(entity => entity.type === selectedLayer.replace('s', ''))
              .map(entity => (
                <div key={entity.id} className="bg-white p-3 rounded border">
                  <div className="font-medium">{entity.data.name || entity.data.type}</div>
                  <div className="text-gray-600 text-xs">
                    Status: {entity.status}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
