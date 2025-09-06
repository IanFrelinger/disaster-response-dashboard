/**
 * FrontendTestSuites - Predefined test suites using command pattern
 */

import { TestSuite } from '../orchestrator/TestOrchestrator';
import { PageLoadCommand, PageLoadInput } from '../commands/PageLoadCommand';
import { MapInitializationCommand, MapInitializationInput } from '../commands/MapInitializationCommand';
import { SmokeTestCommand, SmokeTestInput } from '../commands/SmokeTestCommand';
import { VisualSnapshotCommand, VisualSnapshotInput } from '../commands/VisualSnapshotCommand';
import { PerfBudgetCommand, PerfBudgetInput } from '../commands/PerfBudgetCommand';
import { RobustnessCommand, RobustnessInput } from '../commands/RobustnessCommand';
import { LayerInvariantCommand, LayerInvariantInput } from '../commands/LayerInvariantCommand';
import { RouteHazardNoIntersectCommand, RouteHazardInput } from '../commands/RouteHazardNoIntersectCommand';

export class FrontendTestSuites {
  static getSmokeTestSuite(baseUrl: string): TestSuite {
    return {
      name: 'Smoke Tests',
      commands: [
        new PageLoadCommand({
          url: `${baseUrl}?test=true`,
          expectedTitle: 'Command Center',
          expectedElements: ['.map-container-3d'],
          checkConsoleErrors: true,
          timeout: 30000,
          failFast: true
        }),
        new MapInitializationCommand({
          expectedLayers: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          checkTerrain: true,
          checkBuildings: true,
          checkInteractions: true,
          timeout: 20000,
          failFast: true
        })
      ],
      timeout: 60000,
      failFast: true
    };
  }

  static getLayerValidationSuite(baseUrl: string): TestSuite {
    return {
      name: 'Layer Validation',
      commands: [
        new SmokeTestCommand({
          url: `${baseUrl}?test=true`,
          layerIds: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          timeout: 30000,
          failFast: true
        }),
        new LayerInvariantCommand({
          above: 'hazards',
          below: 'terrain',
          timeout: 15000,
          failFast: true
        }),
        new RouteHazardNoIntersectCommand({
          tolerance: 0.0,
          timeout: 20000,
          failFast: true
        })
      ],
      timeout: 90000,
      failFast: true
    };
  }

  static getPerformanceSuite(baseUrl: string): TestSuite {
    return {
      name: 'Performance Tests',
      commands: [
        new PerfBudgetCommand({
          maxLoadTime: 3000,
          maxRenderTime: 1000,
          maxMemoryUsage: 100,
          timeout: 30000,
          failFast: true
        }),
        new VisualSnapshotCommand({
          viewportKey: 'sanFrancisco',
          baseline: 'map-baseline',
          threshold: 0.1,
          timeout: 25000,
          failFast: true
        })
      ],
      timeout: 60000,
      failFast: true
    };
  }

  static getRobustnessSuite(baseUrl: string): TestSuite {
    return {
      name: 'Robustness Tests',
      commands: [
        new RobustnessCommand({
          simulateFailures: ['network', 'tiles'],
          recoveryTime: 5000,
          timeout: 30000,
          failFast: true
        }),
        new PageLoadCommand({
          url: `${baseUrl}?test=true&testStyle=true`,
          expectedElements: ['.map-container-3d'],
          checkConsoleErrors: true,
          timeout: 30000,
          failFast: true
        })
      ],
      timeout: 60000,
      failFast: true
    };
  }

  static getComprehensiveSuite(baseUrl: string): TestSuite {
    return {
      name: 'Comprehensive Tests',
      commands: [
        new PageLoadCommand({
          url: `${baseUrl}?test=true`,
          expectedTitle: 'Command Center',
          expectedElements: ['.map-container-3d'],
          checkConsoleErrors: true,
          timeout: 30000,
          failFast: true
        }),
        new MapInitializationCommand({
          expectedLayers: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          checkTerrain: true,
          checkBuildings: true,
          checkInteractions: true,
          timeout: 20000,
          failFast: true
        }),
        new SmokeTestCommand({
          url: `${baseUrl}?test=true`,
          layerIds: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          timeout: 30000,
          failFast: true
        }),
        new PerfBudgetCommand({
          maxLoadTime: 5000,
          maxRenderTime: 2000,
          maxMemoryUsage: 150,
          timeout: 30000,
          failFast: true
        }),
        new LayerInvariantCommand({
          above: 'hazards',
          below: 'terrain',
          timeout: 15000,
          failFast: true
        }),
        new RouteHazardNoIntersectCommand({
          tolerance: 0.0,
          timeout: 20000,
          failFast: true
        }),
        new VisualSnapshotCommand({
          viewportKey: 'sanFrancisco',
          baseline: 'map-baseline',
          threshold: 0.1,
          timeout: 25000,
          failFast: true
        }),
        new RobustnessCommand({
          simulateFailures: ['network'],
          recoveryTime: 3000,
          timeout: 20000,
          failFast: true
        })
      ],
      timeout: 180000, // 3 minutes
      failFast: true
    };
  }

  static getQuickValidationSuite(baseUrl: string): TestSuite {
    return {
      name: 'Quick Validation',
      commands: [
        new PageLoadCommand({
          url: `${baseUrl}?test=true`,
          expectedElements: ['.map-container-3d'],
          timeout: 15000,
          failFast: true
        }),
        new MapInitializationCommand({
          expectedLayers: ['terrain', 'buildings'],
          checkTerrain: true,
          timeout: 10000,
          failFast: true
        })
      ],
      timeout: 30000,
      failFast: true
    };
  }

  static getAllSuites(baseUrl: string): TestSuite[] {
    return [
      this.getSmokeTestSuite(baseUrl),
      this.getLayerValidationSuite(baseUrl),
      this.getPerformanceSuite(baseUrl),
      this.getRobustnessSuite(baseUrl),
      this.getComprehensiveSuite(baseUrl),
      this.getQuickValidationSuite(baseUrl)
    ];
  }
}
