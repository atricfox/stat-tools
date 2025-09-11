import { test, expect } from '@playwright/test';

test.describe('Median Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator/median');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page).toHaveTitle(/Median Calculator/);
    await expect(page.locator('h1')).toContainText('Median Calculator');
    await expect(page.locator('p')).toContainText('middle value');
  });

  test('should calculate median for odd number of values', async ({ page }) => {
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5');
    
    // Wait for calculation
    await expect(page.locator('[data-testid="median-result"]')).toContainText('3');
    await expect(page.locator('[data-testid="count-result"]')).toContainText('5');
  });

  test('should calculate median for even number of values', async ({ page }) => {
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5, 6');
    
    // Wait for calculation
    await expect(page.locator('[data-testid="median-result"]')).toContainText('3.5');
    await expect(page.locator('[data-testid="count-result"]')).toContainText('6');
  });

  test('should switch between user modes', async ({ page }) => {
    // Test student mode
    await page.click('[data-testid="user-mode-student"]');
    await expect(page.locator('[data-testid="user-mode-student"]')).toHaveClass(/selected/);
    
    // Test research mode
    await page.click('[data-testid="user-mode-research"]');
    await expect(page.locator('[data-testid="user-mode-research"]')).toHaveClass(/selected/);
    
    // Test teacher mode
    await page.click('[data-testid="user-mode-teacher"]');
    await expect(page.locator('[data-testid="user-mode-teacher"]')).toHaveClass(/selected/);
  });

  test('should show quartiles in research mode', async ({ page }) => {
    // Switch to research mode
    await page.click('[data-testid="user-mode-research"]');
    
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5, 6, 7, 8, 9');
    
    // Check for quartile results
    await expect(page.locator('[data-testid="q1-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="q3-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="iqr-result"]')).toBeVisible();
  });

  test('should detect outliers in research mode', async ({ page }) => {
    // Switch to research mode
    await page.click('[data-testid="user-mode-research"]');
    
    // Input data with outlier
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5, 100');
    
    // Check for outlier detection
    await expect(page.locator('[data-testid="outliers-result"]')).toContainText('100');
  });

  test('should show grade distribution in teacher mode', async ({ page }) => {
    // Switch to teacher mode
    await page.click('[data-testid="user-mode-teacher"]');
    
    // Input grade data
    await page.fill('[data-testid="data-input"]', '95, 88, 92, 85, 78, 91, 87, 94');
    
    // Check for grade distribution
    await expect(page.locator('[data-testid="grade-distribution"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-performance"]')).toBeVisible();
  });

  test('should show calculation steps', async ({ page }) => {
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5');
    
    // Click to show steps
    await page.click('[data-testid="show-steps-button"]');
    
    // Check for steps
    await expect(page.locator('[data-testid="calculation-steps"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculation-steps"]')).toContainText('Step 1');
    await expect(page.locator('[data-testid="calculation-steps"]')).toContainText('Sorted data');
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    // Input invalid data
    await page.fill('[data-testid="data-input"]', 'abc, def, ghi');
    
    // Check for error message or empty results
    await expect(page.locator('[data-testid="invalid-entries"]')).toContainText('abc');
  });

  test('should copy results to clipboard', async ({ page }) => {
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5');
    
    // Click copy button
    await page.click('[data-testid="copy-results-button"]');
    
    // Note: Clipboard testing requires special permissions in Playwright
    // This is a basic test to ensure the button is clickable
    await expect(page.locator('[data-testid="copy-results-button"]')).toBeVisible();
  });

  test('should adjust precision', async ({ page }) => {
    // Input data
    await page.fill('[data-testid="data-input"]', '1, 2, 3, 4, 5, 6');
    
    // Change precision to 4 decimal places
    await page.fill('[data-testid="precision-control"]', '4');
    
    // Check that result shows more decimal places
    await expect(page.locator('[data-testid="median-result"]')).toContainText('3.5000');
  });
});
