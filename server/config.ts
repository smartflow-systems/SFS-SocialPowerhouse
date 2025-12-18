import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),

  // Database
  DATABASE_URL: z.string().url().min(1),

  // Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Session Store
  USE_PG_SESSIONS: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),

  // OpenAI (required for AI features)
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Stripe (optional, for payments)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Social Media APIs (all optional, required only when connecting)
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  TWITTER_BEARER_TOKEN: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),

  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),

  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),

  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),

  PINTEREST_APP_ID: z.string().optional(),
  PINTEREST_APP_SECRET: z.string().optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment variables. Please check your .env file.');
    }
    throw error;
  }
}

// Export validated configuration
export const config = validateEnv();

// Helper function to check if a platform is configured
export function isPlatformConfigured(platform: string): boolean {
  const platformKeys: Record<string, string[]> = {
    facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    twitter: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    instagram: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    youtube: ['YOUTUBE_API_KEY', 'YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
    pinterest: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'],
  };

  const keys = platformKeys[platform.toLowerCase()];
  if (!keys) return false;

  return keys.every(key => {
    const value = config[key as keyof typeof config];
    return value && typeof value === 'string' && value.length > 0;
  });
}

// Helper function to check if AI features are enabled
export function isAIEnabled(): boolean {
  return !!config.OPENAI_API_KEY && config.OPENAI_API_KEY.length > 0;
}

// Helper function to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(
    config.STRIPE_SECRET_KEY &&
    config.STRIPE_PUBLISHABLE_KEY
  );
}

// Log configuration status (without exposing secrets)
if (config.NODE_ENV !== 'test') {
  console.log('📋 Configuration loaded:');
  console.log(`  - Environment: ${config.NODE_ENV}`);
  console.log(`  - Port: ${config.PORT}`);
  console.log(`  - Database: ${config.DATABASE_URL ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - Session Secret: ${config.SESSION_SECRET ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - Encryption Key: ${config.ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - OpenAI: ${isAIEnabled() ? '✓ Enabled' : '✗ Disabled'}`);
  console.log(`  - Stripe: ${isStripeConfigured() ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  - PostgreSQL Sessions: ${config.USE_PG_SESSIONS || config.NODE_ENV === 'production' ? '✓ Enabled' : '✗ Disabled'}`);
  console.log('  - Social Platforms:');
  ['facebook', 'twitter', 'linkedin', 'instagram', 'tiktok', 'youtube', 'pinterest'].forEach(platform => {
    const status = isPlatformConfigured(platform) ? '✓' : '✗';
    console.log(`    - ${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${status}`);
  });
}
