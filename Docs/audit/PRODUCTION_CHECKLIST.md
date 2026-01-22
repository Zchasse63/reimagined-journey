# Production Readiness Checklist
**Project:** Value Source Food Service Distribution Platform
**Generated:** January 20, 2026
**Overall Status:** ❌ **NOT PRODUCTION READY** (42/100 score)

---

## Quick Status Dashboard

| Category | Status | Blockers | Priority Actions |
|----------|--------|----------|------------------|
| **Critical Blockers** | ❌ 5/5 issues | API endpoints, env vars, placeholders | Fix all (4 hours) |
| **API & Data** | 🟡 Partial | Mock data, no edge functions | Deploy functions (8 hours) |
| **Security** | 🟡 Needs work | CSP, rate limiting, HTTPS | Harden (3 hours) |
| **Testing** | 🟡 Minimal | No E2E runs, no device testing | Expand coverage (4 hours) |
| **Monitoring** | ❌ None | No error tracking, no analytics | Set up Sentry + Plausible (2 hours) |
| **Documentation** | 🟡 Partial | No README, no CONTRIBUTING | Write docs (2 hours) |

**Time to Launch:** 4 hours (MVP) | 26 hours (Full Production)

---

## Pre-Launch: CRITICAL BLOCKERS (MUST FIX)

### 🔴 BLOCKING ISSUES - DO NOT LAUNCH UNTIL COMPLETE

#### 1. Environment Configuration ⚠️
- [ ] **Add `PUBLIC_SUPABASE_ANON_KEY` to `.env.local`**
  - Location: `.env.example:2` (currently empty)
  - Get key from: Supabase Dashboard → Settings → API → anon/public key
  - Test: Run app, verify no "Missing Supabase environment variables" error
  - Time: 5 minutes
  - **Owner:** DevOps/Backend

- [ ] **Add `SUPABASE_SECRET_KEY` to `.env.local`** (for API routes)
  - Get key from: Supabase Dashboard → Settings → API → service_role key
  - Required for: server-side operations in API endpoints
  - Time: 5 minutes
  - **Owner:** DevOps/Backend

