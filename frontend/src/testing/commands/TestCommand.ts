/**
 * Core interfaces for the command-pattern based test orchestration system
 */

import type { Page } from 'playwright';

export interface TestContext {
  page?: Page;
  env: Record<string, any>;
  artifactsDir: string;
  baseUrl: string;
}

export interface TestResult {
  name: string;
  ok: boolean;
  details?: string;
  artifacts?: string[];
  durationMs: number;
  error?: Error;
}

export interface TestCommand {
  name: string;
  run(ctx: TestContext): Promise<TestResult>;
}

export interface CommandInput {
  [key: string]: any;
}

export interface SmokeTestInput extends CommandInput {
  url: string;
  layerIds: string[];
}

export interface LayerInvariantInput extends CommandInput {
  above: string;
  below: string;
}

export interface VisualSnapshotInput extends CommandInput {
  viewportKey: string;
  baseline: string;
  threshold?: number;
}

export interface PerfBudgetInput extends CommandInput {
  maxMs: number;
}

export interface RobustnessInput extends CommandInput {
  failureRate?: number;
  endpoints?: string[];
}

export interface RouteHazardInput extends CommandInput {
  fixtures?: Array<{
    routes: GeoJSON.FeatureCollection;
    hazards: GeoJSON.FeatureCollection;
  }>;
}

export interface CameraPreset {
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface TestViewport {
  width: number;
  height: number;
  camera: CameraPreset;
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  'dcDowntown': {
    center: [-77.0369, 38.9072],
    zoom: 12,
    bearing: 0,
    pitch: 0
  },
  'dcWide': {
    center: [-77.0369, 38.9072],
    zoom: 8,
    bearing: 0,
    pitch: 0
  },
  'california': {
    center: [-119.4179, 36.7783],
    zoom: 6,
    bearing: 0,
    pitch: 0
  },
  'florida': {
    center: [-81.5158, 27.6648],
    zoom: 7,
    bearing: 0,
    pitch: 0
  }
};

export const TEST_VIEWPORTS: Record<string, TestViewport> = {
  'dcDowntown': {
    width: 1200,
    height: 800,
    camera: CAMERA_PRESETS.dcDowntown!
  },
  'dcWide': {
    width: 1200,
    height: 800,
    camera: CAMERA_PRESETS.dcWide!
  },
  'california': {
    width: 1200,
    height: 800,
    camera: CAMERA_PRESETS.california!
  },
  'florida': {
    width: 1200,
    height: 800,
    camera: CAMERA_PRESETS.florida!
  }
};

export const LAYER_IDS = [
  'terrain',
  'buildings', 
  'hazards',
  'units',
  'routes',
  'enhanced-routes'
] as const;

export type LayerId = typeof LAYER_IDS[number];
