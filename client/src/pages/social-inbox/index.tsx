import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Inbox,
  Search,
  Filter,
  Star,
  MessageCircle,
  AtSign,
  Send,
  Sparkles,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MessageType = 'dm' | 'comment' | 'mention';
type MessageStatus = 'unread' | 'read' | 'replied';

interface Message {
  id: string;
  platform: string;
  platformIcon: string;
  type: MessageType;
  from: string;
  avatar: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  starred: boolean;
}

export default function SocialInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const messages: Message[] = [
    {
      id: '1',
      platform: 'Instagram',
      platformIcon: '📷',
      type: 'dm',
      from: '@sarah_marketing',
      avatar: '👩',
      content: 'Hey! Love your recent post about AI marketing. Can you share more tips?',
      timestamp: '2 min ago',
      status: 'unread',
      starred: true,
    },
    {
      id: '2',
      platform: 'Twitter',
      platformIcon: '🐦',
      type: 'mention',
      from: '@john_tech',
      avatar: '👨',
      content: '@yourhandle This is exactly what I needed! Thank you for sharing.',
      timestamp: '5 min ago',
      status: 'unread',
      starred: false,
    },
    {
      id: '3',
      platform: 'LinkedIn',
      platformIcon: '💼',
      type: 'comment',
      from: 'Emily Rodriguez',
      avatar: '👩‍💼',
      content: 'Great insights on social media automation! Would love to connect.',
      timestamp: '12 min ago',
      status: 'read',
      starred: false,
    },
    {
      id: '4',
      platform: 'Facebook',
      platformIcon: '📘',
      type: 'comment',
      from: 'Mike Chen',
      avatar: '👨‍💻',
      content: 'This tool looks amazing! Is there a free trial available?',
      timestamp: '18 min ago',
      status: 'unread',
      starred: false,
    },
    {
      id: '5',
      platform: 'TikTok',
      platformIcon: '🎵',
      type: 'dm',
      from: '@creative_sam',
      avatar: '🎨',
      content: 'Your content strategy video was so helpful! Can we collaborate?',
      timestamp: '25 min ago',
      status: 'replied',
      starred: true,
    },
    {
      id: '6',
      platform: 'Instagram',
      platformIcon: '📷',
      type: 'comment',
      from: '@business_pro',
      avatar: '💼',
      content: 'What analytics tool do you use? Your metrics are impressive!',
      timestamp: '32 min ago',
      status: 'read',
      starred: false,
    },
    {
      id: '7',
      platform: 'Twitter',
      platformIcon: '🐦',
      type: 'dm',
      from: '@dev_anna',
      avatar: '👩‍💻',
      content: 'Interested in your automation platform. Do you have API docs?',
      timestamp: '45 min ago',
      status: 'unread',
      starred: false,
    },
    {
      id: '8',
      platform: 'LinkedIn',
      platformIcon: '💼',
      type: 'mention',
      from: 'David Kim',
      avatar: '👨‍💼',
      content: 'Thanks for mentioning our company in your post. Very accurate analysis!',
      timestamp: '1 hour ago',
      status: 'replied',
      starred: false,
    },
  ];

  const aiSuggestions = [
    "Thanks for reaching out! I'd love to share more tips. What specific area are you most interested in?",
    "I appreciate your interest! Let me send you some resources that might help.",
    "Great question! I'll create a detailed post about this soon. Stay tuned!",
    "Thank you so much! Feel free to DM me if you have any questions.",
  ];

  const stats = [
    { label: 'Unread', value: messages.filter(m => m.status === 'unread').length, color: 'text-blue-400' },
    { label: 'Starred', value: messages.filter(m => m.starred).length, color: 'text-yellow-400' },
    { label: 'Total Today', value: messages.length, color: 'text-green-400' },
    { label: 'Avg Response', value: '< 5 min', color: 'text-purple-400' },
  ];

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    toast({
      title: 'Reply Sent!',
      description: `Your message has been sent to ${selectedMessage?.from}`,
    });

    setReplyText('');
    if (selectedMessage) {
      selectedMessage.status = 'replied';
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  const toggleStar = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.starred = !message.starred;
      toast({
        title: message.starred ? 'Starred' : 'Unstarred',
        description: `Message ${message.starred ? 'added to' : 'removed from'} starred`,
      });
    }
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'dm': return <MessageCircle className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      case 'mention': return <AtSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'unread': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'read': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'replied': return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <Inbox className="w-6 h-6" />
            Social Inbox
          </h1>
          <p className="text-sm text-sfs-beige/70">
            All your messages from every platform in one place
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card p-3">
              <p className="text-xs text-sfs-beige/60">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <Card className="glass-card p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sfs-beige/40" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="glass-card p-4">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-sfs-brown/30">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {messages.filter(m => m.status === 'unread').length > 0 && (
                      <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1.5">
                        {messages.filter(m => m.status === 'unread').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="starred">⭐</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMessage?.id === message.id
                          ? 'bg-sfs-gold/20 border-sfs-gold/50'
                          : 'bg-sfs-brown/20 border-sfs-gold/10 hover:border-sfs-gold/30'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{message.platformIcon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-sfs-gold truncate">{message.from}</p>
                            {message.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-xs text-sfs-beige/80 line-clamp-2">{message.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(message.type)}
                          <span className="text-xs text-sfs-beige/50">{message.timestamp}</span>
                        </div>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="unread" className="mt-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {messages.filter(m => m.status === 'unread').map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMessage?.id === message.id
                          ? 'bg-sfs-gold/20 border-sfs-gold/50'
                          : 'bg-sfs-brown/20 border-sfs-gold/10 hover:border-sfs-gold/30'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{message.platformIcon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-sfs-gold truncate">{message.from}</p>
                          <p className="text-xs text-sfs-beige/80 line-clamp-2">{message.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(message.type)}
                          <span className="text-xs text-sfs-beige/50">{message.timestamp}</span>
                        </div>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="starred" className="mt-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {messages.filter(m => m.starred).map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMessage?.id === message.id
                          ? 'bg-sfs-gold/20 border-sfs-gold/50'
                          : 'bg-sfs-brown/20 border-sfs-gold/10 hover:border-sfs-gold/30'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{message.platformIcon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-sfs-gold truncate">{message.from}</p>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          </div>
                          <p className="text-xs text-sfs-beige/80 line-clamp-2">{message.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(message.type)}
                          <span className="text-xs text-sfs-beige/50">{message.timestamp}</span>
                        </div>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Message Detail & Reply */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="glass-card p-4">
                <div className="space-y-4">
                  {/* Message Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-sfs-gold/20">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedMessage.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-sfs-gold">{selectedMessage.from}</h3>
                          <span className="text-xl">{selectedMessage.platformIcon}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-sfs-beige/50" />
                          <span className="text-xs text-sfs-beige/50">{selectedMessage.timestamp}</span>
                          <Badge className={getStatusColor(selectedMessage.status)}>
                            {selectedMessage.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStar(selectedMessage.id)}
                    >
                      <Star className={`w-4 h-4 ${selectedMessage.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>

                  {/* Message Content */}
                  <div className="p-4 rounded-lg bg-sfs-brown/20 border border-sfs-gold/10">
                    <p className="text-sfs-beige">{selectedMessage.content}</p>
                  </div>

                  {/* AI Suggestions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <p className="text-sm font-semibold text-purple-400">AI-Powered Quick Replies</p>
                    </div>
                    <div className="grid gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleAISuggestion(suggestion)}
                          className="p-3 text-left rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all text-sm text-sfs-beige"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply Box */}
                  <div>
                    <label className="text-sm font-semibold text-sfs-gold mb-2 block">Your Reply</label>
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px] mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setReplyText('')}>
                        Clear
                      </Button>
                      <Button onClick={handleSendReply} className="gap-2">
                        <Send className="w-4 h-4" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="glass-card p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <Inbox className="w-16 h-16 text-sfs-gold/30 mx-auto mb-4" />
                  <p className="text-lg text-sfs-beige/50">Select a message to view and reply</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
