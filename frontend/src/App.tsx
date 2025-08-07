import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Pages (to be implemented)
const PublicView = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Public Emergency Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Status Card</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Location Checker</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Action Checklist</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  </div>
)

const FieldView = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Field Response Operations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tactical Map</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Navigation Panel</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  </div>
)

const CommandView = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Command Center Operations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Metrics Grid</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tactical Map</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Resource Table</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  </div>
)

// Navigation component
const Navigation = () => (
  <nav className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Disaster Response Dashboard</h1>
          </div>
        </div>
        <div className="flex space-x-8">
          <a href="/public" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            Public View
          </a>
          <a href="/field" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            Field View
          </a>
          <a href="/command" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            Command View
          </a>
        </div>
      </div>
    </div>
  </nav>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/public" element={<PublicView />} />
          <Route path="/field" element={<FieldView />} />
          <Route path="/command" element={<CommandView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
