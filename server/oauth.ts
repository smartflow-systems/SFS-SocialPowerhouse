/**
 * OAuth 2.0 handlers for all social media platforms
 * Supports authorization, token exchange, refresh, and profile fetching
 */

import axios from 'axios';

// Platform-specific OAuth configurations
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // Seconds until expiration
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
}

export interface SocialProfile {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
  followersCount?: number;
  [key: string]: any; // Platform-specific data
}

/**
 * Get OAuth configuration for a specific platform
 */
export function getOAuthConfig(platform: string): OAuthConfig | null {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUri = `${baseUrl}/api/social/oauth/${platform}/callback`;

  switch (platform) {
    case 'facebook':
      return {
        clientId: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        redirectUri,
        scope: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        profileUrl: 'https://graph.facebook.com/v18.0/me'
      };

    case 'instagram':
      return {
        clientId: process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET || '',
        redirectUri,
        scope: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        profileUrl: 'https://graph.facebook.com/v18.0/me'
      };

    case 'twitter':
      return {
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        redirectUri,
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        profileUrl: 'https://api.twitter.com/2/users/me'
      };

    case 'linkedin':
      return {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirectUri,
        scope: ['openid', 'profile', 'w_member_social', 'r_basicprofile'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        profileUrl: 'https://api.linkedin.com/v2/userinfo'
      };

    case 'tiktok':
      return {
        clientId: process.env.TIKTOK_CLIENT_KEY || '',
        clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
        redirectUri,
        scope: ['user.info.basic', 'video.publish', 'video.list'],
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        profileUrl: 'https://open.tiktokapis.com/v2/user/info/'
      };

    case 'youtube':
      return {
        clientId: process.env.YOUTUBE_CLIENT_ID || '',
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
        redirectUri,
        scope: [
          'https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        profileUrl: 'https://www.googleapis.com/youtube/v3/channels'
      };

    case 'pinterest':
      return {
        clientId: process.env.PINTEREST_APP_ID || '',
        clientSecret: process.env.PINTEREST_APP_SECRET || '',
        redirectUri,
        scope: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],
        authUrl: 'https://www.pinterest.com/oauth/',
        tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
        profileUrl: 'https://api.pinterest.com/v5/user_account'
      };

    default:
      return null;
  }
}

/**
 * Generate authorization URL for OAuth flow
 */
export function getAuthorizationUrl(platform: string, state: string): string | null {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope.join(' '),
    state,
    response_type: 'code',
  });

  // Platform-specific parameters
  if (platform === 'twitter') {
    params.set('code_challenge', 'challenge');
    params.set('code_challenge_method', 'plain');
  }

  if (platform === 'tiktok') {
    params.set('response_type', 'code');
  }

  if (platform === 'youtube') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: string,
  code: string
): Promise<OAuthTokens | null> {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error(`OAuth not configured for platform: ${platform}`);
  }

  try {
    const params: any = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    };

    // Platform-specific handling
    let response;

    if (platform === 'twitter') {
      // Twitter requires Basic auth and form-encoded body
      const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      params.code_verifier = 'challenge'; // Match the challenge from auth URL

      response = await axios.post(config.tokenUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      });
    } else if (platform === 'tiktok') {
      // TikTok uses JSON body
      response = await axios.post(config.tokenUrl, {
        client_key: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (platform === 'pinterest') {
      // Pinterest uses form-encoded with specific structure
      response = await axios.post(config.tokenUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
    } else {
      // Facebook, Instagram, LinkedIn, YouTube use form-encoded
      response = await axios.post(config.tokenUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
    }

    const data = response.data;

    // Parse platform-specific response format
    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresIn: number | undefined;

    if (platform === 'tiktok') {
      accessToken = data.data?.access_token || data.access_token;
      refreshToken = data.data?.refresh_token || data.refresh_token;
      expiresIn = data.data?.expires_in || data.expires_in;
    } else {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      expiresIn = data.expires_in;
    }

    const tokens: OAuthTokens = {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: data.token_type,
      scope: data.scope,
    };

    // Calculate expiration date
    if (expiresIn) {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      tokens.expiresAt = expiresAt;
    }

    return tokens;
  } catch (error: any) {
    console.error(`Failed to exchange code for token (${platform}):`, error.response?.data || error.message);
    throw new Error(`Token exchange failed for ${platform}: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  platform: string,
  refreshToken: string
): Promise<OAuthTokens | null> {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error(`OAuth not configured for platform: ${platform}`);
  }

  try {
    const params: any = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    let response;

    if (platform === 'twitter') {
      // Twitter requires Basic auth
      const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

      response = await axios.post(config.tokenUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      });
    } else if (platform === 'tiktok') {
      // TikTok uses JSON body
      response = await axios.post(config.tokenUrl, {
        client_key: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (platform === 'facebook' || platform === 'instagram') {
      // Facebook/Instagram long-lived token exchange
      const exchangeParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: refreshToken
      });

      response = await axios.get(`${config.tokenUrl}?${exchangeParams.toString()}`);
    } else {
      // LinkedIn, YouTube, Pinterest
      response = await axios.post(config.tokenUrl, new URLSearchParams(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
    }

    const data = response.data;

    // Parse response
    let accessToken: string;
    let newRefreshToken: string | undefined;
    let expiresIn: number | undefined;

    if (platform === 'tiktok') {
      accessToken = data.data?.access_token || data.access_token;
      newRefreshToken = data.data?.refresh_token || data.refresh_token || refreshToken;
      expiresIn = data.data?.expires_in || data.expires_in;
    } else {
      accessToken = data.access_token;
      newRefreshToken = data.refresh_token || refreshToken; // Keep old refresh token if not provided
      expiresIn = data.expires_in;
    }

    const tokens: OAuthTokens = {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      tokenType: data.token_type,
      scope: data.scope,
    };

    // Calculate expiration date
    if (expiresIn) {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      tokens.expiresAt = expiresAt;
    }

    return tokens;
  } catch (error: any) {
    console.error(`Failed to refresh token (${platform}):`, error.response?.data || error.message);
    throw new Error(`Token refresh failed for ${platform}: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Fetch user profile information using access token
 */
export async function fetchUserProfile(
  platform: string,
  accessToken: string
): Promise<SocialProfile | null> {
  const config = getOAuthConfig(platform);
  if (!config) {
    throw new Error(`OAuth not configured for platform: ${platform}`);
  }

  try {
    let response;
    let profile: SocialProfile;

    switch (platform) {
      case 'facebook':
        response = await axios.get(config.profileUrl, {
          params: {
            fields: 'id,name,picture,accounts{name,id,followers_count,picture}',
            access_token: accessToken
          }
        });
        profile = {
          id: response.data.id,
          username: response.data.name,
          name: response.data.name,
          profilePicture: response.data.picture?.data?.url,
          pages: response.data.accounts?.data || []
        };
        break;

      case 'instagram':
        // Instagram Business Account through Facebook Graph API
        response = await axios.get(config.profileUrl, {
          params: {
            fields: 'id,name,accounts{instagram_business_account{id,username,name,profile_picture_url,followers_count}}',
            access_token: accessToken
          }
        });
        const igAccount = response.data.accounts?.data?.[0]?.instagram_business_account;
        profile = {
          id: igAccount?.id || response.data.id,
          username: igAccount?.username || response.data.name,
          name: igAccount?.name,
          profilePicture: igAccount?.profile_picture_url,
          followersCount: igAccount?.followers_count
        };
        break;

      case 'twitter':
        response = await axios.get(config.profileUrl, {
          params: {
            'user.fields': 'id,username,name,profile_image_url,public_metrics'
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        profile = {
          id: response.data.data.id,
          username: response.data.data.username,
          name: response.data.data.name,
          profilePicture: response.data.data.profile_image_url,
          followersCount: response.data.data.public_metrics?.followers_count
        };
        break;

      case 'linkedin':
        response = await axios.get(config.profileUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        profile = {
          id: response.data.sub,
          username: response.data.name || response.data.email,
          name: response.data.name,
          profilePicture: response.data.picture
        };
        break;

      case 'tiktok':
        response = await axios.post(config.profileUrl, {
          fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'follower_count']
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        const tikTokData = response.data.data?.user;
        profile = {
          id: tikTokData?.open_id,
          username: tikTokData?.display_name,
          name: tikTokData?.display_name,
          profilePicture: tikTokData?.avatar_url,
          followersCount: tikTokData?.follower_count
        };
        break;

      case 'youtube':
        response = await axios.get(config.profileUrl, {
          params: {
            part: 'snippet,statistics',
            mine: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const channel = response.data.items?.[0];
        profile = {
          id: channel?.id,
          username: channel?.snippet?.title,
          name: channel?.snippet?.title,
          profilePicture: channel?.snippet?.thumbnails?.default?.url,
          followersCount: parseInt(channel?.statistics?.subscriberCount || '0')
        };
        break;

      case 'pinterest':
        response = await axios.get(config.profileUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        profile = {
          id: response.data.id || response.data.username,
          username: response.data.username,
          name: response.data.business_name || response.data.username,
          profilePicture: response.data.profile_image,
          followersCount: response.data.follower_count
        };
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return profile;
  } catch (error: any) {
    console.error(`Failed to fetch profile (${platform}):`, error.response?.data || error.message);
    throw new Error(`Profile fetch failed for ${platform}: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Validate that all required environment variables are set for a platform
 */
export function validatePlatformConfig(platform: string): boolean {
  const config = getOAuthConfig(platform);
  return !!(config && config.clientId && config.clientSecret);
}

/**
 * Get list of all configured platforms
 */
export function getConfiguredPlatforms(): string[] {
  const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'];
  return platforms.filter(platform => validatePlatformConfig(platform));
}
