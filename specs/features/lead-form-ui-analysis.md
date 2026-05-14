# Feature Design Document: Multi-Step Lead Form UI Flow

**Feature slug:** `lead-form-ui`
**Target URL:** https://valuesource.co
**Analysis date:** 2026-05-14
**Analyst:** qa-analyst (via QA Council orchestration)
**DOM inspection method:** Live Playwright DOM capture against production

---

## 1. Feature Overview

The multi-step lead form is the primary conversion funnel on valuesource.co. It is a React island rendered via `client:visible` (hydrates only when scrolled into view). The form collects business type, service needs, and contact details in 3 sequential steps before POSTing to `/api/submit-lead/`.

Two entry points exist:
1. **Direct homepage**: User lands on `/`, scrolls down to the form section
2. **Catalog deep-link**: User clicks "Request Volume Quote" on a SKU card, landing on `/?catalog_sku=X&catalog_category=Y#lead-form` with product interest pre-filled

---

## 2. DOM Topology (verified against production)

### 2.1 Form Container

The form lives inside `section#quote` on the homepage (NOT `#lead-form` — that anchor is used by catalog CTA links but the actual section ID on the homepage is `#quote`).

```
section#quote
  div.container-wide
    div.grid
      div.bg-white.rounded-2xl  ← white card
        h3 "Get Your Custom Quote"
        [LeadForm React island]  ← form element starts here
          div[role="progressbar"][aria-valuenow="1|2|3"]
          {Step 1 | Step 2 | Step 3}
```

**Critical**: Because the form uses `client:visible`, tests MUST scroll `section#quote` into view and wait for hydration before interacting.

### 2.2 Step 1 — Business Type

Rendered as: `div.space-y-6` containing:
- `h3` "What type of business are you?"
- 6 primary B2B tiles (grid): plain `button[type="button"]` with text spans
- 1 "Other Business Type" button
- Collapsible end-user section (expand via button "Restaurant, Food Truck, or other end-user?")
- 6 secondary tiles (hidden until toggled)

**Selector strategy**: `page.getByRole('button', { name: /Wholesaler/i })` — works reliably. The button text is in a `<span>` inside the `<button>`.

**Auto-advance**: Clicking any tile triggers a 200ms `setTimeout` that calls `onNext()`. No explicit "Next" button exists.

All 13 tile values observed in DOM:
- Primary: `Regional Distributor`, `Wholesaler`, `Buying Group / Co-op`, `Broadline Distributor`, `Specialty Distributor`, `Cash & Carry`
- Secondary (behind expand): `Restaurant`, `Food Truck`, `Caterer`, `Institution`, `Grocery / Retail`, `Ghost Kitchen`
- Other: `Other Business Type`

### 2.3 Step 2 — Service Info

Rendered as: `div.space-y-8` with:

#### Location Count (Radix Select)
```html
<button type="button" role="combobox" id="location_count" aria-expanded="false" data-state="closed">
  <span>1 location</span>
</button>
<!-- hidden native select for a11y: -->
<select aria-hidden="true" tabindex="-1">
  <option value="1" selected>1 location</option>
  <option value="2">2 locations</option>
  <option value="3">3-5 locations</option>
  <option value="6">6-10 locations</option>
  <option value="11">11+ locations</option>
</select>
```

**Selector**: `page.locator('#location_count')` — reliably targets the combobox trigger.
**Interaction**: Click trigger → `page.getByRole('option', { name: /1 location/i })` to select.

Default value: 1 location (pre-selected from form defaultValues).

#### Product Interests (Radix Checkboxes — CRITICAL FINDING)

**THE GOTCHA**: `getByRole('checkbox', { name: ... })` does NOT work. The Radix `<Checkbox>` renders as:

```html
<label class="flex items-center space-x-3 ...">
  <button type="button" role="checkbox" aria-checked="false" data-state="unchecked" value="on"
          class="peer h-5 w-5 ... data-[state=checked]:bg-primary-600">
  </button>
  <input type="checkbox" aria-hidden="true" tabindex="-1" value="on"
         style="position:absolute; opacity:0; ..."/>
  <span class="text-sm text-slate-700">Disposables &amp; Paper Goods</span>
</label>
```

