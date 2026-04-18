import { 
  Sparkles, Calendar, BarChart3, Users, CalendarDays, 
  Lightbulb, Zap, Eye, Globe, TrendingUp, Shield, Headphones
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "GPT-4 powered content creation in 10+ brand tones. Generate a week of posts in minutes — not hours.",
    badge: "Most Used",
    href: "/ai-studio",
    color: "from-yellow-500 to-sfs-gold",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI picks the optimal posting times for your audience. Schedule once and publish automatically across all platforms.",
    badge: null,
    href: "/posts/create",
    color: "from-blue-500 to-blue-400",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track engagement, follower growth, and ROI across every platform from a single command center.",
    badge: null,
    href: "/analytics",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-user workspaces with approval workflows, role-based permissions, and real-time collaboration.",
    badge: null,
    href: "/connections/team",
    color: "from-purple-500 to-violet-400",
  },
  {
    icon: Eye,
    title: "Social Listening",
    description: "Monitor brand mentions, track competitors, and catch every conversation that matters to your business.",
    badge: "New",
    href: "/social-listening",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: Zap,
    title: "Automation Rules",
    description: "Set it and forget it. Build powerful automation workflows that handle repetitive tasks 24/7.",
    badge: null,
    href: "/automation",
    color: "from-orange-500 to-amber-400",
  },
  {
    icon: TrendingUp,
    title: "Growth Tools",
    description: "Hashtag research, best time predictions, competitor analysis, and viral content suggestions.",
    badge: null,
    href: "/growth-tools",
    color: "from-cyan-500 to-teal-400",
  },
  {
    icon: Globe,
    title: "Multi-Platform Publishing",
    description: "Facebook, Instagram, X, LinkedIn, TikTok, YouTube, and Pinterest — all from one dashboard.",
    badge: null,
    href: "/connections/social-accounts",
    color: "from-indigo-500 to-blue-400",
  },
  {
    icon: Lightbulb,
    title: "Content Templates",
    description: "100+ professional templates for every use case. Customize with AI and publish in seconds.",
    badge: null,
    href: "/templates",
    color: "from-sfs-gold to-yellow-300",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-sfs-black relative overflow-hidden">
      <div className="absolute inset-0 circuit-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-sfs-gold" />
            <span className="text-sm text-sfs-gold font-medium">Everything Included</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" data-testid="text-features-heading">
            One Platform. Infinite Possibilities.
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto" data-testid="text-features-subheading">
            Replace 6+ tools with one AI-powered platform built for teams that want results, not complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                data-testid={`link-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="glass-card p-6 group hover-elevate cursor-pointer h-full relative overflow-hidden">
                  {feature.badge && (
                    <span className="absolute top-4 right-4 bg-sfs-gold text-sfs-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-sfs-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-sfs-beige/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant. Your data stays yours." },
            { icon: Headphones, title: "Priority Support", desc: "Real humans, real fast. 24/7 coverage." },
            { icon: Zap, title: "99.9% Uptime SLA", desc: "Rock-solid reliability when it matters." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 glass-card p-4">
              <div className="w-10 h-10 rounded-lg bg-sfs-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-sfs-gold" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-sfs-beige/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
