import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Check, Sparkles, Zap, Shield, ArrowRight, Crown } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'For individuals getting started',
    features: ['1 social account', '10 AI posts/month', 'Basic analytics', 'Content calendar'],
    current: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 19,
    description: 'For growing teams and serious brands',
    features: [
      '15 social accounts',
      'Unlimited AI posts',
      'Advanced analytics',
      'Team collaboration (5 members)',
      'Priority support',
      'Custom brand voice',
      'Hashtag research',
      'Smart scheduling',
    ],
    highlighted: true,
    current: true,
    badge: 'Current Plan',
  },
  {
    name: 'Agency',
    monthlyPrice: 99,
    yearlyPrice: 69,
    description: 'For agencies managing multiple clients',
    features: [
      'Unlimited accounts',
      'Unlimited AI posts',
      'Unlimited team members',
      'White-label reports',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    current: false,
  },
];

export default function Billing() {
  const [annual, setAnnual] = useState(true);
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: `Upgrading to ${planName}`,
      description: 'Redirecting to checkout...',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sfs-gold mb-1 flex items-center gap-3">
              <Crown className="w-8 h-8" />
              Billing & Plans
            </h1>
            <p className="text-muted-foreground">
              Manage your subscription, usage, and payment details
            </p>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 border border-sfs-gold/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-sfs-beige/80 font-medium">Pro Plan · Active</span>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'AI Posts Used', value: '47', limit: '∞', color: 'text-sfs-gold' },
            { label: 'Social Accounts', value: '3', limit: '15', color: 'text-blue-400' },
            { label: 'Team Members', value: '2', limit: '5', color: 'text-purple-400' },
            { label: 'Next Billing', value: 'Jan 15', limit: '2026', color: 'text-green-400' },
          ].map(({ label, value, limit, color }) => (
            <Card key={label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">/ {limit}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Plan Toggle */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sfs-gold" />
              Choose Your Plan
            </h2>
            <div className="flex items-center gap-2 glass-card p-1 rounded-full border border-sfs-gold/20">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !annual ? 'bg-sfs-gold text-sfs-black' : 'text-muted-foreground hover:text-white'
                }`}
                data-testid="button-billing-monthly"
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  annual ? 'bg-sfs-gold text-sfs-black' : 'text-muted-foreground hover:text-white'
                }`}
                data-testid="button-billing-annual"
              >
                Annual
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  -35%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-5 rounded-xl border transition-all ${
                  plan.highlighted
                    ? 'border-sfs-gold bg-sfs-gold/5 ring-2 ring-sfs-gold/20'
                    : 'border-border/40 bg-card/30 hover:border-sfs-gold/30'
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sfs-gold text-sfs-black font-bold text-xs px-3">
                    {plan.badge}
                  </Badge>
                )}

                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-sfs-gold">
                    {plan.monthlyPrice === 0 ? '$0' : annual ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground text-sm">/mo</span>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-sfs-gold flex-shrink-0" />
                      <span className="text-sfs-beige/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full gap-1 ${
                    plan.highlighted && !plan.current
                      ? 'bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-bold'
                      : ''
                  }`}
                  variant={plan.current ? 'outline' : plan.highlighted ? 'default' : 'outline'}
                  disabled={plan.current}
                  onClick={() => !plan.current && handleUpgrade(plan.name)}
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.current ? 'Current Plan' : plan.name === 'Agency' ? 'Contact Sales' : 'Upgrade'}
                  {!plan.current && plan.name !== 'Free' && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sfs-gold" />
            Payment Method
          </h2>
          <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-card/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-semibold text-white">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-sfs-gold/30 text-sfs-beige" data-testid="button-update-payment">
              Update
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-sfs-gold" />
            <span>Payments are secured with 256-bit encryption via Stripe</span>
          </div>
        </Card>

        {/* Billing History */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-sfs-gold" />
            Billing History
          </h2>
          <div className="space-y-2">
            {[
              { date: 'Dec 15, 2025', amount: '$19.00', plan: 'Pro (Annual)', status: 'Paid' },
              { date: 'Nov 15, 2025', amount: '$29.00', plan: 'Pro (Monthly)', status: 'Paid' },
              { date: 'Oct 15, 2025', amount: '$29.00', plan: 'Pro (Monthly)', status: 'Paid' },
            ].map((invoice, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-border/30 rounded-xl hover:border-sfs-gold/20 transition-colors"
                data-testid={`invoice-row-${i}`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-white text-sm">{invoice.plan}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    {invoice.status}
                  </Badge>
                  <span className="font-bold text-sfs-gold">{invoice.amount}</span>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sfs-beige/60 hover:text-sfs-beige" data-testid={`button-download-invoice-${i}`}>
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cancel/Danger Zone */}
        <Card className="glass-card p-6 border border-red-500/10">
          <h2 className="text-base font-semibold text-white mb-1">Cancel Subscription</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You'll keep access until your current billing cycle ends on Jan 15, 2026. After that, your account will switch to the Free plan.
          </p>
          <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid="button-cancel-subscription">
            Cancel Subscription
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
