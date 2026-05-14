import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: catalog landing (/catalog/) and category pages
 * (/catalog/[category-slug]/).
 *
 * Selectors discovered against production DOM at deploy of 22cb5efc.
 */
export class CatalogPage {
  readonly page: Page;
  readonly h1: Locator;
  readonly categoryLinks: Locator;
  readonly productCards: Locator;
  readonly quoteCtas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.h1 = page.locator('h1').first();
    // Category cards on /catalog/ use <h2> inside an <a> linking to /catalog/[slug]/
    this.categoryLinks = page.locator('a[href^="/catalog/"][href$="/"]');
    // Product cards on category pages use <article> wrapping <h3>
    this.productCards = page.locator('article');
    // "Request Volume Quote" CTAs deep-link to /?catalog_sku=...
    this.quoteCtas = page.locator('a[href*="catalog_sku="]');
  }

  async gotoLanding() {
    await this.page.goto('/catalog/');
  }

  async gotoCategory(slug: string) {
    await this.page.goto(`/catalog/${slug}/`);
  }

  /** Read all visible category names from the landing grid */
  async categoryNames(): Promise<string[]> {
    return this.page.locator('a[href^="/catalog/"] h2').allTextContents();
  }

  /** Click a specific category tile by its visible name */
  async openCategory(name: string) {
    await this.page.getByRole('heading', { level: 2, name }).first().click();
    await this.page.waitForURL(/\/catalog\/[a-z_]+\/$/);
  }

  /** Click the "Request Volume Quote" CTA on a specific SKU card */
  async requestQuoteForSku(sku: string) {
    const card = this.page.locator('article').filter({ hasText: new RegExp(`SKU\\s+${sku}`) });
    await expect(card).toHaveCount(1, { timeout: 5000 });
    await card.getByRole('link', { name: /Request Volume Quote/i }).click();
  }

  /** Get the SKU code from each visible product card */
  async visibleSkus(): Promise<string[]> {
    const skuTexts = await this.page.locator('article').locator('p:has-text("SKU")').allTextContents();
    return skuTexts.map((t) => t.replace(/^SKU\s+/, '').trim());
  }
}
