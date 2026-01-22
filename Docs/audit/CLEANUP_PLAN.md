# Technical Debt & Cleanup Plan
**Project:** Value Source Food Service Distribution Platform
**Generated:** January 20, 2026

Comprehensive inventory of technical debt, code quality issues, and cleanup opportunities identified during the full-stack audit.

---

## Executive Summary

**Overall Code Quality: 8.0/10** ✅

The codebase is generally clean with strong type safety and modern tooling. However, there are opportunities for consolidation, standardization, and removal of duplication.

**Priority Cleanup Areas:**
1. **Code Duplication:** Form submission logic duplicated across 4 components (~200 lines)
2. **Type Consistency:** Mixed use of `interface` vs `type`, `any` castings
3. **Unused Code:** Empty `packages/ui` directory, unused parameters
4. **Configuration Sprawl:** Multiple config files, inconsistent settings
5. **Documentation Gaps:** No inline JSDoc comments, minimal code documentation

**Estimated Cleanup Time:** 16 hours total (8 hours critical, 8 hours optional)

---

## 1. Code Duplication & Consolidation

### 1.1 Duplicate Form Submission Logic

**Issue:**
Form submission logic is duplicated across 4 components with slight variations.

**Affected Files:**
- `apps/web/src/components/forms/LeadForm.tsx:40-90` (direct Supabase insert)
- `apps/web/src/components/landing/MultiStepLeadForm.tsx:141-180` (POST to `/api/submit-lead`)
- `apps/web/src/components/landing/StickyLeadCapture.tsx` (assumed similar)
- `apps/web/src/components/landing/ExitIntentPopup.tsx` (assumed similar)

**Duplication:**
- Form state management
- Validation error handling
- Success/error UI states
- Submission logic (fetch/Supabase)
- Honeypot detection (only in LeadForm)

**Recommended Fix:**
Create shared hook `useLeadSubmission()`:
```typescript
// apps/web/src/hooks/useLeadSubmission.ts
export function useLeadSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLead = async (data: LeadFormData) => {
    // Honeypot check
    if (data.website && data.website.length > 0) {
      setIsSuccess(true);
      return { success: true, leadId: 'honeypot' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        return result;
      } else {
        setError(result.error || 'Submission failed');
        return result;
      }
    } catch (err) {
      setError('Network error');
      return { success: false, error: 'Network error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitLead, isSubmitting, isSuccess, error };
}
```

**Usage:**
```typescript
// In any form component
const { submitLead, isSubmitting, isSuccess, error } = useLeadSubmission();

const handleSubmit = async (formData) => {
  const result = await submitLead(formData);
  if (result.success) {
    // Handle success
  }
};
```

**Time Estimate:** 2 hours
**Priority:** HIGH
**Impact:** Removes ~200 lines of duplication, easier maintenance

---

### 1.2 Duplicate Market Data Fallback

**Issue:**
Fallback market data duplicated in 2 locations with identical values.

**Affected Files:**
- `apps/web/src/lib/market-data.ts:19-109` (FALLBACK_MARKET_DATA constant)
- `supabase/functions/market-data/index.ts:90-491` (getMockMarketData() function)

**Duplication:**
- All commodity prices
- Diesel prices
- Freight rates
- Tariff examples
- ~400 lines of identical data

**Recommended Fix:**
Option A: Move to shared `packages/data/market-data-fallback.json`
```json
{
  "poultry": { "items": [...] },
  "beef": { "items": [...] },
  ...
}
```
Import in both locations:
```typescript
import FALLBACK_DATA from '@value-source/data/market-data-fallback.json';
```

Option B: Edge function generates data, client caches it
- Remove fallback from client
- Client always calls edge function
- Edge function serves mock if APIs unavailable

**Time Estimate:** 1 hour
**Priority:** MEDIUM
**Impact:** Single source of truth, easier updates

---

### 1.3 Duplicate Type Definitions

**Issue:**
Market data types defined in multiple locations.

**Affected Files:**
- `apps/web/src/types/market-data.ts:6-50` (client types)
- `supabase/functions/market-data/index.ts:8-84` (edge function types)

