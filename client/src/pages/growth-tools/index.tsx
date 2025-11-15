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
  TrendingUp,
  Hash,
  Clock,
  Target,
  Sparkles,
  Search,
  Copy,
  Check,
  Flame,
  Users,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GrowthTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const { toast } = useToast();

  const trendingHashtags = [
    { tag: '#AIMarketing', posts: '1.2M', engagement: '8.5%', trend: '+125%', score: 98 },
    { tag: '#SocialMedia2025', posts: '856K', engagement: '7.8%', trend: '+98%', score: 95 },
    { tag: '#ContentCreation', posts: '2.3M', engagement: '6.2%', trend: '+76%', score: 92 },
    { tag: '#DigitalMarketing', posts: '3.1M', engagement: '5.9%', trend: '+54%', score: 88 },
    { tag: '#GrowthHacking', posts: '445K', engagement: '9.1%', trend: '+142%', score: 97 },
    { tag: '#Entrepreneurship', posts: '4.2M', engagement: '5.1%', trend: '+32%', score: 85 },
    { tag: '#StartupLife', posts: '678K', engagement: '7.2%', trend: '+89%', score: 91 },
    { tag: '#MarketingTips', posts: '1.5M', engagement: '6.8%', trend: '+65%', score: 89 },
  ];

  const bestTimesToPost = [
    { platform: 'Instagram', icon: '📷', bestDays: ['Mon', 'Wed', 'Fri'], bestTimes: ['9AM', '1PM', '7PM'], engagement: '12.3%' },
    { platform: 'Twitter', icon: '🐦', bestDays: ['Tue', 'Thu'], bestTimes: ['8AM', '12PM', '5PM'], engagement: '9.8%' },
    { platform: 'LinkedIn', icon: '💼', bestDays: ['Tue', 'Wed', 'Thu'], bestTimes: ['7AM', '12PM', '5PM'], engagement: '11.5%' },
    { platform: 'Facebook', icon: '📘', bestDays: ['Wed', 'Thu', 'Fri'], bestTimes: ['1PM', '3PM', '8PM'], engagement: '8.2%' },
    { platform: 'TikTok', icon: '🎵', bestDays: ['Thu', 'Fri', 'Sat'], bestTimes: ['6PM', '8PM', '10PM'], engagement: '15.7%' },
  ];

  const viralContent = [
    {
      id: 1,
      content: 'How AI is revolutionizing social media marketing in 2025...',
      platform: '📷',
      viralScore: 94,
      reach: '458K',
      engagement: '32.5K',
      shares: '12.3K',
    },
    {
      id: 2,
      content: '5 secrets to doubling your engagement rate (most people miss #3)...',
      platform: '🐦',
      viralScore: 91,
      reach: '325K',
      engagement: '28.1K',
      shares: '9.8K',
    },
    {
      id: 3,
      content: 'This content strategy took me from 0 to 100K followers in 6 months...',
      platform: '💼',
      viralScore: 88,
      reach: '287K',
      engagement: '24.6K',
      shares: '8.2K',
    },
  ];

  const audienceInsights = [
    { metric: 'Most Active Age', value: '25-34', icon: Users, color: 'text-blue-400' },
    { metric: 'Peak Activity', value: '7-9 PM', icon: Clock, color: 'text-purple-400' },
    { metric: 'Top Location', value: 'United States', icon: Target, color: 'text-green-400' },
    { metric: 'Gender Split', value: '52% F / 48% M', icon: Users, color: 'text-pink-400' },
  ];

  const handleCopyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedHashtag(tag);
    toast({
      title: 'Copied!',
      description: `${tag} copied to clipboard`,
    });
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Growth Tools
          </h1>
          <p className="text-sm text-sfs-beige/70">
            AI-powered tools to skyrocket your growth
          </p>
        </div>

        <Tabs defaultValue="hashtags" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-sfs-brown/30">
            <TabsTrigger value="hashtags">
              <Hash className="w-4 h-4 mr-2" />
              Hashtags
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="w-4 h-4 mr-2" />
              Best Times
            </TabsTrigger>
            <TabsTrigger value="viral">
              <Flame className="w-4 h-4 mr-2" />
              Viral Content
            </TabsTrigger>
            <TabsTrigger value="audience">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
          </TabsList>

          {/* Hashtag Research */}
          <TabsContent value="hashtags" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-sfs-gold" />
                <h3 className="text-lg font-semibold text-sfs-gold">Hashtag Research</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                  Live Data
                </Badge>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sfs-beige/40" />
                <Input
                  placeholder="Search hashtags or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-3">
                {trendingHashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-sfs-gold">{hashtag.tag}</span>
                          <Badge className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30">
                            Score: {hashtag.score}
                          </Badge>
                          {hashtag.score >= 95 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              🔥 HOT
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-sfs-beige/60">Posts</p>
                            <p className="font-semibold text-sfs-beige">{hashtag.posts}</p>
                          </div>
                          <div>
                            <p className="text-sfs-beige/60">Engagement</p>
                            <p className="font-semibold text-green-400">{hashtag.engagement}</p>
                          </div>
                          <div>
                            <p className="text-sfs-beige/60">Trend</p>
                            <p className="font-semibold text-green-400">{hashtag.trend}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyHashtag(hashtag.tag)}
                        className="ml-4"
                      >
                        {copiedHashtag === hashtag.tag ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Best Times to Post */}
          <TabsContent value="timing" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-sfs-gold" />
                <h3 className="text-lg font-semibold text-sfs-gold">Optimal Posting Times</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-auto">
                  Based on YOUR data
                </Badge>
              </div>

              <div className="grid gap-4">
                {bestTimesToPost.map((timing, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10 hover:border-sfs-gold/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{timing.icon}</span>
                        <div>
                          <p className="font-semibold text-sfs-gold">{timing.platform}</p>
                          <p className="text-sm text-sfs-beige/60">
                            Avg engagement: <span className="text-green-400 font-semibold">{timing.engagement}</span>
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Recommended
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-sfs-beige/60 mb-2">Best Days</p>
                        <div className="flex gap-2">
                          {timing.bestDays.map((day, i) => (
                            <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-sfs-beige/60 mb-2">Best Times</p>
                        <div className="flex gap-2">
                          {timing.bestTimes.map((time, i) => (
                            <Badge key={i} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Viral Content Detector */}
          <TabsContent value="viral" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-sfs-gold">Viral Content Detector</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-auto">
                  AI Powered
                </Badge>
              </div>

              <div className="space-y-4">
                {viralContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 hover:border-orange-500/50 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{content.platform}</span>
                      <div className="flex-1">
                        <p className="text-sfs-beige font-medium">{content.content}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-400" />
                          <span className="text-2xl font-bold text-orange-400">{content.viralScore}</span>
                        </div>
                        <p className="text-xs text-sfs-beige/60">Viral Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-orange-500/20">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs text-sfs-beige/60">Reach</p>
                          <p className="font-semibold text-sfs-beige">{content.reach}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-sfs-beige/60">Engagement</p>
                          <p className="font-semibold text-sfs-beige">{content.engagement}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-xs text-sfs-beige/60">Shares</p>
                          <p className="font-semibold text-sfs-beige">{content.shares}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Audience Insights */}
          <TabsContent value="audience" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-sfs-gold" />
                <h3 className="text-lg font-semibold text-sfs-gold">Audience Insights</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {audienceInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10"
                  >
                    <div className="flex items-center gap-3">
                      <insight.icon className={`w-6 h-6 ${insight.color}`} />
                      <div>
                        <p className="text-xs text-sfs-beige/60">{insight.metric}</p>
                        <p className="text-xl font-bold text-sfs-gold">{insight.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-400 mb-2">AI Growth Recommendation</p>
                    <p className="text-sm text-sfs-beige/80">
                      Your audience is most engaged with educational content posted between 7-9 PM on weekdays.
                      Focus on creating more tutorial-style posts with carousel formats to maximize reach and engagement.
                      Based on current trends, you could see a 45% increase in engagement by implementing this strategy.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
