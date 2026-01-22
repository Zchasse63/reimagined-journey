#!/usr/bin/env node

/**
 * Validation script for submit-lead API field mapping
 * Tests the transformFormData function logic without requiring server
 */

// Simulate the transformFormData function from submit-lead.ts
function transformFormData(body) {
  const transformed = {};

  const allowedFields = new Set([
    'email', 'phone', 'business_type', 'company_name', 'first_name', 'last_name',
    'location_count', 'primary_interest', 'purchase_timeline', 'current_distributor',
    'source_city', 'source_state', 'source_page', 'utm_source', 'utm_medium',
    'utm_campaign', 'website',
  ]);

  // Map businessType -> business_type
  if (body.businessType !== undefined) {
    transformed.business_type = body.businessType;
  }

  // Map businessName -> company_name
  if (body.businessName !== undefined) {
    transformed.company_name = body.businessName;
  }

  // Map contactName -> first_name + last_name
  if (body.contactName !== undefined && typeof body.contactName === 'string') {
    const trimmedName = body.contactName.trim();

    if (trimmedName.length < 2) {
      transformed.first_name = trimmedName;
      transformed.last_name = '';
    } else {
      const nameParts = trimmedName.split(/\s+/);
      transformed.first_name = nameParts[0] || '';
      transformed.last_name = nameParts.slice(1).join(' ') || '';
    }
  }

  // Map productInterests -> primary_interest with validation
  if (body.productInterests !== undefined && Array.isArray(body.productInterests)) {
    const validInterests = new Set(['disposables', 'custom_print', 'proteins', 'eco_friendly', 'all']);
    const filteredInterests = body.productInterests.filter(
      (item) => typeof item === 'string' && validInterests.has(item)
    );

    if (filteredInterests.length > 0) {
      transformed.primary_interest = filteredInterests;
    } else if (body.productInterests.length > 0) {
      transformed.primary_interest = body.productInterests;
    }
  }

  // Map location_count with default
  if (transformed.location_count === undefined && body.location_count === undefined) {
    transformed.location_count = 1;
  } else if (body.location_count !== undefined) {
    transformed.location_count = body.location_count;
  }

  // Preserve source metadata
  if (body.city !== undefined) transformed.source_city = body.city;
  if (body.state !== undefined) transformed.source_state = body.state;
  if (body.source !== undefined) transformed.source_page = body.source;

  // Copy other allowed fields
  if (body.email !== undefined) transformed.email = body.email;
  if (body.phone !== undefined) transformed.phone = body.phone;
  if (body.purchase_timeline !== undefined) transformed.purchase_timeline = body.purchase_timeline;
  if (body.current_distributor !== undefined) transformed.current_distributor = body.current_distributor;
  if (body.utm_source !== undefined) transformed.utm_source = body.utm_source;
  if (body.utm_medium !== undefined) transformed.utm_medium = body.utm_medium;
  if (body.utm_campaign !== undefined) transformed.utm_campaign = body.utm_campaign;
  if (body.website !== undefined) transformed.website = body.website;

  // Remove non-allowlisted fields
  Object.keys(transformed).forEach((key) => {
    if (!allowedFields.has(key)) {
      delete transformed[key];
    }
  });

  return transformed;
}

// Test cases
const tests = [
  {
    name: 'AC1: MultiStepLeadForm fields (camelCase)',
    input: {
      businessType: 'restaurant',
      businessName: 'Test Co',
      contactName: 'John Doe',
      email: 'test@example.com',
      productInterests: ['disposables'],
      location_count: 1,
    },
    expected: {
      business_type: 'restaurant',
      company_name: 'Test Co',
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      primary_interest: ['disposables'],
      location_count: 1,
    },
  },
  {
    name: 'AC3a: Single name (Madonna)',
    input: {
      businessType: 'food_truck',
      businessName: 'Taco Stand',
      contactName: 'M',
      email: 'madonna@taco.com',
      productInterests: ['disposables'],
      location_count: 1,
    },
    expected: {
      business_type: 'food_truck',
      company_name: 'Taco Stand',
      first_name: 'M',
      last_name: '',
      email: 'madonna@taco.com',
      primary_interest: ['disposables'],
      location_count: 1,
    },
  },
  {
    name: 'AC3b: Two-word name',
    input: {
      businessType: 'restaurant',
      businessName: 'Test',
      contactName: 'John Doe',
      email: 'john@test.com',
      productInterests: ['proteins'],
      location_count: 1,
    },
    expected: {
      business_type: 'restaurant',
      company_name: 'Test',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com',
      primary_interest: ['proteins'],
      location_count: 1,
    },
  },
  {
    name: 'AC3c: Multi-part name (van der Berg)',
    input: {
      businessType: 'caterer',
      businessName: 'Fine Catering',
      contactName: 'John van der Berg',
      email: 'john@fine.com',
      productInterests: ['custom_print'],
      location_count: 2,
    },
    expected: {
      business_type: 'caterer',
      company_name: 'Fine Catering',
      first_name: 'John',
      last_name: 'van der Berg',
      email: 'john@fine.com',
      primary_interest: ['custom_print'],
      location_count: 2,
    },
  },
  {
    name: 'Already-transformed snake_case fields',
    input: {
      business_type: 'institution',
      company_name: 'School District',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@school.edu',
      primary_interest: ['disposables'],
      location_count: 5,
    },
    expected: {
      business_type: 'institution',
      company_name: 'School District',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@school.edu',
      primary_interest: ['disposables'],
      location_count: 5,
    },
  },
];

console.log('=== Field Mapping Validation ===\n');

let passed = 0;
let failed = 0;

tests.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  const result = transformFormData(test.input);

  // Deep equality check
  const resultStr = JSON.stringify(result, Object.keys(result).sort());
  const expectedStr = JSON.stringify(test.expected, Object.keys(test.expected).sort());

  if (resultStr === expectedStr) {
    console.log('✅ PASS\n');
    passed++;
  } else {
    console.log('❌ FAIL');
    console.log('Expected:', test.expected);
    console.log('Got:     ', result);
    console.log();
    failed++;
  }
});

console.log(`\n=== Results: ${passed}/${tests.length} passed ===`);
process.exit(failed > 0 ? 1 : 0);
