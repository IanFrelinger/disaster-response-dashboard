import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PublicView } from '@/pages/PublicView'
import { FieldView } from '@/pages/FieldView'
import { CommandView } from '@/pages/CommandView'

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