- [ ] **Set environment variables in Netlify**
  - Go to: Netlify Dashboard → Site → Site Settings → Environment Variables
  - Add: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`
  - Verify: No "undefined" values in production builds
  - Time: 10 minutes
  - **Owner:** DevOps

#### 2. API Endpoints 🚨
- [ ] **Create `/api/submit-lead` endpoint**
  - File: `apps/web/src/pages/api/submit-lead.ts`
  - Must: Validate with Zod, insert to `leads` table, return `{ success, leadId, error }`
  - Test: Submit from MultiStepLeadForm, verify data in Supabase
  - Time: 60 minutes
  - **Owner:** Backend
  - **Depends on:** Environment variables set

- [ ] **Create `/api/subscribe` endpoint**
  - File: `apps/web/src/pages/api/subscribe.ts`
  - Must: Validate email, insert to `email_subscriptions` table
  - Test: Submit email, verify in Supabase
  - Time: 30 minutes
  - **Owner:** Backend
  - **Depends on:** Environment variables set, `email_subscriptions` table exists

- [ ] **Test all 4 lead capture forms**
  - Forms: LeadForm, MultiStepLeadForm, StickyLeadCapture, ExitIntentPopup
  - Verify: Each form submits successfully, data reaches database
  - Check: No 404 errors, success messages display
  - Time: 30 minutes
  - **Owner:** QA/Frontend
  - **Depends on:** API endpoints created

#### 3. Contact Information ☎️
- [ ] **Replace ALL placeholder phone numbers**
  - Files: `LeadForm.tsx:101`, `MultiStepLeadForm.tsx:196`, Header, Footer
  - Search: `grep -r "(XXX) XXX-XXXX" apps/web/src`
  - Replace: With company phone (e.g., `(404) 555-1234`)
  - Update: Both display text AND `tel:` links
  - Test: Click "Call Us" links on mobile, verify dial screen opens
  - Time: 15 minutes
  - **Owner:** Frontend

- [ ] **Add real company contact info**
  - Verify: Company email, phone, address are correct
  - Check: Footer contact section, Header, About page
  - Time: 10 minutes
  - **Owner:** Content/Marketing

#### 4. Data Quality ⚠️
- [ ] **Fix form schema mismatch**
  - Issue: MultiStepLeadForm uses `businessType`, DB expects `business_type`
  - Option A: Update form field names to match DB
  - Option B: Map fields in API endpoint
  - Test: Submit from MultiStepLeadForm, verify correct fields in DB
  - Time: 45 minutes
  - **Owner:** Backend/Frontend
  - **Depends on:** API endpoints created

- [ ] **Update fallback recall dates**
  - File: `apps/web/src/lib/recalls.ts:40, 50, 60`
  - Change: Future dates (2025-12-XX) to recent past (2026-01-XX)
  - Reason: Prevents stale "X months ago" after dates pass
  - Time: 5 minutes
  - **Owner:** Backend

#### 5. Database Verification ✅
- [ ] **Verify `leads` table exists in production Supabase**
  - Check: Supabase Dashboard → Table Editor → leads
  - Verify: All columns match migration 001_leads.sql
  - Check: RLS policies enabled (anon INSERT, authenticated SELECT)
  - Time: 10 minutes
  - **Owner:** Backend/DevOps

- [ ] **Verify `email_subscriptions` table exists**
  - Check: Supabase Dashboard → Table Editor → email_subscriptions
  - Verify: Matches migration 006_market_data_and_subscriptions.sql
  - Check: RLS policies enabled (anon INSERT, authenticated SELECT)
  - Time: 10 minutes
  - **Owner:** Backend/DevOps

---

## Pre-Launch: HIGH PRIORITY (Launch Week)

### 📊 Data & APIs

- [ ] **Add "Illustrative Data" disclaimer to historical charts**
  - File: `apps/web/src/components/landing/HistoricalCharts.tsx`
  - Add: Visible label warning data is simulated
  - Placement: Above chart area
  - Time: 10 minutes
  - **Owner:** Frontend

- [ ] **Deploy market-data edge function**
  - Command: `supabase functions deploy market-data`
  - Verify: Function accessible at `{SUPABASE_URL}/functions/v1/market-data`
  - Test: Fetch data, verify returns commodity prices
  - Time: 30 minutes
  - **Owner:** Backend
  - **Depends on:** Supabase CLI installed, API keys in secrets

- [ ] **Deploy recalls edge function**
  - Command: `supabase functions deploy recalls`
  - Verify: Returns FDA recall data (or fallback)
  - Time: 20 minutes
  - **Owner:** Backend

- [ ] **Add API keys to Supabase secrets** (optional for MVP, required for real data)
  - Keys: `EIA_API_KEY`, `BLS_API_KEY`, `FDA_API_KEY`
  - Command: `supabase secrets set EIA_API_KEY=your_key`
  - Verify: Edge functions can access secrets
  - Time: 20 minutes
  - **Owner:** DevOps

- [ ] **Verify SSR configuration for city pages**
  - Check: `apps/web/src/pages/[state]/[city].astro` has `export const prerender = false`
  - Reason: Ensures fresh data fetched per request, not build-time
  - OR: Accept static data and schedule rebuilds
  - Time: 10 minutes
  - **Owner:** Backend

### 🔒 Security Hardening

- [ ] **Add Content-Security-Policy header**
  - File: `netlify.toml`
  - Add: CSP restricting script sources
  - Test: Verify no console errors about blocked scripts
  - Time: 30 minutes
  - **Owner:** DevOps

- [ ] **Add HTTPS redirect**
  - File: `netlify.toml`
  - Add: Redirect from HTTP to HTTPS (301)
  - Test: Visit `http://valuesource.com`, verify redirects to HTTPS
  - Time: 5 minutes
  - **Owner:** DevOps

- [ ] **Implement rate limiting** (optional for MVP)
  - Location: API endpoints (`submit-lead.ts`, `subscribe.ts`)
  - Method: Upstash Redis OR Netlify Rate Limiting (paid)
  - Limit: 5 submissions per 10 minutes per IP
  - Time: 2 hours
  - **Owner:** Backend

### 🧪 Testing & Quality Assurance

- [ ] **Run Playwright E2E tests**
  - Command: `npm run test`
  - Verify: All tests pass (landing page, calculator, forms)
  - Fix: Any failing tests before launch
  - Time: 30 minutes
  - **Owner:** QA

