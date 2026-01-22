import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { leadFormSchema, type LeadFormData } from '@/components/forms/lead-form-schema';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseSecretKey = import.meta.env.SUPABASE_SECRET_KEY;

export const prerender = false;

// SECURITY NOTE: In-memory rate limiter for development/testing
// LIMITATION: Resets on serverless cold starts and doesn't share state across instances
// PRODUCTION TODO: Replace with distributed rate limiting (Redis, Upstash Rate Limit, or Netlify Edge)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getCorsHeaders(): Record<string, string> {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error('PUBLIC_SITE_URL environment variable is required for CORS configuration');
  }

  // Validate CORS origin to prevent misconfiguration
  // Allow http://localhost in development, require HTTPS in production
  const isDev = import.meta.env.DEV;
  const isLocalhost = siteUrl.startsWith('http://localhost') || siteUrl.startsWith('http://127.0.0.1');

  if (siteUrl === '*' || (!siteUrl.startsWith('https://') && !(isDev && isLocalhost))) {
    throw new Error('PUBLIC_SITE_URL must be a valid HTTPS URL (or http://localhost in development)');
  }

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': siteUrl,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

/**
 * Untransformed form data from MultiStepLeadForm
 */
interface UntransformedLead {
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
  website?: string;
  [key: string]: unknown;
}

/**
 * Transform MultiStepLeadForm camelCase fields to API schema snake_case fields
 * Handles field name mapping from frontend form to backend database schema
 */
