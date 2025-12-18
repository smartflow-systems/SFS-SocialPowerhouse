import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Post } from '@shared/schema';

export default function ScheduledPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/posts', { status: 'scheduled' }],
    queryFn: async () => {
      const res = await fetch('/api/posts?status=scheduled', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch scheduled posts');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: 'Post deleted', description: 'Scheduled post has been deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete post', variant: 'destructive' });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await apiRequest('POST', `/api/posts/${postId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: 'Post published', description: 'Your post has been published successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to publish post', variant: 'destructive' });
    },
  });

  const scheduledPosts = data?.posts || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2" data-testid="heading-scheduled">
            <Clock className="w-8 h-8 text-primary" />
            Scheduled Posts
          </h1>
          <p className="text-muted-foreground">
            Manage your upcoming scheduled content
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scheduledPosts.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-4">
              Schedule your first post to see it here
            </p>
            <Button onClick={() => navigate('/posts/create')} data-testid="button-create-post">
              Create Post
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map((post) => (
              <Card key={post.id} className="glass-card p-4" data-testid={`card-scheduled-${post.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`text-content-${post.id}`}>
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span data-testid={`text-scheduled-time-${post.id}`}>
                        {post.scheduledAt
                          ? `Scheduled for ${format(new Date(post.scheduledAt), 'MMM dd, yyyy \'at\' h:mm a')}`
                          : 'No schedule set'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => publishMutation.mutate(post.id)}
                      disabled={publishMutation.isPending}
                      title="Publish now"
                      data-testid={`button-publish-${post.id}`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/posts/create?edit=${post.id}`)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(post.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
