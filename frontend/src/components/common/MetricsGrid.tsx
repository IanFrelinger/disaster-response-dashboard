import React from 'react'
import { Metrics } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface MetricsGridProps {
  metrics: Metrics
  className?: string
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, className = '' }) => {
  const metricCards = [
    {
      title: 'Active Hazards',
      value: metrics.active_hazards,
      total: metrics.total_hazards,
      variant: 'warning' as const,
      icon: '🔥',
      description: 'Current active threats'
    },
    {
      title: 'Population at Risk',
      value: metrics.total_population_at_risk.toLocaleString(),
      variant: 'error' as const,
      icon: '👥',
      description: 'People in affected areas'
    },
    {
      title: 'Available Resources',
      value: metrics.available_resources,
      total: metrics.available_resources + metrics.deployed_resources,
      variant: 'success' as const,
      icon: '🚒',
      description: 'Ready emergency units'
    },
    {
      title: 'Open Routes',
      value: metrics.open_routes,
      variant: 'info' as const,
      icon: '🛣️',
      description: 'Clear evacuation paths'
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.response_time_avg} min`,
      variant: 'info' as const,
      icon: '⏱️',
      description: 'Emergency response time'
    },
    {
      title: 'Evacuation Progress',
      value: `${metrics.evacuation_progress}%`,
      variant: 'success' as const,
      icon: '📈',
      description: 'Evacuation completion'
    }
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {metricCards.map((metric, index) => (
        <Card key={index} className="fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <h4 className="heading-4 text-primary">{metric.title}</h4>
                  <p className="caption">{metric.description}</p>
                </div>
              </div>
              <Badge variant={metric.variant}>
                {metric.total ? `${metric.value}/${metric.total}` : metric.value}
              </Badge>
            </div>
            
            {metric.total && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Number(metric.value) / metric.total) * 100}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
