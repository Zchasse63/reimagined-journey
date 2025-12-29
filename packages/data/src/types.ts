export type DeliveryTier = 'Hub' | 'Tier1_Route' | 'Tier2_Route' | 'Common_Carrier';

export type EcoEmphasis = 'Low' | 'Medium' | 'High';

export type BusinessType =
  | 'restaurant'
  | 'food_truck'
  | 'caterer'
  | 'institution'
  | 'grocery'
  | 'ghost_kitchen'
  | 'other';

export type PurchaseTimeline =
  | 'immediate'
  | '1-3mo'
  | '3-6mo'
  | 'exploring';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost';

export interface CityData {
  city: string;
  state: string;
  state_abbr: string;
  tier: DeliveryTier;
  delivery_method: string;
  delivery_frequency: string;
  lead_time: string;
  minimum_order: string;
  distance_from_atlanta: string;
  interstate_corridors: string;
  military_bases?: string;
  universities?: string;
  hospital_systems?: string;
  tourism_attractions?: string;
}

export interface CityDataWithSlug extends CityData {
  slug: string;
  state_slug: string;
  minimum_order_num: number;
  eco_emphasis: EcoEmphasis;
}

export interface StateCompliance {
  state: string;
  state_abbr: string;
  has_foam_ban: boolean;
  has_pfas_ban: boolean;
  has_epr: boolean;
  compliance_deadlines?: string;
  compliance_details?: string;
  eco_emphasis: EcoEmphasis;
}

export interface Lead {
  id?: string;
  created_at?: string;
  updated_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name: string;
  business_type: BusinessType;
  location_count?: number;
  service_territory?: string;
  current_distributor?: string;
  purchase_timeline?: PurchaseTimeline;
  primary_interest: string[];
  source_city?: string;
  source_state?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  lead_score?: number;
  lead_status?: LeadStatus;
  notes?: string;
}

export interface DeliveryInfo {
  method: string;
  frequency: string;
  leadTime: string;
  minimumOrder: string;
  icon: 'warehouse' | 'truck' | 'freight';
}

export interface TierConfig {
  tier: DeliveryTier;
  heroSubhead: string;
  deliveryInfo: DeliveryInfo;
  valueProps: {
    pricing: string;
    reliability: string;
    flexibility: string;
  };
}
