# Implementation Roadmap
**Project:** Value Source Food Service Distribution Platform
**Generated:** January 20, 2026
**Based on:** Full-Stack Audit - Issues Registry

Sprint-ready task breakdown organized by priority waves with effort estimates and dependencies.

---

## Overview

| Wave | Priority | Duration | Focus Area | Total Effort |
|------|----------|----------|------------|--------------|
| Wave 1 | CRITICAL | Week 1 | Production Blockers | ~4 hours |
| Wave 2 | HIGH | Week 2-3 | Core Functionality | ~16-24 hours |
| Wave 3 | MEDIUM | Week 4-5 | Quality & Polish | ~12-16 hours |
| Wave 4 | LOW | Week 6+ | Nice-to-Have | ~8 hours |

---

## Wave 1: Critical Production Blockers

**Goal:** Make the platform minimally functional for production launch
**Duration:** ~4 hours
**Prerequisites:** Access to Supabase dashboard, company phone number

### Sprint 1.1: Configuration Fixes (30 minutes)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add Supabase anon key to .env.local | CRIT-003 | 5 min | - |
| Update Netlify environment variables | CRIT-003 | 10 min | - |
| Replace placeholder phone numbers (6 files) | CRIT-004 | 15 min | - |

**Files to Update:**
- `.env.local`
- Netlify Dashboard → Site settings → Build & deploy → Environment
- `apps/web/src/components/forms/LeadForm.tsx`
- `apps/web/src/components/landing/MultiStepLeadForm.tsx`
- `apps/web/src/components/layout/Header.astro`
- `apps/web/src/components/layout/Footer.astro`

### Sprint 1.2: API Endpoints (90 minutes)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Create /api/submit-lead.ts endpoint | CRIT-001 | 60 min | - |
| Create /api/subscribe.ts endpoint | CRIT-002 | 30 min | - |

**Implementation Notes:**
```typescript
// Template: apps/web/src/pages/api/submit-lead.ts
export const prerender = false;
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const leadSchema = z.object({
  company_name: z.string().min(1),
  business_type: z.string(),
  first_name: z.string().min(1),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  primary_interest: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  source: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const result = leadSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({
      success: false,
      errors: result.error.flatten()
    }), { status: 400 });
  }

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SECRET_KEY
  );

  const { data, error } = await supabase
    .from('leads')
    .insert(result.data)
    .select('id')
    .single();

  if (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    leadId: data.id
  }));
};
```

### Sprint 1.3: Form Schema Alignment (45 minutes)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Update MultiStepLeadForm field mapping | CRIT-005 | 45 min | - |

**Files to Update:**
- `apps/web/src/components/landing/MultiStepLeadForm.tsx:66-77, 151`
- Map `businessType` → `business_type`, `businessName` → `company_name`, etc.

### Sprint 1.4: Verification (30 minutes)

| Task | Effort | Assignee |
|------|--------|----------|
| Test lead submission flow end-to-end | 15 min | - |
| Verify phone numbers are clickable | 5 min | - |
| Check Supabase for inserted leads | 10 min | - |

---

## Wave 2: High Priority - Core Functionality

**Goal:** Enable live data and complete feature set
**Duration:** ~16-24 hours across 2 weeks
**Prerequisites:** API keys for USDA, EIA, FDA; Supabase CLI installed

### Sprint 2.1: Data Integrity Quick Fixes (30 minutes)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Update recall dates to recent past | HIGH-003 | 5 min | - |
| Add "Illustrative Data" label to historical charts | HIGH-002 | 10 min | - |
| Verify city page SSR configuration | HIGH-004 | 15 min | - |

### Sprint 2.2: Edge Function Deployment (4 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Acquire API keys (EIA, FDA, USDA) | HIGH-005 | 60 min | - |
| Configure Supabase secrets | HIGH-005 | 15 min | - |
| Deploy market-data edge function | HIGH-001 | 30 min | - |
| Deploy recalls edge function | HIGH-005 | 30 min | - |
| Deploy usda-prices edge function | HIGH-005 | 30 min | - |
| Deploy diesel-prices edge function | HIGH-005 | 30 min | - |
| Test all edge functions | HIGH-005 | 60 min | - |

**Commands:**
```bash
# Set API keys
supabase secrets set EIA_API_KEY=your_eia_key
supabase secrets set FDA_API_KEY=your_fda_key
supabase secrets set USDA_API_KEY=your_usda_key

# Deploy functions
supabase functions deploy market-data
supabase functions deploy recalls
supabase functions deploy usda-prices
supabase functions deploy diesel-prices
supabase functions deploy ppi-data
supabase functions deploy notify-lead
```

### Sprint 2.3: API Integration (4 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Update city pages to call edge functions | HIGH-001 | 90 min | - |
| Implement caching with api_cache table | HIGH-001 | 90 min | - |
| Add error handling for API failures | HIGH-006 | 60 min | - |