The accessible name of `button[role="checkbox"]` is NOT derived from the sibling `<span>` or the wrapping `<label>` in Playwright's accessibility resolver.

**CONFIRMED WORKING SELECTORS**:
- `page.locator('label:has-text("Disposables") button[role="checkbox"]')` — click this
- `page.locator('button[role="checkbox"]').nth(0)` — by index (fragile)
- Check state with: `.getAttribute('data-state')` → `"checked"` or `"unchecked"`

5 product interests, in DOM order:
0. Disposables & Paper Goods
1. Custom Printed Items
2. Proteins (Beef, Pork, Poultry, Seafood)
3. Eco-Friendly Products
4. All of the above

**Continue button**: `page.getByRole('button', { name: /Continue/i })` — gated on `location_count` AND `primary_interest.length > 0`.

**Back button**: `page.getByRole('button', { name: /Back/i })` — always shown on Step 2/3.

#### Purchase Timeline (Radix Select — optional)
```html
<button type="button" role="combobox" id="purchase_timeline">
```
**Selector**: `page.locator('#purchase_timeline')`. Options: "Immediately", "1-3 months", "3-6 months", "Just exploring".

### 2.4 Step 3 — Contact Details

All fields use native `<input>` with `id` attributes:

| Field | id | type | Required |
|---|---|---|---|
| Company Name | `company_name` | text | Yes |
| First Name | `first_name` | text | Yes |
| Last Name | `last_name` | text | Yes |
| Email | `email` | email | Yes |
| Phone | `phone` | tel | No |
| Current Distributor | `current_distributor` | text | No |
| Honeypot | `website` | text | Hidden (aria-hidden div) |

**Selector strategy**: `page.locator('#company_name')` or `page.getByLabel(/Company Name/i)` — both work. The `<label>` elements use `for=` attributes matching the `id`s.

**Submit button**: `page.getByRole('button', { name: /Get My Quote/i })` — submits the form. Text changes to "Submitting..." with spinner during inflight request.

### 2.5 Success State

After successful submit, the form is replaced by:
```html
<div class="text-center py-12" role="status" aria-live="polite">
  [CheckCircle icon]
  <h3 class="text-2xl font-semibold ...">Thank You!</h3>
  <p>We've received your request and will be in touch within 24 hours.</p>
  <p>... call us at <a href="tel:...">...</a></p>
</div>
```

**Assertion**: `page.getByRole('status')` with `toContainText('Thank You')` OR `page.getByRole('heading', { name: /Thank You/i })`.

### 2.6 Error State

On API error:
```html
<div role="alert" aria-live="assertive" class="... bg-red-50 ...">
  There was an error submitting...
</div>
```

**Assertion**: `page.getByRole('alert')`.

### 2.7 Progress Indicator

```html
<div role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="3" aria-label="Form progress">
```

`aria-valuenow` increments with each step (1, 2, 3). This can be used to assert current step.

---

## 3. Entry Point 2: Catalog Deep-Link

### 3.1 URL Structure

From `ProductCard.astro`:
```
/?catalog_sku=USPET-9X6&catalog_category=pet_clamshells#lead-form
```

The `#lead-form` hash does NOT scroll the user to the form (there is no `#lead-form` anchor on the homepage — section ID is `#quote`). This is a potential UX bug but not a test blocker — the URL param is what matters.

### 3.2 Pre-Selection Behavior (CONFIRMED)

The `LeadForm.tsx` `useEffect` reads `catalog_category` from `window.location.search` and calls:
```js
methods.setValue('primary_interest', ['disposables']);
```

**Confirmed in live DOM**: After navigating to `/?catalog_sku=USPET-6X6&catalog_category=pet_clamshells#lead-form` and clicking to Step 2, the "Disposables & Paper Goods" checkbox shows `data-state="checked"` before the user interacts.

The Continue button is immediately enabled because `primary_interest.length > 0` is satisfied.

