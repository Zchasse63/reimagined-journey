# Issues Registry
**Project:** Value Source Food Service Distribution Platform
**Generated:** January 20, 2026

Complete inventory of all issues found during full-stack audit, categorized by severity and area.

---

## Summary Statistics

| Severity | Count | % of Total |
|----------|-------|------------|
| **CRITICAL** | 0 | 0% |
| **HIGH** | 8 | 30% |
| **MEDIUM** | 12 | 44% |
| **LOW** | 7 | 26% |
| **TOTAL** | 27 | 100% |

---

## CRITICAL Issues (Blocking Production)

**No critical blocking issues found.** The application is functional with working API endpoints, environment configuration, and core features operational.

---

## HIGH Priority Issues

### HIGH-001: No Live Market Data APIs
**Severity:** HIGH 🟠
**Category:** API & Data Sources
**Effort:** L (8 hours)

**Description:**
All market data (USDA, EIA, FDA) uses static fallback data. No live API connections implemented.

**Location:**
- `apps/web/src/lib/market-data.ts:19-109` (fallback data)
- `apps/web/src/lib/recalls.ts:33-64` (mock recalls)
- `supabase/functions/market-data/index.ts:810` (edge function exists but not deployed)

**Impact:**
Users see realistic but outdated commodity prices, diesel costs, freight rates. Data never updates without manual code changes.

**Current Workaround:**
Fallback data is production-quality (based on real market values) but static.

**Recommended Fix:**
1. Deploy existing edge function: `supabase functions deploy market-data`
2. Verify API keys in Supabase secrets: `EIA_API_KEY`, `FDA_API_KEY`
3. Update city pages to call edge function instead of static data
4. Implement caching (4-hour TTL) in `api_cache` table

**Dependencies:** Supabase edge function environment setup

---

### HIGH-002: Simulated Historical Charts
**Severity:** HIGH 🟠
**Category:** Data Integrity
**Effort:** S (10 min) OR L (3 hours)

**Description:**
Historical charts display 100% simulated data generated with `Math.random()`. No disclaimer informs users.

**Location:**
- `apps/web/src/components/landing/HistoricalCharts.tsx:28-80` (`generateHistoricalData()` function)
- Used in line 153 with `useMemo`

**Impact:**
Users may make business decisions based on fake trends. Misleading data could harm trust.

**Recommended Fix (Quick):**
Add prominent label:
```tsx
<div className="text-xs text-gray-500 mb-2">
  ⚠️ Illustrative Data – Trends based on market models, not live historical data
</div>
```

**Recommended Fix (Complete):**
Implement real historical data storage:
1. Create scheduled job to snapshot market data daily
2. Store in `market_data_history` table
3. Query last 90 days for chart display
4. Implement per `Docs/DATA_STORAGE_ARCHITECTURE.md`

**Dependencies:** None (quick fix), HIGH-001 (complete fix)

---

### HIGH-003: Future Dates in Fallback Recalls
**Severity:** HIGH 🟠
**Category:** Data Quality
**Effort:** S (5 min)

**Description:**
Mock recall data uses future dates (2025-12-28, 2025-12-22, 2025-12-20). After these dates pass, recalls will show as "X months ago" with stale info.

**Location:**
- `apps/web/src/lib/recalls.ts:40, 50, 60`

**Impact:**
After December 2025, fallback recalls will appear outdated. Users may ignore actual recall warnings.

**Recommended Fix:**
Update dates to recent past:
```typescript
recall_initiation_date: '2026-01-10', // 10 days ago from audit date
recall_initiation_date: '2026-01-05', // 15 days ago
recall_initiation_date: '2025-12-28', // 23 days ago
```

**Dependencies:** None

---

### HIGH-004: No Edge Functions Deployed
**Severity:** HIGH 🟠
**Category:** Deployment
**Effort:** XL (8 hours)

**Description:**
9 edge functions exist in `supabase/functions/` but none are deployed to production.

**Location:**
- `supabase/functions/market-data/index.ts`
- `supabase/functions/recalls/index.ts`
- `supabase/functions/usda-prices/index.ts`
- `supabase/functions/diesel-prices/index.ts`
- `supabase/functions/ppi-data/index.ts`
- `supabase/functions/notify-lead/index.ts`
- `supabase/functions/market-insights/index.ts`

**Impact:**
All API calls fall back to static data. No real-time pricing, recalls, or notifications.

**Recommended Fix:**
```bash
supabase functions deploy market-data
supabase functions deploy recalls
supabase functions deploy usda-prices
supabase functions deploy diesel-prices
supabase functions deploy notify-lead
```

