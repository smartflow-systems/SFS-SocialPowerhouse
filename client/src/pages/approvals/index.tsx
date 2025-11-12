import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Send,
  Loader2,
  User,
  Calendar,
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  aiGenerated: boolean;
  createdAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  comment: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
  } | null;
}

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  changes_requested: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function Approvals() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

  const fetchPendingPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts?status=pending_approval', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      const postsWithDates = data.posts.map((post: any) => ({
        ...post,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
        createdAt: new Date(post.createdAt),
        approvedAt: post.approvedAt ? new Date(post.approvedAt) : null,
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

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      const commentsWithDates = data.comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      }));
      setComments(commentsWithDates);
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to approve post');
      }

      toast({
        title: 'Post Approved',
        description: 'The post has been approved and moved to scheduled.',
      });

      // Refresh the list
      fetchPendingPosts();
      setSelectedPost(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve post',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/posts/${selectedPost.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject post');
      }

      toast({
        title: 'Post Rejected',
        description: 'The post has been rejected and moved back to draft.',
      });

      setIsRejectDialogOpen(false);
      setRejectionReason('');
      fetchPendingPosts();
      setSelectedPost(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject post',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return;

    try {
      setIsCommenting(true);
      const response = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ comment: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      setComments([...comments, {
        ...data.comment,
        createdAt: new Date(data.comment.createdAt),
      }]);
      setNewComment('');

      toast({
        title: 'Comment Added',
        description: 'Your feedback has been added to the post.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-primary" />
            Approval Workflows
          </h1>
          <p className="text-muted-foreground">
            Review and approve posts from your team members
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card className="glass-card p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading pending approvals...</p>
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no posts waiting for approval.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="glass-card p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={APPROVAL_STATUS_COLORS[post.approvalStatus || 'pending']}>
                        <Clock className="w-3 h-3 mr-1" />
                        {post.approvalStatus || 'pending'}
                      </Badge>
                      <div className="flex gap-1">
                        {post.platforms.map((p) => (
                          <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-lg font-medium mb-3 text-foreground">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.scheduledAt ?
                            post.scheduledAt.toLocaleString('default', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'No schedule'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Created {post.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(post.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsRejectDialogOpen(true);
                      }}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Comment Dialog */}
        <Dialog open={!!selectedPost && !isRejectDialogOpen} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post Discussion</DialogTitle>
              <DialogDescription>
                Add feedback or questions about this post
              </DialogDescription>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-4">
                {/* Post Content */}
                <div className="p-4 border border-border rounded-lg bg-background/50">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPost.platforms.map((p) => (
                      <span key={p} className="text-lg">{PLATFORM_ICONS[p]}</span>
                    ))}
                  </div>
                  <p className="text-foreground">{selectedPost.content}</p>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Comments ({comments.length})</h4>
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Be the first to add feedback!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 border border-border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.user?.name || comment.user?.username || 'Unknown User'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt.toLocaleString('default', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add your feedback or questions..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isCommenting}
                      className="flex-1"
                    >
                      {isCommenting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Reject Post</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this post
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Explain what needs to be changed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
