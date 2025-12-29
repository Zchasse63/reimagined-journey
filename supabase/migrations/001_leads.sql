-- Migration: 001_leads
-- Description: Lead capture and management table
-- Created: 2024-12-29

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Business Information
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location_count INTEGER DEFAULT 1,

  -- Qualification
  service_territory TEXT,
  current_distributor TEXT,
  purchase_timeline TEXT,
  primary_interest TEXT[],

  -- Source Tracking
  source_city TEXT,
  source_state TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Processing
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new',
  assigned_to UUID,
  notes TEXT,

  -- Honeypot field for spam detection (should always be empty)
  website TEXT,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_business_type CHECK (business_type IN ('restaurant', 'food_truck', 'caterer', 'institution', 'grocery', 'ghost_kitchen', 'other')),
  CONSTRAINT valid_lead_status CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost'))
);

-- Indexes for common queries
CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source_city, source_state);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_business_type ON leads(business_type);

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions)
CREATE POLICY "Public lead submission" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Authenticated read leads" ON leads
  FOR SELECT TO authenticated USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated update leads" ON leads
  FOR UPDATE TO authenticated USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Lead scoring function
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Business type scoring
  CASE lead_row.business_type
    WHEN 'restaurant' THEN score := score + 30;
    WHEN 'caterer' THEN score := score + 25;
    WHEN 'institution' THEN score := score + 35;
    WHEN 'grocery' THEN score := score + 20;
    WHEN 'food_truck' THEN score := score + 15;
    WHEN 'ghost_kitchen' THEN score := score + 20;
    ELSE score := score + 10;
  END CASE;

  -- Location count scoring
  IF lead_row.location_count >= 5 THEN
    score := score + 30;
  ELSIF lead_row.location_count >= 3 THEN
    score := score + 20;
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

-- Trigger to auto-calculate lead score
CREATE OR REPLACE FUNCTION auto_score_lead()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lead_score := calculate_lead_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_auto_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION auto_score_lead();
