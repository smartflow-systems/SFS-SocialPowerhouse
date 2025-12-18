import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Loader2,
  Calendar,
  Target,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

type AnalyticsData = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  platformDistribution: Record<string, number>;
  recentActivity: Record<string, number>;
  aiGeneratedPosts: number;
  completionRate: number;
  postsLast30Days: number;
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
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  const analytics = data || {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    platformDistribution: {},
    recentActivity: {},
    aiGeneratedPosts: 0,
    completionRate: 0,
    postsLast30Days: 0,
  };

  const platformMetrics = Object.entries(analytics.platformDistribution)
    .map(([platform, posts]) => ({ platform, posts }))
    .sort((a, b) => b.posts - a.posts);

  const aiPercentage = analytics.totalPosts > 0 
    ? Math.round((analytics.aiGeneratedPosts / analytics.totalPosts) * 100)
    : 0;

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-sfs-gold" data-testid="heading-analytics">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your content performance and insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card p-6" data-testid="card-total-posts">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Posts</p>
                <h3 className="text-3xl font-bold mt-2">{analytics.totalPosts}</h3>
                <p className="text-sm text-primary mt-2">
                  Last 30 days: {analytics.postsLast30Days}
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-6" data-testid="card-published">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Published</p>
                <h3 className="text-3xl font-bold mt-2">{analytics.publishedPosts}</h3>
                <p className="text-sm text-primary mt-2">
                  {analytics.completionRate}% completion rate
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-6" data-testid="card-drafts-scheduled">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                <h3 className="text-3xl font-bold mt-2">{analytics.draftPosts + analytics.scheduledPosts}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {analytics.draftPosts} drafts, {analytics.scheduledPosts} scheduled
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-6" data-testid="card-ai-generated">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">AI Generated</p>
                <h3 className="text-3xl font-bold mt-2">{aiPercentage}%</h3>
                <p className="text-sm text-primary mt-2">
                  {analytics.aiGeneratedPosts} of {analytics.totalPosts} posts
                </p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Platform Distribution */}
        <Card className="glass-card p-6" data-testid="card-platform-distribution">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Distribution
          </h2>

          {platformMetrics.length > 0 ? (
            <div className="space-y-3">
              {platformMetrics.map((platform) => (
                <div key={platform.platform} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLATFORM_ICONS[platform.platform] || '📱'}</span>
                      <div>
                        <h3 className="font-semibold capitalize">{platform.platform}</h3>
                        <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{platform.posts}</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.totalPosts > 0 
                          ? `${Math.round((platform.posts / analytics.totalPosts) * 100)}%` 
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No posts yet</p>
              <p className="text-sm mt-2">Create some posts to see platform distribution</p>
            </div>
          )}
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Most popular platform</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {platformMetrics[0]?.platform ?
                        `${platformMetrics[0].platform} has ${platformMetrics[0].posts} posts` :
                        'No platforms used yet'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">AI Content Usage</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {aiPercentage}% of your posts are AI-generated
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Completion Rate</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.completionRate}% of your posts are published
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <div className="space-y-3">
              {analytics.draftPosts > 0 && (
                <div className="p-3 rounded-lg border border-border">
                  <p className="font-medium text-sm">Complete your drafts</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You have {analytics.draftPosts} drafts waiting to be published
                  </p>
                </div>
              )}

              {platformMetrics.length > 0 && (
                <div className="p-3 rounded-lg border border-border">
                  <p className="font-medium text-sm">Focus on {platformMetrics[0]?.platform}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your most-used platform - keep the momentum going
                  </p>
                </div>
              )}

              {analytics.postsLast30Days < 10 && (
                <div className="p-3 rounded-lg border border-border">
                  <p className="font-medium text-sm">Increase posting frequency</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posting 3-5 times per week can increase reach by up to 40%
                  </p>
                </div>
              )}

              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium text-sm">Leverage AI generation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-generated posts maintain consistent quality and save time
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
