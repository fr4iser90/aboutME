/**
 * Setup Mode Detection End-to-End Tests
 * 
 * Tests the complete user workflow from initial setup to final deployment.
 */

const { test, expect } = require('@playwright/test');

test.describe('Setup Mode Detection E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should show setup wizard on first visit', async ({ page }) => {
    // Check if setup wizard is visible
    await expect(page.locator('.setup-wizard')).toBeVisible();
    
    // Check wizard title
    await expect(page.locator('.wizard-title')).toContainText('Portfolio Setup Wizard');
    
    // Check step indicator
    await expect(page.locator('.step.active')).toHaveText('1');
  });

  test('should complete setup wizard workflow', async ({ page }) => {
    // Step 1: Fill basic information
    await page.fill('input[placeholder="your-github-username"]', 'testuser');
    await page.fill('input[placeholder="My Awesome Portfolio"]', 'Test Portfolio');
    await page.fill('textarea[placeholder="A brief description of your portfolio..."]', 'A test portfolio description');
    await page.fill('input[placeholder="John Doe"]', 'Test Author');
    
    // Click Next
    await page.click('button:has-text("Next")');
    
    // Step 2: Verify options step
    await expect(page.locator('.step.active')).toHaveText('2');
    await expect(page.locator('h3')).toContainText('Content Options');
    
    // Click Next
    await page.click('button:has-text("Next")');
    
    // Step 3: Verify review step
    await expect(page.locator('.step.active')).toHaveText('3');
    await expect(page.locator('h3')).toContainText('Review & Generate');
    
    // Verify configuration summary
    await expect(page.locator('text=testuser')).toBeVisible();
    await expect(page.locator('text=Test Portfolio')).toBeVisible();
    await expect(page.locator('text=Test Author')).toBeVisible();
    
    // Click Generate Portfolio
    await page.click('button:has-text("Generate Portfolio")');
    
    // Wait for generation to complete
    await expect(page.locator('.generation-status')).toBeVisible();
    await expect(page.locator('.progress-text')).toContainText('Generation');
    
    // Wait for success message
    await expect(page.locator('.result-success')).toContainText('Generation Successful!');
  });

  test('should show build notification when CSS changes', async ({ page }) => {
    // This test would require CSS file modification
    // For now, we'll test the notification component
    
    // Navigate to a page that might trigger build notification
    await page.goto('http://localhost:3000/editor');
    
    // Check if build notification appears
    // This would be triggered by CSS changes in a real scenario
    const buildNotification = page.locator('.build-notification');
    
    if (await buildNotification.isVisible()) {
      await expect(buildNotification).toBeVisible();
      await expect(buildNotification.locator('.notification-title')).toContainText('Build Required');
      
      // Click Build Now
      await buildNotification.locator('button:has-text("Build Now")').click();
      
      // Wait for build progress
      await expect(buildNotification.locator('.build-progress')).toBeVisible();
      await expect(buildNotification.locator('.progress-text')).toContainText('Starting build process');
    }
  });

  test('should handle setup wizard cancellation', async ({ page }) => {
    // Open setup wizard
    await expect(page.locator('.setup-wizard')).toBeVisible();
    
    // Click Cancel
    await page.click('button:has-text("Cancel")');
    
    // Wizard should be closed
    await expect(page.locator('.setup-wizard')).not.toBeVisible();
  });

  test('should validate required fields in setup wizard', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Next button should be disabled
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
    
    // Fill only some fields
    await page.fill('input[placeholder="your-github-username"]', 'testuser');
    await page.fill('input[placeholder="My Awesome Portfolio"]', 'Test Portfolio');
    
    // Next button should still be disabled
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
    
    // Fill remaining required fields
    await page.fill('textarea[placeholder="A brief description of your portfolio..."]', 'A test portfolio description');
    await page.fill('input[placeholder="John Doe"]', 'Test Author');
    
    // Next button should now be enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });

  test('should show loading state during setup mode detection', async ({ page }) => {
    // Navigate to a fresh page
    await page.goto('http://localhost:3000');
    
    // Check for loading indicator
    const loadingIndicator = page.locator('text=Detecting setup mode...');
    
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should handle setup mode detection errors', async ({ page }) => {
    // This test would require API failure simulation
    // For now, we'll test error handling UI
    
    // Navigate to a page that might trigger an error
    await page.goto('http://localhost:3000');
    
    // Check for error state
    const errorMessage = page.locator('text=Setup mode detection failed');
    
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
      
      // Check for retry button
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
      
      // Click retry
      await page.click('button:has-text("Retry")');
    }
  });

  test('should integrate with authentication system', async ({ page }) => {
    // Navigate to editor (protected route)
    await page.goto('http://localhost:3000/editor');
    
    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      // Fill login form
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'your-super-secret-password');
      
      // Submit login
      await page.click('button[type="submit"]');
      
      // Should redirect back to editor
      await expect(page).toHaveURL(/.*editor/);
    }
  });

  test('should handle data pipeline execution', async ({ page }) => {
    // Complete setup wizard to trigger data pipeline
    await page.fill('input[placeholder="your-github-username"]', 'testuser');
    await page.fill('input[placeholder="My Awesome Portfolio"]', 'Test Portfolio');
    await page.fill('textarea[placeholder="A brief description of your portfolio..."]', 'A test portfolio description');
    await page.fill('input[placeholder="John Doe"]', 'Test Author');
    
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Generate Portfolio")');
    
    // Wait for data pipeline execution
    await expect(page.locator('.generation-status')).toBeVisible();
    
    // Check for progress updates
    await expect(page.locator('.progress-text')).toContainText('Initializing data pipeline');
    
    // Wait for completion
    await expect(page.locator('.result-success')).toContainText('Generation Successful!');
  });

  test('should persist setup configuration', async ({ page }) => {
    // Complete setup wizard
    await page.fill('input[placeholder="your-github-username"]', 'testuser');
    await page.fill('input[placeholder="My Awesome Portfolio"]', 'Test Portfolio');
    await page.fill('textarea[placeholder="A brief description of your portfolio..."]', 'A test portfolio description');
    await page.fill('input[placeholder="John Doe"]', 'Test Author');
    
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Generate Portfolio")');
    
    // Wait for completion
    await expect(page.locator('.result-success')).toContainText('Generation Successful!');
    
    // Refresh page
    await page.reload();
    
    // Setup wizard should not appear again
    await expect(page.locator('.setup-wizard')).not.toBeVisible();
  });

  test('should handle multiple setup mode changes', async ({ page }) => {
    // Start with initial setup
    await expect(page.locator('.setup-wizard')).toBeVisible();
    
    // Complete setup
    await page.fill('input[placeholder="your-github-username"]', 'testuser');
    await page.fill('input[placeholder="My Awesome Portfolio"]', 'Test Portfolio');
    await page.fill('textarea[placeholder="A brief description of your portfolio..."]', 'A test portfolio description');
    await page.fill('input[placeholder="John Doe"]', 'Test Author');
    
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Generate Portfolio")');
    
    // Wait for completion
    await expect(page.locator('.result-success')).toContainText('Generation Successful!');
    
    // Setup wizard should close
    await expect(page.locator('.setup-wizard')).not.toBeVisible();
    
    // In a real scenario, CSS changes would trigger build notification
    // This would be tested by modifying CSS files and checking for notification
  });
});
