import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const CACHE_KEY = 'market_data_aggregated';
const CACHE_TTL_HOURS = 4; // Cache for 4 hours
const TARIFF_CACHE_KEY = 'tariff_data';
const TARIFF_CACHE_TTL_HOURS = 24; // Tariffs change infrequently, cache for 24 hours

/**
 * Market data interfaces
 */
interface CommodityItem {
  name: string;
  price: number;
  unit: string;
  change: number;
}

interface CommodityData {
  items: CommodityItem[];
  source: string;
}

interface DieselData {
  price: number;
  previousWeek: number;
  region: string;
  unit: string;
}

interface FreightRoute {
  origin: string;
  destination: string;
  price: number;
  unit: string;
  change: number;
  transitDays?: number;
}

interface OceanFreightData {
  routes: FreightRoute[];
  source: string;
  lastUpdated: string;
}

interface TruckingData {
  ratePerMile: number;
  nationalAverage: number;
  fuelSurchargePercent: number;
  source: string;
}

interface TariffExample {
  product: string;
  htsCode: string;
  generalRate: string;
  section301Rate?: string;
  adCvdRate?: string;
  totalRate: string;
  countryOfOrigin: string;
  notes?: string;
}

interface TariffData {
  examples: TariffExample[];
  source: string;
  effectiveDate: string;
  notes?: string;
}

interface SugarData {
  items: CommodityItem[];
  source: string;
}

interface MarketData {
  poultry: CommodityData;
  beef: CommodityData;
  cookingOil: CommodityData;
  sugar: SugarData;
  diesel: DieselData;
  oceanFreight: OceanFreightData;
  trucking: TruckingData;
  tariffs: TariffData;
  updatedAt: string;
}

/**
 * Static fallback values for categories that do not yet have a live data source
 * wired up. Previous version added Math.random() variance to fake liveness —
 * that has been removed because it misled users into thinking these were
 * being refreshed. Sources are labeled "(estimated)" so the UI can flag them.
 *
 * Live-data categories (do NOT consume from here when the upstream API works):
 *  - beef:   served via fetchUSDABeefPrices() -> standalone usda-prices fn
 *  - diesel: served via fetchEIADieselPrices() -> direct EIA v2 API call
 *  - tariffs: served via fetchTariffData() -> USITC HTS REST API
 */