Add API keys to Supabase secrets:
```bash
supabase secrets set EIA_API_KEY=your_key_here
supabase secrets set BLS_API_KEY=your_key_here
supabase secrets set FDA_API_KEY=your_key_here
```

**Dependencies:** Supabase CLI setup, API keys acquired

---

### HIGH-005: No Rate Limiting Implementation
**Severity:** HIGH 🟠
**Category:** Security
**Effort:** M (2 hours)

**Description:**
Form submission endpoints have comment "Rate limiting check (simple IP-based)" at `apps/web/src/pages/api/submit-lead.ts:12` but no actual implementation. Leads table can be flooded with spam.

**Location:**
- `apps/web/src/pages/api/submit-lead.ts:12-13` (comment only, no code)
- `apps/web/src/pages/api/subscribe.ts` (no rate limiting)

**Impact:**
- Bot spam fills database
- Legitimate leads buried in noise
- Potential cost increase (Supabase database size)

**Recommended Fix:**
Option A: Netlify Rate Limiting (paid feature)
Option B: Upstash Redis rate limiting:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 requests per 10 min
});
```

**Dependencies:** Upstash Redis account OR Netlify Pro plan

---

### HIGH-006: Missing CSP Header
**Severity:** HIGH 🟠
**Category:** Security
**Effort:** M (30 min)

**Description:**
No Content-Security-Policy header configured. Scripts from any origin can execute.

**Location:**
- `netlify.toml:15-21` (has basic headers but no CSP)

**Impact:**
Vulnerable to XSS attacks if any user input is rendered without sanitization.

**Recommended Fix:**
Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://*.supabase.co https://api.eia.gov;
      font-src 'self' data:;
      frame-ancestors 'none';
    """
```

**Dependencies:** None

---

### HIGH-007: No HTTPS Redirect
**Severity:** HIGH 🟠
**Category:** Security
**Effort:** S (5 min)

**Description:**
No automatic redirect from HTTP to HTTPS. Site accessible over insecure protocol.

**Location:**
- `netlify.toml` (missing redirect rule)

**Impact:**
Users on HTTP connections send form data (including emails, names) unencrypted.

**Recommended Fix:**
Add to `netlify.toml`:
```toml
[[redirects]]
  from = "http://*"
  to = "https://:splat"
  status = 301
  force = true
```

**Dependencies:** None

---

### HIGH-008: MultiStepLeadForm Schema Mismatch
**Severity:** HIGH 🟠
**Category:** Data Integrity
**Effort:** M (45 min)

**Description:**
MultiStepLeadForm uses different field names than API expects:
- Form: `businessType`, `businessName`, `contactName`, `productInterests`, `estimatedSpend`
- API/Schema: `business_type`, `company_name`, `first_name`+`last_name`, `primary_interest`, (no estimatedSpend)

**Location:**
- `apps/web/src/components/landing/MultiStepLeadForm.tsx:66-77` (form state)
- `apps/web/src/components/forms/lead-form-schema.ts` (API schema)

**Impact:**
MultiStepLeadForm submissions will fail validation or insert with wrong field names when POST to `/api/submit-lead`.

**Recommended Fix:**
Option A: Update MultiStepLeadForm to use database field names
Option B: Add field mapping in API endpoint:
```typescript
const leadData = {
  company_name: body.businessName,
  business_type: body.businessType,
  first_name: body.contactName.split(' ')[0],
  last_name: body.contactName.split(' ').slice(1).join(' '),
  primary_interest: body.productInterests,
  // ... map all fields
};
```

**Dependencies:** None

---

## MEDIUM Priority Issues

### MED-001: No Honeypot in MultiStepLeadForm
**Severity:** MEDIUM 🟡
**Category:** Security
**Effort:** S (15 min)

**Description:**
LeadForm has honeypot field (`website` field that bots fill), but MultiStepLeadForm does not.

**Location:**
- `apps/web/src/components/forms/LeadForm.tsx:37, 47-50` (has honeypot)
- `apps/web/src/components/landing/MultiStepLeadForm.tsx` (missing honeypot)

**Impact:**
Inconsistent bot protection. MultiStepLeadForm more vulnerable to automated submissions.

**Recommended Fix:**
Add hidden field to MultiStepLeadForm:
```tsx
<input
  type="text"
  name="website"
  value={formData.website}
  onChange={(e) => setFormData({...formData, website: e.target.value})}
  className="hidden" // Hidden from real users
  tabIndex={-1}
  autoComplete="off"
/>
```
In submit handler:
```typescript
if (formData.website && formData.website.length > 0) {
  // Bot detected, fake success
  setIsSuccess(true);
  return;
}
```

