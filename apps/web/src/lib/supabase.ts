import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

const env = getEnv();

export const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

// Server-side client with secret key (for Edge Functions)
export function createServerClient() {
  const secretKey = import.meta.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY');
  }
  return createClient(env.PUBLIC_SUPABASE_URL, secretKey);
}
