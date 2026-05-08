import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Post } from '@shared/schema';

// Mock storage
const mockUpdatePost = jest.fn();
const mockGetScheduledPostsDue = jest.fn();

jest.mock('../storage', () => ({
  storage: {
    updatePost: mockUpdatePost,
    getScheduledPostsDue: mockGetScheduledPostsDue,
  },
}));

// Mock platform publishers
const mockPublishToFacebook = jest.fn();
const mockPublishToTwitter = jest.fn();
const mockPublishToLinkedIn = jest.fn();
const mockPublishToInstagram = jest.fn();

jest.mock('../publishers', () => ({
  publishToFacebook: mockPublishToFacebook,
  publishToTwitter: mockPublishToTwitter,
  publishToLinkedIn: mockPublishToLinkedIn,
  publishToInstagram: mockPublishToInstagram,
}));

// Import after mocking
import {
  validatePostForPlatform,
  publishToPlatform,
  publishPost,
  processScheduledPosts,
  startPublisher,
  stopPublisher,
} from '../publisher';

describe('Publisher Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePost.mockResolvedValue(undefined);
  });

  describe('validatePostForPlatform', () => {
    it('should validate Twitter character limit (280)', () => {
      const shortContent = 'Short tweet';
      const longContent = 'a'.repeat(281);

      expect(validatePostForPlatform(shortContent, 'twitter').valid).toBe(true);

      const result = validatePostForPlatform(longContent, 'twitter');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('280');
    });

    it('should validate Facebook character limit (63206)', () => {
      const content = 'a'.repeat(63206);
      const tooLong = 'a'.repeat(63207);

      expect(validatePostForPlatform(content, 'facebook').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'facebook').valid).toBe(false);
    });

    it('should validate Instagram character limit (2200)', () => {
      const content = 'a'.repeat(2200);
      const tooLong = 'a'.repeat(2201);

      expect(validatePostForPlatform(content, 'instagram').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'instagram').valid).toBe(false);
    });

    it('should validate LinkedIn character limit (3000)', () => {
      const content = 'a'.repeat(3000);
      const tooLong = 'a'.repeat(3001);

      expect(validatePostForPlatform(content, 'linkedin').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'linkedin').valid).toBe(false);
    });

    it('should validate TikTok character limit (2200)', () => {
      const content = 'a'.repeat(2200);
      const tooLong = 'a'.repeat(2201);

      expect(validatePostForPlatform(content, 'tiktok').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'tiktok').valid).toBe(false);
    });

    it('should validate YouTube character limit (5000)', () => {
      const content = 'a'.repeat(5000);
      const tooLong = 'a'.repeat(5001);

      expect(validatePostForPlatform(content, 'youtube').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'youtube').valid).toBe(false);
    });

    it('should validate Pinterest character limit (500)', () => {
      const content = 'a'.repeat(500);
      const tooLong = 'a'.repeat(501);

      expect(validatePostForPlatform(content, 'pinterest').valid).toBe(true);
      expect(validatePostForPlatform(tooLong, 'pinterest').valid).toBe(false);
    });

    it('should return error for unknown platform', () => {
      const result = validatePostForPlatform('test', 'unknown');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown platform');
    });

    it('should include character count in error message', () => {
      const content = 'a'.repeat(300);
      const result = validatePostForPlatform(content, 'twitter');

      expect(result.error).toContain('300 characters');
    });
  });

  describe('publishToPlatform', () => {
    const mockPost: Post = {
      id: 1,
      userId: 'user123',
      content: 'Test post',
      platforms: ['facebook'],
      status: 'scheduled',
      scheduledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should publish to Facebook successfully', async () => {
      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_123',
      });

      const result = await publishToPlatform(mockPost, 'facebook');

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe('fb_123');
      expect(mockPublishToFacebook).toHaveBeenCalledWith(mockPost, 'user123');
    });

    it('should publish to Twitter successfully', async () => {
      mockPublishToTwitter.mockResolvedValueOnce({
        success: true,
        platformPostId: 'tw_456',
      });

      const result = await publishToPlatform(mockPost, 'twitter');

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe('tw_456');
      expect(mockPublishToTwitter).toHaveBeenCalledWith(mockPost, 'user123');
    });

    it('should publish to LinkedIn successfully', async () => {
      mockPublishToLinkedIn.mockResolvedValueOnce({
        success: true,
        platformPostId: 'li_789',
      });

      const result = await publishToPlatform(mockPost, 'linkedin');

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe('li_789');
      expect(mockPublishToLinkedIn).toHaveBeenCalledWith(mockPost, 'user123');
    });

    it('should publish to Instagram successfully', async () => {
      mockPublishToInstagram.mockResolvedValueOnce({
        success: true,
        platformPostId: 'ig_321',
      });

      const result = await publishToPlatform(mockPost, 'instagram');

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe('ig_321');
      expect(mockPublishToInstagram).toHaveBeenCalledWith(mockPost, 'user123');
    });

    it('should return error for unsupported platform', async () => {
      const result = await publishToPlatform(mockPost, 'unsupported');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No publisher found');
    });

    it('should handle publisher errors', async () => {
      mockPublishToFacebook.mockRejectedValueOnce(new Error('API Error'));

      const result = await publishToPlatform(mockPost, 'facebook');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API Error');
    });

    it('should handle TikTok video requirement', async () => {
      const postWithoutMedia: Post = {
        ...mockPost,
        mediaUrls: [],
      };

      const result = await publishToPlatform(postWithoutMedia, 'tiktok');

      expect(result.success).toBe(false);
      expect(result.error).toContain('video content');
    });

    it('should handle YouTube video requirement', async () => {
      const postWithoutMedia: Post = {
        ...mockPost,
        mediaUrls: [],
      };

      const result = await publishToPlatform(postWithoutMedia, 'youtube');

      expect(result.success).toBe(false);
      expect(result.error).toContain('video content');
    });

    it('should handle Pinterest image requirement', async () => {
      const postWithoutMedia: Post = {
        ...mockPost,
        mediaUrls: [],
      };

      const result = await publishToPlatform(postWithoutMedia, 'pinterest');

      expect(result.success).toBe(false);
      expect(result.error).toContain('image content');
    });
  });

  describe('publishPost', () => {
    const mockPost: Post = {
      id: 1,
      userId: 'user123',
      content: 'Multi-platform post',
      platforms: ['facebook', 'twitter'],
      status: 'scheduled',
      scheduledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should publish to all platforms successfully', async () => {
      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_123',
      });
      mockPublishToTwitter.mockResolvedValueOnce({
        success: true,
        platformPostId: 'tw_456',
      });

      const result = await publishPost(mockPost);

      expect(result.success).toBe(true);
      expect(result.results.facebook.success).toBe(true);
      expect(result.results.twitter.success).toBe(true);
      expect(mockUpdatePost).toHaveBeenCalledWith(1, {
        status: 'published',
        publishedAt: expect.any(Date),
      });
    });

    it('should handle partial success (some platforms fail)', async () => {
      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_123',
      });
      mockPublishToTwitter.mockResolvedValueOnce({
        success: false,
        error: 'Twitter API error',
      });

      const result = await publishPost(mockPost);

      expect(result.success).toBe(false);
      expect(result.results.facebook.success).toBe(true);
      expect(result.results.twitter.success).toBe(false);
      // Should still mark as published if at least one succeeded
      expect(mockUpdatePost).toHaveBeenCalledWith(1, {
        status: 'published',
        publishedAt: expect.any(Date),
      });
    });

    it('should handle complete failure (all platforms fail)', async () => {
      mockPublishToFacebook.mockResolvedValueOnce({
        success: false,
        error: 'Facebook error',
      });
      mockPublishToTwitter.mockResolvedValueOnce({
        success: false,
        error: 'Twitter error',
      });

      const result = await publishPost(mockPost);

      expect(result.success).toBe(false);
      expect(result.results.facebook.success).toBe(false);
      expect(result.results.twitter.success).toBe(false);
      expect(mockUpdatePost).toHaveBeenCalledWith(1, {
        status: 'failed',
      });
    });

    it('should publish to single platform', async () => {
      const singlePlatformPost: Post = {
        ...mockPost,
        platforms: ['facebook'],
      };

      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_123',
      });

      const result = await publishPost(singlePlatformPost);

      expect(result.success).toBe(true);
      expect(Object.keys(result.results)).toHaveLength(1);
      expect(result.results.facebook).toBeDefined();
    });

    it('should include platform post IDs in results', async () => {
      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_unique_123',
      });
      mockPublishToTwitter.mockResolvedValueOnce({
        success: true,
        platformPostId: 'tw_unique_456',
      });

      const result = await publishPost(mockPost);

      expect(result.results.facebook.platformPostId).toBe('fb_unique_123');
      expect(result.results.twitter.platformPostId).toBe('tw_unique_456');
    });
  });

  describe('processScheduledPosts', () => {
    it('should process due posts', async () => {
      const duePost: Post = {
        id: 1,
        userId: 'user123',
        content: 'Scheduled post',
        platforms: ['facebook'],
        status: 'scheduled',
        scheduledAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetScheduledPostsDue.mockResolvedValueOnce([duePost]);
      mockPublishToFacebook.mockResolvedValueOnce({
        success: true,
        platformPostId: 'fb_123',
      });

      await processScheduledPosts();

      expect(mockGetScheduledPostsDue).toHaveBeenCalled();
      expect(mockPublishToFacebook).toHaveBeenCalled();
      expect(mockUpdatePost).toHaveBeenCalledWith(1, {
        status: 'published',
        publishedAt: expect.any(Date),
      });
    });

    it('should handle no due posts', async () => {
      mockGetScheduledPostsDue.mockResolvedValueOnce([]);

      await processScheduledPosts();

      expect(mockGetScheduledPostsDue).toHaveBeenCalled();
      expect(mockPublishToFacebook).not.toHaveBeenCalled();
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });

    it('should handle multiple due posts', async () => {
      const duePosts: Post[] = [
        {
          id: 1,
          userId: 'user123',
          content: 'Post 1',
          platforms: ['facebook'],
          status: 'scheduled',
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user123',
          content: 'Post 2',
          platforms: ['twitter'],
          status: 'scheduled',
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetScheduledPostsDue.mockResolvedValueOnce(duePosts);
      mockPublishToFacebook.mockResolvedValueOnce({ success: true, platformPostId: 'fb_1' });
      mockPublishToTwitter.mockResolvedValueOnce({ success: true, platformPostId: 'tw_2' });

      await processScheduledPosts();

      expect(mockPublishToFacebook).toHaveBeenCalledTimes(1);
      expect(mockPublishToTwitter).toHaveBeenCalledTimes(1);
      expect(mockUpdatePost).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      mockGetScheduledPostsDue.mockRejectedValueOnce(new Error('Database error'));

      await expect(processScheduledPosts()).resolves.not.toThrow();
    });

    it('should continue processing even if one post fails', async () => {
      const duePosts: Post[] = [
        {
          id: 1,
          userId: 'user123',
          content: 'Post 1',
          platforms: ['facebook'],
          status: 'scheduled',
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user123',
          content: 'Post 2',
          platforms: ['twitter'],
          status: 'scheduled',
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetScheduledPostsDue.mockResolvedValueOnce(duePosts);
      mockPublishToFacebook.mockRejectedValueOnce(new Error('Facebook error'));
      mockPublishToTwitter.mockResolvedValueOnce({ success: true, platformPostId: 'tw_2' });

      await processScheduledPosts();

      // Should still try to publish the second post
      expect(mockPublishToTwitter).toHaveBeenCalled();
    });
  });

  describe('startPublisher and stopPublisher', () => {
    beforeEach(() => {
      // Stop any running publisher before tests
      stopPublisher();
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      stopPublisher();
      jest.useRealTimers();
    });

    it('should start the background publisher', () => {
      mockGetScheduledPostsDue.mockResolvedValue([]);

      startPublisher();

      // Should run immediately on start
      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(1);
    });

    it('should run on interval', async () => {
      mockGetScheduledPostsDue.mockResolvedValue([]);

      startPublisher();

      // Initial call
      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(1);

      // Advance time by 60 seconds
      jest.advanceTimersByTime(60000);
      await Promise.resolve(); // Let promises resolve

      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(2);

      // Advance another 60 seconds
      jest.advanceTimersByTime(60000);
      await Promise.resolve();

      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(3);
    });

    it('should not start multiple publishers', () => {
      mockGetScheduledPostsDue.mockResolvedValue([]);

      startPublisher();
      startPublisher(); // Try to start again

      // Should only have called once (from first start)
      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(1);
    });

    it('should stop the publisher', async () => {
      mockGetScheduledPostsDue.mockResolvedValue([]);

      startPublisher();
      stopPublisher();

      // Reset call count after stopping
      mockGetScheduledPostsDue.mockClear();

      // Advance time - should not call anymore
      jest.advanceTimersByTime(120000);
      await Promise.resolve();

      expect(mockGetScheduledPostsDue).not.toHaveBeenCalled();
    });

    it('should allow restart after stop', async () => {
      mockGetScheduledPostsDue.mockResolvedValue([]);

      startPublisher();
      stopPublisher();
      mockGetScheduledPostsDue.mockClear();

      startPublisher();

      expect(mockGetScheduledPostsDue).toHaveBeenCalledTimes(1);
    });
  });
});
