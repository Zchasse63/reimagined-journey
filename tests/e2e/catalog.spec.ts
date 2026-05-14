import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';

const EXPECTED_CATEGORIES = [
  'PET Cold Cup Lids',
  'Cutlery',
  'PET Cold Cups',
  'PET Clamshells',
  'SOS Paper Bags',
  'Aluminum Containers',
  'Aluminum Container Lids',
  'Portion Cups',
  'Liquor Bags',
  'Cutlery Kits',
  'PP Deli Containers',
  'Foil Rolls & Sheets',
  'Twisted Handle Bags',
  'Portion Cup Lids',
];

test.describe('Catalog landing (/catalog/)', () => {
  test('renders the H1 + all 14 category cards', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.gotoLanding();

    await expect(catalog.h1).toContainText('Packaging & Disposables');

    const names = (await catalog.categoryNames()).map((n) => n.trim());
    expect(names.length).toBe(EXPECTED_CATEGORIES.length);
    for (const expected of EXPECTED_CATEGORIES) {
      expect(names).toContain(expected);
    }
  });

  test('every category card links to /catalog/[slug]/', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.gotoLanding();

    const hrefs = await catalog.categoryLinks
      .filter({ has: page.locator('h2') })
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute('href')));

    expect(hrefs.length).toBe(EXPECTED_CATEGORIES.length);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/catalog\/[a-z_]+\/$/);
    }
  });

  test('emits valid JSON-LD ItemList schema', async ({ page }) => {
    await page.goto('/catalog/');
    // Page has multiple JSON-LD blocks (LocalBusiness from Layout + ItemList from
    // catalog index). Find the ItemList one specifically.
    const allLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = allLd.map((t) => JSON.parse(t));
    const itemList = parsed.find((d) => d['@type'] === 'ItemList');
    expect(itemList, 'ItemList JSON-LD block').toBeDefined();
    expect(itemList.numberOfItems).toBe(14);
    expect(itemList.itemListElement.length).toBe(14);
  });
});

test.describe('Catalog category page (/catalog/[category]/)', () => {
  test('PET Clamshells category renders header + 10 SKU cards', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.gotoCategory('pet_clamshells');

    await expect(catalog.h1).toHaveText('PET Clamshells');

    const skuCount = await catalog.productCards.count();
    expect(skuCount).toBe(10);
  });

  test('each SKU card has a "Request Volume Quote" CTA with catalog_sku param', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.gotoCategory('pet_clamshells');

    const ctas = catalog.quoteCtas;
    const ctaCount = await ctas.count();
    expect(ctaCount).toBeGreaterThan(0);

    const firstHref = await ctas.first().getAttribute('href');
    expect(firstHref).toMatch(/catalog_sku=[A-Z0-9-]+/);
    expect(firstHref).toMatch(/catalog_category=pet_clamshells/);
    expect(firstHref).toMatch(/#lead-form$/);
  });

  test('breadcrumb links back to /catalog/', async ({ page }) => {
    await page.goto('/catalog/pet_clamshells/');
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: /Catalog/i })).toBeVisible();
  });

  test('emits Product/ItemList JSON-LD with offers (Schema.org)', async ({ page }) => {
    await page.goto('/catalog/pet_clamshells/');
    const ldJsonTexts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ldJsonTexts.length).toBeGreaterThanOrEqual(2); // ItemList + Breadcrumb

    const itemList = ldJsonTexts.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'ItemList');
    expect(itemList).toBeDefined();
    expect(itemList.itemListElement[0].item['@type']).toBe('Product');
    expect(itemList.itemListElement[0].item.offers).toBeDefined();
    expect(itemList.itemListElement[0].item.offers.price).toMatch(/^\d+\.\d{2}$/);
    expect(itemList.itemListElement[0].item.offers.priceCurrency).toBe('USD');
  });
});

test.describe('SEO/GEO assets', () => {
  test('llms.txt is served at /llms.txt', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('# Value Source');
    expect(body).toContain('/catalog/');
  });

  test('robots.txt is served and points to sitemap', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toMatch(/Sitemap:\s+https:\/\/valuesource\.co\/sitemap/);
  });

  test('sitemap-0.xml lists 100+ URLs including city pages', async ({ page }) => {
    const response = await page.request.get('/sitemap-0.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    const urlCount = (body.match(/<loc>/g) || []).length;
    expect(urlCount).toBeGreaterThan(100);
    // Confirm a sample of city URLs are indexed
    expect(body).toContain('valuesource.co/georgia/atlanta/');
    expect(body).toContain('valuesource.co/florida/miami/');
  });
});
