import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { enhancedRoutingService, type EnhancedRouteRequest, type EnhancedRouteResponse } from '../../../services/enhancedRoutingService';

interface EnhancedRoutingLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  origin?: [number, number];
  destination?: [number, number];
  vehicleType?: 'civilian' | 'fire_engine' | 'ambulance' | 'police_car' | 'rescue_truck';
  priority?: 'safest' | 'fastest' | 'balanced';
  profile?: 'CIVILIAN_EVACUATION' | 'EMS_RESPONSE' | 'FIRE_TACTICAL' | 'POLICE_ESCORT';
  
  // Enhanced constraints
  terrainConstraints?: {
    maxSlope: number;
    avoidSteepTerrain: boolean;
    preferFlatRoutes: boolean;
    elevationBuffer: number;
  };
  obstacleConstraints?: {
    avoidBuildings: boolean;
    buildingBuffer: number;
    avoidHazards: boolean;
    hazardBuffer: number;
    avoidWaterBodies: boolean;
    waterBuffer: number;
  };
  roadConstraints?: {
    preferHighways: boolean;
    avoidNarrowRoads: boolean;
    minRoadWidth: number;
    requireEmergencyAccess: boolean;
    avoidTollRoads: boolean;
  };
  
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
  onRouteCalculated?: (response: EnhancedRouteResponse) => void;
  onRouteClick?: (route: any) => void;
}

