-- Migration: 007_email_subscriptions_rls
-- Description: Add RLS policies for email_subscriptions table
-- Created: 2026-01-14

-- Enable RLS on email_subscriptions table
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT email subscriptions
-- This allows the public-facing subscription form to work
CREATE POLICY "Allow anonymous INSERT on email_subscriptions"
  ON email_subscriptions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Prevent anonymous users from reading subscriptions
-- Only authenticated users (admin) can view subscription list
CREATE POLICY "Prevent anonymous SELECT on email_subscriptions"
  ON email_subscriptions
  FOR SELECT
  TO anon
  USING (false);

-- Policy: Allow authenticated users to read all subscriptions
CREATE POLICY "Allow authenticated SELECT on email_subscriptions"
  ON email_subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update subscriptions
CREATE POLICY "Allow authenticated UPDATE on email_subscriptions"
  ON email_subscriptions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to delete subscriptions
CREATE POLICY "Allow authenticated DELETE on email_subscriptions"
  ON email_subscriptions
  FOR DELETE
  TO authenticated
  USING (true);
