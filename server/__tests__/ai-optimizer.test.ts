import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  getBestTimesForPlatform,
  suggestNextBestTimes,
  optimizeContent,
  generateTrendingHashtags,
  analyzeSentiment
} from '../ai-optimizer';

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

describe('AI Optimizer Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockClear();
  });

  describe('getBestTimesForPlatform', () => {
    it('should return best times for Facebook', () => {
      const result = getBestTimesForPlatform('facebook');

      expect(result).toBeDefined();
      expect(result.weekdays).toBeDefined();
      expect(result.weekend).toBeDefined();
      expect(result.recommendation).toContain('facebook');
      expect(result.weekdays).toHaveLength(5);
      expect(result.weekend).toHaveLength(2);
    });

    it('should return best times for Instagram', () => {
      const result = getBestTimesForPlatform('instagram');

      expect(result.weekdays).toHaveLength(5);
      expect(result.weekdays[0].times).toContain('11:00');
      expect(result.weekdays[0].times).toContain('21:00');
    });

    it('should return best times for Twitter', () => {
      const result = getBestTimesForPlatform('twitter');

      expect(result.weekdays[0].times).toContain('08:00');
      expect(result.weekdays[0].times).toContain('17:00');
    });

    it('should return best times for LinkedIn', () => {
      const result = getBestTimesForPlatform('linkedin');

      expect(result.weekdays).toHaveLength(5);
      expect(result.weekend).toHaveLength(0); // LinkedIn is primarily weekdays
      expect(result.weekdays[0].times).toContain('07:00');
    });

    it('should return best times for TikTok', () => {
      const result = getBestTimesForPlatform('tiktok');

      expect(result.weekdays[0].times).toContain('06:00');
      expect(result.weekdays[0].times).toContain('22:00');
    });

    it('should return best times for YouTube', () => {
      const result = getBestTimesForPlatform('youtube');

      expect(result.weekdays[0].times).toContain('14:00');
      expect(result.weekend[0].times).toContain('09:00');
    });

    it('should return best times for Pinterest', () => {
      const result = getBestTimesForPlatform('pinterest');

      expect(result.weekdays[0].times).toContain('20:00');
      expect(result.weekdays[0].times).toContain('21:00');
    });

    it('should return empty times for unsupported platform', () => {
      const result = getBestTimesForPlatform('unsupported');

      expect(result.weekdays).toHaveLength(0);
      expect(result.weekend).toHaveLength(0);
      expect(result.recommendation).toContain('No specific timing data');
    });

    it('should include recommendation in response', () => {
      const result = getBestTimesForPlatform('facebook');

      expect(result.recommendation).toBeTruthy();
      expect(typeof result.recommendation).toBe('string');
    });
  });

  describe('suggestNextBestTimes', () => {
    it('should suggest 7 future posting times by default', () => {
      const suggestions = suggestNextBestTimes('facebook');

      expect(suggestions).toHaveLength(7);
      suggestions.forEach(suggestion => {
        expect(suggestion.date).toBeInstanceOf(Date);
        expect(suggestion.score).toBeGreaterThan(0);
        expect(suggestion.reason).toBeTruthy();
      });
    });

    it('should only suggest future times', () => {
      const now = new Date();
      const suggestions = suggestNextBestTimes('instagram', 5);

      suggestions.forEach(suggestion => {
        expect(suggestion.date.getTime()).toBeGreaterThan(now.getTime());
      });
    });

    it('should respect the count parameter', () => {
      const suggestions = suggestNextBestTimes('twitter', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should provide scores for each suggestion', () => {
      const suggestions = suggestNextBestTimes('facebook', 5);

      suggestions.forEach(suggestion => {
        expect(suggestion.score).toBeGreaterThanOrEqual(0);
        expect(suggestion.score).toBeLessThanOrEqual(10);
      });
    });

    it('should provide reasons for each suggestion', () => {
      const suggestions = suggestNextBestTimes('linkedin', 5);

      suggestions.forEach(suggestion => {
        expect(suggestion.reason).toContain('linkedin');
        expect(suggestion.reason).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
      });
    });

    it('should handle LinkedIn weekday-only schedule', () => {
      const suggestions = suggestNextBestTimes('linkedin', 10);

      // All suggestions should be on weekdays
      suggestions.forEach(suggestion => {
        const dayName = suggestion.date.toLocaleDateString('en-US', { weekday: 'long' });
        expect(['Saturday', 'Sunday']).not.toContain(dayName);
      });
    });

    it('should assign slightly lower scores for weekend posts', () => {
      const suggestions = suggestNextBestTimes('facebook', 20);

      const weekendSuggestions = suggestions.filter(s => {
        const day = s.date.toLocaleDateString('en-US', { weekday: 'long' });
        return day === 'Saturday' || day === 'Sunday';
      });

      const weekdaySuggestions = suggestions.filter(s => {
        const day = s.date.toLocaleDateString('en-US', { weekday: 'long' });
        return day !== 'Saturday' && day !== 'Sunday';
      });

      if (weekendSuggestions.length > 0 && weekdaySuggestions.length > 0) {
        const avgWeekend = weekendSuggestions.reduce((sum, s) => sum + s.score, 0) / weekendSuggestions.length;
        const avgWeekday = weekdaySuggestions.reduce((sum, s) => sum + s.score, 0) / weekdaySuggestions.length;

        expect(avgWeekend).toBeLessThanOrEqual(avgWeekday);
      }
    });
  });

  describe('optimizeContent', () => {
    it('should optimize content using AI when available', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              optimized: 'Optimized content with better engagement!',
              hashtags: ['marketing', 'socialmedia', 'business'],
              engagementScore: 8,
              suggestions: ['Added call-to-action', 'Improved clarity'],
              sentiment: 'positive'
            })
          }
        }]
      });

      const result = await optimizeContent('Basic content', 'instagram', 'professional');

      expect(result.optimized).toBe('Optimized content with better engagement!');
      expect(result.hashtags).toContain('marketing');
      expect(result.engagementScore).toBe(8);
      expect(result.suggestions).toHaveLength(2);
      expect(result.sentiment).toBe('positive');
    });

    it('should include platform-specific optimization', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              optimized: 'LinkedIn professional content',
              hashtags: ['business', 'professional'],
              engagementScore: 7,
              suggestions: ['Professional tone added'],
              sentiment: 'neutral'
            })
          }
        }]
      });

      const result = await optimizeContent('Test content', 'linkedin');

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should fallback when AI fails', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const result = await optimizeContent('Fallback test #hashtag', 'facebook');

      expect(result.optimized).toBe('Fallback test #hashtag');
      expect(result.hashtags).toContain('hashtag');
      expect(result.engagementScore).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.sentiment).toBe('neutral');
    });

    it('should handle empty AI response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }]
      });

      const result = await optimizeContent('Test', 'twitter');

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('neutral');
    });

    it('should handle invalid JSON from AI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'invalid json' } }]
      });

      const result = await optimizeContent('Test', 'instagram');

      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(3);
    });

    it('should extract hashtags in fallback mode', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Fail'));

      const result = await optimizeContent('Content with #test #demo', 'instagram');

      expect(result.hashtags).toContain('test');
      expect(result.hashtags).toContain('demo');
    });

    it('should calculate engagement score in fallback mode', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Fail'));

      const result = await optimizeContent('Great post! Click here #trending', 'twitter');

      // Should have higher score due to CTA, hashtag, and question mark
      expect(result.engagementScore).toBeGreaterThanOrEqual(5);
    });
  });

  describe('generateTrendingHashtags', () => {
    it('should generate hashtags using AI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(['fitness', 'health', 'workout', 'gym', 'wellness'])
          }
        }]
      });

      const hashtags = await generateTrendingHashtags('fitness tips', 'instagram', 5);

      expect(Array.isArray(hashtags)).toBe(true);
      expect(hashtags.length).toBeGreaterThan(0);
      expect(hashtags).toContain('fitness');
    });

    it('should handle AI failure and fallback', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const hashtags = await generateTrendingHashtags('marketing', 'linkedin');

      expect(Array.isArray(hashtags)).toBe(true);
      expect(hashtags.length).toBeGreaterThan(0);
    });

    it('should respect count parameter', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(['tag1', 'tag2', 'tag3'])
          }
        }]
      });

      const hashtags = await generateTrendingHashtags('topic', 'twitter', 3);

      expect(hashtags.length).toBeLessThanOrEqual(10);
    });

    it('should handle non-array AI response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({ notAnArray: true })
          }
        }]
      });

      const hashtags = await generateTrendingHashtags('test', 'facebook');

      expect(Array.isArray(hashtags)).toBe(true);
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze positive sentiment', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              sentiment: 'positive',
              confidence: 0.9
            })
          }
        }]
      });

      const result = await analyzeSentiment('I love this amazing product!');

      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBe(0.9);
    });

    it('should analyze negative sentiment', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              sentiment: 'negative',
              confidence: 0.85
            })
          }
        }]
      });

      const result = await analyzeSentiment('Terrible experience, very disappointed');

      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should analyze neutral sentiment', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              sentiment: 'neutral',
              confidence: 0.6
            })
          }
        }]
      });

      const result = await analyzeSentiment('The product is available now');

      expect(result.sentiment).toBe('neutral');
    });

    it('should fallback to neutral on error', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const result = await analyzeSentiment('Some content');

      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBe(0.5);
    });

    it('should handle invalid JSON response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'not valid json'
          }
        }]
      });

      const result = await analyzeSentiment('Test');

      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBe(0.5);
    });
  });

  describe('Fallback Optimization Logic', () => {
    it('should score Twitter content with optimal length higher', async () => {
      mockCreate.mockRejectedValue(new Error('Fail'));

      const shortTweet = 'Check this out! #trending';
      const result = await optimizeContent(shortTweet, 'twitter');

      expect(result.engagementScore).toBeGreaterThanOrEqual(6);
    });

    it('should score content with call-to-action higher', async () => {
      mockCreate.mockRejectedValue(new Error('Fail'));

      const withCTA = 'Click the link to learn more #business';
      const result = await optimizeContent(withCTA, 'facebook');

      expect(result.engagementScore).toBeGreaterThanOrEqual(6);
    });

    it('should detect and score questions', async () => {
      mockCreate.mockRejectedValue(new Error('Fail'));

      const withQuestion = 'What do you think about this? #poll';
      const result = await optimizeContent(withQuestion, 'twitter');

      expect(result.engagementScore).toBeGreaterThanOrEqual(5);
    });

    it('should suggest platform-appropriate hashtags', async () => {
      mockCreate.mockRejectedValue(new Error('Fail'));

      const instagramResult = await optimizeContent('Photo time', 'instagram');
      const linkedinResult = await optimizeContent('Career tips', 'linkedin');

      expect(instagramResult.hashtags).toContain('instagood');
      expect(linkedinResult.hashtags).toContain('business');
    });

    it('should cap engagement score at 10', async () => {
      mockCreate.mockRejectedValue(new Error('Fail'));

      // Content with many positive signals
      const content = 'Check this amazing post! Click here to share and comment #trending #viral';
      const result = await optimizeContent(content, 'instagram');

      expect(result.engagementScore).toBeLessThanOrEqual(10);
    });
  });
});
