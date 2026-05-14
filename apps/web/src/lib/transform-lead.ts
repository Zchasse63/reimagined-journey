/**
 * Untransformed form data from MultiStepLeadForm and LeadForm.
 *
 * The two forms have different naming conventions:
 *   - MultiStepLeadForm sends camelCase: businessType, businessName, contactName, productInterests
 *   - LeadForm sends snake_case directly (matches the API schema)
 *
 * transformFormData() normalizes both shapes to the snake_case API schema.
 */
export interface UntransformedLead {
  businessType?: string;
  businessName?: string;
  contactName?: string;
  productInterests?: string[];
  estimatedSpend?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  source?: string;
  source_page?: string;
  website?: string;
  [key: string]: unknown;
}

/**
 * Transform MultiStepLeadForm camelCase fields to API schema snake_case fields.
 * Handles field name mapping from frontend form to backend database schema.
 *
 * Field precedence for source_page:
 *   1. body.source_page (the actual URL path, sent by both forms) wins
 *   2. Falls back to body.source ("direct" / "calculator" — legacy traffic-source label)
 *
 * Defense-in-depth: an explicit allowlist filters the output to prevent
 * prototype pollution from attacker-controlled keys like __proto__ or constructor.
 */
export function transformFormData(body: UntransformedLead): Record<string, unknown> {
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
  } else if (body.business_type !== undefined) {
    transformed.business_type = body.business_type;
  }

  if (body.businessName !== undefined) {
    transformed.company_name = body.businessName;
  } else if (body.company_name !== undefined) {
    transformed.company_name = body.company_name;
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
  } else {
    if (body.first_name !== undefined) {
      transformed.first_name = body.first_name;
    }
    if (body.last_name !== undefined) {
      transformed.last_name = body.last_name;
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
  } else if (body.primary_interest !== undefined) {
    transformed.primary_interest = body.primary_interest;
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
  if (body.source_page !== undefined && typeof body.source_page === 'string') {
    transformed.source_page = body.source_page;
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
