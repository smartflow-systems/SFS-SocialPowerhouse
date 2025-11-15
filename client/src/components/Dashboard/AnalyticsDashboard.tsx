import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsDashboard() {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/dashboard?days=30', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card p-6 animate-pulse">
              <div className="h-20 bg-sf-brown/20 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { metrics, platformBreakdown, topPosts, bestTimes, trends } = analytics || {};

  const calculateTrendPercentage = (current: number, previous: number) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const engagementTrend = calculateTrendPercentage(
    trends?.engagementThisWeek || 0,
    trends?.engagementLastWeek || 0
  );

  const postsTrend = calculateTrendPercentage(
    trends?.postsThisWeek || 0,
    trends?.postsLastWeek || 0
  );

  const followersTrend = calculateTrendPercentage(
    trends?.followersThisWeek || 0,
    trends?.followersLastWeek || 0
  );

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts */}
        <Card className="glass-card p-6 hover-elevate stagger-1 fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Posts
              </p>
              <h3 className="text-3xl font-bold text-gold-gradient mt-2">
                {metrics?.totalPosts?.toLocaleString() || 0}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {Number(postsTrend) >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">
                      +{postsTrend}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">
                      {postsTrend}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-1">vs last week</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Engagement */}
        <Card className="glass-card p-6 hover-elevate stagger-2 fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Total Engagement
              </p>
              <h3 className="text-3xl font-bold text-gold-gradient mt-2">
                {(metrics?.totalEngagement || 0) > 1000
                  ? `${((metrics?.totalEngagement || 0) / 1000).toFixed(1)}K`
                  : metrics?.totalEngagement?.toLocaleString() || 0}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {Number(engagementTrend) >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">
                      +{engagementTrend}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">
                      {engagementTrend}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-1">vs last week</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Followers */}
        <Card className="glass-card p-6 hover-elevate stagger-3 fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Followers
              </p>
              <h3 className="text-3xl font-bold text-gold-gradient mt-2">
                {(metrics?.totalFollowers || 0) > 1000
                  ? `${((metrics?.totalFollowers || 0) / 1000).toFixed(1)}K`
                  : metrics?.totalFollowers?.toLocaleString() || 0}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {Number(followersTrend) >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">
                      +{followersTrend}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">
                      {followersTrend}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-1">vs last week</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Engagement Rate */}
        <Card className="glass-card p-6 hover-elevate stagger-4 fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Engagement Rate
              </p>
              <h3 className="text-3xl font-bold text-gold-gradient mt-2">
                {metrics?.engagementRate?.toFixed(1) || 0}%
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                Industry average: 3.5%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Breakdown & Best Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <Card className="sfs-glass-card stagger-5 fade-in-up">
          <h2 className="text-xl font-semibold mb-4 text-sfs-gold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Platform Performance
          </h2>
          <div className="space-y-4">
            {platformBreakdown?.map((platform: any, idx: number) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize flex items-center gap-2">
                    {getPlatformIcon(platform.platform)}
                    {platform.platform}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-sfs-gold font-bold">
                      {platform.percentage}%
                    </span>
                    {platform.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-sf-brown/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sf-gold to-sf-gold-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.percentage}%`,
                      animation: `slideIn 0.8s ease-out ${idx * 0.1}s both`
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{platform.posts} posts</span>
                  <span>•</span>
                  <span>{platform.engagement.toLocaleString()} interactions</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Best Posting Times */}
        <Card className="sfs-glass-card stagger-6 fade-in-up">
          <h2 className="text-xl font-semibold mb-4 text-sfs-gold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Best Times to Post
          </h2>
          <div className="space-y-3">
            {bestTimes?.slice(0, 5).map((timeSlot: any, idx: number) => (
              <div
                key={`${timeSlot.day}-${timeSlot.hour}`}
                className="flex items-center justify-between p-3 rounded-lg bg-sf-brown/20 border border-sf-gold/10 hover:border-sf-gold/30 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sf-white">
                    {timeSlot.day}, {formatHour(timeSlot.hour)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeSlot.postCount} posts • Avg engagement: {timeSlot.engagement}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1.5 h-6 mx-0.5 rounded-full',
                          i < Math.ceil((timeSlot.engagement / 200) * 5)
                            ? 'bg-sf-gold'
                            : 'bg-sf-brown/40'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card className="sfs-flow-card">
        <h2 className="text-xl font-semibold mb-4 text-sfs-gold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Performing Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPosts?.slice(0, 6).map((post: any) => (
            <div
              key={post.id}
              className="glass-card p-4 space-y-3 hover-elevate"
            >
              <div className="flex items-start justify-between">
                <span className="badge">{post.platform}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  <span>{post.shares}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-sf-gold/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Engagement</span>
                  <span className="text-sm font-bold text-sfs-gold">
                    {post.engagement.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function getPlatformIcon(platform: string) {
  const icons: Record<string, string> = {
    facebook: '📘',
    instagram: '📸',
    twitter: '🐦',
    linkedin: '💼',
    tiktok: '🎵',
    youtube: '📺',
    pinterest: '📌'
  };
  return icons[platform] || '📱';
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}
