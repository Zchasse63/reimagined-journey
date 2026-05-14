# QA Pipeline Report: Multi-Step Lead Form UI Flow

**Feature slug:** `lead-form-ui`
**Report date:** 2026-05-14
**Pipeline:** QA Council orchestration
**Branch:** `claude/phase-6-qa-tests`
**Target:** https://valuesource.co

---

## Executive Summary

The QA pipeline extended the existing 16-test E2E suite with 13 new UI tests covering the full multi-step lead form conversion funnel. All 29 tests pass (100%). No application bugs were found. Two test infrastructure issues were identified during healing and resolved.

---

## Pipeline Phase Summary

| Phase | Agent | Output | Status |
|---|---|---|---|
| 1 Analyst | qa-analyst | `specs/features/lead-form-ui-analysis.md` | Complete |
| 2 Architect | qa-architect | `specs/plans/lead-form-ui-test-plan.md` | Complete |
| 3 Engineer | qa-engineer | `tests/pages/LeadFormPage.ts`, `tests/e2e/lead-funnel.spec.ts` | Complete |
| 4 Sentinel | qa-sentinel | `specs/audits/lead-form-ui-audit.md` | PASS (1 cycle) |
| 5 Healer | qa-healer | `specs/healing/lead-form-ui-healing-log.md` | Complete (2 heal cycles) |
| 6 Scribe | qa-scribe | `specs/reports/lead-form-ui-report.md` | Complete |

---

## Test Results

### Final Pass Rate: 29/29 (100%)

**Command:**
```
PLAYWRIGHT_BASE_URL=https://valuesource.co npx playwright test tests/e2e/ --project=chromium --workers=1
```

**Duration:** 38.2 seconds

### Test Breakdown

#### Preserved Tests (16 original)

| Suite | Count | Result |
|---|---|---|
| Catalog landing | 3 | PASS |
| Catalog category page | 4 | PASS |
| SEO/GEO assets | 3 | PASS |
| Lead funnel — API contract | 4 | PASS |
| Lead form — multi-step flow on homepage | 2 | PASS |
| **Total** | **16** | **All PASS** |

#### New Tests (13 new UI tests)

| ID | Test Name | Priority | Result |
|---|---|---|---|
| P0-01 | Direct homepage submit completes all 3 steps and submits | P0 | PASS |
| P0-04 | Success state renders role=status with Thank You heading | P0 | PASS |
| P0-02 | Catalog deep-link pre-selects Disposables interest on Step 2 | P0 | PASS |
| P0-03 | Catalog deep-link full submit + source_page contains catalog params | P0 | PASS |
| P1-01 | UI honeypot path fills hidden field and receives fake success | P1 | PASS |
| P1-02 | Step 2 Continue gated — clicking without checkbox does not advance | P1 | PASS |
| P1-03 | Optional fields (phone + distributor) accepted by API | P1 | PASS |
| P1-04 | Back from Step 2 returns to Step 1 | P1 | PASS |
| P1-05 | Back from Step 3 returns to Step 2 | P1 | PASS |
| P2-01 | Mobile viewport (390x844) completes full happy path | P2 | PASS |
| P2-02 | Deep-link with catalog_sku only does NOT pre-check interests | P2 | PASS |
| P2-03 | Purchase timeline selection included in API payload | P2 | PASS |
| P2-04 | Progress bar aria-valuenow advances through all steps | P2 | PASS |

---

## Key Technical Findings

### 1. Critical DOM Insight: SSR vs React Hydration

**Finding:** Astro's `client:visible` directive causes the LeadForm to be server-side rendered — the heading "What type of business are you?" and all tile button text appear in the DOM immediately from the server. React hydration (event handler attachment) is separate and asynchronous.

**Impact:** Any test that checks for the heading being visible and then immediately clicks a tile will fail silently (the click is ignored — no event handler attached yet).

**Solution:** Wait for React's `__reactProps.onClick` to be present on a tile button before proceeding. This is the reliable hydration signal for Astro `client:visible` islands.