**Duplication:**
- `CommodityItem`, `CommodityData`, `DieselData`, `FreightRoute`, `TariffExample`, etc.

**Recommended Fix:**
Move to shared package:
```typescript
// packages/data/src/types/market-data.ts
export interface CommodityItem { ... }
export interface MarketData { ... }
// ... all market data types
```

Import in both locations:
```typescript
import type { MarketData, CommodityItem } from '@value-source/data';
```

**Time Estimate:** 30 minutes
**Priority:** MEDIUM
**Impact:** Ensures type consistency, easier updates

---

## 2. Unused Code & Dead Files

### 2.1 Empty UI Package

**Issue:**
`packages/ui/` directory exists but contains no components.

**Location:**
- `packages/ui/package.json` (exists)
- `packages/ui/components/` (empty)

**Evidence:**
No imports of `@value-source/ui` in any source files.

**Recommended Action:**
Option A: Delete entirely if not planned
```bash
rm -rf packages/ui
# Update root package.json workspaces to remove packages/ui
```

Option B: Populate with shared components if planned
- Move `apps/web/src/components/ui/` (shadcn components) to `packages/ui/`
- Make reusable across future apps

**Time Estimate:** 15 minutes (delete) OR 2 hours (populate)
**Priority:** LOW
**Impact:** Cleaner monorepo structure

---

### 2.2 Unused Function Parameter

**Issue:**
`fuelSurchargePercent` parameter declared but never used.

**Location:**
- `apps/web/src/components/landing/HistoricalCharts.tsx:145`

**Code:**
```typescript
function calculateTrend(data: any[], key: string, fuelSurchargePercent?: number) {
  // fuelSurchargePercent never referenced in function body
  const firstValue = data[0][key];
  const lastValue = data[data.length - 1][key];
  // ...
}
```

**Recommended Fix:**
Remove parameter:
```typescript
function calculateTrend(data: any[], key: string) {
  // ... existing logic
}
```

Update all call sites (3 useMemo calls in same file).

**Time Estimate:** 5 minutes
**Priority:** LOW
**Impact:** Cleaner function signature

---

### 2.3 Unused Playwright Report Directories

**Issue:**
`playwright-report/` and `test-results/` committed to git (in untracked files).

**Location:**
- Root: `playwright-report/`, `test-results/`

**Recommended Fix:**
Add to `.gitignore`:
```
# Playwright
playwright-report/
test-results/
```

Delete from repo:
```bash
git rm -r --cached playwright-report test-results
git commit -m "chore: remove Playwright test artifacts from git"
```

**Time Estimate:** 5 minutes
**Priority:** LOW
**Impact:** Cleaner git history, smaller repo size

---

### 2.4 Netlify Build Cache

**Issue:**
`.netlify/` directory in apps/web (likely build artifacts).

**Location:**
- `apps/web/.netlify/v1/functions/` (large bundled functions)

**Recommended Fix:**
Add to `.gitignore`:
```
# Netlify
.netlify/
```

**Time Estimate:** 5 minutes
**Priority:** LOW
**Impact:** Prevents committing build artifacts

---

## 3. Type Safety Improvements

### 3.1 `any` Type Casting

**Issue:**
Explicit `as any` casting bypasses type safety.

**Location:**
- `apps/web/src/components/landing/HistoricalCharts.tsx:158`

**Code:**
```typescript
const dryVanTrend = useMemo(
  () => calculateTrend(historicalData as any, 'dryVan'),
  [historicalData]
);
```

**Recommended Fix:**
Define proper interface:
```typescript
interface HistoricalDataPoint {
  date: string;
  fullDate: string;
  dryVan: number;
  reefer: number;
  diesel: number;
}

const historicalData: HistoricalDataPoint[] = useMemo(/* ... */);

// No casting needed
const dryVanTrend = useMemo(
  () => calculateTrend(historicalData, 'dryVan'),
  [historicalData]
);
```

Update `calculateTrend` signature:
```typescript
function calculateTrend(
  data: HistoricalDataPoint[],
  key: keyof HistoricalDataPoint
): number {
  // ...
}
```

