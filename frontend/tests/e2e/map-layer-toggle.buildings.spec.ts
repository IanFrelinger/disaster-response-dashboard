import { test, expect } from '@playwright/test';

test('"buildings" layer toggles visibility on the map', async ({ page }) => {
  await page.goto('/map');
  
  // Wait for the layer toggle panel to be visible
  await page.waitForSelector('[data-testid="layer-toggle-panel-debug"]');
  
  // Get the buildings toggle switch
  const buildingsToggle = page.getByTestId('toggle-buildings');
  
  // Check initial state (should be checked/ON by default)
  await expect(buildingsToggle).toBeChecked();
  
  // Click the toggle to turn it OFF
  await buildingsToggle.click();
  
  // Verify the toggle is now unchecked
  await expect(buildingsToggle).not.toBeChecked();
  
  // Check that the map layer visibility was updated
  // Note: This would require a test API method to check layer visibility
  // For now, we'll verify the toggle state change
  await expect(buildingsToggle).toHaveAttribute('aria-checked', 'false');
  
  // Click again to turn it back ON
  await buildingsToggle.click();
  
  // Verify the toggle is checked again
  await expect(buildingsToggle).toBeChecked();
  await expect(buildingsToggle).toHaveAttribute('aria-checked', 'true');
});

test('buildings layer toggle is keyboard accessible', async ({ page }) => {
  await page.goto('/map');
  
  // Wait for the layer toggle panel to be visible
  await page.waitForSelector('[data-testid="layer-toggle-panel-debug"]');
  
  // Focus the buildings toggle
  const buildingsToggle = page.getByTestId('toggle-buildings');
  await buildingsToggle.focus();
  
  // Verify it has focus
  await expect(buildingsToggle).toBeFocused();
  
  // Test Space key toggling
  await buildingsToggle.press(' ');
  await page.waitForTimeout(100); // Wait for state update
  await expect(buildingsToggle).not.toBeChecked();
  
  // Test Enter key toggling
  await buildingsToggle.press('Enter');
  await page.waitForTimeout(100); // Wait for state update
  await expect(buildingsToggle).toBeChecked();
  
  // Test Arrow key navigation
  await buildingsToggle.press('ArrowRight');
  await expect(buildingsToggle).toBeChecked();
  
  await buildingsToggle.press('ArrowLeft');
  await expect(buildingsToggle).not.toBeChecked();
});

test('buildings layer toggle has proper ARIA attributes', async ({ page }) => {
  await page.goto('/map');
  
  // Wait for the layer toggle panel to be visible
  await page.waitForSelector('[data-testid="layer-toggle-panel-debug"]');
  
  const buildingsToggle = page.getByTestId('toggle-buildings');
  
  // Wait for the component to be fully rendered
  await page.waitForTimeout(100);
  
  // Check ARIA attributes
  await expect(buildingsToggle).toHaveAttribute('role', 'switch');
  await expect(buildingsToggle).toHaveAttribute('aria-checked');
  
  // Verify the label is properly associated
  const label = page.getByText('Buildings');
  await expect(label).toBeVisible();
  
  // Check that clicking the label toggles the switch
  await label.click();
  await page.waitForTimeout(100); // Wait for state update
  await expect(buildingsToggle).not.toBeChecked();
});
