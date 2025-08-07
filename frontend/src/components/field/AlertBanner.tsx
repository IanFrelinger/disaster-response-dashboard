import React, { useState, useEffect } from 'react'
import { AlertTriangle, X, Bell, Volume2, VolumeX } from 'lucide-react'

interface Alert {
  id: string
  type: 'emergency' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  priority: 'high' | 'medium' | 'low'
  acknowledged: boolean
  expiresAt?: Date
}

interface AlertBannerProps {
  alerts?: Alert[]
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  onEmergencyResponse?: (alertId: string) => void
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts = [],
  onAcknowledge,
  onDismiss,
  onEmergencyResponse
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)

  // Mock alert data
  const mockAlerts: Alert[] = [
    {
      id: 'emergency-1',
      type: 'emergency',
      title: 'CRITICAL: Fire Approaching',
      message: 'Wildfire has crossed containment line. Evacuate immediately to designated safe zones.',
      timestamp: new Date(),
      priority: 'high',
      acknowledged: false,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    },
    {
      id: 'warning-1',
      type: 'warning',
      title: 'Equipment Malfunction',
      message: 'Thermal camera battery critical. Replace or charge immediately.',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      priority: 'medium',
      acknowledged: false
    },
    {
      id: 'info-1',
      type: 'info',
      title: 'Weather Update',
      message: 'Wind speed increasing to 25 mph. Monitor fire spread patterns.',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      priority: 'low',
      acknowledged: true
    }
  ]

  const allAlerts = alerts.length > 0 ? alerts : mockAlerts
  const activeAlerts = allAlerts.filter(alert => !alert.acknowledged && (!alert.expiresAt || alert.expiresAt > new Date()))
  const highPriorityAlerts = activeAlerts.filter(alert => alert.priority === 'high')

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-600'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      case 'success': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'info': return <Bell className="w-5 h-5" />
      case 'success': return <Bell className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
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

  // Auto-rotate through high priority alerts
  useEffect(() => {
    if (highPriorityAlerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex(prev => (prev + 1) % highPriorityAlerts.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [highPriorityAlerts.length])

  if (activeAlerts.length === 0) {
    return null
  }

  const currentAlert = highPriorityAlerts[currentAlertIndex] || activeAlerts[0]

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Alert Banner */}
      <div className={`${getAlertColor(currentAlert.type)} text-white p-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getAlertIcon(currentAlert.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg">{currentAlert.title}</h3>
                {currentAlert.priority === 'high' && (
                  <span className="bg-red-700 px-2 py-1 rounded text-xs font-bold animate-pulse">
                    HIGH PRIORITY
                  </span>
                )}
              </div>
              <p className="text-sm opacity-90 mt-1">{currentAlert.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {formatTimeAgo(currentAlert.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {highPriorityAlerts.length > 1 && (
              <div className="text-xs opacity-75">
                {currentAlertIndex + 1} of {highPriorityAlerts.length}
              </div>
            )}
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <span className="text-sm font-bold">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-3">
          {currentAlert.type === 'emergency' && (
            <button
              onClick={() => onEmergencyResponse?.(currentAlert.id)}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              EMERGENCY RESPONSE
            </button>
          )}
          
          <button
            onClick={() => onAcknowledge?.(currentAlert.id)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Acknowledge
          </button>
          
          <button
            onClick={() => onDismiss?.(currentAlert.id)}
            className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Expanded Alert List */}
      {isExpanded && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">All Active Alerts ({activeAlerts.length})</h4>
            
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`mb-3 p-3 rounded-lg border-l-4 ${
                  alert.type === 'emergency' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  alert.type === 'info' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-semibold text-gray-900">{alert.title}</h5>
                      {alert.priority === 'high' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                          HIGH
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(alert.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => onAcknowledge?.(alert.id)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Ack
                    </button>
                    <button
                      onClick={() => onDismiss?.(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
