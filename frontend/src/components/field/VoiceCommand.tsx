import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Settings, X, Play } from 'lucide-react'

interface VoiceCommand {
  id: string
  phrase: string
  action: string
  description: string
  category: 'navigation' | 'communication' | 'emergency' | 'system'
}

interface VoiceCommandProps {
  onCommandExecuted?: (command: VoiceCommand) => void
  onEmergencyCall?: () => void
  onSendMessage?: () => void
  onNavigateTo?: (destination: string) => void
  onToggleOffline?: () => void
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({
  onCommandExecuted,
  onEmergencyCall,
  onSendMessage,
  onNavigateTo,
  onToggleOffline
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Available voice commands
  const availableCommands: VoiceCommand[] = [
    {
      id: 'emergency-call',
      phrase: 'emergency call',
      action: 'emergency_call',
      description: 'Make emergency call to command center',
      category: 'emergency'
    },
    {
      id: 'send-message',
      phrase: 'send message',
      action: 'send_message',
      description: 'Send status update message',
      category: 'communication'
    },
    {
      id: 'navigate-safe',
      phrase: 'navigate to safe zone',
      action: 'navigate_safe',
      description: 'Start navigation to nearest safe zone',
      category: 'navigation'
    },
    {
      id: 'report-hazard',
      phrase: 'report hazard',
      action: 'report_hazard',
      description: 'Report new hazard or incident',
      category: 'emergency'
    },
    {
      id: 'request-support',
      phrase: 'request support',
      action: 'request_support',
      description: 'Request backup or support',
      category: 'communication'
    },
    {
      id: 'toggle-offline',
      phrase: 'go offline',
      action: 'toggle_offline',
      description: 'Toggle offline mode',
      category: 'system'
    },
    {
      id: 'status-check',
      phrase: 'status check',
      action: 'status_check',
      description: 'Check current status and location',
      category: 'system'
    },
    {
      id: 'weather-update',
      phrase: 'weather update',
      action: 'weather_update',
      description: 'Get current weather conditions',
      category: 'system'
    }
  ]

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setIsRecording(true)
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        setConfidence(event.results[event.results.length - 1]?.[0]?.confidence || 0)

        // Check for commands in final transcript
        if (finalTranscript) {
          const command = findMatchingCommand(finalTranscript.toLowerCase())
          if (command) {
            executeCommand(command)
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Audio level monitoring
  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new AudioContext()
          const source = audioContextRef.current.createMediaStreamSource(stream)
          analyserRef.current = audioContextRef.current.createAnalyser()
          analyserRef.current.fftSize = 256
          source.connect(analyserRef.current)

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          
          const updateAudioLevel = () => {
            if (analyserRef.current && isRecording) {
              analyserRef.current.getByteFrequencyData(dataArray)
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length
              setAudioLevel(average)
              requestAnimationFrame(updateAudioLevel)
            }
          }
          
          updateAudioLevel()
        })
        .catch(err => {
          console.error('Error accessing microphone:', err)
        })
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [isRecording])

  const findMatchingCommand = (transcript: string): VoiceCommand | null => {
    return availableCommands.find(command => 
      transcript.includes(command.phrase.toLowerCase())
    ) || null
  }

  const executeCommand = (command: VoiceCommand) => {
    setLastCommand(command)
    
    switch (command.action) {
      case 'emergency_call':
        onEmergencyCall?.()
        break
      case 'send_message':
        onSendMessage?.()
        break
      case 'navigate_safe':
        onNavigateTo?.('safe_zone')
        break
      case 'report_hazard':
        console.log('Reporting hazard...')
        break
      case 'request_support':
        console.log('Requesting support...')
        break
      case 'toggle_offline':
        onToggleOffline?.()
        break
      case 'status_check':
        console.log('Checking status...')
        break
      case 'weather_update':
        console.log('Getting weather update...')
        break
    }

    onCommandExecuted?.(command)
    setTranscript('')
  }

  const startListening = () => {
    if (recognitionRef.current && isEnabled) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const toggleVoiceControl = () => {
    if (isEnabled) {
      stopListening()
      setIsEnabled(false)
    } else {
      setIsEnabled(true)
      startListening()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'communication': return 'bg-blue-100 text-blue-800'
      case 'navigation': return 'bg-green-100 text-green-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mic className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Voice Commands</h3>
              <p className="text-purple-100 text-sm">
                {isEnabled ? 'Voice control active' : 'Voice control disabled'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="p-2 hover:bg-purple-700 rounded-full transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={toggleVoiceControl}
              className={`p-3 rounded-full transition-all duration-200 ${
                isEnabled 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {isEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Activity Indicator */}
      {isEnabled && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isListening ? 'Listening...' : 'Ready'}
                </span>
              </div>
              
              {/* Audio Level Meter */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(audioLevel / 255) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Heard:</p>
              <p className="text-gray-700 mt-1">{transcript}</p>
            </div>
            <button
              onClick={() => setTranscript('')}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Last Command */}
      {lastCommand && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-900">Executed:</p>
          <p className="text-gray-700 mt-1">{lastCommand.description}</p>
        </div>
      )}

      {/* Available Commands */}
      {showCommands && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Available Commands</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableCommands.map((command) => (
              <div
                key={command.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        "{command.phrase}"
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(command.category)}`}>
                        {command.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {command.description}
                    </p>
                  </div>
                  <button
                    onClick={() => executeCommand(command)}
                    className="ml-3 p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onEmergencyCall?.()}
            className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Mic className="w-4 h-4" />
            <span>Emergency Call</span>
          </button>
          <button
            onClick={() => onSendMessage?.()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  )
}
