import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Top Nav Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-sfs-gold/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
import { Sparkles } from "lucide-react";
import HamburgerMenu from "./HamburgerMenu";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-sfs-gold/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left section with hamburger and logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - visible on all screen sizes */}
            <HamburgerMenu />

            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-shadow">
                <Sparkles className="w-6 h-6 text-sfs-black" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                SFS-SocialPowerhouse
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
                Pricing
              </a>
              <a href="/dashboard" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
                Dashboard
              </a>
              <Button 
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-6 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-sfs-gold p-2"
              onClick={() => setSidebarOpen(true)}
              <span className="text-xl font-bold text-white hidden sm:inline">
                SFS-SocialPowerhouse
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
              Pricing
            </a>
            <a href="/dashboard" className="text-sfs-beige/80 hover:text-sfs-gold transition-colors">
              Dashboard
            </a>
            <Button
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-6 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-sfs-black/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Slides from LEFT */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-80 z-[70] md:hidden
          glass-card border-r border-sfs-gold/20
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-sfs-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-sfs-black" />
            </div>
            <span className="text-lg font-bold text-white">SFS Social</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-sfs-gold hover:text-sfs-gold-hover"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="p-6 space-y-4">
          <a 
            href="#features" 
            className="block text-sfs-beige/80 hover:text-sfs-gold hover:bg-sfs-gold/10 px-4 py-3 rounded-lg transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            Features
          </a>
          <a 
            href="#pricing" 
            className="block text-sfs-beige/80 hover:text-sfs-gold hover:bg-sfs-gold/10 px-4 py-3 rounded-lg transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            Pricing
          </a>
          <a 
            href="/dashboard" 
            className="block text-sfs-beige/80 hover:text-sfs-gold hover:bg-sfs-gold/10 px-4 py-3 rounded-lg transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            Dashboard
          </a>
          
          <div className="pt-4">
            <Button 
              className="w-full bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              onClick={() => setSidebarOpen(false)}
            >
              Start Free Trial
          {/* Mobile CTA */}
          <div className="md:hidden">
            <Button
              className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black font-semibold px-4 py-2 text-sm shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              Trial
            </Button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sfs-gold/20">
          <p className="text-xs text-sfs-beige/40 text-center">
            SmartFlow Systems © 2025
          </p>
        </div>
      </aside>
    </>
      </div>
    </nav>
  );
}
