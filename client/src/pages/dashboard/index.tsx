import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your social media today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Posts</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">1,234</h3>
                <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Engagement</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">45.2K</h3>
                <p className="text-sm text-green-600 mt-2">+8.3% from last month</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Followers</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">23.5K</h3>
                <p className="text-sm text-green-600 mt-2">+15.2% from last month</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Engagement Rate</p>
                <h3 className="text-2xl font-bold text-sfs-gold mt-2">3.8%</h3>
                <p className="text-sm text-red-600 mt-2">-2.1% from last month</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Content
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'Published post on Facebook', time: '5 minutes ago' },
                { action: 'Scheduled 3 Instagram posts', time: '1 hour ago' },
                { action: 'Generated AI caption for TikTok', time: '2 hours ago' },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Overview
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Chart will be rendered here</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
