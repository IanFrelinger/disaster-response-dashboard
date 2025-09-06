/**
 * ProductionTestSuites - Production-specific test suites using command pattern
 */

import { TestSuite } from '../orchestrator/TestOrchestrator';
import { ProductionValidationCommand, ProductionValidationInput } from '../commands/ProductionValidationCommand';
import { ProductionHealthCommand, ProductionHealthInput } from '../commands/ProductionHealthCommand';
import { ProductionMonitoringCommand, ProductionMonitoringInput } from '../commands/ProductionMonitoringCommand';

export function createProductionTestSuites(baseUrl: string): TestSuite[] {
  return [
    {
      name: 'Production Health Check',
      description: 'Validates production health and availability',
      commands: [
        new ProductionHealthCommand({
          name: 'ProductionHealth',
          url: baseUrl,
          endpoints: [
            '/health',
            '/api/health',
            '/api/status'
          ],
          checkResponseTime: true,
          checkStatusCode: true,
          checkContentType: true,
          maxResponseTime: 5000, // 5 seconds
          expectedStatusCode: 200,
          expectedContentType: 'text/html',
          timeout: 30000,
          failFast: true
        })
      ]
    },
    {
      name: 'Production Validation',
      description: 'Comprehensive production validation including performance, security, and accessibility',
      commands: [
        new ProductionValidationCommand({
          name: 'ProductionValidation',
          url: baseUrl,
          checkPerformance: true,
          checkSecurity: true,
          checkAccessibility: true,
          checkConsoleErrors: true,
          checkNetworkRequests: true,
          performanceThresholds: {
            loadTime: 3000, // 3 seconds
            firstContentfulPaint: 1500, // 1.5 seconds
            largestContentfulPaint: 2500, // 2.5 seconds
            cumulativeLayoutShift: 0.1 // 0.1 score
          },
          timeout: 60000,
          failFast: true
        })
      ]
    },
    {
      name: 'Production Monitoring',
      description: 'Monitors production metrics and performance over time',
      commands: [
        new ProductionMonitoringCommand({
          name: 'ProductionMonitoring',
          url: baseUrl,
          monitoringDuration: 30000, // 30 seconds
          checkMemoryUsage: true,
          checkNetworkLatency: true,
          checkErrorRate: true,
          checkUserInteractions: true,
          memoryThreshold: 100, // 100MB
          latencyThreshold: 1000, // 1 second
          errorRateThreshold: 5, // 5%
          timeout: 120000, // 2 minutes
          failFast: true
        })
      ]
    },
    {
      name: 'Production Smoke Test',
      description: 'Quick smoke test for production environment',
      commands: [
        new ProductionHealthCommand({
          name: 'QuickHealthCheck',
          url: baseUrl,
          endpoints: ['/health'],
          checkResponseTime: true,
          checkStatusCode: true,
          checkContentType: false,
          maxResponseTime: 3000, // 3 seconds
          expectedStatusCode: 200,
          expectedContentType: 'text/html',
          timeout: 15000,
          failFast: true
        }),
        new ProductionValidationCommand({
          name: 'QuickValidation',
          url: baseUrl,
          checkPerformance: true,
          checkSecurity: false,
          checkAccessibility: false,
          checkConsoleErrors: true,
          checkNetworkRequests: false,
          performanceThresholds: {
            loadTime: 5000, // 5 seconds
            firstContentfulPaint: 2000, // 2 seconds
            largestContentfulPaint: 4000, // 4 seconds
            cumulativeLayoutShift: 0.2 // 0.2 score
          },
          timeout: 30000,
          failFast: true
        })
      ]
    },
    {
      name: 'Production Performance Test',
      description: 'Focused performance testing for production',
      commands: [
        new ProductionValidationCommand({
          name: 'PerformanceValidation',
          url: baseUrl,
          checkPerformance: true,
          checkSecurity: false,
          checkAccessibility: false,
          checkConsoleErrors: false,
          checkNetworkRequests: false,
          performanceThresholds: {
            loadTime: 2000, // 2 seconds
            firstContentfulPaint: 1000, // 1 second
            largestContentfulPaint: 2000, // 2 seconds
            cumulativeLayoutShift: 0.05 // 0.05 score
          },
          timeout: 45000,
          failFast: true
        }),
        new ProductionMonitoringCommand({
          name: 'PerformanceMonitoring',
          url: baseUrl,
          monitoringDuration: 15000, // 15 seconds
          checkMemoryUsage: true,
          checkNetworkLatency: true,
          checkErrorRate: false,
          checkUserInteractions: false,
          memoryThreshold: 50, // 50MB
          latencyThreshold: 500, // 500ms
          errorRateThreshold: 0,
          timeout: 60000,
          failFast: true
        })
      ]
    },
    {
      name: 'Production Security Test',
      description: 'Security-focused testing for production',
      commands: [
        new ProductionValidationCommand({
          name: 'SecurityValidation',
          url: baseUrl,
          checkPerformance: false,
          checkSecurity: true,
          checkAccessibility: false,
          checkConsoleErrors: true,
          checkNetworkRequests: true,
          performanceThresholds: {
            loadTime: 10000,
            firstContentfulPaint: 5000,
            largestContentfulPaint: 8000,
            cumulativeLayoutShift: 1.0
          },
          timeout: 30000,
          failFast: true
        })
      ]
    }
  ];
}
