/**
 * PageLoadCommand - Tests basic page loading functionality
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface PageLoadInput extends CommandInput {
  url: string;
  expectedTitle?: string;
  expectedElements?: string[];
  checkConsoleErrors?: boolean;
}

export class PageLoadCommand extends BaseCommand<PageLoadInput> {
  name = 'PageLoad';

  constructor(input: PageLoadInput) {
    super(input);
  }

  async run(ctx: TestContext): Promise<TestResult> {
    this.startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const artifacts: string[] = [];

    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log(`🔍 Running page load test for: ${this.input.url}`);

      // Navigate to the page with timeout
      await this.executeWithTimeout(
        () => ctx.page.goto(this.input.url, { 
          waitUntil: 'networkidle',
          timeout: GLOBAL_TIMEOUTS.pageLoad 
        }),
        GLOBAL_TIMEOUTS.pageLoad,
        'Page navigation timeout'
      );

      // Check page title if expected
      if (this.input.expectedTitle) {
        await this.executeWithTimeout(
          () => ctx.page.title(),
          GLOBAL_TIMEOUTS.elementWait,
          'Page title check timeout'
        ).then((title: unknown) => {
          const titleStr = String(title);
          if (!titleStr.includes(this.input.expectedTitle!)) {
            errors.push(`Expected title to contain "${this.input.expectedTitle}", got "${titleStr}"`);
          }
        });
      }

      // Check for expected elements
      if (this.input.expectedElements) {
        for (const selector of this.input.expectedElements) {
          try {
            await this.executeWithTimeout(
              () => ctx.page.waitForSelector(selector),
              GLOBAL_TIMEOUTS.elementWait,
              `Element "${selector}" not found`
            );
          } catch (error) {
            errors.push(`Expected element not found: ${selector}`);
          }
        }
      }

      // Check for console errors
      if (this.input.checkConsoleErrors) {
        const consoleErrors: string[] = [];
        ctx.page.on('console', (msg: any) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        // Wait a bit for any console errors to appear
        await ctx.page.waitForTimeout(2000);

        if (consoleErrors.length > 0) {
          warnings.push(`Console errors detected: ${consoleErrors.join(', ')}`);
        }
      }

      // Take screenshot for artifacts
      try {
        const screenshotPath = `test-results/page-load-${Date.now()}.png`;
        await this.executeWithTimeout(
          () => ctx.page.screenshot({ path: screenshotPath, fullPage: true }),
          GLOBAL_TIMEOUTS.screenshot,
          'Screenshot capture timeout'
        );
        artifacts.push(screenshotPath);
      } catch (error) {
        warnings.push(`Failed to capture screenshot: ${error}`);
      }

      const success = errors.length === 0;
      
      if (!success && this.input.failFast) {
        throw new Error(`Page load test failed: ${errors.join(', ')}`);
      }

      return this.createResult(success, errors, warnings, artifacts, {
        url: this.input.url,
        loadTime: Date.now() - this.startTime
      });

    } catch (error) {
      return this.createResult(false, [`Page load test failed: ${error}`], warnings, artifacts);
    }
  }
}
