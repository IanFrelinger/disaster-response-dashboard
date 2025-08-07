import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Activity,
  Eye,
  EyeOff
} from 'lucide-react'

interface Metric {
  id: string
  title: string
  value: number | string
  unit?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  status?: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
  category: 'response' | 'resources' | 'safety' | 'communication'
}

interface MetricsGridProps {
  onMetricClick?: (metric: Metric) => void
  onRefresh?: () => void
  autoRefresh?: boolean
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  onMetricClick,
  onRefresh,
  autoRefresh = true
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Mock metrics data
  const mockMetrics: Metric[] = [
    {
      id: 'active-responders',
      title: 'Active Responders',
      value: 47,
      change: 3,
      changeType: 'increase',
      status: 'good',
      icon: <Users className="w-5 h-5" />,
      category: 'response'
    },
    {
      id: 'hazard-zones',
      title: 'Active Hazards',
      value: 8,
      change: -2,
      changeType: 'decrease',
      status: 'warning',
      icon: <AlertTriangle className="w-5 h-5" />,
      category: 'safety'
    },
    {
      id: 'safe-zones',
      title: 'Safe Zones',
      value: 12,
      change: 1,
      changeType: 'increase',
      status: 'good',
      icon: <Shield className="w-5 h-5" />,
      category: 'safety'
    },
    {
      id: 'response-time',
      title: 'Avg Response Time',
      value: '4.2',
      unit: 'min',
      change: -0.8,
      changeType: 'decrease',
      status: 'good',
      icon: <Clock className="w-5 h-5" />,
      category: 'response'
    },
    {
      id: 'resources-available',
      title: 'Resources Available',
      value: 85,
      unit: '%',
      change: 5,
      changeType: 'increase',
      status: 'good',
      icon: <Activity className="w-5 h-5" />,
      category: 'resources'
    },
    {
      id: 'communications',
      title: 'Comms Status',
      value: 'Operational',
      change: 0,
      changeType: 'neutral',
      status: 'good',
      icon: <Activity className="w-5 h-5" />,
      category: 'communication'
    },
    {
      id: 'evacuations',
      title: 'Evacuations',
      value: 1247,
      change: 23,
      changeType: 'increase',
      status: 'warning',
      icon: <MapPin className="w-5 h-5" />,
      category: 'response'
    },
    {
      id: 'incidents',
      title: 'Active Incidents',
      value: 3,
      change: -1,
      changeType: 'decrease',
      status: 'good',
      icon: <AlertTriangle className="w-5 h-5" />,
      category: 'response'
    }
  ]

  useEffect(() => {
    setMetrics(mockMetrics)
  }, [])

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      updateMetrics()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const updateMetrics = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        value: typeof metric.value === 'number' 
          ? metric.value + Math.floor(Math.random() * 10) - 5
          : metric.value,
        change: Math.floor(Math.random() * 10) - 5
      }))
      setMetrics(updatedMetrics)
      setIsLoading(false)
    }, 1000)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4" />
      case 'decrease': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'response': return 'border-blue-500 bg-blue-50'
      case 'resources': return 'border-green-500 bg-green-50'
      case 'safety': return 'border-yellow-500 bg-yellow-50'
      case 'communication': return 'border-purple-500 bg-purple-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const handleRefresh = () => {
    updateMetrics()
    onRefresh?.()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Real-Time Metrics</h3>
              <p className="text-gray-300 text-sm">
                {metrics.length} KPIs monitored • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              onClick={() => onMetricClick?.(metric)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getCategoryColor(metric.category)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-gray-600">
                      {metric.icon}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {metric.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-sm text-gray-500">
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  {metric.change !== undefined && (
                    <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(metric.changeType)}`}>
                      {getChangeIcon(metric.changeType)}
                      <span className="text-sm font-medium">
                        {metric.change > 0 ? '+' : ''}{metric.change}
                      </span>
                    </div>
                  )}
                </div>

                {showDetails && (
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {metrics.filter(m => m.status === 'good').length}
            </div>
            <div className="text-xs text-gray-600">Good</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-xs text-gray-600">Warning</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {metrics.filter(m => m.status === 'critical').length}
            </div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {metrics.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
