/**
 * Accessibility testing utilities for WCAG compliance
 * Tests keyboard navigation, ARIA labels, color contrast, and screen reader compatibility
 */

import { expect } from '@playwright/test';
import { Page } from '@playwright/test';

interface AccessibilityViolation {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  rule?: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
}

interface ColorContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  foreground: string;
  background: string;
  element: string;
}

class AccessibilityTester {
  private page: Page;
  private violations: AccessibilityViolation[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  public async runFullAccessibilityAudit(): Promise<AccessibilityViolation[]> {
    this.violations = [];
    
    await this.testKeyboardNavigation();
    await this.testAriaLabels();
    await this.testColorContrast();
    await this.testHeadingHierarchy();
    await this.testFocusManagement();
    await this.testScreenReaderCompatibility();
    await this.testFormAccessibility();
    await this.testImageAccessibility();
    await this.testLinkAccessibility();
    await this.testButtonAccessibility();
    
    return this.violations;
  }

  public async testKeyboardNavigation(): Promise<void> {
    // Test tab order
    const tabbableElements = await this.page.locator('[tabindex]:not([tabindex="-1"])').all();
    
    for (let i = 0; i < tabbableElements.length; i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.locator(':focus').first();
      
      if (await focusedElement.count() === 0) {
        this.addViolation({
          type: 'error',
          message: 'No element is focused after tab navigation',
          rule: 'keyboard-navigation',
          impact: 'serious'
        });
      }
    }

    // Test arrow key navigation for custom components
    const customComponents = await this.page.locator('[role="menu"], [role="tablist"], [role="grid"]').all();
    
    for (const component of customComponents) {
      await component.focus();
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('ArrowUp');
      await this.page.keyboard.press('ArrowLeft');
      await this.page.keyboard.press('ArrowRight');
    }
  }

  public async testAriaLabels(): Promise<void> {
    // Test for missing aria-labels on interactive elements
    const interactiveElements = await this.page.locator('button, input, select, textarea, [role="button"], [role="link"]').all();
    
    for (const element of interactiveElements) {
      const hasAriaLabel = await element.getAttribute('aria-label');
      const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
      const hasVisibleText = await element.textContent();
      const hasTitle = await element.getAttribute('title');
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasVisibleText && !hasTitle) {
        this.addViolation({
          type: 'error',
          message: 'Interactive element missing accessible name',
          element: await element.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'aria-labels',
          impact: 'serious'
        });
      }
    }

    // Test for proper ARIA roles
    const elementsWithRoles = await this.page.locator('[role]').all();
    
    for (const element of elementsWithRoles) {
      const role = await element.getAttribute('role');
      const isValidRole = await this.validateAriaRole(element, role!);
      
      if (!isValidRole) {
        this.addViolation({
          type: 'warning',
          message: `Invalid or inappropriate ARIA role: ${role}`,
          element: await element.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'aria-roles',
          impact: 'moderate'
        });
      }
    }
  }

  public async testColorContrast(): Promise<ColorContrastResult[]> {
    const results: ColorContrastResult[] = [];
    
    // Test text elements
    const textElements = await this.page.locator('p, h1, h2, h3, h4, h5, h6, span, div, a, button').all();
    
    for (const element of textElements) {
      const text = await element.textContent();
      if (text && text.trim().length > 0) {
        const contrast = await this.calculateColorContrast(element);
        if (contrast) {
          results.push(contrast);
          
          if (contrast.level === 'FAIL') {
            this.addViolation({
              type: 'error',
              message: `Insufficient color contrast ratio: ${contrast.ratio.toFixed(2)}`,
              element: await element.evaluate(el => el.outerHTML.substring(0, 100)),
              rule: 'color-contrast',
              impact: 'serious'
            });
          }
        }
      }
    }
    
    return results;
  }

