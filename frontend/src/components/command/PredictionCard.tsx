import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users,
  Activity,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface Prediction {
  id: string
  type: 'fire-spread' | 'evacuation' | 'resource-need' | 'weather' | 'traffic' | 'medical'
  title: string
  description: string
  confidence: number
  timeframe: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'expired' | 'confirmed' | 'false-alarm'
  timestamp: Date
  location?: string
  recommendations: string[]
  dataPoints: number
}

interface PredictionCardProps {
  onPredictionClick?: (prediction: Prediction) => void
  onRefresh?: () => void
  onExport?: () => void
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  onPredictionClick,
  onRefresh,
  onExport
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')

  // Mock prediction data
  const mockPredictions: Prediction[] = [
    {
      id: 'pred-1',
      type: 'fire-spread',
      title: 'Fire Spread Prediction',
      description: 'Based on current wind patterns and fuel conditions, fire expected to reach downtown within 2 hours.',
      confidence: 87,
      timeframe: '2 hours',
      impact: 'critical',
      status: 'active',
      timestamp: new Date(),
      location: 'Downtown Sector',
      recommendations: [
        'Evacuate downtown area immediately',
        'Deploy additional fire suppression resources',
        'Establish containment line at Main Street'
      ],
      dataPoints: 1247
    },
    {
      id: 'pred-2',
      type: 'evacuation',
      title: 'Evacuation Route Congestion',
      description: 'High probability of traffic congestion on Highway 101 within 30 minutes.',
      confidence: 92,
      timeframe: '30 minutes',
      impact: 'high',
      status: 'active',
      timestamp: new Date(Date.now() - 300000),
      location: 'Highway 101',
      recommendations: [
        'Activate alternative evacuation routes',
        'Deploy traffic control units',
        'Issue public alert for route changes'
      ],
      dataPoints: 892
    },
    {
      id: 'pred-3',
      type: 'resource-need',
      title: 'Medical Resource Shortage',
      description: 'Predicted shortage of medical supplies at Community Center shelter within 1 hour.',
      confidence: 78,
      timeframe: '1 hour',
      impact: 'high',
      status: 'active',
      timestamp: new Date(Date.now() - 600000),
      location: 'Community Center',
      recommendations: [
        'Dispatch additional medical supplies',
        'Coordinate with neighboring hospitals',
        'Prioritize critical care resources'
      ],
      dataPoints: 456
    },
    {
      id: 'pred-4',
      type: 'weather',
      title: 'Weather Pattern Change',
      description: 'Wind direction expected to shift from NW to SW, affecting fire spread pattern.',
      confidence: 85,
      timeframe: '45 minutes',
      impact: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 900000),
      location: 'All Sectors',
      recommendations: [
        'Adjust fire containment strategy',
        'Update evacuation plans',
        'Monitor wind speed changes'
      ],
      dataPoints: 234
    },
    {
      id: 'pred-5',
      type: 'traffic',
      title: 'Emergency Vehicle Routing',
      description: 'Optimal routes for emergency vehicles identified based on current traffic conditions.',
      confidence: 94,
      timeframe: '15 minutes',
      impact: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 1200000),
      location: 'City-wide',
      recommendations: [
        'Update GPS routing for all emergency vehicles',
        'Coordinate with traffic management center',
        'Communicate route changes to field units'
      ],
      dataPoints: 567
    },
    {
      id: 'pred-6',
      type: 'medical',
      title: 'Medical Surge Prediction',
      description: 'Expected increase in medical emergencies requiring immediate attention.',
      confidence: 81,
      timeframe: '1.5 hours',
      impact: 'high',
      status: 'active',
      timestamp: new Date(Date.now() - 1500000),
      location: 'All Medical Facilities',
      recommendations: [
        'Activate additional medical staff',
        'Prepare emergency room capacity',
        'Coordinate with air medical services'
      ],
      dataPoints: 345
    }
  ]

  useEffect(() => {
    setPredictions(mockPredictions)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Update predictions with new data
      const updatedPredictions = predictions.map(pred => ({
        ...pred,
        confidence: Math.max(50, Math.min(100, pred.confidence + (Math.random() - 0.5) * 10)),
        dataPoints: pred.dataPoints + Math.floor(Math.random() * 50)
      }))
      setPredictions(updatedPredictions)
      setIsLoading(false)
      onRefresh?.()
    }, 2000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fire-spread': return <AlertTriangle className="w-4 h-4" />
      case 'evacuation': return <Users className="w-4 h-4" />
      case 'resource-need': return <Activity className="w-4 h-4" />
      case 'weather': return <TrendingUp className="w-4 h-4" />
      case 'traffic': return <MapPin className="w-4 h-4" />
      case 'medical': return <CheckCircle className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fire-spread': return 'text-red-600 bg-red-100'
      case 'evacuation': return 'text-orange-600 bg-orange-100'
      case 'resource-need': return 'text-blue-600 bg-blue-100'
      case 'weather': return 'text-purple-600 bg-purple-100'
      case 'traffic': return 'text-green-600 bg-green-100'
      case 'medical': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 80) return 'text-blue-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'false-alarm': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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

  const filteredPredictions = selectedType === 'all' 
    ? predictions 
    : predictions.filter(p => p.type === selectedType)

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">AI Predictions</h3>
              <p className="text-gray-300 text-sm">
                {filteredPredictions.length} active predictions • Real-time analytics
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
              className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onExport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Types
          </button>
          {['fire-spread', 'evacuation', 'resource-need', 'weather', 'traffic', 'medical'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              onClick={() => onPredictionClick?.(prediction)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(prediction.type)}`}>
                    {getTypeIcon(prediction.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{prediction.title}</h4>
                    <p className="text-sm text-gray-500">{prediction.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3">{prediction.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{prediction.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span>{prediction.dataPoints} data points</span>
                  </div>
                </div>
                <span className={formatTimeAgo(prediction.timestamp)}>
                  {formatTimeAgo(prediction.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                    {prediction.impact.toUpperCase()} IMPACT
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prediction.status)}`}>
                    {prediction.status}
                  </span>
                </div>
              </div>

              {showDetails && prediction.recommendations && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {prediction.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                    {prediction.recommendations.length > 2 && (
                      <li className="text-xs text-gray-500">
                        +{prediction.recommendations.length - 2} more recommendations
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {predictions.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {predictions.filter(p => p.confidence >= 90).length}
            </div>
            <div className="text-gray-600">High Confidence</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {predictions.filter(p => p.impact === 'critical').length}
            </div>
            <div className="text-gray-600">Critical Impact</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {predictions.reduce((sum, p) => sum + p.dataPoints, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Data Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}
