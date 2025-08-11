import { test, expect } from '@playwright/test';

test.describe('Debug Root Element Issue', () => {
  test('should debug why root element is hidden', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for React to render
    await page.waitForTimeout(3000);
    
    // Check the root element
    const rootElement = page.locator('#root');
    
    // Log what we find
    console.log('Root element exists:', await rootElement.count() > 0);
    
    if (await rootElement.count() > 0) {
      // Check if it's visible
      const isVisible = await rootElement.isVisible();
      console.log('Root element is visible:', isVisible);
      
      // Get computed styles
      const styles = await rootElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          position: computed.position,
          zIndex: computed.zIndex
        };
      });
      
      console.log('Root element computed styles:', styles);
      
      // Check if it has children
      const children = await rootElement.locator('*').count();
      console.log('Root element has children:', children);
      
      if (children > 0) {
        // Log first few children
        for (let i = 0; i < Math.min(children, 3); i++) {
          const child = rootElement.locator('*').nth(i);
          const tagName = await child.evaluate(el => el.tagName);
          const className = await child.getAttribute('class');
          const isChildVisible = await child.isVisible();
          console.log(`Child ${i + 1}: ${tagName}, class: ${className}, visible: ${isChildVisible}`);
        }
      }
      
      // Check for any error messages
      const errorMessages = page.locator('text=Error, text=Failed, text=Error:, text=Failed to');
      if (await errorMessages.count() > 0) {
        console.log('Found error messages on page');
        for (let i = 0; i < await errorMessages.count(); i++) {
          const error = errorMessages.nth(i);
          console.log(`Error ${i + 1}:`, await error.textContent());
        }
      }
    }
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'debug-root-element.png', fullPage: true });
    
    // Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit more to catch errors
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors found:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('No console errors found');
    }
  });
});
