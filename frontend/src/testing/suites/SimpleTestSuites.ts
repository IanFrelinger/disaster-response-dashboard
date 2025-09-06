/**
 * SimpleTestSuites - Simple test suites for basic functionality
 */

import { TestSuite } from '../orchestrator/TestOrchestrator';
import { SimpleLayerTestCommand, SimpleLayerTestInput } from '../commands/SimpleLayerTestCommand';

export function createSimpleTestSuites(): TestSuite[] {
  return [
    {
      name: 'Simple Layer Test',
      description: 'Simple test to verify map and basic layer functionality',
      commands: [
        new SimpleLayerTestCommand({
          testLayers: ['terrain', 'buildings', 'hazards', 'units', 'routes'],
          waitForLayers: false,
          timeoutMs: 10000,
          timeout: 30000,
          failFast: false
        })
      ]
    }
  ];
}
