import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioBuilder, scenarios, createScenarioFromJSON } from '../ScenarioBuilder';

describe('ScenarioBuilder', () => {
  let builder: ScenarioBuilder;

  beforeEach(() => {
    builder = new ScenarioBuilder(42); // Fixed seed for deterministic tests
  });

  describe('Basic functionality', () => {
    it('should create a builder with default values', () => {
      const state = builder.getCurrentState();
      expect(state.center).toEqual([-122.4194, 37.7749]);
      expect(state.zoom).toBe(16);
      expect(state.pitch).toBe(45);
      expect(state.bearing).toBe(0);
    });

    it('should add waypoints correctly', () => {
      builder.withWaypoint('test-1', 'start', [-122.4194, 37.7749], 'Test Start');
      builder.withWaypoint('test-2', 'destination', [-122.4083, 37.7879], 'Test End');

      const state = builder.getCurrentState();
      expect(state.waypoints).toHaveLength(2);
      expect(state.waypoints[0]?.id).toBe('test-1');
      expect(state.waypoints[0]?.type).toBe('start');
      expect(state.waypoints[0]?.coordinates).toEqual([-122.4194, 37.7749]);
      expect(state.waypoints[0]?.properties?.['color']).toBe('#00FF00');
    });

    it('should add routes correctly', () => {
      const coordinates: [number, number][] = [[-122.4194, 37.7749], [-122.4083, 37.7879]];
      builder.withRoute('test-route', coordinates, 'Test Route');

      const state = builder.getCurrentState();
      expect(state.routes).toHaveLength(1);
      expect(state.routes[0]?.id).toBe('test-route');
      expect(state.routes[0]?.coordinates).toEqual(coordinates);
      expect(state.routes[0]?.properties?.['color']).toBe('#FF6B35');
    });

    it('should add buildings correctly', () => {
      builder.withBuilding('test-building', [-122.4194, 37.7749], 50, 'Test Building');

      const state = builder.getCurrentState();
      expect(state.buildings).toHaveLength(1);
      expect(state.buildings[0]?.id).toBe('test-building');
      expect(state.buildings[0]?.height).toBe(50);
      expect(state.buildings[0]?.properties?.['color']).toBe('#8B4513');
    });

    it('should add hazards correctly', () => {
      builder.withHazard('test-hazard', 'fire', [-122.4170, 37.7760], 200, 'high');

      const state = builder.getCurrentState();
      expect(state.hazards).toHaveLength(1);
      expect(state.hazards[0]?.id).toBe('test-hazard');
      expect(state.hazards[0]?.type).toBe('fire');
      expect(state.hazards[0]?.severity).toBe('high');
      expect(state.hazards[0]?.properties?.['color']).toBe('#FF6B35');
    });

    it('should update map properties correctly', () => {
      builder
        .withCenter([-120.0, 40.0])
        .withZoom(18)
        .withPitch(60)
        .withBearing(90);

      const state = builder.getCurrentState();
      expect(state.center).toEqual([-120.0, 40.0]);
      expect(state.zoom).toBe(18);
      expect(state.pitch).toBe(60);
      expect(state.bearing).toBe(90);
    });
  });

  describe('Pre-built scenarios', () => {
    it('should generate simple test scenario', () => {
      const scenario = builder.withSimpleTestScenario().freeze();
      
      expect(scenario.waypoints).toHaveLength(2);
      expect(scenario.routes).toHaveLength(1);
      expect(scenario.buildings).toHaveLength(1);
      expect(scenario.hazards).toHaveLength(0);
    });

    it('should generate evacuation scenario', () => {
      const scenario = builder.withEvacuationScenario().freeze();
      
      expect(scenario.waypoints).toHaveLength(3);
      expect(scenario.routes).toHaveLength(1);
      expect(scenario.buildings).toHaveLength(2);
      expect(scenario.hazards).toHaveLength(1);
      expect(scenario.hazards[0]?.type).toBe('fire');
    });

    it('should generate multi-hazard scenario', () => {
      const scenario = builder.withMultiHazardScenario().freeze();
      
      expect(scenario.waypoints).toHaveLength(4);
      expect(scenario.routes).toHaveLength(1);
      expect(scenario.buildings).toHaveLength(3);
      expect(scenario.hazards).toHaveLength(4);
    });
  });

  describe('Deterministic generation', () => {
    it('should generate consistent colors for same types', () => {
      const builder1 = new ScenarioBuilder(42);
      const builder2 = new ScenarioBuilder(42);

      const scenario1 = builder1.withWaypoint('test', 'start', [0, 0]).freeze();
      const scenario2 = builder2.withWaypoint('test', 'start', [0, 0]).freeze();

      expect(scenario1.waypoints[0]?.properties?.['color']).toBe(scenario2.waypoints[0]?.properties?.['color']);
    });

    it('should generate different colors for different types', () => {
      const scenario = builder
        .withWaypoint('start', 'start', [0, 0])
        .withWaypoint('dest', 'destination', [1, 1])
        .withWaypoint('turn', 'turn', [2, 2])
        .freeze();

      const colors = scenario.waypoints.map(wp => wp.properties?.['color']);
      expect(new Set(colors).size).toBe(3); // All colors should be different
    });
  });

  describe('Utility functions', () => {
    it('should create scenario from JSON', () => {
      const jsonData = {
        id: 'test-id',
        name: 'Test Name',
        waypoints: [],
        routes: [],
        buildings: [],
        hazards: [],
        center: [-120.0, 40.0],
        zoom: 18,
        pitch: 60,
        bearing: 90
      };

      const scenario = createScenarioFromJSON(jsonData);
      expect(scenario.id).toBe('test-id');
      expect(scenario.name).toBe('Test Name');
      expect(scenario.center).toEqual([-120.0, 40.0]);
    });

    it('should reset builder correctly', () => {
      builder
        .withWaypoint('test', 'start', [0, 0])
        .withRoute('test', [[0, 0], [1, 1]])
        .withBuilding('test', [0, 0], 50)
        .withHazard('test', 'fire', [0, 0], 100, 'high');

      expect(builder.getCurrentState().waypoints).toHaveLength(1);
      expect(builder.getCurrentState().routes).toHaveLength(1);
      expect(builder.getCurrentState().buildings).toHaveLength(1);
      expect(builder.getCurrentState().hazards).toHaveLength(1);

      builder.reset();

      expect(builder.getCurrentState().waypoints).toHaveLength(0);
      expect(builder.getCurrentState().routes).toHaveLength(0);
      expect(builder.getCurrentState().buildings).toHaveLength(0);
      expect(builder.getCurrentState().hazards).toHaveLength(0);
    });
  });

  describe('Pre-built scenario functions', () => {
    it('should provide simple scenario', () => {
      const scenario = scenarios.simple();
      expect(scenario.waypoints).toHaveLength(2);
      expect(scenario.routes).toHaveLength(1);
    });

    it('should provide evacuation scenario', () => {
      const scenario = scenarios.evacuation();
      expect(scenario.waypoints).toHaveLength(3);
      expect(scenario.hazards).toHaveLength(1);
    });

    it('should provide multi-hazard scenario', () => {
      const scenario = scenarios.multiHazard();
      expect(scenario.waypoints).toHaveLength(4);
      expect(scenario.hazards).toHaveLength(4);
    });

    it('should provide custom builder', () => {
      const customBuilder = scenarios.custom(123);
      expect(customBuilder).toBeInstanceOf(ScenarioBuilder);
      
      const scenario = customBuilder.withSimpleTestScenario().freeze();
      expect(scenario.waypoints).toHaveLength(2);
    });
  });
});

