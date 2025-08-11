import { test, expect } from '@playwright/test';

test.describe('Minimal React Test', () => {
  test('should check if React is working at all', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more
    await page.waitForTimeout(5000);
    
    // Check if React is actually running
    const reactRunning = await page.evaluate(() => {
      // Check if React is available
      if (typeof window !== 'undefined' && window.React) {
        return 'React global available';
      }
      
      // Check if React components are mounted
      const root = document.getElementById('root');
      if (root && root._reactInternalFiber) {
        return 'React fiber found';
      }
      
      // Check if any React-like elements exist
      const reactElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
      if (reactElements.length > 0) {
        return `React elements found: ${reactElements.length}`;
      }
      
      // Check if the root has any content at all
      if (root && root.innerHTML.trim() !== '') {
        return `Root has content: ${root.innerHTML.substring(0, 100)}...`;
      }
      
      return 'No React detected';
    });
    
    console.log('React status:', reactRunning);
    
    // Check what's actually in the DOM
    const bodyContent = await page.evaluate(() => {
      return {
        bodyChildren: document.body.children.length,
        rootExists: !!document.getElementById('root'),
        rootContent: document.getElementById('root')?.innerHTML || 'empty',
        rootClasses: document.getElementById('root')?.className || 'none',
        rootStyles: document.getElementById('root')?.style.cssText || 'none'
      };
    });
    
    console.log('DOM analysis:', bodyContent);
    
    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit more to catch errors
    await page.waitForTimeout(3000);
    
    if (errors.length > 0) {
      console.log('JavaScript errors found:');
      errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('No JavaScript errors found');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'minimal-react-test.png', fullPage: true });
  });
});
