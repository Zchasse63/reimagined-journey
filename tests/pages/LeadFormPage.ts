import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: the multi-step LeadForm component (apps/web/src/components/forms/LeadForm.tsx).
 *
 * The form is a React island (client:visible) so all selectors must wait for hydration.
 * Identification strategy is accessibility-first (getByRole / getByLabel) to avoid
 * coupling to implementation details.
 *
 * Step layout (3 steps):
 *   1. Step1BusinessType — pick a business type tile
 *   2. Step2ServiceInfo — location count + product interests + timeline
 *   3. Step3ContactDetails — name, email, phone, company, submit
 */
export class LeadFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Land on the homepage and scroll the form into view (or follow a deep link) */
  async gotoHomepage() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoWithCatalogDeepLink(sku: string, categorySlug: string) {
    await this.page.goto(`/?catalog_sku=${encodeURIComponent(sku)}&catalog_category=${encodeURIComponent(categorySlug)}#lead-form`);
    await this.page.waitForLoadState('networkidle');
  }

  /** Pick a business type by visible label. Triggers a step-1 advancement. */
  async pickBusinessType(name: string | RegExp) {
    const selector = typeof name === 'string'
      ? this.page.getByRole('button', { name })
      : this.page.getByRole('button', { name });
    await selector.first().click();
  }

  async clickNext() {
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  async clickBack() {
    await this.page.getByRole('button', { name: /Back/i }).click();
  }

  /** Step 2: location count, product interest checkboxes, optional timeline */
  async fillStep2(opts: { locationCount?: number; interests?: string[]; timeline?: string }) {
    if (opts.locationCount !== undefined) {
      const locField = this.page.getByLabel(/Location|locations/i).first();
      await locField.fill(String(opts.locationCount));
    }
    for (const interest of opts.interests || []) {
      await this.page.getByRole('checkbox', { name: new RegExp(interest, 'i') }).check();
    }
    if (opts.timeline) {
      await this.page.getByRole('radio', { name: new RegExp(opts.timeline, 'i') }).check();
    }
  }

  /** Step 3 contact details */
  async fillStep3(opts: {
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) {
    await this.page.getByLabel(/Company Name/i).fill(opts.companyName);
    await this.page.getByLabel(/First Name/i).fill(opts.firstName);
    await this.page.getByLabel(/Last Name/i).fill(opts.lastName);
    await this.page.getByLabel(/Email/i).fill(opts.email);
    if (opts.phone) {
      await this.page.getByLabel(/Phone/i).fill(opts.phone);
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: /Submit/i }).click();
  }

  /** Wait for the success state to appear */
  async expectSuccess() {
    await expect(this.page.getByRole('status').or(this.page.getByText(/Thank You|Thanks for/i))).toBeVisible({
      timeout: 15000,
    });
  }
}