- [ ] **Test lead submission end-to-end**
  - Steps: Fill form → submit → verify in Supabase → check Netlify function logs
  - Test: All 4 forms (LeadForm, MultiStep, Sticky, ExitIntent)
  - Check: Success messages, error handling, validation
  - Time: 45 minutes
  - **Owner:** QA

- [ ] **Test on mobile devices**
  - Devices: iPhone (Safari), Android (Chrome), iPad
  - Check: Forms usable, calculators functional, touch targets adequate
  - Fix: Any layout issues
  - Time: 1 hour
  - **Owner:** QA/Frontend

- [ ] **Run Lighthouse audit**
  - URL: Deploy preview URL or staging
  - Target: Performance >85, Accessibility >90, SEO >90
  - Fix: Any critical issues found
  - Time: 30 minutes
  - **Owner:** Frontend

- [ ] **Cross-browser testing**
  - Browsers: Chrome, Firefox, Safari, Edge
  - Check: Forms submit, calculators work, styling consistent
  - Time: 30 minutes
  - **Owner:** QA

### 📈 Monitoring & Analytics

- [ ] **Set up Sentry error tracking**
  - Install: `@sentry/astro`
  - Configure: `astro.config.mjs` with DSN
  - Test: Trigger error, verify appears in Sentry dashboard
  - Time: 1 hour
  - **Owner:** DevOps

- [ ] **Add Plausible Analytics** (or alternative)
  - Add: Script tag to Layout.astro
  - Verify: Events tracked in Plausible dashboard
  - Time: 30 minutes
  - **Owner:** Marketing/DevOps

- [ ] **Configure Netlify Analytics**
  - Enable: Netlify Dashboard → Analytics
  - Check: Page views, traffic sources tracked
  - Time: 10 minutes
  - **Owner:** DevOps

---

## Post-Launch: WEEK 1

### 🔍 Monitoring & Validation

- [ ] **Monitor error rates (Day 1)**
  - Check: Sentry dashboard every 4 hours
  - Target: Error rate < 1%
  - Action: Fix any critical errors immediately
  - **Owner:** Backend

- [ ] **Verify lead submissions working (Day 1)**
  - Query: `SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '1 day'`
  - Check: At least 1 lead submitted successfully
  - Verify: Data quality (no null values, correct schema)
  - **Owner:** Backend

- [ ] **Check Netlify function logs (Day 1-3)**
  - Location: Netlify Dashboard → Functions
  - Look for: 500 errors, timeouts, high response times
  - Fix: Any recurring errors
  - **Owner:** Backend

- [ ] **Monitor traffic sources (Week 1)**
  - Check: Plausible or Netlify Analytics
  - Track: Which cities drive most traffic/leads
  - Action: Optimize high-traffic pages
  - **Owner:** Marketing

- [ ] **Test form submission rate (Week 1)**
  - Metric: Form starts vs completions
  - Target: >30% completion rate
  - Action: Optimize dropoff points if below target
  - **Owner:** Product/Frontend

### 📊 Data Quality

- [ ] **Verify market data freshness**
  - Check: Timestamps in market data responses
  - Verify: Data updated within last 4 hours (if edge functions deployed)
  - Action: Debug caching if stale
  - **Owner:** Backend

- [ ] **Review lead quality (First 10 leads)**
  - Check: Names, emails, business types look legitimate
  - Identify: Bot submissions (honeypot effectiveness)
  - Action: Adjust validation if needed
  - **Owner:** Sales/Backend

### 🔧 Improvements

- [ ] **Implement remaining edge functions**
  - Functions: `usda-prices`, `diesel-prices`, `notify-lead`
  - Priority: notify-lead (for real-time Slack/email alerts)
  - Time: 4 hours
  - **Owner:** Backend

- [ ] **Set up database backups**
  - Enable: Supabase automatic backups (daily)
  - Test: Restore from backup to verify process
  - Document: Restoration procedure
  - **Owner:** DevOps

- [ ] **Create staging environment**
  - Set up: Separate Supabase project for staging
  - Configure: Staging env vars in Netlify
  - Test: Deploy to staging before production
  - **Owner:** DevOps

---

## Post-Launch: MONTH 1

### 🚀 Feature Completion

- [ ] **Implement historical data storage**
  - Migrate: Docs/DATA_STORAGE_ARCHITECTURE.md schema
  - Set up: Daily snapshots of market data
  - Update: HistoricalCharts to use real data
  - Time: 8 hours
  - **Owner:** Backend

