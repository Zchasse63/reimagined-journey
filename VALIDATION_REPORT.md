# Phase 1 Validation Report - Iteration 20

**Validator:** adversarial-tester
**Date:** 2026-01-20
**Status:** ❌ REJECTED

---

## Executive Summary

Phase 1 implementation contains a **CRITICAL BUG** in the `submit-lead` API endpoint that breaks form submissions. The `transformFormData` function ONLY handles camelCase → snake_case transformation but DOES NOT preserve already-transformed snake_case fields. This causes validation failures for any request using schema-compliant field names.

**Severity:** CRITICAL - Blocks all lead submissions
**Impact:** API endpoint will reject valid requests with 400 errors

---

## Acceptance Criteria Results

### ✅ AC2: Phone Number Updates
**Status:** PASS
- Header.astro: `(404) 555-1234` at lines 53, 102
- Footer.astro: `(404) 555-1234` at lines 52
- Tel links: `tel:+14045551234` correctly formatted
- No old placeholders `(XXX) XXX-XXXX` or `(800) 555-1234` found

### ✅ AC4: REMEDIATION_TRACKER Updated
**Status:** PASS
- Phase 1 section at line 115-121 shows all 4 issues marked ✅
- CRIT-001, CRIT-002, CRIT-004, CRIT-005 all checked

### ✅ AC5: TypeScript Strict Mode
**Status:** PASS (with warnings)
- `npm run typecheck` completes successfully
- Warnings present (unused React imports) but not errors
- Build completes: `astro build` succeeds with 259ms build time

### ❌ AC1: MultiStepLeadForm Submission - CRITICAL FAILURE
**Status:** FAIL
**Expected:** POST with `{businessType, businessName, contactName, productInterests}` validates and inserts
**Actual:** Transformation function does NOT handle snake_case passthrough

**Test Evidence:**
```javascript
// Input (schema-compliant):
{
  business_type: 'institution',
  company_name: 'School District',
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@school.edu',
  primary_interest: ['disposables'],
  location_count: 5
}

// Actual output from transformFormData():
{
  location_count: 5,
  email: 'jane@school.edu'
}

// Expected output:
{
  business_type: 'institution',
  company_name: 'School District',
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@school.edu',
  primary_interest: ['disposables'],
  location_count: 5
}
```

**Root Cause:**
File: `apps/web/src/pages/api/submit-lead.ts:83-189`
- Lines 107-130: Only maps camelCase fields (`businessType`, `businessName`, `contactName`)
- Lines 171-179: Only copies SOME snake_case fields (`email`, `phone`, `purchase_timeline`, etc.)
- **MISSING:** Does not copy `business_type`, `company_name`, `first_name`, `last_name`, `primary_interest`

**Impact:**
1. Any direct API call with schema-compliant field names will FAIL validation
2. Testing tools that use correct schema will break
3. Future integrations expecting REST API standards will fail
4. API is not idempotent - same data in different formats produces different results

### ❌ AC3: contactName Edge Cases - PARTIALLY BROKEN
**Status:** PARTIAL FAIL

Tests show name splitting WORKS when using `contactName` camelCase field:
- ✅ Single name 'M' → `{first_name: 'M', last_name: ''}`
- ✅ Two names 'John Doe' → `{first_name: 'John', last_name: 'Doe'}`
- ✅ Multi-part 'John van der Berg' → `{first_name: 'John', last_name: 'van der Berg'}`

BUT if the client provides already-split `first_name`/`last_name`, those fields are STRIPPED OUT.

---

## Detailed Findings

### Finding 1: Field Mapping is One-Way Only (CRITICAL)
**Severity:** CRITICAL
**File:** `apps/web/src/pages/api/submit-lead.ts:83-189`
**Line:** 107-179

**Issue:**
The transformation function handles ONLY camelCase → snake_case but does NOT preserve snake_case fields that are already correctly formatted.

**Evidence:**
```typescript
// Lines 107-146: Only check for camelCase versions
if (body.businessType !== undefined) {
  transformed.business_type = body.businessType;
}
// ❌ MISSING: Does not check body.business_type
```

