-- Migration: 004_lead_webhook
-- Description: Set up webhook trigger for new lead notifications
-- Created: 2024-12-29

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to call the notify-lead edge function
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build the webhook payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'leads',
    'schema', 'public',
    'record', row_to_json(NEW)
  );

  -- Call the edge function asynchronously
  PERFORM net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/notify-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on leads table
DROP TRIGGER IF EXISTS on_lead_created ON leads;
CREATE TRIGGER on_lead_created
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION notify_new_lead() TO postgres, anon, authenticated, service_role;
