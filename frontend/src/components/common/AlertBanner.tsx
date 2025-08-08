import React from 'react'
import { Alert } from '@/stores/useAppStore'

interface AlertBannerProps {
  alerts: Alert[]
  className?: string
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, className = '' }) => {
  if (alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'error':
        return '🚨'
      case 'success':
        return '✅'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getAlertClass = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'alert-warning'
      case 'error':
        return 'alert-error'
      case 'success':
        return 'alert-success'
      case 'info':
      default:
        return 'alert-info'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert ${getAlertClass(alert.type)} fade-in`}>
          <div className="flex-shrink-0">
            <span className="text-xl">{getAlertIcon(alert.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="heading-4 text-primary mb-1">{alert.title}</h4>
              <span className="caption">{formatTimestamp(alert.timestamp)}</span>
            </div>
            <p className="body-medium text-secondary">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