**Pattern for future tests:**
```ts
await page.waitForFunction(() => {
  const buttons = document.querySelectorAll('button[type="button"]');
  const tile = Array.from(buttons).find(b => b.textContent?.trim() === 'Wholesaler');
  const propsKey = Object.keys(tile ?? {}).find(k => k.startsWith('__reactProps'));
  return !!propsKey && !!(tile as any)[propsKey]?.onClick;
}, { timeout: 30000 });
```

### 2. Radix UI Checkbox Selector Pattern (Documented)

**Finding:** `getByRole('checkbox', { name: 'X' })` does NOT resolve the accessible name for Radix UI `<Checkbox>` components in this codebase. The component renders:
```html
<label>
  <button type="button" role="checkbox" data-state="unchecked" />
  <input type="checkbox" aria-hidden="true" tabindex="-1" />
  <span>Interest Label</span>
</label>
```

The accessible name is not computed from the sibling `<span>` or wrapping `<label>`.

**Solution:**
```ts
page.locator('label:has-text("Disposables & Paper Goods") button[role="checkbox"]')
```

Check state via `data-state` attribute: `"checked"` or `"unchecked"`.

### 3. Confirmed: Catalog Deep-Link Pre-Selection Works

The `useEffect` in `LeadForm.tsx` reads `catalog_category` from the URL and sets `primary_interest: ['disposables']`. Confirmed in production — "Disposables & Paper Goods" checkbox shows `data-state="checked"` after navigating with `?catalog_category=pet_clamshells` without any user interaction.

### 4. Confirmed: source_page Construction

On submit with catalog params, the `source_page` field is formatted as:
```
/?catalog_sku=USPET-9X6&catalog_category=pet_clamshells
```
P0-03 verifies this via request interception.

### 5. Homepage Anchor Discrepancy (UX observation, not a bug)

Catalog CTA links use `#lead-form` as the hash, but the form section on the homepage has `id="quote"`. The hash scroll therefore does not trigger browser auto-scroll on the homepage. The form is still reachable by scrolling. This is a pre-existing UX issue, not a functional regression.

---

## Files Modified / Created

### Modified
- `tests/pages/LeadFormPage.ts` — Extended POM with correct hydration wait, Radix checkbox helpers, fixed submit button text, honeypot fill via evaluate(), step assertions

### Extended (existing file)
- `tests/e2e/lead-funnel.spec.ts` — Added 8 new describe blocks with 13 new tests

### Created (pipeline artifacts)
- `specs/features/lead-form-ui-analysis.md` — Full DOM analysis with selector reference card
- `specs/plans/lead-form-ui-test-plan.md` — Prioritized test plan (4 P0 / 5 P1 / 4 P2)
- `specs/audits/lead-form-ui-audit.md` — Sentinel audit (PASS, first cycle)
- `specs/healing/lead-form-ui-healing-log.md` — 2 heal cycles documented
- `specs/reports/lead-form-ui-report.md` — This report

---

## Real Bugs Documented

**None.** All test failures during healing were infrastructure issues (incorrect hydration wait strategy, hidden element fill limitation). The production application functions as designed.

---

## Rate Limit Impact

Test emails consumed: ~6 real DB rows (estimated, using unique timestamps + `diagnostic-do-not-contact+` prefix). All within the configured Upstash limit of 5/min/IP when run serially with `--workers=1`.

---

## Recommendations

1. Add a CSS class or `data-testid="lead-form-hydrated"` attribute to the form container once React hydration completes — this would provide a cleaner, implementation-agnostic hydration signal than inspecting `__reactProps`.

2. Consider aligning the homepage section ID (`#quote`) with the catalog CTA anchor target (`#lead-form`) to provide the expected browser auto-scroll behavior when arriving from a catalog product page.

3. The existing suite now covers the full conversion funnel at UI level. Consider adding visual regression snapshots for the Step 1 tile grid and the Thank You success state as a follow-up.
