import { Sparkles, Calendar, BarChart3, Users, CalendarDays, Lightbulb } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Generate engaging posts tailored to your brand voice and audience in seconds",
    href: "/ai-studio"
  },
  {
    icon: Calendar,
    title: "Multi-Platform Scheduling",
    description: "Schedule and publish content across all major social platforms from one dashboard",
    href: "/posts/create"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance metrics and gain insights to optimize your social strategy",
    href: "/analytics"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with approval workflows and role-based permissions",
    href: "/connections/team"
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description: "Visualize your posting schedule and maintain consistent content flow",
    href: "/calendar"
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description: "Get AI-powered recommendations for best posting times and content ideas",
    href: "/ai-studio"
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-sfs-black relative overflow-hidden">
      {/* Circuit background faded */}
      <div className="absolute inset-0 circuit-bg opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Everything You Need to Dominate Social
          </h2>
          <p className="text-sm text-sfs-beige/70">
            Powerful features designed for modern marketers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                data-testid={`link-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="glass-card p-6 group hover:scale-[1.01] transition-transform duration-300 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center mb-4 group-hover:shadow-sm transition-shadow">
                    <Icon className="w-6 h-6 text-sfs-black" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-sfs-beige/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
