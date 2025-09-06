import { http, HttpResponse } from 'msw';
import simpleScenario from '../../fixtures/scenarios/simple.json';
import evacuationScenario from '../../fixtures/scenarios/evacuation.json';

// Mock Mapbox Directions API
export const mapboxHandlers = [
  http.get('https://api.mapbox.com/directions/v5/mapbox/driving/*', () => {
    return HttpResponse.json({
      routes: [
        {
          geometry: {
            type: 'LineString',
            coordinates: [
              [-122.4194, 37.7749],
              [-122.4083, 37.7879]
            ]
          },
          distance: 2500,
          duration: 300,
          weight: 300,
          summary: 'Test Route'
        }
      ],
      waypoints: [
        {
          location: [-122.4194, 37.7749],
          name: 'Start Point'
        },
        {
          location: [-122.4083, 37.7879],
          name: 'End Point'
        }
      ],
      code: 'Ok'
    });
  }),

  http.get('https://api.mapbox.com/styles/v1/mapbox/*', () => {
    return HttpResponse.json({
      version: 8,
      name: 'Test Style',
      sources: {},
      layers: []
    });
  }),

  http.get('https://api.mapbox.com/v4/mapbox.3d-buildings/*', () => {
    return HttpResponse.json({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            height: 30,
            min_height: 0
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-122.4194, 37.7749],
              [-122.4195, 37.7749],
              [-122.4195, 37.7750],
              [-122.4194, 37.7750],
              [-122.4194, 37.7749]
            ]]
          }
        }
      ]
    });
  })
];

// Mock backend API endpoints
export const backendHandlers = [
  http.get('/api/scenarios', () => {
    return HttpResponse.json([
      simpleScenario,
      evacuationScenario
    ]);
  }),

  http.get('/api/scenarios/:id', ({ params }) => {
    const { id } = params;
    if (id === 'simple-test-scenario') {
      return HttpResponse.json(simpleScenario);
    }
    if (id === 'evacuation-scenario') {
      return HttpResponse.json(evacuationScenario);
    }
    return new HttpResponse('Scenario not found', { status: 404 });
  }),

  http.post('/api/scenarios', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: `scenario-${Date.now()}`,
      ...(body as object),
      createdAt: new Date().toISOString()
    });
  }),

  http.get('/api/waypoints', () => {
    return HttpResponse.json([
      {
        id: 'test-start',
        type: 'start',
        coordinates: [-122.4194, 37.7749],
        name: 'Test Start'
      },
      {
        id: 'test-dest',
        type: 'destination',
        coordinates: [-122.4083, 37.7879],
        name: 'Test End'
      }
    ]);
  }),

  http.get('/api/routes', () => {
    return HttpResponse.json([
      {
        id: 'test-route',
        name: 'Test Route',
        coordinates: [
          [-122.4194, 37.7749],
          [-122.4083, 37.7879]
        ]
      }
    ]);
  }),

  http.get('/api/buildings', () => {
    return HttpResponse.json([
      {
        id: 'test-building',
        name: 'Test Building',
        coordinates: [-122.4194, 37.7749],
        height: 30
      }
    ]);
  }),

  http.get('/api/hazards', () => {
    return HttpResponse.json([
      {
        id: 'test-hazard',
        type: 'fire',
        coordinates: [-122.4170, 37.7760],
        radius: 200,
        severity: 'high'
      }
    ]);
  })
];

// Combine all handlers
export const handlers = [
  ...mapboxHandlers,
  ...backendHandlers
];

