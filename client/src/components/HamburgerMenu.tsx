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
    ]
  },
  {
    title: "CONTENT CREATION",
    items: [
      { id: "ai-generator", label: "AI Generator", href: "/ai/generator", icon: Bot },
      { id: "captions", label: "Caption Writer", href: "/ai/captions", icon: FileText },
      { id: "hashtags", label: "Hashtag Research", href: "/ai/hashtags", icon: Hash },
      { id: "design", label: "Design Studio", href: "/design", icon: Palette },
      { id: "video", label: "Video Clipper", href: "/video/clipper", icon: Video },
      { id: "repurpose", label: "Content Repurpose", href: "/repurpose", icon: Layers },
      { id: "templates", label: "Templates Library", href: "/templates", icon: FileText },
    ]
  },
  {
    title: "PUBLISHING",
    items: [
      { id: "scheduler", label: "Scheduler", href: "/scheduler", icon: Calendar },
      { id: "queue", label: "Queue Manager", href: "/queue", icon: Layers },
      { id: "bulk-publish", label: "Bulk Publisher", href: "/bulk-publish", icon: Share2 },
      { id: "cross-post", label: "Cross-Posting", href: "/cross-post", icon: Globe },
      { id: "link-bio", label: "Link in Bio", href: "/link-bio", icon: Link2 },
    ]
  },
  {
    title: "SOCIAL ACCOUNTS",
    items: [
      { id: "facebook", label: "Facebook Pages", href: "/accounts/facebook", icon: Globe },
      { id: "instagram", label: "Instagram", href: "/accounts/instagram", icon: Globe },
      { id: "twitter", label: "Twitter/X", href: "/accounts/twitter", icon: Globe },
      { id: "linkedin", label: "LinkedIn", href: "/accounts/linkedin", icon: Globe },
      { id: "tiktok", label: "TikTok", href: "/accounts/tiktok", icon: Globe },
      { id: "youtube", label: "YouTube", href: "/accounts/youtube", icon: Globe },
      { id: "pinterest", label: "Pinterest", href: "/accounts/pinterest", icon: Globe },
    ]
  },
  {
    title: "AUTOMATION",
    items: [
      { id: "responder", label: "Auto-Responder", href: "/automation/responder", icon: Zap },
      { id: "dms", label: "DM Automation", href: "/automation/dms", icon: MessageSquare },
      { id: "rss", label: "RSS to Social", href: "/automation/rss", icon: FileText },
      { id: "contests", label: "Contest Runner", href: "/automation/contests", icon: Trophy },
      { id: "email", label: "Email to Post", href: "/automation/email", icon: Mail },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { id: "competitors", label: "Competitor Tracker", href: "/competitors", icon: Target },
      { id: "trends", label: "Trend Predictor", href: "/trends", icon: TrendingUp },
      { id: "performance", label: "Performance Score", href: "/performance", icon: Gauge },
      { id: "roi", label: "ROI Calculator", href: "/roi", icon: BarChart3 },
      { id: "alerts", label: "Alerts & Insights", href: "/alerts", icon: Bell },
    ]
  },
  {
    title: "TEAM & CLIENTS",
    items: [
      { id: "team", label: "Team Members", href: "/team", icon: Users },
      { id: "permissions", label: "Permissions", href: "/team/permissions", icon: Shield },
      { id: "workspaces", label: "Client Workspaces", href: "/workspaces", icon: Package },
      { id: "approvals", label: "Approval Flows", href: "/approvals", icon: FileText },
      { id: "reports", label: "Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    title: "GROWTH TOOLS",
    items: [
      { id: "audience", label: "Audience Builder", href: "/growth/audience", icon: Users },
      { id: "hashtag-sets", label: "Hashtag Sets", href: "/growth/hashtags", icon: TrendingUp },
      { id: "pods", label: "Engagement Pods", href: "/growth/pods", icon: Trophy },
      { id: "ab-test", label: "A/B Testing", href: "/growth/ab-test", icon: Target },
    ]
  },
  {
    title: "SETTINGS",
    items: [
      { id: "profile", label: "Profile", href: "/settings/profile", icon: Settings },
      { id: "billing", label: "Billing", href: "/settings/billing", icon: CreditCard },
      { id: "api", label: "API Keys", href: "/settings/api", icon: Code },
      { id: "export", label: "Data Export", href: "/settings/export", icon: Database },
      { id: "security", label: "Security", href: "/settings/security", icon: Shield },
    ]
  },
  {
    title: "RESOURCES",
    items: [
      { id: "tutorials", label: "Tutorial Hub", href: "/tutorials", icon: BookOpen },
      { id: "help", label: "Help Center", href: "/help", icon: HelpCircle },
      { id: "community", label: "Community", href: "/community", icon: MessageSquare },
      { id: "support", label: "Support", href: "/support", icon: Mail },
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
                      >
                        <a
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
                            active
                              ? "bg-sfs-gold/20 text-sfs-gold border-l-2 border-sfs-gold"
                              : "text-sfs-beige/70 hover:bg-sfs-gold/10 hover:text-sfs-gold"
                          )}
                        >
                          {/* Hover shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-sfs-gold/10 to-transparent" />

                          <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-sfs-gold" : "")} />
                          <span className="font-medium text-sm relative z-10">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-sfs-gold text-sfs-black px-2 py-0.5 rounded-full font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </a>
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
