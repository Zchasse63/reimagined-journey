/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  readonly SUPABASE_SECRET_KEY: string;
  readonly EIA_API_KEY: string;
  readonly BLS_API_KEY: string;
  readonly SLACK_WEBHOOK_URL: string;
  readonly SENDGRID_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
