import axios from 'axios';
import type { Post, SocialAccount } from '@shared/schema';
import { storage } from '../storage';

const TWITTER_API_BASE = 'https://api.twitter.com/2';

export interface PublishResult {
  success: boolean;
  error?: string;
  platformPostId?: string;
  details?: any;
}

/**
 * Publishes a tweet to Twitter/X using the v2 API
 * Documentation: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 */
export async function publishToTwitter(
  post: Post,
  userId: string
): Promise<PublishResult> {
  try {
    console.log(`[Twitter] Starting publish for post ${post.id}`);

    // Get user's Twitter accounts
    const accounts = await storage.getUserSocialAccounts(userId);
    const twitterAccount = accounts.find(
      (acc) => acc.platform === 'twitter' && acc.isActive
    );

    if (!twitterAccount) {
      return {
        success: false,
        error: 'No active Twitter account connected',
      };
    }

    // Check token expiration
    if (twitterAccount.expiresAt && new Date(twitterAccount.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Twitter access token expired. Please reconnect your account.',
      };
    }

    // Validate character limit (280 chars)
    if (post.content.length > 280) {
      return {
        success: false,
        error: `Tweet exceeds 280 character limit (${post.content.length} characters)`,
      };
    }

    // Prepare tweet data
    const tweetData: any = {
      text: post.content,
    };

    // Add media if present
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      // Twitter allows up to 4 images or 1 video
      if (post.mediaUrls.length > 4) {
        return {
          success: false,
          error: 'Twitter allows maximum 4 images per tweet',
        };
      }

      // Upload media first
      const mediaIds = await uploadTwitterMedia(
        twitterAccount.accessToken,
        post.mediaUrls
      );

      if (mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds,
        };
      }
    }

    // Post the tweet
    const endpoint = `${TWITTER_API_BASE}/tweets`;

    console.log(`[Twitter] Posting to ${endpoint}`);

    const response = await axios.post(endpoint, tweetData, {
      headers: {
        'Authorization': `Bearer ${twitterAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (response.data && response.data.data && response.data.data.id) {
      const tweetId = response.data.data.id;
      console.log(`[Twitter] Successfully published tweet ${tweetId}`);

      return {
        success: true,
        platformPostId: tweetId,
        details: response.data.data,
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response from Twitter API',
        details: response.data,
      };
    }
  } catch (error: any) {
    console.error('[Twitter] Publish error:', error);

    // Handle Twitter API errors
    if (error.response?.data?.errors) {
      const twitterError = error.response.data.errors[0];

      // Common Twitter error codes
      const errorMessage = twitterError.message || twitterError.detail || 'Twitter API error';

      // Check for specific error types
      if (errorMessage.includes('duplicate')) {
        return {
          success: false,
          error: 'This tweet appears to be a duplicate',
          details: twitterError,
        };
      }

      if (errorMessage.includes('rate limit')) {
        return {
          success: false,
          error: 'Twitter rate limit exceeded. Please wait before posting again.',
          details: twitterError,
        };
      }

      if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        return {
          success: false,
          error: 'Twitter authentication failed. Please reconnect your account.',
          details: twitterError,
        };
      }

      return {
        success: false,
        error: errorMessage,
        details: twitterError,
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to publish to Twitter',
      details: error,
    };
  }
}

/**
 * Uploads media to Twitter for use in tweets
 * Twitter v2 API requires using v1.1 for media uploads
 */
async function uploadTwitterMedia(
  accessToken: string,
  mediaUrls: string[]
): Promise<string[]> {
  const mediaIds: string[] = [];

  try {
    // Twitter requires downloading media first, then uploading
    // This is a simplified version - production should handle chunked uploads for large files
    for (const url of mediaUrls) {
      // Download media
      const mediaResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      const mediaBuffer = Buffer.from(mediaResponse.data);
      const base64Media = mediaBuffer.toString('base64');

      // Upload to Twitter v1.1 API
      const uploadEndpoint = 'https://upload.twitter.com/1.1/media/upload.json';

      const uploadResponse = await axios.post(
        uploadEndpoint,
        {
          media_data: base64Media,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (uploadResponse.data && uploadResponse.data.media_id_string) {
        mediaIds.push(uploadResponse.data.media_id_string);
        console.log(`[Twitter] Uploaded media: ${uploadResponse.data.media_id_string}`);
      }
    }
  } catch (error: any) {
    console.error('[Twitter] Media upload error:', error);
  }

  return mediaIds;
}

/**
 * Deletes a tweet
 * Documentation: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/delete-tweets-id
 */
export async function deleteTwitterPost(
  tweetId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const endpoint = `${TWITTER_API_BASE}/tweets/${tweetId}`;

    await axios.delete(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log(`[Twitter] Successfully deleted tweet ${tweetId}`);
    return true;
  } catch (error: any) {
    console.error('[Twitter] Failed to delete tweet:', error);
    return false;
  }
}

/**
 * Gets metrics for a tweet
 * Documentation: https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
 */
export async function getTwitterPostMetrics(
  tweetId: string,
  accessToken: string
): Promise<any> {
  try {
    const endpoint = `${TWITTER_API_BASE}/tweets/${tweetId}`;

    const response = await axios.get(endpoint, {
      params: {
        'tweet.fields': 'public_metrics,created_at',
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('[Twitter] Failed to fetch metrics:', error);
    return null;
  }
}

/**
 * Creates a thread (multiple tweets)
 * Useful for content longer than 280 characters
 */
export async function publishTwitterThread(
  tweets: string[],
  accessToken: string,
  mediaUrls?: string[]
): Promise<PublishResult> {
  try {
    const tweetIds: string[] = [];
    let previousTweetId: string | null = null;

    for (let i = 0; i < tweets.length; i++) {
      const tweetData: any = {
        text: tweets[i],
      };

      // Reply to previous tweet to create thread
      if (previousTweetId) {
        tweetData.reply = {
          in_reply_to_tweet_id: previousTweetId,
        };
      }

      // Add media to first tweet only
      if (i === 0 && mediaUrls && mediaUrls.length > 0) {
        const mediaIds = await uploadTwitterMedia(accessToken, mediaUrls);
        if (mediaIds.length > 0) {
          tweetData.media = {
            media_ids: mediaIds,
          };
        }
      }

      const response = await axios.post(
        `${TWITTER_API_BASE}/tweets`,
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.id) {
        const tweetId = response.data.data.id;
        tweetIds.push(tweetId);
        previousTweetId = tweetId;
        console.log(`[Twitter] Published tweet ${i + 1}/${tweets.length}: ${tweetId}`);
      }
    }

    return {
      success: true,
      platformPostId: tweetIds[0], // Return first tweet ID
      details: { tweetIds, threadLength: tweets.length },
    };
  } catch (error: any) {
    console.error('[Twitter] Thread publish error:', error);
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.message || error.message || 'Failed to publish thread',
      details: error.response?.data,
    };
  }
}
