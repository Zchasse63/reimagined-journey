/**
 * Recalls Types
 * Types for FDA food recalls and safety alerts
 */

/**
 * FDA recall classification levels
 * Class I: Most serious, reasonable probability of serious health consequences or death
 * Class II: May cause temporary or medically reversible adverse health consequences
 * Class III: Not likely to cause adverse health consequences
 */
export type RecallClassification = 'Class I' | 'Class II' | 'Class III';

/**
 * Individual recall record from FDA enforcement data
 */
export interface Recall {
  id: string;
  classification: RecallClassification;
  product_description: string;
  reason_for_recall: string;
  distribution_pattern: string;
  recall_initiation_date: string;
  recalling_firm: string;
  url: string;
}

/**
 * API response from the recalls Edge Function
 */
export interface RecallsResponse {
  recalls: Recall[];
  count: number;
  hasUrgent: boolean; // true if any Class I recalls
  fetchedAt: string;
  cached: boolean;
}

/**
 * Summary data for recall alerts (used in dashboard widgets)
 */
export interface RecallAlertData {
  count: number;
  hasClassOne: boolean;
  categories: string[]; // e.g., ['Meat', 'Poultry']
  lastUpdated: string;
}

/**
 * Request parameters for the recalls Edge Function
 */
export interface RecallsRequest {
  state?: string;
}

/**
 * Product categories relevant to food service distribution
 */
export type FoodServiceCategory =
  | 'Meat'
  | 'Poultry'
  | 'Seafood'
  | 'Produce'
  | 'Dairy'
  | 'Other';

/**
 * Severity levels for styling recalls
 */
export type RecallSeverity = 'critical' | 'warning' | 'info';