### 3.3 source_page Construction (CONFIRMED in source)

On submit, `LeadForm.tsx` constructs `source_page` as:
```
/?catalog_sku=USPET-6X6&catalog_category=pet_clamshells
```
(Format: `basePath?catalog_sku=X&catalog_category=Y`)

Verified in `LeadForm.tsx` lines 73–81. The test can assert this via the API response `leadId` (and trust the backend logic, since the API contract tests already cover the DB write).

---

## 4. Selector Reference Card

| Element | Recommended Selector |
|---|---|
| Form section | `page.locator('section#quote')` |
| Form element | `page.locator('form').first()` |
| Progress bar | `page.locator('[role="progressbar"]')` |
| Step 1 heading | `page.getByRole('heading', { name: /What type of business/i })` |
| Business type tile | `page.getByRole('button', { name: /Wholesaler/i })` |
| Expand end-users | `page.getByRole('button', { name: /Restaurant, Food Truck/i })` |
| Step 2 heading | `page.getByRole('heading', { name: /Tell us about your needs/i })` |
| Location count trigger | `page.locator('#location_count')` |
| Location count option | `page.getByRole('option', { name: /1 location/i })` |
| Radix checkbox by label | `page.locator('label:has-text("Disposables") button[role="checkbox"]')` |
| Checkbox state | `.getAttribute('data-state')` → "checked" / "unchecked" |
| Continue button | `page.getByRole('button', { name: /Continue/i })` |
| Back button | `page.getByRole('button', { name: /Back/i })` |
| Step 3 heading | `page.getByRole('heading', { name: /Almost done/i })` |
| Company name | `page.locator('#company_name')` |
| First name | `page.locator('#first_name')` |
| Last name | `page.locator('#last_name')` |
| Email | `page.locator('#email')` |
| Phone | `page.locator('#phone')` |
| Current distributor | `page.locator('#current_distributor')` |
| Submit button | `page.getByRole('button', { name: /Get My Quote/i })` |
| Success state | `page.getByRole('status')` |
| Success heading | `page.getByRole('heading', { name: /Thank You/i })` |
| Error state | `page.getByRole('alert')` |

---

## 5. Workflows Mapped

| # | Workflow | Entry Point | Steps |
|---|---|---|---|
| W1 | Happy path direct submit | Homepage `/` | Step1 click → Step2 select+check → Step3 fill → Submit → Thank You |
| W2 | Catalog deep-link + submit | `/?catalog_sku=X&catalog_category=Y#lead-form` | Step1 click → Step2 (pre-checked) → Step3 fill → Submit → Thank You |
| W3 | Honeypot triggered | Homepage | Step1-3 complete → hidden website field populated → fake success |
| W4 | Invalid email | Homepage | Step1-3 with bad email → API 400 |
| W5 | Missing required field | Homepage | Step2 try Continue without checkbox → button gated |
| W6 | Optional fields stored | Homepage | Step2 timeline + Step3 phone + distributor filled → Submit |
| W7 | Back navigation | Homepage | Step1 → Step2 → Back → Step1 visible |
| W8 | Step2 → Step3 → Back | Homepage | Step2 → Continue → Step3 → Back → Step2 visible |
| W9 | Mobile viewport | Homepage | W1 on 390×844 viewport |
| W10 | Deep-link no category (just sku) | `/?catalog_sku=X#lead-form` | Step2 checkboxes NOT pre-checked |

---

## 6. Open Questions

None. All DOM structure confirmed against live production.

---

## 7. Known Bugs / Observations

- **B1 (UX)**: The catalog CTA links use `#lead-form` as the hash anchor, but the homepage section ID is `#quote`. The hash scroll therefore does not fire on the homepage. The form is still visible after scrolling but users don't get auto-scrolled on direct page load. NOT a test blocker.
- **B2 (Observation)**: `location_count` defaults to `1` in the form state, so the select trigger already shows "1 location". The trigger pre-fill is from form `defaultValues`, not from a user action. Tests don't need to explicitly change it unless testing other values.