- [ ] **Expand ZIP code coverage**
  - Increase: From 68 to 1,000+ ZIP prefixes
  - Source: USPS ZIP code database
  - Update: FreightCalculator.tsx ZIP_REGIONS
  - Time: 4 hours
  - **Owner:** Backend

- [ ] **Add honeypot fields to all forms**
  - Update: MultiStepLeadForm, StickyLeadCapture, ExitIntentPopup
  - Match: LeadForm honeypot implementation
  - Test: Bot detection works
  - Time: 30 minutes
  - **Owner:** Frontend

### 🔒 Security & Performance

- [ ] **Implement rate limiting**
  - Method: Upstash Redis OR Netlify Rate Limiting
  - Apply to: All API endpoints
  - Limits: 5 submissions/10min, 100 requests/hour per IP
  - Time: 2 hours
  - **Owner:** Backend

- [ ] **Run comprehensive security audit**
  - Tools: OWASP ZAP, Snyk (dependency vulnerabilities)
  - Check: XSS, SQL injection, CSRF risks
  - Fix: Any critical vulnerabilities
  - Time: 4 hours
  - **Owner:** Security/Backend

- [ ] **Optimize bundle size**
  - Analyze: Build output, identify heavy dependencies
  - Target: Total JS < 200KB
  - Actions: Code splitting, lazy loading, remove unused deps
  - Time: 3 hours
  - **Owner:** Frontend

### 📚 Documentation

- [ ] **Write README.md**
  - Sections: Setup, Scripts, Deployment, Contributing
  - Include: Environment variables list
  - Time: 1 hour
  - **Owner:** Backend/DevOps

- [ ] **Create CONTRIBUTING.md**
  - Cover: Code style, branch naming, PR process
  - Include: Commit message format (Conventional Commits)
  - Time: 1 hour
  - **Owner:** Backend

- [ ] **Document API endpoints**
  - List: All API routes, parameters, responses
  - Format: OpenAPI/Swagger OR markdown
  - Time: 2 hours
  - **Owner:** Backend

### 🧪 Advanced Testing

- [ ] **Add E2E tests for new features**
  - Test: API endpoints, form submissions, calculator edge cases
  - Target: 80% code coverage
  - Time: 4 hours
  - **Owner:** QA/Backend

- [ ] **Run accessibility audit**
  - Tools: axe DevTools, Lighthouse
  - Target: WCAG 2.1 AA compliance
  - Fix: Color contrast, ARIA labels, keyboard navigation
  - Time: 3 hours
  - **Owner:** Frontend

- [ ] **Performance budget enforcement**
  - Set up: Lighthouse CI in GitHub Actions
  - Budget: Performance > 85, bundle < 200KB
  - Fail: Builds that regress performance
  - Time: 1 hour
  - **Owner:** DevOps

---

## Long-Term: QUARTER 1

### 📊 Analytics & Insights

- [ ] **Set up conversion funnel tracking**
  - Track: Landing → Calculator → Form Start → Form Submit
  - Identify: Dropoff points
  - Optimize: Low-converting pages
  - **Owner:** Marketing/Product

- [ ] **A/B test form variations**
  - Test: Single-step vs multi-step forms
  - Measure: Completion rates, lead quality
  - Implement: Winning variant
  - **Owner:** Marketing/Frontend

- [ ] **Create lead scoring dashboard**
  - Query: Lead scores, conversion rates by source
  - Display: Charts in admin panel OR Google Data Studio
  - **Owner:** Backend/BI

### 🔄 Operations

- [ ] **Automate dependency updates**
  - Enable: Dependabot OR Renovate
  - Configure: Weekly updates, auto-merge patch versions
  - **Owner:** DevOps

- [ ] **Set up CI/CD for edge functions**
  - Automate: Deploy edge functions on merge to main
  - Test: Functions in preview environments
  - **Owner:** DevOps

- [ ] **Implement database migration workflow**
  - Document: How to create/apply migrations
  - Automate: Apply migrations on deploy
  - **Owner:** Backend/DevOps

### 🌐 SEO & Marketing

- [ ] **Submit sitemap to search engines**
  - Submit: Google Search Console, Bing Webmaster Tools
  - Verify: All 156 city pages indexed
  - **Owner:** Marketing/SEO

