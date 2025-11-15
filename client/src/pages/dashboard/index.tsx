import DashboardLayout from '@/layouts/DashboardLayout';
import AnalyticsDashboard from '@/components/Dashboard/AnalyticsDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section with Gold Gradient */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gold-gradient mb-2">
              Welcome to SFS Social Powerhouse
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered insights for your social media success ✨
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/posts/new')}
              className="btn-gold pulse-on-hover"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Quick Actions with SFS Theme */}
        <Card className="sfs-glass-card fade-in-up">
          <h2 className="text-xl font-semibold text-sfs-gold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 hover-elevate bg-sf-brown/10 border-sf-gold/20 hover:border-sf-gold/40"
              onClick={() => navigate('/posts/new')}
            >
              <Sparkles className="w-5 h-5 text-sf-gold" />
              <div className="text-left">
                <div className="font-semibold text-foreground">AI Content</div>
                <div className="text-xs text-muted-foreground">Generate with AI</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 hover-elevate bg-sf-brown/10 border-sf-gold/20 hover:border-sf-gold/40"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="w-5 h-5 text-sf-gold" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Schedule</div>
                <div className="text-xs text-muted-foreground">Plan your content</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 hover-elevate bg-sf-brown/10 border-sf-gold/20 hover:border-sf-gold/40"
              onClick={() => navigate('/analytics')}
            >
              <TrendingUp className="w-5 h-5 text-sf-gold" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Analytics</div>
                <div className="text-xs text-muted-foreground">Deep insights</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 flex-col items-start gap-2 hover-elevate bg-sf-brown/10 border-sf-gold/20 hover:border-sf-gold/40"
              onClick={() => navigate('/accounts')}
            >
              <div className="w-5 h-5 text-sf-gold text-xl">🔗</div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Connect</div>
                <div className="text-xs text-muted-foreground">Link accounts</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Beautiful Analytics Dashboard with SFS Theme */}
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
