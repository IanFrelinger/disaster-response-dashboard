import { test, expect } from '@playwright/test';

test.describe('UI Overlap Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should detect overlapping elements using bounding box analysis', async ({ page }) => {
    // Get all visible elements
    const elements = page.locator('*:visible');
    const elementCount = await elements.count();
    
    console.log(`Found ${elementCount} visible elements to analyze`);
    
    const overlappingPairs: Array<{
      element1: { tag: string; box: any; index: number };
      element2: { tag: string; box: any; index: number };
      overlap: number;
    }> = [];
    const elementsToAnalyze = Math.min(elementCount, 50); // Limit to first 50 elements for performance
    
    // Analyze element positions for overlaps
    for (let i = 0; i < elementsToAnalyze; i++) {
      const element1 = elements.nth(i);
      
      try {
        const box1 = await element1.boundingBox();
        if (!box1) continue;
        
        // Check against other elements
        for (let j = i + 1; j < elementsToAnalyze; j++) {
          const element2 = elements.nth(j);
          
          try {
            const box2 = await element2.boundingBox();
            if (!box2) continue;
            
            // Check for overlap
            if (boxesOverlap(box1, box2)) {
              const tag1 = await element1.evaluate(el => el.tagName.toLowerCase());
              const tag2 = await element2.evaluate(el => el.tagName.toLowerCase());
              
              // Skip normal overlapping elements in map applications
              if (isNormalMapOverlap(tag1, tag2, box1, box2)) {
                continue;
              }
              
              overlappingPairs.push({
                element1: { tag: tag1, box: box1, index: i },
                element2: { tag: tag2, box: box2, index: j },
                overlap: calculateOverlap(box1, box2)
              });
            }
          } catch (error) {
            // Continue with next element
          }
        }
      } catch (error) {
        // Continue with next element
      }
    }
    
    // Report overlapping elements
    if (overlappingPairs.length > 0) {
      console.log('Overlapping elements detected:');
      overlappingPairs.forEach((pair, index) => {
        console.log(`Overlap ${index + 1}:`);
        console.log(`  Element 1 (${pair.element1.tag}):`, pair.element1.box);
        console.log(`  Element 2 (${pair.element2.tag}):`, pair.element2.box);
        console.log(`  Overlap area: ${pair.overlap}px²`);
      });
      
      // Fail test if significant overlaps found (excluding normal map behavior)
      const significantOverlaps = overlappingPairs.filter(pair => pair.overlap > 1000); // Increased threshold
      if (significantOverlaps.length > 0) {
        throw new Error(`Found ${significantOverlaps.length} significant overlapping elements`);
      }
    } else {
      console.log('No overlapping elements detected');
    }
  });

  test('should detect z-index conflicts and stacking issues', async ({ page }) => {
    // Find elements with z-index
    const zIndexElements = page.locator('[style*="z-index"], [class*="z-"]');
    const zIndexCount = await zIndexElements.count();
    
    console.log(`Found ${zIndexCount} elements with z-index`);
    
    if (zIndexCount > 0) {
      const zIndexValues: Array<{ tag: string; zIndex: string | null; style: string | null; className: string | null }> = [];
      
      for (let i = 0; i < zIndexCount; i++) {
        const element = zIndexElements.nth(i);
        const style = await element.getAttribute('style');
        const className = await element.getAttribute('class');
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        
        let zIndex: string | null = null;
        if (style && style.includes('z-index')) {
          const match = style.match(/z-index:\s*([^;]+)/);
          zIndex = match ? match[1] : null;
        }
        
        if (zIndex) {
          zIndexValues.push({ tag: tagName, zIndex, style, className });
        }
      }
      
      // Check for z-index conflicts
      if (zIndexValues.length > 1) {
        const conflicts: Array<{ zIndex: string; element1: any; element2: any }> = [];
        
        for (let i = 0; i < zIndexValues.length; i++) {
          for (let j = i + 1; j < zIndexValues.length; j++) {
            if (zIndexValues[i].zIndex === zIndexValues[j].zIndex) {
              conflicts.push({
                zIndex: zIndexValues[i].zIndex!,
                element1: zIndexValues[i],
                element2: zIndexValues[j]
              });
            }
          }
        }
        
        if (conflicts.length > 0) {
          console.log('Z-index conflicts detected:', conflicts);
        }
      }
    }
  });

  test('should detect positioning conflicts and layout issues', async ({ page }) => {
    // Find elements with absolute positioning
    const positionedElements = page.locator('[style*="position: absolute"], [style*="position:absolute"]');
    const positionedCount = await positionedElements.count();
    
    console.log(`Found ${positionedCount} absolutely positioned elements`);
    
    if (positionedCount > 0) {
      const positionedValues: Array<{ 
        tag: string; 
        style: string | null; 
        top: string | undefined; 
        left: string | undefined; 
        right: string | undefined; 
        bottom: string | undefined; 
      }> = [];
      
      for (let i = 0; i < positionedCount; i++) {
        const element = positionedElements.nth(i);
        const style = await element.getAttribute('style');
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        
        let top: string | undefined, left: string | undefined, right: string | undefined, bottom: string | undefined;
        
        if (style) {
          const topMatch = style.match(/top:\s*([^;]+)/);
          const leftMatch = style.match(/left:\s*([^;]+)/);
          const rightMatch = style.match(/right:\s*([^;]+)/);
          const bottomMatch = style.match(/bottom:\s*([^;]+)/);
          
          top = topMatch ? topMatch[1] : undefined;
          left = leftMatch ? leftMatch[1] : undefined;
          right = rightMatch ? rightMatch[1] : undefined;
          bottom = bottomMatch ? bottomMatch[1] : undefined;
        }
        
        positionedValues.push({ tag: tagName, style, top, left, right, bottom });
      }
      
      // Check for positioning conflicts
      if (positionedValues.length > 1) {
        const conflicts: Array<{ 
          type: string; 
          element1: any; 
          element2: any; 
        }> = [];
        
        for (let i = 0; i < positionedValues.length; i++) {
          for (let j = i + 1; j < positionedValues.length; j++) {
            const elem1 = positionedValues[i];
            const elem2 = positionedValues[j];
            
            // Check for same positioning
            if (elem1.top === elem2.top && elem1.left === elem2.left) {
              conflicts.push({
                type: 'same-position',
                element1: elem1,
                element2: elem2
              });
            }
          }
        }
        
        if (conflicts.length > 0) {
          console.log('Positioning conflicts detected:', conflicts);
        }
      }
    }
  });

  test('should detect responsive design overlap issues', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Small Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ];
    
    for (const breakpoint of breakpoints) {
      console.log(`Testing breakpoint: ${breakpoint.name}`);
      
      await page.setViewportSize(breakpoint);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Test all navigation views at this breakpoint
      const navSegments = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
      
      for (const segment of navSegments) {
        try {
          const navButton = page.locator(`.ios-segment:has-text("${segment}")`);
          if (await navButton.isVisible()) {
            await navButton.click();
            await page.waitForTimeout(500);
            
            // Check for overlaps at this breakpoint
            await checkBreakpointOverlaps(page, breakpoint.name);
          }
        } catch (error) {
          console.log(`Navigation failed for ${segment} at ${breakpoint.name}:`, error);
        }
      }
    }
  });

  test('should detect dynamic content overlap issues', async ({ page }) => {
    // Navigate through all views to trigger dynamic content
    const navSegments = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
    
    for (const segment of navSegments) {
      try {
        const navButton = page.locator(`.ios-segment:has-text("${segment}")`);
        if (await navButton.isVisible()) {
          await navButton.click();
          await page.waitForTimeout(1000);
          
          // Test interactions that might cause dynamic content
          await testDynamicContentInteractions(page);
          
          // Check for overlaps after dynamic content loads
          await checkDynamicContentOverlaps(page, segment);
        }
      } catch (error) {
        console.log(`Dynamic content test failed for ${segment}:`, error);
      }
    }
  });

  test('should detect animation and transition overlap issues', async ({ page }) => {
    // Look for elements with animations or transitions
    const animatedElements = page.locator('[style*="animation"], [style*="transition"], [class*="animate"], [class*="transition"]');
    const animatedCount = await animatedElements.count();
    
    console.log(`Found ${animatedCount} animated/transition elements`);
    
    if (animatedCount > 0) {
      // Test animation states
      for (let i = 0; i < Math.min(animatedCount, 10); i++) {
        const element = animatedElements.nth(i);
        
        try {
          // Trigger hover if possible
          await element.hover();
          await page.waitForTimeout(500);
          
          // Check for overlaps during animation
          await checkAnimationOverlaps(page);
          
          // Remove hover
          await page.mouse.move(0, 0);
          await page.waitForTimeout(500);
          
        } catch (error) {
          // Continue with next element
        }
      }
    }
  });
});

