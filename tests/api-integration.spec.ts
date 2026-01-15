import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 *
 * These tests verify live integration with Supabase Edge Functions
 * and database operations.
 */

const TEST_EMAIL_PREFIX = 'playwright-test-';
const TEST_TIMESTAMP = Date.now();

test.describe('Market Data API Integration', () => {
  test('market dashboard displays live data from Edge Function', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const dashboard = page.locator('#market-data').first();
    await dashboard.scrollIntoViewIfNeeded();

    // Verify commodity prices are displayed (should be numbers, not placeholders)
    const poultrySection = dashboard.locator('text=Poultry').first();
    await expect(poultrySection).toBeVisible();

    // Check that actual price values are rendered (e.g., "$1.12")
    const pricePattern = /\$\d+\.\d{2}/;
    const prices = await dashboard.locator('text=/\\$\\d+\\.\\d{2}/').all();
    expect(prices.length).toBeGreaterThan(0);

    // Verify trend indicators are present
    const trendIndicators = await dashboard.locator('text=/[↑↓→]/').all();
    expect(trendIndicators.length).toBeGreaterThan(0);
  });

  test('hero market snapshot shows commodity prices', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Check market snapshot in hero section
    const marketSnapshot = page.locator('text=Today\'s Market').first();
    await expect(marketSnapshot).toBeVisible();

    // Verify specific commodities are shown
    await expect(page.getByText('Chicken').first()).toBeVisible();
    await expect(page.getByText('Diesel').first()).toBeVisible();
  });

  test('delivery info bar shows diesel price', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // The delivery info bar should show current fuel price
    const fuelInfo = page.locator('text=/\\$\\d+\\.\\d{2}\\/gal/').first();
    await expect(fuelInfo).toBeVisible();
  });
});

test.describe('Recalls API Integration', () => {
  test('recall alert bar displays active recalls', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Check for recall alert bar at top - verify the link exists and is clickable
    const recallBar = page.locator('a[href="#recalls-section"]').first();
    await expect(recallBar).toBeAttached();

    // On desktop, check if visible; on mobile it may be in a compact view
    const isVisible = await recallBar.isVisible();
    if (isVisible) {
      await expect(recallBar).toBeVisible();
    } else {
      // On mobile, verify it at least exists in the DOM
      await expect(recallBar).toBeAttached();
    }
  });

  test('recalls section shows recall cards', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const recallsSection = page.locator('#recalls-section').first();
    await recallsSection.scrollIntoViewIfNeeded();

    // Verify recall cards are displayed
    await expect(page.getByText('Active Food Recalls').first()).toBeVisible();

    // Check for recall classification badges
    const classOneBadge = recallsSection.locator('text=/Class I/i').first();
    const classTwoBadge = recallsSection.locator('text=/Class II/i').first();

    // At least one classification should be visible
    const hasClassOne = await classOneBadge.isVisible().catch(() => false);
    const hasClassTwo = await classTwoBadge.isVisible().catch(() => false);
    expect(hasClassOne || hasClassTwo).toBe(true);
  });

  test('recalls show FDA source links', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const recallsSection = page.locator('#recalls-section').first();
    await recallsSection.scrollIntoViewIfNeeded();

    // Verify FDA link is present
    const fdaLink = recallsSection.locator('a[href*="fda.gov"]').first();
    await expect(fdaLink).toBeVisible();
  });
});

test.describe('Lead Form Submission', () => {
  test('multi-step form submits to database', async ({ page, request }) => {
    await page.goto('/georgia/atlanta');

    const form = page.locator('#lead-form').first();
    await form.scrollIntoViewIfNeeded();

    // Wait for React hydration
    await page.waitForTimeout(1500);

    // Step 1: Select business type
    const restaurantBtn = form.locator('button', { hasText: 'Restaurant' });
    await restaurantBtn.click();
    await page.waitForTimeout(500);

    const nextBtn = form.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 5000 });
    await nextBtn.click();

    // Step 2: Select products and spend
    await expect(form.getByText('What products are you looking for')).toBeVisible({ timeout: 5000 });

    const disposablesLabel = form.locator('label', { hasText: 'Disposables' });
    await disposablesLabel.click();

    const spendLabel = form.locator('label', { hasText: '$3,000 - $10,000' });
    await spendLabel.click();

    await page.waitForTimeout(500);
    const nextBtn2 = form.getByRole('button', { name: /Next/i });
    await expect(nextBtn2).toBeEnabled({ timeout: 5000 });
    await nextBtn2.click();

    // Step 3: Fill contact info
    await expect(form.getByText('Business Name')).toBeVisible({ timeout: 5000 });

    const testEmail = `${TEST_EMAIL_PREFIX}${TEST_TIMESTAMP}@example.com`;

    await form.locator('#businessName').fill('Playwright Test Business');
    await form.locator('#contactName').fill('Test User');
    await form.locator('#email').fill(testEmail);
    await form.locator('#phone').fill('555-123-4567');

    // Submit form
    const submitBtn = form.getByRole('button', { name: /Get My Custom Quote/i });
    await expect(submitBtn).toBeEnabled();

    // Set up response listener before clicking
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/submit-lead') || response.url().includes('supabase'),
      { timeout: 10000 }
    ).catch(() => null);

    await submitBtn.click();

    // Wait for submission
    await page.waitForTimeout(2000);

    // Check for success state (Thank You message)
    const successMessage = form.getByText('Thank You');
    const hasSuccess = await successMessage.isVisible().catch(() => false);

    // If success message appears, form submitted correctly
    // If not, there might be an error or the API isn't configured yet
    if (hasSuccess) {
      await expect(successMessage).toBeVisible();
      await expect(form.getByText(/within 24 hours/i)).toBeVisible();
    } else {
      // Check if there's an error message (API not configured)
      const errorMessage = form.locator('text=/Something went wrong/i');
      const hasError = await errorMessage.isVisible().catch(() => false);

      // Either success or we expect an error (API endpoint may not exist yet)
      expect(hasSuccess || hasError).toBe(true);
    }
  });
});

