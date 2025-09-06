/**
 * RobustnessCommand - Tests error handling and graceful degradation
 */

import type { TestCommand, TestContext, TestResult, RobustnessInput } from './TestCommand';

// Timeout configurations for robustness tests
const ROBUSTNESS_TEST_TIMEOUTS = {
  pageLoad: 30000,        // 30s for page load
  elementWait: 10000,     // 10s for element waits
  mapLoad: 20000,         // 20s for map initialization
  failureSimulation: 5000, // 5s for failure simulation
  recoveryWait: 10000     // 10s for recovery
};

export class RobustnessCommand implements TestCommand {
  name = 'Robustness';
  private input: RobustnessInput;

  constructor(input: RobustnessInput = {}) {
    this.input = {
      failureRate: 0.3, // 30% failure rate by default
      endpoints: ['**/tiles/**', '**/api/**'],
      ...input
    };
  }

  async run(ctx: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    const artifacts: string[] = [];
    
    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log(`🔍 Running robustness test: ${(this.input.failureRate! * 100).toFixed(0)}% failure rate`);

      // Check if we're in test mode
      const isTestMode = ctx.page.url().includes('test=true');
      
      if (isTestMode) {
        console.log('🧪 Test mode detected - skipping robustness test (not applicable in test mode)');
        return {
          name: this.name,
          success: true,
          details: 'Robustness test skipped in test mode - not applicable',
          artifacts: [],
          durationMs: Date.now() - startTime
        };
      }

      // Set up request interception
      await this.setupRequestInterception(ctx.page);

      // Navigate to the URL
      await ctx.page.goto(ctx.baseUrl, { 
        waitUntil: 'networkidle',
        timeout: ROBUSTNESS_TEST_TIMEOUTS.pageLoad 
      });

      // Wait for map container
      await ctx.page.waitForSelector('.map-container-3d', { timeout: ROBUSTNESS_TEST_TIMEOUTS.elementWait });

      // Click on "Open 3D Map" button if it exists
      try {
        await ctx.page.waitForSelector('button:has-text("Open 3D Map")', { timeout: ROBUSTNESS_TEST_TIMEOUTS.elementWait });
        await ctx.page.click('button:has-text("Open 3D Map")');
        console.log('✅ 3D Map button clicked');
      } catch (error) {
        console.log('ℹ️ 3D Map button not found, assuming already in 3D mode');
      }

      // Wait for initial load
      await ctx.page.waitForTimeout(2000);

      // Check for error UI
      const errorUI = await this.checkErrorUI(ctx.page);

      // Check console for errors
      const consoleErrors = await this.getConsoleErrors(ctx.page);

      // Check if map is still functional
      const mapFunctional = await this.checkMapFunctionality(ctx.page);

      // Take screenshot
      const screenshotPath = `${ctx.artifactsDir}/robustness-test-${Date.now()}.png`;
      await ctx.page.screenshot({ path: screenshotPath, fullPage: true });
      artifacts.push(screenshotPath);

      // Determine success
      const hasErrorUI = errorUI.present;
      const hasReasonableErrors = consoleErrors.length <= 5; // Allow some errors
      const mapStillWorks = mapFunctional;

      const success = hasErrorUI && hasReasonableErrors && mapStillWorks;

      let details = `Error UI: ${hasErrorUI ? '✅' : '❌'} ${errorUI.message}\n`;
      details += `Console errors: ${consoleErrors.length} (${hasReasonableErrors ? '✅' : '❌'})\n`;
      details += `Map functional: ${mapStillWorks ? '✅' : '❌'}\n`;
      
      if (consoleErrors.length > 0) {
        details += `Console errors: ${consoleErrors.slice(0, 3).join(', ')}${consoleErrors.length > 3 ? '...' : ''}\n`;
      }

      const durationMs = Date.now() - startTime;

      return {
        name: this.name,
        success: success,
        details: details.trim(),
        artifacts,
        durationMs
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        name: this.name,
        success: false,
        details: `Robustness test failed: ${error instanceof Error ? error.message : String(error)}`,
        artifacts,
        durationMs,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  private async setupRequestInterception(page: any): Promise<void> {
    await page.route('**/*', (route: any) => {
      const url = route.request().url();
      
      // Check if this request should be failed
      const shouldFail = this.input.endpoints!.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*'));
        return regex.test(url);
      });

      if (shouldFail && Math.random() < this.input.failureRate!) {
        console.log(`🚫 Failing request: ${url}`);
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  private async checkErrorUI(page: any): Promise<{ present: boolean; message: string }> {
    return await page.evaluate(() => {
      // Look for common error UI elements
      const errorSelectors = [
        '[data-testid="map-error-banner"]',
        '[data-testid="error-message"]',
        '.error-banner',
        '.error-message',
        '[class*="error"]',
        '[class*="failed"]'
      ];

      for (const selector of errorSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return {
            present: true,
            message: element.textContent.trim()
          };
        }
      }

      // Check for error text in the page
      const bodyText = document.body.textContent || '';
      const errorKeywords = ['error', 'failed', 'unavailable', 'offline', 'network'];
      
      for (const keyword of errorKeywords) {
        if (bodyText.toLowerCase().includes(keyword)) {
          return {
            present: true,
            message: `Found error keyword: ${keyword}`
          };
        }
      }

      return {
        present: false,
        message: 'No error UI found'
      };
    });
  }

  private async getConsoleErrors(page: any): Promise<string[]> {
    const errors: string[] = [];
    
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for errors to accumulate
    await page.waitForTimeout(1000);

    return errors;
  }

  private async checkMapFunctionality(page: any): Promise<boolean> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return false;

      try {
        // Check if map is still responsive
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        // Try to interact with the map
        map.setZoom(zoom + 0.1);
        map.setZoom(zoom);
        
        // Check if layers are still accessible
        const style = map.getStyle();
        const hasLayers = style && style.layers && style.layers.length > 0;
        
        return hasLayers && center && typeof zoom === 'number';
      } catch (error) {
        console.warn('Map functionality check failed:', error);
        return false;
      }
    });
  }
}
