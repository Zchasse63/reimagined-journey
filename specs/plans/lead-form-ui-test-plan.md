# Test Plan: Multi-Step Lead Form UI Flow

**Feature slug:** `lead-form-ui`
**Architect:** qa-architect (via QA Council orchestration)
**Plan date:** 2026-05-14
**Source analysis:** specs/features/lead-form-ui-analysis.md

---

## 1. Scope

Full UI coverage of the multi-step lead form at https://valuesource.co. Tests extend the existing `tests/e2e/lead-funnel.spec.ts` spec file and the `tests/pages/LeadFormPage.ts` POM.

**Out of scope (already covered by existing tests):**
- API contract testing (POST /api/submit-lead/ — covered in lead-funnel.spec.ts)
- Honeypot via direct API POST (covered)
- Email validation via API (covered)
- Catalog rendering / SKU cards (covered in catalog.spec.ts)

---

## 2. Test Inventory by Priority

### P0 — Critical Path (must pass for deployment)

| ID | Test Name | Spec Group |
|---|---|---|
| P0-01 | Happy path: direct homepage submit → Thank You | Lead form — UI: happy path |
| P0-02 | Catalog deep-link: pre-selects Disposables interest | Lead form — UI: catalog deep-link |
| P0-03 | Catalog deep-link: full submit → Thank You with source_page params | Lead form — UI: catalog deep-link |
| P0-04 | Success state renders role=status + Thank You heading | Lead form — UI: happy path |

**P0 count: 4 tests**

### P1 — High Priority (regression gate)

| ID | Test Name | Spec Group |
|---|---|---|
| P1-01 | Honeypot: UI path fills hidden field → fake success shown | Lead form — UI: security |
| P1-02 | Step 2 Continue gated: no checkbox checked → button does not advance | Lead form — UI: validation |
| P1-03 | Optional fields: phone + current_distributor stored (API accepts) | Lead form — UI: optional fields |
| P1-04 | Back navigation: Step2 → Back → Step1 heading visible | Lead form — UI: navigation |
| P1-05 | Back navigation: Step3 → Back → Step2 heading visible | Lead form — UI: navigation |

**P1 count: 5 tests**

### P2 — Standard Coverage

| ID | Test Name | Spec Group |
|---|---|---|
| P2-01 | Mobile viewport (390×844): full happy path completes | Lead form — UI: responsive |
| P2-02 | Deep-link with catalog_sku only (no category): checkboxes NOT pre-checked | Lead form — UI: catalog deep-link |
| P2-03 | Purchase timeline optional: selecting a timeline is stored in submit | Lead form — UI: optional fields |
| P2-04 | Progress bar advances (aria-valuenow) through steps | Lead form — UI: navigation |

**P2 count: 4 tests**

**Total: 13 new UI tests**

---

## 3. Test Implementation Notes

### 3.1 File Layout

```
tests/
  pages/
    LeadFormPage.ts          ← EXTEND (fix existing, add new helpers)
  e2e/
    lead-funnel.spec.ts      ← EXTEND (add new describe blocks)
```

The 13 new tests all go into `lead-funnel.spec.ts` in new `describe` blocks. The `LeadFormPage.ts` POM needs new/fixed helpers for:
- `scrollToForm()` — using `section#quote` not `#lead-form`
- `hydrate()` — scroll + wait
- `pickBusinessType(name)` — corrected selector
- `fillStep2()` — fixed checkbox selector using `label:has-text()` pattern
- `fillStep3()` — corrected `#id` selectors
- `submit()` — corrected to "Get My Quote"
- `expectSuccess()` — use `getByRole('status')` + heading
- `checkboxForInterest(label)` — returns the Radix button locator inside the label
- `selectLocationCount(value)` — opens combobox, picks option
- `assertStep(n)` — checks `aria-valuenow` on progressbar

### 3.2 Email Budget

Rate limit: 5 POSTs/min/IP from Upstash. Max ~10 test leads total. Tests that need a full submit must use unique emails:
```ts
function diagEmail(tag = '') {
  return `diagnostic-do-not-contact+e2e-${tag}-${Date.now()}@example.invalid`;
}
```

UI tests that do a full submit: P0-01, P0-03, P1-03, P2-01, P2-03 = 5 real submits if run serially.
P1-01 (honeypot) submits but goes to `leadId: 'honeypot'` — no DB row → safe.
Total real DB rows from UI tests: ~5.

Run all UI tests serially (`test.describe.configure({ mode: 'serial' })`) within each describe block to avoid rate limit collisions.

### 3.3 Selector Strategy Rules

1. Accessibility selectors first: `getByRole`, `getByLabel`, `getByText`
2. ID selectors for Step 3 inputs (`#company_name` etc.) — these are stable semantic IDs
3. For Radix checkboxes: `page.locator('label:has-text("X") button[role="checkbox"]')` — documented as the only reliable approach
4. For Radix Selects: `page.locator('#location_count')` for trigger, `getByRole('option')` for options
5. No `waitForTimeout` — use `waitFor`, `toBeVisible`, or `waitForURL`
6. No `force: true` — if a click requires force, the selector is wrong
7. No hardcoded credentials or tokens

### 3.4 Hydration Wait Strategy

The form is `client:visible` (Astro). Pattern:
```ts
await page.locator('section#quote').scrollIntoViewIfNeeded();
await page.getByRole('heading', { name: /What type of business/i }).waitFor({ state: 'visible', timeout: 15000 });
```

This is more reliable than `waitForLoadState('networkidle')` + arbitrary timeout.

### 3.5 Radix Select Interaction

Radix Select renders a native hidden `<select>` for a11y and a custom `button[role="combobox"]`. Playwright can interact with either. Using the trigger button:
```ts
await page.locator('#location_count').click();
await page.getByRole('option', { name: /3-5 locations/i }).click();
```

### 3.6 Radix Checkbox Interaction

Click the wrapping `<label>` directly — it is a valid click target that toggles the Radix button:
```ts
// Option A: click the label (works because label wraps button)
await page.locator('label:has-text("Disposables & Paper Goods")').click();

// Option B: click the button inside (also works)
await page.locator('label:has-text("Disposables") button[role="checkbox"]').click();

// Assert state:
const state = await page.locator('label:has-text("Disposables") button[role="checkbox"]').getAttribute('data-state');
expect(state).toBe('checked');
```

---

## 4. Test Preconditions

- Production app at https://valuesource.co must be reachable
- Browser: Chromium (existing project config)
- No Supabase service-role client — rely on API response `leadId` for DB assertions
- Existing 16 tests must continue to pass after the new tests are added

---

## 5. Acceptance Criteria

- All P0 tests pass
- All P1 tests pass
- P2 tests pass (or are documented as flaky/bugs if they fail for app reasons)
- Existing 16 tests continue to pass
- No `waitForTimeout`, `force: true`, or raw CSS selectors for items that have ARIA roles/labels
- Test email addresses all use `diagnostic-do-not-contact+` prefix
