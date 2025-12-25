import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import {
  getOAuthConfig,
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  fetchUserProfile,
  validatePlatformConfig,
  getConfiguredPlatforms,
  type OAuthConfig,
  type OAuthTokens,
  type SocialProfile
} from '../oauth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuth Module', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set test environment variables
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.FACEBOOK_APP_ID = 'fb_test_id';
    process.env.FACEBOOK_APP_SECRET = 'fb_test_secret';
    process.env.INSTAGRAM_CLIENT_ID = 'ig_test_id';
    process.env.INSTAGRAM_CLIENT_SECRET = 'ig_test_secret';
    process.env.TWITTER_CLIENT_ID = 'tw_test_id';
    process.env.TWITTER_CLIENT_SECRET = 'tw_test_secret';
    process.env.LINKEDIN_CLIENT_ID = 'li_test_id';
    process.env.LINKEDIN_CLIENT_SECRET = 'li_test_secret';
    process.env.TIKTOK_CLIENT_KEY = 'tk_test_key';
    process.env.TIKTOK_CLIENT_SECRET = 'tk_test_secret';
    process.env.YOUTUBE_CLIENT_ID = 'yt_test_id';
    process.env.YOUTUBE_CLIENT_SECRET = 'yt_test_secret';
    process.env.PINTEREST_APP_ID = 'pt_test_id';
    process.env.PINTEREST_APP_SECRET = 'pt_test_secret';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getOAuthConfig', () => {
    it('should return Facebook OAuth config', () => {
      const config = getOAuthConfig('facebook');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('fb_test_id');
      expect(config?.clientSecret).toBe('fb_test_secret');
      expect(config?.redirectUri).toContain('/api/social/oauth/facebook/callback');
      expect(config?.scope).toContain('pages_manage_posts');
      expect(config?.authUrl).toContain('facebook.com');
      expect(config?.tokenUrl).toContain('graph.facebook.com');
    });

    it('should return Instagram OAuth config', () => {
      const config = getOAuthConfig('instagram');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('ig_test_id');
      expect(config?.scope).toContain('instagram_basic');
    });

    it('should return Twitter OAuth config', () => {
      const config = getOAuthConfig('twitter');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('tw_test_id');
      expect(config?.scope).toContain('tweet.write');
      expect(config?.authUrl).toContain('twitter.com');
    });

    it('should return LinkedIn OAuth config', () => {
      const config = getOAuthConfig('linkedin');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('li_test_id');
      expect(config?.scope).toContain('w_member_social');
    });

    it('should return TikTok OAuth config', () => {
      const config = getOAuthConfig('tiktok');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('tk_test_key');
      expect(config?.scope).toContain('video.publish');
    });

    it('should return YouTube OAuth config', () => {
      const config = getOAuthConfig('youtube');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('yt_test_id');
      expect(config?.scope).toContain('https://www.googleapis.com/auth/youtube.upload');
    });

    it('should return Pinterest OAuth config', () => {
      const config = getOAuthConfig('pinterest');

      expect(config).toBeDefined();
      expect(config?.clientId).toBe('pt_test_id');
      expect(config?.scope).toContain('pins:write');
    });

    it('should return null for unsupported platform', () => {
      const config = getOAuthConfig('unsupported');
      expect(config).toBeNull();
    });

    it('should use default frontend URL when not set', () => {
      delete process.env.FRONTEND_URL;
      const config = getOAuthConfig('facebook');

      expect(config?.redirectUri).toContain('http://localhost:5173');
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate Facebook authorization URL', () => {
      const url = getAuthorizationUrl('facebook', 'test-state-123');

      expect(url).toContain('facebook.com');
      expect(url).toContain('client_id=fb_test_id');
      expect(url).toContain('state=test-state-123');
      expect(url).toContain('response_type=code');
      expect(url).toContain('pages_manage_posts');
    });

    it('should include Twitter-specific parameters', () => {
      const url = getAuthorizationUrl('twitter', 'test-state');

      expect(url).toContain('code_challenge=challenge');
      expect(url).toContain('code_challenge_method=plain');
    });

    it('should include YouTube-specific parameters', () => {
      const url = getAuthorizationUrl('youtube', 'test-state');

      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
    });

    it('should return null when client ID is missing', () => {
      delete process.env.FACEBOOK_APP_ID;
      const url = getAuthorizationUrl('facebook', 'test-state');

      expect(url).toBeNull();
    });

    it('should return null for unsupported platform', () => {
      const url = getAuthorizationUrl('unsupported', 'test-state');
      expect(url).toBeNull();
    });

    it('should properly encode scope parameters', () => {
      const url = getAuthorizationUrl('facebook', 'test-state');
      expect(url).toContain('scope=');
      expect(url).not.toContain('[');
      expect(url).not.toContain(']');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for Facebook token', async () => {
      const mockResponse = {
        data: {
          access_token: 'fb_access_token',
          refresh_token: 'fb_refresh_token',
          expires_in: 3600,
          token_type: 'bearer'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await exchangeCodeForToken('facebook', 'auth_code_123');

      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('fb_access_token');
      expect(tokens?.refreshToken).toBe('fb_refresh_token');
      expect(tokens?.expiresIn).toBe(3600);
      expect(tokens?.expiresAt).toBeInstanceOf(Date);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com'),
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should exchange code for Twitter token with Basic auth', async () => {
      const mockResponse = {
        data: {
          access_token: 'tw_access_token',
          expires_in: 7200
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await exchangeCodeForToken('twitter', 'auth_code_123');

      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('tw_access_token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic')
          })
        })
      );
    });

    it('should exchange code for TikTok token with JSON body', async () => {
      const mockResponse = {
        data: {
          data: {
            access_token: 'tk_access_token',
            refresh_token: 'tk_refresh_token',
            expires_in: 86400
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await exchangeCodeForToken('tiktok', 'auth_code_123');

      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('tk_access_token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('tiktok'),
        expect.objectContaining({
          client_key: 'tk_test_key',
          code: 'auth_code_123'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should throw error when OAuth is not configured', async () => {
      delete process.env.FACEBOOK_APP_ID;

      await expect(
        exchangeCodeForToken('facebook', 'auth_code_123')
      ).rejects.toThrow('OAuth not configured for platform: facebook');
    });

    it('should throw error on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: 'invalid_grant',
            error_description: 'Authorization code is invalid'
          }
        }
      });

      await expect(
        exchangeCodeForToken('facebook', 'invalid_code')
      ).rejects.toThrow('Token exchange failed');
    });

    it('should calculate expiration date correctly', async () => {
      const mockResponse = {
        data: {
          access_token: 'test_token',
          expires_in: 3600
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const beforeTime = Date.now();
      const tokens = await exchangeCodeForToken('facebook', 'auth_code');
      const afterTime = Date.now();

      expect(tokens?.expiresAt).toBeInstanceOf(Date);
      const expiresAtTime = tokens?.expiresAt?.getTime() || 0;
      expect(expiresAtTime).toBeGreaterThan(beforeTime + 3590000); // ~1 hour
      expect(expiresAtTime).toBeLessThan(afterTime + 3610000);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh Facebook token', async () => {
      const mockResponse = {
        data: {
          access_token: 'new_fb_token',
          expires_in: 5184000 // 60 days
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = await refreshAccessToken('facebook', 'old_token');

      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('new_fb_token');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com')
      );
    });

    it('should refresh Twitter token with Basic auth', async () => {
      const mockResponse = {
        data: {
          access_token: 'new_tw_token',
          refresh_token: 'new_refresh_token',
          expires_in: 7200
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await refreshAccessToken('twitter', 'old_refresh_token');

      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('new_tw_token');
      expect(tokens?.refreshToken).toBe('new_refresh_token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic')
          })
        })
      );
    });

    it('should keep old refresh token if new one not provided', async () => {
      const mockResponse = {
        data: {
          access_token: 'new_token',
          expires_in: 3600
          // No refresh_token in response
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await refreshAccessToken('linkedin', 'old_refresh');

      expect(tokens?.refreshToken).toBe('old_refresh');
    });

    it('should throw error when OAuth not configured', async () => {
      delete process.env.TWITTER_CLIENT_ID;

      await expect(
        refreshAccessToken('twitter', 'refresh_token')
      ).rejects.toThrow('OAuth not configured');
    });

    it('should throw error on refresh failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: 'invalid_grant'
          }
        },
        message: 'Request failed'
      });

      await expect(
        refreshAccessToken('linkedin', 'invalid_token')
      ).rejects.toThrow('Token refresh failed');
    });
  });

  describe('fetchUserProfile', () => {
    it('should fetch Facebook profile', async () => {
      const mockResponse = {
        data: {
          id: '123456789',
          name: 'Test User',
          picture: {
            data: {
              url: 'https://example.com/picture.jpg'
            }
          },
          accounts: {
            data: [
              { id: 'page1', name: 'Test Page', followers_count: 1000 }
            ]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const profile = await fetchUserProfile('facebook', 'access_token');

      expect(profile).toBeDefined();
      expect(profile?.id).toBe('123456789');
      expect(profile?.username).toBe('Test User');
      expect(profile?.profilePicture).toBe('https://example.com/picture.jpg');
      expect(profile?.pages).toHaveLength(1);
    });

    it('should fetch Twitter profile', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tw123',
            username: 'testuser',
            name: 'Test User',
            profile_image_url: 'https://example.com/avatar.jpg',
            public_metrics: {
              followers_count: 5000
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const profile = await fetchUserProfile('twitter', 'access_token');

      expect(profile?.id).toBe('tw123');
      expect(profile?.username).toBe('testuser');
      expect(profile?.followersCount).toBe(5000);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer access_token'
          })
        })
      );
    });

    it('should fetch LinkedIn profile', async () => {
      const mockResponse = {
        data: {
          sub: 'li_user_123',
          name: 'LinkedIn User',
          email: 'user@example.com',
          picture: 'https://example.com/linkedin.jpg'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const profile = await fetchUserProfile('linkedin', 'access_token');

      expect(profile?.id).toBe('li_user_123');
      expect(profile?.name).toBe('LinkedIn User');
    });

    it('should fetch TikTok profile with POST request', async () => {
      const mockResponse = {
        data: {
          data: {
            user: {
              open_id: 'tk_user_123',
              display_name: 'TikTok Creator',
              avatar_url: 'https://example.com/avatar.jpg',
              follower_count: 10000
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const profile = await fetchUserProfile('tiktok', 'access_token');

      expect(profile?.id).toBe('tk_user_123');
      expect(profile?.username).toBe('TikTok Creator');
      expect(profile?.followersCount).toBe(10000);
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should fetch YouTube profile', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: 'yt_channel_123',
              snippet: {
                title: 'My YouTube Channel',
                thumbnails: {
                  default: {
                    url: 'https://example.com/thumb.jpg'
                  }
                }
              },
              statistics: {
                subscriberCount: '50000'
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const profile = await fetchUserProfile('youtube', 'access_token');

      expect(profile?.id).toBe('yt_channel_123');
      expect(profile?.followersCount).toBe(50000);
    });

    it('should throw error for unsupported platform', async () => {
      await expect(
        fetchUserProfile('unsupported', 'token')
      ).rejects.toThrow('OAuth not configured for platform');
    });

    it('should throw error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: {
            error: 'invalid_token'
          }
        },
        message: 'Request failed'
      });

      await expect(
        fetchUserProfile('facebook', 'invalid_token')
      ).rejects.toThrow('Profile fetch failed');
    });
  });

  describe('validatePlatformConfig', () => {
    it('should validate configured platform', () => {
      expect(validatePlatformConfig('facebook')).toBe(true);
      expect(validatePlatformConfig('twitter')).toBe(true);
      expect(validatePlatformConfig('linkedin')).toBe(true);
    });

    it('should return false for unconfigured platform', () => {
      delete process.env.FACEBOOK_APP_ID;
      expect(validatePlatformConfig('facebook')).toBe(false);
    });

    it('should return false when secret is missing', () => {
      delete process.env.TWITTER_CLIENT_SECRET;
      expect(validatePlatformConfig('twitter')).toBe(false);
    });

    it('should return false for unsupported platform', () => {
      expect(validatePlatformConfig('unsupported')).toBe(false);
    });
  });

  describe('getConfiguredPlatforms', () => {
    it('should return all configured platforms', () => {
      const platforms = getConfiguredPlatforms();

      expect(platforms).toContain('facebook');
      expect(platforms).toContain('instagram');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('linkedin');
      expect(platforms).toContain('tiktok');
      expect(platforms).toContain('youtube');
      expect(platforms).toContain('pinterest');
      expect(platforms).toHaveLength(7);
    });

    it('should exclude unconfigured platforms', () => {
      delete process.env.FACEBOOK_APP_ID;
      delete process.env.TWITTER_CLIENT_ID;

      const platforms = getConfiguredPlatforms();

      expect(platforms).not.toContain('facebook');
      expect(platforms).not.toContain('twitter');
      expect(platforms.length).toBeLessThan(7);
    });

    it('should return empty array when no platforms configured', () => {
      // Clear all platform credentials
      delete process.env.FACEBOOK_APP_ID;
      delete process.env.INSTAGRAM_CLIENT_ID;
      delete process.env.TWITTER_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_ID;
      delete process.env.TIKTOK_CLIENT_KEY;
      delete process.env.YOUTUBE_CLIENT_ID;
      delete process.env.PINTEREST_APP_ID;

      const platforms = getConfiguredPlatforms();
      expect(platforms).toHaveLength(0);
    });
  });

  describe('Platform-specific edge cases', () => {
    it('should handle Instagram fallback to Facebook credentials', () => {
      delete process.env.INSTAGRAM_CLIENT_ID;
      delete process.env.INSTAGRAM_CLIENT_SECRET;

      const config = getOAuthConfig('instagram');

      expect(config?.clientId).toBe('fb_test_id');
      expect(config?.clientSecret).toBe('fb_test_secret');
    });

    it('should handle TikTok nested token response', async () => {
      const mockResponse = {
        data: {
          data: {
            access_token: 'nested_token',
            expires_in: 86400
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokens = await exchangeCodeForToken('tiktok', 'code');
      expect(tokens?.accessToken).toBe('nested_token');
    });

    it('should handle Pinterest form-encoded request', async () => {
      const mockResponse = {
        data: {
          access_token: 'pt_token',
          expires_in: 2592000
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await exchangeCodeForToken('pinterest', 'code');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      );
    });
  });
});
