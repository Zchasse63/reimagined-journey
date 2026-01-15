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

// USDA report slug IDs (numeric IDs, not report names)
// API requires: /reports/{slug_id}/{section_name}
const REPORTS = {
  // Boxed Beef - LM_XB403
  BEEF_CUTOUT: { id: '2453', section: 'Current Cutout Values' },
  // Pork Cutout - LM_PK602
  PORK_CUTOUT: { id: '2498', section: 'Cutout and Primal Values' },
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

    // Fetch Boxed Beef data using correct API structure
    try {
      const beefUrl = `${USDA_BASE_URL}/${REPORTS.BEEF_CUTOUT.id}/${encodeURIComponent(REPORTS.BEEF_CUTOUT.section)}`;
      const beefResponse = await fetch(beefUrl);

      if (beefResponse.ok) {
        const beefData = await beefResponse.json();
        const beefResults = beefData.results || [];

        // Get the most recent report
        if (beefResults.length > 0) {
          const latestReport = beefResults[0];

          // Choice Cutout (field: choice_600_900_current)
          if (latestReport.choice_600_900_current) {
            results.push({
              commodity: 'Beef',
              cutType: 'Choice Cutout',
              priceAvg: parseFloat(latestReport.choice_600_900_current) || 0,
              priceLow: 0,
              priceHigh: 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }

          // Select Cutout (field: select_600_900_current)
          if (latestReport.select_600_900_current) {
            results.push({
              commodity: 'Beef',
              cutType: 'Select Cutout',
              priceAvg: parseFloat(latestReport.select_600_900_current) || 0,
              priceLow: 0,
              priceHigh: 0,
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

    // Fetch Pork data using correct API structure
    try {
      const porkUrl = `${USDA_BASE_URL}/${REPORTS.PORK_CUTOUT.id}/${encodeURIComponent(REPORTS.PORK_CUTOUT.section)}`;
      const porkResponse = await fetch(porkUrl);

      if (porkResponse.ok) {
        const porkData = await porkResponse.json();
        const porkResults = porkData.results || [];

        if (porkResults.length > 0) {
          const latestReport = porkResults[0];

          // Pork Carcass Cutout
          if (latestReport.pork_carcass) {
            results.push({
              commodity: 'Pork',
              cutType: 'Carcass Cutout',
              priceAvg: parseFloat(latestReport.pork_carcass) || 0,
              priceLow: 0,
              priceHigh: 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }

          // Pork Loin
          if (latestReport.pork_loin) {
            results.push({
              commodity: 'Pork',
              cutType: 'Loin',
              priceAvg: parseFloat(latestReport.pork_loin) || 0,
              priceLow: 0,
              priceHigh: 0,
              unit: 'cwt',
              reportDate: latestReport.report_date,
              changeFromPrior: null,
            });
          }

          // Pork Belly
          if (latestReport.pork_belly) {
            results.push({
              commodity: 'Pork',
              cutType: 'Belly',
              priceAvg: parseFloat(latestReport.pork_belly) || 0,
              priceLow: 0,
              priceHigh: 0,
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