**Dependencies:** None

---

### MED-002: TypeScript `any` Casting
**Severity:** MEDIUM 🟡
**Category:** Code Quality
**Effort:** S (20 min)

**Description:**
HistoricalCharts.tsx uses `as any` type casting, bypassing type safety.

**Location:**
- `apps/web/src/components/landing/HistoricalCharts.tsx:158`

**Code:**
```typescript
() => calculateTrend(historicalData as any, 'dryVan'),
```

**Impact:**
Runtime errors possible if `historicalData` structure changes.

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
```

**Dependencies:** None

---

### MED-003: Limited ZIP Code Coverage
**Severity:** MEDIUM 🟡
**Category:** UI/UX
**Effort:** M (4 hours)

**Description:**
Freight calculator only maps 68 ZIP code prefixes (out of 99,000+ total ZIP codes).

**Location:**
- `apps/web/src/components/landing/FreightCalculator.tsx:52-68` (ZIP_REGIONS constant)

**Coverage:**
- Georgia (4), Tennessee (3), Alabama (2), North Carolina (3), Florida (4), etc.
- ~0.07% coverage

**Impact:**
Users outside covered regions must manually enter mileage. Degrades UX for 99.93% of ZIP codes.

**Recommended Fix:**
Expand ZIP_REGIONS to cover all 1,000+ 3-digit prefixes:
```typescript
const ZIP_REGIONS = {
  // Full national coverage
  '100': { city: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  '200': { city: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
  // ... 998 more entries
};
```
OR: Integrate Google Maps Distance Matrix API for precise routing.

**Dependencies:** None (static data) OR Google Maps API key (dynamic)

---

### MED-004: No ESLint Configuration
**Severity:** MEDIUM 🟡
**Category:** Code Quality
**Effort:** M (1 hour)

**Description:**
No `.eslintrc` or `eslint.config.*` found in workspace.

**Location:**
- Expected: `apps/web/.eslintrc.json` or root `.eslintrc.json`
- Found: None

**Impact:**
- No enforcement of code style consistency
- Potential bugs not caught (unused vars, missing dependencies)
- Team onboarding harder (no shared standards)

**Recommended Fix:**
Create `apps/web/.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:astro/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": ["warn", { "allow": ["error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off"
  }
}
```
Add to `package.json`:
```json
"scripts": {
  "lint": "eslint src --ext .ts,.tsx,.astro"
}
```

**Dependencies:** Install `eslint`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-astro`

---

### MED-005: No Error Monitoring
**Severity:** MEDIUM 🟡
**Category:** Monitoring
**Effort:** M (1 hour)

**Description:**
No error tracking service configured (Sentry, LogRocket, etc).

**Impact:**
Production errors invisible until users report them. Cannot proactively fix bugs.

**Recommended Fix:**
Install Sentry:
```bash
npm install --save @sentry/astro
```

Add to `astro.config.mjs`:
```javascript
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: 'value-source-platform',
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
    // ... other integrations
  ],
});
```

**Dependencies:** Sentry account, DSN, auth token

---

### MED-006: No Analytics Configured
**Severity:** MEDIUM 🟡
**Category:** Monitoring
**Effort:** S (30 min)

**Description:**
No analytics tracking found (Plausible, Fathom, Google Analytics).

**Impact:**
Cannot measure:
- Traffic sources (which cities drive leads)
- Conversion funnels (form dropoff rates)
- User behavior (calculator usage, page views)

**Recommended Fix:**
Add Plausible Analytics (privacy-focused):
```astro
<!-- apps/web/src/layouts/Layout.astro -->
<head>
  {import.meta.env.PROD && (
    <script defer data-domain="valuesource.com"
            src="https://plausible.io/js/script.js"></script>
  )}
</head>
```

**Dependencies:** Plausible account

---

### MED-007: Unused Parameter in HistoricalCharts
**Severity:** MEDIUM 🟡
**Category:** Code Quality
**Effort:** S (5 min)

**Description:**
Function parameter `fuelSurchargePercent` is declared but never used.

**Location:**
- `apps/web/src/components/landing/HistoricalCharts.tsx:145`

**Code:**
```typescript
function calculateTrend(data: any[], key: string, fuelSurchargePercent?: number) {
  // fuelSurchargePercent never referenced
}
```

**Impact:**
Minor code smell. No runtime impact.

**Recommended Fix:**
Remove unused parameter OR implement fuel surcharge calculation if intended.

**Dependencies:** None

---

