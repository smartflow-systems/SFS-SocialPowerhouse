import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0 bg-gradient-to-br from-sfs-gold/20 to-sfs-gold-hover/10" />
      <div className="absolute inset-0 circuit-bg opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-sfs-gold" />
          <span className="text-sm text-sfs-gold font-medium">Start Free Today</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-cta-heading">
          Ready to Transform Your <br className="hidden md:block" />
          Social Media Strategy?
        </h2>
        
        <p className="text-lg text-sfs-beige/80 mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
          Join thousands of marketers who are saving time, increasing engagement, 
          and growing their audience with AI-powered social media management.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button 
              size="lg"
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all gap-2"
              data-testid="button-cta-start"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              size="lg"
              variant="outline" 
              className="border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10 px-8 py-6 rounded-full backdrop-blur-sm"
              data-testid="button-cta-demo"
            >
              View Demo Dashboard
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-sfs-beige/50 mt-6" data-testid="text-cta-note">
          No credit card required. Free forever with up to 10 AI posts per month.
        </p>
      </div>
    </section>
  );
}
