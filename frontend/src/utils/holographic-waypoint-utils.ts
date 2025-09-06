import { HolographicWaypoint, TurnByTurnInstruction } from '../types/holographic-waypoints';

/**
 * Calculate the floating height for a waypoint based on terrain elevation
 * @param coordinates - [lng, lat, elevation]
 * @param baseHeight - Base height above terrain in meters
 * @returns Floating height in meters
 */
export function calculateFloatingHeight(
  coordinates: [number, number, number],
  baseHeight: number = 50
): number {
  // For now, use a fixed height above terrain
  // In a full implementation, this would query the terrain elevation
  const terrainElevation = coordinates[2] || 0;
  return terrainElevation + baseHeight;
}

/**
 * Generate turn-by-turn instruction based on waypoint index and route data
 * @param route - The route containing waypoints
 * @param waypointIndex - Index of the current waypoint
 * @param totalWaypoints - Total number of waypoints in the route
 * @returns TurnByTurnInstruction object
 */
export function generateTurnByTurnInstruction(
  route: any,
  waypointIndex: number,
  totalWaypoints: number
): TurnByTurnInstruction {
  if (waypointIndex === 0) {
    return {
      type: 'start',
      instruction: 'Start your journey here',
      distance: 0,
      duration: 0,
      streetName: 'Starting Point'
    };
  }
  
  if (waypointIndex === totalWaypoints - 1) {
    return {
      type: 'arrive',
      instruction: 'You have arrived at your destination',
      distance: 0,
      duration: 0,
      streetName: 'Destination'
    };
  }
  
  // Generate turn instructions based on bearing changes
  const currentWaypoint = route.waypoints[waypointIndex];
  const nextWaypoint = route.waypoints[waypointIndex + 1];
  const prevWaypoint = route.waypoints[waypointIndex - 1];
  
  if (currentWaypoint && nextWaypoint && prevWaypoint) {
    const bearing1 = calculateBearing(prevWaypoint, currentWaypoint);
    const bearing2 = calculateBearing(currentWaypoint, nextWaypoint);
    const bearingDiff = Math.abs(bearing2 - bearing1);
    
    let instruction = 'Continue straight';
    let maneuverType = 'continue';
    
    if (bearingDiff > 45 && bearingDiff < 135) {
      if (bearingDiff > 90) {
        instruction = 'Turn around';
        maneuverType = 'turn-around';
      } else {
        instruction = bearing2 > bearing1 ? 'Turn right' : 'Turn left';
        maneuverType = bearing2 > bearing1 ? 'turn-right' : 'turn-left';
      }
    } else if (bearingDiff > 15) {
      instruction = bearing2 > bearing1 ? 'Slight right' : 'Slight left';
      maneuverType = bearing2 > bearing1 ? 'slight-right' : 'slight-left';
    }
    
    return {
      type: 'turn',
      instruction,
      distance: calculateDistance(currentWaypoint, nextWaypoint),
      duration: calculateDuration(currentWaypoint, nextWaypoint),
      streetName: `Street ${waypointIndex}`,
      maneuver: {
        type: maneuverType,
        instruction,
        bearing_before: bearing1,
        bearing_after: bearing2
      }
    };
  }
  
  return {
    type: 'continue',
    instruction: 'Continue on current route',
    distance: 0,
    duration: 0
  };
}

/**
 * Calculate bearing between two points
 * @param point1 - [lng, lat]
 * @param point2 - [lng, lat]
 * @returns Bearing in degrees
 */
function calculateBearing(point1: [number, number], point2: [number, number]): number {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
}

/**
 * Calculate distance between two points in meters
 * @param point1 - [lng, lat]
 * @param point2 - [lng, lat]
 * @returns Distance in meters
 */
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate estimated duration between two points
 * @param point1 - [lng, lat]
 * @param point2 - [lng, lat]
 * @returns Duration in seconds
 */
function calculateDuration(point1: [number, number], point2: [number, number]): number {
  const distance = calculateDistance(point1, point2);
  const averageSpeed = 13.89; // 50 km/h in m/s
  return distance / averageSpeed;
}

/**
 * Generate tooltip content for a waypoint
 * @param instruction - TurnByTurnInstruction
 * @param stepNumber - Current step number
 * @param totalSteps - Total number of steps
 * @param nextInstruction - Next instruction (if available)
 * @returns Tooltip content object
 */
