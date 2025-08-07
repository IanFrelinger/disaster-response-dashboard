import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  Search, 
  Download, 
  Send,
  MapPin,
  Shield
} from 'lucide-react'

interface Communication {
  id: string
  type: 'message' | 'call' | 'alert' | 'status'
  sender: string
  recipient: string
  content: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  location?: string
  metadata?: any
}

interface CommunicationLogProps {
  onSendMessage?: (message: { recipient: string; content: string; priority: string }) => void
  onCallContact?: (contact: string) => void
  onExport?: () => void
}

export const CommunicationLog: React.FC<CommunicationLogProps> = ({
  onSendMessage,
  onCallContact,
  onExport
}) => {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [newMessage, setNewMessage] = useState({ recipient: '', content: '', priority: 'medium' })
  const [isComposing, setIsComposing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock communication data
  const mockCommunications: Communication[] = [
    {
      id: 'comm-1',
      type: 'alert',
      sender: 'System',
      recipient: 'All Responders',
      content: 'CRITICAL: Fire has crossed containment line. Evacuate immediately.',
      timestamp: new Date(),
      priority: 'critical',
      status: 'delivered',
      location: 'Downtown Sector'
    },
    {
      id: 'comm-2',
      type: 'message',
      sender: 'Captain Johnson',
      recipient: 'Command Center',
      content: 'Team Alpha in position. Beginning evacuation procedures.',
      timestamp: new Date(Date.now() - 300000),
      priority: 'high',
      status: 'read',
      location: 'North District'
    },
    {
      id: 'comm-3',
      type: 'call',
      sender: 'EMS Team Beta',
      recipient: 'Medical Dispatch',
      content: 'Requesting additional medical supplies at Community Center.',
      timestamp: new Date(Date.now() - 600000),
      priority: 'medium',
      status: 'delivered',
      location: 'Community Center'
    },
    {
      id: 'comm-4',
      type: 'status',
      sender: 'Police SWAT',
      recipient: 'Command Center',
      content: 'Perimeter secured. No unauthorized access detected.',
      timestamp: new Date(Date.now() - 900000),
      priority: 'low',
      status: 'sent',
      location: 'East Sector'
    },
    {
      id: 'comm-5',
      type: 'message',
      sender: 'Shelter Manager',
      recipient: 'Command Center',
      content: 'Community Center at 85% capacity. Need additional resources.',
      timestamp: new Date(Date.now() - 1200000),
      priority: 'high',
      status: 'read',
      location: 'Community Center'
    },
    {
      id: 'comm-6',
      type: 'alert',
      sender: 'Weather Service',
      recipient: 'All Units',
      content: 'Wind speed increasing to 25 mph. Monitor fire spread.',
      timestamp: new Date(Date.now() - 1500000),
      priority: 'medium',
      status: 'delivered',
      location: 'All Sectors'
    }
  ]

  useEffect(() => {
    setCommunications(mockCommunications)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [communications])

  // Filter communications
  useEffect(() => {
    let filtered = communications.filter(comm => {
      const matchesSearch = comm.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'all' || comm.type === typeFilter
      const matchesPriority = priorityFilter === 'all' || comm.priority === priorityFilter
      
      return matchesSearch && matchesType && matchesPriority
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setFilteredCommunications(filtered)
  }, [communications, searchTerm, typeFilter, priorityFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'status': return <Shield className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-100'
      case 'call': return 'text-green-600 bg-green-100'
      case 'alert': return 'text-red-600 bg-red-100'
      case 'status': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'text-green-600'
      case 'delivered': return 'text-blue-600'
      case 'sent': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const handleSendMessage = () => {
    if (newMessage.recipient && newMessage.content) {
      const message: Communication = {
        id: `comm-${Date.now()}`,
        type: 'message',
        sender: 'Command Center',
        recipient: newMessage.recipient,
        content: newMessage.content,
        timestamp: new Date(),
        priority: newMessage.priority as any,
        status: 'sent'
      }
      
      setCommunications(prev => [message, ...prev])
      onSendMessage?.(newMessage)
      setNewMessage({ recipient: '', content: '', priority: 'medium' })
      setIsComposing(false)
    }
  }

  const handleCallContact = (contact: string) => {
    onCallContact?.(contact)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Communication Log</h3>
              <p className="text-gray-300 text-sm">
                {filteredCommunications.length} messages • Real-time updates
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsComposing(!isComposing)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>New Message</span>
            </button>
            <button
              onClick={onExport}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="message">Messages</option>
            <option value="call">Calls</option>
            <option value="alert">Alerts</option>
            <option value="status">Status</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Compose Message */}
      {isComposing && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Recipient"
                value={newMessage.recipient}
                onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newMessage.priority}
                onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <textarea
                placeholder="Message content..."
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.recipient || !newMessage.content}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredCommunications.map((comm) => (
          <div
            key={comm.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(comm.type)}`}>
                  {getTypeIcon(comm.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comm.sender}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-gray-900">{comm.recipient}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={getPriorityColor(comm.priority)}>
                      {comm.priority.toUpperCase()}
                    </span>
                    <span className={getStatusColor(comm.status)}>
                      {comm.status}
                    </span>
                    <span className="text-gray-500">
                      {formatTime(comm.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-2">{comm.content}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {comm.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{comm.location}</span>
                      </div>
                    )}
                    <span>{formatTimeAgo(comm.timestamp)}</span>
                  </div>
                  
                  {comm.type === 'call' && (
                    <button
                      onClick={() => handleCallContact(comm.sender)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {communications.filter(c => c.type === 'message').length}
            </div>
            <div className="text-gray-600">Messages</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {communications.filter(c => c.type === 'call').length}
            </div>
            <div className="text-gray-600">Calls</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {communications.filter(c => c.type === 'alert').length}
            </div>
            <div className="text-gray-600">Alerts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {communications.filter(c => c.type === 'status').length}
            </div>
            <div className="text-gray-600">Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}
