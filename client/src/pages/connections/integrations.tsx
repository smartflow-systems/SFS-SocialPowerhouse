import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    { name: 'Zapier', description: 'Connect 5000+ apps', connected: false },
    { name: 'Google Analytics', description: 'Track your performance', connected: true },
    { name: 'Canva', description: 'Design content easily', connected: false },
    { name: 'Dropbox', description: 'Cloud storage for media', connected: false },
    { name: 'Slack', description: 'Team notifications', connected: true },
    { name: 'Make.com', description: 'Automation workflows', connected: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            Integrations
          </h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and services
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.name} className="glass-card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                {integration.connected && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                    Connected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>
              {integration.connected ? (
                <Button variant="outline" className="w-full">
                  Manage
                </Button>
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
