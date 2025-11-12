import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout, Search, Plus } from 'lucide-react';

export default function Templates() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
              <Layout className="w-8 h-8 text-primary" />
              Templates
            </h1>
            <p className="text-muted-foreground">
              Browse and use pre-made content templates
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        {/* Search */}
        <Card className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" />
          </div>
        </Card>

        {/* Template Categories */}
        <div className="space-y-4">
          {['Social Media Posts', 'Stories', 'Promotional', 'Educational'].map((category) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-card p-4">
                    <div className="aspect-video bg-accent/50 rounded-lg mb-3 flex items-center justify-center">
                      <Layout className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Template {i}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perfect for {category.toLowerCase()}
                    </p>
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
