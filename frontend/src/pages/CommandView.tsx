import React, { useState, useEffect } from 'react'
import { MetricsGrid } from '@/components/command/MetricsGrid'
import { CommandTacticalMap } from '@/components/command/CommandTacticalMap'
import { ResourceTable } from '@/components/command/ResourceTable'
import { CommunicationLog } from '@/components/command/CommunicationLog'
import { Timeline } from '@/components/command/Timeline'
import { PredictionCard } from '@/components/command/PredictionCard'
import { 
  Activity, 
  MapPin, 
  Shield, 
  MessageSquare, 
  Clock, 
  Brain,
  Settings,
  RefreshCw,
  Download,
  Users,
  AlertTriangle
} from 'lucide-react'

interface CommandViewProps {
  // Props for integration with backend
}

export const CommandView: React.FC<CommandViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'resources' | 'communications' | 'timeline' | 'predictions'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdate(new Date())
    }, 2000)
  }

  const handleExport = () => {
    console.log('Exporting command center data...')
    // In a real app, this would export data to CSV/PDF
    alert('Exporting command center data...')
  }

  const handleMetricClick = (metric: any) => {
    console.log('Metric clicked:', metric)
    // Navigate to relevant view based on metric
    switch (metric.id) {
      case 'active-responders':
        setActiveTab('resources')
        break
      case 'hazard-zones':
        setActiveTab('map')
        break
      case 'communications':
        setActiveTab('communications')
        break
      default:
        console.log('No specific action for metric:', metric.id)
    }
  }

  const handleEntityClick = (entity: any) => {
    console.log('Map entity clicked:', entity)
    // Show detailed information about the entity
    alert(`Entity: ${entity.data.name || entity.data.type}\nStatus: ${entity.status}`)
  }

  const handleResourceSelect = (resource: any) => {
    console.log('Resource selected:', resource)
    // Show detailed resource information
    alert(`Resource: ${resource.name}\nStatus: ${resource.status}\nLocation: ${resource.location}`)
  }

  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message)
    // In a real app, this would send the message
    alert(`Message sent to ${message.recipient}: ${message.content}`)
  }

  const handleCallContact = (contact: string) => {
    console.log('Calling contact:', contact)
    // In a real app, this would initiate a call
    alert(`Calling ${contact}...`)
  }

  const handlePredictionClick = (prediction: any) => {
    console.log('Prediction clicked:', prediction)
    // Show detailed prediction information
    alert(`Prediction: ${prediction.title}\nConfidence: ${prediction.confidence}%\nImpact: ${prediction.impact}`)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview': return <Activity className="w-5 h-5" />
      case 'map': return <MapPin className="w-5 h-5" />
      case 'resources': return <Shield className="w-5 h-5" />
      case 'communications': return <MessageSquare className="w-5 h-5" />
      case 'timeline': return <Clock className="w-5 h-5" />
      case 'predictions': return <Brain className="w-5 h-5" />
      default: return <Settings className="w-5 h-5" />
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'overview': return 'Overview'
      case 'map': return 'Tactical Map'
      case 'resources': return 'Resources'
      case 'communications': return 'Communications'
      case 'timeline': return 'Timeline'
      case 'predictions': return 'AI Predictions'
      default: return 'Settings'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Emergency Operations Center</h1>
              <p className="text-gray-300 text-sm">
                Command Center Dashboard • Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8 overflow-x-auto">
            {(['overview', 'map', 'resources', 'communications', 'timeline', 'predictions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabIcon(tab)}
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <MetricsGrid
              onMetricClick={handleMetricClick}
              onRefresh={handleRefresh}
            />

            {/* Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tactical Map */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Tactical Overview</h3>
                  <p className="text-sm text-gray-600">Real-time situation awareness</p>
                </div>
                <div className="h-64 bg-gradient-to-br from-blue-900 to-green-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Interactive map view</p>
                      <button
                        onClick={() => setActiveTab('map')}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        View Full Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Common command center tasks</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('communications')}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                      <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-medium text-gray-900">Send Alert</div>
                      <div className="text-sm text-gray-600">Broadcast message</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                    >
                      <Shield className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-medium text-gray-900">Deploy Resources</div>
                      <div className="text-sm text-gray-600">Assign teams</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                    >
                      <Clock className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="font-medium text-gray-900">Add Event</div>
                      <div className="text-sm text-gray-600">Log decision</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('predictions')}
                      className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                    >
                      <Brain className="w-6 h-6 text-orange-600 mb-2" />
                      <div className="font-medium text-gray-900">AI Insights</div>
                      <div className="text-sm text-gray-600">View predictions</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest updates and events</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium text-gray-900">Critical Alert Issued</div>
                      <div className="text-sm text-gray-600">Fire spread prediction updated - 2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Resources Deployed</div>
                      <div className="text-sm text-gray-600">Additional fire teams dispatched - 5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Safe Zone Established</div>
                      <div className="text-sm text-gray-600">Community Center operational - 8 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <CommandTacticalMap
            onEntityClick={handleEntityClick}
            onLayerToggle={(layerId, visible) => console.log('Layer toggled:', layerId, visible)}
            onMapAction={(action) => console.log('Map action:', action)}
          />
        )}

        {activeTab === 'resources' && (
          <ResourceTable
            onResourceSelect={handleResourceSelect}
            onReassign={(resourceId, newAssignment) => console.log('Reassign:', resourceId, newAssignment)}
            onContact={(resource) => handleCallContact(resource.contact || '')}
            onExport={handleExport}
          />
        )}

        {activeTab === 'communications' && (
          <CommunicationLog
            onSendMessage={handleSendMessage}
            onCallContact={handleCallContact}
            onExport={handleExport}
          />
        )}

        {activeTab === 'timeline' && (
          <Timeline
            onEventClick={(event) => console.log('Event clicked:', event)}
            onAddEvent={(event) => console.log('Add event:', event)}
            onUpdateStatus={(eventId, status) => console.log('Update status:', eventId, status)}
            onExport={handleExport}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictionCard
            onPredictionClick={handlePredictionClick}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>47 Active Responders</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>8 Active Hazards</span>
            </div>
          </div>
          <div className="text-gray-400">
            EOC Status: OPERATIONAL • Incident: WILDFIRE RESPONSE
          </div>
        </div>
      </div>
    </div>
  )
}