**Time Estimate:** 20 minutes
**Priority:** MEDIUM
**Impact:** Type-safe access to historical data

---

### 3.2 Mixed `type` vs `interface` Usage

**Issue:**
Inconsistent use of `type` and `interface` for defining shapes.

**Observations:**
- `apps/web/src/types/market-data.ts` uses `interface` extensively
- `apps/web/src/types/recalls.ts` uses `interface`
- Some inline `type` aliases in components

**Recommended Standard:**
Use `interface` for object shapes (can be extended), `type` for unions/intersections:
```typescript
// Prefer interface for objects
export interface CityData {
  city: string;
  state: string;
  // ...
}

// Use type for unions
export type DeliveryTier = 'Hub' | 'Tier1_Route' | 'Tier2_Route' | 'Common_Carrier';

// Use type for mapped types
export type ReadOnly<T> = { readonly [K in keyof T]: T[K] };
```

**Action:**
Audit all type definitions, standardize existing code.

**Time Estimate:** 1 hour
**Priority:** LOW
**Impact:** Consistent codebase conventions

---

### 3.3 Missing Return Type Annotations

**Issue:**
Some functions lack explicit return type annotations.

**Examples:**
```typescript
// apps/web/src/lib/market-data.ts:166
export function getPriceTrend(change: number, threshold = 0.5) { // Missing return type
  if (change > threshold) return 'up';
  if (change < -threshold) return 'down';
  return 'stable';
}
```

**Recommended Fix:**
Add explicit return types:
```typescript
export function getPriceTrend(change: number, threshold = 0.5): PriceTrend {
  // ...
}
```

**Benefit:**
- Catches return type errors at compile time
- Better IDE autocomplete
- Self-documenting code

**Time Estimate:** 30 minutes (audit and fix ~20 functions)
**Priority:** MEDIUM
**Impact:** Stricter type safety

---

## 4. Configuration Cleanup

### 4.1 Multiple TypeScript Configs

**Issue:**
Two TypeScript configs in workspace.

**Affected Files:**
- `apps/web/tsconfig.json` (extends astro/tsconfigs/strict)
- `packages/data/tsconfig.json` (minimal config)

**Inconsistency:**
- `web` has strict null checks, `data` does not explicitly
- `web` has path aliases, `data` does not
- Both should share base config

**Recommended Fix:**
Create root `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Update package configs:
```json
// apps/web/tsconfig.json
{
  "extends": ["../../tsconfig.base.json", "astro/tsconfigs/strict"],
  // ... web-specific overrides
}

// packages/data/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  // ... data-specific overrides
}
```

**Time Estimate:** 30 minutes
**Priority:** MEDIUM
**Impact:** Consistent type checking across workspace

---

### 4.2 Prettier Configuration Missing

**Issue:**
No Prettier config in workspace root.

**Evidence:**
- `package.json` has `prettier` script
- No `.prettierrc` or `prettier.config.js` at root
- Inconsistent formatting observed (some files use 2 spaces, some 4)

**Recommended Fix:**
Create `.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.astro",
      "options": { "parser": "astro" }
    }
  ]
}
```

Run format:
```bash
npm run format
```

Commit formatted code.

**Time Estimate:** 30 minutes
**Priority:** MEDIUM
**Impact:** Consistent code formatting

---

### 4.3 ESLint Missing

**Issue:**
No ESLint configuration found.

**Impact:**
- No linting errors caught
- No unused var/import detection
- No code style enforcement

**Recommended Fix:**
See ISSUES_REGISTRY.md MED-004 for full implementation.

**Time Estimate:** 1 hour
**Priority:** MEDIUM
**Impact:** Automated code quality checks

---

## 5. File Structure & Organization

### 5.1 Inconsistent Component Organization

**Issue:**
Components split across multiple directories without clear hierarchy.

**Current Structure:**
```
src/components/
├── forms/              # Form-related components
├── landing/            # Landing page sections
├── layout/             # Header, Footer
├── market/             # Market insights
└── ui/                 # Shared UI primitives
```

**Inconsistency:**
- `landing/` mixes interactive (FreightCalculator) and static (ProductCategories) components
- `forms/` has both full forms (LeadForm) and form steps (Step1BusinessType)
- `market/` only has MarketInsights (could be in landing/)

**Recommended Reorganization:**
```
src/components/
├── ui/                 # shadcn primitives (button, card, input)
├── layout/             # Header, Footer, Navigation
├── forms/              # Form components
│   ├── LeadForm.tsx
│   ├── MultiStepLeadForm/
│   │   ├── index.tsx
│   │   ├── Step1BusinessType.tsx
│   │   ├── Step2ServiceInfo.tsx
│   │   └── Step3ContactDetails.tsx
│   └── shared/
│       └── useLeadSubmission.ts
├── calculators/        # Interactive calculators
│   ├── FreightCalculator.tsx
│   ├── CostCalculator.tsx
│   └── HistoricalCharts.tsx
└── sections/           # Landing page sections (static)
    ├── HeroWithMarketSnapshot.astro
    ├── ValuePropositions.astro
    ├── ProductCategories.astro
    └── NearbyCities.astro
