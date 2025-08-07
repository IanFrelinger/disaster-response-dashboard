import React, { useState } from 'react'
import { 
  Phone, 
  MessageSquare, 
  Camera, 
  Mic, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Wifi,
  Battery,
  Signal
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  action: () => void
  disabled?: boolean
}

interface QuickActionsProps {
  onEmergencyCall?: () => void
  onSendMessage?: () => void
  onTakePhoto?: () => void
  onVoiceCommand?: () => void
  onReportHazard?: () => void
  onRequestSupport?: () => void
  onShareLocation?: () => void
  onToggleOffline?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onEmergencyCall,
  onSendMessage,
  onTakePhoto,
  onVoiceCommand,
  onReportHazard,
  onRequestSupport,
  onShareLocation,
  onToggleOffline
}) => {
  const [isOffline, setIsOffline] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [batteryLevel] = useState(85)
  const [signalStrength] = useState(4)

  const handleOfflineToggle = () => {
    setIsOffline(!isOffline)
    if (onToggleOffline) {
      onToggleOffline()
    }
  }

  const handleVoiceCommand = () => {
    setIsRecording(!isRecording)
    if (onVoiceCommand) {
      onVoiceCommand()
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      label: 'Emergency Call',
      icon: <Phone className="w-6 h-6" />,
      color: 'bg-red-500 hover:bg-red-600',
      action: onEmergencyCall || (() => console.log('Emergency call'))
    },
    {
      id: 'message',
      label: 'Send Message',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: onSendMessage || (() => console.log('Send message'))
    },
    {
      id: 'photo',
      label: 'Take Photo',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: onTakePhoto || (() => console.log('Take photo'))
    },
    {
      id: 'voice',
      label: isRecording ? 'Stop Recording' : 'Voice Command',
      icon: <Mic className="w-6 h-6" />,
      color: isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600',
      action: handleVoiceCommand
    },
    {
      id: 'hazard',
      label: 'Report Hazard',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: onReportHazard || (() => console.log('Report hazard'))
    },
    {
      id: 'support',
      label: 'Request Support',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: onRequestSupport || (() => console.log('Request support'))
    },
    {
      id: 'location',
      label: 'Share Location',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: onShareLocation || (() => console.log('Share location'))
    },
    {
      id: 'offline',
      label: isOffline ? 'Go Online' : 'Go Offline',
      icon: <Wifi className="w-6 h-6" />,
      color: isOffline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600',
      action: handleOfflineToggle
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
              <span>{batteryLevel}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wifi className={`w-4 h-4 ${isOffline ? 'text-red-400' : 'text-green-400'}`} />
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </div>
          </div>
          <div className="text-gray-400">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled}
              className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-2 min-h-[120px] justify-center`}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full">
                {action.icon}
              </div>
              <span className="font-medium text-sm text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Override */}
      <div className="p-4 bg-red-50 border-t border-red-200">
        <button
          onClick={onEmergencyCall}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3"
        >
          <AlertTriangle className="w-6 h-6" />
          <span>EMERGENCY OVERRIDE</span>
        </button>
        <p className="text-xs text-red-600 text-center mt-2">
          Use this button for immediate emergency response
        </p>
      </div>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="animate-pulse">
              <Mic className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-bold">Recording...</p>
              <p className="text-sm">Tap to stop</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
