import { storage } from "./storage";
import type { Post } from "@shared/schema";
import {
  publishToFacebook as publishToFacebookReal,
  publishToTwitter as publishToTwitterReal,
  publishToLinkedIn as publishToLinkedInReal,
  publishToInstagram as publishToInstagramReal,
} from "./publishers";
import { withRetry } from "./utils/retry";

// Platform-specific character limits
const PLATFORM_LIMITS = {
  twitter: 280,
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 500,
};

// Platform-specific validation
export function validatePostForPlatform(content: string, platform: string): { valid: boolean; error?: string } {
  const limit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];

  if (!limit) {
    return { valid: false, error: `Unknown platform: ${platform}` };
  }

  if (content.length > limit) {
    return {
      valid: false,
      error: `Content exceeds ${platform} character limit of ${limit} (${content.length} characters)`
    };
  }

  return { valid: true };
}

// Real Facebook publishing with retry logic
async function publishToFacebook(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  return withRetry(
    () => publishToFacebookReal(post, post.userId),
    { maxAttempts: 3, initialDelay: 2000 }
  );
}

// Real Instagram publishing with retry logic
async function publishToInstagram(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  return withRetry(
    () => publishToInstagramReal(post, post.userId),
    { maxAttempts: 3, initialDelay: 2000 }
  );
}

// Real Twitter publishing with retry logic
async function publishToTwitter(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  return withRetry(
    () => publishToTwitterReal(post, post.userId),
    { maxAttempts: 3, initialDelay: 2000 }
  );
}

// Real LinkedIn publishing with retry logic
async function publishToLinkedIn(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  return withRetry(
    () => publishToLinkedInReal(post, post.userId),
    { maxAttempts: 3, initialDelay: 2000 }
  );
}

async function publishToTikTok(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  console.log(`[TikTok] Publishing post ${post.id}: ${post.content.substring(0, 50)}...`);

  await new Promise(resolve => setTimeout(resolve, 500));

  // TikTok requires video content
  if (!post.mediaUrls || post.mediaUrls.length === 0) {
    return { success: false, error: 'TikTok requires video content' };
  }

  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      platformPostId: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'TikTok upload failed'
    };
  }
}

async function publishToYouTube(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  console.log(`[YouTube] Publishing post ${post.id}: ${post.content.substring(0, 50)}...`);

  await new Promise(resolve => setTimeout(resolve, 500));

  // YouTube requires video content
  if (!post.mediaUrls || post.mediaUrls.length === 0) {
    return { success: false, error: 'YouTube requires video content' };
  }

  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      platformPostId: `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'YouTube upload processing failed'
    };
  }
}

async function publishToPinterest(post: Post): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  console.log(`[Pinterest] Publishing post ${post.id}: ${post.content.substring(0, 50)}...`);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Pinterest requires image content
  if (!post.mediaUrls || post.mediaUrls.length === 0) {
    return { success: false, error: 'Pinterest requires image content' };
  }

  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      platformPostId: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Pinterest pin creation failed'
    };
  }
}

// Platform publisher mapping
const platformPublishers: Record<string, (post: Post) => Promise<{ success: boolean; error?: string; platformPostId?: string }>> = {
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  tiktok: publishToTikTok,
  youtube: publishToYouTube,
  pinterest: publishToPinterest,
};

// Publish a post to a single platform
export async function publishToPlatform(
  post: Post,
  platform: string
): Promise<{ success: boolean; error?: string; platformPostId?: string }> {
  const publisher = platformPublishers[platform];

  if (!publisher) {
    return { success: false, error: `No publisher found for platform: ${platform}` };
  }

  try {
    return await publisher(post);
  } catch (error: any) {
    console.error(`Error publishing to ${platform}:`, error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}

// Publish a post to all its target platforms
export async function publishPost(post: Post): Promise<{
  success: boolean;
  results: Record<string, { success: boolean; error?: string; platformPostId?: string }>;
}> {
  console.log(`Publishing post ${post.id} to platforms:`, post.platforms);

  const results: Record<string, { success: boolean; error?: string; platformPostId?: string }> = {};

  // Publish to each platform
  for (const platform of post.platforms) {
    results[platform] = await publishToPlatform(post, platform);
  }

  // Check if all platforms succeeded
  const allSucceeded = Object.values(results).every(r => r.success);
  const someSucceeded = Object.values(results).some(r => r.success);

  // Update post status
  if (allSucceeded) {
    await storage.updatePost(post.id, {
      status: 'published',
      publishedAt: new Date(),
    });
  } else if (someSucceeded) {
    // Partial success - some platforms published, some failed
    await storage.updatePost(post.id, {
      status: 'published', // Mark as published since some succeeded
      publishedAt: new Date(),
    });
  } else {
    // All platforms failed
    await storage.updatePost(post.id, {
      status: 'failed',
    });
  }

  return {
    success: allSucceeded,
    results,
  };
}

// Check for posts that are ready to publish and publish them
export async function processScheduledPosts(): Promise<void> {
  console.log('[Publisher] Checking for scheduled posts...');

  try {
    // Get all scheduled posts that are due for publishing
    const duePosts = await storage.getScheduledPostsDue();

    if (duePosts.length === 0) {
      console.log('[Publisher] No posts due for publishing');
      return;
    }

    console.log(`[Publisher] Found ${duePosts.length} post(s) due for publishing`);

    for (const post of duePosts) {
      console.log(`[Publisher] Publishing post ${post.id} scheduled for ${post.scheduledAt?.toISOString()}`);

      try {
        await publishPost(post);
      } catch (error) {
        console.error(`[Publisher] Failed to publish post ${post.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Publisher] Error processing scheduled posts:', error);
  }
}

// Start the publishing scheduler (runs every minute)
let publisherInterval: NodeJS.Timeout | null = null;

export function startPublisher(): void {
  if (publisherInterval) {
    console.log('[Publisher] Already running');
    return;
  }

  console.log('[Publisher] Starting background publisher...');

  // Run immediately on start
  processScheduledPosts();

  // Then run every minute
  publisherInterval = setInterval(() => {
    processScheduledPosts();
  }, 60 * 1000); // 60 seconds

  console.log('[Publisher] Background publisher started');
}

export function stopPublisher(): void {
  if (publisherInterval) {
    clearInterval(publisherInterval);
    publisherInterval = null;
    console.log('[Publisher] Background publisher stopped');
  }
}