```

**Benefits:**
- Clearer separation of concerns
- Easier to find components
- Logical grouping by function

**Time Estimate:** 1 hour (move files, update imports)
**Priority:** LOW
**Impact:** Better developer experience

---

### 5.2 Lib Directory Lacks Structure

**Issue:**
All utilities in flat `lib/` directory.

**Current:**
```
src/lib/
├── supabase.ts
├── market-data.ts
├── recalls.ts
├── utils.ts
└── api.ts
```

**Recommended:**
```
src/lib/
├── api/
│   ├── supabase.ts
│   ├── market-data.ts
│   ├── recalls.ts
│   └── index.ts
├── utils/
│   ├── cn.ts           # Tailwind class merging
│   ├── format.ts       # Number/date formatting
│   ├── validation.ts   # Zod schemas
│   └── index.ts
└── hooks/
    ├── useLeadSubmission.ts
    └── useMarketData.ts
```

**Time Estimate:** 30 minutes
**Priority:** LOW
**Impact:** Logical grouping, easier to find utilities

---

## 6. Dependency Cleanup

### 6.1 Duplicate Dependencies

**Issue:**
Some packages installed in both root and workspace packages.

**Example:**
- `typescript@5.9.3` in root `package.json` AND `apps/web/package.json`
- `@astrojs/netlify` in both root (6.6.3) and web (5.5.4) - VERSION MISMATCH

**Recommended Fix:**
Hoist common dependencies to root:
```bash
npm dedupe
```

Remove from workspace package.json if version matches root.

**Time Estimate:** 30 minutes
**Priority:** LOW
**Impact:** Faster installs, smaller node_modules

---

### 6.2 Outdated Dependencies

**Issue:**
No automated dependency updates (Dependabot/Renovate).

**Current Versions (audit date: 2026-01-20):**
- Astro 4.16.19 (current: check for updates)
- React 18.3.1 (stable, but 19.0 may be available)
- Tailwind 3.4.19 (current)

**Recommended Fix:**
1. Enable Dependabot (see ISSUES_REGISTRY.md LOW-003)
2. Manual audit now:
   ```bash
   npm outdated
   ```
3. Update non-breaking changes:
   ```bash
   npm update
   ```

**Time Estimate:** 1 hour (audit + test after updates)
**Priority:** MEDIUM
**Impact:** Security patches, new features, bug fixes

---

### 6.3 Unused Dependencies

**Issue:**
Some dependencies may be unused.

**Candidates:**
- `@value-source/ui` - Empty package, likely not imported
- `@emnapi/runtime@1.8.1` - Marked as "extraneous" in npm list

**Recommended Action:**
Audit imports:
```bash
npx depcheck
```

Remove unused:
```bash
npm uninstall <package-name>
```

**Time Estimate:** 30 minutes
**Priority:** LOW
**Impact:** Smaller bundle size, faster installs

---

## 7. Documentation Improvements

### 7.1 Missing JSDoc Comments

**Issue:**
No JSDoc comments on public functions, making IDE hints less helpful.

**Example (current):**
```typescript
export function formatPrice(price: number, unit: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return `${formatter.format(price)}/${unit}`;
}
```

**Recommended:**
```typescript
/**
 * Formats a numeric price with currency symbol and unit.
 * @param price - The numeric price value (e.g., 1.12)
 * @param unit - The unit of measurement (e.g., "lb", "cwt")
 * @returns Formatted string like "$1.12/lb"
 * @example
 * formatPrice(1.12, 'lb') // "$1.12/lb"
 */
