/**
 * E2E Tests for Rate-Limit and Circuit-Breaker Behavior
 * 
 * These tests verify realistic protocol behavior including:
 * - HTTP 429 responses with Retry-After headers
 * - Circuit breaker state transitions
 * - UI countdown displays and retry logic
 */

import { test, expect } from '@playwright/test';

test.describe('Rate-Limit and Circuit-Breaker E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('HTTP 429 Rate-Limit Behavior', () => {
    test('displays rate-limit error with retry countdown', async ({ page }) => {
      // Mock API to return 429 with Retry-After header
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          headers: { 
            'Retry-After': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 3
          },
          body: JSON.stringify({ 
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            retry_after: 3
          })
        });
      });

      // Trigger an API call (e.g., refresh data)
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify rate-limit error is displayed
      await expect(page.getByText(/rate limit|too many requests|429/i)).toBeVisible();
      
      // Verify retry countdown is shown
      await expect(page.getByText(/try again in|retry after|wait/i)).toBeVisible();
      
      // Verify retry button is disabled during countdown
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeDisabled();
      }
    });

    test('respects Retry-After header timing', async ({ page }) => {
      const retryAfterSeconds = 2;
      
      // Mock API to return 429 with short Retry-After
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          headers: { 'Retry-After': retryAfterSeconds.toString() },
          body: JSON.stringify({ 
            error: 'rate_limit_exceeded',
            retry_after: retryAfterSeconds
          })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Wait for rate-limit error
      await expect(page.getByText(/rate limit|too many requests/i)).toBeVisible();

      // Wait for retry countdown to complete
      await page.waitForTimeout((retryAfterSeconds + 0.5) * 1000);

      // Verify retry is now available
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeEnabled();
      }
    });

    test('shows rate-limit remaining information', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          headers: { 
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 60
          },
          body: JSON.stringify({ 
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED'
          })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify rate-limit details are displayed
      await expect(page.getByText(/0.*100|remaining.*limit/i)).toBeVisible();
    });
  });

  test.describe('Circuit Breaker Behavior', () => {
    test('shows circuit breaker open state', async ({ page }) => {
      // Mock API to fail multiple times to trigger circuit breaker
      let failureCount = 0;
      const failureThreshold = 3;
      
      await page.route('**/api/**', route => {
        failureCount++;
        if (failureCount <= failureThreshold) {
          // Fail with 500 errors to trigger circuit breaker
          route.fulfill({
            status: 500,
            body: JSON.stringify({ 
              error: 'internal_server_error',
              error_code: 'INTERNAL_SERVER_ERROR'
            })
          });
        } else {
          // Circuit breaker should be open, return 503
          route.fulfill({
            status: 503,
            body: JSON.stringify({ 
              error: 'service_unavailable',
              error_code: 'CIRCUIT_BREAKER_OPEN'
            })
          });
        }
      });

      // Trigger multiple API calls to reach failure threshold
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        for (let i = 0; i < failureThreshold + 1; i++) {
          await refreshButton.click();
          await page.waitForTimeout(100); // Small delay between calls
        }
      }

      // Verify circuit breaker error is displayed
      await expect(page.getByText(/circuit breaker|service unavailable|503/i)).toBeVisible();
    });

    test('circuit breaker allows probe requests after timeout', async ({ page }) => {
      // Mock API to fail initially, then succeed after timeout
      let callCount = 0;
      const failureThreshold = 3;
      const timeoutMs = 2000;
      
      await page.route('**/api/**', route => {
        callCount++;
        if (callCount <= failureThreshold) {
          // Initial failures
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'internal_server_error' })
          });
        } else if (callCount === failureThreshold + 1) {
          // Wait for timeout, then allow one probe request
          setTimeout(() => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ status: 'success' })
            });
          }, timeoutMs);
        } else {
          // Subsequent calls succeed (circuit breaker closed)
          route.fulfill({
            status: 200,
            body: JSON.stringify({ status: 'success' })
          });
        }
      });

      // Trigger failures to open circuit breaker
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        for (let i = 0; i < failureThreshold; i++) {
          await refreshButton.click();
          await page.waitForTimeout(100);
        }
      }

      // Wait for circuit breaker timeout
      await page.waitForTimeout(timeoutMs + 500);

      // Verify service is available again
      await expect(page.getByText(/success|data loaded/i)).toBeVisible();
    });

    test('displays circuit breaker status information', async ({ page }) => {
      // Mock API to return circuit breaker status
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 503,
          headers: { 
            'X-CircuitBreaker-State': 'OPEN',
            'X-CircuitBreaker-FailureCount': '5',
            'X-CircuitBreaker-Timeout': '30000'
          },
          body: JSON.stringify({ 
            error: 'circuit_breaker_open',
            error_code: 'CIRCUIT_BREAKER_OPEN',
            state: 'OPEN',
            failure_count: 5,
            timeout_ms: 30000
          })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify circuit breaker status is displayed
      await expect(page.getByText(/circuit breaker.*open|state.*open/i)).toBeVisible();
      await expect(page.getByText(/failures.*5|failure count.*5/i)).toBeVisible();
    });
  });

  test.describe('Error Code Consistency', () => {
    test('rate-limit errors have consistent error codes', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          body: JSON.stringify({ 
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            trace_id: 'test-trace-123'
          })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify error code is displayed consistently
      await expect(page.getByText(/API_RATE_LIMIT_EXCEEDED|rate limit exceeded/i)).toBeVisible();
      
      // Verify trace ID is displayed (if implemented)
      await expect(page.getByText(/test-trace-123|trace.*123/i)).toBeVisible();
    });

    test('circuit-breaker errors have consistent error codes', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 503,
          body: JSON.stringify({ 
            error: 'circuit_breaker_open',
            error_code: 'CIRCUIT_BREAKER_OPEN',
            trace_id: 'test-trace-456'
          })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify error code is displayed consistently
      await expect(page.getByText(/CIRCUIT_BREAKER_OPEN|circuit breaker open/i)).toBeVisible();
      
      // Verify trace ID is displayed (if implemented)
      await expect(page.getByText(/test-trace-456|trace.*456/i)).toBeVisible();
    });
  });

  test.describe('UI State Management', () => {
    test('loading states are properly managed during errors', async ({ page }) => {
      // Mock API to delay then fail
      await page.route('**/api/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 429,
            body: JSON.stringify({ error: 'rate_limit_exceeded' })
          });
        }, 1000);
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        
        // Verify loading state is shown
        await expect(page.getByText(/loading|refreshing/i)).toBeVisible();
        
        // Wait for error
        await expect(page.getByText(/rate limit|too many requests/i)).toBeVisible();
        
        // Verify loading state is cleared
        await expect(page.getByText(/loading|refreshing/i)).not.toBeVisible();
      }
    });

    test('error states can be dismissed and retried', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          body: JSON.stringify({ error: 'rate_limit_exceeded' })
        });
      });

      // Trigger API call
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      // Verify error is displayed
      await expect(page.getByText(/rate limit|too many requests/i)).toBeVisible();

      // Try to dismiss error (if dismiss button exists)
      const dismissButton = page.getByRole('button', { name: /dismiss|close|×/i });
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
        await expect(page.getByText(/rate limit|too many requests/i)).not.toBeVisible();
      }

      // Try to retry (if retry button exists)
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await retryButton.click();
        // Should show error again
        await expect(page.getByText(/rate limit|too many requests/i)).toBeVisible();
      }
    });
  });
});
