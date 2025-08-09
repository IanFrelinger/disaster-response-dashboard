import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Mapbox3DBuildingsDemo } from './pages/Mapbox3DBuildingsDemo'
import './styles/ios-design.css'

// Navigation component with iOS design principles
const Navigation = () => (
  <nav className="ios-navbar">
    <div className="ios-container">
      <div className="ios-flex-between">
        <div className="ios-flex">
          <div className="ios-card" style={{ padding: 'var(--ios-spacing-sm)', margin: 0, marginRight: 'var(--ios-spacing-md)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--ios-blue)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <div>
            <h1 className="ios-headline" style={{ margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>3D Terrain Visualization</h1>
            <p className="ios-caption" style={{ margin: 0 }}>Real-time 3D mapping with building extrusions</p>
          </div>
        </div>
        
        <div className="ios-flex">
          <a 
            href="/mapbox-3d-buildings" 
            className="ios-button ios-scale-in"
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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)' }}>
        <Navigation />
        <main className="ios-container" style={{ paddingTop: 'var(--ios-spacing-xl)', paddingBottom: 'var(--ios-spacing-xl)' }}>
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
