import React, { useState } from 'react';
import { Mapbox3DTerrain } from '../components/tacmap/Mapbox3DTerrain';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Building2,
  Layers,
  Info,
  Settings,
  Mountain
} from 'lucide-react';

export const Mapbox3DBuildingsDemo: React.FC = () => {
  const [showHazards, setShowHazards] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<'sf' | 'nyc' | 'la'>('sf');

  const locations = {
    sf: { name: 'San Francisco', coords: [-122.4194, 37.7749] as [number, number] },
    nyc: { name: 'New York City', coords: [-74.0060, 40.7128] as [number, number] },
    la: { name: 'Los Angeles', coords: [-118.2437, 34.0522] as [number, number] }
  };

  const handleHazardClick = (hazard: any) => {
    console.log('Hazard clicked:', hazard);
    alert(`Hazard Zone: ${hazard.riskLevel} risk level\nAffected Population: ${hazard.affectedPopulation}`);
  };

  const handleUnitClick = (unit: any) => {
    console.log('Unit clicked:', unit);
    alert(`Emergency Unit: ${unit.unitType}\nCall Sign: ${unit.callSign}\nStatus: ${unit.status}`);
  };

  const handleRouteClick = (route: any) => {
    console.log('Route clicked:', route);
    alert(`Evacuation Route: ${route.routeName}\nStatus: ${route.status}\nEstimated Time: ${route.estimatedTime} minutes`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">
                🏔️ Mapbox 3D Terrain with Building Extrusions
              </h1>
              <p className="text-gray-300 text-sm">
                Real 3D terrain and building footprints with Foundry data integration
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mountain className="w-4 h-4 text-blue-400" />
                <span>3D Terrain</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="w-4 h-4 text-green-400" />
                <span>3D Buildings</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Foundry Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-black bg-opacity-50 rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Map Controls
                </h2>
                
                {/* Location Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value as 'sf' | 'nyc' | 'la')}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="sf">San Francisco</option>
                    <option value="nyc">New York City</option>
                    <option value="la">Los Angeles</option>
                  </select>
                </div>

                {/* Layer Toggles */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">Layers</h3>
                  
                                     <label className="flex items-center space-x-3 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={showTerrain}
                       onChange={(e) => setShowTerrain(e.target.checked)}
                       className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                     />
                     <Mountain className="w-4 h-4 text-blue-400" />
                     <span className="text-sm">3D Terrain</span>
                   </label>

                   <label className="flex items-center space-x-3 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={showBuildings}
                       onChange={(e) => setShowBuildings(e.target.checked)}
                       className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                     />
                     <Building2 className="w-4 h-4 text-green-400" />
                     <span className="text-sm">3D Buildings</span>
                   </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHazards}
                      onChange={(e) => setShowHazards(e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                    />
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Hazard Zones</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUnits}
                      onChange={(e) => setShowUnits(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Emergency Units</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRoutes}
                      onChange={(e) => setShowRoutes(e.target.checked)}
                      className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Evacuation Routes</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnalytics}
                      onChange={(e) => setShowAnalytics(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Analytics Panel</span>
                  </label>
                </div>
              </div>

              {/* Information Panel */}
                             <div className="border-t border-gray-700 pt-6">
                 <h3 className="text-sm font-medium text-gray-300 mb-3">About This Demo</h3>
                 <div className="space-y-2 text-xs text-gray-400">
                   <p>
                     This demonstrates Mapbox's native 3D terrain and building extrusions using real data from Mapbox.
                   </p>
                   <p>
                     <strong>3D Terrain:</strong> Real elevation data from Mapbox heightmap tiles with hillshading.
                   </p>
                   <p>
                     <strong>3D Buildings:</strong> Real building footprints with heights, colored by type.
                   </p>
                   <p>
                     Foundry data is overlaid as interactive layers for disaster response scenarios.
                   </p>
                 </div>
               </div>

              {/* Instructions */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Instructions</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• <strong>Click and drag</strong> to rotate the 3D view</p>
                  <p>• <strong>Scroll</strong> to zoom in/out</p>
                  <p>• <strong>Click on markers</strong> for details</p>
                  <p>• <strong>Use controls</strong> to toggle layers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
                             <div className="h-[700px] relative">
                 <Mapbox3DTerrain
                   center={locations[selectedLocation].coords}
                   zoom={15}
                   pitch={60}
                   bearing={0}
                   showHazards={showHazards}
                   showUnits={showUnits}
                   showRoutes={showRoutes}
                   showAnalytics={showAnalytics}
                   showBuildings={showBuildings}
                   showTerrain={showTerrain}
                   onMapLoad={() => console.log('Mapbox 3D Terrain map loaded')}
                   onHazardClick={handleHazardClick}
                   onUnitClick={handleUnitClick}
                   onRouteClick={handleRouteClick}
                   className="w-full h-full"
                 />
               </div>
            </div>

            {/* Status Bar */}
            <div className="mt-4 bg-black bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    Location: <span className="text-blue-400 font-medium">{locations[selectedLocation].name}</span>
                  </span>
                                     <span className="text-gray-300">
                     View: <span className="text-green-400 font-medium">3D Terrain with Building Extrusions</span>
                   </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black bg-opacity-50 border-t border-gray-700 mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-gray-400">
                         <p>
               Mapbox 3D Terrain Demo • Real terrain and building footprints with Foundry data integration
             </p>
             <p className="mt-1">
               Built with Mapbox GL JS, React, and Foundry Data Fusion
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
