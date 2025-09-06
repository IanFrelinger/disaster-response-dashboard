import React, { useRef, useState, useEffect, useCallback } from 'react';
// import { MapProviderComponent, FakeMapProvider } from './MapProvider';
import type { Scenario } from '../../utils/ScenarioBuilder';
import { sampleBuildings, generateRandomBuildings } from '../../data/sampleBuildings';
import type { BuildingFeature, BuildingFilter } from '../../types/building';
// import type { TerrainConfig, ElevationProfile, TerrainMetrics } from '../../types/terrain';
import type { RouteOptimization, RouteOptimizationResult, RouteComparison, HazardZone, TrafficCondition } from '../../types/routing';
import { RealTimeDashboard } from '../realtime/RealTimeDashboard';

interface SimpleMapboxTestProps {
  scenario?: Scenario;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  showTerrain?: boolean;
  showBuildings?: boolean;
  showRoutes?: boolean;
  showWaypoints?: boolean;
}

const SimpleMapboxTest: React.FC<SimpleMapboxTestProps> = ({
  scenario,
  center = [-122.4194, 37.7749],
  zoom = 12,
  pitch = 45,
  bearing = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<BuildingFeature[]>([]);
  const [buildingFilter, setBuildingFilter] = useState<BuildingFilter>({});
  const [showBuildings, setShowBuildings] = useState(true);
  const [buildingMetrics, setBuildingMetrics] = useState<any>(null);
  
  // Terrain state
  const [terrainConfig, setTerrainConfig] = useState<any>({
    source: 'mapbox-terrain',
    exaggeration: 1.5,
    enableHillshade: true,
    enable3D: true,
    maxZoom: 18,
    minZoom: 10
  });
  const [showTerrain, setShowTerrain] = useState(true);
  const [elevationProfile, setElevationProfile] = useState<any | null>(null);
  const [terrainMetrics, setTerrainMetrics] = useState<any | null>(null);
  const [currentElevation, setCurrentElevation] = useState<number | null>(null);

  // Routing state
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization>({
    startPoint: [center[0] - 0.01, center[1] - 0.01],
    destinationPoint: [center[0] + 0.01, center[1] + 0.01],
    constraints: {
      maxDistance: 10,
      maxTime: 30,
      maxSlope: 20,
      avoidHazards: true,
      emergencyPriority: 'high',
      vehicleType: 'fire_truck'
    },
    optimization: 'balanced',
    preferences: {
      weightDistance: 0.25,
      weightTime: 0.25,
      weightSafety: 0.25,
      weightAccessibility: 0.25
    }
  });
  const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);
  const [routeComparison, setRouteComparison] = useState<RouteComparison | null>(null);

  // Real-time dashboard state
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Add map features after map is ready
  const addMapFeatures = useCallback(async (_mapHandle: any) => {
    try {
      console.log('🚀 Adding map features...');

      if (scenario) {
        // Add scenario-based features
        if (scenario.waypoints && scenario.waypoints.length > 0) {
          console.log('📍 Adding waypoints...');
          // Add waypoint features
        }

        if (scenario.routes && scenario.routes.length > 0) {
          console.log('🛣️ Adding routes...');
          // Add route features
        }

        if (scenario.buildings && scenario.buildings.length > 0) {
          console.log('🏢 Adding scenario buildings...');
          // Convert scenario buildings to BuildingFeature format
          const convertedBuildings: BuildingFeature[] = scenario.buildings.map(building => ({
            id: building.id,
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [building.coordinates[0] - 0.0001, building.coordinates[1] - 0.0001],
                [building.coordinates[0] + 0.0001, building.coordinates[1] - 0.0001],
                [building.coordinates[0] + 0.0001, building.coordinates[1] + 0.0001],
                [building.coordinates[0] - 0.0001, building.coordinates[1] + 0.0001],
                [building.coordinates[0] - 0.0001, building.coordinates[1] - 0.0001]
              ]]
            },
            properties: {
              height: building.height || 30,
              min_height: 0,
              building_type: building.name || 'Building',
              emergency_access: Math.random() > 0.5,
              population_capacity: Math.floor(Math.random() * 200) + 50,
              hazard_level: 'low'
            }
          }));
          setBuildings(convertedBuildings);
        }
      }

      // Add sample buildings if none from scenario
      if (buildings.length === 0) {
        console.log('🏢 Adding sample buildings...');
        setBuildings(sampleBuildings);
      }

      console.log('✅ All map features added successfully');
    } catch (error) {
      console.error('❌ Error adding map features:', error);
    }
  }, [scenario, buildings.length]);

  // Main useEffect for map initialization
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    try {
      setMapLoaded(true);
      
      // Add map features after a short delay to ensure map is ready
      setTimeout(() => {
        if (scenario) {
          addMapFeatures({} as any); // This will be replaced by the actual map instance
        }
      }, 100);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Map initialization error: ${error}`);
    }
  }, [scenario, addMapFeatures]);

  // Update building metrics when buildings change
  useEffect(() => {
    if (buildings.length > 0) {
      try {
        const testApi = (window as any).__mapTestApi__;
        if (testApi?.getBuildingMetrics) {
          const metrics = testApi.getBuildingMetrics();
          if (metrics) {
            setBuildingMetrics(metrics);
          }
        }
      } catch (error) {
        console.log('Building metrics not available yet');
      }
    }
  }, [buildings]);

  // Handle building filter changes
  const handleBuildingFilterChange = (filter: Partial<BuildingFilter>) => {
    const newFilter = { ...buildingFilter, ...filter };
    setBuildingFilter(newFilter);
    
    // Apply filter to buildings
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.filterBuildings) {
        const filteredBuildings = testApi.filterBuildings(newFilter);
        console.log('Filtered buildings:', filteredBuildings.length);
      }
    } catch (error) {
      console.log('Building filtering not available yet');
    }
  };

  // Generate random buildings for testing
  const handleGenerateRandomBuildings = (count: number) => {
    const randomBuildings = generateRandomBuildings(count);
    setBuildings(randomBuildings);
    console.log(`Generated ${count} random buildings`);
  };

  // Terrain functions
  const handleTerrainConfigChange = (config: Partial<any>) => {
    const newConfig = { ...terrainConfig, ...config };
    setTerrainConfig(newConfig);
    
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.updateTerrainConfig) {
        testApi.updateTerrainConfig(newConfig);
      }
    } catch (error) {
      console.log('Terrain config update not available yet');
    }
  };

  const handleToggleTerrain = () => {
    const newShowTerrain = !showTerrain;
    setShowTerrain(newShowTerrain);
    
    try {
      const testApi = (window as any).__mapTestApi__;
      if (newShowTerrain && testApi?.enable3DTerrain) {
        testApi.enable3DTerrain();
      } else if (!newShowTerrain && testApi?.disable3DTerrain) {
        testApi.disable3DTerrain();
      }
    } catch (error) {
      console.log('Terrain toggle not available yet');
    }
  };

  const handleGetElevation = async () => {
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.getElevation) {
        const elevation = await testApi.getElevation(center[0], center[1]);
        setCurrentElevation(elevation);
        console.log('Current elevation:', elevation, 'meters');
      }
    } catch (error) {
      console.log('Elevation query not available yet');
    }
  };

  const handleCalculateElevationProfile = async () => {
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.calculateElevationProfile) {
        // Create a sample route around the center
        const routeCoordinates: [number, number][] = [
          [center[0] - 0.01, center[1] - 0.01],
          [center[0] + 0.01, center[1] - 0.01],
          [center[0] + 0.01, center[1] + 0.01],
          [center[0] - 0.01, center[1] + 0.01],
          [center[0] - 0.01, center[1] - 0.01]
        ];
        
        const profile = await testApi.calculateElevationProfile(routeCoordinates);
        setElevationProfile(profile);
        console.log('Elevation profile calculated:', profile);
      }
    } catch (error) {
      console.log('Elevation profile calculation not available yet');
    }
  };

  const handleGetTerrainMetrics = async () => {
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.getTerrainMetrics) {
        const bounds: [[number, number], [number, number]] = [
          [center[0] - 0.01, center[1] - 0.01],
          [center[0] + 0.01, center[1] + 0.01]
        ];
        
        const metrics = await testApi.getTerrainMetrics(bounds);
        setTerrainMetrics(metrics);
        console.log('Terrain metrics calculated:', metrics);
      }
    } catch (error) {
      console.log('Terrain metrics calculation not available yet');
    }
  };

  // Routing functions
  const handleRouteOptimizationChange = (changes: Partial<RouteOptimization>) => {
    setRouteOptimization(prev => ({ ...prev, ...changes }));
  };

  const handleOptimizeRoute = async () => {
    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.optimizeRoute) {
        const result = await testApi.optimizeRoute(routeOptimization);
        setRouteResult(result);
        console.log('Route optimization result:', result);
      }
    } catch (error) {
      console.log('Route optimization not available yet');
    }
  };

  const handleCompareRoutes = async () => {
    if (!routeResult || routeResult.routes.length < 2) {
      console.log('Need at least 2 routes to compare');
      return;
    }

    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.compareRoutes) {
        const routeIds = routeResult.routes.map(route => route.id);
        const comparison = await testApi.compareRoutes(routeIds);
        setRouteComparison(comparison);
        console.log('Route comparison:', comparison);
      }
    } catch (error) {
      console.log('Route comparison not available yet');
    }
  };

  const handleAddHazardZone = () => {
    const hazard: HazardZone = {
      id: `hazard-${Date.now()}`,
      type: 'fire',
      coordinates: [
        [center[0] - 0.001, center[1] - 0.001],
        [center[0] + 0.001, center[1] - 0.001],
        [center[0] + 0.001, center[1] + 0.001],
        [center[0] - 0.001, center[1] + 0.001]
      ],
      center: [center[0], center[1]],
      radius: 0.002,
      severity: 'high',
      properties: {
        name: 'Test Fire Hazard',
        description: 'Simulated fire hazard for testing',
        startTime: new Date(),
        affectedArea: 0.000004,
        populationAtRisk: 50,
        evacuationRoutes: ['test-evac-1'],
        emergencyContacts: ['test-911'],
        status: 'active'
      },
      avoidance: {
        enabled: true,
        bufferDistance: 0.003,
        alternativeRoutes: ['test-alt-1'],
        priority: 'must_avoid'
      }
    };

    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.addHazardZone) {
        testApi.addHazardZone(hazard);
        console.log('Added hazard zone:', hazard);
      }
    } catch (error) {
      console.log('Hazard zone management not available yet');
    }
  };

  const handleAddTrafficCondition = () => {
    const traffic: TrafficCondition = {
      id: `traffic-${Date.now()}`,
      location: [center[0] + 0.002, center[1] + 0.002],
      type: 'accident',
      severity: 'medium',
      properties: {
        description: 'Test traffic accident',
        startTime: new Date(),
        affectedLanes: 1,
        delay: 10,
        detourAvailable: true,
        emergencyAccess: true
      }
    };

    try {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.addTrafficCondition) {
        testApi.addTrafficCondition(traffic);
        console.log('Added traffic condition:', traffic);
      }
    } catch (error) {
      console.log('Traffic condition management not available yet');
    }
  };

  // Don't render the MapProviderComponent until we have a container
  if (!containerRef.current) {
    return (
      <div className="simple-mapbox-test" style={{ width: '100%', height: '400px', position: 'relative' }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0'
          }} 
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <div>Initializing map...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: 'red', 
        backgroundColor: '#ffe6e6', 
        border: '1px solid red',
        borderRadius: '4px'
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // Determine which provider to use based on configuration
  const getProvider = () => {
    // Always use FakeMapProvider for now to isolate the issue
    console.log('Using FakeMapProvider for testing');
    return null; // FakeMapProvider not available
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Building Controls */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label>
          <input
            type="checkbox"
            checked={showBuildings}
            onChange={(e) => setShowBuildings(e.target.checked)}
          />
          Show Buildings
        </label>
        
        <button 
          onClick={() => handleGenerateRandomBuildings(10)}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Generate 10 Buildings
        </button>
        
        <button 
          onClick={() => handleGenerateRandomBuildings(100)}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Generate 100 Buildings
        </button>
        
        <select
          value={buildingFilter.buildingTypes?.[0] || ''}
          onChange={(e) => handleBuildingFilterChange(
            e.target.value ? { buildingTypes: [e.target.value] } : {}
          )}
          style={{ padding: '5px', fontSize: '12px' }}
        >
          <option value="">All Building Types</option>
          <option value="Office Building">Office</option>
          <option value="Residential">Residential</option>
          <option value="Hospital">Hospital</option>
          <option value="School">School</option>
          <option value="Warehouse">Warehouse</option>
        </select>
        
        <select
          value={buildingFilter.hazardLevel?.[0] || ''}
          onChange={(e) => handleBuildingFilterChange(
            e.target.value ? { hazardLevel: [e.target.value] } : {}
          )}
          style={{ padding: '5px', fontSize: '12px' }}
        >
          <option value="">All Hazard Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        
        <label>
          <input
            type="checkbox"
            checked={buildingFilter.emergencyAccess || false}
            onChange={(e) => handleBuildingFilterChange(
              e.target.checked ? { emergencyAccess: true } : {}
            )}
          />
          Emergency Access Only
        </label>
      </div>

      {/* Terrain Controls */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label>
          <input
            type="checkbox"
            checked={showTerrain}
            onChange={handleToggleTerrain}
          />
          Show 3D Terrain
        </label>
        
        <label>
          Exaggeration:
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={terrainConfig.exaggeration}
            onChange={(e) => handleTerrainConfigChange({ exaggeration: parseFloat(e.target.value) })}
            style={{ marginLeft: '5px', width: '80px' }}
          />
          {terrainConfig.exaggeration.toFixed(1)}x
        </label>
        
        <button 
          onClick={handleGetElevation}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Get Elevation
        </button>
        
        <button 
          onClick={handleCalculateElevationProfile}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Calculate Profile
        </button>
        
        <button 
          onClick={handleGetTerrainMetrics}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Get Terrain Metrics
        </button>
      </div>

      {/* Routing Controls */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#fff3e0', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label>
          Optimization:
          <select
            value={routeOptimization.optimization}
            onChange={(e) => handleRouteOptimizationChange({ 
              optimization: e.target.value as any 
            })}
            style={{ marginLeft: '5px', padding: '3px', fontSize: '12px' }}
          >
            <option value="fastest">Fastest</option>
            <option value="shortest">Shortest</option>
            <option value="safest">Safest</option>
            <option value="most_accessible">Most Accessible</option>
            <option value="balanced">Balanced</option>
          </select>
        </label>
        
        <label>
          Vehicle:
          <select
            value={routeOptimization.constraints.vehicleType || 'general'}
            onChange={(e) => handleRouteOptimizationChange({ 
              constraints: { ...routeOptimization.constraints, vehicleType: e.target.value as any }
            })}
            style={{ marginLeft: '5px', padding: '3px', fontSize: '12px' }}
          >
            <option value="fire_truck">Fire Truck</option>
            <option value="ambulance">Ambulance</option>
            <option value="police">Police</option>
            <option value="general">General</option>
          </select>
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={routeOptimization.constraints.avoidHazards || false}
            onChange={(e) => handleRouteOptimizationChange({ 
              constraints: { ...routeOptimization.constraints, avoidHazards: e.target.checked }
            })}
          />
          Avoid Hazards
        </label>
        
        <button 
          onClick={handleOptimizeRoute}
          style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#4caf50', color: 'white' }}
        >
          Optimize Route
        </button>
        
        <button 
          onClick={handleCompareRoutes}
          style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#2196f3', color: 'white' }}
          disabled={!routeResult || routeResult.routes.length < 2}
        >
          Compare Routes
        </button>
        
        <button 
          onClick={handleAddHazardZone}
          style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ff9800', color: 'white' }}
        >
          Add Hazard
        </button>
        
        <button 
          onClick={handleAddTrafficCondition}
          style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#9c27b0', color: 'white' }}
        >
          Add Traffic
        </button>
      </div>

      {/* Real-Time Dashboard Toggle */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f3e5f5', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setShowRealTimeDashboard(!showRealTimeDashboard)}
          style={{ 
            padding: '8px 16px', 
            fontSize: '14px',
            backgroundColor: showRealTimeDashboard ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {showRealTimeDashboard ? 'Hide' : 'Show'} Real-Time Dashboard
        </button>
        {showRealTimeDashboard && (
          <span style={{ fontSize: '12px', color: '#6c757d' }}>
            Live data feeds and system monitoring
          </span>
        )}
      </div>

      {/* Building Metrics */}
      {buildingMetrics && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e9ecef', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <span><strong>Total:</strong> {buildingMetrics.totalBuildings}</span>
          <span><strong>Avg Height:</strong> {buildingMetrics.averageHeight?.toFixed(1)}m</span>
          <span><strong>Emergency Access:</strong> {buildingMetrics.emergencyAccessCount}</span>
          <span><strong>High Hazard:</strong> {buildingMetrics.highHazardCount}</span>
          <span><strong>Total Capacity:</strong> {buildingMetrics.totalCapacity}</span>
        </div>
      )}

      {/* Terrain Metrics */}
      {terrainMetrics && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <span><strong>Avg Elevation:</strong> {terrainMetrics.averageElevation?.toFixed(1)}m</span>
          <span><strong>Elevation Range:</strong> {terrainMetrics.elevationRange?.[0]?.toFixed(1)}m - {terrainMetrics.elevationRange?.[1]?.toFixed(1)}m</span>
          <span><strong>Avg Slope:</strong> {terrainMetrics.slopeMetrics?.average?.toFixed(1)}%</span>
          <span><strong>Steep Areas:</strong> {terrainMetrics.slopeMetrics?.steepCount}</span>
          <span><strong>Area Covered:</strong> {terrainMetrics.areaCovered?.toFixed(3)} km²</span>
        </div>
      )}

      {/* Current Elevation */}
      {currentElevation !== null && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <strong>Current Location Elevation:</strong> {currentElevation.toFixed(1)} meters
        </div>
      )}

      {/* Elevation Profile */}
      {elevationProfile && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d1ecf1', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span><strong>Total Distance:</strong> {elevationProfile.totalDistance?.toFixed(3)} km</span>
          <span><strong>Elevation Gain:</strong> {elevationProfile.totalElevationGain?.toFixed(1)} m</span>
          <span><strong>Elevation Loss:</strong> {elevationProfile.totalElevationLoss?.toFixed(1)} m</span>
          <span><strong>Max Slope:</strong> {elevationProfile.maxSlope?.toFixed(1)}%</span>
          <span><strong>Avg Slope:</strong> {elevationProfile.averageSlope?.toFixed(1)}%</span>
        </div>
      )}

      {/* Route Results */}
      {routeResult && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f3e5f5', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Route Optimization Results:</strong> {routeResult.success ? 'Success' : 'Failed'}
            {routeResult.success && (
              <span style={{ marginLeft: '20px' }}>
                <strong>Best Route:</strong> {routeResult.bestRoute.name} 
                (Distance: {routeResult.bestRoute.totalDistance.toFixed(3)} km, 
                Time: {routeResult.bestRoute.totalTime.toFixed(1)} min)
              </span>
            )}
          </div>
          
          {routeResult.success && routeResult.routes.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span><strong>Routes Found:</strong> {routeResult.routes.length}</span>
              <span><strong>Optimization Time:</strong> {routeResult.optimizationTime.toFixed(0)}ms</span>
              <span><strong>Constraints Satisfied:</strong> {routeResult.constraints.satisfied.length}</span>
              {routeResult.constraints.violated.length > 0 && (
                <span style={{ color: 'red' }}>
                  <strong>Violated:</strong> {routeResult.constraints.violated.length}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Route Comparison */}
      {routeComparison && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e0f2f1', 
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Route Comparison:</strong>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span><strong>Best Distance:</strong> {routeComparison.comparison.bestDistance}</span>
            <span><strong>Best Time:</strong> {routeComparison.comparison.bestTime}</span>
            <span><strong>Best Safety:</strong> {routeComparison.comparison.bestSafety}</span>
            <span><strong>Best Accessibility:</strong> {routeComparison.comparison.bestAccessibility}</span>
            <span><strong>Overall Best:</strong> {routeComparison.comparison.overallBest}</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          ref={containerRef}
          style={{ 
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0'
          }} 
        >
          <div className="simple-mapbox-test" style={{ width: '100%', height: '400px', position: 'relative' }}>
            <div 
              ref={containerRef} 
              style={{ 
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0'
              }} 
            />
            {!mapLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
              }}>
                <div>Loading map...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Dashboard */}
      {showRealTimeDashboard && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6'
        }}>
          <RealTimeDashboard 
            showSystemStatus={true}
            showDataFeeds={true}
            showLiveUpdates={true}
            maxUpdates={25}
          />
        </div>
      )}
    </div>
  );
};

export default SimpleMapboxTest;
