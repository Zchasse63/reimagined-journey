-- Migration: 010_b2b_business_types
-- Description: Update business_type constraint to support B2B redistributor model
-- Value Source is a REDISTRIBUTOR selling to wholesalers/distributors, not directly to restaurants
-- Created: 2026-01-27

-- Drop the old constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS valid_business_type;

-- Add new constraint with B2B business types
-- PRIMARY: Our actual B2B customers (distributors, wholesalers)
-- SECONDARY: End-users we can refer to our distribution partners
ALTER TABLE leads ADD CONSTRAINT valid_business_type CHECK (
  business_type IN (
    -- Primary B2B customers (redistributor targets)
    'regional_distributor',    -- Regional food distributors
    'wholesaler',              -- Smaller wholesalers
    'buying_group',            -- Purchasing cooperatives
    'broadliner',              -- Large broadline distributors
    'specialty_distributor',   -- Specialty/niche distributors
    'cash_and_carry',          -- Cash & carry operators
    -- Secondary (end-users for referral to partners)
    'restaurant',
    'food_truck',
    'caterer',
    'institution',
    'grocery',
    'ghost_kitchen',
    -- Other
    'other'
  )
);

-- Update lead scoring function to prioritize B2B customers
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Business type scoring - B2B customers get highest scores
  CASE lead_row.business_type
    -- PRIMARY B2B CUSTOMERS (highest value)
    WHEN 'broadliner' THEN score := score + 50;           -- Largest volume potential
    WHEN 'regional_distributor' THEN score := score + 45; -- High volume, regional reach
    WHEN 'buying_group' THEN score := score + 40;         -- Collective buying power
    WHEN 'wholesaler' THEN score := score + 35;           -- Core target customer
    WHEN 'specialty_distributor' THEN score := score + 30;-- Niche but valuable
    WHEN 'cash_and_carry' THEN score := score + 25;       -- Consistent volume
    -- SECONDARY (referral leads - lower priority)
    WHEN 'institution' THEN score := score + 15;          -- Can refer to partners
    WHEN 'restaurant' THEN score := score + 10;
    WHEN 'caterer' THEN score := score + 10;
    WHEN 'grocery' THEN score := score + 10;
    WHEN 'food_truck' THEN score := score + 5;
    WHEN 'ghost_kitchen' THEN score := score + 5;
    ELSE score := score + 5;
  END CASE;

  -- Location count scoring (more locations = more volume)
  IF lead_row.location_count >= 10 THEN
    score := score + 30;
  ELSIF lead_row.location_count >= 5 THEN
    score := score + 25;
  ELSIF lead_row.location_count >= 3 THEN
    score := score + 15;
  ELSIF lead_row.location_count >= 2 THEN
    score := score + 10;
  END IF;

  -- Timeline scoring
  CASE lead_row.purchase_timeline
    WHEN 'immediate' THEN score := score + 40;
    WHEN '1-3mo' THEN score := score + 25;
    WHEN '3-6mo' THEN score := score + 10;
    ELSE score := score + 5;
  END CASE;

  -- Phone provided (indicates higher intent)
  IF lead_row.phone IS NOT NULL AND lead_row.phone != '' THEN
    score := score + 10;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining business model
COMMENT ON COLUMN leads.business_type IS 'Business type classification. Value Source is a redistributor - primary customers are distributors/wholesalers. End-users (restaurants etc.) are secondary leads for referral to distribution partners.';
