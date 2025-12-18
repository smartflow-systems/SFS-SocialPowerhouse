import { Users, Calendar, TrendingUp, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Active Users",
    description: "Marketers trust us daily"
  },
  {
    icon: Calendar,
    value: "2M+",
    label: "Posts Scheduled",
    description: "Content published worldwide"
  },
  {
    icon: TrendingUp,
    value: "300%",
    label: "Avg. Engagement Boost",
    description: "Compared to manual posting"
  },
  {
    icon: Sparkles,
    value: "50M+",
    label: "AI-Generated Posts",
    description: "Created with our AI tools"
  }
];

export default function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-sfs-black relative overflow-hidden" data-testid="section-stats">
      <div className="absolute inset-0 circuit-bg opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" data-testid="text-stats-heading">
            Trusted by Thousands of Marketers
          </h2>
          <p className="text-sfs-beige/70 max-w-xl mx-auto" data-testid="text-stats-subheading">
            Join the growing community of professionals who rely on SFS Social PowerHouse
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 text-center group hover:scale-[1.02] transition-transform duration-300"
                data-testid={`stat-card-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow">
                  <Icon className="w-6 h-6 text-sfs-black" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-sfs-gold mb-1" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-white font-semibold mb-1" data-testid={`stat-label-${index}`}>
                  {stat.label}
                </div>
                <div className="text-xs text-sfs-beige/60" data-testid={`stat-description-${index}`}>
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
