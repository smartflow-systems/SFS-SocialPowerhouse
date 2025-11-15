import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Target,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BarChart3,
  Hash,
  Calendar,
  Award,
  Zap,
  Plus,
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: string;
  platformIcon: string;
  followers: string;
  engagement: string;
  growthRate: string;
  postsPerWeek: number;
  avgLikes: string;
  avgComments: string;
  status: 'growing' | 'stable' | 'declining';
}

interface CompetitorPost {
  id: string;
  competitor: string;
  platform: string;
  platformIcon: string;
  content: string;
  likes: string;
  comments: string;
  shares: string;
  views: string;
  engagement: string;
  timestamp: string;
}

export default function CompetitorIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');

  const competitors: Competitor[] = [
    {
      id: '1',
      name: 'SocialFlow Pro',
      handle: '@socialflow',
      platform: 'Instagram',
      platformIcon: '📷',
      followers: '245K',
      engagement: '4.2%',
      growthRate: '+12%',
      postsPerWeek: 5,
      avgLikes: '10.3K',
      avgComments: '456',
      status: 'growing',
    },
    {
      id: '2',
      name: 'AutoPost AI',
      handle: '@autopostai',
      platform: 'Twitter',
      platformIcon: '🐦',
      followers: '189K',
      engagement: '3.8%',
      growthRate: '+8%',
      postsPerWeek: 12,
      avgLikes: '7.2K',
      avgComments: '312',
      status: 'growing',
    },
    {
      id: '3',
      name: 'ContentMaster',
      handle: 'ContentMaster Inc',
      platform: 'LinkedIn',
      platformIcon: '💼',
      followers: '156K',
      engagement: '5.1%',
      growthRate: '+15%',
      postsPerWeek: 3,
      avgLikes: '8.5K',
      avgComments: '521',
      status: 'growing',
    },
    {
      id: '4',
      name: 'SocialGenius',
      handle: '@socialgenius',
      platform: 'TikTok',
      platformIcon: '🎵',
      followers: '312K',
      engagement: '6.8%',
      growthRate: '+22%',
      postsPerWeek: 7,
      avgLikes: '21.3K',
      avgComments: '1.2K',
      status: 'growing',
    },
    {
      id: '5',
      name: 'SchedulePro',
      handle: '@schedulepro',
      platform: 'Facebook',
      platformIcon: '📘',
      followers: '128K',
      engagement: '2.9%',
      growthRate: '-3%',
      postsPerWeek: 4,
      avgLikes: '3.7K',
      avgComments: '198',
      status: 'declining',
    },
  ];

  const topCompetitorPosts: CompetitorPost[] = [
    {
      id: '1',
      competitor: '@socialflow',
      platform: 'Instagram',
      platformIcon: '📷',
      content: '5 AI tools that will transform your social media strategy in 2025 🚀 [Carousel Post]',
      likes: '24.5K',
      comments: '892',
      shares: '1.2K',
      views: '156K',
      engagement: '8.5%',
      timestamp: '2 days ago',
    },
    {
      id: '2',
      competitor: '@autopostai',
      platform: 'Twitter',
      platformIcon: '🐦',
      content: 'Just hit 200K followers! Here\'s what I learned about Twitter growth [Thread]',
      likes: '18.3K',
      comments: '654',
      shares: '2.8K',
      views: '245K',
      engagement: '9.2%',
      timestamp: '3 days ago',
    },
    {
      id: '3',
      competitor: 'ContentMaster Inc',
      platform: 'LinkedIn',
      platformIcon: '💼',
      content: 'The future of content marketing: AI-powered personalization at scale [Article]',
      likes: '12.7K',
      comments: '1.1K',
      shares: '845',
      views: '89K',
      engagement: '7.8%',
      timestamp: '1 week ago',
    },
    {
      id: '4',
      competitor: '@socialgenius',
      platform: 'TikTok',
      platformIcon: '🎵',
      content: 'POV: You discover the secret to viral content [Video]',
      likes: '45.2K',
      comments: '2.3K',
      shares: '5.6K',
      views: '1.2M',
      engagement: '12.3%',
      timestamp: '4 days ago',
    },
  ];

  const competitorHashtags = [
    { hashtag: '#SocialMediaTips', usage: 45, avgEngagement: '6.2%', trend: '+28%' },
    { hashtag: '#ContentMarketing', usage: 38, avgEngagement: '5.8%', trend: '+22%' },
    { hashtag: '#DigitalMarketing', usage: 32, avgEngagement: '4.9%', trend: '+15%' },
    { hashtag: '#MarketingAutomation', usage: 28, avgEngagement: '7.1%', trend: '+35%' },
    { hashtag: '#GrowthHacking', usage: 24, avgEngagement: '8.3%', trend: '+42%' },
  ];

  const insights = [
    {
      title: 'Peak Posting Times',
      description: 'Competitors post most frequently on Tue/Thu at 1-3 PM EST',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Content Type Winning',
      description: 'Carousel posts getting 3x more engagement than single images',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Hashtag Strategy',
      description: 'Average of 5-8 hashtags per post performs best',
      icon: Hash,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Engagement Opportunity',
      description: 'You can outperform 60% of competitors with current growth rate',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
  ];

  const performanceComparison = [
    { metric: 'Avg Engagement Rate', you: '5.4%', competitors: '4.7%', performance: 'better' },
    { metric: 'Growth Rate', you: '+18%', competitors: '+12%', performance: 'better' },
    { metric: 'Posts Per Week', you: '6', competitors: '6.2', performance: 'same' },
    { metric: 'Response Time', you: '< 2 hours', competitors: '4 hours', performance: 'better' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stable': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'declining': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'growing': return <TrendingUp className="w-3 h-3" />;
      case 'stable': return <BarChart3 className="w-3 h-3" />;
      case 'declining': return <TrendingDown className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'better': return 'text-green-400';
      case 'worse': return 'text-red-400';
      case 'same': return 'text-gray-400';
      default: return 'text-sfs-beige';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Competitor Intelligence
          </h1>
          <p className="text-sm text-sfs-beige/70">
            Track, analyze, and outperform your competitors
          </p>
        </div>

        {/* Search & Add Competitor */}
        <Card className="glass-card p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sfs-beige/40" />
              <Input
                placeholder="Search competitors or add new..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Competitor
            </Button>
          </div>
        </Card>

        {/* Performance Comparison */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">Your Performance vs Competitors</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {performanceComparison.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                <p className="text-xs text-sfs-beige/60 mb-2">{item.metric}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-sfs-beige/60">You</span>
                  <span className={`text-lg font-bold ${getPerformanceColor(item.performance)}`}>
                    {item.you}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sfs-beige/60">Avg</span>
                  <span className="text-sm text-sfs-beige">{item.competitors}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${insight.bgColor} ${insight.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5`} />
                <div>
                  <p className={`font-semibold ${insight.color}`}>{insight.title}</p>
                  <p className="text-sm text-sfs-beige/80 mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="competitors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-sfs-brown/30">
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          </TabsList>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {competitors.map((competitor) => (
                <Card key={competitor.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{competitor.platformIcon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sfs-gold">{competitor.name}</h4>
                          <Badge className={getStatusColor(competitor.status)}>
                            {getStatusIcon(competitor.status)}
                            {competitor.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-sfs-beige/60">{competitor.handle}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Full Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <p className="text-xs text-sfs-beige/60">Followers</p>
                      </div>
                      <p className="font-bold text-sfs-beige">{competitor.followers}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <p className="text-xs text-sfs-beige/60">Engagement</p>
                      </div>
                      <p className="font-bold text-pink-400">{competitor.engagement}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <p className="text-xs text-sfs-beige/60">Growth</p>
                      </div>
                      <p className="font-bold text-green-400">{competitor.growthRate}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <p className="text-xs text-sfs-beige/60">Posts/Week</p>
                      </div>
                      <p className="font-bold text-sfs-beige">{competitor.postsPerWeek}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        <p className="text-xs text-sfs-beige/60">Avg Likes</p>
                      </div>
                      <p className="font-bold text-sfs-beige">{competitor.avgLikes}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <p className="text-xs text-sfs-beige/60">Avg Comments</p>
                      </div>
                      <p className="font-bold text-sfs-beige">{competitor.avgComments}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Competitor Posts Tab */}
          <TabsContent value="top-posts" className="space-y-4 mt-4">
            <div className="space-y-4">
              {topCompetitorPosts.map((post) => (
                <Card key={post.id} className="glass-card p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">{post.platformIcon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sfs-gold">{post.competitor}</p>
                        <Badge className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30">
                          {post.platform}
                        </Badge>
                        <span className="text-xs text-sfs-beige/50">{post.timestamp}</span>
                      </div>
                      <p className="text-sm text-sfs-beige">{post.content}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t border-sfs-gold/10">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-sfs-beige/60">Views</p>
                        <p className="font-semibold text-sfs-beige">{post.views}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <div>
                        <p className="text-xs text-sfs-beige/60">Likes</p>
                        <p className="font-semibold text-sfs-beige">{post.likes}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-sfs-beige/60">Comments</p>
                        <p className="font-semibold text-sfs-beige">{post.comments}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-sfs-beige/60">Shares</p>
                        <p className="font-semibold text-sfs-beige">{post.shares}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-xs text-sfs-beige/60">Engagement</p>
                        <p className="font-semibold text-orange-400">{post.engagement}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Competitor Hashtags Tab */}
          <TabsContent value="hashtags" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-sfs-gold" />
                <h3 className="text-lg font-semibold text-sfs-gold">Top Competitor Hashtags</h3>
              </div>

              <div className="space-y-3">
                {competitorHashtags.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-sfs-gold/50">#{index + 1}</span>
                        <p className="text-lg font-semibold text-sfs-gold">{item.hashtag}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {item.trend}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-sfs-beige/60">Usage Count</p>
                        <p className="font-semibold text-sfs-beige">{item.usage} posts</p>
                      </div>
                      <div>
                        <p className="text-xs text-sfs-beige/60">Avg Engagement</p>
                        <p className="font-semibold text-purple-400">{item.avgEngagement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
