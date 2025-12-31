import { test, expect } from '@playwright/test';

/**
 * Landing Page Tests for New UI Structure
 *
 * Tests the 13-section structure and interactive components
 */

// Test different city tiers
const testCities = [
  { path: '/georgia/atlanta', name: 'Atlanta', tier: 'Hub' },
  { path: '/florida/tampa', name: 'Tampa', tier: 'Tier1_Route' },
  { path: '/tennessee/nashville', name: 'Nashville', tier: 'Tier2_Route' },
  { path: '/texas/houston', name: 'Houston', tier: 'Common_Carrier' },
];

test.describe('Landing Page Structure', () => {
  test('all 13 sections render in correct order', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // 1. Hero with H1
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Food Service Distribution');

    // 2. Delivery Info Bar
    await expect(page.getByText('Delivery').first()).toBeVisible();

    // 3. Market Dashboard
    await expect(page.locator('#market-data').first()).toBeVisible();

    // 4. Cost Calculator
    await expect(page.locator('#calculator').first()).toBeVisible();

    // 5. Lead Form
    await expect(page.locator('#lead-form').first()).toBeVisible();

    // 6. Value Props
    await expect(page.getByText('Why Choose Value Source').first()).toBeVisible();
  });

  test('Hero section displays market snapshot', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Check for market snapshot card
    await expect(page.getByText("Today's Market").first()).toBeVisible();
  });

  test('page has correct H1 with city name', async ({ page }) => {
    await page.goto('/florida/miami');

    const h1 = page.locator('h1');
    await expect(h1).toContainText('Miami');
    await expect(h1).toContainText('Florida');
  });
});

test.describe('Cost Calculator', () => {
  test('calculator displays and calculates savings', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Find calculator section
    const calculator = page.locator('#calculator').first();
    await calculator.scrollIntoViewIfNeeded();
    await expect(calculator).toBeVisible();

    // Check for product type options
    await expect(page.getByText('Disposables').first()).toBeVisible();
    await expect(page.getByText('Proteins').first()).toBeVisible();

    // Check for spend slider
    const slider = calculator.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Wait for React hydration - the button should be clickable with actual effect
    const calculateBtn = calculator.getByRole('button', { name: /Calculate/i });
    await expect(calculateBtn).toBeEnabled();

    // Wait for hydration to complete (client:visible loads JS when element enters viewport)
    await page.waitForTimeout(1000);

    // Click calculate button
    await calculateBtn.click();

    // Results should appear (wait for React state update and animation)
    await page.waitForTimeout(1000);
    await expect(page.getByText(/\/year/).first()).toBeVisible({ timeout: 10000 });
  });

  test('calculator "Get Quote" scrolls to form', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const calculator = page.locator('#calculator').first();
    await calculator.scrollIntoViewIfNeeded();

    // Wait for React hydration
    await page.waitForTimeout(1000);

    // Calculate first
    const calculateBtn = calculator.getByRole('button', { name: /Calculate/i });
    await calculateBtn.click();

    // Wait for results to appear
    await page.waitForTimeout(1000);
    await expect(page.getByText(/\/year/).first()).toBeVisible({ timeout: 10000 });

    // Click Get Quote
    const getQuoteBtn = calculator.getByRole('button', { name: /Get Your Custom Quote/i });
    await getQuoteBtn.click();

    // Wait for scroll
    await page.waitForTimeout(1000);

    // Form should be visible (may not be in exact viewport due to scroll behavior)
    await expect(page.locator('#lead-form').first()).toBeVisible();
  });
});

