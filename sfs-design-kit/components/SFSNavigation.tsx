/**
 * SFS Design Kit - Navigation Component
 * 
 * A header navigation bar with SFS branding and hamburger menu.
 * 
 * Usage:
 * import SFSNavigation from 'sfs-design-kit/components/SFSNavigation';
 * 
 * const menuItems = [
 *   { label: "Dashboard", href: "/dashboard" },
 *   { label: "Settings", href: "/settings" },
 * ];
 * 
 * <SFSNavigation 
 *   menuItems={menuItems}
 *   appName="My SFS App"
 *   navLinks={[
 *     { label: "Features", href: "#features" },
 *     { label: "Pricing", href: "#pricing" },
 *   ]}
 * />
 */

import { Sparkles } from "lucide-react";
import SFSHamburgerMenu, { MenuItem } from "./SFSHamburgerMenu";
import GoldenButton from "./GoldenButton";

interface NavLink {
  label: string;
  href: string;
}

interface SFSNavigationProps {
  menuItems: MenuItem[];
  appName?: string;
  navLinks?: NavLink[];
  ctaText?: string;
  ctaHref?: string;
  showCta?: boolean;
}

export default function SFSNavigation({
  menuItems,
  appName = "SFS-SocialPowerhouse",
  navLinks = [],
  ctaText = "Start Free Trial",
  ctaHref = "/auth/login",
  showCta = true,
}: SFSNavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-sfs-gold/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <SFSHamburgerMenu menuItems={menuItems} appName={appName} />
            
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-shadow">
                <Sparkles className="w-6 h-6 text-sfs-black" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">
                {appName}
              </span>
            </a>
          </div>

          {/* Right: Nav Links + CTA */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sfs-beige/80 hover:text-sfs-gold transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
            {showCta && (
              <a href={ctaHref}>
                <GoldenButton>{ctaText}</GoldenButton>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
