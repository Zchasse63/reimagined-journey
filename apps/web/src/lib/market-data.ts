/**
 * Market Data Utility Functions
 * Fetches and processes market data from Supabase Edge Functions
 */

import type {
  MarketData,
  MarketDataResponse,
  CommodityItem,
  PriceTrend,
} from '../types/market-data';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Fallback market data used when API is unavailable
 * Based on realistic market data as of late 2024
 */
export const FALLBACK_MARKET_DATA: MarketData = {
  poultry: {
    items: [
      { name: 'Whole Chicken', price: 1.12, unit: 'lb', change: -2.1 },
      { name: 'Wings', price: 2.14, unit: 'lb', change: 3.2 },
      { name: 'Breast', price: 2.89, unit: 'lb', change: -0.5 },
    ],
    source: 'USDA LMPR',
  },
  beef: {
    items: [
      { name: 'Choice Cutout', price: 315.42, unit: 'cwt', change: 1.3 },
      { name: 'Select Cutout', price: 298.15, unit: 'cwt', change: 0.8 },
    ],
    source: 'USDA LMPR',
  },
  cookingOil: {
    items: [
      { name: 'Soybean Oil', price: 0.52, unit: 'lb', change: -1.8 },
      { name: 'Canola Oil', price: 0.48, unit: 'lb', change: -0.5 },
    ],
    source: 'USDA ERS',
  },
  sugar: {
    items: [
      { name: 'Raw Sugar (ICE #11)', price: 22.45, unit: 'cents/lb', change: 2.3 },
      { name: 'Refined Sugar (ICE #16)', price: 45.80, unit: 'cents/lb', change: 1.5 },
      { name: 'High Fructose Corn Syrup', price: 28.50, unit: 'cents/lb', change: -0.8 },
    ],
    source: 'Trading Economics / ICE Futures',
  },
  diesel: {
    price: 3.58,
    previousWeek: 3.55,
    region: 'Lower Atlantic (PADD 1C)',
    unit: 'gal',
  },
  oceanFreight: {
    routes: [
      { origin: 'Shanghai, China', destination: 'Savannah, GA', price: 2850, unit: '40ft container', change: -4.2, transitDays: 28 },
      { origin: 'Ho Chi Minh, Vietnam', destination: 'Savannah, GA', price: 3120, unit: '40ft container', change: 1.8, transitDays: 32 },
      { origin: 'Bangkok, Thailand', destination: 'Savannah, GA', price: 3450, unit: '40ft container', change: 0.5, transitDays: 35 },
      { origin: 'Guayaquil, Ecuador', destination: 'Miami, FL', price: 1850, unit: '40ft container', change: -2.1, transitDays: 8 },
    ],
    source: 'Freightos Baltic Index (FBX)',
    lastUpdated: new Date().toISOString(),
  },
  trucking: {
    ratePerMile: 2.26,
    nationalAverage: 2.18,
    fuelSurchargePercent: 43.2,
    source: 'ATRI / DAT Freight Analytics',
  },
  tariffs: {
    examples: [
      // Aluminum - significant AD/CVD from China
      { product: 'Aluminum Foil (rolls)', htsCode: '7607.11.60', generalRate: '5.3%', section301Rate: '25%', adCvdRate: '106.09%', totalRate: '136.39%', countryOfOrigin: 'China', notes: 'AD 48.64-106.09%, CVD 17.14-80.97%' },
      { product: 'Aluminum Foil Containers', htsCode: '7612.90.10', generalRate: '5.7%', section301Rate: '25%', adCvdRate: '106.09%', totalRate: '136.79%', countryOfOrigin: 'China', notes: 'Same AD/CVD as foil rolls' },
      { product: 'Aluminum Foil Containers', htsCode: '7612.90.10', generalRate: '5.7%', section301Rate: 'N/A', adCvdRate: 'N/A', totalRate: '5.7%', countryOfOrigin: 'Turkey', notes: 'No AD/CVD or Section 301' },
      // Gloves - varies by material and origin (corrected Jan 2025)
      { product: 'Nitrile Gloves (seamless)', htsCode: '4015.19.11', generalRate: '3%', section301Rate: 'N/A', adCvdRate: 'N/A', totalRate: '3%', countryOfOrigin: 'Malaysia', notes: 'Seamless rubber gloves' },
      { product: 'Nitrile Gloves (seamless)', htsCode: '4015.19.11', generalRate: '3%', section301Rate: 'N/A', adCvdRate: 'N/A', totalRate: '3%', countryOfOrigin: 'Thailand', notes: 'Seamless rubber gloves' },
      { product: 'Vinyl Gloves (disposable)', htsCode: '3926.20.10', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China', notes: 'Seamless disposable plastic gloves' },
      { product: 'Latex Gloves (seamless)', htsCode: '4015.19.11', generalRate: '3%', section301Rate: 'N/A', adCvdRate: 'N/A', totalRate: '3%', countryOfOrigin: 'Malaysia', notes: 'Seamless rubber gloves' },
      // Plastic disposables
      { product: 'Plastic Food Containers', htsCode: '3924.10.40', generalRate: '3.4%', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '28.4%', countryOfOrigin: 'China' },
      { product: 'Plastic Cutlery', htsCode: '3924.10.40', generalRate: '3.4%', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '28.4%', countryOfOrigin: 'China' },
      { product: 'Plastic Cups (clear)', htsCode: '3924.10.40', generalRate: '3.4%', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '28.4%', countryOfOrigin: 'China' },
      { product: 'Foam Containers (PS)', htsCode: '3923.90.00', generalRate: '3.0%', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '28.0%', countryOfOrigin: 'China' },
      { product: 'Plastic Straws', htsCode: '3917.32.00', generalRate: '3.1%', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '28.1%', countryOfOrigin: 'China' },
      // Paper & fiber products
      { product: 'Paper Plates', htsCode: '4823.69.00', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China' },
      { product: 'Paper Napkins', htsCode: '4818.20.00', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China' },
      { product: 'Paper Hot Cups', htsCode: '4823.61.00', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China' },
      { product: 'Paper Straws', htsCode: '4823.90.86', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China' },
      { product: 'Bagasse/Fiber Containers', htsCode: '4823.70.00', generalRate: 'Free', section301Rate: '25%', adCvdRate: 'N/A', totalRate: '25%', countryOfOrigin: 'China', notes: 'Molded fiber clamshells, plates' },
      { product: 'Bagasse/Fiber Containers', htsCode: '4823.70.00', generalRate: 'Free', section301Rate: 'N/A', adCvdRate: 'N/A', totalRate: 'Free', countryOfOrigin: 'Vietnam' },
      // Food products with AD/CVD (updated Dec 2024 - new shrimp orders)
      { product: 'Frozen Shrimp', htsCode: '0306.17.00', generalRate: 'Free', section301Rate: 'N/A', adCvdRate: '~6%', totalRate: '~6%', countryOfOrigin: 'Vietnam', notes: 'New CVD order Dec 2024 + AD varies by exporter' },
      { product: 'Frozen Shrimp', htsCode: '0306.17.00', generalRate: 'Free', section301Rate: 'N/A', adCvdRate: '9-11%', totalRate: '9-11%', countryOfOrigin: 'India', notes: 'AD (2-5%) + CVD (5.6-5.9%) per Dec 2024 final' },
      { product: 'Frozen Shrimp', htsCode: '0306.17.00', generalRate: 'Free', section301Rate: 'N/A', adCvdRate: '~3%', totalRate: '~3%', countryOfOrigin: 'Ecuador', notes: 'New CVD order Dec 2024 (was duty-free)' },
      { product: 'Frozen Shrimp', htsCode: '0306.17.00', generalRate: 'Free', section301Rate: 'N/A', adCvdRate: '~8%', totalRate: '~8%', countryOfOrigin: 'Indonesia', notes: 'New AD order Dec 2024' },
      { product: 'Crawfish Tail Meat', htsCode: '0306.39.00', generalRate: 'Free', section301Rate: '25%', adCvdRate: '201.63%', totalRate: '226.63%', countryOfOrigin: 'China', notes: 'Effectively prohibitive' },
      { product: 'Honey (natural)', htsCode: '0409.00.00', generalRate: '1.9¢/kg', section301Rate: '25%', adCvdRate: '221.03%', totalRate: '~247%', countryOfOrigin: 'China', notes: 'Effectively banned - AD order since 2001' },
      { product: 'Honey (natural)', htsCode: '0409.00.00', generalRate: '1.9¢/kg', section301Rate: 'N/A', adCvdRate: '61.27%', totalRate: '~63%', countryOfOrigin: 'Argentina', notes: 'AD only, no CVD' },
      { product: 'Garlic (fresh)', htsCode: '0703.20.00', generalRate: '0.43¢/kg', section301Rate: '25%', adCvdRate: '376.67%', totalRate: '~402%', countryOfOrigin: 'China', notes: 'Effectively prohibitive' },
    ],
    source: 'USITC HTS / CBP AD-CVD Database',
    effectiveDate: '2025-01-01',
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Fetch market data from the Supabase Edge Function
 * Falls back to static data if the API is unavailable
 */
export async function fetchMarketData(): Promise<MarketDataResponse> {
  try {
    if (!SUPABASE_URL) {
      console.warn('SUPABASE_URL not configured, using fallback data');
      return {
        data: FALLBACK_MARKET_DATA,
        error: null,
        cached: false,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/market-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Market data API error:', response.status, response.statusText);
      return {
        data: FALLBACK_MARKET_DATA,
        error: `API returned ${response.status}`,
        cached: false,
        timestamp: new Date().toISOString(),
      };
    }

    const result = await response.json();

    return {
      data: result.data || result,
      error: null,
      cached: result.cached || false,
      timestamp: result.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return {
      data: FALLBACK_MARKET_DATA,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get the price trend direction based on change percentage
 */
export function getPriceTrend(change: number, threshold = 0.5): PriceTrend {
  if (change > threshold) return 'up';
  if (change < -threshold) return 'down';
  return 'stable';
}

/**
 * Format a price value with currency symbol
 */
export function formatPrice(price: number, unit: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatter.format(price)}/${unit}`;
}

/**
 * Format a price without unit
 */
export function formatPriceOnly(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format change percentage with sign and color indicator
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Calculate the diesel price change percentage
 */
export function calculateDieselChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get Tailwind CSS class for price trend
 */
export function getTrendColorClass(trend: PriceTrend): string {
  switch (trend) {
    case 'up':
      return 'text-red-600';
    case 'down':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get arrow indicator for price trend
 */
export function getTrendArrow(trend: PriceTrend): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
}

/**
 * Get the most significant price changes (for highlighting)
 */
export function getSignificantChanges(
  data: MarketData,
  threshold = 2.0
): CommodityItem[] {
  const allItems: CommodityItem[] = [
    ...data.poultry.items,
    ...data.beef.items,
    ...data.cookingOil.items,
  ];

  return allItems
    .filter((item) => Math.abs(item.change) >= threshold)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Format the last updated timestamp for display
 */
export function formatLastUpdated(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Calculate average price for a commodity category
 */
export function calculateCategoryAverage(items: CommodityItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  return sum / items.length;
}

/**
 * Calculate average change for a commodity category
 */
export function calculateCategoryAverageChange(items: CommodityItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + item.change, 0);
  return sum / items.length;
}
