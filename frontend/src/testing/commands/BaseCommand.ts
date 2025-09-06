/**
 * BaseCommand - Common interfaces and utilities for all test commands
 */

export interface TestContext {
  page?: any; // Playwright page
  browser?: any; // Playwright browser
  baseUrl: string;
  timeout: number;
  retries: number;
  failFast: boolean;
}

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  artifacts: string[];
  metadata: Record<string, any>;
  // Fail-fast specific fields
  shouldStopPipeline?: boolean;
  criticalError?: boolean;
  issueId?: string;
  remediation?: string;
}

export interface CommandInput {
  timeout?: number;
  retries?: number;
  failFast?: boolean;
}

// Global timeout configurations
export const GLOBAL_TIMEOUTS = {
  // Page operations
  pageLoad: 30000,        // 30s for page load
  navigation: 15000,      // 15s for navigation
  elementWait: 10000,     // 10s for element waits
  click: 5000,            // 5s for clicks
  
  // Map operations
  mapLoad: 20000,         // 20s for map initialization
  mapReady: 15000,        // 15s for map to be ready
  layerLoad: 10000,       // 10s for layer loading
  layerRender: 8000,      // 8s for layer rendering
  
  // Validation operations
  validation: 10000,      // 10s for validation checks
  performance: 5000,      // 5s for performance measurements
  interaction: 3000,      // 3s for interactions
  
  // File operations
  screenshot: 8000,       // 8s for screenshot capture
  fileWrite: 5000,        // 5s for file operations
  
  // Network operations
  apiCall: 10000,         // 10s for API calls
  networkIdle: 5000,      // 5s for network idle
  
  // Backend operations
  database: 15000,        // 15s for database operations
  serviceStart: 30000,    // 30s for service startup
  healthCheck: 10000      // 10s for health checks
};

// Helper function to add timeout to any promise
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${errorMessage} (timeout after ${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}

// Helper function to retry operations with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Base command class that all commands should extend
export abstract class BaseCommand {
  abstract name: string;
  protected input: CommandInput;
  protected startTime: number = 0;

  constructor(input: CommandInput = {}) {
    this.input = {
      timeout: GLOBAL_TIMEOUTS.validation,
      retries: 1,
      failFast: true,
      ...input
    };
  }

  abstract run(ctx: TestContext): Promise<TestResult>;

  protected createResult(
    success: boolean, 
    errors: string[] = [], 
    warnings: string[] = [], 
    artifacts: string[] = [], 
    metadata: Record<string, any> = {},
    shouldStopPipeline: boolean = false,
    criticalError: boolean = false,
    issueId?: string,
    remediation?: string
  ): TestResult {
    return {
      name: this.name,
      success,
      duration: Date.now() - this.startTime,
      errors,
      warnings,
      artifacts,
      metadata,
      shouldStopPipeline: shouldStopPipeline || !success,
      criticalError: criticalError || !success,
      issueId: issueId || (errors.length > 0 ? `ISSUE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined),
      remediation: remediation || this.generateRemediation(errors)
    };
  }

  protected generateRemediation(errors: string[]): string {
    if (errors.length === 0) return '';
    
    const error = errors[0].toLowerCase();
    
    if (error.includes('timeout')) {
      return 'Increase timeout or check network connectivity';
    } else if (error.includes('not found') || error.includes('missing')) {
      return 'Verify element selectors and page structure';
    } else if (error.includes('permission') || error.includes('access')) {
      return 'Check authentication and authorization settings';
    } else if (error.includes('network') || error.includes('connection')) {
      return 'Verify network connectivity and service availability';
    } else if (error.includes('performance') || error.includes('slow')) {
      return 'Optimize performance or increase performance thresholds';
    } else if (error.includes('security') || error.includes('https')) {
      return 'Fix security configuration and SSL certificates';
    } else {
      return 'Review error details and check system logs';
    }
  }

  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.input.timeout!,
    errorMessage: string = `${this.name} operation timeout`
  ): Promise<T> {
    return withTimeout(operation(), timeoutMs, errorMessage);
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.input.retries!,
    baseDelay: number = 1000
  ): Promise<T> {
    return withRetry(operation, maxRetries, baseDelay);
  }
}
