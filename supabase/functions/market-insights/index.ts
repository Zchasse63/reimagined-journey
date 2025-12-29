import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, checkCache, setCache } from '../_shared/supabase.ts';

const CACHE_TTL_MINUTES = 60; // 1 hour

interface MarketInsight {
  dieselPrices: {
    region: string;
    regionName: string;
    pricePerGallon: number;
    weekOf: string;
    trend: 'up' | 'down' | 'stable';
    changePercent: number | null;
  } | null;
  ppiTrends: {
    packaging: {
      name: string;
      value: number;
      changeAnnual: number | null;
    } | null;
    proteins: {
      name: string;
      value: number;
      changeAnnual: number | null;
    } | null;
  };
  lastUpdated: string;
}

// Map states to EIA regions
const stateToRegion: Record<string, string> = {
  Georgia: 'LOWER_ATLANTIC',
  Florida: 'LOWER_ATLANTIC',
  'South Carolina': 'LOWER_ATLANTIC',
  'North Carolina': 'LOWER_ATLANTIC',
  Alabama: 'GULF_COAST',
  Mississippi: 'GULF_COAST',
  Tennessee: 'GULF_COAST',
  Texas: 'GULF_COAST',
  Oklahoma: 'GULF_COAST',
  Ohio: 'MIDWEST',
  Indiana: 'MIDWEST',
  Illinois: 'MIDWEST',
  Missouri: 'MIDWEST',
  Kentucky: 'MIDWEST',
  Virginia: 'LOWER_ATLANTIC',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || 'Georgia';
    const region = stateToRegion[state] || 'LOWER_ATLANTIC';

    const cacheKey = `market_insights_${region}`;
    const supabase = getSupabaseClient();

    // Check cache first
    const cached = await checkCache(supabase, cacheKey, CACHE_TTL_MINUTES);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get latest diesel prices for the region
    const { data: dieselData } = await supabase
      .from('diesel_prices')
      .select('*')
      .eq('region', region)
      .order('week_of', { ascending: false })
      .limit(2);

    let dieselInsight = null;
    if (dieselData && dieselData.length > 0) {
      const current = dieselData[0];
      const prior = dieselData[1];
      const change = prior
        ? ((current.price_per_gallon - prior.price_per_gallon) / prior.price_per_gallon) * 100
        : 0;

      dieselInsight = {
        region: current.region,
        regionName:
          region === 'LOWER_ATLANTIC'
            ? 'Southeast'
            : region === 'GULF_COAST'
            ? 'Gulf Coast'
            : 'Midwest',
        pricePerGallon: current.price_per_gallon,
        weekOf: current.week_of,
        trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
        changePercent: parseFloat(change.toFixed(2)),
      };
    }

    // Get latest PPI data for packaging and proteins
    const { data: ppiData } = await supabase
      .from('ppi_data')
      .select('*')
      .in('series_id', ['PCU322130322130', 'PCU311615311615'])
      .order('period_date', { ascending: false })
      .limit(4);

    let packagingPPI = null;
    let proteinPPI = null;

    if (ppiData) {
      const packaging = ppiData.find((d) => d.series_id === 'PCU322130322130');
      const proteins = ppiData.find((d) => d.series_id === 'PCU311615311615');

      if (packaging) {
        packagingPPI = {
          name: 'Paperboard Containers',
          value: packaging.index_value,
          changeAnnual: packaging.percent_change_annual,
        };
      }

      if (proteins) {
        proteinPPI = {
          name: 'Animal Processing',
          value: proteins.index_value,
          changeAnnual: proteins.percent_change_annual,
        };
      }
    }

    const result: MarketInsight = {
      dieselPrices: dieselInsight,
      ppiTrends: {
        packaging: packagingPPI,
        proteins: proteinPPI,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    await setCache(supabase, cacheKey, 'market-insights', result, CACHE_TTL_MINUTES);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching market insights:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch market insights' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