### MED-008: No Database Backup Strategy
**Severity:** MEDIUM 🟡
**Category:** Operations
**Effort:** M (2 hours)

**Description:**
No documented backup strategy for Supabase database.

**Impact:**
Risk of data loss (leads, subscriptions) if database corruption or accidental deletion occurs.

**Recommended Fix:**
1. Enable Supabase automatic backups (daily, 7-day retention)
2. Document restoration procedure
3. Test backup restoration quarterly

**Dependencies:** Supabase Pro plan (free tier has limited backups)

---

### MED-009: No Staging Environment
**Severity:** MEDIUM 🟡
**Category:** Deployment
**Effort:** M (3 hours)

**Description:**
No staging/preview environment for testing before production.

**Impact:**
All changes tested directly in production. Higher risk of bugs reaching users.

**Recommended Fix:**
Netlify automatically creates deploy previews for PRs. Configure:
1. Separate Supabase project for staging: `staging-vpgavbsmspcqhzkdbyly.supabase.co`
2. Add staging env vars to Netlify (branch: `develop` or `staging`)
3. Document preview URL pattern: `deploy-preview-{pr-number}--valuesource.netlify.app`

**Dependencies:** None (Netlify feature is free)

---

### MED-010: No API Usage Tracking
**Severity:** MEDIUM 🟡
**Category:** Operations
**Effort:** M (2 hours)

**Description:**
External API calls (USDA, EIA, FDA) have no usage tracking or quota monitoring.

**Impact:**
Risk of exceeding free tier limits without warning. Potential service disruption or unexpected costs.

**Recommended Fix:**
Implement tracking in edge functions:
```typescript
// After each API call
await supabase.from('api_usage').upsert({
  api_source: 'eia_diesel',
  call_date: new Date().toISOString().split('T')[0],
  call_count: 1
}, { onConflict: 'api_source,call_date' });
```

Create monitoring dashboard:
```sql
SELECT api_source, call_date, call_count
FROM api_usage
WHERE call_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY call_date DESC;
```

**Dependencies:** `api_usage` table exists (mentioned in TECH_STACK.md but not in migrations)

---

### MED-011: No Sitemap Verification
**Severity:** MEDIUM 🟡
**Category:** SEO
**Effort:** S (15 min)

**Description:**
Astro sitemap integration configured but not verified that sitemap.xml exists or is submitted to search engines.

**Location:**
- `apps/web/astro.config.mjs:18-20` (sitemap integration)

**Impact:**
Search engines may not discover all 156 city pages. Slower indexing.

**Recommended Fix:**
1. Verify sitemap exists: `curl https://valuesource.com/sitemap-index.xml`
2. Submit to Google Search Console
3. Submit to Bing Webmaster Tools
4. Add sitemap URL to `robots.txt`:
   ```
   Sitemap: https://valuesource.com/sitemap-index.xml
   ```

**Dependencies:** None

---

### MED-012: No Performance Budget
**Severity:** MEDIUM 🟡
**Category:** Performance
**Effort:** M (1 hour)

**Description:**
No performance budget defined or enforced in CI/CD.

**Impact:**
JavaScript bundle can grow unchecked. Risk of regressions (adding heavy libraries, unoptimized images).

**Recommended Fix:**
Add Lighthouse CI:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://deploy-preview-${{ github.event.pull_request.number }}--valuesource.netlify.app
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

Define budget in `lighthouse-budget.json`:
```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "image", "budget": 300 },
      { "resourceType": "total", "budget": 500 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 3000 }
    ]
  }
]
```

**Dependencies:** GitHub Actions

---

## LOW Priority Issues

### LOW-001: No Documentation for Local Setup
**Severity:** LOW 🟢
**Category:** Documentation
**Effort:** M (1 hour)

**Description:**
README.md not found in project root. No onboarding docs for new developers.

**Expected:** `README.md` with setup instructions
**Found:** None at project root (Docs folder has 14 files but no README)

**Impact:**
New developers struggle to:
- Install dependencies
- Set up environment variables
- Run dev server
- Run tests

**Recommended Fix:**
Create `README.md`:
```markdown
# Value Source Platform

## Quick Start
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Start dev server: `npm run dev`
4. Open http://localhost:4321

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run Playwright tests
- `npm run typecheck` - Type check all packages

## Environment Variables
See `.env.example` for required variables.

## Deployment
Deploys automatically to Netlify on push to `main`.
```

**Dependencies:** None

---

### LOW-002: No Contributing Guidelines
**Severity:** LOW 🟢
**Category:** Documentation
**Effort:** M (1 hour)

**Description:**
No `CONTRIBUTING.md` with code style, PR process, or commit conventions.

