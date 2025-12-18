import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";
import DemoModal from "./DemoModal";

export default function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden circuit-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-sfs-gold rounded-full animate-pulse" />
        <div className="absolute top-[25%] right-[20%] w-1 h-1 bg-sfs-gold rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-sfs-gold rounded-full animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-[60%] right-[30%] w-1 h-1 bg-sfs-gold rounded-full animate-pulse" style={{animationDelay: '1.5s'}} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-sfs-gold/10 border border-sfs-gold/30 rounded-full px-4 py-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sfs-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sfs-gold"></span>
          </span>
          <span className="text-sm text-sfs-gold font-medium">New: AI-Powered Content Optimization</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
          AI-Powered Social Media<br />Management Made Simple
        </h1>
        <p className="text-base md:text-lg text-sfs-beige/80 mb-8 max-w-2xl mx-auto">
          Create engaging content, schedule posts across platforms, and grow your audience with intelligent AI assistance. Save hours every week.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/register">
            <Button 
              size="lg"
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              data-testid="button-hero-start"
            >
              Get Started Free
            </Button>
          </Link>
          <Button 
            size="lg"
            variant="outline" 
            className="border-sfs-gold/40 text-sfs-beige hover:bg-sfs-gold/10 px-8 py-6 rounded-full backdrop-blur-sm"
            onClick={() => setIsDemoOpen(true)}
            data-testid="button-hero-demo"
          >
            <Play className="w-4 h-4 mr-2" />
            Watch Demo
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-sfs-beige/60">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sfs-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sfs-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>10 free AI posts/month</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sfs-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
