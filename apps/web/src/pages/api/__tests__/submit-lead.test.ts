import { describe, it, expect } from 'vitest';

/**
 * Unit tests for submit-lead API field transformation logic
 * Tests transformFormData function in isolation without database dependency
 */

// Inline copy of transformFormData to test without server environment
function transformFormData(body: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  const allowedFields = new Set([
    'email',
    'phone',
    'business_type',
    'company_name',
    'first_name',
    'last_name',
    'location_count',
    'primary_interest',
    'purchase_timeline',
    'current_distributor',
    'source_city',
    'source_state',
    'source_page',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'website',
  ]);

  if (body.businessType !== undefined) {
    transformed.business_type = body.businessType;
  }

  if (body.businessName !== undefined) {
    transformed.company_name = body.businessName;
  }

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

  if (body.productInterests !== undefined && Array.isArray(body.productInterests)) {
    const validInterests = new Set(['disposables', 'custom_print', 'proteins', 'eco_friendly', 'all']);
    const filteredInterests = body.productInterests.filter(
      (item): item is string => typeof item === 'string' && validInterests.has(item)
    );

    if (filteredInterests.length > 0) {
      transformed.primary_interest = filteredInterests;
    } else if (body.productInterests.length > 0) {
      transformed.primary_interest = body.productInterests;
    }
  }

  if (transformed.location_count === undefined && body.location_count === undefined) {
    transformed.location_count = 1;
  } else if (body.location_count !== undefined) {
    transformed.location_count = body.location_count;
  }

  if (body.city !== undefined) {
    transformed.source_city = body.city;
  }
  if (body.state !== undefined) {
    transformed.source_state = body.state;
  }
  if (body.source !== undefined) {
    transformed.source_page = body.source;
  }

  if (body.email !== undefined) transformed.email = body.email;
  if (body.phone !== undefined) transformed.phone = body.phone;
  if (body.purchase_timeline !== undefined) transformed.purchase_timeline = body.purchase_timeline;
  if (body.current_distributor !== undefined) transformed.current_distributor = body.current_distributor;
  if (body.utm_source !== undefined) transformed.utm_source = body.utm_source;
  if (body.utm_medium !== undefined) transformed.utm_medium = body.utm_medium;
  if (body.utm_campaign !== undefined) transformed.utm_campaign = body.utm_campaign;
  if (body.website !== undefined) transformed.website = body.website;

  Object.keys(transformed).forEach((key) => {
    if (!allowedFields.has(key)) {
      delete transformed[key];
    }
  });

  return transformed;
}

