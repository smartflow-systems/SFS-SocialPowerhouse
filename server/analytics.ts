/**
 * Analytics engine for social media performance tracking
 * Calculates engagement metrics, trends, and insights
 */

import { storage } from './storage';
import type { Post, SocialAccount } from '@shared/schema';

export interface EngagementMetrics {
  totalPosts: number;
  totalEngagement: number;
  totalFollowers: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  growthRate: number;
}

export interface PlatformBreakdown {
  platform: string;
  posts: number;
  engagement: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TopPost {
  id: string;
  content: string;
  platform: string;
  publishedAt: Date;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface BestTimeSlot {
  day: string;
  hour: number;
  engagement: number;
  postCount: number;
}

export interface AnalyticsDashboard {
  metrics: EngagementMetrics;
  platformBreakdown: PlatformBreakdown[];
  topPosts: TopPost[];
  bestTimes: BestTimeSlot[];
  recentActivity: ActivityItem[];
  trends: TrendData;
}

export interface ActivityItem {
  action: string;
  platform?: string;
  time: Date;
  status: 'success' | 'failed' | 'pending';
}

export interface TrendData {
  postsThisWeek: number;
  postsLastWeek: number;
  engagementThisWeek: number;
  engagementLastWeek: number;
  followersThisWeek: number;
  followersLastWeek: number;
}

/**
 * Get comprehensive analytics dashboard for a user
 */
export async function getUserAnalytics(userId: string, days: number = 30): Promise<AnalyticsDashboard> {
  // Get user's posts from last X days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const posts = await storage.getUserPosts(userId, {
    startDate,
    status: 'published'
  });

  const socialAccounts = await storage.getUserSocialAccounts(userId);

  // Calculate metrics
  const metrics = calculateMetrics(posts, socialAccounts);
  const platformBreakdown = calculatePlatformBreakdown(posts);
  const topPosts = getTopPosts(posts, 10);
  const bestTimes = analyzeBestTimes(posts);
  const recentActivity = await getRecentActivity(userId, 10);
  const trends = calculateTrends(posts);

  return {
    metrics,
    platformBreakdown,
    topPosts,
    bestTimes,
    recentActivity,
    trends
  };
}

/**
 * Calculate overall engagement metrics
 */
function calculateMetrics(posts: Post[], accounts: SocialAccount[]): EngagementMetrics {
  // Mock data for now - will be replaced with real platform API data
  const totalPosts = posts.length;

  // Simulated engagement data (in production, fetch from platform APIs)
  const mockEngagementPerPost = {
    likes: Math.floor(Math.random() * 100) + 50,
    comments: Math.floor(Math.random() * 20) + 5,
    shares: Math.floor(Math.random() * 15) + 2
  };

  const totalLikes = totalPosts * mockEngagementPerPost.likes;
  const totalComments = totalPosts * mockEngagementPerPost.comments;
  const totalShares = totalPosts * mockEngagementPerPost.shares;
  const totalEngagement = totalLikes + totalComments + totalShares;

  // Calculate follower count from connected accounts
  const totalFollowers = accounts.reduce((sum, account) => {
    return sum + (account.profileData?.followersCount || 0);
  }, 0);

  const engagementRate = totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0;

  // Mock growth rate
  const growthRate = 15.2; // +15.2% (would be calculated from historical data)

  return {
    totalPosts,
    totalEngagement,
    totalFollowers,
    engagementRate: Number(engagementRate.toFixed(2)),
    averageLikes: Math.floor(totalLikes / Math.max(totalPosts, 1)),
    averageComments: Math.floor(totalComments / Math.max(totalPosts, 1)),
    averageShares: Math.floor(totalShares / Math.max(totalPosts, 1)),
    growthRate
  };
}

/**
 * Calculate platform-wise breakdown
 */
function calculatePlatformBreakdown(posts: Post[]): PlatformBreakdown[] {
  const platformStats: Record<string, { posts: number; engagement: number }> = {};

  posts.forEach(post => {
    post.platforms?.forEach((platform: string) => {
      if (!platformStats[platform]) {
        platformStats[platform] = { posts: 0, engagement: 0 };
      }
      platformStats[platform].posts++;

      // Mock engagement per platform (will be real data from APIs)
      platformStats[platform].engagement += Math.floor(Math.random() * 500) + 100;
    });
  });

  const totalEngagement = Object.values(platformStats).reduce((sum, stat) => sum + stat.engagement, 0);

  return Object.entries(platformStats).map(([platform, stats]) => ({
    platform,
    posts: stats.posts,
    engagement: stats.engagement,
    percentage: totalEngagement > 0 ? Number(((stats.engagement / totalEngagement) * 100).toFixed(1)) : 0,
    trend: Math.random() > 0.3 ? 'up' : 'stable' as 'up' | 'down' | 'stable'
  })).sort((a, b) => b.engagement - a.engagement);
}