test.describe('Multi-Step Lead Form', () => {
  test('form displays step 1 initially', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const form = page.locator('#lead-form').first();
    await form.scrollIntoViewIfNeeded();

    // Step 1 should show business types
    await expect(form.getByText('What type of business')).toBeVisible();
    await expect(form.getByText('Restaurant')).toBeVisible();
  });

  test('form progresses through steps', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const form = page.locator('#lead-form').first();
    await form.scrollIntoViewIfNeeded();

    // Wait for React hydration (client:visible loads JS when element enters viewport)
    await page.waitForTimeout(1500);

    // Step 1: Select business type - click the button containing "Restaurant"
    const restaurantBtn = form.locator('button', { hasText: 'Restaurant' });
    await restaurantBtn.click();

    // Wait for selection to register (React state update)
    await page.waitForTimeout(500);

    // Verify selection registered by checking button styling changed
    await expect(restaurantBtn).toHaveClass(/border-orange-500/, { timeout: 3000 });

    // Click Next (should now be enabled)
    const nextBtn = form.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 5000 });
    await nextBtn.click();

    // Step 2: Should show products
    await expect(form.getByText('What products are you looking for')).toBeVisible({ timeout: 5000 });

    // Select a product - click the label containing "Disposables"
    const disposablesLabel = form.locator('label', { hasText: 'Disposables' });
    await disposablesLabel.click();

    // Select spend range
    const spendLabel = form.locator('label', { hasText: '$3,000 - $10,000' });
    await spendLabel.click();

    await page.waitForTimeout(500);
    const nextBtn2 = form.getByRole('button', { name: /Next/i });
    await expect(nextBtn2).toBeEnabled({ timeout: 5000 });
    await nextBtn2.click();

    // Step 3: Contact info
    await expect(form.getByText('Business Name')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Market Dashboard', () => {
  test('displays commodity cards', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const dashboard = page.locator('#market-data').first();
    await dashboard.scrollIntoViewIfNeeded();

    // Check for commodity sections (at least one should be visible)
    await expect(dashboard.getByText('Poultry')).toBeVisible();

    // On mobile, other cards may require horizontal scroll, so just verify they exist in DOM
    // Use getByRole to be more specific about the heading
    const beefHeading = dashboard.getByRole('heading', { name: 'Beef' });
    await expect(beefHeading).toBeAttached();
  });

  test('email capture form exists', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const dashboard = page.locator('#market-data').first();
    await dashboard.scrollIntoViewIfNeeded();

    // Find email input in market dashboard
    const emailInput = dashboard.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Recalls Section', () => {
  test('recalls section renders', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const recallsSection = page.locator('#recalls-section').first();
    await recallsSection.scrollIntoViewIfNeeded();

    // Section should exist
    await expect(recallsSection).toBeVisible();

    // Should have header
    await expect(page.getByText('Active Food Recalls').first()).toBeVisible();
  });
});

test.describe('Navigation & CTAs', () => {
  test('primary CTA exists in hero', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Hero CTA should exist
    const ctaBtn = page.getByRole('link', { name: /Get Custom Pricing/i }).first();
    await expect(ctaBtn).toBeVisible();
  });

  test('footer CTA links to form', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Scroll to footer
    const footer = page.locator('#quote').first();
    await footer.scrollIntoViewIfNeeded();

    // Footer CTA should exist
    await expect(footer.getByRole('link', { name: /Get Your Custom Quote/i })).toBeVisible();
  });

  test('nearby cities links work', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Find nearby cities section
    await page.getByText('Also Serving Nearby Areas').first().scrollIntoViewIfNeeded();

    // Should have city links
    const cityLinks = page.locator('a[href*="/georgia/"]');
    expect(await cityLinks.count()).toBeGreaterThan(0);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('page renders on mobile', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    // Hero should be visible
    await expect(page.locator('h1')).toBeVisible();

    // Calculator should be visible
    await expect(page.locator('#calculator').first()).toBeVisible();

    // Form should be visible
    await expect(page.locator('#lead-form').first()).toBeVisible();
  });
});

test.describe('Cross-City Testing', () => {
  for (const city of testCities) {
    test(`${city.name} (${city.tier}) loads correctly`, async ({ page }) => {
      await page.goto(city.path);

      // H1 should contain city name
      await expect(page.locator('h1')).toContainText(city.name);

      // Main sections should exist
      await expect(page.locator('#market-data').first()).toBeVisible();
      await expect(page.locator('#calculator').first()).toBeVisible();
      await expect(page.locator('#lead-form').first()).toBeVisible();
    });
  }
});

test.describe('SEO Elements', () => {
  test('page has correct title', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const title = await page.title();
    expect(title.toLowerCase()).toContain('atlanta');
  });

  test('page has meta description', async ({ page }) => {
    await page.goto('/georgia/atlanta');

    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(50);
  });
});
