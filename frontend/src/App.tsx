import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Mapbox3DBuildingsDemo } from '@/pages/Mapbox3DBuildingsDemo'
import '@/styles/apple-design.css'

// Navigation component with Johnny Ive-inspired minimalist design
const Navigation = () => (
  <nav className="bg-primary border-b border-light shadow-sm">
    <div className="container">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <div>
            <h1 className="heading-4 text-primary mb-1">3D Terrain Visualization</h1>
            <p className="body-small text-secondary">Real-time 3D mapping with building extrusions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="/mapbox-3d-buildings" 
            className="btn btn-ghost body-medium hover:bg-tertiary transition-all duration-200"
          >
            3D Buildings
          </a>
        </div>
      </div>
    </div>
  </nav>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-secondary">
        <Navigation />
        <main className="container py-12">
          <Routes>
            <Route path="/" element={<Mapbox3DBuildingsDemo />} />
            <Route path="/mapbox-3d-buildings" element={<Mapbox3DBuildingsDemo />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
