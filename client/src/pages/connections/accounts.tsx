import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Plus, Check, X } from 'lucide-react';

export default function SocialAccounts() {
  const platforms = [
    { name: 'Facebook', connected: true, followers: '12.5K' },
    { name: 'Instagram', connected: true, followers: '8.2K' },
    { name: 'Twitter', connected: false, followers: '-' },
    { name: 'LinkedIn', connected: true, followers: '3.4K' },
    { name: 'TikTok', connected: false, followers: '-' },
    { name: 'YouTube', connected: false, followers: '-' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            Social Accounts
          </h1>
          <p className="text-muted-foreground">
            Connect and manage your social media accounts
          </p>
        </div>

        {/* Connected Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Card key={platform.name} className="glass-card p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">{platform.name}</h3>
                {platform.connected ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                    <Check className="w-3 h-3" />
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                    <X className="w-3 h-3" />
                    Not Connected
                  </div>
                )}
              </div>

              {platform.connected ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Followers: {platform.followers}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Manage
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
