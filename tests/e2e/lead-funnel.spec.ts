import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';

// Deterministic but unique email so concurrent test runs don't collide on the
// rate limiter (Upstash 5/min/IP) and the leads table's email uniqueness.
function diagEmail(tag = '') {
  const suffix = tag ? `-${tag}` : '';
  return `diagnostic-do-not-contact+e2e${suffix}-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.invalid`;
}

test.describe('Lead funnel — API contract', () => {
  test('POST /api/submit-lead/ (with trailing slash) accepts a valid lead', async ({ request }) => {
    const response = await request.post('/api/submit-lead/', {
      data: {
        business_type: 'wholesaler',
        location_count: 1,
        primary_interest: ['disposables'],
        company_name: 'E2E Test Co',
        first_name: 'Test',
        last_name: 'User',
        email: diagEmail(),
        source_page: '/e2e-api-test',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
  });

  test('POST without trailing slash redirects to slash and still succeeds', async ({ request }) => {
    // The form's client code always sends the slash; this confirms the underlying
    // redirect is followed correctly on POST for non-browser clients.
    const response = await request.post('/api/submit-lead', {
      data: {
        business_type: 'restaurant',
        location_count: 1,
        primary_interest: ['disposables'],
        company_name: 'E2E Redirect Test',
        first_name: 'Test',
        last_name: 'User',
        email: diagEmail(),
      },
      maxRedirects: 5,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('rejects invalid email with 400', async ({ request }) => {
    const response = await request.post('/api/submit-lead/', {
      data: {
        business_type: 'wholesaler',
        location_count: 1,
        primary_interest: ['disposables'],
        company_name: 'Bad Email Test',
        first_name: 'Bad',
        last_name: 'Email',
        email: 'not-an-email',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('honeypot field triggers fake success (silent bot rejection)', async ({ request }) => {
    const response = await request.post('/api/submit-lead/', {
      data: {
        business_type: 'wholesaler',
        location_count: 1,
        primary_interest: ['disposables'],
        company_name: 'Honeypot Test',
        first_name: 'Honey',
        last_name: 'Pot',
        email: diagEmail(),
        website: 'https://bot-filled-this.com', // honeypot
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toBe('honeypot');
  });
});

test.describe('Lead form — multi-step flow on homepage', () => {
  test('renders the form section on the homepage', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    // Form section exists somewhere on the page
    await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 });
  });

  test('catalog deep-link navigates to lead form section', async ({ page }) => {
    // The pre-selection of primary_interest=disposables based on the
    // catalog_category URL param is covered by the unit test for
    // transformFormData in apps/web/src/pages/api/__tests__/submit-lead.test.ts.
    // Here we just verify the deep-link navigation works end-to-end:
    // the form is reachable and the URL params survive.
    const form = new LeadFormPage(page);
    await form.gotoWithCatalogDeepLink('USPET-9X6', 'pet_clamshells');

    // URL params preserved on landing
    expect(page.url()).toContain('catalog_sku=USPET-9X6');
    expect(page.url()).toContain('catalog_category=pet_clamshells');
    expect(page.url()).toContain('#lead-form');

    // Form is on the page and Step 1 (business type) is visible
    await expect(page.getByText(/What type of business/i).first()).toBeVisible({ timeout: 10000 });
  });

  // Multi-step click-through testing of the form UI is deferred until Playwright
  // MCP is connected — its DOM-inspection tools resolve Radix UI's accessibility
  // tree more reliably than blind `getByRole`/`getByText` calls against a
  // hydrated React island. The API-contract tests above already cover the
  // critical "valid lead → 200 → DB row" assertion that protects the funnel.
});

// =============================================================================
// P0 — Critical Path: UI happy paths and success state
// =============================================================================
test.describe('Lead form — UI: happy path', () => {
  test.describe.configure({ mode: 'serial' });

  test('P0-01: direct homepage submit completes all 3 steps and submits', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    // Step 1: pick business type
    await form.assertStep(1);
    await form.pickBusinessType(/Wholesaler/i);

    // Step 2: pick interest, accept default location count (1), click Continue
    await form.assertStep(2);
    await form.toggleInterest('Disposables & Paper Goods');
    await form.assertInterestChecked('Disposables & Paper Goods', true);
    await form.clickContinue();

    // Step 3: fill contact details
    await form.assertStep(3);
    await form.fillStep3({
      companyName: 'E2E Direct Test Co',
      firstName: 'Test',
      lastName: 'Runner',
      email: diagEmail('p0-01'),
    });
    await form.submit();

    // Success
    await form.expectSuccess();
  });

  test('P0-04: success state renders role=status with Thank You heading', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Regional Distributor/i);
    await form.toggleInterest('Custom Printed Items');
    await form.clickContinue();
    await form.fillStep3({
      companyName: 'Success Assert Co',
      firstName: 'Assert',
      lastName: 'Test',
      email: diagEmail('p0-04'),
    });
    await form.submit();

    // Role-based assertion for success state
    const successDiv = page.getByRole('status');
    await expect(successDiv).toBeVisible({ timeout: 15000 });
    await expect(successDiv.getByRole('heading', { name: /Thank You/i })).toBeVisible();
    // Tel link in success state
    await expect(successDiv.getByRole('link')).toHaveAttribute('href', /^tel:/);
  });
});

// =============================================================================
// P0 — Catalog deep-link entry and submit
// =============================================================================
test.describe('Lead form — UI: catalog deep-link', () => {
  test.describe.configure({ mode: 'serial' });

  test('P0-02: catalog deep-link pre-selects Disposables interest on Step 2', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoWithCatalogDeepLink('USPET-6X6', 'pet_clamshells');
    await form.hydrate();

    // Advance to Step 2
    await form.pickBusinessType(/Wholesaler/i);

    // Disposables should be pre-checked by useEffect
    await form.assertInterestChecked('Disposables & Paper Goods', true);

    // Continue should be enabled (primary_interest already populated)
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeEnabled();
  });

  test('P0-03: catalog deep-link full submit succeeds and API receives source_page with params', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoWithCatalogDeepLink('USPET-9X6', 'pet_clamshells');
    await form.hydrate();

    await form.pickBusinessType(/Wholesaler/i);

    // Disposables pre-checked — go straight to Step 3
    await form.clickContinue();

    await form.fillStep3({
      companyName: 'Catalog Lead Test Co',
      firstName: 'Catalog',
      lastName: 'Deep',
      email: diagEmail('p0-03'),
    });

    // Intercept the POST to verify source_page contains catalog params
    let capturedSourcePage = '';
    page.on('request', (req) => {
      if (req.url().includes('/api/submit-lead') && req.method() === 'POST') {
        try {
          const body = JSON.parse(req.postData() ?? '{}');
          capturedSourcePage = body.source_page ?? '';
        } catch {
          // ignore parse errors
        }
      }
    });

    await form.submit();
    await form.expectSuccess();

    // source_page should contain both catalog params
    expect(capturedSourcePage).toContain('catalog_sku=USPET-9X6');
    expect(capturedSourcePage).toContain('catalog_category=pet_clamshells');
  });

  test('P2-02: deep-link with catalog_sku only (no category) does NOT pre-check interests', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoWithSkuOnly('USPET-6X6');
    await form.hydrate();

    await form.pickBusinessType(/Wholesaler/i);

    // No catalog_category → useEffect does NOT fire → checkboxes start unchecked
    await form.assertInterestChecked('Disposables & Paper Goods', false);

    // Continue button should be disabled (no interest selected, location_count valid)
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
    // Clicking Continue without a checkbox should NOT advance to Step 3
    await continueBtn.click();
    // Still on Step 2
    await form.expectStep2();
  });
});

// =============================================================================
// P1 — Security: honeypot UI path
// =============================================================================
test.describe('Lead form — UI: security', () => {
  test('P1-01: UI honeypot path fills hidden field and receives fake success', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Wholesaler/i);
    await form.toggleInterest('Disposables & Paper Goods');
    await form.clickContinue();

    await form.fillStep3({
      companyName: 'Bot Company',
      firstName: 'Bot',
      lastName: 'Test',
      email: diagEmail('p1-01-honeypot'),
    });

    // Fill the hidden honeypot field programmatically (simulates a bot)
    await form.fillHoneypot('https://spam.example.com');

    // Intercept to confirm honeypot was sent
    let capturedLeadId = '';
    page.on('response', async (res) => {
      if (res.url().includes('/api/submit-lead')) {
        try {
          const body = await res.json();
          capturedLeadId = body.leadId ?? '';
        } catch {
          // ignore
        }
      }
    });

    await form.submit();

    // The form shows success (silent rejection — no error shown to user)
    await form.expectSuccess();
    // The API returns leadId: 'honeypot' (verified separately via API contract test)
    // We confirm fake success was shown (same UX as real success)
    await expect(page.getByRole('status')).toBeVisible();
  });
});

// =============================================================================
// P1 — Validation: Step 2 gating, optional fields
// =============================================================================
test.describe('Lead form — UI: validation', () => {
  test('P1-02: Step 2 Continue is gated — clicking without a checkbox does not advance', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Buying Group/i);

    // Do NOT check any interest
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Still on Step 2 (did not advance)
    await form.expectStep2();
    // Step 3 heading must NOT be visible
    await expect(page.getByRole('heading', { name: /Almost done/i })).not.toBeVisible();
  });
});

// =============================================================================
// P1 — Optional fields stored
// =============================================================================
test.describe('Lead form — UI: optional fields', () => {
  test.describe.configure({ mode: 'serial' });

  test('P1-03: optional fields (phone + distributor) are accepted by the API', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Broadline Distributor/i);
    await form.toggleInterest('Proteins (Beef, Pork, Poultry, Seafood)');
    await form.clickContinue();

    await form.fillStep3({
      companyName: 'Optional Fields Co',
      firstName: 'Optional',
      lastName: 'Fields',
      email: diagEmail('p1-03'),
      phone: '(555) 867-5309',
      currentDistributor: 'Sysco',
    });

    // Intercept to assert optional fields present in payload
    let requestBody: Record<string, unknown> = {};
    page.on('request', (req) => {
      if (req.url().includes('/api/submit-lead') && req.method() === 'POST') {
        try {
          requestBody = JSON.parse(req.postData() ?? '{}');
        } catch {
          // ignore
        }
      }
    });

    await form.submit();
    await form.expectSuccess();

    expect(requestBody.phone).toBe('(555) 867-5309');
    expect(requestBody.current_distributor).toBe('Sysco');
  });

  test('P2-03: purchase timeline selection is included in API payload', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Specialty Distributor/i);
    await form.toggleInterest('Eco-Friendly Products');
    await form.selectTimeline(/1-3 months/i);
    await form.clickContinue();

    await form.fillStep3({
      companyName: 'Timeline Test Co',
      firstName: 'Timeline',
      lastName: 'Tester',
      email: diagEmail('p2-03'),
    });

    let requestBody: Record<string, unknown> = {};
    page.on('request', (req) => {
      if (req.url().includes('/api/submit-lead') && req.method() === 'POST') {
        try {
          requestBody = JSON.parse(req.postData() ?? '{}');
        } catch {
          // ignore
        }
      }
    });

    await form.submit();
    await form.expectSuccess();

    expect(requestBody.purchase_timeline).toBe('1-3mo');
  });
});

