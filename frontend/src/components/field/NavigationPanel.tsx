import React, { useState, useEffect } from 'react'
import { Navigation, Clock, ArrowRight, Phone, MessageSquare } from 'lucide-react'

interface NavigationStep {
  id: string
  instruction: string
  distance: number
  duration: number
  street: string
  completed: boolean
}

interface NavigationPanelProps {
  destination?: { lat: number; lng: number; name: string }
  currentRoute?: NavigationStep[]
  onStepComplete?: (stepId: string) => void
  onCallSupport?: () => void
  onSendMessage?: () => void
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destination,
  currentRoute = [],
  onStepComplete,
  onCallSupport,
  onSendMessage
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null)

  // Mock navigation data
  const mockRoute: NavigationStep[] = [
    {
      id: '1',
      instruction: 'Turn right onto Main Street',
      distance: 0.2,
      duration: 1,
      street: 'Main Street',
      completed: false
    },
    {
      id: '2',
      instruction: 'Continue straight for 0.5 miles',
      distance: 0.5,
      duration: 2,
      street: 'Main Street',
      completed: false
    },
    {
      id: '3',
      instruction: 'Turn left onto Oak Avenue',
      distance: 0.1,
      duration: 1,
      street: 'Oak Avenue',
      completed: false
    },
    {
      id: '4',
      instruction: 'Destination on your right',
      distance: 0.1,
      duration: 1,
      street: 'Oak Avenue',
      completed: false
    }
  ]

  const route = currentRoute.length > 0 ? currentRoute : mockRoute

  useEffect(() => {
    if (isNavigating && route.length > 0) {
      const totalDuration = route.reduce((sum, step) => sum + step.duration, 0)
      const arrival = new Date()
      arrival.setMinutes(arrival.getMinutes() + totalDuration)
      setEstimatedArrival(arrival)
    }
  }, [isNavigating, route])

  const handleStepComplete = (stepId: string) => {
    if (onStepComplete) {
      onStepComplete(stepId)
    }
    setCurrentStepIndex(prev => Math.min(prev + 1, route.length - 1))
  }

  const formatTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min'
    return `${minutes} min`
  }

  const formatDistance = (miles: number) => {
    if (miles < 0.1) return '< 0.1 mi'
    return `${miles.toFixed(1)} mi`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Navigation Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Navigation</h3>
              <p className="text-blue-100 text-sm">
                {destination?.name || 'Safe Zone Alpha'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNavigating(!isNavigating)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isNavigating 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isNavigating ? 'Stop' : 'Start'}
          </button>
        </div>
        
        {isNavigating && estimatedArrival && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>ETA: {estimatedArrival.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onCallSupport}
                className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </button>
              <button
                onClick={onSendMessage}
                className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Message</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Step */}
      {isNavigating && route[currentStepIndex] && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 font-bold text-sm">
                  {currentStepIndex + 1}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {route[currentStepIndex].instruction}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {route[currentStepIndex].street}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{formatDistance(route[currentStepIndex].distance)}</span>
                <span>{formatTime(route[currentStepIndex].duration)}</span>
              </div>
            </div>
            <button
              onClick={() => handleStepComplete(route[currentStepIndex].id)}
              className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Route Steps */}
      <div className="max-h-64 overflow-y-auto">
        {route.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 border-b border-gray-100 ${
              index === currentStepIndex && isNavigating ? 'bg-blue-50' : ''
            } ${step.completed ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : index === currentStepIndex && isNavigating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-sm ${
                  step.completed ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {step.instruction}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.street}
                </p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                  <span>{formatDistance(step.distance)}</span>
                  <span>{formatTime(step.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCallSupport}
            className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">Emergency Call</span>
          </button>
          <button
            onClick={onSendMessage}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Send Update</span>
          </button>
        </div>
      </div>
    </div>
  )
}
