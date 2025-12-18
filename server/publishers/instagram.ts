import axios from 'axios';
import type { Post, SocialAccount } from '@shared/schema';
import { storage } from '../storage';

const INSTAGRAM_API_VERSION = 'v21.0';
const INSTAGRAM_API_BASE = `https://graph.facebook.com/${INSTAGRAM_API_VERSION}`;

export interface PublishResult {
  success: boolean;
  error?: string;
  platformPostId?: string;
  details?: any;
}

/**
 * Publishes a post to Instagram using the Instagram Graph API
 * Documentation: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *
 * Note: Instagram requires Business or Creator accounts
 */
export async function publishToInstagram(
  post: Post,
  userId: string
): Promise<PublishResult> {
  try {
    console.log(`[Instagram] Starting publish for post ${post.id}`);

    // Get user's Instagram accounts
    const accounts = await storage.getUserSocialAccounts(userId);
    const instagramAccount = accounts.find(
      (acc) => acc.platform === 'instagram' && acc.isActive
    );

    if (!instagramAccount) {
      return {
        success: false,
        error: 'No active Instagram account connected',
      };
    }

    // Check token expiration
    if (instagramAccount.expiresAt && new Date(instagramAccount.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Instagram access token expired. Please reconnect your account.',
      };
    }

    // Validate caption length (2200 chars)
    if (post.content.length > 2200) {
      return {
        success: false,
        error: `Instagram caption exceeds 2200 character limit (${post.content.length} characters)`,
      };
    }

    // Instagram requires at least one media item
    if (!post.mediaUrls || post.mediaUrls.length === 0) {
      return {
        success: false,
        error: 'Instagram posts require at least one image or video',
      };
    }

    // Determine media type and publish accordingly
    if (post.mediaUrls.length === 1) {
      // Single image or video
      const mediaUrl = post.mediaUrls[0];
      if (isVideoUrl(mediaUrl)) {
        return await publishInstagramVideo(instagramAccount, post.content, mediaUrl);
      } else {
        return await publishInstagramPhoto(instagramAccount, post.content, mediaUrl);
      }
    } else {
      // Carousel (multiple images)
      return await publishInstagramCarousel(instagramAccount, post.content, post.mediaUrls);
    }
  } catch (error: any) {
    console.error('[Instagram] Publish error:', error);

    if (error.response?.data?.error) {
      const igError = error.response.data.error;

      // Common Instagram error codes
      switch (igError.code) {
        case 190: // Invalid OAuth token
          return {
            success: false,
            error: 'Instagram access token invalid. Please reconnect your account.',
            details: igError,
          };
        case 100: // Invalid parameter
          return {
            success: false,
            error: `Invalid parameter: ${igError.message}`,
            details: igError,
          };
        case 36000: // Rate limit
          return {
            success: false,
            error: 'Instagram rate limit exceeded. Please wait before posting again.',
            details: igError,
          };
        default:
          return {
            success: false,
            error: igError.message || 'Instagram API error',
            details: igError,
          };
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to publish to Instagram',
      details: error,
    };
  }
}

/**
 * Publishes a single photo to Instagram
 */
async function publishInstagramPhoto(
  account: SocialAccount,
  caption: string,
  imageUrl: string
): Promise<PublishResult> {
  try {
    console.log(`[Instagram] Publishing photo to account ${account.accountId}`);

    // Step 1: Create media container
    const createEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media`;

    const createResponse = await axios.post(
      createEndpoint,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: account.accessToken,
      },
      {
        timeout: 60000, // 1 minute timeout
      }
    );

    const containerId = createResponse.data.id;
    console.log(`[Instagram] Created media container ${containerId}`);

    // Step 2: Publish media container
    const publishEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media_publish`;

    const publishResponse = await axios.post(publishEndpoint, {
      creation_id: containerId,
      access_token: account.accessToken,
    });

    const postId = publishResponse.data.id;
    console.log(`[Instagram] Successfully published photo ${postId}`);

    return {
      success: true,
      platformPostId: postId,
      details: { containerId, postId },
    };
  } catch (error: any) {
    console.error('[Instagram] Photo publish error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to publish photo',
      details: error.response?.data,
    };
  }
}

/**
 * Publishes a video to Instagram
 */
async function publishInstagramVideo(
  account: SocialAccount,
  caption: string,
  videoUrl: string
): Promise<PublishResult> {
  try {
    console.log(`[Instagram] Publishing video to account ${account.accountId}`);

    // Step 1: Create video media container
    const createEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media`;

    const createResponse = await axios.post(
      createEndpoint,
      {
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: caption,
        access_token: account.accessToken,
      },
      {
        timeout: 120000, // 2 minute timeout for videos
      }
    );

    const containerId = createResponse.data.id;
    console.log(`[Instagram] Created video container ${containerId}`);

    // Step 2: Wait for video to be processed
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts * 5 seconds = 100 seconds max

    while (!isReady && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await axios.get(
        `${INSTAGRAM_API_BASE}/${containerId}`,
        {
          params: {
            fields: 'status_code',
            access_token: account.accessToken,
          },
        }
      );

      const statusCode = statusResponse.data.status_code;

      if (statusCode === 'FINISHED') {
        isReady = true;
      } else if (statusCode === 'ERROR') {
        return {
          success: false,
          error: 'Video processing failed',
        };
      }

      attempts++;
    }

    if (!isReady) {
      return {
        success: false,
        error: 'Video processing timeout',
      };
    }

    // Step 3: Publish video
    const publishEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media_publish`;

    const publishResponse = await axios.post(publishEndpoint, {
      creation_id: containerId,
      access_token: account.accessToken,
    });

    const postId = publishResponse.data.id;
    console.log(`[Instagram] Successfully published video ${postId}`);

    return {
      success: true,
      platformPostId: postId,
      details: { containerId, postId },
    };
  } catch (error: any) {
    console.error('[Instagram] Video publish error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to publish video',
      details: error.response?.data,
    };
  }
}

/**
 * Publishes a carousel (multiple images) to Instagram
 */
async function publishInstagramCarousel(
  account: SocialAccount,
  caption: string,
  imageUrls: string[]
): Promise<PublishResult> {
  try {
    console.log(`[Instagram] Publishing carousel with ${imageUrls.length} images`);

    // Instagram allows max 10 items in carousel
    if (imageUrls.length > 10) {
      return {
        success: false,
        error: 'Instagram allows maximum 10 items in a carousel',
      };
    }

    // Step 1: Create media containers for each image
    const createEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media`;
    const containerIds: string[] = [];

    for (const imageUrl of imageUrls) {
      const response = await axios.post(createEndpoint, {
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: account.accessToken,
      });

      containerIds.push(response.data.id);
    }

    console.log(`[Instagram] Created ${containerIds.length} carousel item containers`);

    // Step 2: Create carousel container
    const carouselResponse = await axios.post(createEndpoint, {
      media_type: 'CAROUSEL',
      caption: caption,
      children: containerIds.join(','),
      access_token: account.accessToken,
    });

    const carouselContainerId = carouselResponse.data.id;
    console.log(`[Instagram] Created carousel container ${carouselContainerId}`);

    // Step 3: Publish carousel
    const publishEndpoint = `${INSTAGRAM_API_BASE}/${account.accountId}/media_publish`;

    const publishResponse = await axios.post(publishEndpoint, {
      creation_id: carouselContainerId,
      access_token: account.accessToken,
    });

    const postId = publishResponse.data.id;
    console.log(`[Instagram] Successfully published carousel ${postId}`);

    return {
      success: true,
      platformPostId: postId,
      details: { containerIds, carouselContainerId, postId },
    };
  } catch (error: any) {
    console.error('[Instagram] Carousel publish error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to publish carousel',
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
 * Gets insights for an Instagram post
 */
export async function getInstagramPostInsights(
  postId: string,
  accessToken: string
): Promise<any> {
  try {
    const endpoint = `${INSTAGRAM_API_BASE}/${postId}/insights`;

    const response = await axios.get(endpoint, {
      params: {
        metric: 'impressions,reach,engagement,saved,video_views',
        access_token: accessToken,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[Instagram] Failed to fetch insights:', error);
    return null;
  }
}

/**
 * Deletes an Instagram post
 */
export async function deleteInstagramPost(
  postId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const endpoint = `${INSTAGRAM_API_BASE}/${postId}`;

    await axios.delete(endpoint, {
      params: { access_token: accessToken },
    });

    console.log(`[Instagram] Successfully deleted post ${postId}`);
    return true;
  } catch (error: any) {
    console.error('[Instagram] Failed to delete post:', error);
    return false;
  }
}
