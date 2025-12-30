/**
 * Market Data Types
 * Types for commodity prices, fuel costs, and market data aggregation
 */

/**
 * Aggregated market data returned from the market-data edge function
 */
export interface MarketData {
  poultry: CommodityData;
  beef: CommodityData;
  cookingOil: CommodityData;
  diesel: DieselData;
  updatedAt: string;
}

/**
 * Data for a commodity category (e.g., poultry, beef, cooking oil)
 */
export interface CommodityData {
  items: CommodityItem[];
  source: string;
}

/**
 * Individual commodity item with pricing
 */
export interface CommodityItem {
  name: string;
  price: number;
  unit: string;
  change: number;
}

/**
 * Diesel fuel pricing data
 */
export interface DieselData {
  price: number;
  previousWeek: number;
  region: string;
  unit: string;
}

/**
 * API response wrapper for market data
 */
export interface MarketDataResponse {
  data: MarketData | null;
  error: string | null;
  cached: boolean;
  timestamp: string;
}

/**
 * Email subscription preferences
 */
export interface EmailSubscriptionPreferences {
  marketAlerts?: boolean;
  weeklyDigest?: boolean;
  priceDropAlerts?: boolean;
  commodities?: string[];
}

/**
 * Email subscription record
 */
export interface EmailSubscription {
  id: string;
  email: string;
  source: string;
  preferences: EmailSubscriptionPreferences;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Market data history record
 */
export interface MarketDataHistoryRecord {
  id: string;
  data: MarketData;
  capturedAt: string;
}

/**
 * Price trend direction
 */
export type PriceTrend = 'up' | 'down' | 'stable';

/**
 * Calculate price trend from change percentage
 */
export function getPriceTrend(change: number, threshold = 0.5): PriceTrend {
  if (change > threshold) return 'up';
  if (change < -threshold) return 'down';
  return 'stable';
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number, unit: string): string {
  if (unit === 'cwt') {
    return `$${price.toFixed(2)}`;
  }
  if (unit === 'gal') {
    return `$${price.toFixed(2)}`;
  }
  // For lb, show 2 decimal places
  return `$${price.toFixed(2)}`;
}

/**
 * Format change percentage with sign
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