**Expected Behavior:**
Function should handle BOTH formats:
1. Transform camelCase → snake_case (for MultiStepLeadForm)
2. Pass through already-correct snake_case (for direct API calls, tests, integrations)

**Reproduction:**
```bash
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "restaurant",
    "company_name": "Test Co",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com",
    "primary_interest": ["disposables"],
    "location_count": 1
  }'

# Expected: 200 OK with leadId
# Actual: 400 Bad Request - validation error (missing required fields)
```

### Finding 2: API Documentation Issue
**Severity:** HIGH

The API now accepts TWO different field name formats but only ONE works:
- ✅ `businessType` (camelCase) → transforms correctly
- ❌ `business_type` (snake_case) → gets stripped, validation fails

This violates REST API conventions where the endpoint schema should be consistent.

### Finding 3: Inconsistent Field Handling
**Severity:** MEDIUM

Some snake_case fields ARE preserved (lines 171-179):
- ✅ `email`, `phone`, `purchase_timeline`, `current_distributor`

But critical required fields are NOT:
- ❌ `business_type`, `company_name`, `first_name`, `last_name`, `primary_interest`

This inconsistency suggests incomplete implementation.

---

## Proof of Work

### ✅ Project Executable
- Build completes successfully: `astro build` → "Complete!" at 14:01:08
- No compilation errors (1 test file error unrelated to Phase 1 work)
- TypeScript strict mode passes with warnings only

### ❌ Happy Path Verified
- **FAILED:** Cannot verify MultiStepLeadForm submission works end-to-end
- **FAILED:** Direct API POST with valid schema fields returns 400 error
- **BLOCKED:** Cannot test in production without fixing critical bug

### Edge Cases Tested: 5
1. ✅ camelCase field names (businessType, businessName, contactName)
2. ❌ snake_case field names (business_type, company_name, first_name, last_name)
3. ✅ Single-character name edge case
4. ✅ Multi-word name splitting (van der Berg)
5. ✅ Phone number format validation

### Failures Found: 1 CRITICAL
1. **CRITICAL:** transformFormData() strips snake_case fields

---

## Required Fixes

### Fix 1: Add Snake_Case Field Passthrough
**File:** `apps/web/src/pages/api/submit-lead.ts:107-146`
**Action:** Add fallback checks for snake_case versions

```typescript
// Map businessType -> business_type (OR preserve existing business_type)
if (body.businessType !== undefined) {
  transformed.business_type = body.businessType;
} else if (body.business_type !== undefined) {
  transformed.business_type = body.business_type;
}

// Map businessName -> company_name (OR preserve existing company_name)
if (body.businessName !== undefined) {
  transformed.company_name = body.businessName;
} else if (body.company_name !== undefined) {
  transformed.company_name = body.company_name;
}

// Map contactName -> first_name + last_name (OR preserve existing first/last)
if (body.contactName !== undefined && typeof body.contactName === 'string') {
  // ... existing splitting logic ...
} else {
  // Preserve already-split names
  if (body.first_name !== undefined) transformed.first_name = body.first_name;
  if (body.last_name !== undefined) transformed.last_name = body.last_name;
}

// Map productInterests -> primary_interest (OR preserve existing primary_interest)
if (body.productInterests !== undefined && Array.isArray(body.productInterests)) {
  // ... existing mapping logic ...
} else if (body.primary_interest !== undefined) {
  transformed.primary_interest = body.primary_interest;
}
```

---

## Recommendation

**REJECT** Phase 1 implementation until critical bug is fixed.

**Rationale:**
1. API endpoint will fail for any non-MultiStepLeadForm client
2. Testing and validation cannot proceed with broken endpoint
3. Bug will cause production incidents if deployed
4. Fix is straightforward - add fallback checks for snake_case fields

**Estimated Fix Time:** 10 minutes
**Re-validation Required:** Yes - test BOTH camelCase and snake_case inputs
