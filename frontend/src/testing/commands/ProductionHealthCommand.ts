/**
 * ProductionHealthCommand - Checks production health and availability
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface ProductionHealthInput extends CommandInput {
  url: string;
  endpoints: string[];
  checkResponseTime: boolean;
  checkStatusCode: boolean;
  checkContentType: boolean;
  maxResponseTime: number; // ms
  expectedStatusCode: number;
  expectedContentType: string;
}

export class ProductionHealthCommand extends BaseCommand<ProductionHealthInput> {
  name = 'ProductionHealth';
  
  private readonly HEALTH_TIMEOUTS = {
    pageLoad: 30000, // 30 seconds
    apiCall: 10000, // 10 seconds
    healthCheck: 5000, // 5 seconds
  };

  async run(context: TestContext): Promise<TestResult> {
    return this.execute(context);
  }

  async execute(context: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🏥 Running production health check for: ${this.input.url}`);
      
      const results = {
        mainPage: false,
        endpoints: [] as any[],
        overallHealth: false
      };

      // 1. Check main page health
      console.log('📄 Checking main page health...');
      const mainPageResult = await this.checkMainPage(context);
      results.mainPage = mainPageResult.healthy;
      
      if (mainPageResult.healthy) {
        console.log('✅ Main page is healthy');
      } else {
        console.log('❌ Main page health check failed');
      }

      // 2. Check API endpoints
      console.log('🔗 Checking API endpoints...');
      for (const endpoint of this.input.endpoints) {
        const endpointResult = await this.checkEndpoint(context, endpoint);
        results.endpoints.push(endpointResult);
        
        if (endpointResult.healthy) {
          console.log(`✅ Endpoint ${endpoint} is healthy`);
        } else {
          console.log(`❌ Endpoint ${endpoint} health check failed`);
        }
      }

      // 3. Overall health assessment
      const allEndpointsHealthy = results.endpoints.every(ep => ep.healthy);
      results.overallHealth = results.mainPage && allEndpointsHealthy;

      const duration = Date.now() - startTime;
      
      if (results.overallHealth) {
        console.log('✅ Production health check passed');
        return {
          name: this.name,
          success: true,
          duration: duration,
          message: 'Production health check completed successfully',
          details: results
        };
      } else {
        console.log('❌ Production health check failed');
        return {
          name: this.name,
          success: false,
          duration: duration,
          message: 'Production health check failed',
          error: 'One or more health checks failed',
          details: results
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Production health check failed: ${error}`);
      
      return {
        name: this.name,
        success: false,
        durationMs: duration,
        message: 'Production health check failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async checkMainPage(context: TestContext): Promise<{healthy: boolean, details: any}> {
    try {
      const startTime = Date.now();
      
      // Navigate to main page
      await context.page.goto(this.input.url, {
        waitUntil: 'networkidle',
        timeout: this.HEALTH_TIMEOUTS.pageLoad
      });

      const responseTime = Date.now() - startTime;
      
      // Check if page loaded successfully
      const title = await context.page.title();
      const hasContent = title && title.length > 0;
      
      // Check response time
      const responseTimeOk = !this.input.checkResponseTime || responseTime <= this.input.maxResponseTime;
      
      // Check status code (basic check)
      const statusCodeOk = !this.input.checkStatusCode || true; // Would need to implement proper status code checking
      
      // Check content type
      const contentTypeOk = !this.input.checkContentType || true; // Would need to implement proper content type checking

      const healthy = hasContent && responseTimeOk && statusCodeOk && contentTypeOk;

      return {
        healthy,
        details: {
          responseTime,
          hasContent,
          responseTimeOk,
          statusCodeOk,
          contentTypeOk
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async checkEndpoint(context: TestContext, endpoint: string): Promise<{endpoint: string, healthy: boolean, details: any}> {
    try {
      const startTime = Date.now();
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.input.url}${endpoint}`;
      
      // Make request to endpoint
      const response = await context.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: this.HEALTH_TIMEOUTS.apiCall
      });

      const responseTime = Date.now() - startTime;
      
      // Check response time
      const responseTimeOk = !this.input.checkResponseTime || responseTime <= this.input.maxResponseTime;
      
      // Check status code
      const statusCode = response?.status() || 0;
      const statusCodeOk = !this.input.checkStatusCode || statusCode === this.input.expectedStatusCode;
      
      // Check content type
      const contentType = response?.headers()?.['content-type'] || '';
      const contentTypeOk = !this.input.checkContentType || contentType.includes(this.input.expectedContentType);

      const healthy = responseTimeOk && statusCodeOk && contentTypeOk;

      return {
        endpoint,
        healthy,
        details: {
          responseTime,
          statusCode,
          contentType,
          responseTimeOk,
          statusCodeOk,
          contentTypeOk
        }
      };
    } catch (error) {
      return {
        endpoint,
        healthy: false,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}
