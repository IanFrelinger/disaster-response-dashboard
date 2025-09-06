/**
 * FailFastTestCommand - Demonstrates fail-fast behavior and issue tracking
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface FailFastTestInput extends CommandInput {
  shouldFail: boolean;
  failureType: 'timeout' | 'error' | 'critical' | 'warning';
  customError?: string;
  delay?: number; // ms
}

export class FailFastTestCommand extends BaseCommand<FailFastTestInput> {
  name = 'FailFastTest';

  async run(context: TestContext): Promise<TestResult> {
    this.startTime = Date.now();
    
    try {
      console.log(`🧪 Running fail-fast test: ${this.input.failureType}`);
      
      // Simulate some work
      if (this.input.delay) {
        await new Promise(resolve => setTimeout(resolve, this.input.delay));
      }
      
      if (this.input.shouldFail) {
        const error = this.input.customError || this.generateError(this.input.failureType);
        
        console.log(`❌ Test intentionally failing: ${error}`);
        
        return this.createResult(
          false,
          [error],
          [],
          [],
          { failureType: this.input.failureType, intentional: true },
          true, // shouldStopPipeline
          this.input.failureType === 'critical', // criticalError
          `FAIL_FAST_${this.input.failureType.toUpperCase()}_${Date.now()}`,
          this.generateRemediation([error])
        );
      }
      
      console.log(`✅ Test passed successfully`);
      return this.createResult(true, [], [], [], { success: true });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Test failed with error: ${errorMessage}`);
      
      return this.createResult(
        false,
        [errorMessage],
        [],
        [],
        { error: errorMessage, caught: true },
        true, // shouldStopPipeline
        true, // criticalError
        `FAIL_FAST_ERROR_${Date.now()}`,
        this.generateRemediation([errorMessage])
      );
    }
  }

  private generateError(failureType: string): string {
    switch (failureType) {
      case 'timeout':
        return 'Test timeout exceeded - operation took too long to complete';
      case 'error':
        return 'Test execution error - unexpected condition occurred';
      case 'critical':
        return 'Critical system failure - immediate attention required';
      case 'warning':
        return 'Test warning - non-critical issue detected';
      default:
        return 'Unknown test failure type';
    }
  }
}
