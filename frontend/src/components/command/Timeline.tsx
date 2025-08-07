import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Plus, 
  Download,
  MapPin,
  Users
} from 'lucide-react'

interface TimelineEvent {
  id: string
  type: 'decision' | 'action' | 'alert' | 'milestone' | 'note'
  title: string
  description: string
  timestamp: Date
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  location?: string
  tags?: string[]
  metadata?: any
}

interface TimelineProps {
  onEventClick?: (event: TimelineEvent) => void
  onAddEvent?: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void
  onUpdateStatus?: (eventId: string, status: string) => void
  onExport?: () => void
}

export const Timeline: React.FC<TimelineProps> = ({
  onEventClick,
  onAddEvent,
  onUpdateStatus,
  onExport
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    type: 'action' as const,
    title: '',
    description: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: '',
    location: '',
    tags: [] as string[]
  })

  // Mock timeline data
  const mockEvents: TimelineEvent[] = [
    {
      id: 'event-1',
      type: 'alert',
      title: 'Wildfire Detected',
      description: 'Initial fire detection in downtown area. Immediate response required.',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'completed',
      priority: 'critical',
      location: 'Downtown Sector',
      tags: ['fire', 'emergency', 'response']
    },
    {
      id: 'event-2',
      type: 'decision',
      title: 'Evacuation Order Issued',
      description: 'Decision to evacuate affected areas within 2-mile radius.',
      timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
      status: 'completed',
      priority: 'critical',
      assignedTo: 'Incident Commander',
      location: 'All Affected Areas',
      tags: ['evacuation', 'decision', 'public-safety']
    },
    {
      id: 'event-3',
      type: 'action',
      title: 'Emergency Response Teams Deployed',
      description: 'Fire, EMS, and Police units dispatched to affected areas.',
      timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
      status: 'completed',
      priority: 'high',
      assignedTo: 'Dispatch Center',
      location: 'Multiple Locations',
      tags: ['deployment', 'response', 'teams']
    },
    {
      id: 'event-4',
      type: 'milestone',
      title: 'First Responders On Scene',
      description: 'Initial response teams have arrived and established command post.',
      timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
      status: 'completed',
      priority: 'high',
      location: 'Command Post Alpha',
      tags: ['milestone', 'on-scene', 'command']
    },
    {
      id: 'event-5',
      type: 'action',
      title: 'Safe Zones Established',
      description: 'Community Center and High School designated as emergency shelters.',
      timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
      status: 'completed',
      priority: 'high',
      assignedTo: 'Emergency Management',
      location: 'Community Center, High School',
      tags: ['shelters', 'safe-zones', 'evacuation']
    },
    {
      id: 'event-6',
      type: 'decision',
      title: 'Containment Strategy Approved',
      description: 'Approved fire containment strategy using aerial and ground resources.',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'Fire Chief',
      location: 'Fire Perimeter',
      tags: ['containment', 'strategy', 'fire-control']
    },
    {
      id: 'event-7',
      type: 'note',
      title: 'Weather Conditions Update',
      description: 'Wind speed increasing to 25 mph. Fire spread pattern changing.',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      status: 'completed',
      priority: 'medium',
      location: 'All Sectors',
      tags: ['weather', 'conditions', 'monitoring']
    },
    {
      id: 'event-8',
      type: 'action',
      title: 'Additional Resources Requested',
      description: 'Requesting backup from neighboring jurisdictions.',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      status: 'pending',
      priority: 'high',
      assignedTo: 'Logistics Coordinator',
      location: 'Command Center',
      tags: ['resources', 'backup', 'logistics']
    }
  ]

  useEffect(() => {
    setEvents(mockEvents)
  }, [])

  // Filter events
  useEffect(() => {
    let filtered = events.filter(event => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter
      
      return matchesType && matchesStatus && matchesPriority
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setFilteredEvents(filtered)
  }, [events, typeFilter, statusFilter, priorityFilter])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'decision': return <CheckCircle className="w-4 h-4" />
      case 'action': return <AlertTriangle className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'milestone': return <CheckCircle className="w-4 h-4" />
      case 'note': return <Info className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'decision': return 'text-blue-600 bg-blue-100'
      case 'action': return 'text-green-600 bg-green-100'
      case 'alert': return 'text-red-600 bg-red-100'
      case 'milestone': return 'text-purple-600 bg-purple-100'
      case 'note': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
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

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.description) {
      const event: TimelineEvent = {
        id: `event-${Date.now()}`,
        ...newEvent,
        timestamp: new Date()
      }
      
      setEvents(prev => [event, ...prev])
      onAddEvent?.(newEvent)
      setNewEvent({
        type: 'action',
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        location: '',
        tags: []
      })
      setShowAddForm(false)
    }
  }

  const handleStatusUpdate = (eventId: string, newStatus: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus as any } : event
    ))
    onUpdateStatus?.(eventId, newStatus)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Event Timeline</h3>
              <p className="text-gray-300 text-sm">
                {filteredEvents.length} events • Decision tracking
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
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
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="decision">Decisions</option>
            <option value="action">Actions</option>
            <option value="alert">Alerts</option>
            <option value="milestone">Milestones</option>
            <option value="note">Notes</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
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

      {/* Add Event Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="action">Action</option>
                <option value="decision">Decision</option>
                <option value="alert">Alert</option>
                <option value="milestone">Milestone</option>
                <option value="note">Note</option>
              </select>
            </div>
            <textarea
              placeholder="Event description..."
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={newEvent.status}
                onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={newEvent.priority}
                onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="text"
                placeholder="Assigned to"
                value={newEvent.assignedTo}
                onChange={(e) => setNewEvent(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title || !newEvent.description}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents.map((event, index) => (
          <div
            key={event.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start space-x-3">
              {/* Timeline Icon */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                {index < filteredEvents.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mx-auto mt-2" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={getPriorityColor(event.priority)}>
                      {event.priority.toUpperCase()}
                    </span>
                    <span className={getStatusColor(event.status)}>
                      {event.status}
                    </span>
                    <span className="text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-2">{event.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{event.assignedTo}</span>
                      </div>
                    )}
                    <span>{formatTimeAgo(event.timestamp)}</span>
                  </div>
                  
                  {event.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(event.id, 'in-progress')
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Start
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(event.id, 'completed')
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                  
                  {event.status === 'in-progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusUpdate(event.id, 'completed')
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Complete
                    </button>
                  )}
                </div>
                
                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    {event.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-green-600">
              {events.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {events.filter(e => e.status === 'in-progress').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {events.filter(e => e.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {events.filter(e => e.status === 'cancelled').length}
            </div>
            <div className="text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  )
}
