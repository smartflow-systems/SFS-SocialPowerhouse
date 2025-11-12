import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Camera } from 'lucide-react';

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <User className="w-8 h-8 text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Picture */}
          <Card className="glass-card p-4">
            <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-primary" />
              </div>
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
            </div>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card p-4">
              <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="johndoe" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="mt-2 min-h-24"
                  />
                </div>

                <div className="pt-4">
                  <Button className="w-full md:w-auto">Save Changes</Button>
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="glass-card p-4 mt-6">
              <h2 className="text-lg font-semibold mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                  />
                </div>
                <Button className="w-full md:w-auto">Update Password</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
