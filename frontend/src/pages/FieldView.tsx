import React, { useState, useEffect } from 'react'
import { TacticalMap } from '@/components/field/TacticalMap'
import { NavigationPanel } from '@/components/field/NavigationPanel'
import { QuickActions } from '@/components/field/QuickActions'
import { ResourceStatus } from '@/components/field/ResourceStatus'
import { AlertBanner } from '@/components/field/AlertBanner'
import { VoiceCommand } from '@/components/field/VoiceCommand'
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Mic, 
  Settings, 
  Wifi, 
  WifiOff,
  Battery,
  Signal,
  Clock
} from 'lucide-react'

interface FieldViewProps {
  // Props for integration with backend
}

export const FieldView: React.FC<FieldViewProps> = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'navigation' | 'actions' | 'resources' | 'voice'>('map')
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [signalStrength, setSignalStrength] = useState(4)
  const [lastSync] = useState<Date>(new Date())

  // Mock data for demonstration
  const mockHazardZones = [
    {
      id: 'hazard-1',
      type: 'fire' as const,
      severity: 'high' as const,
      coordinates: [{ lat: 37.7749, lng: -122.4194 }]
    },
    {
      id: 'hazard-2',
      type: 'flood' as const,
      severity: 'medium' as const,
      coordinates: [{ lat: 37.7849, lng: -122.4094 }]
    }
  ]

  const mockSafeRoutes = [
    {
      id: 'route-1',
      coordinates: [{ lat: 37.7649, lng: -122.4294 }],
      distance: 2.5,
      duration: 8
    }
  ]

  // Simulate GPS location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock location updates
      setCurrentLocation({
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Simulate battery and signal monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - Math.random() * 2))
      setSignalStrength(prev => Math.max(0, Math.min(5, prev + (Math.random() - 0.5) * 2)))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle offline mode
  const handleToggleOffline = () => {
    setIsOffline(!isOffline)
    if (!isOffline) {
      // Cache critical data before going offline
      localStorage.setItem('fieldViewCache', JSON.stringify({
        timestamp: new Date().toISOString(),
        location: currentLocation,
        hazards: mockHazardZones,
        routes: mockSafeRoutes
      }))
    }
  }

  // Handle emergency call
  const handleEmergencyCall = () => {
    console.log('Emergency call initiated')
    // In a real app, this would trigger actual emergency protocols
    alert('EMERGENCY CALL: Connecting to command center...')
  }

  // Handle send message
  const handleSendMessage = () => {
    console.log('Sending status message')
    // In a real app, this would send a status update
    alert('Status message sent to command center')
  }

  // Handle location sharing
  const handleShareLocation = () => {
    if (currentLocation) {
      console.log('Sharing location:', currentLocation)
      // In a real app, this would share location with command center
      alert(`Location shared: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`)
    }
  }

  // Handle voice command execution
  const handleVoiceCommand = (command: any) => {
    console.log('Voice command executed:', command)
    // Handle different voice commands
    switch (command.action) {
      case 'emergency_call':
        handleEmergencyCall()
        break
      case 'send_message':
        handleSendMessage()
        break
      case 'navigate_safe':
        setActiveTab('navigation')
        break
      default:
        console.log('Command not implemented:', command.action)
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'map': return <MapPin className="w-5 h-5" />
      case 'navigation': return <Navigation className="w-5 h-5" />
      case 'actions': return <Activity className="w-5 h-5" />
      case 'resources': return <Activity className="w-5 h-5" />
      case 'voice': return <Mic className="w-5 h-5" />
      default: return <Settings className="w-5 h-5" />
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'map': return 'Map'
      case 'navigation': return 'Nav'
      case 'actions': return 'Actions'
      case 'resources': return 'Resources'
      case 'voice': return 'Voice'
      default: return 'Settings'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Alert Banner */}
      <AlertBanner
        onEmergencyResponse={handleEmergencyCall}
        onAcknowledge={(alertId) => console.log('Alert acknowledged:', alertId)}
        onDismiss={(alertId) => console.log('Alert dismissed:', alertId)}
      />

      {/* Status Bar */}
      <div className="bg-gray-900 text-white p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Signal className="w-4 h-4" />
              <span>{signalStrength}/5</span>
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="w-4 h-4" />
              <span>{Math.round(batteryLevel)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              {isOffline ? <WifiOff className="w-4 h-4 text-red-400" /> : <Wifi className="w-4 h-4 text-green-400" />}
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Current Location Display */}
        {currentLocation && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Current Location</span>
              </div>
              <div className="text-xs text-blue-700">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mb-4">
          {activeTab === 'map' && (
            <TacticalMap
              currentLocation={currentLocation || undefined}
              hazardZones={mockHazardZones}
              safeRoutes={mockSafeRoutes}
              onLocationUpdate={setCurrentLocation}
            />
          )}

          {activeTab === 'navigation' && (
            <NavigationPanel
              destination={{ lat: 37.7649, lng: -122.4294, name: 'Safe Zone Alpha' }}
              onCallSupport={handleEmergencyCall}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'actions' && (
            <QuickActions
              onEmergencyCall={handleEmergencyCall}
              onSendMessage={handleSendMessage}
              onShareLocation={handleShareLocation}
              onToggleOffline={handleToggleOffline}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceStatus
              onRequestMaintenance={(resourceId) => console.log('Request maintenance for:', resourceId)}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceCommand
              onCommandExecuted={handleVoiceCommand}
              onEmergencyCall={handleEmergencyCall}
              onSendMessage={handleSendMessage}
              onToggleOffline={handleToggleOffline}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around">
          {(['map', 'navigation', 'actions', 'resources', 'voice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center py-2 px-3 flex-1 transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTabIcon(tab)}
              <span className="text-xs mt-1 font-medium">{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-20 left-4 right-4 z-40">
          <div className="bg-yellow-500 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4" />
                <span className="font-medium">Offline Mode</span>
              </div>
              <button
                onClick={handleToggleOffline}
                className="text-sm underline"
              >
                Go Online
              </button>
            </div>
            <p className="text-sm mt-1 opacity-90">
              Working with cached data. Last sync: {lastSync.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
