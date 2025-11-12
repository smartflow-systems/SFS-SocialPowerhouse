import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'month' | 'week' | 'day';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;
  content: string;
  scheduledAt: Date;
  status: PostStatus;
  platforms: string[];
  aiGenerated: boolean;
}

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
};

export default function Calendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      // Convert date strings to Date objects
      const postsWithDates = data.posts.map((post: any) => ({
        ...post,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));
      setPosts(postsWithDates);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getPostsForDate = (date: number) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getDate() === date &&
        postDate.getMonth() === currentMonth &&
        postDate.getFullYear() === currentYear &&
        (filterPlatform === 'all' || post.platforms.includes(filterPlatform)) &&
        (filterStatus === 'all' || post.status === filterStatus)
      );
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 border border-border/30 rounded-lg bg-background/20" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDate(day);
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-border/30 rounded-lg p-2 transition-all hover:border-primary/40 cursor-pointer glass-card ${
            isToday ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="text-xs p-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {post.platforms.map((p) => (
                    <span key={p} className="text-xs">{PLATFORM_ICONS[p]}</span>
                  ))}
                </div>
                <div className="truncate text-foreground/80">{post.content}</div>
              </div>
            ))}
            {dayPosts.length > 2 && (
              <div className="text-xs text-primary font-semibold">
                +{dayPosts.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setIsSubmitting(true);

      // Get form data
      const content = formData.get('content') as string;
      const date = formData.get('date') as string;
      const time = formData.get('time') as string;
      const platformsChecked = formData.getAll('platforms') as string[];

      if (!content || !date || !time || platformsChecked.length === 0) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields and select at least one platform',
          variant: 'destructive',
        });
        return;
      }

      // Combine date and time into scheduledAt
      const scheduledAt = new Date(`${date}T${time}`);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          platforms: platformsChecked,
          scheduledAt: scheduledAt.toISOString(),
          status: 'scheduled',
          aiGenerated: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      toast({
        title: 'Post Scheduled!',
        description: 'Your post has been added to the calendar.',
      });

      setIsQuickAddOpen(false);
      // Refresh posts list
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      toast({
        title: 'Post Deleted',
        description: 'The post has been removed from your calendar.',
      });

      // Refresh posts list
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Content Calendar
            </h1>
            <p className="text-muted-foreground">
              Plan and schedule your social media posts
            </p>
          </div>

          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Quick Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Quick Add Post</DialogTitle>
                <DialogDescription>
                  Schedule a new post to your content calendar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleQuickAdd} className="space-y-4">
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="What do you want to share?"
                    className="mt-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" id="date" name="date" className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input type="time" id="time" name="time" className="mt-2" required />
                  </div>
                </div>
                <div>
                  <Label>Platforms</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
                      <label
                        key={platform}
                        className="flex items-center gap-2 p-2 border border-border rounded-lg cursor-pointer hover:bg-primary/10"
                      >
                        <input type="checkbox" name="platforms" value={platform} />
                        <span>{icon} {platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Post'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and View Controls */}
        <Card className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <List className="w-4 h-4 mr-2" />
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Day
              </Button>
            </div>

            <div className="flex gap-2">
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {Object.keys(PLATFORM_ICONS).map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {PLATFORM_ICONS[platform]} {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as PostStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card className="glass-card p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your calendar...</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'month' && (
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-primary text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </Card>
        )}

        {/* Upcoming Posts List */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Posts</h2>
          <div className="space-y-3">
            {posts
              .filter(post =>
                (filterPlatform === 'all' || post.platforms.includes(filterPlatform)) &&
                (filterStatus === 'all' || post.status === filterStatus)
              )
              .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
              .map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors glass-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={STATUS_COLORS[post.status]}>
                        {post.status}
                      </Badge>
                      {post.aiGenerated && (
                        <Badge variant="outline" className="border-primary/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {post.platforms.map((p) => (
                          <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-medium text-foreground mb-1">{post.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.scheduledAt.toLocaleString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