export const EnhancedRoutingLayer: React.FC<EnhancedRoutingLayerProps> = ({
  map,
  enabled,
  origin,
  destination,
  vehicleType = 'civilian',
  priority = 'balanced',
  profile = 'CIVILIAN_EVACUATION',
  terrainConstraints = {
    maxSlope: 15,
    avoidSteepTerrain: true,
    preferFlatRoutes: true,
    elevationBuffer: 50
  },
  obstacleConstraints = {
    avoidBuildings: true,
    buildingBuffer: 25,
    avoidHazards: true,
    hazardBuffer: 100,
    avoidWaterBodies: true,
    waterBuffer: 50
  },
  roadConstraints = {
    preferHighways: true,
    avoidNarrowRoads: true,
    minRoadWidth: 3.5,
    requireEmergencyAccess: false,
    avoidTollRoads: true
  },
  onLayerReady,
  onLayerError,
  onRouteCalculated,
  onRouteClick
}) => {
  const routesSourceId = 'enhanced-routes';
  const routesLayerId = 'enhanced-routes';
  const terrainSourceId = 'terrain-analysis';
  const terrainLayerId = 'terrain-analysis';
  const obstaclesSourceId = 'obstacle-analysis';
  const obstaclesLayerId = 'obstacle-analysis';
  
  const isInitialized = useRef(false);
  const [currentRoute, setCurrentRoute] = useState<EnhancedRouteResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Add route layer function
  const addRouteLayer = async (route: any) => {
    if (!map) return;
    
    // Add route source
    map.addSource(routesSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.waypoints || []
          },
          properties: {
            id: route.routeId,
            distance: route.distanceKm,
            estimatedTime: route.estimatedTimeMinutes,
            safetyScore: (route as any).routeProperties?.safetyScore || 0,
            averageSlope: (route as any).routeProperties?.averageSlope || 0,
            roadCoverage: (route as any).routeProperties?.roadCoverage || 0
          }
        }]
      }
    });

    // Add route layer
    map.addLayer({
      id: routesLayerId,
      type: 'line',
      source: routesSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff6b6b',
        'line-width': 4
      }
    });
  };

  // Add terrain analysis layer function
  const addTerrainAnalysisLayer = async (terrainData: any) => {
    if (!map) return;
    
    // Add terrain source
    map.addSource(terrainSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: terrainData.map((point: any, index: number) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: point.coordinates
          },
          properties: {
            elevation: point.elevation,
            slope: point.slope,
            isSteep: point.slope > 30,
            index
          }
        }))
      }
    });

    // Add terrain layer
    map.addLayer({
      id: terrainLayerId,
      type: 'circle',
      source: terrainSourceId,
      paint: {
        'circle-color': [
          'case',
          ['get', 'isSteep'],
          '#ff4444',
          '#44ff44'
        ],
        'circle-radius': 4
      }
    });
  };

  // Add obstacle analysis layer function
  const addObstacleAnalysisLayer = async (obstacleData: any) => {
    if (!map) return;
    
    // Add obstacle source
    map.addSource(obstaclesSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: obstacleData.map((obstacle: any, index: number) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: obstacle.coordinates
          },
          properties: {
            type: obstacle.type,
            distance: obstacle.distance,
            severity: obstacle.severity,
            index
          }
        }))
      }
    });

    // Add obstacle layer
    map.addLayer({
      id: obstaclesLayerId,
      type: 'circle',
      source: obstaclesSourceId,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'severity'], 'high'],
          '#ff0000',
          ['==', ['get', 'severity'], 'medium'],
          '#ffaa00',
          '#00ff00'
        ],
        'circle-radius': 6
      }
    });
  };

  // Render enhanced route function
  const renderEnhancedRoute = async (response: EnhancedRouteResponse) => {
    if (!response.route) return;

    try {
      // Remove existing layers
      if (map) {
        // Remove route layers
        if (map.getLayer(routesLayerId)) {
          map.removeLayer(routesLayerId);
        }
        if (map.getSource(routesSourceId)) {
          map.removeSource(routesSourceId);
        }

        // Remove terrain analysis layers
        if (map.getLayer(terrainLayerId)) {
          map.removeLayer(terrainLayerId);
        }
        if (map.getSource(terrainSourceId)) {
          map.removeSource(terrainSourceId);
        }

        // Remove obstacle analysis layers
        if (map.getLayer(obstaclesLayerId)) {
          map.removeLayer(obstaclesLayerId);
        }
        if (map.getSource(obstaclesSourceId)) {
          map.removeSource(obstaclesSourceId);
        }
      }

      // Add enhanced route
      await addRouteLayer(response.route);

      // Add terrain analysis visualization
      if ((response.route as any).routeProperties?.terrainAnalysis) {
        await addTerrainAnalysisLayer((response.route as any).routeProperties.terrainAnalysis);
      }

      // Add obstacle analysis visualization
      if ((response.route as any).routeProperties?.obstacleAnalysis) {
        await addObstacleAnalysisLayer((response.route as any).routeProperties.obstacleAnalysis);
      }

    } catch (error) {
      console.error('Error rendering enhanced route:', error);
      onLayerError?.(`Route rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate enhanced route function
  const calculateEnhancedRoute = async () => {
    if (!origin || !destination) return;

    setIsCalculating(true);

    try {
      const request: EnhancedRouteRequest = {
        origin,
        destination,
        vehicleType,
        priority,
        profile,
        terrainConstraints,
        obstacleConstraints,
        roadConstraints,
        avoidHazards: [], // Would be populated from hazard data
        maxDistance: 50, // km
        maxTime: 60 // minutes
      };

      const response = await enhancedRoutingService.calculateEnhancedRoute(request);
      setCurrentRoute(response);

      if (response.success && response.route) {
        await renderEnhancedRoute(response);
        onRouteCalculated?.(response);
      } else {
        console.warn('Enhanced routing failed:', response.error);
        onLayerError?.(response.error || 'Enhanced routing failed');
      }

    } catch (error) {
      console.error('Error calculating enhanced route:', error);
      onLayerError?.(`Route calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (!map) return;

    // Set map instance for terrain analysis
    enhancedRoutingService.setMap(map);

    const addEnhancedRoutingLayer = () => {
      try {
        if (!enabled) {
          removeLayers();
          isInitialized.current = false;
          return;
        }

        // Calculate route if origin and destination are provided
        if (origin && destination) {
          calculateEnhancedRoute();
        }

        isInitialized.current = true;
        onLayerReady?.();

      } catch (error) {
        console.error('Error setting up enhanced routing layer:', error);
        onLayerError?.(`Enhanced routing layer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    const removeLayers = () => {
      try {
        // Remove route layers
        if (map.getLayer(routesLayerId)) {
          map.removeLayer(routesLayerId);
        }
        if (map.getSource(routesSourceId)) {
          map.removeSource(routesSourceId);
        }

        // Remove terrain analysis layers
        if (map.getLayer(terrainLayerId)) {
          map.removeLayer(terrainLayerId);
        }
        if (map.getSource(terrainSourceId)) {
          map.removeSource(terrainSourceId);
        }

        // Remove obstacle analysis layers
        if (map.getLayer(obstaclesLayerId)) {
          map.removeLayer(obstaclesLayerId);
        }
        if (map.getSource(obstaclesSourceId)) {
          map.removeSource(obstaclesSourceId);
        }

        // Remove event listeners
        map.off('click', routesLayerId, () => {});
        map.off('mouseenter', routesLayerId, () => {});
        map.off('mouseleave', routesLayerId, () => {});

      } catch (error) {
        console.warn('Error removing enhanced routing layers:', error);
      }
    };



    const addRouteLayer = async (route: any) => {
      // Add route source
      map.addSource(routesSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.routeGeometry?.coordinates || []
            },
            properties: {
              id: route.routeId,
              distance: route.distanceKm,
              estimatedTime: route.estimatedTimeMinutes,
              safetyScore: (route as any).routeProperties?.safetyScore || 0,
              averageSlope: (route as any).routeProperties?.averageSlope || 0,
              roadCoverage: (route as any).routeProperties?.roadCoverage || 0
            }
          }]
        }
      });

      // Add route layer with dynamic styling based on safety score
      map.addLayer({
        id: routesLayerId,
        type: 'line',
        source: routesSourceId,
        paint: {
          'line-color': [
            'case',
            ['>=', ['get', 'safetyScore'], 80], '#00ff00', // Green for safe routes
            ['>=', ['get', 'safetyScore'], 60], '#ffff00', // Yellow for moderate routes
            '#ff0000' // Red for unsafe routes
          ],
          'line-width': [
            'case',
            ['>=', ['get', 'safetyScore'], 80], 6,
            ['>=', ['get', 'safetyScore'], 60], 4,
            2
          ],
          'line-opacity': 0.8
        }
      });

      // Add click handler
      if (onRouteClick) {
        map.on('click', routesLayerId, (e) => {
          if (e.features && e.features[0]) {
            onRouteClick(e.features[0].properties);
          }
        });

        // Change cursor on hover
        map.on('mouseenter', routesLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', routesLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    const addTerrainAnalysisLayer = async (terrainAnalysis: any[]) => {
      // Create terrain analysis visualization
      const terrainFeatures = terrainAnalysis.map((terrain: any, index: number) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0] // Would be populated with actual coordinates
        },
        properties: {
          elevation: terrain.elevation,
          slope: terrain.slope,
          isSteep: terrain.isSteep,
          index
        }
      })) as any;

      map.addSource(terrainSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: terrainFeatures
        }
      });

      map.addLayer({
        id: terrainLayerId,
        type: 'circle',
        source: terrainSourceId,
        paint: {
          'circle-radius': 4,
          'circle-color': [
            'case',
            ['get', 'isSteep'], '#ff0000', // Red for steep terrain
            '#00ff00' // Green for accessible terrain
          ],
          'circle-opacity': 0.6
        }
      });
    };

    const addObstacleAnalysisLayer = async (obstacleAnalysis: any[]) => {
      // Create obstacle analysis visualization
      const obstacleFeatures = obstacleAnalysis.map((obstacle: any, index: number) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0] // Would be populated with actual coordinates
        },
        properties: {
          type: obstacle.type,
          distance: obstacle.distance,
          severity: obstacle.severity,
          index
        }
      })) as any;

      map.addSource(obstaclesSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: obstacleFeatures
        }
      });

      map.addLayer({
        id: obstaclesLayerId,
        type: 'circle',
        source: obstaclesSourceId,
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'severity'], 'high'], 8,
            ['==', ['get', 'severity'], 'medium'], 6,
            4
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'building'], '#ffaa00',
            ['==', ['get', 'type'], 'hazard'], '#ff0000',
            ['==', ['get', 'type'], 'water'], '#0000ff',
            '#888888'
          ],
          'circle-opacity': 0.7
        }
      });
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      addEnhancedRoutingLayer();
    } else {
      map.once('style.load', addEnhancedRoutingLayer);
    }

    // Cleanup function
    return () => {
      removeLayers();
      isInitialized.current = false;
    };

  }, [map, enabled, origin, destination, vehicleType, priority, profile, terrainConstraints, obstacleConstraints, roadConstraints]);

  // Recalculate route when constraints change
  useEffect(() => {
    if (isInitialized.current && origin && destination) {
      calculateEnhancedRoute();
    }
  }, [terrainConstraints, obstacleConstraints, roadConstraints]);

  // This component doesn't render anything visible
  return null;
};

export default EnhancedRoutingLayer;