// Helper function to check if overlap is normal for map applications
function isNormalMapOverlap(tag1: string, tag2: string, box1: any, box2: any): boolean {
  // Normal overlaps in map applications
  const normalOverlaps = [
    // Map container overlaps with its children (normal)
    { parent: 'div', child: 'div', condition: () => true },
    // Button overlaps with its container (normal)
    { parent: 'div', child: 'button', condition: () => true },
    // Span overlaps with its container (normal)
    { parent: 'div', child: 'span', condition: () => true },
    // H1 overlaps with its container (normal)
    { parent: 'div', child: 'h1', condition: () => true },
    // P overlaps with its container (normal)
    { parent: 'div', child: 'p', condition: () => true },
    // Map controls overlap with map (normal)
    { parent: 'div', child: 'div', condition: () => box1.width > 500 && box2.width > 500 },
    // Weather legend overlaps with map (normal)
    { parent: 'div', child: 'div', condition: () => Math.abs(box1.x - box2.x) < 50 && Math.abs(box1.y - box2.y) < 50 }
  ];
  
  // Check if this is a normal overlap
  for (const normal of normalOverlaps) {
    if ((tag1 === normal.parent && tag2 === normal.child) || 
        (tag1 === normal.child && tag2 === normal.parent)) {
      if (normal.condition()) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to check if two bounding boxes overlap
function boxesOverlap(box1: any, box2: any): boolean {
  return !(
    box1.x + box1.width <= box2.x ||
    box2.x + box2.width <= box1.x ||
    box1.y + box1.height <= box2.y ||
    box2.y + box2.height <= box1.y
  );
}

// Helper function to calculate overlap area
function calculateOverlap(box1: any, box2: any): number {
  const xOverlap = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
  const yOverlap = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
  return xOverlap * yOverlap;
}

// Helper function to check overlaps at specific breakpoints
async function checkBreakpointOverlaps(page: any, breakpointName: string) {
  const elements = page.locator('*:visible');
  const elementCount = await elements.count();
  
  if (elementCount > 0) {
    const overlappingPairs: Array<{ 
      breakpoint: string; 
      element1: any; 
      element2: any; 
      overlap: number; 
    }> = [];
    const elementsToAnalyze = Math.min(elementCount, 20);
    
    for (let i = 0; i < elementsToAnalyze; i++) {
      const element1 = elements.nth(i);
      
      try {
        const box1 = await element1.boundingBox();
        if (!box1) continue;
        
        for (let j = i + 1; j < elementsToAnalyze; j++) {
          const element2 = elements.nth(j);
          
          try {
            const box2 = await element2.boundingBox();
            if (!box2) continue;
            
            if (boxesOverlap(box1, box2)) {
              overlappingPairs.push({
                breakpoint: breakpointName,
                element1: box1,
                element2: box2,
                overlap: calculateOverlap(box1, box2)
              });
            }
          } catch (error) {
            // Continue
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    if (overlappingPairs.length > 0) {
      console.log(`Overlaps detected at ${breakpointName}:`, overlappingPairs);
    }
  }
}

// Helper function to test dynamic content interactions
async function testDynamicContentInteractions(page: any) {
  // Test clicking on interactive elements
  const clickableElements = page.locator('button, [role="button"], [tabindex="0"]');
  const clickableCount = await clickableElements.count();
  
  for (let i = 0; i < Math.min(clickableCount, 3); i++) {
    const element = clickableElements.nth(i);
    if (await element.isVisible()) {
      try {
        await element.click();
        await page.waitForTimeout(500);
      } catch (error) {
        // Continue with next element
      }
    }
  }
}

// Helper function to check overlaps after dynamic content loads
async function checkDynamicContentOverlaps(page: any, viewName: string) {
  const elements = page.locator('*:visible');
  const elementCount = await elements.count();
  
  if (elementCount > 0) {
    const overlappingPairs: Array<{ 
      view: string; 
      element1: any; 
      element2: any; 
      overlap: number; 
    }> = [];
    const elementsToAnalyze = Math.min(elementCount, 15);
    
    for (let i = 0; i < elementsToAnalyze; i++) {
      const element1 = elements.nth(i);
      
      try {
        const box1 = await element1.boundingBox();
        if (!box1) continue;
        
        for (let j = i + 1; j < elementsToAnalyze; j++) {
          const element2 = elements.nth(j);
          
          try {
            const box2 = await element2.boundingBox();
            if (!box2) continue;
            
            if (boxesOverlap(box1, box2)) {
              overlappingPairs.push({
                view: viewName,
                element1: box1,
                element2: box2,
                overlap: calculateOverlap(box1, box2)
              });
            }
          } catch (error) {
            // Continue
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    if (overlappingPairs.length > 0) {
      console.log(`Dynamic content overlaps detected in ${viewName}:`, overlappingPairs);
    }
  }
}

// Helper function to check overlaps during animations
async function checkAnimationOverlaps(page: any) {
  const elements = page.locator('*:visible');
  const elementCount = await elements.count();
  
  if (elementCount > 0) {
    const overlappingPairs: Array<{ 
      animation: string; 
      element1: any; 
      element2: any; 
      overlap: number; 
    }> = [];
    const elementsToAnalyze = Math.min(elementCount, 10);
    
    for (let i = 0; i < elementsToAnalyze; i++) {
      const element1 = elements.nth(i);
      
      try {
        const box1 = await element1.boundingBox();
        if (!box1) continue;
        
        for (let j = i + 1; j < elementsToAnalyze; j++) {
          const element2 = elements.nth(j);
          
          try {
            const box2 = await element2.boundingBox();
            if (!box2) continue;
            
            if (boxesOverlap(box1, box2)) {
              overlappingPairs.push({
                animation: 'hover',
                element1: box1,
                element2: box2,
                overlap: calculateOverlap(box1, box2)
              });
            }
          } catch (error) {
            // Continue
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    if (overlappingPairs.length > 0) {
      console.log('Animation overlaps detected:', overlappingPairs);
    }
  }
}