// =============================================================================
// P1 — Back navigation
// =============================================================================
test.describe('Lead form — UI: navigation', () => {
  test('P1-04: Back from Step 2 returns to Step 1', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Wholesaler/i);
    await form.expectStep2();

    await form.clickBack();
    await form.expectStep1();
    await form.assertStep(1);
  });

  test('P1-05: Back from Step 3 returns to Step 2', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.pickBusinessType(/Cash & Carry/i);
    await form.toggleInterest('All of the above');
    await form.clickContinue();
    await form.expectStep3();

    await form.clickBack();
    await form.expectStep2();
    await form.assertStep(2);
  });

  test('P2-04: progress bar aria-valuenow advances through all steps', async ({ page }) => {
    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.assertStep(1);

    await form.pickBusinessType(/Wholesaler/i);
    await form.assertStep(2);

    await form.toggleInterest('Disposables & Paper Goods');
    await form.clickContinue();
    await form.assertStep(3);
  });
});

// =============================================================================
// P2 — Mobile viewport
// =============================================================================
test.describe('Lead form — UI: responsive', () => {
  test('P2-01: mobile viewport (390×844) completes full happy path', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const form = new LeadFormPage(page);
    await form.gotoHomepage();
    await form.hydrate();

    await form.assertStep(1);
    await form.pickBusinessType(/Wholesaler/i);

    await form.assertStep(2);
    await form.toggleInterest('Disposables & Paper Goods');
    await form.clickContinue();

    await form.assertStep(3);
    await form.fillStep3({
      companyName: 'Mobile Test Co',
      firstName: 'Mobile',
      lastName: 'User',
      email: diagEmail('p2-01-mobile'),
    });
    await form.submit();

    await form.expectSuccess();
  });
});
