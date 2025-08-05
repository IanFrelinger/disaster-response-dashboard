import React, { useState, useEffect } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl';
import { LineLayer, PolygonLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { HazardZone, SafeRoute } from '../types/hazard';
import { AlertTriangle, MapPin, Route } from 'lucide-react';

interface HazardMapProps {
  hazardZones: HazardZone[];
  safeRoutes: SafeRoute[];
  onLocationClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
}

const HazardMap: React.FC<HazardMapProps> = ({
  hazardZones,
  safeRoutes,
  onLocationClick,
  center = [-122.4194, 37.7749], // San Francisco default
  zoom = 10
}) => {
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom
  });

  const [selectedHazard, setSelectedHazard] = useState<HazardZone | null>(null);

  // Convert hazard zones to deck.gl layers
  const hazardLayers = [
    new PolygonLayer({
      id: 'hazard-zones',
      data: hazardZones,
      getPolygon: (d: HazardZone) => d.geometry.coordinates[0],
      getFillColor: (d: HazardZone) => {
        switch (d.riskLevel) {
          case 'low': return [255, 255, 0, 180]; // Yellow
          case 'medium': return [255, 165, 0, 180]; // Orange
          case 'high': return [255, 69, 0, 180]; // Red-orange
          case 'critical': return [255, 0, 0, 180]; // Red
          default: return [128, 128, 128, 180]; // Gray
        }
      },
      getLineColor: [0, 0, 0, 255],
      getLineWidth: 2,
      pickable: true,
      onClick: (info: any) => {
        if (info.object) {
          setSelectedHazard(info.object);
        }
      }
    })
  ];

  // Convert safe routes to deck.gl layers
  const routeLayers = safeRoutes.map((route, index) => 
    new LineLayer({
      id: `route-${index}`,
      data: [route],
      getPath: (d: SafeRoute) => d.route.coordinates.map(coord => [coord[1], coord[0]]), // Convert to [lng, lat]
      getColor: [0, 255, 0, 200], // Green
      getWidth: 3,
      pickable: true
    })
  );

  const allLayers = [...hazardLayers, ...routeLayers];

  return (
    <div className="relative w-full h-full">
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={allLayers}
        onClick={(info) => {
          if (info.coordinate && onLocationClick) {
            onLocationClick(info.coordinate[1], info.coordinate[0]);
          }
        }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>

      {/* Hazard Legend */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Hazard Levels
        </h3>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
            <span className="text-sm">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
            <span className="text-sm">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">High Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-700 rounded mr-2"></div>
            <span className="text-sm">Critical Risk</span>
          </div>
        </div>
      </div>

      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2 flex items-center">
          <Route className="w-4 h-4 mr-2" />
          Safe Routes
        </h3>
        <div className="flex items-center">
          <div className="w-4 h-2 bg-green-500 rounded mr-2"></div>
          <span className="text-sm">Evacuation Routes</span>
        </div>
      </div>

      {/* Selected Hazard Info */}
      {selectedHazard && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Hazard Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Risk Level:</strong> {selectedHazard.riskLevel}</p>
            <p><strong>Risk Score:</strong> {selectedHazard.riskScore.toFixed(2)}</p>
            <p><strong>Source:</strong> {selectedHazard.dataSource}</p>
            <p><strong>Updated:</strong> {selectedHazard.lastUpdated.toLocaleDateString()}</p>
            {selectedHazard.brightness && (
              <p><strong>Brightness:</strong> {selectedHazard.brightness}</p>
            )}
            {selectedHazard.confidence && (
              <p><strong>Confidence:</strong> {selectedHazard.confidence}%</p>
            )}
          </div>
          <button
            onClick={() => setSelectedHazard(null)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default HazardMap; 