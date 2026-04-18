import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageSquare, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0 bg-gradient-to-br from-sfs-gold/20 via-sfs-brown/40 to-sfs-black" />
      <div className="absolute inset-0 circuit-bg opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sfs-gold/15 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-sfs-gold" />
          <span className="text-sm text-sfs-gold font-medium">Join 5,000+ Marketers</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" data-testid="text-cta-heading">
          Ready to 10x Your<br className="hidden md:block" />
          <span className="bg-gradient-to-r from-sfs-gold via-yellow-300 to-sfs-gold bg-clip-text text-transparent">
            Social Media Results?
          </span>
        </h2>

        <p className="text-lg md:text-xl text-sfs-beige/80 mb-10 max-w-2xl mx-auto" data-testid="text-cta-description">
          Start your free trial today. No credit card. No commitments. 
          Just AI-powered social media that actually works.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-bold px-10 py-6 rounded-full shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:shadow-[0_0_60px_rgba(255,215,0,0.7)] transition-all text-base gap-2"
              data-testid="button-cta-start"
            >
              Start Free Trial — No Card Needed
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              size="lg"
              variant="outline"
              className="border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10 px-8 py-6 rounded-full backdrop-blur-sm text-base gap-2"
              data-testid="button-cta-assistant"
            >
              <MessageSquare className="w-5 h-5" />
              Try the AI Assistant
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
          {[
            { icon: Sparkles, text: "14-day money-back guarantee" },
            { icon: Calendar, text: "Full access to all features" },
            { icon: MessageSquare, text: "Dedicated onboarding support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2 text-sfs-beige/60">
              <Icon className="w-4 h-4 text-sfs-gold" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
