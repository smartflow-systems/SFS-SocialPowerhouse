import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Check } from 'lucide-react';

export default function Billing() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Plan */}
        <Card className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Plan: Starter</h2>
              <p className="text-muted-foreground mb-4">
                Your current billing cycle ends on Dec 15, 2025
              </p>
              <div className="flex gap-2">
                <Button>Upgrade Plan</Button>
                <Button variant="outline">Cancel Subscription</Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sfs-gold">$29</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
          </div>
        </Card>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: 29, features: ['5 Social Accounts', '50 Posts/month', 'Basic Analytics'] },
            { name: 'Professional', price: 79, features: ['15 Social Accounts', '200 Posts/month', 'Advanced Analytics', 'Team Collaboration'] },
            { name: 'Enterprise', price: 199, features: ['Unlimited Accounts', 'Unlimited Posts', 'Custom Analytics', 'Priority Support'] },
          ].map((plan) => (
            <Card key={plan.name} className="glass-card p-4">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-sfs-gold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.name === 'Starter' ? 'outline' : 'default'}
                className="w-full"
              >
                {plan.name === 'Starter' ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Payment Method */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </Card>

        {/* Billing History */}
        <Card className="glass-card p-4">
          <h2 className="text-lg font-semibold mb-4">Billing History</h2>
          <div className="space-y-3">
            {[
              { date: 'Nov 15, 2025', amount: '$29.00', status: 'Paid' },
              { date: 'Oct 15, 2025', amount: '$29.00', status: 'Paid' },
              { date: 'Sep 15, 2025', amount: '$29.00', status: 'Paid' },
            ].map((invoice, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground">{invoice.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{invoice.amount}</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
