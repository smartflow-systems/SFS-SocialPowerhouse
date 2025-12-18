import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AnalyticsDashboard from '@/components/Dashboard/AnalyticsDashboard';
import OnboardingChecklist from '@/components/Dashboard/OnboardingChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Link2, 
  PenSquare, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(true);

  const { data: postsData } = useQuery<{ posts: any[] }>({
    queryKey: ['/api/posts'],
  });

  const { data: accountsData } = useQuery<{ accounts: any[] }>({
    queryKey: ['/api/social-accounts'],
  });

  const posts = postsData?.posts || [];
  const accounts = accountsData?.accounts || [];
  
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const draftPosts = posts.filter(p => p.status === 'draft').length;

  const recentPosts = posts.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sfs-gold mb-2" data-testid="heading-dashboard">
              Welcome to SFS Social Powerhouse
            </h1>
            <p className="text-muted-foreground">
              AI-powered insights for your social media success
            </p>
          </div>
          <Button
            onClick={() => navigate('/posts/create')}
            className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
            data-testid="button-create-post"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {showOnboarding && (
          <OnboardingChecklist onDismiss={() => setShowOnboarding(false)} />
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{scheduledPosts}</p>
                <p className="text-xs text-sfs-beige/60">Scheduled</p>
              </div>
            </div>
          </Card>
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{publishedPosts}</p>
                <p className="text-xs text-sfs-beige/60">Published</p>
              </div>
            </div>
          </Card>
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <PenSquare className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{draftPosts}</p>
                <p className="text-xs text-sfs-beige/60">Drafts</p>
              </div>
            </div>
          </Card>
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{accounts.length}</p>
                <p className="text-xs text-sfs-beige/60">Accounts</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold text-sfs-gold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 border-sfs-gold/20 hover:border-sfs-gold/40"
              onClick={() => navigate('/ai-studio')}
              data-testid="button-ai-content"
            >
              <Sparkles className="w-5 h-5 text-sfs-gold" />
              <div className="text-left">
                <div className="font-semibold">AI Content</div>
                <div className="text-xs text-muted-foreground">Generate with AI</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 border-sfs-gold/20 hover:border-sfs-gold/40"
              onClick={() => navigate('/calendar')}
              data-testid="button-schedule"
            >
              <Calendar className="w-5 h-5 text-sfs-gold" />
              <div className="text-left">
                <div className="font-semibold">Schedule</div>
                <div className="text-xs text-muted-foreground">Plan your content</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 border-sfs-gold/20 hover:border-sfs-gold/40"
              onClick={() => navigate('/analytics')}
              data-testid="button-analytics"
            >
              <TrendingUp className="w-5 h-5 text-sfs-gold" />
              <div className="text-left">
                <div className="font-semibold">Analytics</div>
                <div className="text-xs text-muted-foreground">Deep insights</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 border-sfs-gold/20 hover:border-sfs-gold/40"
              onClick={() => navigate('/connections/social-accounts')}
              data-testid="button-connect"
            >
              <Link2 className="w-5 h-5 text-sfs-gold" />
              <div className="text-left">
                <div className="font-semibold">Connect</div>
                <div className="text-xs text-muted-foreground">Link accounts</div>
              </div>
            </Button>
          </div>
        </Card>

        {recentPosts.length > 0 && (
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-sfs-gold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Posts
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/posts')}
                className="text-sfs-gold"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div 
                  key={post.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/30 hover:border-sfs-gold/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <div className="flex-1">
                    <p className="text-sm text-white line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline"
                        className={
                          post.status === 'published' 
                            ? 'border-green-500/30 text-green-400' 
                            : post.status === 'scheduled'
                            ? 'border-blue-500/30 text-blue-400'
                            : 'border-yellow-500/30 text-yellow-400'
                        }
                      >
                        {post.status}
                      </Badge>
                      {post.platforms?.map((platform: string) => (
                        <span key={platform} className="text-xs text-sfs-beige/50 capitalize">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
