import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url(),
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  PUBLIC_SITE_URL: z.string().url().optional(),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

function validateEnv() {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse({
    PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL,
  });

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Missing required environment variables');
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnv() {
  return validateEnv();
}
