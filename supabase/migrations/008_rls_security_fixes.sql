-- Migration: 008_rls_security_fixes
-- Description: Fix RLS security issues flagged by Supabase linter
-- Created: 2026-01-26
--
-- Issues addressed:
-- 1. Security Definer Views: v_protein_price_comparison, v_diesel_trends
-- 2. RLS Disabled: api_cache, protein_prices, diesel_prices, ppi_data,
--    drought_data, api_usage, market_data_history, email_subscriptions

-- ============================================
-- FIX SECURITY DEFINER VIEWS
-- Recreate views with SECURITY INVOKER
-- ============================================

-- Drop and recreate v_protein_price_comparison with SECURITY INVOKER
DROP VIEW IF EXISTS v_protein_price_comparison;
CREATE VIEW v_protein_price_comparison
WITH (security_invoker = true)
AS
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

COMMENT ON VIEW v_protein_price_comparison IS 'Protein price comparison view (SECURITY INVOKER)';

-- Drop and recreate v_diesel_trends with SECURITY INVOKER
DROP VIEW IF EXISTS v_diesel_trends;
CREATE VIEW v_diesel_trends
WITH (security_invoker = true)
AS
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

COMMENT ON VIEW v_diesel_trends IS 'Diesel price trends view (SECURITY INVOKER)';

-- ============================================
-- ENABLE RLS ON api_cache
-- Used by edge functions only (service_role)
-- ============================================
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Edge functions use service_role key which bypasses RLS by default
-- But we add explicit policies for clarity and safety

-- Allow service_role full access (edge functions)
CREATE POLICY "service_role_api_cache_all"
  ON api_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Deny anonymous users
CREATE POLICY "anon_api_cache_deny"
  ON api_cache
  FOR ALL
  TO anon
  USING (false);

-- Deny authenticated users (this is internal cache)
CREATE POLICY "authenticated_api_cache_deny"
  ON api_cache
  FOR ALL
  TO authenticated
  USING (false);

-- ============================================
-- ENABLE RLS ON protein_prices
-- Public read, service_role write
-- ============================================
ALTER TABLE protein_prices ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read protein prices (public market data)
CREATE POLICY "anon_protein_prices_select"
  ON protein_prices
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_protein_prices_select"
  ON protein_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "service_role_protein_prices_all"
  ON protein_prices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE RLS ON diesel_prices
-- Public read, service_role write
-- ============================================
ALTER TABLE diesel_prices ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read diesel prices (public market data)
CREATE POLICY "anon_diesel_prices_select"
  ON diesel_prices
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_diesel_prices_select"
  ON diesel_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "service_role_diesel_prices_all"
  ON diesel_prices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE RLS ON ppi_data
-- Public read, service_role write
-- ============================================
ALTER TABLE ppi_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read PPI data (public market data)
CREATE POLICY "anon_ppi_data_select"
  ON ppi_data
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_ppi_data_select"
  ON ppi_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "service_role_ppi_data_all"
  ON ppi_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE RLS ON drought_data
-- Public read, service_role write
-- ============================================
ALTER TABLE drought_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read drought data (public market data)
CREATE POLICY "anon_drought_data_select"
  ON drought_data
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_drought_data_select"
  ON drought_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "service_role_drought_data_all"
  ON drought_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE RLS ON api_usage
-- Internal tracking, service_role only
-- ============================================
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "service_role_api_usage_all"
  ON api_usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Deny anonymous users
CREATE POLICY "anon_api_usage_deny"
  ON api_usage
  FOR ALL
  TO anon
  USING (false);

-- Deny authenticated users (admin dashboard would use service_role)
CREATE POLICY "authenticated_api_usage_deny"
  ON api_usage
  FOR ALL
  TO authenticated
  USING (false);

-- ============================================
-- ENABLE RLS ON market_data_history
-- Public read, service_role write
-- ============================================
ALTER TABLE market_data_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read market data history (for charts)
CREATE POLICY "anon_market_data_history_select"
  ON market_data_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_market_data_history_select"
  ON market_data_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "service_role_market_data_history_all"
  ON market_data_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFY email_subscriptions RLS
-- Migration 007 should have enabled it, but let's ensure
-- ============================================

-- Enable RLS (idempotent - won't error if already enabled)
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Check if policies exist, if not create them
-- Note: If migration 007 was applied, these will fail silently due to IF NOT EXISTS-like behavior
-- We use DO blocks to check existence

DO $$
BEGIN
  -- Check if anon INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'Allow anonymous INSERT on email_subscriptions'
  ) THEN
    CREATE POLICY "Allow anonymous INSERT on email_subscriptions"
      ON email_subscriptions
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  -- Check if anon SELECT deny policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'Prevent anonymous SELECT on email_subscriptions'
  ) THEN
    CREATE POLICY "Prevent anonymous SELECT on email_subscriptions"
      ON email_subscriptions
      FOR SELECT
      TO anon
      USING (false);
  END IF;
END $$;

DO $$
BEGIN
  -- Check if authenticated SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'Allow authenticated SELECT on email_subscriptions'
  ) THEN
    CREATE POLICY "Allow authenticated SELECT on email_subscriptions"
      ON email_subscriptions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  -- Check if authenticated UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'Allow authenticated UPDATE on email_subscriptions'
  ) THEN
    CREATE POLICY "Allow authenticated UPDATE on email_subscriptions"
      ON email_subscriptions
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  -- Check if authenticated DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'Allow authenticated DELETE on email_subscriptions'
  ) THEN
    CREATE POLICY "Allow authenticated DELETE on email_subscriptions"
      ON email_subscriptions
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Add service_role full access for edge functions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_subscriptions'
    AND policyname = 'service_role_email_subscriptions_all'
  ) THEN
    CREATE POLICY "service_role_email_subscriptions_all"
      ON email_subscriptions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- GRANT USAGE ON VIEWS
-- Ensure views are accessible with proper permissions
-- ============================================

-- Grant SELECT on views to appropriate roles
GRANT SELECT ON v_protein_price_comparison TO anon, authenticated;
GRANT SELECT ON v_diesel_trends TO anon, authenticated;

-- ============================================
-- SUMMARY
-- ============================================
-- This migration fixes all RLS security issues:
-- 1. Recreated views with SECURITY INVOKER
-- 2. Enabled RLS on all tables
-- 3. Created appropriate policies:
--    - Public market data: anon/authenticated can SELECT, service_role can ALL
--    - Internal tables (api_cache, api_usage): service_role only
--    - email_subscriptions: anon can INSERT, authenticated can manage
