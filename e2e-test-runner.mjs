#!/usr/bin/env node
/**
 * E2E Test Runner for Value Source
 * Tests all API endpoints, edge functions, and database operations
 * Uses REAL services - no mocks
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://vpgavbsmspcqhzkdbyly.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_L14VcrEekWejZc1gYNXKuQ_ObYWDSYR';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZ2F2YnNtc3BjcWh6a2RieWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDMyMDAsImV4cCI6MjA4MjYxOTIwMH0.QU3NDTb_LKrt3OB_7EfBqFzRH2ajZ_JC7nVIFVubo5o';

// Check if local dev server is running, otherwise use production
const API_BASE_URL = process.env.API_URL || 'http://localhost:4321';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function logResult(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
  console.log(`  ${status}: ${name}${details ? ` - ${details}` : ''}`);
}

function logSkip(name, reason) {
  results.skipped++;
  results.tests.push({ name, passed: null, details: reason });
  console.log(`  ⏭️ SKIP: ${name} - ${reason}`);
}

// Test IDs for cleanup
const testIds = {
  leads: [],
  subscriptions: []
};

// ============================================
// EDGE FUNCTION TESTS
// ============================================

async function testEdgeFunction(name, options = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  const { params = {}, expectFields = [], method = 'GET' } = options;

  try {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      logResult(`Edge: ${name}`, false, `HTTP ${response.status}: ${text.slice(0, 100)}`);
      return null;
    }

    const data = await response.json();

    // Check expected fields
    const missingFields = expectFields.filter(f => {
      const keys = f.split('.');
      let val = data;
      for (const k of keys) {
        if (val === undefined || val === null) return true;
        val = val[k];
      }
      return val === undefined;
    });

    if (missingFields.length > 0) {
      logResult(`Edge: ${name}`, false, `Missing fields: ${missingFields.join(', ')}`);
      return data;
    }

    logResult(`Edge: ${name}`, true, `Response OK`);
    return data;
  } catch (error) {
    logResult(`Edge: ${name}`, false, error.message);
    return null;
  }
}

async function runEdgeFunctionTests() {
  log('🔌', 'Testing Edge Functions...\n');

  // 1. diesel-prices - returns array of regional prices
  await testEdgeFunction('diesel-prices', {
    expectFields: ['0.region', '0.pricePerGallon']
  });

  // 2. ppi-data - BLS API (known issue: API key invalid)
  await testEdgeFunction('ppi-data', {
    expectFields: []
  });

  // 3. market-insights (requires state param)
  await testEdgeFunction('market-insights', {
    params: { state: 'GA' },
    expectFields: ['dieselPrices', 'lastUpdated']
  });

  // 4. recalls (requires state param) - may have JWT auth issue
  await testEdgeFunction('recalls', {
    params: { state: 'GA' },
    expectFields: []
  });

  // 5. market-data (aggregator) - may have JWT auth issue
  await testEdgeFunction('market-data', {
    expectFields: []
  });

  // 6. usda-prices - may have JWT auth issue
  await testEdgeFunction('usda-prices', {
    expectFields: []
  });

  console.log('');
}

// ============================================
// DATABASE CONSTRAINT TESTS
// ============================================

async function runDatabaseConstraintTests() {
  log('🗄️', 'Testing Database Constraints...\n');

  const businessTypes = [
    // Primary B2B
    'regional_distributor', 'wholesaler', 'buying_group',
    'broadliner', 'specialty_distributor', 'cash_and_carry',
    // Secondary
    'restaurant', 'food_truck', 'caterer', 'institution',
    'grocery', 'ghost_kitchen',
    // Other
    'other'
  ];

  for (const bizType of businessTypes) {
    const testEmail = `e2e-test-${bizType}-${Date.now()}@test.local`;

    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name: 'E2E',
        last_name: 'Test',
        email: testEmail,
        company_name: `Test ${bizType}`,
        business_type: bizType,
        location_count: 1,
        primary_interest: ['proteins'],
        lead_status: 'new',
        lead_score: 50
      })
      .select('id')
      .single();

    if (error) {
      logResult(`DB: business_type='${bizType}'`, false, error.message);
    } else {
      logResult(`DB: business_type='${bizType}'`, true);
      testIds.leads.push(data.id);
    }
  }

  // Test invalid business type (should fail)
  const { error: invalidError } = await supabase
    .from('leads')
    .insert({
      first_name: 'Invalid',
      last_name: 'Test',
      email: `e2e-invalid-${Date.now()}@test.local`,
      company_name: 'Invalid Co',
      business_type: 'invalid_type_xyz',
      location_count: 1,
      primary_interest: ['proteins'],
      lead_status: 'new',
      lead_score: 50
    });

  logResult(
    `DB: reject invalid business_type`,
    invalidError !== null,
    invalidError ? 'Correctly rejected' : 'Should have failed but succeeded'
  );

  console.log('');
}

// ============================================
// API ENDPOINT TESTS
// ============================================

async function checkApiServer() {
  try {
    const response = await fetch(API_BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 404; // 404 is fine, server is running
  } catch {
    return false;
  }
}

async function runApiTests() {
  log('🌐', 'Testing API Endpoints...\n');

  const serverRunning = await checkApiServer();
  if (!serverRunning) {
    logSkip('API: submit-lead', `Dev server not running at ${API_BASE_URL}`);
    logSkip('API: subscribe', `Dev server not running at ${API_BASE_URL}`);
    console.log(`\n  💡 Start the dev server with: cd apps/web && npm run dev\n`);
    return;
  }

  // Test submit-lead API
  const leadPayload = {
    businessType: 'wholesaler',
    businessName: 'E2E Test Company',
    contactName: 'Test User',
    productInterests: ['proteins', 'disposables'],
    estimatedSpend: '10k_25k',
    email: `e2e-api-test-${Date.now()}@test.local`,
    phone: '555-123-4567',
    city: 'Atlanta',
    state: 'GA',
    source: 'e2e-test'
  };

  try {
    // Note: Astro has trailingSlash: 'always' so URLs need trailing slashes
    const leadResponse = await fetch(`${API_BASE_URL}/api/submit-lead/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    });

    const leadResult = await leadResponse.json();

    if (leadResponse.ok && leadResult.success && leadResult.leadId) {
      logResult('API: submit-lead', true, `Created lead ${leadResult.leadId}`);
      testIds.leads.push(leadResult.leadId);

      // Verify in database
      const { data: dbLead } = await supabase
        .from('leads')
        .select('business_type, company_name, lead_score')
        .eq('id', leadResult.leadId)
        .single();

      if (dbLead) {
        logResult(
          'API: submit-lead DB verification',
          dbLead.business_type === 'wholesaler' && dbLead.company_name === 'E2E Test Company',
          `business_type=${dbLead.business_type}, score=${dbLead.lead_score}`
        );
      }
    } else {
      logResult('API: submit-lead', false, leadResult.error || 'Unknown error');
    }
  } catch (error) {
    logResult('API: submit-lead', false, error.message);
  }

  // Test subscribe API
  const subscribePayload = {
    email: `e2e-subscribe-${Date.now()}@test.local`
  };

  try {
    const subResponse = await fetch(`${API_BASE_URL}/api/subscribe/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscribePayload)
    });

    const subResult = await subResponse.json();

    if (subResponse.ok && subResult.success) {
      logResult('API: subscribe', true, `Subscribed ${subscribePayload.email}`);

      // Get subscription ID for cleanup
      const { data: sub } = await supabase
        .from('email_subscriptions')
        .select('id')
        .eq('email', subscribePayload.email)
        .single();

      if (sub) testIds.subscriptions.push(sub.id);
    } else {
      logResult('API: subscribe', false, subResult.error || 'Unknown error');
    }
  } catch (error) {
    logResult('API: subscribe', false, error.message);
  }

  // Test validation errors
  try {
    const invalidResponse = await fetch(`${API_BASE_URL}/api/submit-lead/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });

    logResult(
      'API: submit-lead validation',
      invalidResponse.status === 400,
      `Status ${invalidResponse.status} (expected 400)`
    );
  } catch (error) {
    logResult('API: submit-lead validation', false, error.message);
  }

  // Test honeypot detection (should return fake success)
  try {
    const honeypotPayload = {
      ...leadPayload,
      email: `honeypot-${Date.now()}@test.local`,
      website: 'http://spam.com' // Honeypot field filled = bot
    };

    const honeypotResponse = await fetch(`${API_BASE_URL}/api/submit-lead/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(honeypotPayload)
    });

    const honeypotResult = await honeypotResponse.json();

    logResult(
      'API: honeypot detection',
      honeypotResponse.ok && honeypotResult.leadId === 'honeypot',
      honeypotResult.leadId === 'honeypot' ? 'Bot detected correctly' : 'Did not detect bot'
    );
  } catch (error) {
    logResult('API: honeypot detection', false, error.message);
  }

  console.log('');
}

// ============================================
// CLEANUP
// ============================================

async function cleanup() {
  log('🧹', 'Cleaning up test data...\n');

  if (testIds.leads.length > 0) {
    const { error: leadError } = await supabase
      .from('leads')
      .delete()
      .in('id', testIds.leads);

    console.log(`  Deleted ${testIds.leads.length} test leads${leadError ? ` (error: ${leadError.message})` : ''}`);
  }

  if (testIds.subscriptions.length > 0) {
    const { error: subError } = await supabase
      .from('email_subscriptions')
      .delete()
      .in('id', testIds.subscriptions);

    console.log(`  Deleted ${testIds.subscriptions.length} test subscriptions${subError ? ` (error: ${subError.message})` : ''}`);
  }

  console.log('');
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  VALUE SOURCE E2E TEST RUNNER');
  console.log('  Real tests against live services - no mocks');
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  // Run all test suites
  await runEdgeFunctionTests();
  await runDatabaseConstraintTests();
  await runApiTests();

  // Cleanup
  await cleanup();

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('='.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`  ✅ Passed:  ${results.passed}`);
  console.log(`  ❌ Failed:  ${results.failed}`);
  console.log(`  ⏭️ Skipped: ${results.skipped}`);
  console.log(`  ⏱️ Duration: ${duration}s`);
  console.log('='.repeat(60) + '\n');

  // Exit with error code if any failures
  if (results.failed > 0) {
    console.log('❌ Some tests failed. See details above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
