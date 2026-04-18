import { Users, Zap, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Active Professionals",
    description: "Agencies, brands & marketers",
    color: "from-blue-500 to-blue-400",
  },
  {
    icon: Zap,
    value: "50M+",
    label: "AI Posts Generated",
    description: "Content created with our AI",
    color: "from-sfs-gold to-yellow-400",
  },
  {
    icon: TrendingUp,
    value: "300%",
    label: "Avg. Engagement Boost",
    description: "Compared to manual posting",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Clock,
    value: "10hrs",
    label: "Saved Per Week",
    description: "Per team member, on average",
    color: "from-purple-500 to-violet-400",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] relative overflow-hidden border-y border-sfs-gold/10" data-testid="section-stats">
      <div className="absolute inset-0 circuit-bg opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group"
                data-testid={`stat-card-${index}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-sfs-gold mb-1" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-white font-semibold mb-1 text-sm" data-testid={`stat-label-${index}`}>
                  {stat.label}
                </div>
                <div className="text-xs text-sfs-beige/50" data-testid={`stat-description-${index}`}>
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sfs-beige/40 text-sm">
            Trusted by marketing teams at startups, agencies, and Fortune 500 companies worldwide
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-sfs-gold/10 border border-sfs-gold/20 flex items-center justify-center">
                <span className="text-sfs-gold text-xs font-bold">{String.fromCharCode(65 + i)}</span>
              </div>
            ))}
            <span className="text-sfs-beige/40 text-xs ml-2">+4,995 more professionals</span>
          </div>
        </div>
      </div>
    </section>
  );
}
