import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Link2,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  followers?: number;
  lastSync?: Date;
};

const PLATFORM_CONFIG: Record<string, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    description: 'Connect your Facebook Pages and Groups',
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    description: 'Link your Instagram Business account',
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    description: 'Connect your Twitter/X account',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    description: 'Link your LinkedIn Profile or Company Page',
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    description: 'Connect your TikTok creator account',
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    description: 'Link your YouTube channel',
  },
  pinterest: {
    name: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    description: 'Connect your Pinterest Business account',
  },
};

export default function SocialAccounts() {
  const { toast } = useToast();

  // Mock data - in production would come from API
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'facebook',
      accountName: 'My Business Page',
      isActive: true,
      followers: 15234,
      lastSync: new Date(),
    },
    {
      id: '2',
      platform: 'instagram',
      accountName: '@mybusiness',
      isActive: true,
      followers: 8932,
      lastSync: new Date(),
    },
  ]);

  const connectedPlatforms = accounts.map(a => a.platform);
  const availablePlatforms = Object.keys(PLATFORM_CONFIG).filter(
    p => !connectedPlatforms.includes(p)
  );

  const handleConnect = (platform: string) => {
    toast({
      title: 'OAuth Connection',
      description: `Redirecting to ${PLATFORM_CONFIG[platform].name} for authorization...`,
    });

    // In production, this would redirect to OAuth flow
    // window.location.href = `/api/auth/${platform}`;
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId));
    toast({
      title: 'Account Disconnected',
      description: 'The social account has been removed',
    });
  };

  const handleRefresh = (accountId: string) => {
    toast({
      title: 'Refreshing',
      description: 'Syncing account data...',
    });

    // In production, would call API to refresh tokens and sync data
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Link2 className="w-8 h-8 text-primary" />
            Social Accounts
          </h1>
          <p className="text-muted-foreground">
            Connect and manage your social media accounts
          </p>
        </div>

        {/* Connected Accounts */}
        {accounts.length > 0 && (
          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              {accounts.map((account) => {
                const config = PLATFORM_CONFIG[account.platform];
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{config.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{config.name}</h3>
                          {account.isActive ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Disconnected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.accountName}</p>
                        {account.followers && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {account.followers.toLocaleString()} followers
                          </p>
                        )}
                        {account.lastSync && (
                          <p className="text-xs text-muted-foreground">
                            Last synced: {account.lastSync.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefresh(account.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Available Platforms */}
        {availablePlatforms.length > 0 && (
          <Card className="glass-card p-4">
            <h2 className="text-xl font-semibold mb-4">Connect More Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlatforms.map((platform) => {
                const config = PLATFORM_CONFIG[platform];
                return (
                  <div
                    key={platform}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{config.icon}</div>
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platform)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">{config.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Connect Your Accounts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Connect" to authorize SFS to post on your behalf using secure OAuth
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Automatic Publishing</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your scheduled posts will automatically publish to connected accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Track Performance</p>
                <p className="text-sm text-muted-foreground mt-1">
                  View analytics and engagement metrics in your Analytics Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-primary mb-1">🔒 Secure & Private</p>
            <p className="text-sm text-muted-foreground">
              We never store your passwords. All connections use secure OAuth authentication,
              and you can revoke access at any time.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