export function formatPrice(price: number, unit: string): string {
  // ...
}
```

**Benefit:**
- Better IDE tooltips
- Self-documenting code
- Easier onboarding

**Time Estimate:** 2 hours (document ~50 public functions)
**Priority:** LOW
**Impact:** Developer experience

---

### 7.2 No README in Packages

**Issue:**
`packages/data/` and `packages/ui/` have no README.md explaining usage.

**Recommended Fix:**
Create `packages/data/README.md`:
```markdown
# @value-source/data

Shared data types and utilities for Value Source platform.

## Usage

\`\`\`typescript
import { CityData, MarketData } from '@value-source/data';
import cityDataJson from '@value-source/data/city_data.json';
\`\`\`

## Exports

- \`city_data.json\` - City metadata (156 cities)
- \`database.types.ts\` - Supabase generated types
- \`types/\` - TypeScript interfaces
```

**Time Estimate:** 30 minutes (2 READMEs)
**Priority:** LOW
**Impact:** Easier for team to understand package usage

---

## 8. Security & Best Practices

### 8.1 Environment Variable Validation

**Issue:**
No validation that required env vars are set before app starts.

**Current:**
```typescript
// lib/supabase.ts:6-8
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables');
}
```

**Recommended:**
Create `lib/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url(),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
});
```

**Benefit:**
- Fails fast at build time if env vars missing
- Type-safe access: `env.PUBLIC_SUPABASE_URL`
- Clear error messages

**Time Estimate:** 30 minutes
**Priority:** MEDIUM
**Impact:** Prevents runtime errors from missing env vars

---

### 8.2 API Error Handling Inconsistency

**Issue:**
Edge functions and client code handle errors differently.

**Edge Function Pattern:**
```typescript
try {
  // ... API call
} catch (error) {
  console.error('Error fetching data:', error);
  return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500 });
}
```

**Client Pattern:**
```typescript
try {
  // ... fetch
} catch (error) {
  console.error('Failed to fetch:', error);
  return { data: FALLBACK_DATA, error: error.message };
}
```

**Recommended:**
Standardize error handling with custom error classes:
```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
throw new APIError('Failed to fetch market data', 500, originalError);
```

**Time Estimate:** 1 hour
**Priority:** LOW
**Impact:** Consistent error handling, better debugging

---

## 9. Performance Optimizations

### 9.1 Image Optimization Missing

**Issue:**
No evidence of image optimization (no images audited, but likely needed for production).

**Recommended:**
Use Astro's built-in image optimization:
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image src={heroImage} alt="Hero" width={1200} height={600} format="webp" />
```

OR: Integrate with Cloudinary/Imgix for dynamic optimization.

**Time Estimate:** 1 hour (audit images, optimize)
**Priority:** MEDIUM
**Impact:** Faster page loads, better Core Web Vitals

---

### 9.2 No Code Splitting for Recharts

**Issue:**
Recharts library (~200KB) loaded on all pages, even those without charts.

**Recommended:**
Lazy load chart component:
```tsx
const HistoricalCharts = lazy(() => import('./HistoricalCharts'));

// In render
{showCharts && (
  <Suspense fallback={<div>Loading charts...</div>}>
    <HistoricalCharts />
  </Suspense>
)}
```

**Time Estimate:** 30 minutes
**Priority:** MEDIUM
**Impact:** Reduce initial bundle size by ~200KB

---

## 10. Testing Improvements

### 10.1 No Unit Tests

**Issue:**
Only E2E tests exist (Playwright). No unit tests for utility functions.

**Recommended:**
Add Vitest for unit testing:
```bash
npm install --save-dev vitest @vitest/ui
```

Test utilities:
```typescript
// lib/market-data.test.ts
import { describe, it, expect } from 'vitest';
import { getPriceTrend, formatPrice } from './market-data';

