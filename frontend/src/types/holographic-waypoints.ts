export interface TurnByTurnInstruction {
  type: 'start' | 'turn' | 'continue' | 'arrive';
  instruction: string;
  distance?: number;
  duration?: number;
  streetName?: string;
  maneuver?: {
    type: string;
    instruction: string;
    bearing_before: number;
    bearing_after: number;
  };
}

export interface HolographicWaypoint {
  coordinates: [number, number, number]; // [lng, lat, elevation]
  floatingHeight: number; // Height above terrain in meters
  holographicProperties: {
    opacity: number;
    glowIntensity: number;
    pulseRate: number;
    color: string;
    size: number;
  };
  properties: {
    routeId: string;
    routeIndex: number;
    stepNumber: number;
    totalSteps: number;
    isStart: boolean;
    isEnd: boolean;
    instruction: TurnByTurnInstruction;
    distance: number;
    tooltip: {
      title: string;
      content: string;
      distance: string;
      duration: string;
      streetName?: string;
      nextInstruction?: string;
    };
  };
}

export interface HolographicWaypointSource {
  type: 'geojson';
  data: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'Point';
        coordinates: [number, number, number];
      };
      properties: HolographicWaypoint['properties'] & {
        floatingHeight: number;
        holographicProperties: HolographicWaypoint['holographicProperties'];
      };
    }>;
  };
}

export interface HolographicWaypointLayer {
  id: string;
  type: 'fill-extrusion';
  source: string;
  paint: {
    'fill-extrusion-color': string | any[];
    'fill-extrusion-height': number | any[];
    'fill-extrusion-base': number | any[];
    'fill-extrusion-opacity': number | any[];
    'fill-extrusion-translate': [number, number];
    'fill-extrusion-translate-anchor': string;
  };
  layout?: {
    visibility?: string;
  };
}

export interface TooltipData {
  waypointId: string;
  position: [number, number];
  content: {
    title: string;
    instruction: string;
    distance: string;
    duration: string;
    streetName?: string;
    nextInstruction?: string;
  };
}
