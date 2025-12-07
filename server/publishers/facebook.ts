import axios from 'axios';
import type { Post, SocialAccount } from '@shared/schema';
import { storage } from '../storage';
import { config } from '../config';

const FACEBOOK_API_VERSION = 'v21.0';
const FACEBOOK_API_BASE = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

export interface PublishResult {
  success: boolean;
  error?: string;
  platformPostId?: string;
  details?: any;
}

/**
 * Publishes a post to Facebook using the Graph API
 * Documentation: https://developers.facebook.com/docs/graph-api/reference/page/feed
 */
export async function publishToFacebook(
  post: Post,
  userId: string
): Promise<PublishResult> {
  try {
    console.log(`[Facebook] Starting publish for post ${post.id}`);

    // Get user's Facebook accounts
    const accounts = await storage.getUserSocialAccounts(userId);
    const facebookAccount = accounts.find(
      (acc) => acc.platform === 'facebook' && acc.isActive
    );

    if (!facebookAccount) {
      return {
        success: false,
        error: 'No active Facebook account connected',
      };
    }

    // Check if access token is expired
    if (facebookAccount.expiresAt && new Date(facebookAccount.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Facebook access token expired. Please reconnect your account.',
      };
    }

    // Prepare post data
    const postData: any = {
      message: post.content,
      access_token: facebookAccount.accessToken,
    };

    // Add media if present
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      if (post.mediaUrls.length === 1) {
        // Single image/video
        const mediaUrl = post.mediaUrls[0];
        if (isVideoUrl(mediaUrl)) {
          // Video post
          postData.file_url = mediaUrl;
          return await publishFacebookVideo(facebookAccount, postData);
        } else {
          // Photo post
          postData.url = mediaUrl;
        }
      } else {
        // Multiple photos (album)
        return await publishFacebookAlbum(facebookAccount, post.content, post.mediaUrls);
      }
    }

    // Publish to Facebook Page
    const endpoint = `${FACEBOOK_API_BASE}/${facebookAccount.accountId}/feed`;

    console.log(`[Facebook] Posting to ${endpoint}`);

    const response = await axios.post(endpoint, postData, {
      timeout: 30000, // 30 second timeout
    });

    if (response.data && response.data.id) {
      console.log(`[Facebook] Successfully published post ${response.data.id}`);
      return {
        success: true,
        platformPostId: response.data.id,
        details: response.data,
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response from Facebook API',
        details: response.data,
      };
    }
  } catch (error: any) {
    console.error('[Facebook] Publish error:', error);

    // Handle specific Facebook API errors
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;

      // Common Facebook error codes
      switch (fbError.code) {
        case 190: // Invalid OAuth token
          return {
            success: false,
            error: 'Facebook access token invalid. Please reconnect your account.',
            details: fbError,
          };
        case 200: // Permission error
          return {
            success: false,
            error: `Missing Facebook permission: ${fbError.message}`,
            details: fbError,
          };
        case 368: // Temporarily blocked
          return {
            success: false,
            error: 'Temporarily blocked by Facebook. Please try again later.',
            details: fbError,
          };
        case 4: // Rate limit
          return {
            success: false,
            error: 'Facebook rate limit exceeded. Please wait before posting again.',
            details: fbError,
          };
        default:
          return {
            success: false,
            error: fbError.message || 'Facebook API error',
            details: fbError,
          };
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to publish to Facebook',
      details: error,
    };
  }
}

/**
 * Publishes a video to Facebook
 */
async function publishFacebookVideo(
  account: SocialAccount,
  postData: any
): Promise<PublishResult> {
  try {
    const endpoint = `${FACEBOOK_API_BASE}/${account.accountId}/videos`;

    console.log(`[Facebook] Publishing video to ${endpoint}`);

    const response = await axios.post(endpoint, postData, {
      timeout: 120000, // 2 minute timeout for videos
    });

    if (response.data && response.data.id) {
      return {
        success: true,
        platformPostId: response.data.id,
        details: response.data,
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response from Facebook video API',
        details: response.data,
      };
    }
  } catch (error: any) {
    console.error('[Facebook] Video publish error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to publish video',
      details: error.response?.data,
    };
  }
}

/**
 * Publishes a photo album to Facebook
 */
async function publishFacebookAlbum(
  account: SocialAccount,
  message: string,
  photoUrls: string[]
): Promise<PublishResult> {
  try {
    console.log(`[Facebook] Creating album with ${photoUrls.length} photos`);

    // Step 1: Create album
    const albumEndpoint = `${FACEBOOK_API_BASE}/${account.accountId}/albums`;
    const albumResponse = await axios.post(albumEndpoint, {
      name: `Post ${new Date().toISOString()}`,
      message: message,
      access_token: account.accessToken,
    });

    const albumId = albumResponse.data.id;
    console.log(`[Facebook] Created album ${albumId}`);

    // Step 2: Upload photos to album
    const photoEndpoint = `${FACEBOOK_API_BASE}/${albumId}/photos`;
    const uploadPromises = photoUrls.map((url) =>
      axios.post(photoEndpoint, {
        url: url,
        access_token: account.accessToken,
      })
    );

    await Promise.all(uploadPromises);

    return {
      success: true,
      platformPostId: albumId,
      details: { albumId, photoCount: photoUrls.length },
    };
  } catch (error: any) {
    console.error('[Facebook] Album publish error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to create album',
      details: error.response?.data,
    };
  }
}

/**
 * Helper function to detect video URLs
 */
function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Gets insights for a published post
 * https://developers.facebook.com/docs/graph-api/reference/v21.0/insights
 */
export async function getFacebookPostInsights(
  postId: string,
  accessToken: string
): Promise<any> {
  try {
    const endpoint = `${FACEBOOK_API_BASE}/${postId}/insights`;
    const response = await axios.get(endpoint, {
      params: {
        metric: 'post_impressions,post_engaged_users,post_clicks',
        access_token: accessToken,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[Facebook] Failed to fetch insights:', error);
    return null;
  }
}

/**
 * Deletes a Facebook post
 */
export async function deleteFacebookPost(
  postId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const endpoint = `${FACEBOOK_API_BASE}/${postId}`;
    await axios.delete(endpoint, {
      params: { access_token: accessToken },
    });
    return true;
  } catch (error: any) {
    console.error('[Facebook] Failed to delete post:', error);
    return false;
  }
}
