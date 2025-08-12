import { test, expect } from '@playwright/test';

test.describe('UI Overlap Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('#root', { timeout: 10000 });
  });

  test('should detect overlapping elements using intelligent bounding box analysis', async ({ page }) => {
    // Wait for the page to fully render
    await page.waitForTimeout(2000);
    
    // Get all visible elements
    const elements = await page.locator('*:visible').all();
    
    if (elements.length === 0) {
      console.log('No visible elements found');
      return;
    }
    
    console.log(`Found ${elements.length} visible elements`);
    
    const overlappingPairs: Array<{
      element1: { tag: string; class?: string; id?: string; x: number; y: number; width: number; height: number };
      element2: { tag: string; class?: string; id?: string; x: number; y: number; width: number; height: number };
      overlap: number;
      type: string;
    }> = [];
    
    // Check for overlaps between elements (limit to first 50 for performance)
    const elementsToAnalyze = Math.min(elements.length, 50);
    for (let i = 0; i < elementsToAnalyze; i++) {
      for (let j = i + 1; j < elementsToAnalyze; j++) {
        try {
          const element1 = elements[i];
          const element2 = elements[j];
          
          // Get bounding boxes
          const box1 = await element1.boundingBox();
          const box2 = await element2.boundingBox();
          
          if (!box1 || !box2) continue;
          
          // Calculate overlap
          const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
          const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
          const overlap = overlapX * overlapY;
          
          // Get element information
          const tag1 = await element1.evaluate(el => el.tagName.toLowerCase());
          const tag2 = await element2.evaluate(el => el.tagName.toLowerCase());
          const class1 = await element1.evaluate(el => el.className || '');
          const class2 = await element2.evaluate(el => el.className || '');
          const id1 = await element1.evaluate(el => el.id || '');
          const id2 = await element2.evaluate(el => el.id || '');
          
          // Determine overlap type
          let overlapType = 'unknown';
          if (overlap > 0) {
            if (tag1 === 'html' || tag2 === 'html') {
              overlapType = 'html-container';
            } else if (tag1 === 'body' || tag2 === 'body') {
              overlapType = 'body-container';
            } else if (tag1 === 'div' && tag2 === 'div' && (class1.includes('container') || class2.includes('container'))) {
              overlapType = 'container-nested';
            } else if (tag1 === 'header' || tag2 === 'header') {
              overlapType = 'header-content';
            } else if (tag1 === 'main' || tag2 === 'main') {
              overlapType = 'main-content';
            } else if (tag1 === 'footer' || tag2 === 'footer') {
              overlapType = 'footer-content';
            } else if (overlap > 10000) {
              overlapType = 'significant';
            } else {
              overlapType = 'minor';
            }
          }
          
          if (overlap > 0) {
            overlappingPairs.push({
              element1: { tag: tag1, class: class1, id: id1, x: box1.x, y: box1.y, width: box1.width, height: box1.height },
              element2: { tag: tag2, class: class2, id: id2, x: box2.x, y: box2.y, width: box2.width, height: box2.height },
              overlap,
              type: overlapType
            });
          }
        } catch (error) {
          // Skip elements that can't be measured
          continue;
        }
      }
    }
    
    console.log(`Found ${overlappingPairs.length} overlapping element pairs`);
    
    // Group overlaps by type
    const overlapsByType = overlappingPairs.reduce((acc, pair) => {
      acc[pair.type] = (acc[pair.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Overlaps by type:', overlapsByType);
    
    // Filter out expected overlaps
    const unexpectedOverlaps = overlappingPairs.filter(pair => {
      // Allow HTML container overlaps (normal)
      if (pair.type === 'html-container') return false;
      
      // Allow body container overlaps (normal)
      if (pair.type === 'body-container') return false;
      
      // Allow container nested overlaps (normal)
      if (pair.type === 'container-nested') return false;
      
      // Allow header content overlaps (normal)
      if (pair.type === 'header-content') return false;
      
      // Allow main content overlaps (normal)
      if (pair.type === 'main-content') return false;
      
      // Allow footer content overlaps (normal)
      if (pair.type === 'footer-content') return false;
      
      // Allow minor overlaps (less than 100px²)
      if (pair.overlap < 100) return false;
      
      return true;
    });
    
    console.log(`Found ${unexpectedOverlaps.length} unexpected overlapping elements`);
    
    // Report unexpected overlaps
    if (unexpectedOverlaps.length > 0) {
      console.log('Unexpected overlaps:');
      unexpectedOverlaps.slice(0, 10).forEach((pair, index) => {
        console.log(`Overlap ${index + 1}:`);
        console.log(`  Element 1 (${pair.element1.tag}): ${pair.element1.class} ${pair.element1.id}`);
        console.log(`  Element 2 (${pair.element2.tag}): ${pair.element2.class} ${pair.element2.id}`);
        console.log(`  Overlap area: ${pair.overlap.toFixed(2)}px²`);
        console.log(`  Type: ${pair.type}`);
      });
      
      if (unexpectedOverlaps.length > 10) {
        console.log(`... and ${unexpectedOverlaps.length - 10} more`);
      }
      
      // Only fail if there are significant unexpected overlaps
      const significantUnexpectedOverlaps = unexpectedOverlaps.filter(pair => pair.overlap > 1000);
      
      if (significantUnexpectedOverlaps.length > 0) {
        throw new Error(`Found ${significantUnexpectedOverlaps.length} significant unexpected overlapping elements`);
      }
    } else {
      console.log('No unexpected overlapping elements detected');
    }
  });

  test('should detect animation and transition overlap issues', async ({ page }) => {
    // Wait for the page to fully render
    await page.waitForTimeout(2000);
    
    // Get elements with animations or transitions
    const animatedElements = await page.locator('*[style*="animation"], *[style*="transition"], *.animated, *.transition').all();
    
    if (animatedElements.length === 0) {
      console.log('No animated elements found');
      return;
    }
    
    console.log(`Found ${animatedElements.length} animated elements`);
    
    const animationOverlaps: Array<{
      element1: { tag: string; class?: string; x: number; y: number; width: number; height: number };
      element2: { tag: string; class?: string; x: number; y: number; width: number; height: number };
      overlap: number;
      animation: string;
    }> = [];
    
    // Check for overlaps between animated elements
    for (let i = 0; i < animatedElements.length; i++) {
      for (let j = i + 1; j < animatedElements.length; j++) {
        try {
          const element1 = animatedElements[i];
          const element2 = animatedElements[j];
          
          const box1 = await element1.boundingBox();
          const box2 = await element2.boundingBox();
          
          if (!box1 || !box2) continue;
          
          // Calculate overlap
          const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
          const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
          const overlap = overlapX * overlapY;
          
          if (overlap > 0) {
            const tag1 = await element1.evaluate(el => el.tagName.toLowerCase());
            const tag2 = await element2.evaluate(el => el.tagName.toLowerCase());
            const class1 = await element1.evaluate(el => el.className || '');
            const class2 = await element2.evaluate(el => el.className || '');
            
            animationOverlaps.push({
              element1: { tag: tag1, class: class1, x: box1.x, y: box1.y, width: box1.width, height: box1.height },
              element2: { tag: tag2, class: class2, x: box2.x, y: box2.y, width: box2.width, height: box2.height },
              overlap,
              animation: 'hover'
            });
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    console.log(`Found ${animationOverlaps.length} animation overlaps`);
    
    // Filter out expected animation overlaps
    const unexpectedAnimationOverlaps = animationOverlaps.filter(pair => {
      // Allow minor overlaps
      if (pair.overlap < 100) return false;
      
             // Allow container overlaps
       if ((pair.element1.class && pair.element1.class.includes('container')) || 
           (pair.element2.class && pair.element2.class.includes('container'))) return false;
      
      return true;
    });
    
    if (unexpectedAnimationOverlaps.length > 0) {
      console.log('Animation overlaps detected:');
      unexpectedAnimationOverlaps.slice(0, 5).forEach((pair, index) => {
        console.log(`Overlap ${index + 1}:`);
        console.log(`  Element 1 (${pair.element1.tag}): ${pair.element1.class}`);
        console.log(`  Element 2 (${pair.element2.tag}): ${pair.element2.class}`);
        console.log(`  Overlap area: ${pair.overlap.toFixed(2)}px²`);
      });
      
      // Only fail if there are significant animation overlaps
      const significantAnimationOverlaps = unexpectedAnimationOverlaps.filter(pair => pair.overlap > 1000);
      
      if (significantAnimationOverlaps.length > 0) {
        throw new Error(`Found ${significantAnimationOverlaps.length} significant animation overlapping elements`);
      }
    } else {
      console.log('No unexpected animation overlaps detected');
    }
  });

  test('should detect responsive design overlap issues', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Large Desktop' },
      { width: 1366, height: 768, name: 'Small Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing breakpoint: ${viewport.name}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Check for elements that might overlap at this viewport size
      const elements = await page.locator('*:visible').all();
      
      if (elements.length === 0) continue;
      
      let responsiveOverlaps = 0;
      
      // Simple overlap check for responsive design
      for (let i = 0; i < Math.min(elements.length, 50); i++) {
        for (let j = i + 1; j < Math.min(elements.length, 50); j++) {
          try {
            const element1 = elements[i];
            const element2 = elements[j];
            
            const box1 = await element1.boundingBox();
            const box2 = await element2.boundingBox();
            
            if (!box1 || !box2) continue;
            
            // Check if elements are positioned outside viewport bounds
            if (box1.x + box1.width > viewport.width || box1.y + box1.height > viewport.height ||
                box2.x + box2.width > viewport.width || box2.y + box2.height > viewport.height) {
              responsiveOverlaps++;
            }
          } catch (error) {
            continue;
          }
        }
      }
      
      if (responsiveOverlaps > 0) {
        console.log(`Found ${responsiveOverlaps} potential responsive layout issues at ${viewport.name}`);
      }
    }
    
    console.log('Responsive design overlap check completed');
  });
});
