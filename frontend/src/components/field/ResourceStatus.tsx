import React, { useState } from 'react'
import { 
  Activity, 
  Battery, 
  Signal, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Resource {
  id: string
  name: string
  type: 'vehicle' | 'equipment' | 'communication' | 'medical'
  status: 'operational' | 'warning' | 'critical' | 'offline'
  battery?: number
  signal?: number
  temperature?: number
  humidity?: number
  lastUpdate: Date
  location?: { lat: number; lng: number }
}

interface ResourceStatusProps {
  resources?: Resource[]
  onResourceSelect?: (resource: Resource) => void
  onRequestMaintenance?: (resourceId: string) => void
}

export const ResourceStatus: React.FC<ResourceStatusProps> = ({
  resources = [],
  onResourceSelect,
  onRequestMaintenance
}) => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  // Mock resource data
  const mockResources: Resource[] = [
    {
      id: 'vehicle-1',
      name: 'Response Vehicle Alpha',
      type: 'vehicle',
      status: 'operational',
      battery: 85,
      temperature: 72,
      lastUpdate: new Date()
    },
    {
      id: 'equipment-1',
      name: 'Thermal Camera',
      type: 'equipment',
      status: 'warning',
      battery: 45,
      temperature: 68,
      lastUpdate: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: 'comm-1',
      name: 'Satellite Phone',
      type: 'communication',
      status: 'operational',
      battery: 92,
      signal: 4,
      lastUpdate: new Date()
    },
    {
      id: 'medical-1',
      name: 'Defibrillator',
      type: 'medical',
      status: 'critical',
      battery: 15,
      temperature: 75,
      lastUpdate: new Date(Date.now() - 600000) // 10 minutes ago
    },
    {
      id: 'vehicle-2',
      name: 'Support Vehicle Beta',
      type: 'vehicle',
      status: 'offline',
      battery: 0,
      lastUpdate: new Date(Date.now() - 1800000) // 30 minutes ago
    }
  ]

  const allResources = resources.length > 0 ? resources : mockResources
  const filteredResources = filterType === 'all' 
    ? allResources 
    : allResources.filter(r => r.type === filterType)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      case 'offline': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'offline': return <Clock className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return '🚗'
      case 'equipment': return '🔧'
      case 'communication': return '📡'
      case 'medical': return '🏥'
      default: return '📱'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Resource Status</h3>
              <p className="text-blue-100 text-sm">
                {filteredResources.length} resources monitored
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-50 p-3">
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'vehicle', 'equipment', 'communication', 'medical'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedResource === resource.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedResource(resource.id)
              if (onResourceSelect) {
                onResourceSelect(resource)
              }
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="text-2xl">{getTypeIcon(resource.type)}</div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">
                    {resource.name}
                  </h4>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                    {getStatusIcon(resource.status)}
                    <span className="capitalize">{resource.status}</span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  {resource.battery !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Battery className="w-4 h-4" />
                      <span>{resource.battery}%</span>
                    </div>
                  )}
                  
                  {resource.signal !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Signal className="w-4 h-4" />
                      <span>{resource.signal}/5</span>
                    </div>
                  )}
                  
                  {resource.temperature !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4" />
                      <span>{resource.temperature}°F</span>
                    </div>
                  )}
                  
                  {resource.humidity !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-4 h-4" />
                      <span>{resource.humidity}%</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Last update: {formatTimeAgo(resource.lastUpdate)}</span>
                  {resource.status === 'critical' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onRequestMaintenance) {
                          onRequestMaintenance(resource.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Request Maintenance
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {allResources.filter(r => r.status === 'operational').length}
            </div>
            <div className="text-gray-600">Operational</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {allResources.filter(r => r.status === 'critical').length}
            </div>
            <div className="text-gray-600">Critical</div>
          </div>
        </div>
      </div>
    </div>
  )
}
