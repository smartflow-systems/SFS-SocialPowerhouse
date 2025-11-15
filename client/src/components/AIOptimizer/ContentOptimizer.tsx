import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Hash,
  TrendingUp,
  Clock,
  Smile,
  Meh,
  Frown,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentOptimizerProps {
  initialContent?: string;
  platform?: string;
  tone?: string;
  onOptimizedContent?: (content: string, hashtags: string[]) => void;
}

export default function ContentOptimizer({
  initialContent = '',
  platform = 'instagram',
  tone = 'professional',
  onOptimizedContent
}: ContentOptimizerProps) {
  const [content, setContent] = useState(initialContent);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) return;

    setOptimizing(true);
    try {
      const res = await fetch('/api/ai/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, platform, tone })
      });

      if (!res.ok) throw new Error('Optimization failed');

      const data = await res.json();
      setOptimized(data);

      if (onOptimizedContent) {
        onOptimizedContent(data.optimized, data.hashtags);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const copyOptimizedContent = () => {
    const textToCopy = `${optimized.optimized}\n\n${optimized.hashtags.map((h: string) => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card className="sfs-glass-card">
        <h3 className="text-lg font-semibold text-sfs-gold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Content Optimizer
        </h3>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Write your ${platform} content here...`}
          className="min-h-[120px] bg-sf-black/40 border-sf-gold/20 text-foreground resize-none"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{content.length} characters</span>
            {platform === 'twitter' && (
              <span className={cn(
                content.length > 280 && 'text-red-500 font-semibold'
              )}>
                {280 - content.length} remaining
              </span>
            )}
          </div>

          <Button
            onClick={handleOptimize}
            disabled={!content.trim() || optimizing}
            className="btn-gold"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {optimized && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Optimized Content */}
          <Card className="sfs-flow-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sfs-gold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Optimized Content
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyOptimizedContent}
                className="text-sf-gold hover:text-sf-gold-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-foreground whitespace-pre-wrap">
              {optimized.optimized}
            </p>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engagement Score */}
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sf-gold/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-sf-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagement Score</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(optimized.engagementScore))}>
                    {optimized.engagementScore}/10
                  </p>
                </div>
              </div>
            </Card>

            {/* Sentiment */}
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sf-gold/10 flex items-center justify-center">
                  {getSentimentIcon(optimized.sentiment)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sentiment</p>
                  <p className="text-lg font-semibold capitalize text-foreground">
                    {optimized.sentiment}
                  </p>
                </div>
              </div>
            </Card>

            {/* Hashtag Count */}
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sf-gold/10 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-sf-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hashtags</p>
                  <p className="text-2xl font-bold text-sf-gold">
                    {optimized.hashtags.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Suggested Hashtags */}
          <Card className="sfs-glass-card">
            <h4 className="font-semibold text-sfs-gold mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Trending Hashtags
            </h4>
            <div className="flex flex-wrap gap-2">
              {optimized.hashtags.map((tag: string) => (
                <span
                  key={tag}
                  className="badge text-xs px-3 py-1 cursor-pointer hover:bg-sf-gold/20 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(`#${tag}`);
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Card>

          {/* Suggestions */}
          {optimized.suggestions && optimized.suggestions.length > 0 && (
            <Card className="sfs-glass-card">
              <h4 className="font-semibold text-sfs-gold mb-3">💡 Suggestions</h4>
              <ul className="space-y-2">
                {optimized.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
