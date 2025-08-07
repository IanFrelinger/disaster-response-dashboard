import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Truck, 
  Shield, 
  MapPin, 
  Phone, 
  MessageSquare,
  Search,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface Resource {
  id: string
  name: string
  type: 'personnel' | 'vehicle' | 'equipment' | 'facility'
  unit: string
  status: 'available' | 'deployed' | 'maintenance' | 'offline'
  location: string
  assignedTo?: string
  eta?: string
  lastUpdate: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  contact?: string
}

interface ResourceTableProps {
  onResourceSelect?: (resource: Resource) => void
  onReassign?: (resourceId: string, newAssignment: string) => void
  onContact?: (resource: Resource) => void
  onExport?: () => void
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  onResourceSelect,
  onReassign,
  onContact,
  onExport
}) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showDetails, setShowDetails] = useState(false)

  // Mock resource data
  const mockResources: Resource[] = [
    {
      id: 'res-1',
      name: 'Fire Engine 1',
      type: 'vehicle',
      unit: 'Fire Department',
      status: 'deployed',
      location: 'Downtown Station',
      assignedTo: 'Captain Johnson',
      eta: '5 min',
      lastUpdate: new Date(),
      priority: 'high',
      contact: '+1-555-0123'
    },
    {
      id: 'res-2',
      name: 'EMS Team Alpha',
      type: 'personnel',
      unit: 'Emergency Medical',
      status: 'deployed',
      location: 'North District',
      assignedTo: 'Incident Commander',
      eta: '3 min',
      lastUpdate: new Date(Date.now() - 300000),
      priority: 'critical',
      contact: '+1-555-0124'
    },
    {
      id: 'res-3',
      name: 'Water Tanker',
      type: 'vehicle',
      unit: 'Fire Department',
      status: 'available',
      location: 'Main Depot',
      lastUpdate: new Date(Date.now() - 600000),
      priority: 'medium',
      contact: '+1-555-0125'
    },
    {
      id: 'res-4',
      name: 'Police SWAT Team',
      type: 'personnel',
      unit: 'Police Department',
      status: 'deployed',
      location: 'East Sector',
      assignedTo: 'Lieutenant Smith',
      eta: '8 min',
      lastUpdate: new Date(Date.now() - 120000),
      priority: 'high',
      contact: '+1-555-0126'
    },
    {
      id: 'res-5',
      name: 'Mobile Command Center',
      type: 'vehicle',
      unit: 'Emergency Management',
      status: 'maintenance',
      location: 'Service Center',
      lastUpdate: new Date(Date.now() - 1800000),
      priority: 'low',
      contact: '+1-555-0127'
    },
    {
      id: 'res-6',
      name: 'Helicopter Rescue',
      type: 'vehicle',
      unit: 'Search & Rescue',
      status: 'deployed',
      location: 'Air Base',
      assignedTo: 'Pilot Davis',
      eta: '12 min',
      lastUpdate: new Date(Date.now() - 90000),
      priority: 'critical',
      contact: '+1-555-0128'
    },
    {
      id: 'res-7',
      name: 'Medical Supplies Cache',
      type: 'equipment',
      unit: 'Medical Logistics',
      status: 'available',
      location: 'Central Warehouse',
      lastUpdate: new Date(Date.now() - 240000),
      priority: 'medium',
      contact: '+1-555-0129'
    },
    {
      id: 'res-8',
      name: 'Community Center',
      type: 'facility',
      unit: 'Emergency Shelter',
      status: 'deployed',
      location: 'Downtown',
      assignedTo: 'Shelter Manager',
      lastUpdate: new Date(Date.now() - 60000),
      priority: 'high',
      contact: '+1-555-0130'
    }
  ]

  useEffect(() => {
    setResources(mockResources)
  }, [])

  // Filter and sort resources
  useEffect(() => {
    let filtered = resources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter
      const matchesType = typeFilter === 'all' || resource.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })

    // Sort resources
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Resource]
      let bValue = b[sortBy as keyof Resource]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue && bValue) {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredResources(filtered)
  }, [resources, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'deployed': return 'text-blue-600 bg-blue-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personnel': return <Users className="w-4 h-4" />
      case 'vehicle': return <Truck className="w-4 h-4" />
      case 'equipment': return <Shield className="w-4 h-4" />
      case 'facility': return <MapPin className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleReassign = (resourceId: string) => {
    const newAssignment = prompt('Enter new assignment:')
    if (newAssignment) {
      onReassign?.(resourceId, newAssignment)
      setResources(prev => prev.map(res => 
        res.id === resourceId ? { ...res, assignedTo: newAssignment } : res
      ))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Resource Management</h3>
              <p className="text-gray-300 text-sm">
                {filteredResources.length} resources • {resources.filter(r => r.status === 'deployed').length} deployed
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={onExport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors flex items-center space-x-1"
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
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="personnel">Personnel</option>
            <option value="vehicle">Vehicle</option>
            <option value="equipment">Equipment</option>
            <option value="facility">Facility</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                Resource
                {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('type')}>
                Type
                {sortBy === 'type' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                Status
                {sortBy === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('location')}>
                Location
                {sortBy === 'location' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              {showDetails && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onResourceSelect?.(resource)}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {getTypeIcon(resource.type)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.unit}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {resource.type}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {resource.location}
                </td>
                {showDetails && (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.assignedTo || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.eta || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(resource.priority)}`}>
                        {resource.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(resource.lastUpdate)}
                    </td>
                  </>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {resource.contact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onContact?.(resource)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReassign(resource.id)
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-green-600">
              {resources.filter(r => r.status === 'available').length}
            </div>
            <div className="text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {resources.filter(r => r.status === 'deployed').length}
            </div>
            <div className="text-gray-600">Deployed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {resources.filter(r => r.status === 'maintenance').length}
            </div>
            <div className="text-gray-600">Maintenance</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {resources.filter(r => r.status === 'offline').length}
            </div>
            <div className="text-gray-600">Offline</div>
          </div>
        </div>
      </div>
    </div>
  )
}
