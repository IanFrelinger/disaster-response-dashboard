import React, { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { DisasterMap } from '@/components/common/DisasterMap'

export const PublicView: React.FC = () => {
  const { 
    disasterData, 
    loading, 
    error, 
    fetchDisasterData,
    lastUpdated 
  } = useAppStore()

  useEffect(() => {
    fetchDisasterData()
    
    // Refresh data every 30 seconds for public view
    const interval = setInterval(fetchDisasterData, 30000)
    return () => clearInterval(interval)
  }, [fetchDisasterData])

  if (loading && !disasterData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="body-large text-secondary">Loading disaster response information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="body-large text-error mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={fetchDisasterData}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!disasterData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="body-large text-secondary">No disaster response data available</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disaster Response Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time emergency situation overview
                {lastUpdated && (
                  <span className="ml-2">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Map */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-full">
          <DisasterMap 
            showHazards={true}
            showRoutes={true}
            showResources={false}
            showBoundaries={true}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  )
}