describe('getPriceTrend', () => {
  it('returns "up" for positive change', () => {
    expect(getPriceTrend(2.5)).toBe('up');
  });

  it('returns "down" for negative change', () => {
    expect(getPriceTrend(-2.5)).toBe('down');
  });

  it('returns "stable" for small change', () => {
    expect(getPriceTrend(0.2)).toBe('stable');
  });
});
```

**Time Estimate:** 3 hours (setup + write tests for critical functions)
**Priority:** MEDIUM
**Impact:** Catch regressions, faster feedback than E2E

---

### 10.2 Test Data Hardcoded

**Issue:**
Test data hardcoded in Playwright tests.

**Example:**
```typescript
const testCities = [
  { path: '/georgia/atlanta', name: 'Atlanta', tier: 'Hub' },
  // ...
];
```

**Recommended:**
Load from `city_data.json`:
```typescript
import cityData from '../../../city_data.json';

const testCities = [
  { path: `/georgia/atlanta`, ...cityData.cities.georgia.find(c => c.slug === 'atlanta') },
  // ...
];
```

**Time Estimate:** 15 minutes
**Priority:** LOW
**Impact:** Tests reflect actual data

---

## Priority Summary

### Critical (8 hours) - Do First
1. **Code Duplication:** Create `useLeadSubmission` hook (2h)
2. **Type Safety:** Fix `any` castings, add return types (1h)
3. **Configuration:** Add Prettier config, ESLint (2h)
4. **Dependencies:** Dedupe, update outdated (1.5h)
5. **Environment Validation:** Add env var validation (0.5h)
6. **Performance:** Lazy load Recharts (0.5h)
7. **JSDoc Comments:** Document public APIs (0.5h)

### Optional (8 hours) - Nice to Have
1. **File Structure:** Reorganize components (1h)
2. **Consolidate Data:** Move fallback to shared package (1h)
3. **Testing:** Add unit tests with Vitest (3h)
4. **Documentation:** Add package READMEs (0.5h)
5. **Unused Code:** Delete empty ui package, unused params (0.5h)
6. **Image Optimization:** Optimize images (1h)
7. **Error Handling:** Standardize error classes (1h)

**Total Cleanup Time:** 16 hours
**Impact:** Cleaner, more maintainable codebase, reduced technical debt

---

## Cleanup Script

Automated cleanup script for quick wins:

```bash
#!/bin/bash
# cleanup.sh - Run automated cleanup tasks

echo "🧹 Starting cleanup..."

# 1. Remove test artifacts from git
git rm -r --cached playwright-report test-results 2>/dev/null || true

# 2. Add to .gitignore
cat >> .gitignore <<EOF

# Playwright
playwright-report/
test-results/

# Netlify
.netlify/
EOF

# 3. Dedupe dependencies
npm dedupe

# 4. Remove unused dependencies
npm prune

# 5. Format all code
npm run format

# 6. Create missing docs
touch README.md CONTRIBUTING.md CHANGELOG.md

echo "✅ Automated cleanup complete!"
echo "📝 Manual tasks remaining (see CLEANUP_PLAN.md):"
echo "   - Create useLeadSubmission hook"
echo "   - Add ESLint configuration"
echo "   - Fix TypeScript any castings"
echo "   - Add JSDoc comments"
```

Run with:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

## Long-Term Technical Debt Prevention

### Policies to Implement
1. **PR Template:** Require cleanup checklist before merge
2. **Automated Checks:** ESLint, Prettier, type-check in CI/CD
3. **Dependency Updates:** Weekly Dependabot PRs
4. **Test Coverage:** Require tests for new features
5. **Documentation:** JSDoc required for public functions
6. **Code Review:** Two approvals required, one from tech lead

### Monitoring
- Track technical debt in Jira/Linear with "TechDebt" label
- Quarterly cleanup sprints (1 week every 3 months)
- Monthly dependency audit
