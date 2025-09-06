/**
 * DebugTestSuites - Debug test suites for troubleshooting
 */

import { TestSuite } from '../orchestrator/TestOrchestrator';
import { MapDebugCommand, MapDebugInput } from '../commands/MapDebugCommand';

export function createDebugTestSuites(): TestSuite[] {
  return [
    {
      name: 'Map Debug',
      description: 'Debug map state and layer initialization',
      commands: [
        new MapDebugCommand({
          debugLayers: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          takeScreenshot: true,
          checkMapState: true,
          checkLayerState: true,
          timeout: 30000,
          failFast: false
        })
      ]
    }
  ];
}