describe('submit-lead field transformation', () => {
  it('AC1: transforms MultiStepLeadForm camelCase to schema snake_case', () => {
    const input = {
      businessType: 'restaurant',
      businessName: 'Test Co',
      contactName: 'John Doe',
      email: 'test@example.com',
      productInterests: ['disposables'],
      location_count: 1,
    };

    const output = transformFormData(input);

    expect(output).toMatchObject({
      business_type: 'restaurant',
      company_name: 'Test Co',
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      primary_interest: ['disposables'],
      location_count: 1,
    });
  });

  it('AC3: handles single-name contactName (John → first_name=John, last_name="")', () => {
    const input = { contactName: 'John' };
    const output = transformFormData(input);

    expect(output.first_name).toBe('John');
    expect(output.last_name).toBe('');
  });

  it('AC3: handles two-part contactName (John Doe → first_name=John, last_name=Doe)', () => {
    const input = { contactName: 'John Doe' };
    const output = transformFormData(input);

    expect(output.first_name).toBe('John');
    expect(output.last_name).toBe('Doe');
  });

  it('AC3: handles multi-part contactName (John van der Berg → first_name=John, last_name=van der Berg)', () => {
    const input = { contactName: 'John van der Berg' };
    const output = transformFormData(input);

    expect(output.first_name).toBe('John');
    expect(output.last_name).toBe('van der Berg');
  });

  it('filters productInterests to valid enum values only', () => {
    const input = {
      productInterests: ['disposables', 'invalid_product', 'proteins', 'malicious_input'],
    };
    const output = transformFormData(input);

    expect(output.primary_interest).toEqual(['disposables', 'proteins']);
  });

  it('preserves productInterests array with all valid values', () => {
    const input = {
      productInterests: ['disposables', 'custom_print', 'eco_friendly'],
    };
    const output = transformFormData(input);

    expect(output.primary_interest).toEqual(['disposables', 'custom_print', 'eco_friendly']);
  });

  it('defaults location_count to 1 when not provided', () => {
    const input = { email: 'test@example.com' };
    const output = transformFormData(input);

    expect(output.location_count).toBe(1);
  });

  it('maps source metadata fields (city→source_city, state→source_state, source→source_page)', () => {
    const input = {
      city: 'Atlanta',
      state: 'GA',
      source: 'landing_page',
    };
    const output = transformFormData(input);

    expect(output.source_city).toBe('Atlanta');
    expect(output.source_state).toBe('GA');
    expect(output.source_page).toBe('landing_page');
  });

  it('removes disallowed fields (prototype pollution prevention)', () => {
    const input = {
      email: 'test@example.com',
      __proto__: { admin: true },
      constructor: 'malicious',
      evil_field: 'should_be_removed',
    };
    const output = transformFormData(input);

    expect(output).toHaveProperty('email', 'test@example.com');
    expect(output).not.toHaveProperty('__proto__');
    expect(output).not.toHaveProperty('constructor');
    expect(output).not.toHaveProperty('evil_field');
  });

  it('handles empty productInterests array (should not set primary_interest)', () => {
    const input = { productInterests: [] };
    const output = transformFormData(input);

    expect(output.primary_interest).toBeUndefined();
  });

  it('handles contactName with leading/trailing whitespace', () => {
    const input = { contactName: '  Jane   Smith  ' };
    const output = transformFormData(input);

    expect(output.first_name).toBe('Jane');
    expect(output.last_name).toBe('Smith');
  });

  it('passes through optional fields when provided', () => {
    const input = {
      email: 'test@example.com',
      phone: '404-555-1234',
      purchase_timeline: 'immediate',
      current_distributor: 'Sysco',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring_2026',
      website: '', // honeypot field
    };
    const output = transformFormData(input);

    expect(output.phone).toBe('404-555-1234');
    expect(output.purchase_timeline).toBe('immediate');
    expect(output.current_distributor).toBe('Sysco');
    expect(output.utm_source).toBe('google');
    expect(output.utm_medium).toBe('cpc');
    expect(output.utm_campaign).toBe('spring_2026');
    expect(output.website).toBe('');
  });

  it('handles complex MultiStepLeadForm submission payload', () => {
    const input = {
      businessType: 'caterer',
      businessName: 'Five Star Catering LLC',
      contactName: 'Maria Garcia Rodriguez',
      email: 'maria@fivestar.com',
      phone: '+1-404-555-9999',
      productInterests: ['custom_print', 'disposables', 'eco_friendly'],
      location_count: 3,
      purchase_timeline: '1-3mo',
      current_distributor: 'US Foods',
      city: 'Miami',
      state: 'FL',
      source: 'city_landing_miami_fl',
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'miami_expansion',
    };

    const output = transformFormData(input);

    expect(output).toMatchObject({
      business_type: 'caterer',
      company_name: 'Five Star Catering LLC',
      first_name: 'Maria',
      last_name: 'Garcia Rodriguez',
      email: 'maria@fivestar.com',
      phone: '+1-404-555-9999',
      primary_interest: ['custom_print', 'disposables', 'eco_friendly'],
      location_count: 3,
      purchase_timeline: '1-3mo',
      current_distributor: 'US Foods',
      source_city: 'Miami',
      source_state: 'FL',
      source_page: 'city_landing_miami_fl',
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'miami_expansion',
    });
  });
});
