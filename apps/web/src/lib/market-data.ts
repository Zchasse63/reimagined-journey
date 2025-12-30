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

/**
 * Fallback market data used when API is unavailable
 * Based on realistic USDA LMPR and EIA data as of late 2024
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
  diesel: {
    price: 3.58,
    previousWeek: 3.55,
    region: 'Lower Atlantic (PADD 1C)',
    unit: 'gal',
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