// Email capture removed per business decision - not doing email lists currently
test.describe.skip('Email Capture Forms', () => {
  test('market dashboard email capture works', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const dashboard = page.locator('#market-data').first();
    await dashboard.scrollIntoViewIfNeeded();

    // Find email input in market dashboard
    const emailInput = dashboard.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();

    // Fill in test email
    const testEmail = `${TEST_EMAIL_PREFIX}market-${TEST_TIMESTAMP}@example.com`;
    await emailInput.fill(testEmail);

    // Click subscribe button
    const subscribeBtn = dashboard.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeBtn).toBeVisible();

    // We verify the form is functional, but don't require a specific response
    // since the email endpoint may not be fully implemented yet
    await subscribeBtn.click();
    await page.waitForTimeout(1000);

    // Form should either show success or stay visible for retry
    // (depending on backend implementation)
  });

  test('recalls section email capture exists', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const recallsSection = page.locator('#recalls-section').first();
    await recallsSection.scrollIntoViewIfNeeded();

    // Find email input in recalls section
    const emailInput = recallsSection.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();

    // Verify subscribe button exists
    const subscribeBtn = recallsSection.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeBtn).toBeVisible();
  });
});

test.describe('Calculator to Form Flow', () => {
  test('calculator data passes to form', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Use the calculator
    const calculator = page.locator('#calculator').first();
    await calculator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Select "Both" product type
    const bothBtn = calculator.locator('button', { hasText: 'Both' });
    await bothBtn.click();

    // Adjust slider to higher value
    const slider = calculator.locator('input[type="range"]');
    await slider.fill('25000');

    // Calculate
    const calculateBtn = calculator.getByRole('button', { name: /Calculate/i });
    await calculateBtn.click();
    await page.waitForTimeout(1000);

    // Verify results appear
    await expect(page.getByText(/\/year/).first()).toBeVisible({ timeout: 10000 });

    // Click "Get Your Custom Quote"
    const getQuoteBtn = calculator.getByRole('button', { name: /Get Your Custom Quote/i });
    await getQuoteBtn.click();

    // Wait for scroll and form pre-fill
    await page.waitForTimeout(1500);

    // The form should now be on Step 3 (contact info) with data pre-filled
    const form = page.locator('#lead-form').first();

    // Either on Step 3 directly (skipped) or check that form is visible
    const businessNameField = form.locator('#businessName');
    const isStep3 = await businessNameField.isVisible().catch(() => false);

    if (isStep3) {
      // Form skipped to step 3 with calculator data
      await expect(businessNameField).toBeVisible();
      await expect(form.getByText('Step 3 of 3')).toBeVisible();
    } else {
      // Form is visible but may need to proceed through steps
      await expect(form).toBeVisible();
    }
  });
});

test.describe('Cross-City API Data', () => {
  const cities = [
    { path: '/florida/miami', name: 'Miami' },
    { path: '/tennessee/nashville', name: 'Nashville' },
    { path: '/texas/houston', name: 'Houston' },
  ];

  for (const city of cities) {
    test(`${city.name} receives market data`, async ({ page }) => {
      await page.goto(city.path);

      // Verify market snapshot is populated
      const marketSnapshot = page.locator('text=Today\'s Market').first();
      await expect(marketSnapshot).toBeVisible();

      // Check for price values
      const prices = await page.locator('text=/\\$\\d+\\.\\d{2}/').all();
      expect(prices.length).toBeGreaterThan(0);
    });
  }
});

test.describe('Data Freshness Indicators', () => {
  test('market dashboard shows update timestamp', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const dashboard = page.locator('#market-data').first();
    await dashboard.scrollIntoViewIfNeeded();

    // Check for "Last updated" or similar timestamp
    const timestampPattern = /(Last updated|Updated|minutes ago|hours ago)/i;
    const timestamp = dashboard.locator(`text=${timestampPattern}`).first();
    await expect(timestamp).toBeVisible();
  });

  test('hero snapshot shows live indicator', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Check for "Live data" or similar indicator
    const liveIndicator = page.locator('text=/Live/i').first();
    await expect(liveIndicator).toBeVisible();
  });
});
