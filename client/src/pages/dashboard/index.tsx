import DashboardLayout from '@/layouts/DashboardLayout';
import StatsGrid from '@/components/Dashboard/StatsGrid';
import NotificationPanel from '@/components/Dashboard/NotificationPanel';
import GlassCard from '@/components/Glass/GlassCard';
import GoldenButton from '@/components/Glass/GoldenButton';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sfs-gold mb-2">
              Welcome back, Level 10 Mage!
            </h1>
            <p className="text-sfs-beige/60">
              Here's what's happening with your social media today
            </p>
          </div>
          <GoldenButton className="gap-2">
            <Sparkles className="w-5 h-5" />
            Generate AI Content
          </GoldenButton>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-sfs-gold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <GoldenButton variant="secondary" className="justify-start">
                <Sparkles className="w-4 h-4" />
                Create Post
              </GoldenButton>
              <GoldenButton variant="secondary" className="justify-start">
                <Calendar className="w-4 h-4" />
                Schedule Content
              </GoldenButton>
              <GoldenButton variant="secondary" className="justify-start">
                <TrendingUp className="w-4 h-4" />
                View Analytics
              </GoldenButton>
              <GoldenButton variant="secondary" className="justify-start">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </GoldenButton>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-sfs-beige mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {[
                  { action: 'Published post on Facebook', time: '5 minutes ago' },
                  { action: 'Scheduled 3 Instagram posts', time: '1 hour ago' },
                  { action: 'Generated AI caption for TikTok', time: '2 hours ago' },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-sfs-gold/10 hover:border-sfs-gold/30 transition-colors"
                  >
                    <span className="text-sfs-beige text-sm">{activity.action}</span>
                    <span className="text-sfs-gold/60 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <NotificationPanel />
        </div>

        {/* Performance Chart Placeholder */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-sfs-gold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Overview
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-sfs-gold/20 rounded-lg">
            <p className="text-sfs-beige/40">Chart will be rendered here</p>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
