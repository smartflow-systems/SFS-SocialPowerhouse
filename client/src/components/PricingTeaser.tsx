import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "wouter";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 social account",
      "10 AI-generated posts/month",
      "Basic analytics",
      "Email support",
      "Content calendar"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams and businesses",
    features: [
      "Unlimited social accounts",
      "Unlimited AI-generated posts",
      "Advanced analytics & reporting",
      "Team collaboration (5 members)",
      "Priority support",
      "Custom brand voice training",
      "Hashtag research tools",
      "Scheduling optimization"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For agencies and large teams",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SSO authentication",
      "SLA guarantee"
    ]
  }
];

export default function PricingTeaser() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-sfs-brown/20 relative overflow-hidden" data-testid="section-pricing">
      <div className="absolute inset-0 circuit-bg opacity-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-sfs-gold" />
            <span className="text-sm text-sfs-gold font-medium">Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-pricing-heading">
            Start Growing Your Social Presence
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto" data-testid="text-pricing-subheading">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`glass-card p-6 relative ${
                plan.highlighted 
                  ? 'border-2 border-sfs-gold ring-2 ring-sfs-gold/20' 
                  : ''
              }`}
              data-testid={`card-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sfs-gold to-sfs-gold-hover text-sfs-black text-sm font-semibold px-4 py-1 rounded-full" data-testid="badge-popular">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2" data-testid={`text-plan-name-${index}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-sfs-gold" data-testid={`text-plan-price-${index}`}>{plan.price}</span>
                <span className="text-sfs-beige/60">{plan.period}</span>
              </div>
              <p className="text-sfs-beige/70 mb-6" data-testid={`text-plan-description-${index}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-start gap-3" 
                    data-testid={`list-item-feature-${index}-${featureIndex}`}
                  >
                    <Check className="w-5 h-5 text-sfs-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sfs-beige/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black' 
                      : 'border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10'
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  data-testid={`button-plan-${index}`}
                >
                  {plan.name === "Free" ? "Get Started Free" : plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sfs-beige/50 text-sm mt-8">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}
