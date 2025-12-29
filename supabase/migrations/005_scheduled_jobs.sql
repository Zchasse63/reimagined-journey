-- Migration: 005_scheduled_jobs
-- Description: Set up pg_cron jobs for automated data refresh
-- Created: 2024-12-29
-- Note: pg_cron must be enabled in Supabase Dashboard first

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================
-- SCHEDULED JOBS
-- ============================================

-- Weekly diesel price update (Mondays at 10 AM ET / 15:00 UTC)
SELECT cron.schedule(
  'update-diesel-prices',
  '0 15 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/diesel-prices',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Monthly PPI update (1st of each month at 11 AM ET / 16:00 UTC)
SELECT cron.schedule(
  'update-ppi-data',
  '0 16 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/ppi-data',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Daily USDA price update (Weekdays at 6 PM ET / 23:00 UTC)
SELECT cron.schedule(
  'update-usda-prices',
  '0 23 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/usda-prices',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Hourly cache cleanup
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 * * * *',
  $$
  DELETE FROM api_cache WHERE expires_at < NOW();
  $$
);

-- ============================================
-- VIEW SCHEDULED JOBS
-- ============================================
-- Run this to see all scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('job-name');
