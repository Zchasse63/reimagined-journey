# Branding & Images TODO

Tasks deferred from the site audit to handle after core fixes are complete.

---

## 1. OG Image (Social Sharing)

**Status:** Not created
**Priority:** Medium
**Impact:** Social media link previews (LinkedIn, Facebook, Twitter)

**Requirements:**
- Format: PNG or JPG (not SVG)
- Size: 1200×630px
- Content: Logo + tagline on branded background

**Design Spec:**
- Background: `#22C55E` (brand green) or `#1E293B` (slate-800)
- Center the logo (scaled up)
- Add tagline: "Food Service Distribution" or "Lower Minimums. Better Pricing."
- File location: `/public/images/og-default.jpg`

**Logo SVG for reference:**
```svg
<svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="5" width="40" height="40" rx="8" fill="#22C55E"/>
  <path d="M12 18L18 28L28 14" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="52" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#1E293B">
    Value Source
  </text>
</svg>
```

**Tools to create:**
- Figma, Canva, or similar
- Or use a script to generate PNG from SVG with background

---

## 2. Apple Touch Icon

**Status:** Not created
**Priority:** Low
**Impact:** iOS home screen bookmark icon

**Requirements:**
- Format: PNG
- Size: 180×180px
- Content: Just the green checkmark icon (no text)
- File location: `/public/apple-touch-icon.png`

**Source:** Use the favicon SVG, export as 180×180 PNG

---

## 3. Header Logo Update

**Status:** Pending
**Priority:** Medium
**Impact:** Site branding consistency

**Current:** CSS-based "VS" box + "Value Source" text span
**Target:** SVG logo file

**Header Logo SVG (dark text for white background):**
```svg
<svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="5" width="40" height="40" rx="8" fill="#22C55E"/>
  <path d="M12 18L18 28L28 14" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="52" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#1E293B">
    Value Source
  </text>
</svg>
```

**File to update:** `apps/web/src/components/layout/Header.astro`

**Changes needed:**
1. Save logo SVG to `/public/images/logo.svg`
2. Replace the current logo markup (lines 22-28) with:
   ```astro
   <a href="/" class="flex items-center">
     <img src="/images/logo.svg" alt="Value Source" class="h-10" />
   </a>
   ```

---

## 4. Footer Logo (if applicable)

**Status:** Check if footer has logo
**Priority:** Low

If footer has a logo, update to match header.

---

## 5. Product Images (Future)

**Status:** Not started
**Priority:** Low (site works without them)

When ready, add images for:
- Disposables category
- Proteins category
- Custom print examples

Location: `/public/images/products/`

---

## 6. Hero/Background Images (Future)

**Status:** Not started
**Priority:** Low

Optional enhancement:
- Warehouse photo
- Delivery truck photo
- Food service kitchen photo

Would require design changes to hero sections.

---

## Completed

- [x] Favicon (`/public/favicon.svg`) - Created 2026-01-23

---

## Notes

- Current site uses icon-based design (Lucide icons) which works without photos
- OG image is the most impactful missing item (affects social sharing)
- All other images are nice-to-have enhancements
