import { describe, test, expect, beforeEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';

describe('Interaction Faults', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  // Basic interaction faults
  test('should handle click event failures', () => {
    useFaultInjection.ui.injectClickFailure();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle drag event failures', () => {
    useFaultInjection.ui.injectDragFailure();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle keyboard event failures', () => {
    useFaultInjection.ui.injectKeyboardFailure();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle form submission failures', () => {
    useFaultInjection.ui.injectFormSubmissionFailure();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle navigation failures', () => {
    useFaultInjection.ui.injectNavigationFailure();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  // Event handling faults
  test('should handle unhandled promise rejections', () => {
    useFaultInjection.ui.injectUnhandledPromise();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle event listener leaks', () => {
    useFaultInjection.ui.injectEventListenerLeak();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle focus trap failures', () => {
    useFaultInjection.ui.injectFocusTrapFail();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  // Data validation faults
  test('should handle data type mismatches', () => {
    useFaultInjection.data.injectTypeMismatch();
    expect(useFaultInjection.data.shouldFail()).toBe(true);
  });

  test('should handle missing required properties', () => {
    useFaultInjection.data.injectMissingRequiredProps();
    expect(useFaultInjection.data.shouldFail()).toBe(true);
  });

  // User input stress testing
  test('should handle rapid click bursts', () => {
    useFaultInjection.ui.injectRapidClickBurst();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle rapid hover bursts', () => {
    useFaultInjection.ui.injectRapidHoverBurst();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });

  test('should handle clicks outside map boundaries', () => {
    useFaultInjection.ui.injectClickOutsideMap();
    expect(useFaultInjection.ui.shouldFail()).toBe(true);
  });
});
