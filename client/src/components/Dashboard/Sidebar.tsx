import {
  Home, Sparkles, Calendar, BarChart3, Users, Settings,
  Zap, Trophy, Target, Bell, CreditCard, HelpCircle,
  FileText, Palette, Globe, Hash, Video, MessageSquare,
  TrendingUp, Shield, Layers, Bot, Gauge, BookOpen,
  Package, Code, Mail, Database, Link2, Share2, LucideIcon
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: string;
}

const sidebarSections: SidebarSection[] = [
  {
    title: "CORE",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: Sparkles, label: "AI Studio", path: "/ai-studio" },
      { icon: Calendar, label: "Content Calendar", path: "/calendar" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ]
  },
  {
    title: "CONTENT CREATION",
    items: [
      { icon: Bot, label: "AI Generator", path: "/ai/generator" },
      { icon: FileText, label: "Caption Writer", path: "/ai/captions" },
      { icon: Hash, label: "Hashtag Research", path: "/ai/hashtags" },
      { icon: Palette, label: "Design Studio", path: "/design" },
      { icon: Video, label: "Video Clipper", path: "/video/clipper" },
      { icon: Layers, label: "Content Repurpose", path: "/repurpose" },
      { icon: FileText, label: "Templates Library", path: "/templates" },
    ]
  },
  {
    title: "PUBLISHING",
    items: [
      { icon: Calendar, label: "Scheduler", path: "/scheduler" },
      { icon: Layers, label: "Queue Manager", path: "/queue" },
      { icon: Share2, label: "Bulk Publisher", path: "/bulk-publish" },
      { icon: Globe, label: "Cross-Posting", path: "/cross-post" },
      { icon: Link2, label: "Link in Bio", path: "/link-bio" },
    ]
  },
  {
    title: "SOCIAL ACCOUNTS",
    items: [
      { icon: Globe, label: "Facebook Pages", path: "/accounts/facebook" },
      { icon: Globe, label: "Instagram", path: "/accounts/instagram" },
      { icon: Globe, label: "Twitter/X", path: "/accounts/twitter" },
      { icon: Globe, label: "LinkedIn", path: "/accounts/linkedin" },
      { icon: Globe, label: "TikTok", path: "/accounts/tiktok" },
      { icon: Globe, label: "YouTube", path: "/accounts/youtube" },
      { icon: Globe, label: "Pinterest", path: "/accounts/pinterest" },
    ]
  },
  {
    title: "AUTOMATION",
    items: [
      { icon: Zap, label: "Auto-Responder", path: "/automation/responder" },
      { icon: MessageSquare, label: "DM Automation", path: "/automation/dms" },
      { icon: FileText, label: "RSS to Social", path: "/automation/rss" },
      { icon: Trophy, label: "Contest Runner", path: "/automation/contests" },
      { icon: Mail, label: "Email to Post", path: "/automation/email" },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { icon: Target, label: "Competitor Tracker", path: "/competitors" },
      { icon: TrendingUp, label: "Trend Predictor", path: "/trends" },
      { icon: Gauge, label: "Performance Score", path: "/performance" },
      { icon: BarChart3, label: "ROI Calculator", path: "/roi" },
      { icon: Bell, label: "Alerts & Insights", path: "/alerts" },
    ]
  },
  {
    title: "TEAM & CLIENTS",
    items: [
      { icon: Users, label: "Team Members", path: "/team" },
      { icon: Shield, label: "Permissions", path: "/team/permissions" },
      { icon: Package, label: "Client Workspaces", path: "/workspaces" },
      { icon: FileText, label: "Approval Flows", path: "/approvals" },
      { icon: FileText, label: "Reports", path: "/reports" },
    ]
  },
  {
    title: "GROWTH TOOLS",
    items: [
      { icon: Users, label: "Audience Builder", path: "/growth/audience" },
      { icon: TrendingUp, label: "Hashtag Sets", path: "/growth/hashtags" },
      { icon: Trophy, label: "Engagement Pods", path: "/growth/pods" },
      { icon: Target, label: "A/B Testing", path: "/growth/ab-test" },
    ]
  },
  {
    title: "SETTINGS",
    items: [
      { icon: Settings, label: "Profile", path: "/settings/profile" },
      { icon: CreditCard, label: "Billing", path: "/settings/billing" },
      { icon: Code, label: "API Keys", path: "/settings/api" },
      { icon: Database, label: "Data Export", path: "/settings/export" },
      { icon: Shield, label: "Security", path: "/settings/security" },
    ]
  },
  {
    title: "RESOURCES",
    items: [
      { icon: BookOpen, label: "Tutorial Hub", path: "/tutorials" },
      { icon: HelpCircle, label: "Help Center", path: "/help" },
      { icon: MessageSquare, label: "Community", path: "/community" },
      { icon: Mail, label: "Support", path: "/support" },
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300",
        "bg-sfs-brown/10 backdrop-blur-xl border-r border-sfs-gold/20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <ScrollArea className="h-full">
        {/* Logo Section */}
        <div className="p-4 border-b border-sfs-gold/20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-sfs-gold to-sfs-gold-hover rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-sfs-black" />
                  </div>
                  {!collapsed && (
                    <div>
                      <h1 className="text-sfs-gold font-bold text-sm">SFS PowerHouse</h1>
                      <p className="text-xs text-sfs-beige/60">Level 10 Mage</p>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>SmartFlow Systems - Level 10 Mage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <h2 className="text-xs font-semibold text-sfs-gold/60 mb-2 tracking-wider px-3">
                  {section.title}
                </h2>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;

                  const linkContent = (
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative overflow-hidden",
                        isActive
                          ? 'bg-sfs-gold/20 text-sfs-gold border-l-2 border-sfs-gold'
                          : 'text-sfs-beige/70 hover:text-sfs-gold hover:bg-sfs-gold/10',
                        collapsed && "justify-center"
                      )}
                    >
                      {/* Hover shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-sfs-gold/10 to-transparent" />

                      <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                      {!collapsed && (
                        <>
                          <span className="text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-sfs-gold text-sfs-black px-2 py-0.5 rounded-full font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <li key={itemIdx}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                    );
                  }

                  return <li key={itemIdx}>{linkContent}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sfs-gold/20 mt-auto">
            <div className="text-xs text-sfs-beige/40 text-center">
              <p className="font-semibold text-sfs-gold">SmartFlow Systems</p>
              <p>© 2025 boweazy</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Sidebar scrollbar styling */}
      <style>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: rgba(59, 47, 47, 0.1);
        }
        aside::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FFD700, #E6C200);
          border-radius: 3px;
        }
      `}</style>
    </aside>
  );
}
