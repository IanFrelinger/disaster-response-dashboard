import { test, expect } from '@playwright/test';

test.describe('AIP Commander Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('#root', { timeout: 10000 });
  });

  test('should display AIP Commander navigation button', async ({ page }) => {
    // Check if the AIP Commander button is visible in main navigation (header)
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await expect(aipButton).toBeVisible();
    
    console.log('✅ AIP Commander navigation button is visible');
  });

  test('should navigate to AIP Commander view', async ({ page }) => {
    // Click the AIP Commander button in header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Check if we're in the AIP view
    const aipTitle = page.locator('h1:has-text("🤖 AIP-Powered Decision Support")');
    await expect(aipTitle).toBeVisible();
    
    console.log('✅ Successfully navigated to AIP Commander view');
  });

  test('should display AIP Commander component elements', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Check for AIP component elements
    const aipHeader = page.locator('.aip-header');
    await expect(aipHeader).toBeVisible();
    
    const aipTitle = page.locator('.aip-title:has-text("Disaster Commander")');
    await expect(aipTitle).toBeVisible();
    
    const aipSubtitle = page.locator('.aip-subtitle:has-text("AI-Powered Decision Support System")');
    await expect(aipSubtitle).toBeVisible();
    
    console.log('✅ AIP Commander component header is visible');
  });

  test('should display AIP chat interface', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Check for chat interface elements
    const chatContainer = page.locator('.aip-chat-container');
    await expect(chatContainer).toBeVisible();
    
    const inputForm = page.locator('.aip-input-form');
    await expect(inputForm).toBeVisible();
    
    const inputField = page.locator('.aip-input');
    await expect(inputField).toBeVisible();
    
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await expect(submitButton).toBeVisible();
    
    console.log('✅ AIP chat interface is visible');
  });

  test('should display example queries', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Check for example query buttons
    const highwayButton = page.locator('.example-btn:has-text("Highway 30 closure")');
    await expect(highwayButton).toBeVisible();
    
    const pineValleyButton = page.locator('.example-btn:has-text("Pine Valley evacuation")');
    await expect(pineValleyButton).toBeVisible();
    
    const oakRidgeButton = page.locator('.example-btn:has-text("Oak Ridge status")');
    await expect(oakRidgeButton).toBeVisible();
    
    console.log('✅ Example query buttons are visible');
  });

  test('should handle example query input', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Click an example query button
    const highwayButton = page.locator('.example-btn:has-text("Highway 30 closure")');
    await highwayButton.click();
    
    // Check if the query was populated in the input field
    const inputField = page.locator('.aip-input');
    await expect(inputField).toHaveValue('What happens if we lose Highway 30?');
    
    console.log('✅ Example query input is working');
  });

  test('should process AIP query', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Type a query
    const inputField = page.locator('.aip-input');
    await inputField.fill('Should we evacuate Pine Valley?');
    
    // Submit the query
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await submitButton.click();
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Check if response appears
    const aiResponse = page.locator('.ai-response');
    await expect(aiResponse).toBeVisible();
    
    console.log('✅ AIP query processing is working');
  });

  test('should display AIP response with confidence and reasoning', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Submit a query
    const inputField = page.locator('.aip-input');
    await inputField.fill('What happens if we lose Highway 30?');
    
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for response elements
    const recommendation = page.locator('.recommendation');
    await expect(recommendation).toBeVisible();
    
    const confidenceIndicator = page.locator('.confidence-indicator');
    await expect(confidenceIndicator).toBeVisible();
    
    const dataSources = page.locator('.data-sources');
    await expect(dataSources).toBeVisible();
    
    const reasoning = page.locator('.reasoning');
    await expect(reasoning).toBeVisible();
    
    console.log('✅ AIP response with confidence and reasoning is displayed');
  });

  test('should show alternative scenarios', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Submit a query
    const inputField = page.locator('.aip-input');
    await inputField.fill('What happens if we lose Highway 30?');
    
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Click to show alternative scenarios
    const showAlternativesBtn = page.locator('.show-alternatives-btn:has-text("Show Alternative Scenarios")');
    await showAlternativesBtn.click();
    
    // Check if alternative scenarios are displayed
    const alternativeScenarios = page.locator('.alternative-scenarios');
    await expect(alternativeScenarios).toBeVisible();
    
    console.log('✅ Alternative scenarios are displayed');
  });

  test('should maintain chat history', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Submit first query
    const inputField = page.locator('.aip-input');
    await inputField.fill('Should we evacuate Pine Valley?');
    
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Submit second query
    await inputField.fill('What about Oak Ridge?');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Check if both queries are in chat history
    const chatMessages = page.locator('.chat-message');
    await expect(chatMessages).toHaveCount(2);
    
    console.log('✅ Chat history is maintained');
  });

  test('should display current decision summary', async ({ page }) => {
    // Navigate to AIP view using header navigation
    const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
    await aipButton.click();
    await page.waitForTimeout(1000);
    
    // Submit a query
    const inputField = page.locator('.aip-input');
    await inputField.fill('What happens if we lose Highway 30?');
    
    const submitButton = page.locator('.aip-submit-btn:has-text("Ask Commander")');
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check if current decision is displayed
    const currentDecision = page.locator('.current-decision');
    await expect(currentDecision).toBeVisible();
    
    const decisionCard = page.locator('.decision-card');
    await expect(decisionCard).toBeVisible();
    
    console.log('✅ Current decision summary is displayed');
  });
});
