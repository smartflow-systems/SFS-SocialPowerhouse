import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export default function Preferences() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Preferences
          </h1>
          <p className="text-muted-foreground">
            Customize your experience and app behavior
          </p>
        </div>

        {/* Appearance */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background">
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Show more content in less space
                </p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Language & Region</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Timezone</Label>
                <p className="text-sm text-muted-foreground">
                  Set your local timezone
                </p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background">
                <option>UTC (GMT+0)</option>
                <option>EST (GMT-5)</option>
                <option>PST (GMT-8)</option>
                <option>CET (GMT+1)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Date Format</Label>
                <p className="text-sm text-muted-foreground">
                  Choose how dates are displayed
                </p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Content Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save Drafts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save drafts while you work
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Default Post Privacy</Label>
                <p className="text-sm text-muted-foreground">
                  Default visibility for new posts
                </p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background">
                <option>Public</option>
                <option>Private</option>
                <option>Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable AI Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered content suggestions
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add extra security to your account
                </p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Share Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve by sharing anonymous usage data
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
