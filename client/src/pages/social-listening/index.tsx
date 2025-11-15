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
  Ear,
  Search,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  User,
  AlertCircle,
  BarChart3,
  Globe,
  Target,
  Zap,
} from 'lucide-react';

type Sentiment = 'positive' | 'neutral' | 'negative';

interface Mention {
  id: string;
  platform: string;
  platformIcon: string;
  author: string;
  content: string;
  sentiment: Sentiment;
  reach: string;
  engagement: string;
  timestamp: string;
  location: string;
}

export default function SocialListening() {
  const [searchKeyword, setSearchKeyword] = useState('');

  const mentions: Mention[] = [
    {
      id: '1',
      platform: 'Twitter',
      platformIcon: '🐦',
      author: '@tech_influencer',
      content: 'Just discovered this amazing social media automation tool! Game changer for my workflow. 🚀',
      sentiment: 'positive',
      reach: '125K',
      engagement: '3.2K',
      timestamp: '5 min ago',
      location: 'San Francisco, CA',
    },
    {
      id: '2',
      platform: 'Instagram',
      platformIcon: '📷',
      author: '@business_guru',
      content: 'The AI features in this platform are incredible. Saved me 10 hours this week!',
      sentiment: 'positive',
      reach: '89K',
      engagement: '2.8K',
      timestamp: '12 min ago',
      location: 'New York, NY',
    },
    {
      id: '3',
      platform: 'LinkedIn',
      platformIcon: '💼',
      author: 'Sarah Johnson',
      content: 'Looking for alternatives to current social media tools. Open to suggestions.',
      sentiment: 'neutral',
      reach: '45K',
      engagement: '1.2K',
      timestamp: '28 min ago',
      location: 'London, UK',
    },
    {
      id: '4',
      platform: 'Facebook',
      platformIcon: '📘',
      author: 'Marketing Pro Group',
      content: 'Has anyone tried the new scheduling feature? Not sure about the interface yet.',
      sentiment: 'neutral',
      reach: '67K',
      engagement: '1.8K',
      timestamp: '45 min ago',
      location: 'Toronto, CA',
    },
    {
      id: '5',
      platform: 'Twitter',
      platformIcon: '🐦',
      author: '@startup_ceo',
      content: 'This tool transformed our social media strategy. ROI has been phenomenal! 📈',
      sentiment: 'positive',
      reach: '198K',
      engagement: '4.5K',
      timestamp: '1 hour ago',
      location: 'Austin, TX',
    },
    {
      id: '6',
      platform: 'Reddit',
      platformIcon: '🔴',
      author: 'u/digitalmarketer',
      content: 'The analytics dashboard needs some work, but overall solid platform.',
      sentiment: 'neutral',
      reach: '34K',
      engagement: '892',
      timestamp: '2 hours ago',
      location: 'Seattle, WA',
    },
  ];

  const trendingTopics = [
    { keyword: 'AI automation', mentions: 1247, trend: '+42%', sentiment: 'positive' },
    { keyword: 'social media tools', mentions: 892, trend: '+38%', sentiment: 'positive' },
    { keyword: 'content scheduling', mentions: 645, trend: '+28%', sentiment: 'neutral' },
    { keyword: 'analytics platform', mentions: 521, trend: '+15%', sentiment: 'positive' },
    { keyword: 'marketing automation', mentions: 487, trend: '+35%', sentiment: 'positive' },
  ];

  const sentimentStats = {
    positive: 68,
    neutral: 24,
    negative: 8,
  };

  const geographicData = [
    { location: 'United States', mentions: 2847, percentage: 45 },
    { location: 'United Kingdom', mentions: 1523, percentage: 24 },
    { location: 'Canada', mentions: 892, percentage: 14 },
    { location: 'Australia', mentions: 634, percentage: 10 },
    { location: 'Other', mentions: 445, percentage: 7 },
  ];

  const topInfluencers = [
    { name: '@tech_influencer', followers: '485K', mentions: 24, reach: '2.3M', sentiment: 'positive' },
    { name: '@startup_ceo', followers: '312K', mentions: 18, reach: '1.8M', sentiment: 'positive' },
    { name: '@business_guru', followers: '267K', mentions: 15, reach: '1.5M', sentiment: 'positive' },
    { name: '@marketing_pro', followers: '198K', mentions: 12, reach: '1.1M', sentiment: 'neutral' },
  ];

  const alerts = [
    {
      type: 'spike',
      title: 'Mention Spike Detected',
      message: '3x increase in mentions in the last hour',
      severity: 'high',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      type: 'influencer',
      title: 'Influencer Mention',
      message: '@tech_influencer (485K followers) mentioned your brand',
      severity: 'medium',
      icon: User,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      type: 'trending',
      title: 'Trending Topic',
      message: '"AI automation" is trending with your brand',
      severity: 'medium',
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
  ];

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'neutral': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getSentimentIcon = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'neutral': return '😐';
      case 'negative': return '😞';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <Ear className="w-6 h-6" />
            Social Listening
          </h1>
          <p className="text-sm text-sfs-beige/70">
            Monitor brand mentions, sentiment, and trends across all platforms
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sfs-beige/40" />
              <Input
                placeholder="Search keywords, hashtags, or @mentions..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Target className="w-4 h-4" />
              Track New Keyword
            </Button>
          </div>
        </Card>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60">Positive</p>
                <h3 className="text-2xl font-bold text-green-400">{sentimentStats.positive}%</h3>
              </div>
              <div className="text-3xl">😊</div>
            </div>
            <div className="mt-2 w-full bg-sfs-brown/30 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: `${sentimentStats.positive}%` }}></div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60">Neutral</p>
                <h3 className="text-2xl font-bold text-gray-400">{sentimentStats.neutral}%</h3>
              </div>
              <div className="text-3xl">😐</div>
            </div>
            <div className="mt-2 w-full bg-sfs-brown/30 rounded-full h-2">
              <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${sentimentStats.neutral}%` }}></div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sfs-beige/60">Negative</p>
                <h3 className="text-2xl font-bold text-red-400">{sentimentStats.negative}%</h3>
              </div>
              <div className="text-3xl">😞</div>
            </div>
            <div className="mt-2 w-full bg-sfs-brown/30 rounded-full h-2">
              <div className="bg-red-400 h-2 rounded-full" style={{ width: `${sentimentStats.negative}%` }}></div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">Smart Alerts</h3>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ml-auto">
              {alerts.length} Active
            </Badge>
          </div>

          <div className="grid gap-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${alert.bgColor} ${alert.borderColor}`}
              >
                <div className="flex items-start gap-3">
                  <alert.icon className={`w-5 h-5 ${alert.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${alert.color}`}>{alert.title}</p>
                    <p className="text-sm text-sfs-beige/70 mt-1">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Trending Topics */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sfs-gold" />
              <h3 className="text-lg font-semibold text-sfs-gold">Trending Topics</h3>
            </div>

            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sfs-gold">"{topic.keyword}"</p>
                    <Badge className={getSentimentColor(topic.sentiment)}>
                      {getSentimentIcon(topic.sentiment)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-sfs-beige">{topic.mentions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{topic.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Geographic Distribution */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-sfs-gold" />
              <h3 className="text-lg font-semibold text-sfs-gold">Geographic Distribution</h3>
            </div>

            <div className="space-y-3">
              {geographicData.map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-sfs-beige">{location.location}</span>
                    </div>
                    <span className="text-sm text-sfs-gold">{location.mentions}</span>
                  </div>
                  <div className="w-full bg-sfs-brown/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Influencers */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">Top Influencers Mentioning You</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {topInfluencers.map((influencer, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sfs-gold">{influencer.name}</p>
                    <p className="text-xs text-sfs-beige/60">{influencer.followers} followers</p>
                  </div>
                  <Badge className={getSentimentColor(influencer.sentiment)}>
                    {getSentimentIcon(influencer.sentiment)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-sfs-beige/60">Mentions</p>
                    <p className="font-semibold text-sfs-beige">{influencer.mentions}</p>
                  </div>
                  <div>
                    <p className="text-sfs-beige/60">Total Reach</p>
                    <p className="font-semibold text-purple-400">{influencer.reach}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Mentions */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">Recent Mentions</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
              Live
            </Badge>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-sfs-brown/30">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="neutral">Neutral</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-3">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{mention.platformIcon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sfs-gold">{mention.author}</p>
                        <Badge className={getSentimentColor(mention.sentiment)}>
                          {mention.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-sfs-beige">{mention.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-sfs-beige/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{mention.location}</span>
                      </div>
                      <span>{mention.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <span>{mention.reach}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <span>{mention.engagement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="positive" className="mt-4 space-y-3">
              {mentions.filter(m => m.sentiment === 'positive').map((mention) => (
                <div
                  key={mention.id}
                  className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{mention.platformIcon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sfs-gold">{mention.author}</p>
                        <Badge className={getSentimentColor(mention.sentiment)}>
                          {mention.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-sfs-beige">{mention.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-sfs-beige/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{mention.location}</span>
                      </div>
                      <span>{mention.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <span>{mention.reach}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <span>{mention.engagement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="neutral" className="mt-4 space-y-3">
              {mentions.filter(m => m.sentiment === 'neutral').map((mention) => (
                <div
                  key={mention.id}
                  className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{mention.platformIcon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sfs-gold">{mention.author}</p>
                        <Badge className={getSentimentColor(mention.sentiment)}>
                          {mention.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-sfs-beige">{mention.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-sfs-beige/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{mention.location}</span>
                      </div>
                      <span>{mention.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <span>{mention.reach}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <span>{mention.engagement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="negative" className="mt-4 space-y-3">
              {mentions.filter(m => m.sentiment === 'negative').length > 0 ? (
                mentions.filter(m => m.sentiment === 'negative').map((mention) => (
                  <div
                    key={mention.id}
                    className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{mention.platformIcon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sfs-gold">{mention.author}</p>
                          <Badge className={getSentimentColor(mention.sentiment)}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-sfs-beige">{mention.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-sfs-beige/60">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{mention.location}</span>
                        </div>
                        <span>{mention.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400" />
                          <span>{mention.reach}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-blue-400" />
                          <span>{mention.engagement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sfs-beige/50">No negative mentions! Keep up the great work! 🎉</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
