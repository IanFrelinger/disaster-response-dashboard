import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';

export const SimpleMapboxTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('SimpleMapboxTest: Initializing map...');
    console.log('Mapbox available:', !!mapboxgl);
    console.log('Mapbox Map available:', !!mapboxgl.Map);
    console.log('Access token:', mapboxgl.accessToken);

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749],
        zoom: 10
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('SimpleMapboxTest: Map loaded successfully!');
      });

      map.on('error', (e) => {
        console.error('SimpleMapboxTest: Map error:', e);
      });

    } catch (error) {
      console.error('SimpleMapboxTest: Error creating map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', border: '2px solid red' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 10, zIndex: 1000 }}>
        <h3>Simple Mapbox Test</h3>
        <p>Mapbox available: {mapboxgl ? 'Yes' : 'No'}</p>
        <p>Mapbox Map available: {mapboxgl?.Map ? 'Yes' : 'No'}</p>
        <p>Access token: {mapboxgl.accessToken ? 'Set' : 'Not Set'}</p>
      </div>
    </div>
  );
};