export function generateTooltipContent(
  instruction: TurnByTurnInstruction,
  stepNumber: number,
  totalSteps: number,
  nextInstruction?: TurnByTurnInstruction
): HolographicWaypoint['properties']['tooltip'] {
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };
  
  const formatDuration = (duration: number): string => {
    const minutes = Math.round(duration / 60);
    if (minutes < 1) {
      return '< 1 min';
    }
    return `${minutes} min`;
  };
  
  let title = '';
  let content = '';
  
  switch (instruction.type) {
    case 'start':
      title = 'Starting Point';
      content = 'Begin your journey here. Follow the route to your destination.';
      break;
    case 'turn':
      title = `Step ${stepNumber} of ${totalSteps}`;
      content = instruction.instruction;
      if (instruction.streetName) {
        content += ` on ${instruction.streetName}`;
      }
      break;
    case 'continue':
      title = `Step ${stepNumber} of ${totalSteps}`;
      content = instruction.instruction;
      break;
    case 'arrive':
      title = 'Destination Reached';
      content = 'You have arrived at your destination.';
      break;
  }
  
  return {
    title,
    content,
    distance: instruction.distance ? formatDistance(instruction.distance) : '',
    duration: instruction.duration ? formatDuration(instruction.duration) : '',
    streetName: instruction.streetName,
    nextInstruction: nextInstruction?.instruction
  };
}

/**
 * Convert 2D waypoint to 3D holographic waypoint with turn-by-turn instructions
 * @param waypoint - 2D waypoint coordinates
 * @param properties - Waypoint properties
 * @param route - The route containing waypoints
 * @param waypointIndex - Index of the current waypoint
 * @param floatingHeight - Height above terrain
 * @returns 3D holographic waypoint
 */
export function createHolographicWaypoint(
  waypoint: [number, number],
  properties: any,
  route: any,
  waypointIndex: number,
  floatingHeight: number = 50
): HolographicWaypoint {
  const [lng, lat] = waypoint;
  
  // Estimate elevation based on coordinates (simplified)
  // In production, this would query actual terrain data
  const estimatedElevation = Math.sin(lat * Math.PI / 180) * 100; // Simple elevation model
  
  const coordinates: [number, number, number] = [lng, lat, estimatedElevation];
  
  // Generate turn-by-turn instruction
  const instruction = generateTurnByTurnInstruction(route, waypointIndex, route.waypoints.length);
  
  // Generate tooltip content
  const nextInstruction = waypointIndex < route.waypoints.length - 1 
    ? generateTurnByTurnInstruction(route, waypointIndex + 1, route.waypoints.length)
    : undefined;
  
  const tooltip = generateTooltipContent(instruction, waypointIndex + 1, route.waypoints.length, nextInstruction);
  
  return {
    coordinates,
    floatingHeight: calculateFloatingHeight(coordinates, floatingHeight),
    holographicProperties: {
      opacity: 0.8,
      glowIntensity: 0.6,
      pulseRate: 1.0,
      color: properties.isStart ? '#00FF00' : properties.isEnd ? '#FF0000' : '#0080FF',
      size: properties.isStart || properties.isEnd ? 20 : 15
    },
    properties: {
      routeId: properties.routeId,
      routeIndex: properties.routeIndex,
      stepNumber: properties.stepNumber,
      totalSteps: properties.totalSteps,
      isStart: properties.isStart,
      isEnd: properties.isEnd,
      instruction,
      distance: properties.distance,
      tooltip
    }
  };
}

/**
 * Create GeoJSON source data for holographic waypoints
 * @param waypoints - Array of holographic waypoints
 * @returns GeoJSON feature collection
 */
export function createHolographicWaypointSource(waypoints: HolographicWaypoint[]) {
  return {
    type: 'FeatureCollection' as const,
    features: waypoints.map(waypoint => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: waypoint.coordinates
      },
      properties: {
        ...waypoint.properties,
        floatingHeight: waypoint.floatingHeight,
        holographicProperties: waypoint.holographicProperties
      }
    }))
  };
}

/**
 * Generate holographic waypoint paint properties
 * @param waypoint - Holographic waypoint
 * @returns Paint properties for Mapbox layer
 */
export function generateHolographicPaintProperties(waypoint: HolographicWaypoint) {
  return {
    'fill-extrusion-color': waypoint.holographicProperties.color,
    'fill-extrusion-height': waypoint.floatingHeight,
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': waypoint.holographicProperties.opacity,
    'fill-extrusion-translate': [0, 0] as [number, number],
    'fill-extrusion-translate-anchor': 'map' as const
  };
}
