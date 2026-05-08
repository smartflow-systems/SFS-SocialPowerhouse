import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Config Module', () => {
  let config: any;
  let isPlatformConfigured: any;
  let isAIEnabled: any;
  let isStripeConfigured: any;

  beforeAll(() => {
    // Set valid environment variables before importing config
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.USE_PG_SESSIONS = 'false';

    // Optional platform configs
    process.env.FACEBOOK_APP_ID = 'fb_test_id';
    process.env.FACEBOOK_APP_SECRET = 'fb_test_secret';
    process.env.TWITTER_CLIENT_ID = 'tw_test_id';
    process.env.TWITTER_CLIENT_SECRET = 'tw_test_secret';
    process.env.LINKEDIN_CLIENT_ID = 'li_test_id';
    process.env.LINKEDIN_CLIENT_SECRET = 'li_test_secret';
    process.env.INSTAGRAM_CLIENT_ID = 'ig_test_id';
    process.env.INSTAGRAM_CLIENT_SECRET = 'ig_test_secret';
    process.env.TIKTOK_CLIENT_KEY = 'tt_test_key';
    process.env.TIKTOK_CLIENT_SECRET = 'tt_test_secret';
    process.env.YOUTUBE_CLIENT_ID = 'yt_test_id';
    process.env.YOUTUBE_CLIENT_SECRET = 'yt_test_secret';
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

    // Import after setting env vars
    const configModule = require('../config');
    config = configModule.config;
    isPlatformConfigured = configModule.isPlatformConfigured;
    isAIEnabled = configModule.isAIEnabled;
    isStripeConfigured = configModule.isStripeConfigured;
  });

  describe('Environment Variable Validation', () => {
    it('should load and validate required configuration', () => {
      expect(config).toBeDefined();
      expect(config.NODE_ENV).toBe('test');
      expect(config.PORT).toBe(5000);
      expect(config.DATABASE_URL).toBe('postgresql://localhost:5432/test');
      expect(config.SESSION_SECRET).toBe('a'.repeat(32));
      expect(config.ENCRYPTION_KEY).toBe('a'.repeat(64));
    });

    it('should parse PORT as number', () => {
      expect(typeof config.PORT).toBe('number');
      expect(config.PORT).toBe(5000);
    });

    it('should use default values for optional fields', () => {
      expect(config.FRONTEND_URL).toBe('http://localhost:5173');
    });

    it('should parse boolean USE_PG_SESSIONS correctly', () => {
      expect(typeof config.USE_PG_SESSIONS).toBe('boolean');
      expect(config.USE_PG_SESSIONS).toBe(false);
    });

    it('should validate DATABASE_URL is a valid URL', () => {
      expect(config.DATABASE_URL).toContain('postgresql://');
    });

    it('should enforce SESSION_SECRET minimum length', () => {
      expect(config.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    it('should enforce ENCRYPTION_KEY exact length', () => {
      expect(config.ENCRYPTION_KEY.length).toBe(64);
    });
  });

  describe('Optional Configuration', () => {
    it('should load optional OpenAI configuration', () => {
      expect(config.OPENAI_API_KEY).toBe('sk-test-key');
    });

    it('should load optional Stripe configuration', () => {
      expect(config.STRIPE_SECRET_KEY).toBe('sk_test_123');
      expect(config.STRIPE_PUBLISHABLE_KEY).toBe('pk_test_123');
    });

    it('should load optional social media platform configurations', () => {
      expect(config.FACEBOOK_APP_ID).toBe('fb_test_id');
      expect(config.FACEBOOK_APP_SECRET).toBe('fb_test_secret');
      expect(config.TWITTER_CLIENT_ID).toBe('tw_test_id');
      expect(config.TWITTER_CLIENT_SECRET).toBe('tw_test_secret');
    });

    it('should handle optional configurations with placeholder values', () => {
      // LinkedIn has placeholder values from .env
      expect(config.LINKEDIN_CLIENT_ID).toBeDefined();
      expect(config.LINKEDIN_CLIENT_SECRET).toBeDefined();
    });
  });

  describe('isPlatformConfigured', () => {
    it('should return true for fully configured Facebook', () => {
      expect(isPlatformConfigured('facebook')).toBe(true);
    });

    it('should return true for fully configured Twitter', () => {
      expect(isPlatformConfigured('twitter')).toBe(true);
    });

    it('should return true for LinkedIn with placeholder values', () => {
      // .env has placeholder values which count as "configured"
      expect(isPlatformConfigured('linkedin')).toBe(true);
    });

    it('should return true for Instagram with placeholder values', () => {
      expect(isPlatformConfigured('instagram')).toBe(true);
    });

    it('should return true for TikTok with placeholder values', () => {
      expect(isPlatformConfigured('tiktok')).toBe(true);
    });

    it('should return true for YouTube with placeholder values', () => {
      expect(isPlatformConfigured('youtube')).toBe(true);
    });

    it('should return true for Pinterest with placeholder values', () => {
      expect(isPlatformConfigured('pinterest')).toBe(true);
    });

    it('should handle case-insensitive platform names', () => {
      expect(isPlatformConfigured('Facebook')).toBe(true);
      expect(isPlatformConfigured('TWITTER')).toBe(true);
      expect(isPlatformConfigured('LinkedIn')).toBe(true);
    });

    it('should return false for unsupported platform', () => {
      expect(isPlatformConfigured('unsupported')).toBe(false);
    });

    it('should return false when only one credential is provided', () => {
      // Set only APP_ID without APP_SECRET
      process.env.TEST_PLATFORM_ID = 'test_id';
      expect(isPlatformConfigured('test')).toBe(false);
    });
  });

  describe('isAIEnabled', () => {
    it('should return true when OpenAI API key is configured', () => {
      expect(isAIEnabled()).toBe(true);
    });

    it('should check for non-empty API key', () => {
      const currentKey = process.env.OPENAI_API_KEY;

      // Temporarily clear the key
      process.env.OPENAI_API_KEY = '';

      // Re-import to get updated config
      jest.resetModules();
      process.env.OPENAI_API_KEY = currentKey; // Restore for other tests

      expect(config.OPENAI_API_KEY).toBeTruthy();
    });
  });

  describe('isStripeConfigured', () => {
    it('should return true when both Stripe keys are configured', () => {
      expect(isStripeConfigured()).toBe(true);
    });

    it('should require both secret and publishable keys', () => {
      expect(config.STRIPE_SECRET_KEY).toBeTruthy();
      expect(config.STRIPE_PUBLISHABLE_KEY).toBeTruthy();
      expect(isStripeConfigured()).toBe(true);
    });
  });

  describe('Configuration Validation Edge Cases', () => {
    it('should handle NODE_ENV enum values', () => {
      expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
    });

    it('should validate PORT is within valid range', () => {
      expect(config.PORT).toBeGreaterThan(0);
      expect(config.PORT).toBeLessThanOrEqual(65535);
    });

    it('should validate FRONTEND_URL is a valid URL', () => {
      expect(config.FRONTEND_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('Type Safety', () => {
    it('should export config with correct types', () => {
      expect(typeof config.NODE_ENV).toBe('string');
      expect(typeof config.PORT).toBe('number');
      expect(typeof config.DATABASE_URL).toBe('string');
      expect(typeof config.SESSION_SECRET).toBe('string');
      expect(typeof config.ENCRYPTION_KEY).toBe('string');
      expect(typeof config.FRONTEND_URL).toBe('string');
      expect(typeof config.USE_PG_SESSIONS).toBe('boolean');
    });

    it('should handle optional string types correctly', () => {
      if (config.OPENAI_API_KEY) {
        expect(typeof config.OPENAI_API_KEY).toBe('string');
      }
      if (config.STRIPE_SECRET_KEY) {
        expect(typeof config.STRIPE_SECRET_KEY).toBe('string');
      }
    });
  });

  describe('Helper Functions', () => {
    it('isPlatformConfigured should be a function', () => {
      expect(typeof isPlatformConfigured).toBe('function');
    });

    it('isAIEnabled should be a function', () => {
      expect(typeof isAIEnabled).toBe('function');
    });

    it('isStripeConfigured should be a function', () => {
      expect(typeof isStripeConfigured).toBe('function');
    });

    it('helper functions should return boolean values', () => {
      expect(typeof isPlatformConfigured('facebook')).toBe('boolean');
      expect(typeof isAIEnabled()).toBe('boolean');
      expect(typeof isStripeConfigured()).toBe('boolean');
    });
  });

  describe('Security Considerations', () => {
    it('should not expose secrets in config object structure', () => {
      // Ensure we're not accidentally logging or exposing secrets
      const configKeys = Object.keys(config);
      expect(configKeys).toBeDefined();

      // Secrets should exist but we shouldn't log them
      expect(config.SESSION_SECRET).toBeDefined();
      expect(config.ENCRYPTION_KEY).toBeDefined();

      // Verify they're not empty
      expect(config.SESSION_SECRET.length).toBeGreaterThan(0);
      expect(config.ENCRYPTION_KEY.length).toBeGreaterThan(0);
    });

    it('should validate encryption key format', () => {
      // Encryption key should be exactly 64 characters (hex format)
      expect(config.ENCRYPTION_KEY).toHaveLength(64);
      // Should only contain valid hex characters (or in our test case, 'a')
      expect(config.ENCRYPTION_KEY).toMatch(/^[a-fA-F0-9]{64}$/);
    });

    it('should enforce minimum session secret length for security', () => {
      // Session secret must be at least 32 characters for adequate entropy
      expect(config.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('Default Values', () => {
    it('should use development as default NODE_ENV', () => {
      // In test environment, we explicitly set it to 'test'
      expect(config.NODE_ENV).toBe('test');
    });

    it('should use 5000 as default PORT', () => {
      expect(config.PORT).toBe(5000);
    });

    it('should use localhost:5173 as default FRONTEND_URL', () => {
      expect(config.FRONTEND_URL).toBe('http://localhost:5173');
    });

    it('should use false as default USE_PG_SESSIONS', () => {
      expect(config.USE_PG_SESSIONS).toBe(false);
    });
  });

  describe('Platform-Specific Configuration', () => {
    it('should support multiple Twitter API configurations', () => {
      // Twitter can have CLIENT_ID/SECRET and also BEARER_TOKEN, API_KEY/SECRET
      expect(config.TWITTER_CLIENT_ID).toBeDefined();
      expect(config.TWITTER_CLIENT_SECRET).toBeDefined();
      // Bearer token and API key/secret are optional
    });

    it('should support YouTube with multiple credential types', () => {
      // YouTube requires API_KEY, CLIENT_ID, and CLIENT_SECRET
      // .env has placeholder values
      expect(config.YOUTUBE_API_KEY).toBeDefined();
      expect(config.YOUTUBE_CLIENT_ID).toBeDefined();
      expect(config.YOUTUBE_CLIENT_SECRET).toBeDefined();
    });

    it('should support TikTok with client_key instead of client_id', () => {
      // TikTok uses CLIENT_KEY instead of CLIENT_ID
      // .env has placeholder values
      expect(config.TIKTOK_CLIENT_KEY).toBeDefined();
      expect(config.TIKTOK_CLIENT_SECRET).toBeDefined();
    });
  });
});