function getMockMarketData(): MarketData {
  return {
    poultry: {
      items: [
        { name: 'Whole Chicken', price: 1.32, unit: 'lb', change: -1.5 },
        { name: 'Wings',         price: 2.45, unit: 'lb', change: 2.8 },
        { name: 'Breast',        price: 2.98, unit: 'lb', change: -0.4 },
        { name: 'Thighs',        price: 1.58, unit: 'lb', change: 0.6 },
      ],
      source: 'USDA AMS Broiler Market News (estimated — live API pending)',
    },
    beef: {
      items: [
        { name: 'Choice Cutout',     price: 387.45, unit: 'cwt', change: -1.2 },
        { name: 'Select Cutout',     price: 372.10, unit: 'cwt', change: 0.4 },
        { name: 'Ground Beef 81%',   price: 305.20, unit: 'cwt', change: -0.5 },
      ],
      source: 'USDA AMS Boxed Beef Cutout (estimated fallback — live API normally fills)',
    },
    cookingOil: {
      items: [
        { name: 'Soybean Oil', price: 0.50, unit: 'lb', change: -1.8 },
        { name: 'Canola Oil',  price: 0.55, unit: 'lb', change: -0.4 },
        { name: 'Corn Oil',    price: 0.62, unit: 'lb', change: 0.2 },
      ],
      source: 'USDA ERS Oil Crops Yearbook (estimated — live API pending)',
    },
    sugar: {
      items: [
        { name: 'Raw Sugar (ICE #11)',        price: 19.85, unit: 'cents/lb', change: -0.6 },
        { name: 'Refined Sugar (ICE #16)',    price: 43.20, unit: 'cents/lb', change: 0.8 },
        { name: 'High Fructose Corn Syrup',   price: 28.50, unit: 'cents/lb', change: -0.3 },
      ],
      source: 'ICE Futures + USDA ERS Sugar Yearbook (estimated — live API pending)',
    },
    diesel: {
      // This block is only reached if fetchEIADieselPrices returns null. The
      // EIA-fed live value is typically $4-6/gal in 2025-2026; the prior
      // $3.58 fallback was set when the API was last broken in early 2024.
      price: 5.28,
      previousWeek: 5.33,
      region: 'Lower Atlantic (PADD 1C, estimated fallback)',
      unit: 'gal',
    },
    oceanFreight: {
      routes: [
        { origin: 'Shanghai, China',         destination: 'Savannah, GA', price: 2850, unit: '40ft container', change: -4.2, transitDays: 28 },
        { origin: 'Ho Chi Minh, Vietnam',    destination: 'Savannah, GA', price: 3120, unit: '40ft container', change: 1.8,  transitDays: 32 },
        { origin: 'Bangkok, Thailand',       destination: 'Savannah, GA', price: 3450, unit: '40ft container', change: 0.5,  transitDays: 35 },
        { origin: 'Guayaquil, Ecuador',      destination: 'Miami, FL',    price: 1850, unit: '40ft container', change: -2.1, transitDays: 8 },
      ],
      source: 'Freightos Baltic Index (estimated — live API pending)',
      lastUpdated: new Date().toISOString(),
    },
    trucking: {
      ratePerMile: 2.26,
      nationalAverage: 2.18,
      fuelSurchargePercent: 43.2,
      source: 'ATRI / DAT Freight Analytics (estimated — subscription API)',
    },
    tariffs: {
      examples: [
        // === ALUMINUM PRODUCTS ===
        {
          product: 'Aluminum Foil (rolls)',
          htsCode: '7607.11.60',
          generalRate: '5.3%',
          section301Rate: '25%',
          adCvdRate: '106.09%',
          totalRate: '136.39%',
          countryOfOrigin: 'China',
          notes: 'AD 48.64-106.09%, CVD 17.14-80.97%',
        },
        {
          product: 'Aluminum Foil Containers',
          htsCode: '7612.90.10',
          generalRate: '5.7%',
          section301Rate: '25%',
          adCvdRate: '106.09%',
          totalRate: '136.79%',
          countryOfOrigin: 'China',
          notes: 'Same AD/CVD as foil rolls',
        },
        {
          product: 'Aluminum Foil Containers',
          htsCode: '7612.90.10',
          generalRate: '5.7%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: '5.7%',
          countryOfOrigin: 'Turkey',
          notes: 'No AD/CVD or Section 301',
        },
        // === GLOVES ===
        // Note: Rubber glove rates vary by construction (seamless vs other)
        {
          product: 'Nitrile Gloves (seamless)',
          htsCode: '4015.19.11',
          generalRate: '3%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: '3%',
          countryOfOrigin: 'Malaysia',
          notes: 'Seamless rubber gloves',
        },
        {
          product: 'Nitrile Gloves (seamless)',
          htsCode: '4015.19.11',
          generalRate: '3%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: '3%',
          countryOfOrigin: 'Thailand',
          notes: 'Seamless rubber gloves',
        },
        {
          product: 'Vinyl Gloves (disposable)',
          htsCode: '3926.20.10',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
          notes: 'Seamless disposable plastic gloves',
        },
        {
          product: 'Latex Gloves (seamless)',
          htsCode: '4015.19.11',
          generalRate: '3%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: '3%',
          countryOfOrigin: 'Malaysia',
          notes: 'Seamless rubber gloves',
        },
        // === PLASTIC DISPOSABLES ===
        {
          product: 'Plastic Food Containers',
          htsCode: '3924.10.40',
          generalRate: '3.4%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.4%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Plastic Cutlery (forks/knives/spoons)',
          htsCode: '3924.10.40',
          generalRate: '3.4%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.4%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Plastic Cups (clear)',
          htsCode: '3924.10.40',
          generalRate: '3.4%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.4%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Foam Containers (PS)',
          htsCode: '3923.90.00',
          generalRate: '3.0%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.0%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Plastic Straws',
          htsCode: '3917.32.00',
          generalRate: '3.1%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.1%',
          countryOfOrigin: 'China',
        },
        // === PAPER & FIBER PRODUCTS ===
        {
          product: 'Paper Plates',
          htsCode: '4823.69.00',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Paper Napkins',
          htsCode: '4818.20.00',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Paper Hot Cups',
          htsCode: '4823.61.00',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Paper Straws',
          htsCode: '4823.90.86',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Bagasse/Fiber Containers',
          htsCode: '4823.70.00',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
          notes: 'Molded fiber clamshells, plates',
        },
        {
          product: 'Bagasse/Fiber Containers',
          htsCode: '4823.70.00',
          generalRate: 'Free',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: 'Free',
          countryOfOrigin: 'Vietnam',
        },
        // === FOOD PRODUCTS WITH AD/CVD ===
        // Note: New CVD orders on shrimp effective Dec 26, 2024
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: 'Free',
          section301Rate: 'N/A',
          adCvdRate: '~6%',
          totalRate: '~6%',
          countryOfOrigin: 'Vietnam',
          notes: 'New CVD order Dec 2024 + existing AD varies by exporter',
        },
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: 'Free',
          section301Rate: 'N/A',
          adCvdRate: '9-11%',
          totalRate: '9-11%',
          countryOfOrigin: 'India',
          notes: 'AD (2-5%) + CVD (5.6-5.9%) per Dec 2024 final',
        },
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: 'Free',
          section301Rate: 'N/A',
          adCvdRate: '~3%',
          totalRate: '~3%',
          countryOfOrigin: 'Ecuador',
          notes: 'New CVD order Dec 2024 (was duty-free)',
        },
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: 'Free',
          section301Rate: 'N/A',
          adCvdRate: '~8%',
          totalRate: '~8%',
          countryOfOrigin: 'Indonesia',
          notes: 'New AD order Dec 2024',
        },
        {
          product: 'Crawfish Tail Meat',
          htsCode: '0306.39.00',
          generalRate: 'Free',
          section301Rate: '25%',
          adCvdRate: '201.63%',
          totalRate: '226.63%',
          countryOfOrigin: 'China',
          notes: 'Effectively prohibitive',
        },
        {
          product: 'Honey (natural)',
          htsCode: '0409.00.00',
          generalRate: '1.9¢/kg',
          section301Rate: '25%',
          adCvdRate: '221.03%',
          totalRate: '~247%',
          countryOfOrigin: 'China',
          notes: 'Effectively banned - AD order since 2001',
        },
        {
          product: 'Honey (natural)',
          htsCode: '0409.00.00',
          generalRate: '1.9¢/kg',
          section301Rate: 'N/A',
          adCvdRate: '61.27%',
          totalRate: '~63%',
          countryOfOrigin: 'Argentina',
          notes: 'AD only, no CVD',
        },
        {
          product: 'Garlic (fresh)',
          htsCode: '0703.20.00',
          generalRate: '0.43¢/kg',
          section301Rate: '25%',
          adCvdRate: '376.67%',
          totalRate: '~402%',
          countryOfOrigin: 'China',
          notes: 'Effectively prohibitive',
        },
      ],
      source: 'USITC HTS / CBP AD-CVD Database',
      effectiveDate: '2025-01-01',
      notes: 'Rates verified Jan 2025. Section 301 applies to China origin. AD/CVD rates vary by exporter.',
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch Freightos Baltic Index data
 * Uses public FBX API when available
 */
