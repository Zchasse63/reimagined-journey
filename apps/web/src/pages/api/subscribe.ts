import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseSecretKey = import.meta.env.SUPABASE_SECRET_KEY;

export const prerender = false;

// SECURITY NOTE: In-memory rate limiter for development/testing
// LIMITATION: Resets on serverless cold starts and doesn't share state across instances
// PRODUCTION TODO: Replace with distributed rate limiting (Redis, Upstash Rate Limit, or Netlify Edge)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per minute per IP

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

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
  // Honeypot field is intentionally NOT validated by schema
  // We check it before validation to catch bots early
});

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
    const MAX_BODY_SIZE = 2048; // 2KB limit for email subscriptions
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

    // Check honeypot field BEFORE validation to avoid revealing honeypot to bots
    if (body.website && typeof body.website === 'string' && body.website.length > 0) {
      // Bot detected, return fake success to hide honeypot presence
      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: getCorsHeaders(),
        }
      );
    }

    // Validate with Zod schema
    const validationResult = subscribeSchema.safeParse(body);

    if (!validationResult.success) {
      // Log errors without sensitive IP data
      console.error('[VALIDATION_ERROR]', {
        timestamp: new Date().toISOString(),
        errors: validationResult.error.errors,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email address',
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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('email_subscriptions')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
          headers: getCorsHeaders(),
        }
      );
    }

    // Insert subscription
    const { error: insertError } = await supabase
      .from('email_subscriptions')
      .insert([
        {
          email: data.email,
          preferences: {},
          source: data.source || 'website',
        },
      ]);

    if (insertError) {
      console.error('[DB_ERROR] Supabase insert failed', {
        timestamp: new Date().toISOString(),
        code: insertError.code,
        message: insertError.message,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to subscribe. Please try again.',
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
      }),
      {
        status: 200,
        headers: getCorsHeaders(),
      }
    );
  } catch (error) {
    console.error('[SUBSCRIPTION_ERROR] Unexpected error in subscription', {
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
