import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';

export const SimpleMapboxTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [buildingsAdded, setBuildingsAdded] = useState(false);
  const [terrainAdded, setTerrainAdded] = useState(false);
  const [escapeRouteAdded, setEscapeRouteAdded] = useState(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('SimpleMapboxTest: Initializing map with 3D terrain and escape route...');
    console.log('Mapbox available:', !!mapboxgl);
    console.log('Mapbox Map available:', !!mapboxgl.Map);
    console.log('Access token:', mapboxgl.accessToken);

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Back to dark style
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 16, // Higher zoom for 3D buildings
        pitch: 60, // More dramatic pitch for 3D effect
        bearing: 0,
        antialias: true
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('SimpleMapboxTest: Map loaded successfully!');
        setMapLoaded(true);
        
        // Wait a bit for the style to fully load
        setTimeout(() => {
          add3DTerrain(map);
          add3DBuildings(map);
          addEscapeRoute(map);
        }, 1000);
      });

      map.on('error', (e) => {
        console.error('SimpleMapboxTest: Map error:', e);
      });

      // Add 3D buildings when zoom changes to appropriate level
      map.on('zoom', () => {
        if (map.getZoom() >= 15 && !buildingsAdded) {
          add3DBuildings(map);
        }
      });

    } catch (error) {
      console.error('SimpleMapboxTest: Error creating map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [buildingsAdded, terrainAdded, escapeRouteAdded]);

  const add3DTerrain = (map: mapboxgl.Map) => {
    try {
      console.log('Adding 3D terrain...');
      
      // Add terrain source
      map.addSource('mapbox-terrain', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Add terrain layer
      map.setTerrain({
        'source': 'mapbox-terrain',
        'exaggeration': 1.5 // Exaggerate terrain height for better visibility
      });

      console.log('3D terrain added successfully');
      setTerrainAdded(true);

    } catch (error) {
      console.error('Error adding 3D terrain:', error);
      
      // Fallback: try with different terrain source
      try {
        console.log('Trying fallback terrain approach...');
        map.addSource('terrain-source', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.terrain-rgb',
          'tileSize': 256,
          'maxzoom': 15
        });

        map.setTerrain({
          'source': 'terrain-source',
          'exaggeration': 1.0
        });
        
        console.log('Fallback terrain added');
        setTerrainAdded(true);
      } catch (fallbackError) {
        console.error('Fallback terrain also failed:', fallbackError);
      }
    }
  };

  const add3DBuildings = (map: mapboxgl.Map) => {
    try {
      console.log('Adding 3D buildings with terrain...');
      
      // Remove existing layer if it exists
      if (map.getLayer('3d-buildings')) {
        map.removeLayer('3d-buildings');
      }

      // Check if the source exists
      if (!map.getSource('composite')) {
        console.log('Composite source not available, trying alternative approach...');
        return;
      }

      // Add 3D buildings with terrain integration
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#007AFF', // iOS blue for hover
            '#8E8E93'  // iOS gray for normal
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8,
          'fill-extrusion-translate': [0, 0],
          'fill-extrusion-translate-anchor': 'map'
        }
      });

      console.log('3D buildings layer added successfully with terrain');
      setBuildingsAdded(true);

      // Add hover effect
      map.on('mouseenter', '3d-buildings', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', '3d-buildings', () => {
        map.getCanvas().style.cursor = '';
      });

    } catch (error) {
      console.error('Error adding 3D buildings:', error);
      
      // Fallback: try with a different approach
      try {
        console.log('Trying fallback 3D buildings approach...');
        map.addLayer({
          'id': '3d-buildings-fallback',
          'source': 'composite',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#007AFF',
            'fill-extrusion-height': 50, // Fixed height as fallback
            'fill-extrusion-opacity': 0.6
          }
        });
        console.log('Fallback 3D buildings added');
        setBuildingsAdded(true);
      } catch (fallbackError) {
        console.error('Fallback 3D buildings also failed:', fallbackError);
      }
    }
  };

  const addEscapeRoute = (map: mapboxgl.Map) => {
    try {
      console.log('Adding example escape route with enhanced tooltips...');
      
      // Example escape route data - San Francisco evacuation route
      const escapeRouteData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              routeName: 'Primary Evacuation Route',
              status: 'Active',
              estimatedTime: '15 minutes',
              capacity: 'High',
              description: 'Main evacuation route from downtown to safe zone',
              tooltip: '🚨 Primary Route: 15 min • High Capacity • Active • This is a longer tooltip to test text wrapping and scaling capabilities with multiple lines of content'
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.4194, 37.7749], // Starting point (downtown SF)
                [-122.4150, 37.7800], // North
                [-122.4100, 37.7850], // Northeast
                [-122.4050, 37.7900], // Further northeast
                [-122.4000, 37.7950], // Safe zone destination
              ]
            }
          },
          {
            type: 'Feature',
            properties: {
              routeName: 'Secondary Evacuation Route',
              status: 'Active',
              estimatedTime: '20 minutes',
              capacity: 'Medium',
              description: 'Alternative evacuation route via waterfront',
              tooltip: '🟠 Secondary Route: 20 min • Medium Capacity • Active • Alternative path with different characteristics and longer description for testing'
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.4194, 37.7749], // Starting point (downtown SF)
                [-122.4250, 37.7750], // West
                [-122.4300, 37.7750], // Further west
                [-122.4350, 37.7800], // Northwest
                [-122.4400, 37.7850], // Safe zone destination
              ]
            }
          }
        ]
      };

      // Add escape route source
      map.addSource('escape-routes', {
        'type': 'geojson',
        'data': escapeRouteData
      });

      // Add primary escape route layer
      map.addLayer({
        'id': 'escape-route-primary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeName', 'Primary Evacuation Route'],
        'paint': {
          'line-color': '#FF3B30', // iOS red for emergency routes
          'line-width': 6,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2] // Dashed line for evacuation route
        }
      });

      // Add secondary escape route layer
      map.addLayer({
        'id': 'escape-route-secondary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeName', 'Secondary Evacuation Route'],
        'paint': {
          'line-color': '#FF9500', // iOS orange for secondary route
          'line-width': 4,
          'line-opacity': 0.6,
          'line-dasharray': [1, 1] // Different dash pattern
        }
      });

      // Add route markers
      map.addLayer({
        'id': 'escape-route-markers',
        'type': 'circle',
        'source': 'escape-routes',
        'paint': {
          'circle-radius': 8,
          'circle-color': '#FF3B30',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add route labels
      map.addLayer({
        'id': 'escape-route-labels',
        'type': 'symbol',
        'source': 'escape-routes',
        'layout': {
          'text-field': ['get', 'routeName'],
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-offset': [0, -1.5],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log('Escape route added successfully');
      setEscapeRouteAdded(true);

      // Enhanced mouse over feedback and tooltips
      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['escape-route-primary', 'escape-route-secondary']
        });

        if (features.length > 0) {
          const feature = features[0];
          const properties = feature.properties;
          
          if (properties && properties.tooltip) {
            setTooltip({
              visible: true,
              content: properties.tooltip,
              x: e.point.x,
              y: e.point.y
            });
          }
        } else {
          setTooltip(prev => ({ ...prev, visible: false }));
        }
      };

      // Add mouse move listener for tooltips
      map.on('mousemove', handleMouseMove);

      // Enhanced hover effects for primary route
      map.on('mouseenter', 'escape-route-primary', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('escape-route-primary', 'line-width', 8);
        map.setPaintProperty('escape-route-primary', 'line-opacity', 1.0);
        
        // Add glow effect
        map.setPaintProperty('escape-route-primary', 'line-color', '#FF6B6B');
        
        // Show tooltip
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          setTooltip({
            visible: true,
            content: properties.tooltip || '🚨 Primary Evacuation Route',
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'escape-route-primary', () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('escape-route-primary', 'line-width', 6);
        map.setPaintProperty('escape-route-primary', 'line-opacity', 0.8);
        map.setPaintProperty('escape-route-primary', 'line-color', '#FF3B30');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Enhanced hover effects for secondary route
      map.on('mouseenter', 'escape-route-secondary', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('escape-route-secondary', 'line-width', 6);
        map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.9);
        
        // Add glow effect
        map.setPaintProperty('escape-route-secondary', 'line-color', '#FFB347');
        
        // Show tooltip
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          setTooltip({
            visible: true,
            content: properties.tooltip || '🟠 Secondary Evacuation Route',
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'escape-route-secondary', () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('escape-route-secondary', 'line-width', 4);
        map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.6);
        map.setPaintProperty('escape-route-secondary', 'line-color', '#FF9500');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Click interaction for route information
      map.on('click', 'escape-route-primary', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const geometry = feature.geometry as GeoJSON.LineString;
          const properties = feature.properties;
          
          if (geometry.coordinates && properties) {
            // Create popup with route information
            const popup = new mapboxgl.Popup()
              .setLngLat([geometry.coordinates[0][0], geometry.coordinates[0][1]])
              .setHTML(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; color: #FF3B30; font-size: 16px;">${properties.routeName}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Status:</strong> ${properties.status}</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Time:</strong> ${properties.estimatedTime}</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Capacity:</strong> ${properties.capacity}</p>
                  <p style="margin: 0; font-size: 12px; color: #8E8E93;">${properties.description}</p>
                </div>
              `)
              .addTo(map);
          }
        }
      });

      map.on('click', 'escape-route-secondary', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const geometry = feature.geometry as GeoJSON.LineString;
          const properties = feature.properties;
          
          if (geometry.coordinates && properties) {
            // Create popup with route information
            const popup = new mapboxgl.Popup()
              .setLngLat([geometry.coordinates[0][0], geometry.coordinates[0][1]])
              .setHTML(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; color: #FF9500; font-size: 16px;">${properties.routeName}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Status:</strong> ${properties.status}</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Time:</strong> ${properties.estimatedTime}</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Capacity:</strong> ${properties.capacity}</p>
                  <p style="margin: 0; font-size: 12px; color: #8E8E93;">${properties.description}</p>
                </div>
              `)
              .addTo(map);
          }
        }
      });

    } catch (error) {
      console.error('Error adding escape route:', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Enhanced iOS-style loading indicator */}
      {!mapLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-md)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '200px'
        }}>
          <div className="ios-spinner" style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid var(--ios-blue)',
            borderRadius: '50%',
            animation: 'ios-spin 1s linear infinite'
          }}></div>
          <span className="ios-caption" style={{ 
            margin: 0, 
            fontWeight: '600',
            color: '#FFFFFF',
            fontSize: '14px',
            letterSpacing: '-0.022em'
          }}>Loading 3D Map...</span>
        </div>
      )}
      
      {/* Enhanced iOS-style status indicator */}
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
          minWidth: '220px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: terrainAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: terrainAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {terrainAdded ? '3D Terrain Loaded' : 'Loading 3D Terrain...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: buildingsAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: buildingsAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {buildingsAdded ? '3D Buildings Loaded' : 'Loading 3D Buildings...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: escapeRouteAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: escapeRouteAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {escapeRouteAdded ? 'Escape Routes Loaded' : 'Loading Escape Routes...'}
            </span>
          </div>
        </div>
      )}
      
      {/* Enhanced Robust Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 10, window.innerWidth - 320), // Prevent overflow
          top: Math.max(tooltip.y - 40, 10), // Prevent overflow
          background: 'rgba(0, 0, 0, 0.95)',
          color: '#FFFFFF',
          padding: 'var(--ios-spacing-md)',
          borderRadius: 'var(--ios-border-radius-large)',
          fontSize: '13px',
          fontWeight: '500',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          zIndex: 2000,
          pointerEvents: 'none',
          maxWidth: '300px',
          minWidth: '200px',
          boxShadow: 'var(--ios-shadow-large)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          lineHeight: '1.4',
          letterSpacing: '-0.022em',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {tooltip.content}
          <div style={{
            position: 'absolute',
            left: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(0, 0, 0, 0.95)'
          }}></div>
        </div>
      )}
      
      {/* Enhanced iOS-style map controls info */}
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
        }}>3D Map Controls</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Drag to rotate</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Scroll to zoom</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Right-click to tilt</p>
        </div>
        <div style={{ 
          marginTop: 'var(--ios-spacing-sm)', 
          paddingTop: 'var(--ios-spacing-sm)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p className="ios-caption" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-xs)',
            fontWeight: '600',
            color: '#FFFFFF',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>
            Features:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• 3D Terrain with elevation</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• 3D Buildings on terrain</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Emergency escape routes</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Hover for tooltips</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Click routes for details</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Zoom to 15+ for buildings</p>
          </div>
        </div>
      </div>
    </div>
  );
};