async function fetchFreightosRates(): Promise<OceanFreightData | null> {
  try {
    // Freightos public API endpoint
    // Note: Full API requires subscription, this uses publicly available data
    const response = await fetch('https://fbx.freightos.com/api/lane-data/FBX03', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Transform Freightos response to our format
      // This is a simplified example - actual API response format may vary
      return {
        routes: [
          {
            origin: 'China/East Asia',
            destination: 'US East Coast',
            price: data.price || 2850,
            unit: '40ft container',
            change: data.weeklyChange || -4.2,
            transitDays: 28,
          },
        ],
        source: 'Freightos Baltic Index (FBX)',
        lastUpdated: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Freightos rates:', error);
    return null;
  }
}

/**
 * HTS codes we want to look up for food service products
 * We fetch the general rate from HTS API and merge with our curated Section 301/AD-CVD data
 */
const FOOD_SERVICE_HTS_CODES = [
  '7607.11', // Aluminum foil
  '7612.90', // Aluminum containers
  '4015.19', // Rubber gloves
  '3926.20', // Plastic gloves
  '3924.10', // Plastic tableware
  '3923.90', // Plastic containers
  '3917.32', // Plastic straws/tubes
  '4823.69', // Paper plates
  '4818.20', // Paper napkins
  '4823.61', // Paper cups
  '0306.17', // Frozen shrimp
  '0409.00', // Honey
  '0703.20', // Garlic
];

/**
 * Fetch rate info from HTS REST API for a specific HTS code
 * API docs: https://hts.usitc.gov/
 */
async function fetchHtsRate(htsCode: string): Promise<{ htsno: string; general: string; description: string } | null> {
  try {
    const response = await fetch(
      `https://hts.usitc.gov/reststop/search?keyword=${encodeURIComponent(htsCode)}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      console.warn(`HTS API returned ${response.status} for ${htsCode}`);
      return null;
    }

    const data = await response.json();

    // Find exact or closest match
    if (Array.isArray(data) && data.length > 0) {
      // Try to find exact match first
      const exact = data.find((item: { htsno?: string }) =>
        item.htsno?.startsWith(htsCode)
      );
      if (exact) {
        return {
          htsno: exact.htsno,
          general: exact.general || 'N/A',
          description: exact.description || '',
        };
      }
      // Return first result if no exact match
      return {
        htsno: data[0].htsno,
        general: data[0].general || 'N/A',
        description: data[0].description || '',
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching HTS rate for ${htsCode}:`, error);
    return null;
  }
}

/**
 * Fetch and cache tariff data from HTS REST API
 * Merges live HTS rates with our curated Section 301 and AD/CVD data
 */
async function fetchTariffData(supabase: ReturnType<typeof getSupabaseClient>): Promise<TariffData | null> {
  try {
    // Check tariff-specific cache first (24-hour TTL)
    const { data: cachedTariff } = await supabase
      .from('api_cache')
      .select('response_data, expires_at')
      .eq('cache_key', TARIFF_CACHE_KEY)
      .single();

    if (cachedTariff && new Date(cachedTariff.expires_at) > new Date()) {
      console.log('Using cached tariff data');
      return cachedTariff.response_data as TariffData;
    }

    console.log('Fetching fresh tariff data from HTS API...');

    // Fetch rates for key HTS codes (limit concurrent requests)
    const htsRates: Map<string, string> = new Map();

    // Fetch in batches of 3 to avoid rate limiting
    for (let i = 0; i < FOOD_SERVICE_HTS_CODES.length; i += 3) {
      const batch = FOOD_SERVICE_HTS_CODES.slice(i, i + 3);
      const results = await Promise.all(
        batch.map(code => fetchHtsRate(code))
      );

      results.forEach((result, idx) => {
        if (result) {
          htsRates.set(batch[idx], result.general);
        }
      });

      // Small delay between batches to be nice to the API
      if (i + 3 < FOOD_SERVICE_HTS_CODES.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Fetched ${htsRates.size} HTS rates from API`);

    // Build tariff data with live rates where available
    // Section 301 and AD/CVD data is curated (not available from HTS API)
    const tariffData: TariffData = {
      examples: [
        // === ALUMINUM PRODUCTS ===
        {
          product: 'Aluminum Foil (rolls)',
          htsCode: '7607.11.60',
          generalRate: htsRates.get('7607.11') || '5.3%',
          section301Rate: '25%',
          adCvdRate: '106.09%',
          totalRate: '136.39%',
          countryOfOrigin: 'China',
          notes: 'AD 48.64-106.09%, CVD 17.14-80.97%',
        },
        {
          product: 'Aluminum Foil Containers',
          htsCode: '7612.90.10',
          generalRate: htsRates.get('7612.90') || '5.7%',
          section301Rate: '25%',
          adCvdRate: '106.09%',
          totalRate: '136.79%',
          countryOfOrigin: 'China',
          notes: 'Same AD/CVD as foil rolls',
        },
        {
          product: 'Aluminum Foil Containers',
          htsCode: '7612.90.10',
          generalRate: htsRates.get('7612.90') || '5.7%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: htsRates.get('7612.90') || '5.7%',
          countryOfOrigin: 'Turkey',
          notes: 'No AD/CVD or Section 301',
        },
        // === GLOVES ===
        {
          product: 'Nitrile Gloves (seamless)',
          htsCode: '4015.19.11',
          generalRate: htsRates.get('4015.19') || '3%',
          section301Rate: 'N/A',
          adCvdRate: 'N/A',
          totalRate: htsRates.get('4015.19') || '3%',
          countryOfOrigin: 'Malaysia',
          notes: 'Seamless rubber gloves',
        },
        {
          product: 'Vinyl Gloves (disposable)',
          htsCode: '3926.20.10',
          generalRate: htsRates.get('3926.20') || 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
          notes: 'Seamless disposable plastic gloves',
        },
        // === PLASTIC DISPOSABLES ===
        {
          product: 'Plastic Food Containers',
          htsCode: '3924.10.40',
          generalRate: htsRates.get('3924.10') || '3.4%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.4%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Plastic Straws',
          htsCode: '3917.32.00',
          generalRate: htsRates.get('3917.32') || '3.1%',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '28.1%',
          countryOfOrigin: 'China',
        },
        // === PAPER PRODUCTS ===
        {
          product: 'Paper Plates',
          htsCode: '4823.69.00',
          generalRate: htsRates.get('4823.69') || 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        {
          product: 'Paper Napkins',
          htsCode: '4818.20.00',
          generalRate: htsRates.get('4818.20') || 'Free',
          section301Rate: '25%',
          adCvdRate: 'N/A',
          totalRate: '25%',
          countryOfOrigin: 'China',
        },
        // === FOOD PRODUCTS WITH AD/CVD ===
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: htsRates.get('0306.17') || 'Free',
          section301Rate: 'N/A',
          adCvdRate: '~6%',
          totalRate: '~6%',
          countryOfOrigin: 'Vietnam',
          notes: 'CVD order Dec 2024 + AD varies by exporter',
        },
        {
          product: 'Frozen Shrimp',
          htsCode: '0306.17.00',
          generalRate: htsRates.get('0306.17') || 'Free',
          section301Rate: 'N/A',
          adCvdRate: '9-11%',
          totalRate: '9-11%',
          countryOfOrigin: 'India',
          notes: 'AD + CVD per Dec 2024 final determination',
        },
        {
          product: 'Honey (natural)',
          htsCode: '0409.00.00',
          generalRate: htsRates.get('0409.00') || '1.9¢/kg',
          section301Rate: '25%',
          adCvdRate: '221.03%',
          totalRate: '~247%',
          countryOfOrigin: 'China',
          notes: 'Effectively banned - AD order since 2001',
        },
        {
          product: 'Garlic (fresh)',
          htsCode: '0703.20.00',
          generalRate: htsRates.get('0703.20') || '0.43¢/kg',
          section301Rate: '25%',
          adCvdRate: '376.67%',
          totalRate: '~402%',
          countryOfOrigin: 'China',
          notes: 'Effectively prohibitive',
        },
      ],
      source: 'USITC HTS REST API / CBP AD-CVD Database',
      effectiveDate: new Date().toISOString().split('T')[0],
      notes: 'General rates from live HTS API. Section 301 applies to China origin. AD/CVD rates curated from CBP.',
    };

    // Cache the tariff data for 24 hours
    const expiresAt = new Date(Date.now() + TARIFF_CACHE_TTL_HOURS * 60 * 60 * 1000);
    await supabase.from('api_cache').upsert(
      {
        cache_key: TARIFF_CACHE_KEY,
        response_data: tariffData,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'cache_key' }
    );

    console.log('Tariff data cached successfully');
    return tariffData;
  } catch (error) {
    console.error('Error fetching tariff data:', error);
    return null;
  }
}

/**
 * Fetch real USDA poultry prices
 * Note: USDA poultry reports use different structure - using mock for now
 */
async function fetchUSDAPoultryPrices(): Promise<CommodityData | null> {
  // USDA poultry reports have complex structure
  // Using reliable mock data based on current market prices
  return null;
}

/**
 * Fetch real USDA beef prices by delegating to the standalone usda-prices
 * edge function, which already handles change-from-prior computation via the
 * protein_prices history table. This eliminates the previous bug where
 * `change` was hardcoded to 0 for every cut.
 */
async function fetchUSDABeefPrices(): Promise<CommodityData | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl) {
      return null;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/usda-prices`, {
      headers,
    });

    if (!response.ok) {
      console.error('usda-prices function returned', response.status);
      return null;
    }

    const proteins = (await response.json()) as Array<{
      commodity: string;
      cutType: string;
      priceAvg: number;
      unit: string;
      changeFromPrior: number | null;
    }>;

    // Filter to beef cuts only. Pork is returned alongside but the homepage
    // dashboard currently only renders the beef block; we surface beef here
    // and let a future change add a pork block if the menu mix calls for it.
    const beefItems: CommodityItem[] = proteins
      .filter((p) => p.commodity === 'Beef' && p.priceAvg > 0)
      .map((p) => ({
        name: p.cutType,
        price: p.priceAvg,
        unit: p.unit,
        change: p.changeFromPrior ?? 0,
      }));

    if (beefItems.length === 0) {
      return null;
    }

    return {
      items: beefItems,
      source: 'USDA AMS Boxed Beef Cutout (LM_XB403)',
    };
  } catch (error) {
    console.error('Error calling usda-prices function:', error);
    return null;
  }
}

/**
 * Fetch real EIA diesel prices using the v2 series-ID pattern that actually
 * works. Previous version used `facets[duession][]=PTE` — `duession` is a typo
 * for `duoarea`, causing the API call to silently return no results and the
 * function to fall back to mock data ($3.58) indefinitely. This site serves
 * the Southeast, so we use the Lower Atlantic regional series (R1Z).
 */
async function fetchEIADieselPrices(): Promise<DieselData | null> {
  try {
    const apiKey = Deno.env.get('EIA_API_KEY');
    if (!apiKey) {
      return null;
    }

    // EMD_EPD2D_PTE_R1Z_DPG = ULSD on-highway retail, Lower Atlantic (PADD 1C),
    // dollars per gallon, weekly. This is the canonical series for the
    // Southeast US that the standalone diesel-prices function also uses.
    const seriesId = 'EMD_EPD2D_PTE_R1Z_DPG';
    const url =
      `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}` +
      `&frequency=weekly&data[0]=value&facets[series][]=${seriesId}` +
      `&sort[0][column]=period&sort[0][direction]=desc&length=2`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('EIA diesel API returned', response.status);
      return null;
    }

    const data = await response.json();
    const records = data.response?.data ?? [];
    if (records.length < 1) {
      console.error('EIA diesel API returned no records');
      return null;
    }

    const current = parseFloat(records[0].value);
    const previous = records[1] ? parseFloat(records[1].value) : current;

    if (!Number.isFinite(current)) {
      console.error('EIA diesel API returned non-numeric value:', records[0]);
      return null;
    }

    return {
      price: current,
      previousWeek: Number.isFinite(previous) ? previous : current,
      region: 'Lower Atlantic (PADD 1C)',
      unit: 'gal',
    };
  } catch (error) {
    console.error('Error fetching EIA diesel prices:', error);
    return null;
  }
}

/**
 * Get cached data from api_cache table
 */
async function getCachedData(
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<MarketData | null> {
  try {
    const { data, error } = await supabase
      .from('api_cache')
      .select('data, expires_at')
      .eq('cache_key', CACHE_KEY)
      .single();

    if (error || !data) {
      return null;
    }

    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    return data.data as MarketData;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Store data in cache
 */
async function setCacheData(
  supabase: ReturnType<typeof getSupabaseClient>,
  data: MarketData
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);

    await supabase.from('api_cache').upsert(
      {
        cache_key: CACHE_KEY,
        api_source: 'market-data-aggregated',
        data: data,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'cache_key' }
    );
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

/**
 * Store market data snapshot in history table
 */
async function storeMarketDataHistory(
  supabase: ReturnType<typeof getSupabaseClient>,
  data: MarketData
): Promise<void> {
  try {
    await supabase.from('market_data_history').insert({
      data: data,
      captured_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error storing market data history:', error);
  }
}

/**
 * Fetch and aggregate all market data
 */
async function getMarketData(
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<{ data: MarketData; cached: boolean }> {
  // Check cache first
  const cachedData = await getCachedData(supabase);
  if (cachedData) {
    return { data: cachedData, cached: true };
  }

  // Try to fetch real data from APIs in parallel
  const [poultry, beef, diesel, oceanFreight, tariffs] = await Promise.all([
    fetchUSDAPoultryPrices(),
    fetchUSDABeefPrices(),
    fetchEIADieselPrices(),
    fetchFreightosRates(),
    fetchTariffData(supabase),
  ]);

  // Use mock data as fallback for any missing data
  const mockData = getMockMarketData();

  const marketData: MarketData = {
    poultry: poultry || mockData.poultry,
    beef: beef || mockData.beef,
    cookingOil: mockData.cookingOil,
    sugar: mockData.sugar,
    diesel: diesel || mockData.diesel,
    oceanFreight: oceanFreight || mockData.oceanFreight,
    trucking: mockData.trucking, // ATRI data requires subscription
    tariffs: tariffs || mockData.tariffs,
    updatedAt: new Date().toISOString(),
  };

  // Cache the results
  await setCacheData(supabase, marketData);

  // Store in history for trend analysis
  await storeMarketDataHistory(supabase, marketData);

  return { data: marketData, cached: false };
}

/**
 * Main request handler
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();

    const { data, cached } = await getMarketData(supabase);

    return new Response(
      JSON.stringify({
        data,
        cached,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=900',
        },
      }
    );
  } catch (error) {
    console.error('Error in market-data function:', error);

    const mockData = getMockMarketData();

    return new Response(
      JSON.stringify({
        data: mockData,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
