import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: the multi-step LeadForm component (apps/web/src/components/forms/LeadForm.tsx).
 *
 * The form is a React island (client:visible) so all selectors must wait for hydration.
 * Identification strategy is accessibility-first (getByRole / getByLabel) to avoid
 * coupling to implementation details.
 *
 * Step layout (3 steps):
 *   1. Step1BusinessType — pick a business type tile (auto-advances 200ms after click)
 *   2. Step2ServiceInfo — location count + product interests + timeline
 *   3. Step3ContactDetails — name, email, phone, company, submit
 *
 * DOM findings from live DOM inspection (2026-05-14):
 * - Form lives inside section#quote on the homepage (NOT #lead-form — that anchor is
 *   used in CTA hrefs but the section id is "quote").
 * - Astro renders the LeadForm island as SSR HTML immediately (including the heading
 *   "What type of business are you?"). React hydration is SEPARATE and happens after
 *   the IntersectionObserver fires when the island scrolls into view. The SSR heading
 *   being visible does NOT mean React event handlers are attached. True hydration
 *   signal: buttons have __reactProps.onClick attached.
 * - Radix <Checkbox> renders as button[role="checkbox"] inside a <label> element.
 *   getByRole('checkbox', { name: ... }) does NOT resolve accessible names here.
 *   Use: page.locator('label:has-text("Disposables") button[role="checkbox"]')
 * - Location count is a Radix Select with trigger id="location_count" (role="combobox").
 * - Submit button text is "Get My Quote" (not "Submit").
 * - Success state uses role="status" with aria-live="polite" containing h3 "Thank You!".
 * - Honeypot field (#website) is in a hidden div — must use page.evaluate() to fill it
 *   since .fill() requires the element to be visible.
 */
export class LeadFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  /** Land on the homepage. Does not scroll to form — call hydrate() after. */
  async gotoHomepage() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Navigate with catalog deep-link params. Does not scroll — call hydrate() after. */
  async gotoWithCatalogDeepLink(sku: string, categorySlug: string) {
    await this.page.goto(
      `/?catalog_sku=${encodeURIComponent(sku)}&catalog_category=${encodeURIComponent(categorySlug)}#lead-form`
    );
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Navigate with catalog_sku only (no category). */
  async gotoWithSkuOnly(sku: string) {
    await this.page.goto(`/?catalog_sku=${encodeURIComponent(sku)}#lead-form`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Scroll the form section into view and wait for full React hydration.
   *
   * IMPORTANT: Astro renders LeadForm SSR HTML on the server, so the heading
   * "What type of business are you?" appears in the DOM immediately. React
   * hydration (attaching event handlers) only happens AFTER the
   * IntersectionObserver fires when the island scrolls into view. We must wait
   * for React's internal __reactProps.onClick to be attached to the tile buttons
   * before proceeding — otherwise clicks are silently ignored.
   *
   * Must be called before any form interactions.
   */
  async hydrate() {
    await this.page.locator('section#quote').scrollIntoViewIfNeeded();
    // Wait until React attaches onClick handlers to the tile buttons.
    // This is the true hydration signal for client:visible islands.
    await this.page.waitForFunction(
      () => {
        const buttons = document.querySelectorAll('button[type="button"]');
        const wholesaler = Array.from(buttons).find(
          (b) => b.textContent?.trim() === 'Wholesaler'
        );
        if (!wholesaler) return false;
        const propsKey = Object.keys(wholesaler).find((k) =>
          k.startsWith('__reactProps')
        );
        return !!propsKey && !!(wholesaler as any)[propsKey]?.onClick;
      },
      { timeout: 30000 }
    );
  }

  // ---------------------------------------------------------------------------
  // Step 1 — Business Type
  // ---------------------------------------------------------------------------

  /** Progress bar locator — verify step via aria-valuenow. */
  get progressBar(): Locator {
    return this.page.locator('[role="progressbar"]');
  }

  /** Assert the form is on a given step (1, 2, or 3). */
  async assertStep(step: 1 | 2 | 3) {
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', String(step));
  }

  /**
   * Click a business type tile by visible label text.
   * Auto-advances to Step 2 after 200ms (no explicit Next button).
   * Waits for the progress bar to confirm step 2.
   */
  async pickBusinessType(name: string | RegExp) {
    const btn = this.page.getByRole('button', { name });
    await btn.first().waitFor({ state: 'visible', timeout: 10000 });
    await btn.first().click();
    // Wait for auto-advance via progress bar (confirmed by aria-valuenow)
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', '2', { timeout: 5000 });
  }

  /** Click the "Restaurant, Food Truck, or other end-user?" toggle to reveal secondary tiles. */
  async expandEndUserSection() {
    await this.page
      .getByRole('button', { name: /Restaurant, Food Truck/i })
      .click();
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Service Info
  // ---------------------------------------------------------------------------

  /**
   * Return the Radix checkbox button for a given product interest label.
   * Uses label:has-text() because getByRole('checkbox', {name}) does not
   * resolve the accessible name from the sibling <span> in this Radix pattern.
   */
  checkboxFor(interestLabel: string): Locator {
    return this.page.locator(`label:has-text("${interestLabel}") button[role="checkbox"]`);
  }

  /** Click a product interest label to toggle its Radix checkbox. */
  async toggleInterest(interestLabel: string) {
    await this.checkboxFor(interestLabel).click();
  }

  /** Assert a product interest checkbox is in the expected state. */
  async assertInterestChecked(interestLabel: string, expected: boolean) {
    const expectedState = expected ? 'checked' : 'unchecked';
    await expect(this.checkboxFor(interestLabel)).toHaveAttribute('data-state', expectedState);
  }

  /** Open the location count combobox and select a value by display text. */
  async selectLocationCount(displayText: string | RegExp) {
    await this.page.locator('#location_count').click();
    await this.page.getByRole('option', { name: displayText }).click();
  }

  /** Open the purchase timeline combobox and select a value. */
  async selectTimeline(displayText: string | RegExp) {
    await this.page.locator('#purchase_timeline').click();
    await this.page.getByRole('option', { name: displayText }).click();
  }

  /** Click the Continue button (gated: requires location_count AND primary_interest). */
  async clickContinue() {
    const btn = this.page.getByRole('button', { name: /Continue/i });
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    // Wait for Step 3 via progress bar
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', '3', { timeout: 5000 });
  }

  /**
   * Fill Step 2 completely: location count, product interests, optional timeline.
   * Assumes the form is currently on Step 2.
   */
  async fillStep2(opts: {
    locationCount?: string | RegExp;
    interests?: string[];
    timeline?: string | RegExp;
  }) {
    if (opts.locationCount !== undefined) {
      await this.selectLocationCount(opts.locationCount);
    }
    for (const interest of opts.interests ?? []) {
      await this.toggleInterest(interest);
    }
    if (opts.timeline !== undefined) {
      await this.selectTimeline(opts.timeline);
    }
  }

  // ---------------------------------------------------------------------------
  // Step 3 — Contact Details
  // ---------------------------------------------------------------------------

  /** Fill Step 3 contact details. Assumes the form is currently on Step 3. */
  async fillStep3(opts: {
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentDistributor?: string;
  }) {
    await this.page.locator('#company_name').fill(opts.companyName);
    await this.page.locator('#first_name').fill(opts.firstName);
    await this.page.locator('#last_name').fill(opts.lastName);
    await this.page.locator('#email').fill(opts.email);
    if (opts.phone) {
      await this.page.locator('#phone').fill(opts.phone);
    }
    if (opts.currentDistributor) {
      await this.page.locator('#current_distributor').fill(opts.currentDistributor);
    }
  }

  /**
   * Fill the hidden honeypot field (simulates a bot filling all inputs).
   *
   * The field is in a div.hidden[aria-hidden="true"] container — Playwright's
   * .fill() requires visibility, so we use page.evaluate() to set the value and
   * dispatch the necessary React synthetic events (input + change) so React Hook
   * Form's register() picks up the new value.
   */
  async fillHoneypot(value: string) {
    await this.page.evaluate((val: string) => {
      const input = document.getElementById('website') as HTMLInputElement | null;
      if (!input) throw new Error('Honeypot #website not found');
      // Use native input value setter to trigger React's synthetic event system
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  /** Click the submit button ("Get My Quote"). */
  async submit() {
    await this.page.getByRole('button', { name: /Get My Quote/i }).click();
  }

  // ---------------------------------------------------------------------------
  // Navigation buttons
  // ---------------------------------------------------------------------------

  async clickBack() {
    await this.page.getByRole('button', { name: /Back/i }).click();
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  /** Wait for the success state (role=status with Thank You heading). */
  async expectSuccess() {
    const successContainer = this.page.getByRole('status');
    await expect(successContainer).toBeVisible({ timeout: 15000 });
    await expect(successContainer.getByRole('heading', { name: /Thank You/i })).toBeVisible();
  }

  /** Assert the error alert is visible. */
  async expectError() {
    await expect(this.page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  }

  /** Assert Step 1 is visible (progress bar + heading check). */
  async expectStep1() {
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', '1');
    await expect(
      this.page.getByRole('heading', { name: /What type of business/i })
    ).toBeVisible();
  }

  /** Assert Step 2 is visible (progress bar check). */
  async expectStep2() {
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', '2');
    await expect(
      this.page.getByRole('heading', { name: /Tell us about your needs/i })
    ).toBeVisible();
  }

  /** Assert Step 3 is visible (progress bar check). */
  async expectStep3() {
    await expect(this.progressBar).toHaveAttribute('aria-valuenow', '3');
    await expect(
      this.page.getByRole('heading', { name: /Almost done/i })
    ).toBeVisible();
  }
}
