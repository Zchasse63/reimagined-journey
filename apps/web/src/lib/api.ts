const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;

export interface DieselPrice {
  region: string;
  regionName: string;
  pricePerGallon: number;
  weekOf: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number | null;
}

export interface PPITrend {
  name: string;
  value: number;
  changeAnnual: number | null;
}

export interface MarketInsights {
  dieselPrices: DieselPrice | null;
  ppiTrends: {
    packaging: PPITrend | null;
    proteins: PPITrend | null;
  };
  lastUpdated: string;
}

export async function fetchMarketInsights(state: string): Promise<MarketInsights | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/market-insights?state=${encodeURIComponent(state)}`
    );

    if (!response.ok) {
      console.error('Failed to fetch market insights:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching market insights:', error);
    return null;
  }
}

export async function fetchDieselPrices(): Promise<DieselPrice[] | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/diesel-prices`);

    if (!response.ok) {
      console.error('Failed to fetch diesel prices:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching diesel prices:', error);
    return null;
  }
}

export async function fetchPPIData(): Promise<PPITrend[] | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ppi-data`);

    if (!response.ok) {
      console.error('Failed to fetch PPI data:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching PPI data:', error);
    return null;
  }
}
