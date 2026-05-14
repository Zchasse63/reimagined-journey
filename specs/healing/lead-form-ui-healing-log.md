# Healing Log: lead-form-ui

**Healer:** qa-healer (via QA Council orchestration)
**Healing date:** 2026-05-14
**Test command:** `PLAYWRIGHT_BASE_URL=https://valuesource.co npx playwright test tests/e2e/ --project=chromium --workers=1`

---

## Initial Run Results

**Run 1:** 10/19 new tests failing (9 failing + 4 did not run due to serial mode after failures)

Root causes identified:

### Failure 1: `pickBusinessType` timeout (affects 8 of 9 failing tests)

**Symptom:** `TimeoutError: locator.waitFor: Timeout 5000ms exceeded` while waiting for `getByRole('heading', { name: /Tell us about your needs/i })` after clicking the Wholesaler tile.

**Investigation:**
- Screenshot showed Wholesaler tile visually selected (green border) — the click DID register a style change
- Further diagnostics showed `aria-valuenow` stayed at `1` even after 3 seconds
- `page.mouse.click()` at center coordinates also failed
- Native DOM click via `page.evaluate()` also failed

**Root cause discovered:** Astro's `client:visible` directive causes the LeadForm to be server-side rendered (SSR) with full HTML — including the heading "What type of business are you?" and all tile button text. The SSR HTML is visible immediately on page load. React hydration (attaching `onClick` event handlers) happens separately, triggered by the IntersectionObserver when the section scrolls into view.

The original `hydrate()` method waited for the heading to be visible — but the heading was ALREADY visible in SSR HTML. React hadn't hydrated yet, so clicks were silently ignored (no event handlers attached).

Confirmed via: checking `__reactProps.onClick` on the Wholesaler button — it was `undefined` even when the heading was visible. After waiting for `__reactProps.onClick` to be truthy, clicks immediately worked.

**Fix applied to `LeadFormPage.ts`:**
```ts
// Before (incorrect — heading appears in SSR, not post-hydration):
await this.page.getByRole('heading', { name: /What type of business/i })
  .waitFor({ state: 'visible', timeout: 15000 });

// After (correct — waits for React to attach onClick handlers):
await this.page.waitForFunction(
  () => {
    const buttons = document.querySelectorAll('button[type="button"]');
    const wholesaler = Array.from(buttons).find(b => b.textContent?.trim() === 'Wholesaler');
    if (!wholesaler) return false;
    const propsKey = Object.keys(wholesaler).find(k => k.startsWith('__reactProps'));
    return !!propsKey && !!(wholesaler as any)[propsKey]?.onClick;
  },
  { timeout: 30000 }
);
```

Also updated `pickBusinessType()` to wait for progress bar `aria-valuenow` to change to `'2'` rather than waiting for the heading — since the heading check was proving unreliable:
```ts
// After click, wait for progress bar to confirm step advance:
await expect(this.progressBar).toHaveAttribute('aria-valuenow', '2', { timeout: 5000 });
```

### Failure 2: `fillHoneypot` not visible (P1-01)

**Symptom:** `locator.fill: Test timeout of 30000ms exceeded. element is not visible`

**Root cause:** The honeypot `#website` input is inside `<div class="hidden" aria-hidden="true">`. Playwright's `.fill()` method requires the element to be visible and refuses to fill hidden elements.

**Fix applied to `LeadFormPage.ts`:**
Used `page.evaluate()` to set the value programmatically via React's native input value setter, then dispatched `input` and `change` events so React Hook Form's `register()` picks up the change:

```ts
async fillHoneypot(value: string) {
  await this.page.evaluate((val: string) => {
    const input = document.getElementById('website') as HTMLInputElement | null;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    nativeInputValueSetter?.call(input, val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
```

---

## Heal Attempt Results

| Attempt | Tests Passing | Tests Failing | Action |
|---|---|---|---|
| Initial | 10/19 new | 9/19 | Identified root causes |
| Attempt 1 (hydration fix) | 18/19 new | 1/19 | Fixed pickBusinessType wait strategy |
| Attempt 2 (honeypot fix) | 19/19 new | 0/19 | Fixed fillHoneypot to use evaluate() |

---

## Final Run Results

**Command:** `PLAYWRIGHT_BASE_URL=https://valuesource.co npx playwright test tests/e2e/ --project=chromium --workers=1`

**Result: 29/29 passed (0 failed)**
- 10 catalog.spec.ts tests: all pass
- 6 original lead-funnel tests: all pass (unchanged)
- 13 new UI tests: all pass

**Duration:** 38.2 seconds

---

## Real Bugs Found

None. All failures were test infrastructure issues:
1. Incorrect hydration wait strategy (assumption that SSR heading = React hydrated)
2. Hidden element fill limitation (honeypot field is intentionally hidden)

No application bugs were discovered. The production form functions as designed.

---

## Notes for Future Test Authors

1. **Astro `client:visible` hydration**: Always wait for React event handler attachment, NOT DOM visibility, before clicking interactive elements in Astro islands. Use `waitForFunction` with `__reactProps` check.

2. **Radix Checkbox accessible names**: `getByRole('checkbox', { name: 'X' })` does NOT work for Radix UI checkboxes in this implementation. Use `label:has-text("X") button[role="checkbox"]`.

3. **Hidden form fields**: Use `page.evaluate()` with native input setter + event dispatch to set values programmatically. This bypasses visibility requirements while still triggering React's synthetic event system.
