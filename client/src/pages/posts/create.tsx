import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { PenSquare, Send, Calendar, Save, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';

const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
  scheduledAt: z.date().optional(),
  aiGenerated: z.boolean().default(false),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

const AVAILABLE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function CreatePost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      platforms: [],
      status: 'draft',
      aiGenerated: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const res = await apiRequest('POST', '/api/posts', data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      const messages = {
        draft: { title: 'Draft saved', description: 'Your draft has been saved successfully' },
        scheduled: { title: 'Post scheduled', description: 'Your post has been scheduled successfully' },
        published: { title: 'Post published', description: 'Your post has been published successfully' },
      };
      const message = messages[variables.status];
      toast({ title: message.title, description: message.description });
      form.reset();
      setScheduleDate('');
      setScheduleTime('');
      if (variables.status === 'published') {
        navigate('/posts');
      } else if (variables.status === 'scheduled') {
        navigate('/posts/scheduled');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save post',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitStatus = (status: 'draft' | 'published' | 'scheduled') => {
    if (status === 'scheduled') {
      if (!scheduleDate || !scheduleTime) {
        toast({
          title: 'Schedule required',
          description: 'Please select a date and time to schedule your post',
          variant: 'destructive',
        });
        return;
      }
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledAt <= new Date()) {
        toast({
          title: 'Invalid schedule',
          description: 'Scheduled time must be in the future',
          variant: 'destructive',
        });
        return;
      }
      form.setValue('scheduledAt', scheduledAt);
    }
    form.setValue('status', status);
    form.handleSubmit((data) => {
      createPostMutation.mutate(data);
    })();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2" data-testid="heading-create-post">
            <PenSquare className="w-8 h-8 text-primary" />
            Create Post
          </h1>
          <p className="text-muted-foreground">
            Create and publish content across all your platforms
          </p>
        </div>

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card p-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What's on your mind?"
                          className="mt-2 min-h-48"
                          data-testid="input-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="glass-card p-4">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="border border-border rounded-lg p-4 min-h-32">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {form.watch('content') || 'Preview will appear here...'}
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="glass-card p-4">
                <h2 className="text-lg font-semibold mb-4">Platforms</h2>
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2">
                        {AVAILABLE_PLATFORMS.map((platform) => (
                          <FormField
                            key={platform.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(platform.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, platform.id]);
                                      } else {
                                        field.onChange(current.filter((v) => v !== platform.id));
                                      }
                                    }}
                                    data-testid={`checkbox-platform-${platform.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <span>{platform.icon}</span>
                                  {platform.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="glass-card p-4">
                <h2 className="text-lg font-semibold mb-4">Schedule</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-1"
                      data-testid="input-schedule-date"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1"
                      data-testid="input-schedule-time"
                    />
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmitStatus('draft')}
                    disabled={createPostMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    {createPostMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmitStatus('scheduled')}
                    disabled={createPostMutation.isPending}
                    data-testid="button-schedule"
                  >
                    {createPostMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    Schedule Post
                  </Button>
                  <Button
                    type="button"
                    className="w-full bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
                    onClick={() => handleSubmitStatus('published')}
                    disabled={createPostMutation.isPending}
                    data-testid="button-publish"
                  >
                    {createPostMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Publish Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Form>
      </div>
    </DashboardLayout>
  );
}
