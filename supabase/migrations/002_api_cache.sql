-- Migration: 002_api_cache
-- Description: API response caching table
-- Created: 2024-12-29

CREATE TABLE api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_cache_key ON api_cache(cache_key);
CREATE INDEX idx_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_cache_source ON api_cache(api_source);

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get cached data or return null if expired
CREATE OR REPLACE FUNCTION get_cached_data(p_cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  cached_data JSONB;
BEGIN
  SELECT data INTO cached_data
  FROM api_cache
  WHERE cache_key = p_cache_key
    AND expires_at > NOW();

  RETURN cached_data;
END;
$$ LANGUAGE plpgsql;

-- Helper function to set cached data with TTL in hours
CREATE OR REPLACE FUNCTION set_cached_data(
  p_cache_key TEXT,
  p_api_source TEXT,
  p_data JSONB,
  p_ttl_hours INTEGER DEFAULT 4
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_cache (cache_key, api_source, data, expires_at)
  VALUES (
    p_cache_key,
    p_api_source,
    p_data,
    NOW() + (p_ttl_hours || ' hours')::INTERVAL
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = NOW() + (p_ttl_hours || ' hours')::INTERVAL,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;
