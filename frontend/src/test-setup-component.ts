import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Configure Testing Library for component tests
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  defaultHidden: true,
});

// Enhanced accessibility testing
const accessibilityChecks = {
  // Check for proper ARIA attributes
  checkAriaAttributes: (element: HTMLElement) => {
    const violations: string[] = [];
    
    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        violations.push(`Image ${index} missing alt text or aria-label`);
      }
    });
    
    // Check for proper form labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const label = element.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      
      if (!label && !ariaLabel && !input.getAttribute('aria-labelledby')) {
        violations.push(`Form control ${index} missing label or aria-label`);
      }
    });
    
    // Check for proper heading hierarchy
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ level: parseInt(h.tagName[1] || '0'), text: h.textContent?.trim() || '' }))
      .sort((a, b) => a.level - b.level);
    
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      if (heading.level > lastLevel + 1) {
        violations.push(`Heading hierarchy skip: ${lastLevel} -> ${heading.level} at "${heading.text}"`);
      }
      lastLevel = heading.level;
    });
    
    return violations;
  },
  
  // Check for semantic HTML usage
  checkSemanticHTML: (element: HTMLElement) => {
    const violations: string[] = [];
    
    // Check for proper button usage
    const clickableElements = element.querySelectorAll('[onclick], [role="button"]');
    clickableElements.forEach((el, index) => {
      if (el.tagName === 'DIV' || el.tagName === 'SPAN') {
        violations.push(`Clickable element ${index} should use <button> instead of ${el.tagName}`);
      }
    });
    
    // Check for proper list usage
    const listItems = element.querySelectorAll('li');
    listItems.forEach((li, index) => {
      const parent = li.parentElement;
      if (parent && !['UL', 'OL'].includes(parent.tagName)) {
        violations.push(`List item ${index} not properly contained in <ul> or <ol>`);
      }
    });
    
    return violations;
  },
  
  // Check for color contrast (basic check)
  checkColorContrast: (element: HTMLElement) => {
    const violations: string[] = [];
    
    // This is a simplified check - in production, use axe-core or similar
    const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    textElements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      // Basic check for white text on white background
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        violations.push(`Text element ${index} has poor contrast: white on white`);
      }
    });
    
    return violations;
  }
};

// Semantic style validation
const styleValidation = {
  // Check for hardcoded design values
  checkDesignTokens: (element: HTMLElement) => {
    const violations: string[] = [];
    
    // Check inline styles for hardcoded values
    const elementsWithInlineStyles = element.querySelectorAll('[style]');
    elementsWithInlineStyles.forEach((el, index) => {
      const style = el.getAttribute('style');
      if (style) {
        // Check for hardcoded colors
        const colorMatches = style.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
        if (colorMatches) {
          colorMatches.forEach(match => {
            if (!match.includes('var(--')) {
              violations.push(`Element ${index} uses hardcoded color: ${match}`);
            }
          });
        }
        
        // Check for hardcoded spacing
        const spacingMatches = style.match(/\d+px|\d+rem|\d+em|\d+%/g);
        if (spacingMatches) {
          spacingMatches.forEach(match => {
            if (!match.includes('var(--')) {
              violations.push(`Element ${index} uses hardcoded spacing: ${match}`);
            }
          });
        }
      }
    });
    
    return violations;
  },
  
  // Check for consistent spacing patterns
  checkSpacingConsistency: (element: HTMLElement) => {
    const violations: string[] = [];
    
    // This would check for consistent use of design tokens
    // Implementation depends on your design system
    
    return violations;
  }
};

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible: () => R;
      toUseDesignTokens: () => R;
      toHaveSemanticHTML: () => R;
    }
  }
}

// Custom matchers
(globalThis as any).expect?.extend?.({
  toBeAccessible(received: HTMLElement) {
    const ariaViolations = accessibilityChecks.checkAriaAttributes(received);
    const semanticViolations = accessibilityChecks.checkSemanticHTML(received);
    const contrastViolations = accessibilityChecks.checkColorContrast(received);
    
    const allViolations = [...ariaViolations, ...semanticViolations, ...contrastViolations];
    
    if (allViolations.length === 0) {
      return {
        message: () => 'Element is accessible',
        pass: true,
      };
    }
    
    return {
      message: () => `Accessibility violations found:\n${allViolations.join('\n')}`,
      pass: false,
    };
  },
  
  toUseDesignTokens(received: HTMLElement) {
    const violations = styleValidation.checkDesignTokens(received);
    
    if (violations.length === 0) {
      return {
        message: () => 'Element uses design tokens properly',
        pass: true,
      };
    }
    
    return {
      message: () => `Design token violations found:\n${violations.join('\n')}`,
      pass: false,
    };
  },
  
  toHaveSemanticHTML(received: HTMLElement) {
    const violations = accessibilityChecks.checkSemanticHTML(received);
    
    if (violations.length === 0) {
      return {
        message: () => 'Element uses semantic HTML properly',
        pass: true,
      };
    }
    
    return {
      message: () => `Semantic HTML violations found:\n${violations.join('\n')}`,
      pass: false,
      };
  },
});

// Setup and teardown
beforeEach(() => {
  // Reset any global state
  vi.clearAllMocks();
  
  // Setup component test environment
  if (typeof window !== 'undefined') {
    // Mock ResizeObserver for component tests
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Mock IntersectionObserver for component tests
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }
});

afterEach(() => {
  // Clean up after each test
  cleanup();
  
  // Reset any global state
  vi.clearAllMocks();
});

// Export utilities for use in tests
export { accessibilityChecks, styleValidation };
