import { describe, it, expect } from 'vitest';
import { transformFormData } from '@/lib/transform-lead';

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

  // New tests for the source_page URL precedence fix (Phase 0)
  describe('source_page URL precedence (Phase 0 fix)', () => {
    it('explicit source_page URL wins over legacy source field', () => {
      const input = {
        source: 'direct',
        source_page: '/georgia/atlanta/',
      };
      const output = transformFormData(input);

      expect(output.source_page).toBe('/georgia/atlanta/');
    });

    it('falls back to source field when source_page is not provided', () => {
      const input = { source: 'calculator' };
      const output = transformFormData(input);

      expect(output.source_page).toBe('calculator');
    });

    it('preserves source_page when no source field is sent', () => {
      const input = { source_page: '/florida/miami/' };
      const output = transformFormData(input);

      expect(output.source_page).toBe('/florida/miami/');
    });

    it('ignores non-string source_page values (type safety)', () => {
      const input = {
        source: 'direct',
        source_page: 12345 as unknown as string,
      };
      const output = transformFormData(input);

      // Non-string source_page is ignored; falls back to source field
      expect(output.source_page).toBe('direct');
    });
  });
});
