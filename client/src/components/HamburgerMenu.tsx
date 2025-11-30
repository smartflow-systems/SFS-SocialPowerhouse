/**
 * SFS-SocialPowerhouse Hamburger Menu
 *
 * Comprehensive slide-in sidebar navigation menu for mobile and all screen sizes
 * Includes all features from the dashboard sidebar in an organized format
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Home, Sparkles, Calendar, BarChart3, Users, Settings,
  Zap, Trophy, Target, Bell, CreditCard, HelpCircle,
  FileText, Palette, Globe, Hash, Video, MessageSquare,
  TrendingUp, Shield, Layers, Bot, Gauge, BookOpen,
  Package, Code, Mail, Database, Link2, Share2, LogOut,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "CORE",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      { id: "ai-studio", label: "AI Studio", href: "/ai-studio", icon: Sparkles },
      { id: "calendar", label: "Content Calendar", href: "/calendar", icon: Calendar },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
      { id: "posts", label: "Posts", href: "/posts", icon: FileText },
      { id: "scheduler", label: "Scheduler", href: "/scheduler", icon: Calendar },
    ]
  },
  {
    title: "CONTENT & TOOLS",
    items: [
      { id: "ai-generator", label: "AI Generator", href: "/ai/generator", icon: Bot },
      { id: "templates", label: "Templates", href: "/templates", icon: FileText },
      { id: "content-library", label: "Content Library", href: "/content-library", icon: Palette },
      { id: "ai-visual", label: "Visual Creator", href: "/ai-visual-creator", icon: Palette },
    ]
  },
  {
    title: "ENGAGEMENT",
    items: [
      { id: "social-inbox", label: "Social Inbox", href: "/social-inbox", icon: Mail },
      { id: "social-listening", label: "Social Listening", href: "/social-listening", icon: Gauge },
      { id: "live-dashboard", label: "Live Dashboard", href: "/live-dashboard", icon: TrendingUp },
      { id: "competitor", label: "Competitor Intel", href: "/competitor-intelligence", icon: Target },
    ]
  },
  {
    title: "CONNECTIONS",
    items: [
      { id: "social-accounts", label: "Social Accounts", href: "/connections/social-accounts", icon: Globe },
      { id: "integrations", label: "Integrations", href: "/connections/integrations", icon: Layers },
      { id: "automation", label: "Automation", href: "/connections/automation", icon: Zap },
      { id: "alerts", label: "Alerts", href: "/connections/alerts", icon: Bell },
    ]
  },
  {
    title: "TEAM & WORKSPACE",
    items: [
      { id: "team", label: "Team Members", href: "/team", icon: Users },
      { id: "team-members", label: "Team Collaboration", href: "/connections/team", icon: Users },
      { id: "approvals", label: "Approval Flows", href: "/approvals", icon: FileText },
      { id: "accounts", label: "Accounts", href: "/accounts", icon: Shield },
    ]
  },
  {
    title: "GROWTH",
    items: [
      { id: "growth-tools", label: "Growth Tools", href: "/growth-tools", icon: Trophy },
      { id: "automation-rules", label: "Automation Rules", href: "/automation", icon: Zap },
    ]
  },
  {
    title: "SETTINGS",
    items: [
      { id: "profile", label: "Profile", href: "/settings/profile", icon: Settings },
      { id: "billing", label: "Billing", href: "/settings/billing", icon: CreditCard },
      { id: "notifications", label: "Notifications", href: "/settings/notifications", icon: Bell },
      { id: "preferences", label: "Preferences", href: "/settings/preferences", icon: Palette },
    ]
  },
  {
    title: "RESOURCES",
    items: [
      { id: "help", label: "Help Center", href: "/help", icon: HelpCircle },
    ]
  }
];

interface HamburgerMenuProps {
  className?: string;
}

export default function HamburgerMenu({ className }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href || location.startsWith(href + "/");
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 text-sfs-gold hover:text-sfs-gold-hover transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-sfs-gold rounded-md",
          "backdrop-blur-sm",
          className
        )}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 z-50",
          "bg-sfs-brown/95 backdrop-blur-xl border-r border-sfs-gold/30",
          "transform transition-transform duration-300 ease-in-out",
          "shadow-2xl shadow-sfs-gold/10",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sfs-gold/20 bg-gradient-to-r from-sfs-brown to-sfs-brown/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sfs-gold to-sfs-gold-hover rounded-lg flex items-center justify-center shadow-lg shadow-sfs-gold/30">
              <Sparkles className="w-6 h-6 text-sfs-black" />
            </div>
            <div>
              <h1 className="text-sfs-gold font-bold text-sm">SFS PowerHouse</h1>
              <p className="text-xs text-sfs-beige/60">Social Media Mastery</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-sfs-gold/70 hover:text-sfs-gold transition-colors rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Sections */}
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="py-4">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
                <div className="px-4 mb-2">
                  <h3 className="text-sfs-gold/60 text-xs font-bold uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1 px-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
                          active
                            ? "bg-sfs-gold/20 text-sfs-gold border-l-2 border-sfs-gold"
                            : "text-sfs-beige/70 hover:bg-sfs-gold/10 hover:text-sfs-gold"
                        )}
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-sfs-gold/10 to-transparent" />
                        <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-sfs-gold" : "")} />
                        <span className="font-medium text-sm relative z-10">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-sfs-gold text-sfs-black px-2 py-0.5 rounded-full font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sfs-gold/20 bg-gradient-to-r from-sfs-brown to-sfs-brown/80">
          <div className="text-xs text-sfs-beige/40 text-center">
            <p className="font-semibold text-sfs-gold">SmartFlow Systems</p>
            <p>© 2025 boweazy</p>
          </div>
        </div>
      </div>
    </>
  );
}
