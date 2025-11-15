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
  Zap,
  Search,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Clock,
  Repeat,
  Share2,
  Heart,
  MessageCircle,
  Rss,
  Hash,
  GitBranch,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  type: string;
  trigger: string;
  action: string;
  platforms: string[];
  status: 'active' | 'paused' | 'inactive';
  executions: number;
  successRate: string;
  lastRun: string;
  icon: any;
  color: string;
}

export default function AutomationRules() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const automationRules: AutomationRule[] = [
    {
      id: '1',
      name: 'Auto-Schedule to Best Times',
      type: 'Scheduling',
      trigger: 'New post created',
      action: 'Schedule to optimal time slot',
      platforms: ['Instagram', 'Twitter', 'LinkedIn'],
      status: 'active',
      executions: 247,
      successRate: '98%',
      lastRun: '2 min ago',
      icon: Clock,
      color: 'text-blue-400',
    },
    {
      id: '2',
      name: 'RSS Feed Auto-Post',
      type: 'Content',
      trigger: 'New RSS feed item',
      action: 'Create and publish post',
      platforms: ['Twitter', 'LinkedIn'],
      status: 'active',
      executions: 189,
      successRate: '95%',
      lastRun: '15 min ago',
      icon: Rss,
      color: 'text-orange-400',
    },
    {
      id: '3',
      name: 'Auto-Hashtag Suggestions',
      type: 'Enhancement',
      trigger: 'Post about to publish',
      action: 'Add trending hashtags',
      platforms: ['Instagram', 'TikTok'],
      status: 'active',
      executions: 421,
      successRate: '92%',
      lastRun: '5 min ago',
      icon: Hash,
      color: 'text-purple-400',
    },
    {
      id: '4',
      name: 'Engagement Booster',
      type: 'Engagement',
      trigger: 'Follower posts with keyword',
      action: 'Auto-like and comment',
      platforms: ['Instagram', 'Twitter'],
      status: 'paused',
      executions: 156,
      successRate: '88%',
      lastRun: '1 hour ago',
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      id: '5',
      name: 'Evergreen Content Recycler',
      type: 'Content',
      trigger: 'Every 7 days',
      action: 'Repost top performing content',
      platforms: ['Facebook', 'LinkedIn'],
      status: 'active',
      executions: 34,
      successRate: '97%',
      lastRun: '2 days ago',
      icon: Repeat,
      color: 'text-green-400',
    },
    {
      id: '6',
      name: 'Cross-Platform Publisher',
      type: 'Distribution',
      trigger: 'Post published on Instagram',
      action: 'Share to Twitter & Facebook',
      platforms: ['Instagram', 'Twitter', 'Facebook'],
      status: 'active',
      executions: 312,
      successRate: '96%',
      lastRun: '8 min ago',
      icon: Share2,
      color: 'text-cyan-400',
    },
  ];

  const ruleTemplates = [
    {
      name: 'Auto-Schedule',
      description: 'Automatically schedule posts to best times',
      category: 'Scheduling',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      name: 'RSS to Social',
      description: 'Auto-post new RSS feed items',
      category: 'Content',
      icon: Rss,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    {
      name: 'Hashtag Automation',
      description: 'Add trending hashtags automatically',
      category: 'Enhancement',
      icon: Hash,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      name: 'Auto-Engagement',
      description: 'Like and comment on relevant posts',
      category: 'Engagement',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
    },
    {
      name: 'Content Recycler',
      description: 'Repost evergreen content periodically',
      category: 'Content',
      icon: Repeat,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      name: 'Cross-Post',
      description: 'Share across multiple platforms',
      category: 'Distribution',
      icon: Share2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
  ];

  const stats = [
    { label: 'Active Rules', value: '5', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Total Executions', value: '1,359', icon: Zap, color: 'text-yellow-400' },
    { label: 'Success Rate', value: '94%', icon: Target, color: 'text-blue-400' },
    { label: 'Time Saved', value: '47 hrs', icon: Clock, color: 'text-purple-400' },
  ];

  const toggleRuleStatus = (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast({
      title: `Rule ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
      description: `The automation rule has been ${newStatus === 'active' ? 'activated' : 'paused'}`,
    });
  };

  const deleteRule = (ruleId: string, ruleName: string) => {
    toast({
      title: 'Rule Deleted',
      description: `${ruleName} has been deleted`,
      variant: 'destructive',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Automation Rules
          </h1>
          <p className="text-sm text-sfs-beige/70">
            Set up powerful automation to save time and boost engagement
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <p className="text-xs text-sfs-beige/60">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Search & Create */}
        <Card className="glass-card p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sfs-beige/40" />
              <Input
                placeholder="Search automation rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-sfs-brown/30">
            <TabsTrigger value="active">
              Active Rules
              <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1.5">
                {automationRules.filter(r => r.status === 'active').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Active Rules Tab */}
          <TabsContent value="active" className="space-y-4 mt-4">
            <div className="space-y-3">
              {automationRules.filter(rule => rule.status === 'active').map((rule) => (
                <Card key={rule.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-sfs-brown/30 border border-sfs-gold/20">
                        <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sfs-gold">{rule.name}</h4>
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-sfs-beige/60">{rule.type}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRuleStatus(rule.id, rule.status)}
                      >
                        {rule.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRule(rule.id, rule.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-4 h-4 text-blue-400" />
                        <p className="text-xs font-semibold text-blue-400">Trigger</p>
                      </div>
                      <p className="text-sm text-sfs-beige">{rule.trigger}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <p className="text-xs font-semibold text-purple-400">Action</p>
                      </div>
                      <p className="text-sm text-sfs-beige">{rule.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-sfs-gold/10">
                    <div className="flex gap-2">
                      {rule.platforms.map((platform, index) => (
                        <Badge key={index} className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30">
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                        <span className="text-sfs-beige/60">Success:</span>
                        <span className="font-semibold text-green-400">{rule.successRate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sfs-beige/60">Runs:</span>
                        <span className="font-semibold text-sfs-beige">{rule.executions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-sfs-beige/50" />
                        <span className="text-xs text-sfs-beige/50">{rule.lastRun}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Rules Tab */}
          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="space-y-3">
              {automationRules.map((rule) => (
                <Card key={rule.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-sfs-brown/30 border border-sfs-gold/20">
                        <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sfs-gold">{rule.name}</h4>
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-sfs-beige/60">{rule.type}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRuleStatus(rule.id, rule.status)}
                      >
                        {rule.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRule(rule.id, rule.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-4 h-4 text-blue-400" />
                        <p className="text-xs font-semibold text-blue-400">Trigger</p>
                      </div>
                      <p className="text-sm text-sfs-beige">{rule.trigger}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <p className="text-xs font-semibold text-purple-400">Action</p>
                      </div>
                      <p className="text-sm text-sfs-beige">{rule.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-sfs-gold/10">
                    <div className="flex gap-2">
                      {rule.platforms.map((platform, index) => (
                        <Badge key={index} className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30">
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                        <span className="text-sfs-beige/60">Success:</span>
                        <span className="font-semibold text-green-400">{rule.successRate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sfs-beige/60">Runs:</span>
                        <span className="font-semibold text-sfs-beige">{rule.executions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-sfs-beige/50" />
                        <span className="text-xs text-sfs-beige/50">{rule.lastRun}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-sfs-gold" />
                <h3 className="text-lg font-semibold text-sfs-gold">Rule Templates</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-auto">
                  Quick Setup
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ruleTemplates.map((template, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${template.bgColor} ${template.borderColor}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <template.icon className={`w-6 h-6 ${template.color}`} />
                      <Badge className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30 text-xs">
                        {template.category}
                      </Badge>
                    </div>

                    <p className={`font-semibold ${template.color} mb-2`}>{template.name}</p>
                    <p className="text-sm text-sfs-beige/70 mb-4">{template.description}</p>

                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
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
