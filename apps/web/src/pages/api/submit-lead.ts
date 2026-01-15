import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { leadFormSchema } from '@/components/forms/lead-form-schema';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseSecretKey = import.meta.env.SUPABASE_SECRET_KEY;

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate limiting check (simple IP-based)
    // In production, use a proper rate limiting service like Upstash Redis

    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = leadFormSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid form data',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = validationResult.data;

    // Check honeypot field
    if (data.website && data.website.length > 0) {
      // Bot detected, return success to avoid revealing honeypot
      return new Response(
        JSON.stringify({
          success: true,
          leadId: 'honeypot',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role key
    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // Prepare lead data
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
      source_city: body.source_city || null,
      source_state: body.source_state || null,
      source_page: body.source_page || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      lead_status: 'new',
      lead_score: calculateLeadScore(data),
    };

    // Insert into Supabase
    const { data: insertedLead, error: insertError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save lead data',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Lead submission error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Calculate lead score based on form data
 * Higher score = more qualified lead
 */
function calculateLeadScore(data: any): number {
  let score = 50; // Base score

  // Business type scoring
  if (data.business_type === 'restaurant') score += 15;
  else if (data.business_type === 'institution') score += 10;
  else if (data.business_type === 'caterer') score += 10;
  else if (data.business_type === 'food_truck') score += 5;

  // Location count scoring
  if (data.location_count >= 10) score += 20;
  else if (data.location_count >= 5) score += 15;
  else if (data.location_count >= 2) score += 10;
  else score += 5;

  // Purchase timeline scoring
  if (data.purchase_timeline === 'immediate') score += 15;
  else if (data.purchase_timeline === '1-3mo') score += 10;
  else if (data.purchase_timeline === '3-6mo') score += 5;

  // Product interest scoring
  if (data.primary_interest?.includes('proteins')) score += 10;
  if (data.primary_interest?.includes('all')) score += 5;
  if (data.primary_interest?.length >= 2) score += 5;

  // Phone provided
  if (data.phone) score += 5;

  return Math.min(score, 100); // Cap at 100
}
