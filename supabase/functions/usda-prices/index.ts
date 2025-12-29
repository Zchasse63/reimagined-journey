import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getSupabaseClient,
  checkCache,
  setCache,
  incrementApiUsage,
} from '../_shared/supabase.ts';

const USDA_BASE_URL = 'https://mpr.datamart.ams.usda.gov/services/v1.1/reports';
const CACHE_KEY = 'usda_protein_prices';
const CACHE_TTL_MINUTES = 60 * 4; // 4 hours - USDA updates daily around 3 PM CT

// Key USDA report slugs for protein pricing
const REPORTS = {
  // Boxed Beef
  LM_XB403: 'National Daily Boxed Beef Cutout and Boxed Beef Cuts',
  // Pork Cutout
  LM_PK602: 'National Daily Pork - Negotiated',
  // Chicken
  AJ_PY004: 'National Weekly Whole Broiler/Fryer Report',
};

interface ProteinPrice {
  commodity: string;
  cutType: string;
  priceAvg: number;
  priceLow: number;
  priceHigh: number;
  unit: string;
  reportDate: string;
  changeFromPrior: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();

    // Check cache first
    const cached = await checkCache(supabase, CACHE_KEY, CACHE_TTL_MINUTES);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: ProteinPrice[] = [];

    // Fetch Boxed Beef data
    try {
      const beefUrl = `${USDA_BASE_URL}/LM_XB403`;
      const beefResponse = await fetch(beefUrl);

      if (beefResponse.ok) {
        const beefData = await beefResponse.json();
        const beefResults = beefData.results || [];

        // Get the most recent report
        if (beefResults.length > 0) {
          const latestReport = beefResults[0];

          // Choice Cutout
          if (latestReport.choice_600_900_wt) {
            results.push({
              commodity: 'Beef',
              cutType: 'Choice Cutout',
              priceAvg: parseFloat(latestReport.choice_600_900_wt) || 0,
              priceLow: parseFloat(latestReport.choice_600_900_low) || 0,
              priceHigh: parseFloat(latestReport.choice_600_900_high) || 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }

          // Select Cutout
          if (latestReport.select_600_900_wt) {
            results.push({
              commodity: 'Beef',
              cutType: 'Select Cutout',
              priceAvg: parseFloat(latestReport.select_600_900_wt) || 0,
              priceLow: parseFloat(latestReport.select_600_900_low) || 0,
              priceHigh: parseFloat(latestReport.select_600_900_high) || 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching beef data:', e);
    }

    // Fetch Pork data
    try {
      const porkUrl = `${USDA_BASE_URL}/LM_PK602`;
      const porkResponse = await fetch(porkUrl);

      if (porkResponse.ok) {
        const porkData = await porkResponse.json();
        const porkResults = porkData.results || [];

        if (porkResults.length > 0) {
          const latestReport = porkResults[0];

          if (latestReport.wtd_avg) {
            results.push({
              commodity: 'Pork',
              cutType: 'Carcass Cutout',
              priceAvg: parseFloat(latestReport.wtd_avg) || 0,
              priceLow: parseFloat(latestReport.low_price) || 0,
              priceHigh: parseFloat(latestReport.high_price) || 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching pork data:', e);
    }

    // Store in database for historical tracking
    for (const result of results) {
      await supabase.from('protein_prices').upsert(
        {
          report_date: result.reportDate,
          commodity: result.commodity,
          cut_type: result.cutType,
          price_avg: result.priceAvg,
          price_low: result.priceLow,
          price_high: result.priceHigh,
          unit: result.unit,
        },
        { onConflict: 'report_date,commodity,cut_type' }
      );
    }

    // Calculate changes from prior day
    for (const result of results) {
      const { data: priorData } = await supabase
        .from('protein_prices')
        .select('price_avg')
        .eq('commodity', result.commodity)
        .eq('cut_type', result.cutType)
        .lt('report_date', result.reportDate)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (priorData) {
        result.changeFromPrior = parseFloat(
          (result.priceAvg - priorData.price_avg).toFixed(2)
        );
      }
    }

    // Cache the results
    await setCache(supabase, CACHE_KEY, 'usda/lmpr', results, CACHE_TTL_MINUTES);

    // Track API usage
    await incrementApiUsage(supabase, 'usda');

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching USDA prices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch USDA prices' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
