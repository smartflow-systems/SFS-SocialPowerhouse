import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Post } from '@shared/schema';

export default function Drafts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/posts', { status: 'draft' }],
    queryFn: async () => {
      const res = await fetch('/api/posts?status=draft', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch drafts');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: 'Draft deleted', description: 'Your draft has been deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete draft', variant: 'destructive' });
    },
  });

  const drafts = data?.posts || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2" data-testid="heading-drafts">
            <FileText className="w-8 h-8 text-primary" />
            Drafts
          </h1>
          <p className="text-muted-foreground">
            Continue working on your saved drafts
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : drafts.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a new post and save it as a draft
            </p>
            <Button onClick={() => navigate('/posts/create')} data-testid="button-create-post">
              Create Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="glass-card p-4" data-testid={`card-draft-${draft.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(draft.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${draft.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mb-3">
                  {draft.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="inline-block px-2 py-1 mr-1 mb-1 bg-primary/20 text-primary text-xs rounded-full"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-content-${draft.id}`}>
                  {draft.content}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Last edited {draft.updatedAt 
                    ? formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })
                    : 'recently'}
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate(`/posts/create?draft=${draft.id}`)}
                  data-testid={`button-edit-${draft.id}`}
                >
                  <Edit className="w-4 h-4" />
                  Continue Editing
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
