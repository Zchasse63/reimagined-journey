import type { CityData, CityDataWithSlug, DeliveryTier, EcoEmphasis } from './types';
import cityDataRaw from '../../../city_data.json';

const cityData = cityDataRaw as { cities: CityData[] };

// States with $5,000 minimum
const highMinimumStates = [
  'North Carolina',
  'Mississippi',
  'Virginia',
  'Ohio',
  'Indiana',
  'Illinois',
  'Missouri',
  'Texas',
  'Oklahoma',
];

// Florida cities south of Tampa-Melbourne line (also $5,000)
const southFloridaCities = [
  'Sarasota',
  'Fort Myers',
  'Miami',
  'Fort Lauderdale',
  'West Palm Beach',
  'Naples',
  'Key West',
];

// State eco emphasis levels
const stateEcoEmphasis: Record<string, EcoEmphasis> = {
  'New Jersey': 'High',
  'Rhode Island': 'High',
  'Maryland': 'High',
  'Connecticut': 'Medium',
  'Florida': 'Low',
  'Georgia': 'Low',
  'Texas': 'Low',
  'Alabama': 'Low',
  'Tennessee': 'Low',
  'South Carolina': 'Low',
  'North Carolina': 'Low',
  'Kentucky': 'Low',
  'Mississippi': 'Low',
  'Virginia': 'Low',
  'Ohio': 'Low',
  'Indiana': 'Low',
  'Illinois': 'Low',
  'Missouri': 'Low',
  'Oklahoma': 'Low',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseMinimumOrder(minimum: string): number {
  const match = minimum.match(/\$?([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 3000;
}

function getEcoEmphasis(state: string): EcoEmphasis {
  return stateEcoEmphasis[state] || 'Low';
}

function enrichCityData(city: CityData): CityDataWithSlug {
  return {
    ...city,
    slug: slugify(city.city),
    state_slug: slugify(city.state),
    minimum_order_num: parseMinimumOrder(city.minimum_order),
    eco_emphasis: getEcoEmphasis(city.state),
  };
}

// All cities enriched with slugs and computed fields
export const allCities: CityDataWithSlug[] = cityData.cities.map(enrichCityData);

// Get all cities
export function getAllCities(): CityDataWithSlug[] {
  return allCities;
}

// Get city by slug
export function getCityBySlug(stateSlug: string, citySlug: string): CityDataWithSlug | undefined {
  return allCities.find(
    (c) => c.state_slug === stateSlug && c.slug === citySlug
  );
}

// Get cities by state
export function getCitiesByState(stateSlug: string): CityDataWithSlug[] {
  return allCities.filter((c) => c.state_slug === stateSlug);
}

// Get cities by tier
export function getCitiesByTier(tier: DeliveryTier): CityDataWithSlug[] {
  return allCities.filter((c) => c.tier === tier);
}

// Get unique states
export function getAllStates(): { name: string; slug: string; abbr: string; cityCount: number }[] {
  const stateMap = new Map<string, { name: string; slug: string; abbr: string; cityCount: number }>();

  for (const city of allCities) {
    const existing = stateMap.get(city.state);
    if (existing) {
      existing.cityCount++;
    } else {
      stateMap.set(city.state, {
        name: city.state,
        slug: city.state_slug,
        abbr: city.state_abbr,
        cityCount: 1,
      });
    }
  }

  return Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Get nearby cities for internal linking
export function getNearbyCities(city: CityDataWithSlug, limit: number = 4): CityDataWithSlug[] {
  // First, get cities from the same state (excluding current city)
  const sameSate = allCities.filter(
    (c) => c.state === city.state && c.slug !== city.slug
  );

  // Then get cities from neighboring states with same tier
  const sameTier = allCities.filter(
    (c) => c.tier === city.tier && c.state !== city.state
  );

  // Combine and limit
  const nearby = [...sameSate.slice(0, limit)];

  if (nearby.length < limit) {
    nearby.push(...sameTier.slice(0, limit - nearby.length));
  }

  return nearby.slice(0, limit);
}

// Get hub city (Atlanta)
export function getHubCity(): CityDataWithSlug | undefined {
  return allCities.find((c) => c.tier === 'Hub');
}

// Check if city has high minimum order
export function hasHighMinimum(city: CityData): boolean {
  return (
    highMinimumStates.includes(city.state) ||
    (city.state === 'Florida' && southFloridaCities.includes(city.city))
  );
}

// Get city count by tier
export function getCityCountByTier(): Record<DeliveryTier, number> {
  const counts: Record<DeliveryTier, number> = {
    Hub: 0,
    Tier1_Route: 0,
    Tier2_Route: 0,
    Common_Carrier: 0,
  };

  for (const city of allCities) {
    counts[city.tier]++;
  }

  return counts;
}

// Get total city count
export function getTotalCityCount(): number {
  return allCities.length;
}
