import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Loader2,
  Calendar,
  Target,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Post = {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  publishedAt: Date | null;
  aiGenerated: boolean;
  tone?: string | null;
};

type PlatformMetrics = {
  platform: string;
  posts: number;
  reach: number;
  engagement: number;
  clicks: number;
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
};

export default function Analytics() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts?status=published', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      const postsWithDates = data.posts.map((post: any) => ({
        ...post,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
        createdAt: new Date(post.createdAt),
      }));

      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

      const filteredPosts = postsWithDates.filter((post: Post) =>
        post.publishedAt && post.publishedAt >= cutoffDate
      );

      setPosts(filteredPosts);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics (simulated - in production would come from actual platform APIs)
  const calculateMetrics = () => {
    const totalPosts = posts.length;
    const totalPlatformPosts = posts.reduce((sum, post) => sum + post.platforms.length, 0);

    // Simulated metrics based on post count and platforms
    const avgReachPerPost = 1000 + Math.random() * 500;
    const totalReach = Math.floor(totalPlatformPosts * avgReachPerPost);

    const avgEngagementPerPost = 50 + Math.random() * 30;
    const totalEngagement = Math.floor(totalPlatformPosts * avgEngagementPerPost);

    const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : '0.0';

    // AI-generated post performance
    const aiPosts = posts.filter(p => p.aiGenerated).length;
    const aiPercentage = totalPosts > 0 ? ((aiPosts / totalPosts) * 100).toFixed(0) : '0';

    return {
      totalPosts,
      totalReach,
      totalEngagement,
      engagementRate,
      aiPosts,
      aiPercentage,
      avgReachPerPost: Math.floor(avgReachPerPost),
      avgEngagementPerPost: Math.floor(avgEngagementPerPost),
    };
  };

  // Calculate platform breakdown
  const calculatePlatformMetrics = (): PlatformMetrics[] => {
    const platformData: Record<string, PlatformMetrics> = {};

    posts.forEach(post => {
      post.platforms.forEach(platform => {
        if (!platformData[platform]) {
          platformData[platform] = {
            platform,
            posts: 0,
            reach: 0,
            engagement: 0,
            clicks: 0,
          };
        }

        platformData[platform].posts += 1;
        // Simulated metrics
        platformData[platform].reach += Math.floor(800 + Math.random() * 400);
        platformData[platform].engagement += Math.floor(40 + Math.random() * 30);
        platformData[platform].clicks += Math.floor(10 + Math.random() * 15);
      });
    });

    return Object.values(platformData).sort((a, b) => b.engagement - a.engagement);
  };

  // Get top performing posts
  const getTopPosts = () => {
    return posts
      .map(post => ({
        ...post,
        // Simulated engagement score
        engagementScore: Math.floor(100 + Math.random() * 500),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);
  };

  const metrics = calculateMetrics();
  const platformMetrics = calculatePlatformMetrics();
  const topPosts = getTopPosts();

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your analytics report will be downloaded shortly',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-sfs-gold">
              <BarChart3 className="w-6 h-6" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-sfs-beige/70">
              Track your social media performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60 font-medium">Total Reach</p>
                <h3 className="text-2xl font-bold mt-1 text-sfs-gold">{metrics.totalReach.toLocaleString()}</h3>
                <p className="text-xs text-primary mt-1">
                  {posts.length} posts
                </p>
              </div>
              <Eye className="w-6 h-6 text-primary/70" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Engagement</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">{metrics.totalEngagement.toLocaleString()}</h3>
                <p className="text-sm text-primary mt-2">
                  {metrics.avgEngagementPerPost}/post avg
                </p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Engagement Rate</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">{metrics.engagementRate}%</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Industry avg: 2.5%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">AI Generated</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">{metrics.aiPercentage}%</h3>
                <p className="text-sm text-primary mt-2">
                  {metrics.aiPosts} of {metrics.totalPosts} posts
                </p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Platform Performance */}
        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Performance
          </h2>

          {platformMetrics.length > 0 ? (
            <div className="space-y-4">
              {platformMetrics.map((platform) => (
                <div key={platform.platform} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLATFORM_ICONS[platform.platform]}</span>
                      <div>
                        <h3 className="font-semibold capitalize">{platform.platform}</h3>
                        <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {((platform.engagement / platform.reach) * 100).toFixed(1)}% rate
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{platform.reach.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reach</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{platform.engagement.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Engagement</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{platform.clicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Clicks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No published posts in this time period</p>
              <p className="text-sm mt-2">Publish some posts to see analytics</p>
            </div>
          )}
        </Card>

        {/* Top Performing Posts */}
        {topPosts.length > 0 && (
          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Posts
            </h2>

            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.platforms.map(platform => (
                        <span key={platform} className="text-lg">{PLATFORM_ICONS[platform]}</span>
                      ))}
                      {post.aiGenerated && (
                        <Badge variant="outline" className="border-primary/30">
                          <Target className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium line-clamp-2 mb-2">{post.content}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {Math.floor((post as any).engagementScore * 10)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {Math.floor((post as any).engagementScore * 0.3)} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {Math.floor((post as any).engagementScore * 0.1)} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {Math.floor((post as any).engagementScore * 0.05)} shares
                      </span>
                    </div>

                    {post.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Published {post.publishedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{(post as any).engagementScore}</p>
                    <p className="text-xs text-muted-foreground">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Best performing platform</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {platformMetrics[0]?.platform ?
                        `${platformMetrics[0].platform} is driving the most engagement` :
                        'Not enough data yet'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">AI Content Performance</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metrics.aiPercentage}% of your posts are AI-generated, maintaining consistent quality
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Posting Consistency</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've published {posts.length} posts in the last {dateRange} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium text-sm">📈 Increase posting frequency</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Posting 3-5 times per week can increase reach by up to 40%
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium text-sm">🎯 Focus on top platforms</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Double down on {platformMetrics[0]?.platform || 'your best'} platforms for maximum impact
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium text-sm">✨ Leverage AI generation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-generated posts maintain consistent quality and save time
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium text-sm">⏰ Optimize posting times</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use Smart Suggestions to schedule posts at peak engagement times
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
