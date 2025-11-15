import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSchedulerProps {
  platform: string;
  onSelectTime?: (date: Date) => void;
}

export default function SmartScheduler({ platform, onSelectTime }: SmartSchedulerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['best-times', platform],
    queryFn: async () => {
      const res = await fetch(`/api/ai/best-times/${platform}?count=7`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch best times');
      return res.json();
    },
    enabled: !!platform
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const dateNum = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });

    return { day, time, date: `${month} ${dateNum}` };
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'bg-green-500';
    if (score >= 7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (isLoading) {
    return (
      <Card className="sfs-glass-card">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-sf-brown/20 rounded w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-sf-brown/20 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  const { suggestions } = data || {};

  return (
    <Card className="sfs-flow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-sfs-gold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Best Times to Post
        </h3>
        <span className="badge text-xs">AI-Powered</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Schedule your post at these optimal times for maximum engagement on{' '}
        <span className="text-sfs-gold capitalize font-medium">{platform}</span>
      </p>

      <div className="space-y-2">
        {suggestions?.map((suggestion: any, idx: number) => {
          const { day, time, date } = formatDate(suggestion.date);

          return (
            <div
              key={idx}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer',
                'bg-sf-brown/10 border-sf-gold/20 hover:border-sf-gold/40 hover:bg-sf-brown/20',
                idx === 0 && 'border-sf-gold/50 bg-sf-gold/5'
              )}
              onClick={() => onSelectTime?.(new Date(suggestion.date))}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-sf-black/40">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <span className="text-sm font-bold text-sfs-gold">{date.split(' ')[1]}</span>
                </div>

                <div>
                  <p className="font-medium text-foreground">{time}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Score visualization */}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-sf-gold" />
                  <span className="text-sm font-bold text-sfs-gold">
                    {suggestion.score.toFixed(1)}
                  </span>
                </div>

                {idx === 0 && (
                  <span className="badge text-xs bg-sf-gold text-sf-black border-0">
                    Best
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform insights */}
      <div className="mt-4 p-3 rounded-lg bg-sf-gold/5 border border-sf-gold/20">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-sf-gold mt-0.5" />
          <div className="flex-1 text-xs text-muted-foreground">
            <span className="text-sfs-gold font-medium">Pro Tip:</span> Posts published during these
            times typically see{' '}
            <span className="text-sfs-gold font-medium">3-5x higher engagement</span> compared to
            off-peak hours.
          </div>
        </div>
      </div>
    </Card>
  );
}
