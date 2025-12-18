/**
 * AI-Powered Smart Scheduling & Content Optimization
 * Analyzes engagement patterns and optimizes content for maximum reach
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

/**
 * Platform-specific optimal posting times based on industry research
 * These are baseline recommendations that can be refined with user-specific data
 */
const PLATFORM_BEST_TIMES = {
  facebook: {
    weekdays: [
      { day: 'Monday', times: ['13:00', '15:00', '19:00'] },
      { day: 'Tuesday', times: ['13:00', '15:00', '19:00'] },
      { day: 'Wednesday', times: ['13:00', '15:00', '19:00'] },
      { day: 'Thursday', times: ['13:00', '15:00', '19:00'] },
      { day: 'Friday', times: ['13:00', '15:00', '19:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['11:00', '14:00', '17:00'] },
      { day: 'Sunday', times: ['11:00', '14:00', '17:00'] },
    ]
  },
  instagram: {
    weekdays: [
      { day: 'Monday', times: ['11:00', '14:00', '19:00', '21:00'] },
      { day: 'Tuesday', times: ['11:00', '14:00', '19:00', '21:00'] },
      { day: 'Wednesday', times: ['11:00', '14:00', '19:00', '21:00'] },
      { day: 'Thursday', times: ['11:00', '14:00', '19:00', '21:00'] },
      { day: 'Friday', times: ['11:00', '14:00', '19:00', '21:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['11:00', '16:00', '20:00'] },
      { day: 'Sunday', times: ['11:00', '16:00', '20:00'] },
    ]
  },
  twitter: {
    weekdays: [
      { day: 'Monday', times: ['08:00', '12:00', '17:00'] },
      { day: 'Tuesday', times: ['08:00', '12:00', '17:00'] },
      { day: 'Wednesday', times: ['08:00', '12:00', '17:00'] },
      { day: 'Thursday', times: ['08:00', '12:00', '17:00'] },
      { day: 'Friday', times: ['08:00', '12:00', '17:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['09:00', '13:00', '18:00'] },
      { day: 'Sunday', times: ['09:00', '13:00', '18:00'] },
    ]
  },
  linkedin: {
    weekdays: [
      { day: 'Monday', times: ['07:00', '12:00', '17:00'] },
      { day: 'Tuesday', times: ['07:00', '12:00', '17:00'] },
      { day: 'Wednesday', times: ['07:00', '12:00', '17:00'] },
      { day: 'Thursday', times: ['07:00', '12:00', '17:00'] },
      { day: 'Friday', times: ['07:00', '12:00', '17:00'] },
    ],
    weekend: [] // LinkedIn is primarily weekdays
  },
  tiktok: {
    weekdays: [
      { day: 'Monday', times: ['06:00', '10:00', '19:00', '22:00'] },
      { day: 'Tuesday', times: ['06:00', '10:00', '19:00', '22:00'] },
      { day: 'Wednesday', times: ['06:00', '10:00', '19:00', '22:00'] },
      { day: 'Thursday', times: ['06:00', '10:00', '19:00', '22:00'] },
      { day: 'Friday', times: ['06:00', '10:00', '19:00', '22:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['09:00', '14:00', '20:00'] },
      { day: 'Sunday', times: ['09:00', '14:00', '20:00'] },
    ]
  },
  youtube: {
    weekdays: [
      { day: 'Monday', times: ['14:00', '17:00', '20:00'] },
      { day: 'Tuesday', times: ['14:00', '17:00', '20:00'] },
      { day: 'Wednesday', times: ['14:00', '17:00', '20:00'] },
      { day: 'Thursday', times: ['14:00', '17:00', '20:00'] },
      { day: 'Friday', times: ['14:00', '17:00', '20:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['09:00', '14:00', '19:00'] },
      { day: 'Sunday', times: ['09:00', '14:00', '19:00'] },
    ]
  },
  pinterest: {
    weekdays: [
      { day: 'Monday', times: ['20:00', '21:00'] },
      { day: 'Tuesday', times: ['20:00', '21:00'] },
      { day: 'Wednesday', times: ['20:00', '21:00'] },
      { day: 'Thursday', times: ['20:00', '21:00'] },
      { day: 'Friday', times: ['20:00', '21:00'] },
    ],
    weekend: [
      { day: 'Saturday', times: ['08:00', '11:00', '20:00'] },
      { day: 'Sunday', times: ['08:00', '11:00', '20:00'] },
    ]
  }
};

/**
 * Get optimal posting times for a platform
 */
export function getBestTimesForPlatform(platform: string): any {
  const platformTimes = PLATFORM_BEST_TIMES[platform as keyof typeof PLATFORM_BEST_TIMES];
  if (!platformTimes) {
    return {
      weekdays: [],
      weekend: [],
      recommendation: 'No specific timing data available for this platform'
    };
  }

  return {
    ...platformTimes,
    recommendation: `Best times to post on ${platform}: Weekdays ${platformTimes.weekdays[0]?.times[0]} - ${platformTimes.weekdays[0]?.times[platformTimes.weekdays[0]?.times.length - 1]}`
  };
}

/**
 * Suggest best time slots for next 7 days
 */
export function suggestNextBestTimes(platform: string, count: number = 7): Array<{ date: Date; score: number; reason: string }> {
  const bestTimes = getBestTimesForPlatform(platform);
  const suggestions: Array<{ date: Date; score: number; reason: string }> = [];

  const now = new Date();

  // Generate suggestions for next 7 days
  for (let dayOffset = 0; dayOffset < 7 && suggestions.length < count; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

    const timesForDay = isWeekend ? bestTimes.weekend : bestTimes.weekdays;
    const dayData = timesForDay.find((d: any) => d.day === dayName);

    if (dayData && dayData.times) {
      dayData.times.forEach((time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const suggestedTime = new Date(targetDate);
        suggestedTime.setHours(hours, minutes, 0, 0);

        // Only suggest future times
        if (suggestedTime > now && suggestions.length < count) {
          suggestions.push({
            date: suggestedTime,
            score: isWeekend ? 7.5 : 8.5, // Weekend slightly lower engagement for most platforms
            reason: `Peak engagement time for ${platform} on ${dayName}s`
          });
        }
      });
    }
  }

  return suggestions.slice(0, count);
}

/**
 * AI Content Optimizer - Analyzes content and provides optimization suggestions
 */
export async function optimizeContent(content: string, platform: string, tone?: string): Promise<{
  optimized: string;
  hashtags: string[];
  engagementScore: number;
  suggestions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}> {
  try {
    const prompt = `You are an expert social media content optimizer. Analyze and optimize this content for ${platform}.

Content: "${content}"
Desired tone: ${tone || 'professional'}

Provide a JSON response with:
1. optimized: Improved version of the content (keep it similar but enhance with platform-specific best practices)
2. hashtags: Array of 5-10 relevant trending hashtags for ${platform} (without # prefix)
3. engagementScore: Predicted engagement score from 1-10
4. suggestions: Array of 3-5 specific improvements made
5. sentiment: Overall sentiment (positive/neutral/negative)

Platform-specific guidelines:
- Instagram: Use emojis, keep it visual, storytelling
- LinkedIn: Professional, industry insights, thought leadership
- Twitter: Concise, trending topics, call-to-action
- Facebook: Conversational, questions to drive engagement
- TikTok: Trendy, energetic, challenge-oriented
- YouTube: Value proposition, curiosity gap
- Pinterest: Descriptive, benefit-focused

Return ONLY valid JSON, no other text.`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const result = JSON.parse(response);

    return {
      optimized: result.optimized || content,
      hashtags: result.hashtags || [],
      engagementScore: result.engagementScore || 5,
      suggestions: result.suggestions || [],
      sentiment: result.sentiment || 'neutral'
    };
  } catch (error: any) {
    console.error('AI Content Optimization error:', error);

    // Fallback to rule-based optimization
    return fallbackOptimization(content, platform, tone);
  }
}

/**
 * Fallback optimization when AI fails
 */
function fallbackOptimization(content: string, platform: string, tone?: string) {
  const hashtags = extractHashtagsFromContent(content, platform);
  const score = calculateBasicEngagementScore(content, platform);

  return {
    optimized: content,
    hashtags,
    engagementScore: score,
    suggestions: [
      'Consider adding relevant hashtags',
      'Include a call-to-action',
      'Keep content concise and engaging'
    ],
    sentiment: 'neutral' as const
  };
}

/**
 * Extract or suggest hashtags based on content
 */
function extractHashtagsFromContent(content: string, platform: string): string[] {
  // Extract existing hashtags
  const existingHashtags = content.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];

  // Platform-specific popular hashtags
  const platformHashtags: Record<string, string[]> = {
    instagram: ['instagood', 'photooftheday', 'love', 'beautiful', 'happy'],
    twitter: ['trending', 'news', 'viral', 'breaking', 'follow'],
    linkedin: ['business', 'career', 'professional', 'leadership', 'innovation'],
    facebook: ['community', 'family', 'friends', 'life', 'love'],
    tiktok: ['fyp', 'foryou', 'viral', 'trending', 'challenge'],
    youtube: ['subscribe', 'like', 'comment', 'tutorial', 'howto'],
    pinterest: ['diy', 'inspiration', 'ideas', 'creative', 'design']
  };

  const suggested = platformHashtags[platform] || [];

  // Combine and deduplicate
  return [...new Set([...existingHashtags, ...suggested.slice(0, 5)])].slice(0, 10);
}

/**
 * Calculate basic engagement score
 */
function calculateBasicEngagementScore(content: string, platform: string): number {
  let score = 5; // Base score

  // Length optimization
  const length = content.length;
  if (platform === 'twitter' && length <= 280) score += 1;
  if (platform === 'instagram' && length >= 100 && length <= 2200) score += 1;
  if (platform === 'linkedin' && length >= 150 && length <= 1300) score += 1;

  // Has call-to-action
  const ctaWords = ['click', 'link', 'check', 'comment', 'share', 'follow', 'like', 'subscribe'];
  if (ctaWords.some(word => content.toLowerCase().includes(word))) score += 1;

  // Has hashtags
  if (content.includes('#')) score += 1;

  // Has emojis (good for Instagram, TikTok)
  if (/[\u{1F600}-\u{1F64F}]/u.test(content) && (platform === 'instagram' || platform === 'tiktok')) {
    score += 1;
  }

  // Has question (drives engagement)
  if (content.includes('?')) score += 0.5;

  return Math.min(score, 10);
}

/**
 * Generate trending hashtags for a topic
 */
export async function generateTrendingHashtags(topic: string, platform: string, count: number = 10): Promise<string[]> {
  try {
    const prompt = `Generate ${count} trending, relevant hashtags for this topic on ${platform}: "${topic}"

Requirements:
- Return only hashtag words (without # symbol)
- Mix popular and niche hashtags
- Make them platform-appropriate
- Return as JSON array

Example format: ["hashtag1", "hashtag2", "hashtag3"]`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 150
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const hashtags = JSON.parse(response);
      return Array.isArray(hashtags) ? hashtags : [];
    }
  } catch (error) {
    console.error('Hashtag generation error:', error);
  }

  // Fallback
  return extractHashtagsFromContent(topic, platform);
}

/**
 * Analyze content sentiment
 */
export async function analyzeSentiment(content: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}> {
  try {
    const prompt = `Analyze the sentiment of this social media content. Return JSON only:

Content: "${content}"

Format: { "sentiment": "positive|neutral|negative", "confidence": 0.0-1.0 }`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 50
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return JSON.parse(response);
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
  }

  return { sentiment: 'neutral', confidence: 0.5 };
}
