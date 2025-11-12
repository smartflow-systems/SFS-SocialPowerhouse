import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export default function Notifications() {
  const notificationSettings = [
    {
      category: 'Posts',
      items: [
        { name: 'Post published successfully', email: true, push: true },
        { name: 'Post scheduled', email: true, push: false },
        { name: 'Post failed to publish', email: true, push: true },
      ],
    },
    {
      category: 'Engagement',
      items: [
        { name: 'New comment on post', email: true, push: true },
        { name: 'New follower milestone', email: true, push: true },
        { name: 'High engagement alert', email: false, push: true },
      ],
    },
    {
      category: 'Team',
      items: [
        { name: 'New team member joined', email: true, push: false },
        { name: 'Team member mentioned you', email: true, push: true },
        { name: 'Content approval request', email: true, push: true },
      ],
    },
    {
      category: 'Account',
      items: [
        { name: 'Security alert', email: true, push: true },
        { name: 'Billing updates', email: true, push: false },
        { name: 'Feature announcements', email: false, push: false },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground">
            Choose what notifications you want to receive
          </p>
        </div>

        {/* Notification Categories */}
        {notificationSettings.map((category) => (
          <Card key={category.category} className="glass-card p-4">
            <h2 className="text-lg font-semibold mb-4">{category.category}</h2>
            <div className="space-y-4">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.email}
                        className="rounded"
                      />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.push}
                        className="rounded"
                      />
                      <span className="text-sm">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
