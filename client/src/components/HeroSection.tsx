import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { SiFacebook, SiInstagram, SiX, SiLinkedin, SiTiktok, SiYoutube } from "react-icons/si";
import DemoModal from "./DemoModal";

export default function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden circuit-bg pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-sfs-gold/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-sfs-gold/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-sfs-brown/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[80px] bg-gradient-to-b from-sfs-gold/60 to-transparent animate-shooting-star"
            style={{
              top: `${10 + i * 10}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-8" data-testid="badge-hero-announcement">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sfs-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sfs-gold" />
          </span>
          <span className="text-sm text-sfs-gold font-medium">Trusted by 5,000+ Marketing Professionals</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="heading-hero">
          The AI-Powered Social Media{" "}
          <span className="bg-gradient-to-r from-sfs-gold via-yellow-300 to-sfs-gold bg-clip-text text-transparent">
            Powerhouse
          </span>{" "}
          for Serious Brands
        </h1>

        <p className="text-lg md:text-xl text-sfs-beige/80 mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-description">
          Create stunning content, schedule across every platform, and grow your audience 10x faster — all powered by GPT-4 AI. 
          Stop juggling tools. Start dominating your market.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-bold px-10 py-6 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:shadow-[0_0_50px_rgba(255,215,0,0.6)] transition-all text-base gap-2"
              data-testid="button-hero-start"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10 px-8 py-6 rounded-full backdrop-blur-sm text-base gap-2"
            onClick={() => setIsDemoOpen(true)}
            data-testid="button-hero-demo"
          >
            <Play className="w-5 h-5 fill-sfs-gold text-sfs-gold" />
            Watch 2-Min Demo
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-sfs-beige/60">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sfs-gold" />
            <span>Setup in under 5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sfs-gold" />
            <span>Enterprise-grade security</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sfs-gold" />
            <span>Save 10+ hours per week</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-sfs-beige/40 uppercase tracking-widest mb-4 font-medium">Publish to all major platforms</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { Icon: SiFacebook, label: "Facebook", color: "text-blue-400" },
              { Icon: SiInstagram, label: "Instagram", color: "text-pink-400" },
              { Icon: SiX, label: "X / Twitter", color: "text-white" },
              { Icon: SiLinkedin, label: "LinkedIn", color: "text-blue-500" },
              { Icon: SiTiktok, label: "TikTok", color: "text-white" },
              { Icon: SiYoutube, label: "YouTube", color: "text-red-400" },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 glass-card px-4 py-2" title={label}>
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm text-sfs-beige/70 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: "5K+", label: "Active Users" },
            { value: "300%", label: "Avg. Engagement Lift" },
            { value: "10hrs", label: "Saved Per Week" },
          ].map(({ value, label }) => (
            <div key={label} className="glass-card p-4 text-center" data-testid={`stat-mini-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              <p className="text-2xl font-bold text-sfs-gold">{value}</p>
              <p className="text-xs text-sfs-beige/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
