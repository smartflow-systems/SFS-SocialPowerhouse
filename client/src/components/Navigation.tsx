import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-sfs-black/95 backdrop-blur-md border-b border-sfs-gold/20 shadow-lg"
          : "bg-transparent"
      }`}
      data-testid="nav-main"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group" data-testid="link-logo">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-shadow">
              <Sparkles className="w-6 h-6 text-sfs-black" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              SFS Social<span className="text-sfs-gold">PowerHouse</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors text-sm font-medium" data-testid="link-nav-features">
              Features
            </a>
            <a href="#showcase" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors text-sm font-medium" data-testid="link-nav-showcase">
              How It Works
            </a>
            <a href="#pricing" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors text-sm font-medium" data-testid="link-nav-pricing">
              Pricing
            </a>
            <Link href="/chat" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors text-sm font-medium flex items-center gap-1.5" data-testid="link-nav-assistant">
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-sfs-beige hover:text-sfs-gold hover:bg-sfs-gold/10 font-medium"
                data-testid="button-login"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-6 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all"
                data-testid="button-start-trial"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-sfs-beige p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-sfs-black/98 border-t border-sfs-gold/20 px-4 py-6 space-y-4" data-testid="mobile-menu">
          <a href="#features" className="block text-sfs-beige/80 hover:text-sfs-gold py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#showcase" className="block text-sfs-beige/80 hover:text-sfs-gold py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#pricing" className="block text-sfs-beige/80 hover:text-sfs-gold py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Pricing</a>
          <Link href="/chat" className="block text-sfs-beige/80 hover:text-sfs-gold py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>AI Assistant</Link>
          <div className="flex flex-col gap-3 pt-4 border-t border-sfs-gold/20">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full border-sfs-gold/30 text-sfs-beige">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-sfs-gold text-sfs-black font-semibold">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
