import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: "forever",
    description: "Perfect for individuals getting started",
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    features: [
      "1 social account",
      "10 AI-generated posts/month",
      "Basic analytics",
      "Content calendar",
      "Email support",
    ],
    notIncluded: ["Team collaboration", "Advanced analytics", "Priority support"],
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 19,
    period: "/month",
    description: "For growing teams and serious brands",
    cta: "Start 14-Day Free Trial",
    ctaVariant: "default" as const,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "15 social accounts",
      "Unlimited AI-generated posts",
      "Advanced analytics & reporting",
      "Team collaboration (5 members)",
      "Priority support",
      "Custom brand voice training",
      "Hashtag research tools",
      "Smart scheduling optimization",
      "Social listening (100 keywords)",
      "Competitor intelligence",
    ],
  },
  {
    name: "Agency",
    monthlyPrice: 99,
    yearlyPrice: 69,
    period: "/month",
    description: "For agencies managing multiple clients",
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    features: [
      "Unlimited social accounts",
      "Unlimited AI posts",
      "Unlimited team members",
      "White-label reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SSO authentication",
      "SLA guarantee (99.9%)",
      "Advanced security controls",
    ],
  },
];

export default function PricingTeaser() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-sfs-brown/20 relative overflow-hidden" data-testid="section-pricing">
      <div className="absolute inset-0 circuit-bg opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-sfs-gold" />
            <span className="text-sm text-sfs-gold font-medium">Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" data-testid="text-pricing-heading">
            Invest in Growth, Not Overhead
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto mb-8" data-testid="text-pricing-subheading">
            One flat price. No hidden fees. No per-seat surprises. Cancel anytime.
          </p>

          <div className="inline-flex items-center gap-3 glass-card p-1 rounded-full" data-testid="toggle-billing">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-sfs-gold text-sfs-black" : "text-sfs-beige/60 hover:text-sfs-beige"
              }`}
              data-testid="button-billing-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? "bg-sfs-gold text-sfs-black" : "text-sfs-beige/60 hover:text-sfs-beige"
              }`}
              data-testid="button-billing-annual"
            >
              Annual
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card p-7 relative flex flex-col ${
                plan.highlighted
                  ? "border-2 border-sfs-gold ring-4 ring-sfs-gold/10 scale-[1.02]"
                  : ""
              }`}
              data-testid={`card-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sfs-gold to-yellow-400 text-sfs-black text-sm font-bold px-5 py-1.5 rounded-full shadow-lg" data-testid="badge-popular">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1" data-testid={`text-plan-name-${index}`}>
                  {plan.name}
                </h3>
                <p className="text-sm text-sfs-beige/60 mb-4" data-testid={`text-plan-description-${index}`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-sfs-gold" data-testid={`text-plan-price-${index}`}>
                    {plan.monthlyPrice === 0
                      ? "$0"
                      : annual
                      ? `$${plan.yearlyPrice}`
                      : `$${plan.monthlyPrice}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-sfs-beige/60 mb-1">/month</span>
                  )}
                </div>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-sfs-beige/50 mt-1">
                    Billed ${plan.yearlyPrice * 12}/year · Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                  </p>
                )}
                {!annual && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-sfs-beige/50 mt-1">Billed monthly</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3" data-testid={`list-item-feature-${index}-${fi}`}>
                    <div className="w-5 h-5 rounded-full bg-sfs-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-sfs-gold" />
                    </div>
                    <span className="text-sfs-beige/80 text-sm">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded?.map((feature, fi) => (
                  <li key={`not-${fi}`} className="flex items-start gap-3 opacity-40" data-testid={`list-item-excluded-${index}-${fi}`}>
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">—</span>
                    </div>
                    <span className="text-sfs-beige/60 text-sm line-through">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.name === "Agency" ? "/help" : "/register"}>
                <Button
                  className={`w-full gap-2 ${
                    plan.highlighted
                      ? "bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-bold"
                      : "border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10"
                  }`}
                  variant={plan.ctaVariant}
                  data-testid={`button-plan-${index}`}
                >
                  {plan.cta}
                  {plan.highlighted && <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sfs-beige/50 text-sm mb-6">
            All plans include 14-day money-back guarantee · No credit card required for Free plan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-sfs-beige/50">
            {["SOC2 Compliant", "GDPR Ready", "256-bit Encryption", "99.9% Uptime SLA"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sfs-gold/60" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
