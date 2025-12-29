-- Migration: 003_historical_prices
-- Description: Historical pricing data tables for USDA, EIA, BLS, Drought
-- Created: 2024-12-29

-- ============================================
-- PROTEIN PRICES (USDA LMPR)
-- ============================================
CREATE TABLE protein_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  commodity TEXT NOT NULL,
  cut_type TEXT,
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  volume_loads INTEGER,
  unit TEXT DEFAULT 'cwt',
  report_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_protein_daily UNIQUE(report_date, commodity, cut_type)
);

CREATE INDEX idx_protein_commodity_date ON protein_prices(commodity, report_date DESC);
CREATE INDEX idx_protein_date_range ON protein_prices(report_date, commodity);

-- ============================================
-- DIESEL PRICES (EIA)
-- ============================================
CREATE TABLE diesel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  region TEXT NOT NULL,
  price_per_gallon DECIMAL(6,3) NOT NULL,
  change_from_prior_week DECIMAL(6,3),
  change_from_year_ago DECIMAL(6,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_diesel_weekly UNIQUE(week_of, region)
);

CREATE INDEX idx_diesel_region_date ON diesel_prices(region, week_of DESC);

-- ============================================
-- PPI INDEX DATA (BLS)
-- ============================================
CREATE TABLE ppi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL,
  series_id TEXT NOT NULL,
  series_name TEXT NOT NULL,
  index_value DECIMAL(10,2) NOT NULL,
  percent_change_monthly DECIMAL(6,2),
  percent_change_annual DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_ppi_monthly UNIQUE(period_date, series_id)
);

CREATE INDEX idx_ppi_series_date ON ppi_data(series_id, period_date DESC);

-- ============================================
-- DROUGHT DATA (Predictive for Protein Prices)
-- ============================================
CREATE TABLE drought_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  state_fips TEXT NOT NULL,
  state_name TEXT NOT NULL,
  d0_pct DECIMAL(5,2),
  d1_pct DECIMAL(5,2),
  d2_pct DECIMAL(5,2),
  d3_pct DECIMAL(5,2),
  d4_pct DECIMAL(5,2),
  dsci DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_drought_weekly UNIQUE(week_of, state_fips)
);

-- Focus on major cattle-producing states for protein prediction
CREATE INDEX idx_drought_cattle_states ON drought_data(state_fips, week_of DESC)
WHERE state_fips IN ('48', '40', '20', '31', '08'); -- TX, OK, KS, NE, CO

-- ============================================
-- API USAGE TRACKING
-- ============================================
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER DEFAULT 1,

  UNIQUE(api_source, call_date)
);

CREATE INDEX idx_usage_date ON api_usage(call_date DESC);

-- Helper function to increment API usage
CREATE OR REPLACE FUNCTION increment_api_usage(p_api_source TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_usage (api_source, call_date, call_count)
  VALUES (p_api_source, CURRENT_DATE, 1)
  ON CONFLICT (api_source, call_date)
  DO UPDATE SET call_count = api_usage.call_count + 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PRICE COMPARISON VIEWS
-- ============================================

-- View: Current vs Last Week Protein Prices
CREATE OR REPLACE VIEW v_protein_price_comparison AS
SELECT
  commodity,
  price_avg as current_price,
  LAG(price_avg, 5) OVER (PARTITION BY commodity ORDER BY report_date) as last_week_price,
  price_avg - LAG(price_avg, 5) OVER (PARTITION BY commodity ORDER BY report_date) as change,
  ROUND(
    ((price_avg - LAG(price_avg, 5) OVER (PARTITION BY commodity ORDER BY report_date))
    / NULLIF(LAG(price_avg, 5) OVER (PARTITION BY commodity ORDER BY report_date), 0)) * 100,
    1
  ) as pct_change,
  report_date
FROM protein_prices
WHERE report_date >= CURRENT_DATE - INTERVAL '30 days';

-- View: Diesel Price Trends
CREATE OR REPLACE VIEW v_diesel_trends AS
SELECT
  region,
  week_of,
  price_per_gallon,
  LAG(price_per_gallon, 1) OVER (PARTITION BY region ORDER BY week_of) as prior_week,
  LAG(price_per_gallon, 52) OVER (PARTITION BY region ORDER BY week_of) as year_ago,
  price_per_gallon - LAG(price_per_gallon, 1) OVER (PARTITION BY region ORDER BY week_of) as weekly_change,
  price_per_gallon - LAG(price_per_gallon, 52) OVER (PARTITION BY region ORDER BY week_of) as yearly_change
FROM diesel_prices
WHERE week_of >= CURRENT_DATE - INTERVAL '60 days';
