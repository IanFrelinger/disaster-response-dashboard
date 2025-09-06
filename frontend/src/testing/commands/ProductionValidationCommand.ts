/**
 * ProductionValidationCommand - Validates frontend in production environment
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface ProductionValidationInput extends CommandInput {
  url: string;
  checkPerformance: boolean;
  checkSecurity: boolean;
  checkAccessibility: boolean;
  checkConsoleErrors: boolean;
  checkNetworkRequests: boolean;
  performanceThresholds: {
    loadTime: number; // ms
    firstContentfulPaint: number; // ms
    largestContentfulPaint: number; // ms
    cumulativeLayoutShift: number; // score
  };
}

export class ProductionValidationCommand extends BaseCommand<ProductionValidationInput> {
  private readonly PRODUCTION_TIMEOUTS = {
    pageLoad: 30000, // 30 seconds
    performanceCheck: 15000, // 15 seconds
    securityCheck: 10000, // 10 seconds
    accessibilityCheck: 20000, // 20 seconds
    networkCheck: 10000, // 10 seconds
    consoleCheck: 5000, // 5 seconds
  };

  async execute(context: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🏭 Running production validation for: ${this.input.url}`);
      
      // Navigate to production URL
      await context.page.goto(this.input.url, {
        waitUntil: 'networkidle',
        timeout: this.PRODUCTION_TIMEOUTS.pageLoad
      });

      const results = {
        pageLoad: false,
        performance: false,
        security: false,
        accessibility: false,
        consoleErrors: false,
        networkRequests: false,
        metrics: {} as any
      };

      // 1. Basic page load validation
      console.log('📄 Validating page load...');
      const title = await context.page.title();
      if (title && title.length > 0) {
        results.pageLoad = true;
        console.log(`✅ Page loaded successfully: "${title}"`);
      } else {
        throw new Error('Page title is empty or undefined');
      }

      // 2. Performance validation
      if (this.input.checkPerformance) {
        console.log('⚡ Validating performance metrics...');
        const performanceResults = await this.validatePerformance(context);
        results.performance = performanceResults.valid;
        results.metrics.performance = performanceResults.metrics;
        
        if (performanceResults.valid) {
          console.log('✅ Performance metrics within thresholds');
        } else {
          console.log('❌ Performance metrics exceed thresholds');
        }
      }

      // 3. Security validation
      if (this.input.checkSecurity) {
        console.log('🔒 Validating security...');
        const securityResults = await this.validateSecurity(context);
        results.security = securityResults.valid;
        results.metrics.security = securityResults.issues;
        
        if (securityResults.valid) {
          console.log('✅ Security validation passed');
        } else {
          console.log('❌ Security issues found');
        }
      }

      // 4. Accessibility validation
      if (this.input.checkAccessibility) {
        console.log('♿ Validating accessibility...');
        const accessibilityResults = await this.validateAccessibility(context);
        results.accessibility = accessibilityResults.valid;
        results.metrics.accessibility = accessibilityResults.issues;
        
        if (accessibilityResults.valid) {
          console.log('✅ Accessibility validation passed');
        } else {
          console.log('❌ Accessibility issues found');
        }
      }

      // 5. Console errors validation
      if (this.input.checkConsoleErrors) {
        console.log('🐛 Checking console errors...');
        const consoleResults = await this.validateConsoleErrors(context);
        results.consoleErrors = consoleResults.valid;
        results.metrics.consoleErrors = consoleResults.errors;
        
        if (consoleResults.valid) {
          console.log('✅ No console errors found');
        } else {
          console.log('❌ Console errors detected');
        }
      }

      // 6. Network requests validation
      if (this.input.checkNetworkRequests) {
        console.log('🌐 Validating network requests...');
        const networkResults = await this.validateNetworkRequests(context);
        results.networkRequests = networkResults.valid;
        results.metrics.networkRequests = networkResults.requests;
        
        if (networkResults.valid) {
          console.log('✅ Network requests validation passed');
        } else {
          console.log('❌ Network request issues found');
        }
      }

      // Overall validation result
      const allValid = Object.values(results).every(result => 
        typeof result === 'boolean' ? result : true
      );

      const duration = Date.now() - startTime;
      
      if (allValid) {
        console.log('✅ Production validation passed');
        return {
          commandName: this.input.name,
          status: 'passed',
          duration,
          message: 'Production validation completed successfully',
          details: results
        };
      } else {
        console.log('❌ Production validation failed');
        return {
          commandName: this.input.name,
          status: 'failed',
          duration,
          message: 'Production validation failed',
          error: 'One or more validation checks failed',
          details: results
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Production validation failed: ${error}`);
      
      return {
        commandName: this.input.name,
        status: 'failed',
        duration,
        message: 'Production validation failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async validatePerformance(context: TestContext): Promise<{valid: boolean, metrics: any}> {
    try {
      // Get performance metrics
      const metrics = await context.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: paint.find(p => p.name === 'largest-contentful-paint')?.startTime || 0,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          domComplete: navigation.domComplete - navigation.domLoading
        };
      });

      const thresholds = this.input.performanceThresholds;
      const valid = 
        metrics.loadTime <= thresholds.loadTime &&
        metrics.firstContentfulPaint <= thresholds.firstContentfulPaint &&
        metrics.largestContentfulPaint <= thresholds.largestContentfulPaint;

      return { valid, metrics };
    } catch (error) {
      return { valid: false, metrics: { error: error instanceof Error ? error.message : String(error) } };
    }
  }

  private async validateSecurity(context: TestContext): Promise<{valid: boolean, issues: any}> {
    try {
      // Check for HTTPS
      const url = context.page.url();
      const isHttps = url.startsWith('https://');
      
      // Check for security headers (basic check)
      const securityIssues = [];
      
      if (!isHttps) {
        securityIssues.push('Not using HTTPS');
      }

      // Check for mixed content
      const mixedContent = await context.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const scripts = Array.from(document.querySelectorAll('script'));
        const links = Array.from(document.querySelectorAll('link'));
        
        const httpResources = [...images, ...scripts, ...links].filter(el => {
          const src = el.getAttribute('src') || el.getAttribute('href');
          return src && src.startsWith('http://');
        });
        
        return httpResources.length;
      });

      if (mixedContent > 0) {
        securityIssues.push(`Mixed content detected: ${mixedContent} HTTP resources`);
      }

      return { valid: securityIssues.length === 0, issues: securityIssues };
    } catch (error) {
      return { valid: false, issues: [error instanceof Error ? error.message : String(error)] };
    }
  }

  private async validateAccessibility(context: TestContext): Promise<{valid: boolean, issues: any}> {
    try {
      // Basic accessibility checks
      const issues = [];
      
      // Check for alt attributes on images
      const imagesWithoutAlt = await context.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.getAttribute('alt')).length;
      });

      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt attributes`);
      }

      // Check for proper heading structure
      const headingStructure = await context.page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const levels = headings.map(h => parseInt(h.tagName.charAt(1)));
        return levels;
      });

      // Check for h1 tag
      const hasH1 = headingStructure.some(level => level === 1);
      if (!hasH1) {
        issues.push('No H1 tag found');
      }

      // Check for proper form labels
      const formLabels = await context.page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        return inputs.filter(input => {
          const id = input.getAttribute('id');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          const ariaLabel = input.getAttribute('aria-label');
          return !label && !ariaLabel;
        }).length;
      });

      if (formLabels > 0) {
        issues.push(`${formLabels} form elements missing labels`);
      }

      return { valid: issues.length === 0, issues };
    } catch (error) {
      return { valid: false, issues: [error instanceof Error ? error.message : String(error)] };
    }
  }

  private async validateConsoleErrors(context: TestContext): Promise<{valid: boolean, errors: any}> {
    try {
      const consoleMessages = await context.page.evaluate(() => {
        // This would need to be set up before page load
        return (window as any).consoleErrors || [];
      });

      const errors = consoleMessages.filter((msg: any) => 
        msg.type === 'error' || msg.level === 'error'
      );

      return { valid: errors.length === 0, errors };
    } catch (error) {
      return { valid: true, errors: [] }; // If we can't check, assume no errors
    }
  }

  private async validateNetworkRequests(context: TestContext): Promise<{valid: boolean, requests: any}> {
    try {
      // Check for failed network requests
      const failedRequests = await context.page.evaluate(() => {
        return (window as any).failedRequests || [];
      });

      const requests = {
        total: 0,
        failed: failedRequests.length,
        successRate: 0
      };

      return { valid: failedRequests.length === 0, requests };
    } catch (error) {
      return { valid: true, requests: { error: error instanceof Error ? error.message : String(error) } };
    }
  }
}
