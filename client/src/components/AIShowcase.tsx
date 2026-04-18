import { Check, MessageSquare, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import contentGenImage from "@assets/generated_images/AI_content_generator_interface_51501057.png";
import analyticsImage from "@assets/generated_images/Analytics_dashboard_interface_1315b702.png";

const showcases = [
  {
    image: contentGenImage,
    badge: "AI Content Studio",
    title: "Write Better Content in Seconds, Not Hours",
    description: "Our GPT-4 powered AI understands your brand voice, audience, and platform. Get platform-specific posts, captions, hashtags, and CTAs — all at once.",
    features: [
      "10 tone variations — professional, casual, witty, and more",
      "Platform-specific optimization for every channel",
      "One-click hashtag research and suggestions",
      "AI repurpose: turn one post into 7 platform versions",
    ],
    cta: "Try AI Studio",
    href: "/ai-studio",
  },
  {
    image: analyticsImage,
    badge: "Analytics & Insights",
    title: "Know Exactly What's Working and Why",
    description: "Stop guessing. Get real-time performance data, audience insights, and AI-powered recommendations that tell you exactly what to post next.",
    features: [
      "Unified analytics across all connected platforms",
      "Engagement rate, reach, impressions, and click tracking",
      "AI-powered content performance predictions",
      "Automated weekly reports delivered to your inbox",
    ],
    cta: "View Analytics",
    href: "/analytics",
  },
];

export default function AIShowcase() {
  return (
    <section id="showcase" className="py-16 md:py-24 bg-sfs-black relative overflow-hidden" data-testid="section-showcase">
      <div className="absolute inset-0 circuit-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-sfs-gold" />
            <span className="text-sm text-sfs-gold font-medium">Powered by GPT-4</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" data-testid="text-showcase-heading">
            See It in Action
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto" data-testid="text-showcase-subheading">
            Real tools that real marketers use every day to save time and grow faster.
          </p>
        </div>

        <div className="space-y-24">
          {showcases.map((showcase, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
              data-testid={`showcase-item-${index}`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-sfs-gold/10 rounded-2xl blur-xl" />
                  <img
                    src={showcase.image}
                    alt={showcase.title}
                    className="relative rounded-xl border border-sfs-gold/20 shadow-2xl w-full"
                    data-testid={`image-showcase-${index}`}
                  />
                  <div className="absolute -bottom-4 -right-4 glass-card px-4 py-2 border border-sfs-gold/30 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-sfs-beige/80 font-medium">Live & Active</span>
                  </div>
                </div>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <span className="inline-block bg-sfs-gold/10 border border-sfs-gold/30 text-sfs-gold text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {showcase.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" data-testid={`text-showcase-title-${index}`}>
                  {showcase.title}
                </h3>
                <p className="text-sfs-beige/70 mb-6 leading-relaxed" data-testid={`text-showcase-description-${index}`}>
                  {showcase.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {showcase.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-3"
                      data-testid={`list-item-feature-${index}-${featureIndex}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-sfs-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-sfs-gold" />
                      </div>
                      <span className="text-sfs-beige/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={showcase.href}>
                  <Button className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold gap-2" data-testid={`button-showcase-cta-${index}`}>
                    {showcase.cta}
                    <Zap className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: MessageSquare, value: "50M+", label: "AI Posts Generated", sub: "and counting" },
            { icon: BarChart3, value: "300%", label: "Average Engagement Boost", sub: "vs. manual posting" },
            { icon: Zap, value: "< 30s", label: "Time to Generate Content", sub: "per post" },
          ].map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="glass-card p-6 border border-sfs-gold/20">
              <Icon className="w-8 h-8 text-sfs-gold mx-auto mb-3" />
              <p className="text-4xl font-bold text-sfs-gold">{value}</p>
              <p className="font-semibold text-white mt-1">{label}</p>
              <p className="text-sm text-sfs-beige/50 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
