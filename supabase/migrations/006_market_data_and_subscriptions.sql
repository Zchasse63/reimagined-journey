-- Migration: 006_market_data_and_subscriptions
-- Description: Market data history and email subscriptions tables
-- Created: 2024-12-30

-- ============================================
-- MARKET DATA HISTORY
-- Captures snapshots of aggregated market data
-- ============================================
CREATE TABLE IF NOT EXISTS market_data_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_history_date ON market_data_history(captured_at DESC);

-- Add comment for documentation
COMMENT ON TABLE market_data_history IS 'Stores historical snapshots of aggregated market data for trend analysis';

-- ============================================
-- EMAIL SUBSCRIPTIONS
-- For newsletter and market alerts
-- ============================================
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_email_source UNIQUE(email, source)
);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);

-- Add comment for documentation
COMMENT ON TABLE email_subscriptions IS 'Stores email subscriptions for newsletters and market alerts';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_email_subscription_updated
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_email_subscription_timestamp();

-- ============================================
-- ADD updated_at TO api_cache (if not exists)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_cache' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE api_cache ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Helper function to store market data snapshot
CREATE OR REPLACE FUNCTION store_market_data_snapshot(p_data JSONB)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO market_data_history (data)
  VALUES (p_data)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get latest market data snapshot
CREATE OR REPLACE FUNCTION get_latest_market_snapshot()
RETURNS JSONB AS $$
DECLARE
  snapshot_data JSONB;
BEGIN
  SELECT data INTO snapshot_data
  FROM market_data_history
  ORDER BY captured_at DESC
  LIMIT 1;

  RETURN snapshot_data;
END;
$$ LANGUAGE plpgsql;
