import { Bell, CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/Glass/GlassCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'trend';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Post Published',
    message: 'Your post "10 Social Media Tips" went live on Facebook',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    type: 'trend',
    title: 'Trending Hashtag',
    message: '#SocialMediaMarketing is trending in your niche',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Engagement',
    message: 'Your last 3 posts have 40% lower engagement than average',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Best Time to Post',
    message: 'Your audience is most active between 2-4 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
  },
];

const iconMap = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  trend: TrendingUp,
};

const colorMap = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  trend: 'text-sfs-gold',
};

export default function NotificationPanel() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sfs-gold" />
          <h2 className="text-lg font-semibold text-sfs-gold">Notifications</h2>
        </div>
        <Badge variant="secondary" className="bg-sfs-gold/20 text-sfs-gold">
          {mockNotifications.filter(n => !n.read).length} new
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {mockNotifications.map((notification) => {
            const Icon = iconMap[notification.type];
            return (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  notification.read
                    ? 'border-sfs-gold/10 bg-sfs-brown/5'
                    : 'border-sfs-gold/30 bg-sfs-gold/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorMap[notification.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-sfs-beige">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-sfs-gold rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-sfs-beige/60 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-sfs-gold/40 mt-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
