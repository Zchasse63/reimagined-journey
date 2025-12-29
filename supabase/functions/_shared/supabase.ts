import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

export async function checkCache(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  maxAgeMinutes: number = 60
) {
  const { data, error } = await supabase
    .from('api_cache')
    .select('response_data, fetched_at')
    .eq('cache_key', cacheKey)
    .single();

  if (error || !data) return null;

  const fetchedAt = new Date(data.fetched_at);
  const now = new Date();
  const ageMinutes = (now.getTime() - fetchedAt.getTime()) / 1000 / 60;

  if (ageMinutes > maxAgeMinutes) return null;

  return data.response_data;
}

export async function setCache(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  endpoint: string,
  data: unknown,
  ttlMinutes: number = 60
) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await supabase.from('api_cache').upsert({
    cache_key: cacheKey,
    endpoint: endpoint,
    response_data: data,
    fetched_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });
}

export async function incrementApiUsage(
  supabase: ReturnType<typeof createClient>,
  apiSource: string
) {
  await supabase.rpc('increment_api_usage', { p_api_source: apiSource });
}