- [ ] **Optimize meta descriptions**
  - Audit: All 156 city pages
  - Ensure: Unique, 150-160 chars, includes city name
  - **Owner:** Marketing/Content

- [ ] **Build backlinks to city pages**
  - Strategy: Local business directories, industry sites
  - Target: 10 backlinks per top 20 cities
  - **Owner:** Marketing/SEO

---

## Compliance & Legal

### 📜 Required Policies

- [ ] **Add Privacy Policy**
  - Cover: Data collection, cookies, third-party services
  - Link: Footer, form disclaimers
  - **Owner:** Legal/Compliance

- [ ] **Add Terms of Service**
  - Cover: Platform usage, disclaimers, liability
  - Link: Footer
  - **Owner:** Legal/Compliance

- [ ] **Add Cookie Consent Banner** (if tracking users)
  - Implement: Cookie consent library (e.g., CookieConsent)
  - Comply: GDPR (EU), CCPA (California)
  - **Owner:** Legal/Frontend

- [ ] **Add GDPR compliance for email subscriptions**
  - Require: Explicit consent checkbox (not pre-checked)
  - Provide: Unsubscribe mechanism
  - **Owner:** Backend/Compliance

- [ ] **Create SECURITY.md**
  - Provide: Vulnerability reporting email
  - Commit: Response time (e.g., 48 hours)
  - **Owner:** Security/Backend

### 📄 Licensing

- [ ] **Add LICENSE file**
  - Choose: MIT, Apache 2.0, or Proprietary
  - Review: With legal team
  - **Owner:** Legal

---

## Success Metrics (KPIs)

### Week 1 Targets
- [ ] **Uptime:** > 99.5% (4 hours max downtime)
- [ ] **Error Rate:** < 1% of requests
- [ ] **Form Completion Rate:** > 30%
- [ ] **Lead Submissions:** > 10 total
- [ ] **Page Load Time (LCP):** < 2.5s
- [ ] **Mobile Traffic:** > 40% of total

### Month 1 Targets
- [ ] **Unique Visitors:** > 500
- [ ] **Total Leads:** > 50
- [ ] **Conversion Rate:** > 2% (visitors to leads)
- [ ] **Return Visitor Rate:** > 10%
- [ ] **Organic Search Traffic:** > 20% of total
- [ ] **Core Web Vitals:** All "Good" ratings

### Quarter 1 Targets
- [ ] **Indexed Pages:** 156/156 city pages
- [ ] **Organic Search Traffic:** > 40% of total
- [ ] **Total Leads:** > 200
- [ ] **Qualified Leads:** > 100 (score > 70)
- [ ] **Cost Per Lead:** < $50
- [ ] **Customer Acquisition:** > 5 customers from platform

---

## Emergency Contacts & Rollback Plan

### Contacts
- **DevOps Lead:** [Name] - [Phone] - [Email]
- **Backend Lead:** [Name] - [Phone] - [Email]
- **Frontend Lead:** [Name] - [Phone] - [Email]
- **On-Call (24/7):** [Rotation] - [Phone] - [PagerDuty]

### Rollback Procedure
1. **Identify issue:** Check Sentry, Netlify logs, user reports
2. **Assess severity:** Critical (rollback immediately) vs Minor (fix forward)
3. **Rollback command:** Netlify Dashboard → Deploys → [Previous Deploy] → "Publish deploy"
4. **Verify rollback:** Test critical paths (form submission, calculator)
5. **Post-mortem:** Document issue, root cause, prevention plan
6. **Fix forward:** Create hotfix branch, test, deploy when ready

### Critical Issue Escalation
- **5xx errors > 5%:** Rollback immediately
- **Form submissions failing:** Rollback immediately
- **Security vulnerability:** Take site offline, patch, redeploy
- **Performance degradation (LCP > 5s):** Investigate, rollback if no quick fix

---

## Sign-Off

**Project Manager:** _________________ Date: _______
**Tech Lead:** _________________ Date: _______
**DevOps Lead:** _________________ Date: _______
**QA Lead:** _________________ Date: _______

**Launch Approval:** ☐ APPROVED  ☐ BLOCKED

**Blockers (if any):**
_______________________________________________
_______________________________________________
_______________________________________________

**Launch Date:** _____________  **Time:** _______ (Off-peak hours recommended)
