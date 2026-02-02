import { z } from 'zod';

// PRIMARY B2B CUSTOMERS - Value Source is a redistributor selling to these businesses
export const primaryBusinessTypes = [
  { value: 'regional_distributor', label: 'Regional Distributor' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'buying_group', label: 'Buying Group / Co-op' },
  { value: 'broadliner', label: 'Broadline Distributor' },
  { value: 'specialty_distributor', label: 'Specialty Distributor' },
  { value: 'cash_and_carry', label: 'Cash & Carry' },
] as const;

// SECONDARY - End-users we can refer to our distribution partners
export const secondaryBusinessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'institution', label: 'Institution (School, Hospital, etc.)' },
  { value: 'grocery', label: 'Grocery / Retail' },
  { value: 'ghost_kitchen', label: 'Ghost Kitchen' },
] as const;

// Combined for schema validation
export const businessTypes = [
  ...primaryBusinessTypes,
  ...secondaryBusinessTypes,
  { value: 'other', label: 'Other' },
] as const;

export const purchaseTimelines = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1-3mo', label: '1-3 months' },
  { value: '3-6mo', label: '3-6 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const;

export const productInterests = [
  { value: 'disposables', label: 'Disposables & Paper Goods' },
  { value: 'custom_print', label: 'Custom Printed Items' },
  { value: 'proteins', label: 'Proteins (Beef, Pork, Poultry, Seafood)' },
  { value: 'eco_friendly', label: 'Eco-Friendly Products' },
  { value: 'all', label: 'All of the above' },
] as const;

// All valid business type values
const businessTypeValues = [
  // Primary B2B
  'regional_distributor',
  'wholesaler',
  'buying_group',
  'broadliner',
  'specialty_distributor',
  'cash_and_carry',
  // Secondary (end-users for referral)
  'restaurant',
  'food_truck',
  'caterer',
  'institution',
  'grocery',
  'ghost_kitchen',
  // Other
  'other',
] as const;

// Step 1: Business Type
export const step1Schema = z.object({
  business_type: z.enum(businessTypeValues, {
    required_error: 'Please select your business type',
  }),
});

// Step 2: Service Information
export const step2Schema = z.object({
  location_count: z.number().min(1, 'Must have at least 1 location').max(999),
  primary_interest: z.array(z.string()).min(1, 'Please select at least one product interest'),
  purchase_timeline: z.enum(['immediate', '1-3mo', '3-6mo', 'exploring']).optional(),
});

// Step 3: Contact Details
export const step3Schema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(200, 'Company name too long'),
  first_name: z.string().min(2, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().max(100, 'Last name too long'),
  email: z.string().email('Please enter a valid email address').max(255, 'Email too long'),
  phone: z.string().max(20, 'Phone number too long').optional(),
  current_distributor: z.string().max(200, 'Distributor name too long').optional(),
  // Honeypot field - accepts any string, actual validation happens in API endpoints
  // We check it before schema validation to catch bots without revealing the honeypot
  website: z.string().optional(),
});

// Combined schema for the full form
export const leadFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type LeadFormData = z.infer<typeof leadFormSchema>;