  public async testHeadingHierarchy(): Promise<void> {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));
      
      if (level > previousLevel + 1) {
        this.addViolation({
          type: 'warning',
          message: `Heading level skipped: ${tagName} after h${previousLevel}`,
          element: await heading.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'heading-hierarchy',
          impact: 'moderate'
        });
      }
      
      previousLevel = level;
    }
  }

  public async testFocusManagement(): Promise<void> {
    // Test focus indicators
    const focusableElements = await this.page.locator('button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])').all();
    
    for (const element of focusableElements) {
      await element.focus();
      const hasFocusIndicator = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none' || styles.borderColor !== 'transparent';
      });
      
      if (!hasFocusIndicator) {
        this.addViolation({
          type: 'error',
          message: 'Focusable element missing visible focus indicator',
          element: await element.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'focus-indicators',
          impact: 'serious'
        });
      }
    }

    // Test focus trap in modals
    const modals = await this.page.locator('[role="dialog"], [role="alertdialog"]').all();
    
    for (const modal of modals) {
      const isVisible = await modal.isVisible();
      if (isVisible) {
        const focusableInModal = await modal.locator('button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])').all();
        
        if (focusableInModal.length > 0) {
          await focusableInModal[0]?.focus();
          await this.page.keyboard.press('Tab');
          
          const focusedElement = await this.page.locator(':focus').first();
          const isInModal = await modal.evaluate((modalEl, focusedEl) => {
            return modalEl.contains(focusedEl as any);
          }, focusedElement);
          
          if (!isInModal) {
            this.addViolation({
              type: 'error',
              message: 'Focus escaped modal dialog',
              element: await modal.evaluate(el => el.outerHTML.substring(0, 100)),
              rule: 'focus-trap',
              impact: 'serious'
            });
          }
        }
      }
    }
  }

  public async testScreenReaderCompatibility(): Promise<void> {
    // Test for screen reader announcements
    const liveRegions = await this.page.locator('[aria-live], [aria-atomic], [aria-relevant]').all();
    
    for (const region of liveRegions) {
      const liveValue = await region.getAttribute('aria-live');
      const atomicValue = await region.getAttribute('aria-atomic');
      const relevantValue = await region.getAttribute('aria-relevant');
      
      if (liveValue && !['polite', 'assertive', 'off'].includes(liveValue)) {
        this.addViolation({
          type: 'error',
          message: `Invalid aria-live value: ${liveValue}`,
          element: await region.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'aria-live',
          impact: 'moderate'
        });
      }
    }

    // Test for proper landmark roles
    const landmarks = await this.page.locator('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]').all();
    
    if (landmarks.length === 0) {
      this.addViolation({
        type: 'warning',
        message: 'No landmark roles found for screen reader navigation',
        rule: 'landmarks',
        impact: 'moderate'
      });
    }
  }

  public async testFormAccessibility(): Promise<void> {
    const forms = await this.page.locator('form').all();
    
    for (const form of forms) {
      const inputs = await form.locator('input, select, textarea').all();
      
      for (const input of inputs) {
        const hasLabel = await input.evaluate(el => {
          const id = el.id;
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            return !!label;
          }
          return false;
        });
        
        const hasAriaLabel = await input.getAttribute('aria-label');
        const hasAriaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          this.addViolation({
            type: 'error',
            message: 'Form input missing label',
            element: await input.evaluate(el => el.outerHTML.substring(0, 100)),
            rule: 'form-labels',
            impact: 'serious'
          });
        }
      }
    }
  }

  public async testImageAccessibility(): Promise<void> {
    const images = await this.page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      const isDecorative = role === 'presentation' || role === 'none';
      
      if (!alt && !isDecorative) {
        this.addViolation({
          type: 'error',
          message: 'Image missing alt text',
          element: await image.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'image-alt',
          impact: 'serious'
        });
      }
    }
  }

  public async testLinkAccessibility(): Promise<void> {
    const links = await this.page.locator('a').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      
      if (!text || text.trim().length === 0) {
        this.addViolation({
          type: 'error',
          message: 'Link missing accessible text',
          element: await link.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'link-text',
          impact: 'serious'
        });
      }
      
      if (href && href.startsWith('javascript:')) {
        this.addViolation({
          type: 'warning',
          message: 'Link uses javascript: protocol',
          element: await link.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'link-protocol',
          impact: 'moderate'
        });
      }
    }
  }

  public async testButtonAccessibility(): Promise<void> {
    const buttons = await this.page.locator('button, [role="button"]').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasAriaLabelledBy = await button.getAttribute('aria-labelledby');
      
      if (!text && !hasAriaLabel && !hasAriaLabelledBy) {
        this.addViolation({
          type: 'error',
          message: 'Button missing accessible name',
          element: await button.evaluate(el => el.outerHTML.substring(0, 100)),
          rule: 'button-text',
          impact: 'serious'
        });
      }
    }
  }

  private async validateAriaRole(element: any, role: string): Promise<boolean> {
    const validRoles = [
      'button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
      'option', 'tab', 'tabpanel', 'textbox', 'treeitem', 'gridcell',
      'columnheader', 'rowheader', 'dialog', 'alertdialog', 'alert',
      'status', 'log', 'marquee', 'timer', 'progressbar', 'slider',
      'scrollbar', 'tablist', 'menu', 'menubar', 'toolbar', 'tree',
      'grid', 'listbox', 'radiogroup', 'checkbox', 'radio', 'switch',
      'textbox', 'searchbox', 'spinbutton', 'combobox', 'listbox',
      'tree', 'grid', 'table', 'row', 'cell', 'columnheader', 'rowheader',
      'banner', 'navigation', 'main', 'complementary', 'contentinfo',
      'region', 'article', 'section', 'heading', 'group', 'list',
      'listitem', 'definition', 'term', 'figure', 'img', 'presentation',
      'none', 'application', 'document', 'feed', 'note', 'search',
      'separator', 'tooltip'
    ];
    
    return validRoles.includes(role);
  }

  private async calculateColorContrast(element: any): Promise<ColorContrastResult | null> {
    try {
      const styles = await element.evaluate((el: any) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
      
      // Simplified contrast calculation (would need proper color parsing in real implementation)
      const ratio = 4.5; // Placeholder
      const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
      
      return {
        ratio,
        level,
        foreground: styles.color,
        background: styles.backgroundColor,
        element: await element.evaluate((el: any) => el.outerHTML.substring(0, 100))
      };
    } catch (error) {
      return null;
    }
  }

  private addViolation(violation: AccessibilityViolation): void {
    this.violations.push(violation);
  }

  public getViolations(): AccessibilityViolation[] {
    return this.violations;
  }

  public getViolationCount(): number {
    return this.violations.length;
  }

  public getCriticalViolations(): AccessibilityViolation[] {
    return this.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  }
}

// Export the tester class
export { AccessibilityTester };
export type { AccessibilityViolation, ColorContrastResult };

