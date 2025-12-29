# Supabase Edge Functions

This directory contains Supabase Edge Functions for API proxying and data aggregation.

## Functions

### `diesel-prices`
Fetches diesel fuel prices from the EIA API and stores them in the `diesel_prices` table.
- **Endpoint:** `POST /functions/v1/diesel-prices`
- **Cache:** 24 hours
- **Data Source:** EIA Petroleum Data API

### `ppi-data`
Fetches Producer Price Index data from the BLS API and stores it in the `ppi_data` table.
- **Endpoint:** `POST /functions/v1/ppi-data`
- **Cache:** 7 days (monthly data)
- **Data Source:** BLS Public Data API

### `market-insights`
Aggregates diesel and PPI data for display on city pages.
- **Endpoint:** `GET /functions/v1/market-insights?state=Georgia`
- **Cache:** 1 hour
- **Data Source:** Internal database tables

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref vpgavbsmspcqhzkdbyly`

### Set Environment Variables
```bash
supabase secrets set EIA_API_KEY=OLXOnW5jwBtE5nHIvi7HLtHJGQbkjonYIACnHUZ8
supabase secrets set BLS_API_KEY=56d1629be8c689b3a8d8a7e2be8bbfb956c4cbf091d3a8bcc5bc362bd629b537
supabase secrets set CENSUS_API_KEY=d735dcc0a581a73e8a73c44fd9185d6074a614de
supabase secrets set FDA_API_KEY=ZTswNWavGxHcur64HoJddSEebx8LmzrDGKXbnHoG
```

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy diesel-prices
supabase functions deploy ppi-data
supabase functions deploy market-insights

# Or deploy all at once
supabase functions deploy
```

### Test Functions
```bash
# Test diesel prices
curl -i --location --request POST \
  'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/diesel-prices'

# Test market insights for Georgia
curl -i --location --request GET \
  'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/market-insights?state=Georgia'
```

## Scheduled Execution

To keep data fresh, set up pg_cron jobs to call these functions:

```sql
-- Weekly diesel price update (Mondays at 9 AM EST)
SELECT cron.schedule(
  'update-diesel-prices',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/diesel-prices',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

-- Monthly PPI update (1st of each month at 10 AM EST)
SELECT cron.schedule(
  'update-ppi-data',
  '0 10 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://vpgavbsmspcqhzkdbyly.supabase.co/functions/v1/ppi-data',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```
