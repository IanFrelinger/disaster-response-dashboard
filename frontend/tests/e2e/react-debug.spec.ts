import { test, expect } from '@playwright/test';

test.describe('React Debug Test', () => {
  test('should capture React errors and console messages', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(`Page Error: ${error.message}`);
    });

    // Navigate to the page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait longer for React to potentially render
    await page.waitForTimeout(5000);
    
    // Check if React is available
    const reactStatus = await page.evaluate(() => {
      // Check if React is available
      if (typeof window !== 'undefined' && window.React) {
        return 'React global available';
      }
      
      // Check if React components are mounted
      const root = document.getElementById('root');
      if (root && root._reactInternalFiber) {
        return 'React fiber detected';
      }
      
      // Check for any React-related errors
      if (root && root.innerHTML.includes('Error')) {
        return 'Error in root content';
      }
      
      // Check root content
      return `Root content: "${root?.innerHTML || 'empty'}"`;
    });
    
    console.log('React Status:', reactStatus);
    console.log('Console Messages:', consoleMessages);
    console.log('Page Errors:', pageErrors);
    
    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'react-debug-screenshot.png' });
    
    // Check if there are any error boundaries or error messages
    const errorElements = await page.locator('[class*="error"], [class*="Error"], [class*="ERROR"]').count();
    console.log('Error elements found:', errorElements);
    
    // Check if there are any loading states
    const loadingElements = await page.locator('[class*="loading"], [class*="Loading"], [class*="spinner"]').count();
    console.log('Loading elements found:', loadingElements);
  });
});
