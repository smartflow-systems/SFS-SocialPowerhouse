import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Zap,
  Target,
  AlertCircle,
} from 'lucide-react';

export default function LiveDashboard() {
  const [followers, setFollowers] = useState(42850);
  const [engagement, setEngagement] = useState(3247);
  const [reach, setReach] = useState(125430);
  const [activeUsers, setActiveUsers] = useState(1247);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Random increments to simulate real-time growth
      setFollowers(prev => prev + Math.floor(Math.random() * 5));
      setEngagement(prev => prev + Math.floor(Math.random() * 10));
      setReach(prev => prev + Math.floor(Math.random() * 50));
      setActiveUsers(prev => Math.max(1000, prev + Math.floor(Math.random() * 20) - 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trends = [
    { topic: '#AIMarketing', posts: '12.5K', growth: '+45%', status: 'hot' },
    { topic: '#SocialMedia2025', posts: '8.3K', growth: '+32%', status: 'hot' },
    { topic: '#ContentCreation', posts: '6.7K', growth: '+28%', status: 'rising' },
    { topic: '#DigitalMarketing', posts: '15.2K', growth: '+18%', status: 'rising' },
    { topic: '#GrowthHacking', posts: '4.9K', growth: '+52%', status: 'hot' },
  ];

  const liveActivity = [
    { action: 'New follower on Instagram', platform: '📷', time: '2s ago', type: 'follower' },
    { action: '15 likes on your latest post', platform: '📘', time: '8s ago', type: 'engagement' },
    { action: 'Comment on Twitter post', platform: '🐦', time: '12s ago', type: 'engagement' },
    { action: 'Share on LinkedIn', platform: '💼', time: '18s ago', type: 'share' },
    { action: '3 new followers on TikTok', platform: '🎵', time: '25s ago', type: 'follower' },
    { action: 'Story view on Instagram', platform: '📷', time: '31s ago', type: 'view' },
  ];

  const predictions = [
    {
      metric: 'Follower Growth',
      current: '2.3%',
      predicted: '3.8%',
      confidence: 'High',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      metric: 'Engagement Rate',
      current: '4.2%',
      predicted: '5.1%',
      confidence: 'Medium',
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      metric: 'Reach Increase',
      current: '125K',
      predicted: '158K',
      confidence: 'High',
      icon: Eye,
      color: 'text-purple-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-sfs-gold animate-pulse" />
            <h1 className="text-2xl font-bold text-sfs-gold">Live Dashboard</h1>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
              LIVE
            </Badge>
          </div>
          <p className="text-sm text-sfs-beige/70">
            Real-time metrics updating every 3 seconds
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60 font-medium">Total Followers</p>
                <h3 className="text-2xl font-bold mt-1 text-sfs-gold animate-pulse">
                  {followers.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-400">+2.3% today</p>
                </div>
              </div>
              <Users className="w-6 h-6 text-blue-400/70" />
            </div>
          </Card>

          <Card className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60 font-medium">Live Engagement</p>
                <h3 className="text-2xl font-bold mt-1 text-sfs-gold animate-pulse">
                  {engagement.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-400">+5.7% today</p>
                </div>
              </div>
              <Heart className="w-6 h-6 text-pink-400/70" />
            </div>
          </Card>

          <Card className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60 font-medium">Total Reach</p>
                <h3 className="text-2xl font-bold mt-1 text-sfs-gold animate-pulse">
                  {reach.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-400">+8.2% today</p>
                </div>
              </div>
              <Eye className="w-6 h-6 text-purple-400/70" />
            </div>
          </Card>

          <Card className="glass-card p-4 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60 font-medium">Active Now</p>
                <h3 className="text-2xl font-bold mt-1 text-sfs-gold animate-pulse">
                  {activeUsers.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
              <Zap className="w-6 h-6 text-yellow-400/70" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Live Activity Feed */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-sfs-gold" />
              <h3 className="text-lg font-semibold text-sfs-gold">Live Activity</h3>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-auto" />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {liveActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{activity.platform}</span>
                    <div className="flex-1">
                      <p className="text-sm text-sfs-beige">{activity.action}</p>
                      <p className="text-xs text-sfs-beige/50 mt-1">{activity.time}</p>
                    </div>
                    {activity.type === 'follower' && (
                      <Users className="w-4 h-4 text-blue-400" />
                    )}
                    {activity.type === 'engagement' && (
                      <Heart className="w-4 h-4 text-pink-400" />
                    )}
                    {activity.type === 'share' && (
                      <Share2 className="w-4 h-4 text-green-400" />
                    )}
                    {activity.type === 'view' && (
                      <Eye className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending Topics */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sfs-gold" />
              <h3 className="text-lg font-semibold text-sfs-gold">Trending Now</h3>
            </div>

            <div className="space-y-3">
              {trends.map((trend, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-sfs-gold/50">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-sfs-gold">{trend.topic}</p>
                        <p className="text-xs text-sfs-beige/60">{trend.posts} posts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          trend.status === 'hot'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }
                      >
                        {trend.status === 'hot' ? '🔥 HOT' : '📈 Rising'}
                      </Badge>
                      <span className="text-sm font-semibold text-green-400">{trend.growth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Predictions */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">AI Performance Predictions</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Next 7 Days
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <prediction.icon className={`w-5 h-5 ${prediction.color}`} />
                  <p className="font-semibold text-sfs-beige">{prediction.metric}</p>
                </div>

                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-xs text-sfs-beige/60">Current</p>
                    <p className="text-xl font-bold text-sfs-gold">{prediction.current}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
                  <div>
                    <p className="text-xs text-sfs-beige/60">Predicted</p>
                    <p className="text-xl font-bold text-green-400">{prediction.predicted}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-sfs-gold/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-sfs-beige/60">Confidence</p>
                    <Badge
                      className={
                        prediction.confidence === 'High'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {prediction.confidence}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Alerts */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-sfs-gold">Smart Alerts</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-400">Engagement Spike!</p>
                  <p className="text-sm text-sfs-beige/70 mt-1">
                    Your latest Instagram post is performing 3x better than average
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-400">Follower Milestone</p>
                  <p className="text-sm text-sfs-beige/70 mt-1">
                    You're about to hit 50,000 followers on Instagram! 🎉
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-400">Viral Potential</p>
                  <p className="text-sm text-sfs-beige/70 mt-1">
                    Your post about AI marketing has high viral potential
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-400">Best Time to Post</p>
                  <p className="text-sm text-sfs-beige/70 mt-1">
                    Your audience is most active right now on Twitter
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
