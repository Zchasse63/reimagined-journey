import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getSupabaseClient,
  checkCache,
  setCache,
  incrementApiUsage,
} from '../_shared/supabase.ts';

const BLS_BASE_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const CACHE_KEY = 'bls_ppi_data';
const CACHE_TTL_MINUTES = 60 * 24 * 7; // 7 days - PPI updates monthly

// PPI Series IDs relevant to food service
const PPI_SERIES = {
  // Food manufacturing
  PCU311311: 'Animal food manufacturing',
  PCU3114311143: 'Fruit and vegetable canning',
  PCU3116311163: 'Animal slaughtering',
  PCU311615311615: 'Poultry processing',
  PCU311712311712: 'Fresh and frozen seafood',

  // Paper products (disposables)
  PCU322130322130: 'Paperboard container manufacturing',
  PCU3222213222211: 'Fiber can, tube, drum manufacturing',

  // Plastics (food containers)
  PCU3261933261931: 'Plastics packaging film/sheet',
};

interface PPIDataResponse {
  seriesId: string;
  seriesName: string;
  latestValue: number;
  latestPeriod: string;
  percentChangeMonthly: number | null;
  percentChangeAnnual: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const apiKey = Deno.env.get('BLS_API_KEY');

    if (!apiKey) {
      throw new Error('BLS_API_KEY not configured');
    }

    // Check cache first
    const cached = await checkCache(supabase, CACHE_KEY, CACHE_TTL_MINUTES);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate date range (last 13 months for annual comparison)
    const endYear = new Date().getFullYear();
    const startYear = endYear - 1;

    // BLS API request payload
    const payload = {
      seriesid: Object.keys(PPI_SERIES),
      startyear: startYear.toString(),
      endyear: endYear.toString(),
      registrationkey: apiKey,
      calculations: true,
      annualaverage: false,
    };

    const response = await fetch(BLS_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`BLS API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'REQUEST_SUCCEEDED') {
      throw new Error(`BLS API error: ${data.message || 'Unknown error'}`);
    }

    const results: PPIDataResponse[] = [];

    for (const series of data.Results?.series || []) {
      const seriesId = series.seriesID;
      const seriesName = PPI_SERIES[seriesId as keyof typeof PPI_SERIES] || seriesId;
      const seriesData = series.data || [];

      if (seriesData.length >= 1) {
        const latest = seriesData[0];
        const priorMonth = seriesData[1];
        const yearAgo = seriesData.find(
          (d: { year: string; period: string }) =>
            d.year === (parseInt(latest.year) - 1).toString() &&
            d.period === latest.period
        );

        const latestValue = parseFloat(latest.value);
        const priorValue = priorMonth ? parseFloat(priorMonth.value) : null;
        const yearAgoValue = yearAgo ? parseFloat(yearAgo.value) : null;

        const result: PPIDataResponse = {
          seriesId,
          seriesName,
          latestValue,
          latestPeriod: `${latest.year}-${latest.period.replace('M', '')}`,
          percentChangeMonthly: priorValue
            ? parseFloat((((latestValue - priorValue) / priorValue) * 100).toFixed(2))
            : null,
          percentChangeAnnual: yearAgoValue
            ? parseFloat((((latestValue - yearAgoValue) / yearAgoValue) * 100).toFixed(2))
            : null,
        };

        results.push(result);

        // Store in database
        await supabase.from('ppi_data').upsert(
          {
            period_date: `${latest.year}-${latest.period.replace('M', '')}-01`,
            series_id: seriesId,
            series_name: seriesName,
            index_value: latestValue,
            percent_change_monthly: result.percentChangeMonthly,
            percent_change_annual: result.percentChangeAnnual,
          },
          { onConflict: 'period_date,series_id' }
        );
      }
    }

    // Cache the results
    await setCache(supabase, CACHE_KEY, 'bls/ppi', results, CACHE_TTL_MINUTES);

    // Track API usage
    await incrementApiUsage(supabase, 'bls');

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching PPI data:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch PPI data' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
