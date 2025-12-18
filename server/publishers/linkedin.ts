import axios from 'axios';
import type { Post, SocialAccount } from '@shared/schema';
import { storage } from '../storage';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface PublishResult {
  success: boolean;
  error?: string;
  platformPostId?: string;
  details?: any;
}

/**
 * Publishes a post to LinkedIn using the v2 API
 * Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
 */
export async function publishToLinkedIn(
  post: Post,
  userId: string
): Promise<PublishResult> {
  try {
    console.log(`[LinkedIn] Starting publish for post ${post.id}`);

    // Get user's LinkedIn accounts
    const accounts = await storage.getUserSocialAccounts(userId);
    const linkedinAccount = accounts.find(
      (acc) => acc.platform === 'linkedin' && acc.isActive
    );

    if (!linkedinAccount) {
      return {
        success: false,
        error: 'No active LinkedIn account connected',
      };
    }

    // Check token expiration
    if (linkedinAccount.expiresAt && new Date(linkedinAccount.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'LinkedIn access token expired. Please reconnect your account.',
      };
    }

    // Validate character limit (3000 chars for LinkedIn)
    if (post.content.length > 3000) {
      return {
        success: false,
        error: `LinkedIn post exceeds 3000 character limit (${post.content.length} characters)`,
      };
    }

    // Prepare share data
    const shareData: any = {
      author: `urn:li:person:${linkedinAccount.accountId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Add media if present
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      // LinkedIn supports images and articles
      const media = await prepareLinkedInMedia(
        linkedinAccount.accessToken,
        linkedinAccount.accountId,
        post.mediaUrls
      );

      if (media) {
        shareData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory =
          media.category;
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = media.items;
      }
    }

    // Post to LinkedIn
    const endpoint = `${LINKEDIN_API_BASE}/ugcPosts`;

    console.log(`[LinkedIn] Posting to ${endpoint}`);

    const response = await axios.post(endpoint, shareData, {
      headers: {
        'Authorization': `Bearer ${linkedinAccount.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      timeout: 30000,
    });

    if (response.data && response.data.id) {
      const postId = response.data.id;
      console.log(`[LinkedIn] Successfully published post ${postId}`);

      return {
        success: true,
        platformPostId: postId,
        details: response.data,
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response from LinkedIn API',
        details: response.data,
      };
    }
  } catch (error: any) {
    console.error('[LinkedIn] Publish error:', error);

    // Handle LinkedIn API errors
    if (error.response?.data) {
      const linkedinError = error.response.data;

      // Check for specific error codes
      if (error.response.status === 401) {
        return {
          success: false,
          error: 'LinkedIn authentication failed. Please reconnect your account.',
          details: linkedinError,
        };
      }

      if (error.response.status === 429) {
        return {
          success: false,
          error: 'LinkedIn rate limit exceeded. Please wait before posting again.',
          details: linkedinError,
        };
      }

      if (error.response.status === 403) {
        return {
          success: false,
          error: 'Permission denied. Check LinkedIn app permissions.',
          details: linkedinError,
        };
      }

      const errorMessage =
        linkedinError.message || linkedinError.error_description || 'LinkedIn API error';

      return {
        success: false,
        error: errorMessage,
        details: linkedinError,
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to publish to LinkedIn',
      details: error,
    };
  }
}

/**
 * Prepares media assets for LinkedIn post
 */
async function prepareLinkedInMedia(
  accessToken: string,
  personId: string,
  mediaUrls: string[]
): Promise<{ category: string; items: any[] } | null> {
  try {
    const uploadedAssets: any[] = [];

    for (const url of mediaUrls) {
      // Step 1: Register upload
      const registerEndpoint = `${LINKEDIN_API_BASE}/assets?action=registerUpload`;

      const registerData = {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      };

      const registerResponse = await axios.post(registerEndpoint, registerData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const uploadUrl = registerResponse.data.value.uploadMechanism[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ].uploadUrl;
      const asset = registerResponse.data.value.asset;

      // Step 2: Download image
      const imageResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // Step 3: Upload to LinkedIn
      await axios.put(uploadUrl, imageResponse.data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg',
        },
      });

      uploadedAssets.push({
        status: 'READY',
        description: {
          text: '',
        },
        media: asset,
        title: {
          text: '',
        },
      });

      console.log(`[LinkedIn] Uploaded media asset: ${asset}`);
    }

    return {
      category: 'IMAGE',
      items: uploadedAssets,
    };
  } catch (error: any) {
    console.error('[LinkedIn] Media upload error:', error);
    return null;
  }
}

/**
 * Publishes to LinkedIn organization page
 */
export async function publishToLinkedInOrganization(
  post: Post,
  organizationId: string,
  accessToken: string
): Promise<PublishResult> {
  try {
    const shareData = {
      author: `urn:li:organization:${organizationId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await axios.post(`${LINKEDIN_API_BASE}/ugcPosts`, shareData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (response.data && response.data.id) {
      return {
        success: true,
        platformPostId: response.data.id,
        details: response.data,
      };
    }

    return {
      success: false,
      error: 'Unexpected response from LinkedIn API',
    };
  } catch (error: any) {
    console.error('[LinkedIn] Organization publish error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to publish',
      details: error.response?.data,
    };
  }
}

/**
 * Deletes a LinkedIn post
 */
export async function deleteLinkedInPost(
  postId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const endpoint = `${LINKEDIN_API_BASE}/ugcPosts/${encodeURIComponent(postId)}`;

    await axios.delete(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log(`[LinkedIn] Successfully deleted post ${postId}`);
    return true;
  } catch (error: any) {
    console.error('[LinkedIn] Failed to delete post:', error);
    return false;
  }
}

/**
 * Gets analytics for a LinkedIn post
 */
export async function getLinkedInPostAnalytics(
  postId: string,
  accessToken: string
): Promise<any> {
  try {
    const endpoint = `${LINKEDIN_API_BASE}/socialActions/${encodeURIComponent(postId)}`;

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[LinkedIn] Failed to fetch analytics:', error);
    return null;
  }
}
