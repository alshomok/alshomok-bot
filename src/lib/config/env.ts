import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CI: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

let envData: z.infer<typeof envSchema>;

if (!parsedEnv.success) {
  // In CI environment, log warning but don't throw to allow build to continue
  if (process.env.CI === 'true') {
    console.warn('⚠️  CI Environment: Some environment variables may be missing or invalid');
    console.warn('Make sure to set GitHub Secrets for production deployments');
    // Use partial env for CI build
    envData = {
      ...process.env,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    } as z.infer<typeof envSchema>;
  } else {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    throw new Error('Invalid environment variables. Check your .env.local file.');
  }
} else {
  envData = parsedEnv.data;
}

export const env = envData;

// Helper function to check if running in CI
export const isCI = (): boolean => process.env.CI === 'true';

// Helper function to validate env for production
export const validateEnv = (): boolean => {
  const result = envSchema.safeParse(process.env);
  return result.success;
};
