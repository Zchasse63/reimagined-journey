/**
 * Recalls Utility Functions
 * Fetches and processes FDA recall data from Supabase Edge Functions
 */

import type {
  Recall,
  RecallsResponse,
  RecallAlertData,
  RecallClassification,
  RecallSeverity,
  FoodServiceCategory,
} from '../types/recalls';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * US state abbreviations for validation and pattern matching
 */
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
];

/**
 * Empty fallback when API is unavailable
 * We no longer use fake mock data to avoid misleading users
 * The UI will show "No current recalls" when this is used
 */
export const FALLBACK_RECALLS: Recall[] = [];

/**
 * Fetch recalls from the Supabase Edge Function
 * Falls back to static data if the API is unavailable
 */
export async function fetchRecalls(state?: string): Promise<RecallsResponse> {
  try {
    if (!SUPABASE_URL) {
      console.warn('SUPABASE_URL not configured, using fallback data');
      return createFallbackResponse(state);
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/recalls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      console.error('Recalls API error:', response.status, response.statusText);
      return createFallbackResponse(state);
    }

    const result = await response.json();

    return {
      recalls: result.recalls || [],
      count: result.count || 0,
      hasUrgent: result.hasUrgent || false,
      fetchedAt: result.fetchedAt || new Date().toISOString(),
      cached: result.cached || false,
    };
  } catch (error) {
    console.error('Failed to fetch recalls:', error);
    return createFallbackResponse(state);
  }
}

/**
 * Create a fallback response using static data
 */
function createFallbackResponse(state?: string): RecallsResponse {
  const filteredRecalls = state
    ? filterRecallsByState(FALLBACK_RECALLS, state)
    : FALLBACK_RECALLS;

  return {
    recalls: filteredRecalls,
    count: filteredRecalls.length,
    hasUrgent: filteredRecalls.some((r) => r.classification === 'Class I'),
    fetchedAt: new Date().toISOString(),
    cached: false,
  };
}

/**
 * Filter recalls by state
 * Checks if the state is mentioned in the distribution_pattern
 * Also includes recalls with "Nationwide" distribution
 */
export function filterRecallsByState(recalls: Recall[], state: string): Recall[] {
  const normalizedState = state.toUpperCase().trim();

  // Validate state abbreviation
  if (!US_STATES.includes(normalizedState)) {
    console.warn(`Invalid state abbreviation: ${state}`);
    return recalls;
  }

  return recalls.filter((recall) => {
    const pattern = recall.distribution_pattern.toUpperCase();

    // Check for nationwide distribution
    if (pattern.includes('NATIONWIDE') || pattern.includes('NATIONAL')) {
      return true;
    }

    // Check if state is mentioned in distribution pattern
    // Use word boundary to avoid partial matches (e.g., "AL" not matching "CALIFORNIA")
    const stateRegex = new RegExp(`\\b${normalizedState}\\b`);
    return stateRegex.test(pattern);
  });
}

/**
 * Check if a specific recall affects a given state
 */
export function recallAffectsState(recall: Recall, state: string): boolean {
  const normalizedState = state.toUpperCase().trim();
  const pattern = recall.distribution_pattern.toUpperCase();

  if (pattern.includes('NATIONWIDE') || pattern.includes('NATIONAL')) {
    return true;
  }

  const stateRegex = new RegExp(`\\b${normalizedState}\\b`);
  return stateRegex.test(pattern);
}

/**
 * Get severity level from classification
 */
export function getRecallSeverity(classification: RecallClassification): RecallSeverity {
  switch (classification) {
    case 'Class I':
      return 'critical';
    case 'Class II':
      return 'warning';
    case 'Class III':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Get Tailwind CSS classes for severity styling
 */
export function getSeverityClasses(severity: RecallSeverity): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        badge: 'bg-red-600 text-white',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        badge: 'bg-yellow-500 text-white',
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        badge: 'bg-blue-500 text-white',
      };
  }
}

/**
 * Get styling classes directly from classification
 */
export function getClassificationClasses(classification: RecallClassification): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  return getSeverityClasses(getRecallSeverity(classification));
}

/**
 * Determine product category from product description
 */
export function inferProductCategory(productDescription: string): FoodServiceCategory {
  const desc = productDescription.toLowerCase();

  if (desc.includes('beef') || desc.includes('pork') || desc.includes('lamb') || desc.includes('meat')) {
    return 'Meat';
  }
  if (desc.includes('chicken') || desc.includes('turkey') || desc.includes('poultry') || desc.includes('duck')) {
    return 'Poultry';
  }
  if (desc.includes('fish') || desc.includes('salmon') || desc.includes('shrimp') || desc.includes('seafood') || desc.includes('crab') || desc.includes('lobster')) {
    return 'Seafood';
  }
  if (desc.includes('salad') || desc.includes('lettuce') || desc.includes('vegetable') || desc.includes('fruit') || desc.includes('produce') || desc.includes('spinach')) {
    return 'Produce';
  }
  if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt') || desc.includes('dairy') || desc.includes('cream') || desc.includes('butter')) {
    return 'Dairy';
  }

  return 'Other';
}

/**
 * Get unique categories from a list of recalls
 */
export function getRecallCategories(recalls: Recall[]): FoodServiceCategory[] {
  const categories = new Set<FoodServiceCategory>();

  recalls.forEach((recall) => {
    categories.add(inferProductCategory(recall.product_description));
  });

  return Array.from(categories);
}

/**
 * Create alert summary data from recalls
 */
export function createAlertData(recalls: Recall[]): RecallAlertData {
  return {
    count: recalls.length,
    hasClassOne: recalls.some((r) => r.classification === 'Class I'),
    categories: getRecallCategories(recalls),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Sort recalls by severity and date
 * Class I first, then by most recent date
 */
export function sortRecallsBySeverity(recalls: Recall[]): Recall[] {
  return [...recalls].sort((a, b) => {
    // Sort by classification first (Class I > Class II > Class III)
    const classOrder: Record<RecallClassification, number> = {
      'Class I': 0,
      'Class II': 1,
      'Class III': 2,
    };

    const classCompare = classOrder[a.classification] - classOrder[b.classification];
    if (classCompare !== 0) return classCompare;

    // Then sort by date (most recent first)
    return new Date(b.recall_initiation_date).getTime() - new Date(a.recall_initiation_date).getTime();
  });
}

/**
 * Format recall date for display
 */
export function formatRecallDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get human-readable time since recall was initiated
 */
export function getRecallAge(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';

  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Check if recall is recent (within last 7 days)
 */
export function isRecentRecall(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays <= 7;
}

/**
 * Get the count of Class I (urgent) recalls
 */
export function getUrgentRecallCount(recalls: Recall[]): number {
  return recalls.filter((r) => r.classification === 'Class I').length;
}
