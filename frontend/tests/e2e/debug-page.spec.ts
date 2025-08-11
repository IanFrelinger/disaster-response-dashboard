import { test, expect } from '@playwright/test';

test.describe('Debug Page Elements', () => {
  test('should show what elements are available', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(5000);
    
    // Take a screenshot to see what's there
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
    
    // Log the page title
    console.log('Page title:', await page.title());
    
    // Log all available elements with class names
    const elementsWithClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('*[class]');
      const classMap: Record<string, string[]> = {};
      
      elements.forEach(el => {
        const className = el.className;
        const tagName = el.tagName;
        if (!classMap[tagName]) classMap[tagName] = [];
        if (!classMap[tagName].includes(className)) {
          classMap[tagName].push(className);
        }
      });
      
      return classMap;
    });
    
    console.log('Elements with classes:', JSON.stringify(elementsWithClasses, null, 2));
    
    // Look for any map-related elements
    const mapElements = await page.locator('*[class*="map"], *[class*="Map"], *[id*="map"], *[id*="Map"]').count();
    console.log('Map-related elements found:', mapElements);
    
    // Look for analytics panel
    const analyticsElements = await page.locator('*[class*="analytics"], *[class*="Analytics"]').count();
    console.log('Analytics-related elements found:', analyticsElements);
    
    // Check if the page has any content
    const bodyText = await page.locator('body').textContent();
    console.log('Body text preview:', bodyText?.substring(0, 500));
  });
});