### Sprint 2.4: Security Hardening (2 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add rate limiting to API endpoints | HIGH-006 | 60 min | - |
| Add CAPTCHA to lead forms | HIGH-007 | 30 min | - |
| Review RLS policies | HIGH-008 | 30 min | - |

### Sprint 2.5: Notifications (2 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Deploy notify-lead edge function | - | 30 min | - |
| Configure Slack webhook | - | 30 min | - |
| Configure email notifications (optional) | - | 60 min | - |

---

## Wave 3: Medium Priority - Quality & Polish

**Goal:** Improve reliability, testing, and user experience
**Duration:** ~12-16 hours across 2 weeks

### Sprint 3.1: Testing (6 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add unit tests for API endpoints | MED-001 | 2h | - |
| Add integration tests for lead flow | MED-002 | 2h | - |
| Add edge function tests | MED-003 | 2h | - |

### Sprint 3.2: Error Handling (4 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add error boundaries to React components | MED-004 | 90 min | - |
| Implement toast notifications for form errors | MED-005 | 60 min | - |
| Add retry logic for failed API calls | MED-006 | 60 min | - |

### Sprint 3.3: Performance (4 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Optimize image loading (lazy load below fold) | MED-007 | 60 min | - |
| Review and optimize database queries | MED-008 | 90 min | - |
| Implement proper caching headers | MED-009 | 60 min | - |

### Sprint 3.4: Accessibility (2 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add ARIA labels to interactive components | MED-010 | 60 min | - |
| Fix color contrast issues | MED-011 | 30 min | - |
| Add keyboard navigation support | MED-012 | 30 min | - |

---

## Wave 4: Low Priority - Nice to Have

**Goal:** Polish and future-proofing
**Duration:** ~8 hours, can be deferred

### Sprint 4.1: Documentation (3 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Update README with setup instructions | LOW-001 | 60 min | - |
| Document API endpoints | LOW-002 | 60 min | - |
| Create deployment runbook | LOW-003 | 60 min | - |

### Sprint 4.2: Developer Experience (3 hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Add pre-commit hooks (lint, format) | LOW-004 | 30 min | - |
| Set up CI/CD pipeline | LOW-005 | 90 min | - |
| Add development seed data | LOW-006 | 60 min | - |

### Sprint 4.3: Advanced Features (2+ hours)

| Task | Issue ID | Effort | Assignee |
|------|----------|--------|----------|
| Implement historical data storage | LOW-007 | 3h | - |
| Add admin dashboard for leads | LOW-008 | 4h+ | - |
| Implement A/B testing framework | LOW-009 | 4h+ | - |

---

## Dependency Graph

```
CRIT-003 (Supabase Key)
    └── CRIT-001 (Submit Lead API)
        └── CRIT-005 (Form Schema)
    └── CRIT-002 (Subscribe API)
    └── HIGH-001 (Live Market Data)
        └── HIGH-005 (Edge Functions)

CRIT-004 (Phone Numbers) ── No dependencies

HIGH-002 (Historical Charts) ── HIGH-001 (for complete fix)

HIGH-003 (Recall Dates) ── No dependencies

HIGH-004 (SSR Config) ── No dependencies
```

---

## Definition of Done

**Wave 1 Complete When:**
- [ ] Lead submission form creates records in Supabase
- [ ] Email subscription form works
- [ ] All phone numbers are real and clickable
- [ ] No console errors on any page

**Wave 2 Complete When:**
- [ ] Market data updates from live APIs
- [ ] Recalls show real FDA data
- [ ] Rate limiting prevents abuse
- [ ] Team receives Slack notifications for new leads

**Wave 3 Complete When:**
- [ ] 70%+ test coverage on critical paths
- [ ] No accessibility violations in Lighthouse
- [ ] Page load < 3 seconds on mobile
- [ ] Error states handled gracefully

**Wave 4 Complete When:**
- [ ] New developer can set up project in < 30 minutes
- [ ] All APIs documented in OpenAPI/Swagger
- [ ] CI/CD pipeline runs on every PR

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API rate limits (USDA/EIA) | Medium | High | Implement caching, use api_cache table |
| Supabase free tier limits | Low | High | Monitor usage, upgrade plan if needed |
| Stale fallback data | High | Medium | Add "last updated" timestamps, schedule rebuilds |
| Form spam | High | Medium | Add CAPTCHA, implement rate limiting |

---

## Quick Wins for Immediate Impact

If you only have 1 hour:
1. **5 min:** Add Supabase anon key (CRIT-003)
2. **15 min:** Replace placeholder phone numbers (CRIT-004)
3. **5 min:** Update recall dates to recent past (HIGH-003)
4. **10 min:** Add "Illustrative Data" disclaimer (HIGH-002)
5. **Remaining:** Create submit-lead.ts endpoint (CRIT-001 partial)

**Result:** Site becomes usable with working contact numbers and honest data disclaimers.
