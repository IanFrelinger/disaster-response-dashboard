import React from 'react'
import { Resource } from '@/stores/useAppStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface ResourceTableProps {
  resources: Resource[]
  onStatusUpdate?: (resourceId: string, status: Resource['status']) => void
  className?: string
}

export const ResourceTable: React.FC<ResourceTableProps> = ({ 
  resources, 
  onStatusUpdate,
  className = '' 
}) => {
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'fire_truck':
        return '🚒'
      case 'ambulance':
        return '🚑'
      case 'police_car':
        return '🚓'
      case 'helicopter':
        return '🚁'
      default:
        return '🚨'
    }
  }

  const getStatusVariant = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return 'success' as const
      case 'deployed':
        return 'warning' as const
      case 'responding':
        return 'info' as const
      case 'maintenance':
        return 'error' as const
      default:
        return 'info' as const
    }
  }

  const getStatusOptions = (currentStatus: Resource['status']) => {
    const allStatuses: Resource['status'][] = ['available', 'deployed', 'responding', 'maintenance']
    return allStatuses.filter(status => status !== currentStatus)
  }

  const handleStatusChange = (resourceId: string, newStatus: Resource['status']) => {
    onStatusUpdate?.(resourceId, newStatus)
  }

  return (
    <Card className={className}>
      <CardHeader 
        title="Emergency Resources" 
        subtitle={`${resources.length} total resources`}
      />
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left p-3 body-medium text-secondary">Resource</th>
                <th className="text-left p-3 body-medium text-secondary">Type</th>
                <th className="text-left p-3 body-medium text-secondary">Status</th>
                <th className="text-left p-3 body-medium text-secondary">Capacity</th>
                <th className="text-left p-3 body-medium text-secondary">Crew</th>
                <th className="text-left p-3 body-medium text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="border-b border-border-light hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                      <div>
                        <div className="heading-4 text-primary">{resource.name}</div>
                        <div className="caption">ID: {resource.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="body-medium capitalize">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(resource.status)}>
                      {resource.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="body-medium capitalize">
                      {resource.capacity.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="body-medium">{resource.crew} crew</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {getStatusOptions(resource.status).map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(resource.id, status)}
                          className="text-xs"
                        >
                          Set {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {resources.length === 0 && (
          <div className="text-center py-8">
            <p className="body-medium text-secondary">No resources available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
