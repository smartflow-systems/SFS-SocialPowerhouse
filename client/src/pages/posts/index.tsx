import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { FileText, Edit, Trash2, Calendar, Globe } from 'lucide-react';
import { Link } from 'wouter';
import type { Post } from '@shared/schema';

export default function PostsList() {
  const { data: postsData, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/posts'],
  });

  const posts = postsData?.posts || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2" data-testid="heading-posts">
              <FileText className="w-8 h-8 text-primary" />
              All Posts
            </h1>
            <p className="text-muted-foreground">
              Manage your content across all platforms
            </p>
          </div>
          <Link href="/posts/create">
            <Button data-testid="button-create-post">Create Post</Button>
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4" data-testid="text-no-posts">
                No posts yet. Create your first post to get started!
              </p>
              <Link href="/posts/create">
                <Button data-testid="button-create-first-post">Create Your First Post</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            post.status === 'published' ? 'default' :
                            post.status === 'scheduled' ? 'secondary' :
                            'outline'
                          }
                          data-testid={`badge-status-${post.id}`}
                        >
                          {post.status}
                        </Badge>
                        {post.aiGenerated && (
                          <Badge variant="outline" data-testid={`badge-ai-${post.id}`}>
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg" data-testid={`text-content-${post.id}`}>
                        {post.content.substring(0, 100)}
                        {post.content.length > 100 && '...'}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" data-testid={`button-edit-${post.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-${post.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span data-testid={`text-platforms-${post.id}`}>
                        {post.platforms?.length || 0} platform(s)
                      </span>
                    </div>
                    {post.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span data-testid={`text-scheduled-${post.id}`}>
                          {new Date(post.scheduledAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {post.tone && (
                      <span className="capitalize" data-testid={`text-tone-${post.id}`}>
                        Tone: {post.tone}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
