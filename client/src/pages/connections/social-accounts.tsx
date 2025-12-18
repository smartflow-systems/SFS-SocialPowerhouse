import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, MoreVertical, Trash2, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiPinterest 
} from 'react-icons/si';

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  isActive: boolean;
  createdAt: Date;
}

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: SiFacebook, color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, color: 'bg-gradient-to-br from-purple-600 to-pink-500', textColor: 'text-white' },
  { id: 'twitter', name: 'Twitter/X', icon: SiX, color: 'bg-black dark:bg-white', textColor: 'text-white dark:text-black' },
  { id: 'linkedin', name: 'LinkedIn', icon: SiLinkedin, color: 'bg-blue-700', textColor: 'text-white' },
  { id: 'tiktok', name: 'TikTok', icon: SiTiktok, color: 'bg-black', textColor: 'text-white' },
  { id: 'youtube', name: 'YouTube', icon: SiYoutube, color: 'bg-red-600', textColor: 'text-white' },
  { id: 'pinterest', name: 'Pinterest', icon: SiPinterest, color: 'bg-red-700', textColor: 'text-white' },
];

const platformColors: Record<string, string> = {
  facebook: 'text-blue-600',
  instagram: 'text-pink-600',
  twitter: 'text-foreground',
  linkedin: 'text-blue-700',
  tiktok: 'text-foreground',
  youtube: 'text-red-600',
  pinterest: 'text-red-700',
};

export default function SocialAccounts() {
  const { toast } = useToast();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [manualConnectOpen, setManualConnectOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const { data: accountsData, isLoading } = useQuery<{ accounts: SocialAccount[] }>({
    queryKey: ['/api/social-accounts'],
  });

  const accounts = accountsData?.accounts || [];

  const connectMutation = useMutation({
    mutationFn: async (data: { platform: string; accountName: string; accountId: string; accessToken: string }) => {
      return await apiRequest('POST', '/api/social-accounts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
      toast({
        title: 'Account connected',
        description: 'Social account has been connected successfully',
      });
      setManualConnectOpen(false);
      setSelectedPlatform(null);
      setAccountName('');
      setAccountId('');
      setAccessToken('');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to connect account',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (data: { id: string; isActive: boolean }) => {
      return await apiRequest('PATCH', `/api/social-accounts/${data.id}`, { isActive: data.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
      toast({
        title: 'Account updated',
        description: 'Account status has been updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update account',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/social-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
      toast({
        title: 'Account disconnected',
        description: 'Social account has been disconnected successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to disconnect account',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleOAuthConnect = (platform: typeof platforms[0]) => {
    toast({
      title: 'OAuth Coming Soon',
      description: `Direct ${platform.name} integration is coming soon. For now, use manual connection.`,
    });
    setSelectedPlatform(platform);
    setConnectDialogOpen(false);
    setManualConnectOpen(true);
  };

  const handleManualConnect = () => {
    if (!selectedPlatform || !accountName || !accountId || !accessToken) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    connectMutation.mutate({ 
      platform: selectedPlatform.id, 
      accountName, 
      accountId, 
      accessToken 
    });
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.id === platformName.toLowerCase());
    if (platform) {
      const Icon = platform.icon;
      return <Icon className={`w-6 h-6 ${platformColors[platformName.toLowerCase()]}`} />;
    }
    return <Globe className="w-6 h-6" />;
  };

  const connectedPlatforms = accounts.map(a => a.platform.toLowerCase());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2" data-testid="heading-social-accounts">
              <Globe className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              Social Accounts
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Connect and manage your social media accounts
            </p>
          </div>
          
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black" data-testid="button-connect-account">
                <Plus className="w-4 h-4" />
                Connect Account
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-sfs-gold">Connect Social Account</DialogTitle>
                <DialogDescription>
                  Choose a platform to connect. OAuth integration coming soon!
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = connectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleOAuthConnect(platform)}
                      disabled={isConnected}
                      className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border transition-all ${
                        isConnected 
                          ? 'border-green-500/30 bg-green-500/5 cursor-not-allowed' 
                          : 'border-border/50 hover:border-sfs-gold/50 hover:bg-sfs-gold/5'
                      }`}
                      data-testid={`connect-platform-${platform.id}`}
                    >
                      {isConnected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${platform.textColor}`} />
                      </div>
                      <span className={`font-medium text-sm ${isConnected ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {platform.name}
                      </span>
                      {isConnected && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                          Connected
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={manualConnectOpen} onOpenChange={setManualConnectOpen}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlatform && (
                  <>
                    {(() => {
                      const Icon = selectedPlatform.icon;
                      return (
                        <div className={`w-8 h-8 rounded-lg ${selectedPlatform.color} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${selectedPlatform.textColor}`} />
                        </div>
                      );
                    })()}
                    Connect {selectedPlatform.name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Enter your account details to connect manually
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="@username or Page Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  data-testid="input-account-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  id="accountId"
                  placeholder="Platform-specific ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  data-testid="input-account-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="OAuth access token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  data-testid="input-access-token"
                />
                <p className="text-xs text-muted-foreground">
                  Note: OAuth integration coming soon. For now, enter tokens manually.
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setManualConnectOpen(false);
                  setSelectedPlatform(null);
                }}
                data-testid="button-cancel-connect"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualConnect}
                disabled={connectMutation.isPending}
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
                data-testid="button-save-connect"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Account'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="glass-card p-4 md:p-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="loading-accounts">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading social accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-accounts">
              <div className="w-16 h-16 rounded-full bg-sfs-gold/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-sfs-gold" />
              </div>
              <p className="font-semibold text-white mb-2">No social accounts connected</p>
              <p className="text-sm mb-6">Connect your first account to start posting across platforms</p>
              <Button 
                onClick={() => setConnectDialogOpen(true)}
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Account
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card
                  key={account.id}
                  className={`p-4 border transition-all ${
                    account.isActive 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-border/50 bg-background/50'
                  }`}
                  data-testid={`account-${account.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sfs-gold/10 flex items-center justify-center">
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <p className="font-semibold capitalize" data-testid={`account-platform-${account.id}`}>
                          {account.platform}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-[120px]" data-testid={`account-name-${account.id}`}>
                          {account.accountName}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-account-actions-${account.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleActiveMutation.mutate({ id: account.id, isActive: !account.isActive })}
                          data-testid={`action-toggle-${account.id}`}
                        >
                          {account.isActive ? (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4 mr-2" />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => disconnectMutation.mutate(account.id)}
                          className="text-destructive"
                          data-testid={`action-disconnect-${account.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isActive ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30" data-testid={`account-status-${account.id}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground" data-testid={`account-status-${account.id}`}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
