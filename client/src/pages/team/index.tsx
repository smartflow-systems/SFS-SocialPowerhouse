import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt?: Date;
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['All permissions', 'Delete team', 'Manage billing'],
  admin: ['Manage members', 'Edit content', 'Publish posts', 'View analytics'],
  editor: ['Create content', 'Edit drafts', 'Schedule posts'],
  viewer: ['View content', 'View analytics'],
};

export default function Team() {
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('editor');

  // Mock data
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@company.com',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(2024, 0, 1),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date(2024, 1, 15),
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'editor',
      status: 'pending',
    },
  ]);

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as any,
      status: 'pending',
    };

    setMembers([...members, newMember]);
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteRole('editor');

    toast({
      title: 'Invitation Sent',
      description: `An invite has been sent to ${inviteEmail}`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
    toast({
      title: 'Member Removed',
      description: 'The team member has been removed',
    });
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(members.map(m =>
      m.id === memberId ? { ...m, role: newRole as any } : m
    ));
    toast({
      title: 'Role Updated',
      description: 'Team member role has been changed',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'admin': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'editor': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'viewer': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Team
            </h1>
            <p className="text-muted-foreground">
              Manage your team members and permissions
            </p>
          </div>

          <Button onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Team Members */}
        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold mb-4">Team Members ({members.length})</h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                    {member.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge variant="secondary" className={getRoleBadgeColor(member.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {member.role}
                      </Badge>
                      {member.status === 'pending' && (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {member.email}
                      {member.joinedAt && (
                        <span className="text-xs">
                          • Joined {member.joinedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.role !== 'owner' && (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Roles & Permissions */}
        <Card className="glass-card p-4">
          <h2 className="text-xl font-semibold mb-4">Roles & Permissions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role} className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold capitalize">{role}</h3>
                </div>

                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-600" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                {inviteRole && ROLE_PERMISSIONS[inviteRole] && (
                  <div className="mt-3 p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-2">Permissions:</p>
                    <ul className="space-y-1">
                      {ROLE_PERMISSIONS[inviteRole].map((perm, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-2">
                <Button onClick={handleInvite} className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
