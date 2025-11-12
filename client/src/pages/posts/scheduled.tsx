import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2 } from 'lucide-react';

export default function ScheduledPosts() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Clock className="w-8 h-8 text-primary" />
            Scheduled Posts
          </h1>
          <p className="text-muted-foreground">
            Manage your upcoming scheduled content
          </p>
        </div>

        {/* Scheduled Posts List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      Facebook
                    </span>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      Instagram
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">Scheduled post title {i}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Scheduled for Nov 15, 2025 at 2:00 PM</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
