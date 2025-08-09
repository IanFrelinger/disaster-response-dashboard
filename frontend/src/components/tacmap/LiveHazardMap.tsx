import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { foundryService, HazardZone, EvacuationRoute, EmergencyZone } from '../../services/foundryService';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';

interface LiveHazardMapProps {
  showPredictions?: boolean;
  show3D?: boolean;
  autoUpdate?: boolean;
}

export const LiveHazardMap: React.FC<LiveHazardMapProps> = ({
  showPredictions = true,
  show3D = true,
  autoUpdate = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hazardsLoaded, setHazardsLoaded] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const [populationAtRisk, setPopulationAtRisk] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('LiveHazardMap: Initializing with real-time hazard data...');

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 16,
        pitch: show3D ? 60 : 0,
        bearing: 0,
        antialias: true
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('LiveHazardMap: Map loaded successfully!');
        setMapLoaded(true);
        
        // Wait for style to load, then add layers
        setTimeout(() => {
          add3DTerrain(map);
          addLiveHazards(map);
          addLiveRoutes(map);
          addEmergencyZones(map);
          setupRealTimeUpdates();
        }, 1000);
      });

      map.on('error', (e) => {
        console.error('LiveHazardMap: Map error:', e);
      });

    } catch (error) {
      console.error('LiveHazardMap: Error creating map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [show3D]);

  const add3DTerrain = (map: mapboxgl.Map) => {
    try {
      console.log('Adding 3D terrain for hazard visualization...');
      
      map.addSource('mapbox-terrain', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      map.setTerrain({
        'source': 'mapbox-terrain',
        'exaggeration': 1.5
      });

      console.log('3D terrain added successfully');
    } catch (error) {
      console.error('Error adding 3D terrain:', error);
    }
  };

  const addLiveHazards = async (map: mapboxgl.Map) => {
    try {
      console.log('Loading live hazard zones...');
      
      const hazards = await foundryService.getHazardZones();
      
      if (hazards.length === 0) {
        console.log('No hazard zones found');
        return;
      }

      // Create GeoJSON feature collection
      const hazardData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: hazards.map(hazard => ({
          type: 'Feature' as const,
          id: hazard.id,
          geometry: hazard.geometry,
          properties: {
            ...hazard.properties,
            // Add visual properties for Mapbox
            color: getHazardColor(hazard.properties.risk_level),
            opacity: hazard.properties.confidence,
            height: hazard.properties.smoke_height || 50
          }
        }))
      };

      // Add hazard source
      map.addSource('live-hazards', {
        'type': 'geojson',
        'data': hazardData
      });

      // Add 3D hazard zones
      if (show3D) {
        map.addLayer({
          'id': 'hazard-zones-3d',
          'type': 'fill-extrusion',
          'source': 'live-hazards',
          'paint': {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-opacity': ['get', 'opacity'],
            'fill-extrusion-base': 0
          }
        });
      }

      // Add 2D hazard zones
      map.addLayer({
        'id': 'hazard-zones-2d',
        'type': 'fill',
        'source': 'live-hazards',
        'paint': {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['*', ['get', 'opacity'], 0.6],
          'fill-outline-color': '#FF0000'
        }
      });

      // Add hazard labels
      map.addLayer({
        'id': 'hazard-labels',
        'type': 'symbol',
        'source': 'live-hazards',
        'layout': {
          'text-field': ['concat', ['get', 'hazard_type'], ' - ', ['get', 'risk_level']],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
          'text-offset': [0, -1.5],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Add predicted spread if enabled
      if (showPredictions) {
        addPredictedSpread(map, hazards);
      }

      console.log(`Live hazard zones added: ${hazards.length} zones`);
      setHazardsLoaded(true);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error adding live hazards:', error);
    }
  };

  const addPredictedSpread = (map: mapboxgl.Map, hazards: HazardZone[]) => {
    try {
      const predictions = hazards
        .filter(h => h.properties.predicted_spread)
        .map(h => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: h.properties.predicted_spread.coordinates
          },
          properties: {
            hazard_id: h.id,
            time_horizon: h.properties.predicted_spread.time_horizon,
            risk_level: h.properties.risk_level
          }
        }));

      if (predictions.length === 0) return;

      const predictionData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: predictions
      };

      map.addSource('hazard-predictions', {
        'type': 'geojson',
        'data': predictionData
      });

      map.addLayer({
        'id': 'hazard-predictions',
        'type': 'fill',
        'source': 'hazard-predictions',
        'paint': {
          'fill-color': '#FF6600',
          'fill-opacity': 0.3,
          'fill-outline-color': '#FF6600'
        }
      });

      map.addLayer({
        'id': 'prediction-labels',
        'type': 'symbol',
        'source': 'hazard-predictions',
        'layout': {
          'text-field': ['concat', 'Predicted ', ['get', 'time_horizon'], 'h'],
          'text-font': ['Open Sans Regular'],
          'text-size': 10,
          'text-offset': [0, -1],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#FF6600',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log(`Hazard predictions added: ${predictions.length} predictions`);
    } catch (error) {
      console.error('Error adding hazard predictions:', error);
    }
  };

  const addLiveRoutes = async (map: mapboxgl.Map) => {
    try {
      console.log('Loading live evacuation routes...');
      
      const routes = await foundryService.getLiveEvacuationRoutes();
      
      if (routes.length === 0) {
        console.log('No evacuation routes found');
        return;
      }

      // Create GeoJSON feature collection
      const routeData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: routes.map(route => ({
          type: 'Feature' as const,
          id: route.id,
          geometry: route.geometry,
          properties: {
            ...route.properties,
            // Add visual properties
            lineColor: route.properties.is_blocked ? '#FF0000' : '#00FF00',
            lineWidth: route.properties.vehicle_capacity > 400 ? 8 : 6
          }
        }))
      };

      // Add route source
      map.addSource('live-routes', {
        'type': 'geojson',
        'data': routeData
      });

      // Add route lines
      map.addLayer({
        'id': 'evacuation-routes',
        'type': 'line',
        'source': 'live-routes',
        'paint': {
          'line-color': ['get', 'lineColor'],
          'line-width': ['get', 'lineWidth'],
          'line-opacity': 0.8,
          'line-dasharray': [2, 2]
        }
      });

      // Add route markers
      map.addLayer({
        'id': 'route-markers',
        'type': 'circle',
        'source': 'live-routes',
        'paint': {
          'circle-radius': 6,
          'circle-color': ['get', 'lineColor'],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add route labels
      map.addLayer({
        'id': 'route-labels',
        'type': 'symbol',
        'source': 'live-routes',
        'layout': {
          'text-field': ['get', 'routeName'],
          'text-font': ['Open Sans Regular'],
          'text-size': 11,
          'text-offset': [0, -1.5],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log(`Live evacuation routes added: ${routes.length} routes`);
      setRoutesLoaded(true);

    } catch (error) {
      console.error('Error adding live routes:', error);
    }
  };

  const addEmergencyZones = async (map: mapboxgl.Map) => {
    try {
      console.log('Loading emergency zones...');
      
      const zones = await foundryService.getEmergencyZones();
      const populationAtRisk = await foundryService.getPopulationInHazardZones();
      
      setPopulationAtRisk(populationAtRisk);
      
      if (zones.length === 0) {
        console.log('No emergency zones found');
        return;
      }

      // Create GeoJSON feature collection
      const zoneData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: zones.map(zone => ({
          type: 'Feature' as const,
          id: zone.id,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [-122.4220, 37.7720],
              [-122.4180, 37.7720],
              [-122.4180, 37.7760],
              [-122.4220, 37.7760],
              [-122.4220, 37.7720]
            ]]
          },
          properties: {
            ...zone,
            color: getZoneColor(zone.evacuation_status),
            opacity: zone.hazard_exposure
          }
        }))
      };

      // Add zone source
      map.addSource('emergency-zones', {
        'type': 'geojson',
        'data': zoneData
      });

      // Add zone polygons
      map.addLayer({
        'id': 'emergency-zones',
        'type': 'fill',
        'source': 'emergency-zones',
        'paint': {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['*', ['get', 'opacity'], 0.4],
          'fill-outline-color': ['get', 'color']
        }
      });

      // Add zone labels
      map.addLayer({
        'id': 'zone-labels',
        'type': 'symbol',
        'source': 'emergency-zones',
        'layout': {
          'text-field': ['concat', ['get', 'name'], '\n', ['get', 'population'], ' people'],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      console.log(`Emergency zones added: ${zones.length} zones`);
      setZonesLoaded(true);

    } catch (error) {
      console.error('Error adding emergency zones:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    if (!autoUpdate) return;

    console.log('Setting up real-time updates...');
    
    const unsubscribe = foundryService.subscribeToUpdates(async (data) => {
      console.log('Real-time update received:', data);
      
      if (mapRef.current) {
        // Update hazard zones
        const hazardSource = mapRef.current.getSource('live-hazards') as mapboxgl.GeoJSONSource;
        if (hazardSource) {
          const hazards = await foundryService.getHazardZones();
          const hazardData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: hazards.map(hazard => ({
              type: 'Feature' as const,
              id: hazard.id,
              geometry: hazard.geometry,
              properties: {
                ...hazard.properties,
                color: getHazardColor(hazard.properties.risk_level),
                opacity: hazard.properties.confidence,
                height: hazard.properties.smoke_height || 50
              }
            }))
          };
          hazardSource.setData(hazardData);
        }

        // Update routes
        const routeSource = mapRef.current.getSource('live-routes') as mapboxgl.GeoJSONSource;
        if (routeSource) {
          const routes = await foundryService.getLiveEvacuationRoutes();
          const routeData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: routes.map(route => ({
              type: 'Feature' as const,
              id: route.id,
              geometry: route.geometry,
              properties: {
                ...route.properties,
                lineColor: route.properties.is_blocked ? '#FF0000' : '#00FF00',
                lineWidth: route.properties.vehicle_capacity > 400 ? 8 : 6
              }
            }))
          };
          routeSource.setData(routeData);
        }

        // Update population at risk
        const population = await foundryService.getPopulationInHazardZones();
        setPopulationAtRisk(population);
        setLastUpdate(new Date());
      }
    });

    return unsubscribe;
  };

  const getHazardColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical': return '#FF0000';
      case 'high': return '#FF6600';
      case 'medium': return '#FFAA00';
      case 'low': return '#FFFF00';
      default: return '#888888';
    }
  };

  const getZoneColor = (status: string): string => {
    switch (status) {
      case 'mandatory': return '#FF0000';
      case 'voluntary': return '#FF6600';
      case 'completed': return '#00FF00';
      default: return '#888888';
    }
  };

  const handleEvacuationOrder = async (zoneId: string) => {
    try {
      console.log(`Issuing evacuation order for zone: ${zoneId}`);
      
      const result = await foundryService.issueEvacuation({
        zone_id: zoneId,
        type: 'mandatory',
        message: `Evacuate zone ${zoneId} immediately`,
        routes: ['route-primary-001', 'route-secondary-002'],
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

      console.log('Evacuation order result:', result);
      
      // Show notification
      showNotification({
        title: 'Evacuation Ordered',
        body: `${result.affected_population} residents notified`,
        style: 'success'
      });

    } catch (error) {
      console.error('Error issuing evacuation order:', error);
      showNotification({
        title: 'Evacuation Failed',
        body: 'Failed to issue evacuation order',
        style: 'error'
      });
    }
  };

  const showNotification = (notification: { title: string; body: string; style: 'success' | 'error' }) => {
    // TODO: Implement iOS-style notification system
    console.log('Notification:', notification);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Live Data Status Panel */}
      {mapLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-lg)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '280px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: hazardsLoaded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: hazardsLoaded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {hazardsLoaded ? 'Live Hazards Active' : 'Loading Live Hazards...'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: routesLoaded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: routesLoaded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {routesLoaded ? 'Live Routes Active' : 'Loading Live Routes...'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: zonesLoaded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: zonesLoaded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {zonesLoaded ? 'Emergency Zones Active' : 'Loading Emergency Zones...'}
            </span>
          </div>

          {lastUpdate && (
            <div style={{ 
              marginTop: 'var(--ios-spacing-sm)',
              paddingTop: 'var(--ios-spacing-sm)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span className="ios-caption" style={{ 
                margin: 0, 
                color: '#CCCCCC',
                fontSize: '11px',
                letterSpacing: '-0.022em'
              }}>
                Last Update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Population at Risk Panel */}
      {populationAtRisk > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          right: 'var(--ios-spacing-md)', 
          background: 'rgba(255, 0, 0, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-lg)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <h3 className="ios-body" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-xs)',
            fontWeight: '700',
            color: '#FFFFFF',
            fontSize: '16px',
            letterSpacing: '-0.022em'
          }}>🚨 CRITICAL</h3>
          <p className="ios-caption" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-sm)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '-0.022em'
          }}>
            {populationAtRisk.toLocaleString()} Lives at Risk
          </p>
          <button 
            onClick={() => handleEvacuationOrder('zone-downtown-001')}
            className="ios-button"
            style={{
              background: '#FFFFFF',
              color: '#FF0000',
              border: 'none',
              padding: 'var(--ios-spacing-sm) var(--ios-spacing-md)',
              borderRadius: 'var(--ios-border-radius-medium)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '-0.022em'
            }}
          >
            Issue Evacuation
          </button>
        </div>
      )}

      {/* Map Controls Info */}
      <div style={{ 
        position: 'absolute', 
        bottom: 'var(--ios-spacing-md)', 
        right: 'var(--ios-spacing-md)', 
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 'var(--ios-border-radius-xl)',
        padding: 'var(--ios-spacing-lg)',
        boxShadow: 'var(--ios-shadow-medium)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1000,
        maxWidth: '320px',
        minWidth: '280px'
      }}>
        <h4 className="ios-body" style={{ 
          margin: 0, 
          marginBottom: 'var(--ios-spacing-sm)', 
          fontWeight: '700',
          color: '#FFFFFF',
          fontSize: '16px',
          letterSpacing: '-0.022em'
        }}>Live Hazard Map</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Real-time hazard zones with 3D visualization</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• AI-powered spread predictions</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Dynamic evacuation routes</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Population risk assessment</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Auto-updates every 5 seconds</p>
        </div>
      </div>
    </div>
  );
};
