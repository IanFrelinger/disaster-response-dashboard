/**
 * Error Correlation Service
 * Automatically correlates frontend errors with backend errors and UI issues
 */

export interface ErrorEvent {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  source: 'frontend' | 'backend' | 'ui' | 'network';
  category: 'type' | 'runtime' | 'network' | 'validation' | 'performance' | 'ontology';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  correlationId?: string;
  relatedErrors?: string[];
}

export interface ErrorCorrelation {
  frontendErrors: ErrorEvent[];
  backendErrors: ErrorEvent[];
  uiErrors: ErrorEvent[];
  networkErrors: ErrorEvent[];
  correlations: {
    type: 'causal' | 'temporal' | 'contextual' | 'pattern';
    confidence: number;
    description: string;
    errors: string[];
  }[];
  summary: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    patterns: string[];
    recommendations: string[];
  };
}

class ErrorCorrelationService {
  private errors: ErrorEvent[] = [];
  private correlationId = 0;
  private backendErrorCache: ErrorEvent[] = [];
  private lastBackendCheck = 0;
  private readonly BACKEND_CHECK_INTERVAL = 5000; // 5 seconds

  constructor() {
    this.setupErrorHandlers();
    this.startBackendErrorPolling();
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        level: 'error',
        source: 'frontend',
        category: 'runtime',
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: event.type
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        level: 'error',
        source: 'frontend',
        category: 'runtime',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          reason: event.reason,
          type: 'unhandledrejection'
        }
      });
    });

    // Console error interceptor
    const originalError = console.error;
    console.error = (...args) => {
      this.logError({
        level: 'error',
        source: 'frontend',
        category: 'runtime',
        message: args.join(' '),
        context: { args }
      });
      originalError.apply(console, args);
    };

    // Console warn interceptor
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.logError({
        level: 'warning',
        source: 'frontend',
        category: 'runtime',
        message: args.join(' '),
        context: { args }
      });
      originalWarn.apply(console, args);
    };
  }

  /**
   * Start polling backend for errors
   */
  private startBackendErrorPolling(): void {
    setInterval(async () => {
      try {
        await this.fetchBackendErrors();
      } catch (error) {
        console.warn('Failed to fetch backend errors:', error);
      }
    }, this.BACKEND_CHECK_INTERVAL);
  }

  /**
   * Fetch errors from backend
   */
  private async fetchBackendErrors(): Promise<void> {
    try {
      const response = await fetch('/api/errors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Correlation': 'true'
        }
      });

      if (response.ok) {
        const backendErrors = await response.json();
        this.backendErrorCache = backendErrors.map((error: any) => ({
          id: error.id || `backend-${Date.now()}-${Math.random()}`,
          timestamp: error.timestamp || Date.now(),
          level: error.level || 'error',
          source: 'backend' as const,
          category: this.categorizeBackendError(error),
          message: error.message || error.error || 'Unknown backend error',
          stack: error.stack,
          context: error.context || {}
        }));
        this.lastBackendCheck = Date.now();
      }
    } catch (error) {
      // Silently fail - backend might not have error endpoint yet
    }
  }

  /**
   * Categorize backend errors
   */
  private categorizeBackendError(error: any): ErrorEvent['category'] {
    const message = (error.message || error.error || '').toLowerCase();
    
    if (message.includes('ontology') || message.includes('palantir')) {
      return 'ontology';
    }
    if (message.includes('type') || message.includes('mypy')) {
      return 'type';
    }
    if (message.includes('validation') || message.includes('schema')) {
      return 'validation';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('performance') || message.includes('timeout')) {
      return 'performance';
    }
    
    return 'runtime';
  }

  /**
   * Log a new error
   */
  public logError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'correlationId'>): void {
    const errorEvent: ErrorEvent = {
      ...error,
      id: `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      correlationId: `corr-${++this.correlationId}`
    };

    this.errors.push(errorEvent);
    
    // Auto-correlate with recent errors
    this.autoCorrelate(errorEvent);
    
    // Send to backend for correlation
    this.sendErrorToBackend(errorEvent);
  }

  /**
   * Auto-correlate with recent errors
   */
  private autoCorrelate(newError: ErrorEvent): void {
    const recentErrors = this.errors
      .filter(e => e.id !== newError.id)
      .filter(e => Math.abs(e.timestamp - newError.timestamp) < 10000) // 10 seconds
      .slice(-10); // Last 10 errors

    for (const existingError of recentErrors) {
      const correlation = this.findCorrelation(newError, existingError);
      if (correlation) {
        newError.relatedErrors = newError.relatedErrors || [];
        newError.relatedErrors.push(existingError.id);
        
        existingError.relatedErrors = existingError.relatedErrors || [];
        existingError.relatedErrors.push(newError.id);
      }
    }
  }

  /**
   * Find correlation between two errors
   */
  private findCorrelation(error1: ErrorEvent, error2: ErrorEvent): boolean {
    // Same category and similar message
    if (error1.category === error2.category && 
        this.similarity(error1.message, error2.message) > 0.7) {
      return true;
    }

    // Same context keys
    if (error1.context && error2.context) {
      const keys1 = Object.keys(error1.context);
      const keys2 = Object.keys(error2.context);
      const commonKeys = keys1.filter(k => keys2.includes(k));
      if (commonKeys.length > 0) {
        return true;
      }
    }

    // Temporal correlation (within 1 second)
    if (Math.abs(error1.timestamp - error2.timestamp) < 1000) {
      return true;
    }

    return false;
  }

  /**
   * Calculate string similarity
   */
  private similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;
    
    const matrix: number[][] = Array(s2.length + 1).fill(null).map(() => 
      Array(s1.length + 1).fill(0)
    ) as number[][];
    
    for (let i = 0; i <= s1.length; i++) matrix[0]![i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j]![0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,
          matrix[j - 1]![i]! + 1,
          matrix[j - 1]![i - 1]! + indicator
        );
      }
    }
    
    return matrix[s2.length]![s1.length]!;
  }

  /**
   * Send error to backend for correlation
   */
  private async sendErrorToBackend(error: ErrorEvent): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Correlation': 'true'
        },
        body: JSON.stringify(error)
      });
    } catch (error) {
      // Silently fail - backend might not have error endpoint yet
    }
  }

  /**
   * Get all errors with correlations
   */
  public getErrorCorrelation(): ErrorCorrelation {
    const allErrors = [...this.errors, ...this.backendErrorCache];
    
    const frontendErrors = allErrors.filter(e => e.source === 'frontend');
    const backendErrors = allErrors.filter(e => e.source === 'backend');
    const uiErrors = allErrors.filter(e => e.source === 'ui');
    const networkErrors = allErrors.filter(e => e.source === 'network');

    const correlations = this.findCorrelations(allErrors);
    const summary = this.generateSummary(allErrors, correlations);

    return {
      frontendErrors,
      backendErrors,
      uiErrors,
      networkErrors,
      correlations,
      summary
    };
  }

  /**
   * Find correlations between errors
   */
  private findCorrelations(errors: ErrorEvent[]): ErrorCorrelation['correlations'] {
    const correlations: ErrorCorrelation['correlations'] = [];
    const processed = new Set<string>();

    for (const error1 of errors) {
      if (processed.has(error1.id)) continue;

      const relatedErrors = errors.filter(e => 
        e.id !== error1.id && 
        !processed.has(e.id) &&
        this.findCorrelation(error1, e)
      );

      if (relatedErrors.length > 0) {
        const correlation = {
          type: this.determineCorrelationType(error1, relatedErrors[0]!) as any,
          confidence: this.calculateConfidence(error1, relatedErrors),
          description: this.generateCorrelationDescription(error1, relatedErrors),
          errors: [error1.id, ...relatedErrors.map(e => e.id)]
        };

        correlations.push(correlation);
        relatedErrors.forEach(e => processed.add(e.id));
      }

      processed.add(error1.id);
    }

    return correlations;
  }

  /**
   * Determine correlation type
   */
  private determineCorrelationType(error1: ErrorEvent, error2: ErrorEvent): string {
    if (error1.source !== error2.source) return 'causal';
    if (Math.abs(error1.timestamp - error2.timestamp) < 1000) return 'temporal';
    if (error1.category === error2.category) return 'contextual';
    return 'pattern';
  }

  /**
   * Calculate correlation confidence
   */
  private calculateConfidence(error1: ErrorEvent, relatedErrors: ErrorEvent[]): number {
    let totalConfidence = 0;
    
    for (const error2 of relatedErrors) {
      let confidence = 0;
      
      // Category match
      if (error1.category === error2.category) confidence += 0.3;
      
      // Message similarity
      confidence += this.similarity(error1.message, error2.message) * 0.4;
      
      // Temporal proximity
      const timeDiff = Math.abs(error1.timestamp - error2.timestamp);
      if (timeDiff < 1000) confidence += 0.3;
      else if (timeDiff < 5000) confidence += 0.2;
      else if (timeDiff < 10000) confidence += 0.1;
      
      totalConfidence += Math.min(confidence, 1.0);
    }
    
    return totalConfidence / relatedErrors.length;
  }

  /**
   * Generate correlation description
   */
  private generateCorrelationDescription(error1: ErrorEvent, relatedErrors: ErrorEvent[]): string {
    const categories = [error1.category, ...relatedErrors.map(e => e.category)];
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length === 1) {
      return `Multiple ${uniqueCategories[0]} errors detected`;
    }
    
    const sources = [error1.source, ...relatedErrors.map(e => e.source)];
    const uniqueSources = [...new Set(sources)];
    
    if (uniqueSources.length > 1) {
      return `Cross-stack error correlation: ${uniqueSources.join(' + ')}`;
    }
    
    return `Pattern detected: ${relatedErrors.length + 1} related errors`;
  }

  /**
   * Generate error summary
   */
  private generateSummary(errors: ErrorEvent[], correlations: ErrorCorrelation['correlations']): ErrorCorrelation['summary'] {
    const totalErrors = errors.length;
    const criticalErrors = errors.filter(e => e.level === 'error').length;
    const resolvedErrors = errors.filter(e => e.context?.resolved).length;
    
    const patterns = correlations.map(c => c.description);
    const uniquePatterns = [...new Set(patterns)];
    
    const recommendations = this.generateRecommendations(errors, correlations);
    
    return {
      totalErrors,
      criticalErrors,
      resolvedErrors,
      patterns: uniquePatterns,
      recommendations
    };
  }

  /**
   * Generate recommendations based on errors
   */
  private generateRecommendations(errors: ErrorEvent[], correlations: ErrorCorrelation['correlations']): string[] {
    const recommendations: string[] = [];
    
    const ontologyErrors = errors.filter(e => e.category === 'ontology');
    if (ontologyErrors.length > 0) {
      recommendations.push('Consider implementing Palantir Foundry platform integration or mock services');
    }
    
    const typeErrors = errors.filter(e => e.category === 'type');
    if (typeErrors.length > 0) {
      recommendations.push('Review TypeScript type definitions and add missing type annotations');
    }
    
    const networkErrors = errors.filter(e => e.category === 'network');
    if (networkErrors.length > 0) {
      recommendations.push('Check network connectivity and API endpoint availability');
    }
    
    const performanceErrors = errors.filter(e => e.category === 'performance');
    if (performanceErrors.length > 0) {
      recommendations.push('Optimize performance-critical code paths and consider caching');
    }
    
    if (correlations.length > 0) {
      recommendations.push('Investigate correlated errors - they may share a common root cause');
    }
    
    return recommendations;
  }

  /**
   * Export error data for analysis
   */
  public exportErrorData(): string {
    const correlation = this.getErrorCorrelation();
    return JSON.stringify(correlation, null, 2);
  }

  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors = [];
    this.backendErrorCache = [];
  }
}

// Export singleton instance
export const errorCorrelationService = new ErrorCorrelationService();

// Export for global access
(window as any).errorCorrelationService = errorCorrelationService;