/**
 * Get top performing posts
 */
function getTopPosts(posts: Post[], limit: number = 10): TopPost[] {
  return posts
    .filter(post => post.publishedAt)
    .slice(0, limit)
    .map(post => {
      // Mock engagement data
      const likes = Math.floor(Math.random() * 500) + 100;
      const comments = Math.floor(Math.random() * 50) + 10;
      const shares = Math.floor(Math.random() * 30) + 5;

      return {
        id: post.id,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        platform: post.platforms?.[0] || 'unknown',
        publishedAt: post.publishedAt!,
        engagement: likes + comments + shares,
        likes,
        comments,
        shares
      };
    })
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit);
}

/**
 * Analyze best posting times based on historical engagement
 */
function analyzeBestTimes(posts: Post[]): BestTimeSlot[] {
  const timeSlots: Record<string, { engagement: number; count: number }> = {};

  posts.forEach(post => {
    if (post.publishedAt) {
      const day = post.publishedAt.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = post.publishedAt.getHours();
      const key = `${day}-${hour}`;

      if (!timeSlots[key]) {
        timeSlots[key] = { engagement: 0, count: 0 };
      }

      // Mock engagement
      timeSlots[key].engagement += Math.floor(Math.random() * 200) + 50;
      timeSlots[key].count++;
    }
  });

  return Object.entries(timeSlots)
    .map(([key, data]) => {
      const [day, hourStr] = key.split('-');
      return {
        day,
        hour: parseInt(hourStr),
        engagement: Math.floor(data.engagement / data.count),
        postCount: data.count
      };
    })
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10);
}

/**
 * Get recent activity feed
 */
async function getRecentActivity(userId: string, limit: number = 10): Promise<ActivityItem[]> {
  const recentPosts = await storage.getUserPosts(userId);

  const activities: ActivityItem[] = recentPosts
    .slice(0, limit)
    .map(post => {
      const platform = post.platforms?.[0] || 'unknown';
      let action = '';
      let status: 'success' | 'failed' | 'pending' = 'pending';

      if (post.status === 'published') {
        action = `Published post on ${platform}`;
        status = 'success';
      } else if (post.status === 'scheduled') {
        action = `Scheduled post for ${platform}`;
        status = 'pending';
      } else if (post.status === 'failed') {
        action = `Failed to publish on ${platform}`;
        status = 'failed';
      } else {
        action = `Created draft for ${platform}`;
        status = 'pending';
      }

      return {
        action,
        platform,
        time: post.updatedAt || post.createdAt || new Date(),
        status
      };
    });

  return activities.slice(0, limit);
}

/**
 * Calculate week-over-week trends
 */
function calculateTrends(posts: Post[]): TrendData {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const postsThisWeek = posts.filter(p =>
    p.publishedAt && p.publishedAt >= thisWeekStart
  ).length;

  const postsLastWeek = posts.filter(p =>
    p.publishedAt && p.publishedAt >= lastWeekStart && p.publishedAt < lastWeekEnd
  ).length;

  // Mock engagement and follower data
  const engagementThisWeek = postsThisWeek * (Math.floor(Math.random() * 100) + 150);
  const engagementLastWeek = postsLastWeek * (Math.floor(Math.random() * 100) + 140);

  const followersThisWeek = 23500 + Math.floor(Math.random() * 500);
  const followersLastWeek = 22800 + Math.floor(Math.random() * 500);

  return {
    postsThisWeek,
    postsLastWeek,
    engagementThisWeek,
    engagementLastWeek,
    followersThisWeek,
    followersLastWeek
  };
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Get platform-specific insights
 */
export function getPlatformInsights(platform: string, posts: Post[]): {
  averageEngagement: number;
  bestPostingTime: string;
  topPerformingContent: string;
  recommendations: string[];
} {
  const platformPosts = posts.filter(p => p.platforms?.includes(platform));

  return {
    averageEngagement: Math.floor(Math.random() * 500) + 200,
    bestPostingTime: '2:00 PM - 4:00 PM',
    topPerformingContent: 'Visual content with hashtags',
    recommendations: [
      `Post ${platformPosts.length > 10 ? 'less' : 'more'} frequently on ${platform}`,
      'Use trending hashtags to increase reach',
      'Include visual content for higher engagement',
      'Post during peak hours for better visibility'
    ]
  };
}
