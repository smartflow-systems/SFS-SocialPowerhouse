import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, MoreVertical } from 'lucide-react';

export default function TeamMembers() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Team Members
            </h1>
            <p className="text-muted-foreground">
              Manage your team and their permissions
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </div>

        {/* Team List */}
        <Card className="glass-card p-4">
          <div className="space-y-4">
            {[
              { name: 'You', email: 'you@example.com', role: 'Owner', avatar: null },
              { name: 'Team Member 1', email: 'member1@example.com', role: 'Admin', avatar: null },
              { name: 'Team Member 2', email: 'member2@example.com', role: 'Editor', avatar: null },
              { name: 'Team Member 3', email: 'member3@example.com', role: 'Viewer', avatar: null },
            ].map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent text-sm rounded-full">
                    {member.role}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Invitations */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium">pending{i}@example.com</p>
                  <p className="text-sm text-muted-foreground">Invited 2 days ago</p>
                </div>
                <Button variant="outline" size="sm">
                  Resend
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
