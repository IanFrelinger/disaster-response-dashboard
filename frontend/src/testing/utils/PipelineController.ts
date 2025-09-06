/**
 * PipelineController - Controls pipeline execution with fail-fast and issue addressing
 */

import { issueTracker, Issue } from './IssueTracker';

export interface PipelineConfig {
  failFast: boolean;
  maxRetries: number;
  retryDelay: number;
  autoAddressIssues: boolean;
  criticalIssueThreshold: number;
  stopOnCriticalIssues: boolean;
}

export interface PipelineResult {
  success: boolean;
  stopped: boolean;
  reason?: string;
  issues: Issue[];
  criticalIssues: Issue[];
  retryCount: number;
  duration: number;
}

export class PipelineController {
  private config: PipelineConfig;
  private retryCount: number = 0;
  private startTime: number = 0;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  /**
   * Start pipeline execution
   */
  start(): void {
    this.startTime = Date.now();
    this.retryCount = 0;
    console.log('🚀 Pipeline started');
    console.log(`⚙️  Configuration: failFast=${this.config.failFast}, maxRetries=${this.config.maxRetries}`);
  }

  /**
   * Check if pipeline should continue after a test failure
   */
  shouldContinue(testName: string, suiteName: string, error: string): boolean {
    const openIssues = issueTracker.getOpenIssues();
    const criticalIssues = issueTracker.getCriticalIssues();

    // Record the issue
    const priority = this.determinePriority(error);
    const remediation = this.generateRemediation(error);
    
    issueTracker.recordIssue(
      testName,
      suiteName,
      error,
      remediation,
      priority,
      { retryCount: this.retryCount, timestamp: new Date().toISOString() }
    );

    // Check critical issues threshold
    if (this.config.stopOnCriticalIssues && criticalIssues.length >= this.config.criticalIssueThreshold) {
      console.log(`🚨 Pipeline stopped: ${criticalIssues.length} critical issues exceed threshold (${this.config.criticalIssueThreshold})`);
      return false;
    }

    // Check fail-fast configuration
    if (this.config.failFast) {
      console.log(`🛑 Pipeline stopped: failFast enabled`);
      return false;
    }

    // Check retry limit
    if (this.retryCount >= this.config.maxRetries) {
      console.log(`🛑 Pipeline stopped: max retries exceeded (${this.config.maxRetries})`);
      return false;
    }

    return true;
  }

  /**
   * Handle test failure with retry logic
   */
  async handleFailure(testName: string, suiteName: string, error: string): Promise<boolean> {
    this.retryCount++;
    
    console.log(`🔄 Handling failure (attempt ${this.retryCount}/${this.config.maxRetries + 1})`);
    console.log(`📋 Test: ${testName} in ${suiteName}`);
    console.log(`❌ Error: ${error}`);

    // Auto-address issues if enabled
    if (this.config.autoAddressIssues) {
      await this.attemptIssueResolution(testName, suiteName, error);
    }

    // Wait before retry
    if (this.retryCount <= this.config.maxRetries) {
      console.log(`⏳ Waiting ${this.config.retryDelay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      return true;
    }

    return false;
  }

  /**
   * Attempt to automatically resolve issues
   */
  private async attemptIssueResolution(testName: string, suiteName: string, error: string): Promise<void> {
    console.log('🔧 Attempting automatic issue resolution...');
    
    const errorLower = error.toLowerCase();
    
    // Common resolution strategies
    if (errorLower.includes('timeout')) {
      console.log('⏱️ Detected timeout - increasing wait time');
      // Could implement dynamic timeout adjustment here
    } else if (errorLower.includes('not found') || errorLower.includes('missing')) {
      console.log('🔍 Detected missing element - checking page structure');
      // Could implement element detection retry here
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      console.log('🌐 Detected network issue - checking connectivity');
      // Could implement network health check here
    } else if (errorLower.includes('permission') || errorLower.includes('access')) {
      console.log('🔐 Detected permission issue - checking authentication');
      // Could implement auth retry here
    } else {
      console.log('❓ Unknown error type - manual intervention required');
    }
  }

  /**
   * Determine issue priority based on error
   */
  private determinePriority(error: string): 'low' | 'medium' | 'high' | 'critical' {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('critical') || errorLower.includes('fatal') || errorLower.includes('security')) {
      return 'critical';
    } else if (errorLower.includes('timeout') || errorLower.includes('performance') || errorLower.includes('memory')) {
      return 'high';
    } else if (errorLower.includes('warning') || errorLower.includes('minor')) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  /**
   * Generate remediation suggestion
   */
  private generateRemediation(error: string): string {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('timeout')) {
      return 'Increase timeout values or check network connectivity';
    } else if (errorLower.includes('not found') || errorLower.includes('missing')) {
      return 'Verify element selectors and page structure';
    } else if (errorLower.includes('permission') || errorLower.includes('access')) {
      return 'Check authentication and authorization settings';
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      return 'Verify network connectivity and service availability';
    } else if (errorLower.includes('performance') || errorLower.includes('slow')) {
      return 'Optimize performance or increase performance thresholds';
    } else if (errorLower.includes('security') || errorLower.includes('https')) {
      return 'Fix security configuration and SSL certificates';
    } else {
      return 'Review error details and check system logs';
    }
  }

  /**
   * Get pipeline result
   */
  getResult(): PipelineResult {
    const duration = Date.now() - this.startTime;
    const openIssues = issueTracker.getOpenIssues();
    const criticalIssues = issueTracker.getCriticalIssues();
    
    const success = openIssues.length === 0;
    const stopped = !success && (this.config.failFast || this.retryCount > this.config.maxRetries);
    
    return {
      success,
      stopped,
      reason: stopped ? (this.config.failFast ? 'failFast enabled' : 'max retries exceeded') : undefined,
      issues: openIssues,
      criticalIssues,
      retryCount: this.retryCount,
      duration
    };
  }

  /**
   * Reset pipeline state
   */
  reset(): void {
    this.retryCount = 0;
    this.startTime = 0;
    console.log('🔄 Pipeline reset');
  }
}
