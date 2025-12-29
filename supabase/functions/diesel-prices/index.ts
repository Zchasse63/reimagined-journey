import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getSupabaseClient,
  checkCache,
  setCache,
  incrementApiUsage,
} from '../_shared/supabase.ts';

const EIA_BASE_URL = 'https://api.eia.gov/v2';
const CACHE_KEY = 'eia_diesel_prices';
const CACHE_TTL_MINUTES = 60 * 24; // 24 hours - diesel updates weekly

// EIA Region codes for Southeast
const REGIONS = {
  US: 'EMD_EPD2D_PTE_NUS_DPG', // U.S. Average
  LOWER_ATLANTIC: 'EMD_EPD2D_PTE_R1Z_DPG', // Lower Atlantic (GA, FL, SC, NC)
  GULF_COAST: 'EMD_EPD2D_PTE_R3_DPG', // Gulf Coast (TX, LA, MS, AL)
  MIDWEST: 'EMD_EPD2D_PTE_R2_DPG', // Midwest (OH, IN, IL, etc.)
};

interface DieselPriceResponse {
  region: string;
  regionName: string;
  pricePerGallon: number;
  weekOf: string;
  changeFromPriorWeek: number | null;
  changeFromYearAgo: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const apiKey = Deno.env.get('EIA_API_KEY');

    if (!apiKey) {
      throw new Error('EIA_API_KEY not configured');
    }

    // Check cache first
    const cached = await checkCache(supabase, CACHE_KEY, CACHE_TTL_MINUTES);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch fresh data from EIA
    const results: DieselPriceResponse[] = [];

    for (const [regionKey, seriesId] of Object.entries(REGIONS)) {
      const url = `${EIA_BASE_URL}/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=${seriesId}&sort[0][column]=period&sort[0][direction]=desc&length=2`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`EIA API error for ${regionKey}:`, response.statusText);
        continue;
      }

      const data = await response.json();
      const records = data.response?.data || [];

      if (records.length >= 1) {
        const current = records[0];
        const prior = records[1];

        const regionName =
          regionKey === 'US'
            ? 'U.S. Average'
            : regionKey === 'LOWER_ATLANTIC'
            ? 'Southeast (GA, FL, SC, NC)'
            : regionKey === 'GULF_COAST'
            ? 'Gulf Coast (TX, LA, MS, AL)'
            : 'Midwest (OH, IN, IL)';

        results.push({
          region: regionKey,
          regionName,
          pricePerGallon: parseFloat(current.value),
          weekOf: current.period,
          changeFromPriorWeek: prior
            ? parseFloat((current.value - prior.value).toFixed(3))
            : null,
          changeFromYearAgo: null, // Would need historical data
        });
      }
    }

    // Store in database for historical tracking
    for (const result of results) {
      await supabase.from('diesel_prices').upsert(
        {
          week_of: result.weekOf,
          region: result.region,
          price_per_gallon: result.pricePerGallon,
          change_from_prior_week: result.changeFromPriorWeek,
        },
        { onConflict: 'week_of,region' }
      );
    }

    // Cache the results
    await setCache(supabase, CACHE_KEY, 'eia/diesel', results, CACHE_TTL_MINUTES);

    // Track API usage
    await incrementApiUsage(supabase, 'eia');

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching diesel prices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch diesel prices' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
