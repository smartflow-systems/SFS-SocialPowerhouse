import { TrendingUp, TrendingDown, Users, Calendar, Zap, BarChart3 } from 'lucide-react';
import GlassCard from '@/components/Glass/GlassCard';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <GlassCard hover className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sfs-beige/60 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-sfs-gold mt-2">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sfs-beige/40 text-sm ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-sfs-gold/20 rounded-lg text-sfs-gold">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

export default function StatsGrid() {
  const stats = [
    {
      title: 'Total Posts',
      value: '1,234',
      change: 12.5,
      trend: 'up' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: 'Total Engagement',
      value: '45.2K',
      change: 8.3,
      trend: 'up' as const,
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: 'Followers',
      value: '23.5K',
      change: 15.2,
      trend: 'up' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Avg. Engagement Rate',
      value: '3.8%',
      change: -2.1,
      trend: 'down' as const,
      icon: <BarChart3 className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
}
