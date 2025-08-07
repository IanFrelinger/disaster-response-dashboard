import React, { useState, useEffect } from 'react'
import { StatusCard, StatusType } from '@/components/public/StatusCard'
import { LocationChecker } from '@/components/public/LocationChecker'
import { ActionChecklist } from '@/components/public/ActionChecklist'
import { FamilyStatus } from '@/components/public/FamilyStatus'
import { ResourceGrid } from '@/components/public/ResourceGrid'
import { useAppStore } from '@/stores/useAppStore'
import { apiService } from '@/services/api'

export const PublicView: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<StatusType>('safe')
  const [locationLoading, setLocationLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())
  
  const { setLoading, setError, clearError } = useAppStore()

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toISOString())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleLocationCheck = async (address: string) => {
    setLocationLoading(true)
    clearError()
    
    try {
      // Simulate API call for location-based risk assessment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock risk assessment based on address
      const riskLevel = address.toLowerCase().includes('evacuation') ? 'evacuate' :
                       address.toLowerCase().includes('warning') ? 'prepare' : 'safe'
      
      setCurrentStatus(riskLevel)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      setError('Failed to check location status. Please try again.')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleChecklistItemToggle = (itemId: string, completed: boolean) => {
    console.log(`Checklist item ${itemId} ${completed ? 'completed' : 'unchecked'}`)
  }

  const handleFamilyMemberUpdate = (memberId: string, status: string) => {
    console.log(`Family member ${memberId} status updated to ${status}`)
  }

  const handleResourceClick = (resource: any) => {
    console.log('Resource clicked:', resource)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency Information Center
          </h1>
          <p className="text-gray-600">
            Stay informed and prepared during emergency situations
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status and Location */}
          <div className="lg:col-span-1 space-y-6">
            <StatusCard
              status={currentStatus}
              lastUpdated={lastUpdated}
              data-testid="status-card"
            />
            
            <LocationChecker
              onLocationCheck={handleLocationCheck}
              loading={locationLoading}
              data-testid="location-checker"
            />
          </div>

          {/* Center Column - Checklist and Family */}
          <div className="lg:col-span-1 space-y-6">
            <ActionChecklist
              onItemToggle={handleChecklistItemToggle}
              data-testid="action-checklist"
            />
            
            <FamilyStatus
              onMemberStatusUpdate={handleFamilyMemberUpdate}
              data-testid="family-status"
            />
          </div>

          {/* Right Column - Resources */}
          <div className="lg:col-span-1">
            <ResourceGrid
              onResourceClick={handleResourceClick}
              data-testid="resource-grid"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              <strong>Emergency Response System</strong> - Providing real-time information and resources
            </p>
            <p className="mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
