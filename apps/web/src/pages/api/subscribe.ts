import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseSecretKey = import.meta.env.SUPABASE_SECRET_KEY;

export const prerender = false;

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  // Honeypot field
  website: z.string().max(0, 'This field should be empty').optional(),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = subscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid email address',
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
          message: 'Successfully subscribed!',
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
          message: 'Server configuration error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
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
          message: 'You are already subscribed!',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
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
          source: 'website',
        },
      ]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to subscribe. Please try again.',
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
        message: 'Successfully subscribed!',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