function transformFormData(body: UntransformedLead): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  // Strict allowlist of allowed fields to prevent prototype pollution
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

  // Map businessType -> business_type (or preserve existing business_type)
  if (body.businessType !== undefined) {
    transformed.business_type = body.businessType;
  } else if (body.business_type !== undefined) {
    transformed.business_type = body.business_type;
  }

  // Map businessName -> company_name (or preserve existing company_name)
  if (body.businessName !== undefined) {
    transformed.company_name = body.businessName;
  } else if (body.company_name !== undefined) {
    transformed.company_name = body.company_name;
  }

  // Map contactName -> first_name + last_name (or preserve existing first_name/last_name)
  if (body.contactName !== undefined && typeof body.contactName === 'string') {
    const trimmedName = body.contactName.trim();

    // Handle single-name edge case: Let Zod validate first_name.min(2) requirement
    if (trimmedName.length < 2) {
      transformed.first_name = trimmedName;
      transformed.last_name = '';
    } else {
      const nameParts = trimmedName.split(/\s+/);
      transformed.first_name = nameParts[0] || '';
      transformed.last_name = nameParts.slice(1).join(' ') || '';
    }
  } else {
    // Preserve snake_case fields if contactName not provided
    if (body.first_name !== undefined) {
      transformed.first_name = body.first_name;
    }
    if (body.last_name !== undefined) {
      transformed.last_name = body.last_name;
    }
  }

  // Map productInterests -> primary_interest with validation (or preserve existing primary_interest)
  if (body.productInterests !== undefined && Array.isArray(body.productInterests)) {
    const validInterests = new Set(['disposables', 'custom_print', 'proteins', 'eco_friendly', 'all']);
    const filteredInterests = body.productInterests.filter(
      (item): item is string => typeof item === 'string' && validInterests.has(item)
    );

    // Only set if we have valid interests remaining after filtering
    if (filteredInterests.length > 0) {
      transformed.primary_interest = filteredInterests;
    } else if (body.productInterests.length > 0) {
      // Invalid values provided - set to original to let Zod validation report the error
      transformed.primary_interest = body.productInterests;
    }
  } else if (body.primary_interest !== undefined) {
    transformed.primary_interest = body.primary_interest;
  }

  // Note: estimatedSpend field from MultiStepLeadForm is intentionally NOT mapped
  // Database schema does not include estimated_monthly_spend column
  // Field is used for frontend UX only (e.g., conditional messaging, lead scoring tier hints)
  // If future requirement: add estimated_monthly_spend ENUM column to leads table via migration

  // Map location_count if not present but needed
  if (transformed.location_count === undefined && body.location_count === undefined) {
    transformed.location_count = 1; // Default to 1 location
  } else if (body.location_count !== undefined) {
    transformed.location_count = body.location_count;
  }

  // Preserve source metadata fields with proper names
  if (body.city !== undefined) {
    transformed.source_city = body.city;
  }
  if (body.state !== undefined) {
    transformed.source_state = body.state;
  }
  if (body.source !== undefined) {
    transformed.source_page = body.source;
  }

  // Copy other allowed fields directly
  if (body.email !== undefined) transformed.email = body.email;
  if (body.phone !== undefined) transformed.phone = body.phone;
  if (body.purchase_timeline !== undefined) transformed.purchase_timeline = body.purchase_timeline;
  if (body.current_distributor !== undefined) transformed.current_distributor = body.current_distributor;
  if (body.utm_source !== undefined) transformed.utm_source = body.utm_source;
  if (body.utm_medium !== undefined) transformed.utm_medium = body.utm_medium;
  if (body.utm_campaign !== undefined) transformed.utm_campaign = body.utm_campaign;
  if (body.website !== undefined) transformed.website = body.website;

  // Remove any fields not in allowlist to prevent prototype pollution
  Object.keys(transformed).forEach((key) => {
    if (!allowedFields.has(key)) {
      delete transformed[key];
    }
  });

  return transformed;
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Validate Content-Type header
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type must be application/json',
        }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    // Enforce HTTPS in production
    const protocol = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol;
    if (protocol !== 'https:' && import.meta.env.PROD) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Secure connection required',
        }),
        {
          status: 403,
          headers: getCorsHeaders(),
        }
      );
    }

    // Check Content-Length to prevent DoS via large payloads
    const contentLength = request.headers.get('content-length');
    const MAX_BODY_SIZE = 10240; // 10KB limit
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Request body too large',
        }),
        {
          status: 413,
          headers: getCorsHeaders(),
        }
      );
    }

    // Rate limiting check
    const ip = clientAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: getCorsHeaders(),
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Transform MultiStepLeadForm camelCase fields to schema snake_case fields
    const transformedBody = transformFormData(body);

    // Check honeypot field BEFORE validation to avoid revealing honeypot to bots
    const websiteField = transformedBody.website;
    if (websiteField && typeof websiteField === 'string' && websiteField.length > 0) {
      // Bot detected, return fake success to hide honeypot presence
      return new Response(
        JSON.stringify({
          success: true,
          leadId: 'honeypot',
        }),
        {
          status: 200,
          headers: getCorsHeaders(),
        }
      );
    }

    // Validate with Zod schema
    const validationResult = leadFormSchema.safeParse(transformedBody);

    if (!validationResult.success) {
      // Log errors without sensitive IP data
      console.error('[VALIDATION_ERROR]', {
        timestamp: new Date().toISOString(),
        errors: validationResult.error.errors,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid form data. Please check your inputs and try again.',
        }),
        {
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const data = validationResult.data;

    // Initialize Supabase client with service role key
    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('[CONFIG_ERROR] Missing Supabase configuration', {
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // Prepare lead data with sanitization for optional fields
    const leadData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      company_name: data.company_name,
      business_type: data.business_type,
      location_count: data.location_count,
      primary_interest: data.primary_interest,
      purchase_timeline: data.purchase_timeline || null,
      current_distributor: data.current_distributor || null,
      source_city:
        typeof transformedBody.source_city === 'string' ? transformedBody.source_city : null,
      source_state:
        typeof transformedBody.source_state === 'string' ? transformedBody.source_state : null,
      source_page:
        typeof transformedBody.source_page === 'string' ? transformedBody.source_page : null,
      utm_source:
        typeof transformedBody.utm_source === 'string' ? transformedBody.utm_source : null,
      utm_medium:
        typeof transformedBody.utm_medium === 'string' ? transformedBody.utm_medium : null,
      utm_campaign:
        typeof transformedBody.utm_campaign === 'string' ? transformedBody.utm_campaign : null,
      lead_status: 'new' as const,
      lead_score: calculateLeadScore(data),
    };

    // Insert into Supabase
    const { data: insertedLead, error: insertError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (insertError) {
      console.error('[DB_ERROR] Supabase insert failed', {
        timestamp: new Date().toISOString(),
        code: insertError.code,
        message: insertError.message,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save lead data',
        }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        leadId: insertedLead.id,
      }),
      {
        status: 200,
        headers: getCorsHeaders(),
      }
    );
  } catch (error) {
    console.error('[SUBMISSION_ERROR] Unexpected error in lead submission', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: getCorsHeaders(),
      }
    );
  }
};

/**
 * Calculate lead score based on form data
 * Higher score = more qualified lead
 */
function calculateLeadScore(data: Partial<LeadFormData>): number {
  let score = 50; // Base score

  // Business type scoring
  if (data.business_type === 'restaurant') score += 15;
  else if (data.business_type === 'institution') score += 10;
  else if (data.business_type === 'caterer') score += 10;
  else if (data.business_type === 'food_truck') score += 5;

  // Location count scoring
  if (data.location_count !== undefined) {
    if (data.location_count >= 10) score += 20;
    else if (data.location_count >= 5) score += 15;
    else if (data.location_count >= 2) score += 10;
    else score += 5;
  }

  // Purchase timeline scoring
  if (data.purchase_timeline === 'immediate') score += 15;
  else if (data.purchase_timeline === '1-3mo') score += 10;
  else if (data.purchase_timeline === '3-6mo') score += 5;

  // Product interest scoring
  if (data.primary_interest?.includes('proteins')) score += 10;
  if (data.primary_interest?.includes('all')) score += 5;
  if (data.primary_interest && data.primary_interest.length >= 2) score += 5;

  // Phone provided
  if (data.phone) score += 5;

  return Math.min(score, 100); // Cap at 100
}
