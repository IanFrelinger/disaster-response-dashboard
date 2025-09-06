/**
 * FailFastTestSuites - Test suites that demonstrate fail-fast behavior
 */

import { TestSuite } from '../orchestrator/TestOrchestrator';
import { FailFastTestCommand, FailFastTestInput } from '../commands/FailFastTestCommand';

export function createFailFastTestSuites(): TestSuite[] {
  return [
    {
      name: 'Fail-Fast Demonstration',
      description: 'Demonstrates fail-fast behavior with various failure types',
      commands: [
        new FailFastTestCommand({
          shouldFail: false,
          failureType: 'error',
          delay: 1000,
          timeout: 5000,
          failFast: true
        }),
        new FailFastTestCommand({
          shouldFail: true,
          failureType: 'timeout',
          customError: 'Simulated timeout failure for demonstration',
          delay: 2000,
          timeout: 5000,
          failFast: true
        }),
        new FailFastTestCommand({
          shouldFail: false,
          failureType: 'error',
          delay: 1000,
          timeout: 5000,
          failFast: true
        })
      ]
    },
    {
      name: 'Critical Failure Test',
      description: 'Tests critical failure handling',
      commands: [
        new FailFastTestCommand({
          shouldFail: true,
          failureType: 'critical',
          customError: 'Critical system failure - database connection lost',
          delay: 1000,
          timeout: 5000,
          failFast: true
        })
      ]
    },
    {
      name: 'Warning Test',
      description: 'Tests warning handling (should not stop pipeline)',
      commands: [
        new FailFastTestCommand({
          shouldFail: true,
          failureType: 'warning',
          customError: 'Non-critical warning - performance degradation detected',
          delay: 1000,
          timeout: 5000,
          failFast: false // Warnings should not stop pipeline
        }),
        new FailFastTestCommand({
          shouldFail: false,
          failureType: 'error',
          delay: 1000,
          timeout: 5000,
          failFast: true
        })
      ]
    }
  ];
}
