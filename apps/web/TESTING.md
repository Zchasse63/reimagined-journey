# API Testing Documentation

## Submit Lead API - Field Transformation Testing

### Unit Tests (Database-Independent)

**Location:** `src/pages/api/__tests__/submit-lead.test.ts`

**Coverage:**
- ✅ AC1: MultiStepLeadForm camelCase → schema snake_case transformation
- ✅ AC3: contactName splitting (single/two/multi-part names)
- ✅ productInterests validation and filtering
- ✅ Source metadata field mapping (city→source_city, state→source_state)
- ✅ Prototype pollution prevention (allowlist enforcement)
- ✅ Optional field passthrough (phone, purchase_timeline, UTM params)
- ✅ Edge cases (empty arrays, whitespace, missing fields)

**Run:**
```bash
cd apps/web
npx vitest run src/pages/api/__tests__/submit-lead.test.ts
```

**Latest Results:** 13/13 tests PASSED (2026-01-20)

### Integration Testing (Requires Live Database)

**Prerequisites:**
- Valid Supabase project with `leads` table
- Update `.env.local` with real credentials:
  ```
  PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
  SUPABASE_SECRET_KEY=<your-service-role-key>
  ```

**Test Script:** `test-submit-lead.sh`

**Sample Request:**
```bash
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "restaurant",
    "businessName": "Test Restaurant",
    "contactName": "John Doe",
    "email": "test@example.com",
    "productInterests": ["disposables", "proteins"],
    "location_count": 2
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "leadId": "<uuid>"
}
```

### Testing With Test Credentials

The current `.env.local` uses test credentials (`test.supabase.co`) for development without requiring a live database.

**Limitations:**
- Database insert operations will fail (expected)
- Field transformation logic still executes and can be unit tested
- Full end-to-end testing requires production/staging Supabase instance

**What IS Verified Without Live Database:**
1. Field transformation correctness (via unit tests)
2. TypeScript type safety (via `npm run typecheck`)
3. Build process (via `npm run build`)
4. API endpoint structure and validation logic (via code review)

**What Requires Live Database:**
1. Actual database insertion
2. RLS policy enforcement
3. Database schema compatibility
4. Network connectivity and authentication

### Acceptance Criteria Status

| ID | Criterion | Verification Method | Status |
|----|-----------|---------------------|--------|
| AC1 | MultiStepLeadForm submissions validate and insert | Unit tests + manual testing with real DB | ✅ (unit tests passing) |
| AC2 | Phone numbers updated to (404) 555-1234 | grep verification | ✅ |
| AC3 | contactName splitting handles edge cases | Unit tests | ✅ (13/13 tests pass) |
| AC4 | REMEDIATION_TRACKER.md updated | grep verification | ✅ |
| AC5 | TypeScript strict mode passes | npm run typecheck | ✅ |

**Deployment Checklist:**
- [ ] Update `.env` in production with real Supabase credentials
- [ ] Run integration tests against staging environment
- [ ] Verify RLS policies allow service role insertions
- [ ] Test rate limiting under load (replace in-memory store with Redis)
- [ ] Monitor error logs for database schema mismatches