**Impact:**
Inconsistent contributions, unclear expectations for external contributors.

**Recommended Fix:**
Create `CONTRIBUTING.md` with:
- Code style (Prettier + ESLint when added)
- Branch naming (feature/, fix/, docs/)
- Commit message format (Conventional Commits)
- PR template
- Review process

**Dependencies:** None

---

### LOW-003: No Dependency Update Strategy
**Severity:** LOW 🟢
**Category:** Operations
**Effort:** S (30 min)

**Description:**
No automated dependency updates (Renovate, Dependabot) configured.

**Impact:**
Dependencies become outdated. Security vulnerabilities not detected automatically.

**Recommended Fix:**
Enable Dependabot:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Dependencies:** None (GitHub feature is free)

---

### LOW-004: No Code Ownership
**Severity:** LOW 🟢
**Category:** Operations
**Effort:** S (15 min)

**Description:**
No `CODEOWNERS` file defining who reviews changes to which areas.

**Impact:**
Pull requests not automatically assigned to relevant reviewers.

**Recommended Fix:**
Create `.github/CODEOWNERS`:
```
# Global owners
* @owner-username

# Component owners
/apps/web/src/components/forms/ @forms-team
/apps/web/src/components/landing/ @landing-team
/supabase/ @backend-team

# Config owners
*.toml @devops-team
*.json @devops-team
```

**Dependencies:** None

---

### LOW-005: No License File
**Severity:** LOW 🟢
**Category:** Legal
**Effort:** S (5 min)

**Description:**
No `LICENSE` file specifying code license.

**Impact:**
Legal ambiguity about code usage, distribution, modification rights.

**Recommended Fix:**
Add `LICENSE` file with appropriate license (MIT, Apache 2.0, or proprietary).

**Dependencies:** Legal review

---

### LOW-006: No Security Policy
**Severity:** LOW 🟢
**Category:** Security
**Effort:** S (15 min)

**Description:**
No `SECURITY.md` with vulnerability reporting instructions.

**Impact:**
Security researchers don't know how to responsibly disclose vulnerabilities.

**Recommended Fix:**
Create `.github/SECURITY.md`:
```markdown
# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to security@valuesource.com.

Do not open public issues for security bugs.

We will respond within 48 hours.
```

**Dependencies:** None

---

### LOW-007: No Robots.txt Verification
**Severity:** LOW 🟢
**Category:** SEO
**Effort:** S (5 min)

**Description:**
`robots.txt` assumed to exist but not verified in audit.

**Impact:**
If missing, search engines may crawl unwanted pages (API endpoints, admin).

**Recommended Fix:**
Verify `apps/web/public/robots.txt` exists:
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://valuesource.com/sitemap-index.xml
```

**Dependencies:** None

---

## Issues by Category

### API & Routing (2 issues)
- HIGH-001: No live market data APIs
- HIGH-004: No edge functions deployed

### Security (5 issues)
- HIGH-005: No rate limiting implementation
- HIGH-006: Missing CSP header
- HIGH-007: No HTTPS redirect
- MED-001: No honeypot in MultiStepLeadForm
- LOW-006: No security policy

### Data Quality (4 issues)
- HIGH-002: Simulated historical charts
- HIGH-003: Future dates in recalls
- HIGH-008: MultiStepLeadForm schema mismatch
- MED-010: No API usage tracking

### Code Quality (3 issues)
- MED-002: TypeScript any casting
- MED-004: No ESLint configuration
- MED-007: Unused parameter

### UI/UX (1 issue)
- MED-003: Limited ZIP code coverage

### Monitoring (2 issues)
- MED-005: No error monitoring
- MED-006: No analytics configured

### Documentation (2 issues)
- LOW-001: No local setup docs
- LOW-002: No contributing guidelines

### SEO (2 issues)
- MED-011: No sitemap verification
- LOW-007: No robots.txt verification

### Operations (4 issues)
- MED-008: No database backup strategy
- MED-009: No staging environment
- LOW-003: No dependency updates
- LOW-004: No code ownership

### Performance (1 issue)
- MED-012: No performance budget

### Legal (1 issue)
- LOW-005: No license file

---

## Resolution Summary

**Total Effort Estimation:**
- CRITICAL (0 issues): 0 hours
- HIGH (8 issues): ~22 hours
- MEDIUM (12 issues): ~20 hours
- LOW (7 issues): ~5 hours
- **TOTAL:** ~47 hours

**Production Ready (22 hours):**
- All HIGH issues resolved

**Complete Platform (47 hours):**
- All issues resolved
