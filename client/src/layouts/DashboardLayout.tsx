import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home, Sparkles, Calendar, BarChart3, Users, Settings,
  Zap, Bell, CreditCard, HelpCircle, FileText, Globe, 
  CheckCircle, Activity, TrendingUp, Inbox, Ear, Target, 
  Wand2, Menu, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Activity, label: "Live Dashboard", path: "/live-dashboard" },
  { icon: Inbox, label: "Social Inbox", path: "/social-inbox" },
  { icon: Sparkles, label: "AI Studio", path: "/ai-studio" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const contentItems = [
  { icon: Sparkles, label: "AI Generator", path: "/ai/generator" },
  { icon: Wand2, label: "Visual Creator", path: "/ai-visual-creator" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Calendar, label: "Scheduler", path: "/scheduler" },
];

const accountsItems = [
  { icon: Globe, label: "Social Accounts", path: "/connections/social-accounts" },
  { icon: TrendingUp, label: "Growth Tools", path: "/growth-tools" },
  { icon: Ear, label: "Social Listening", path: "/social-listening" },
  { icon: Target, label: "Competitors", path: "/competitor-intelligence" },
  { icon: Zap, label: "Automation", path: "/automation" },
  { icon: Bell, label: "Alerts", path: "/connections/alerts" },
];

const settingsItems = [
  { icon: Users, label: "Team", path: "/connections/team" },
  { icon: CheckCircle, label: "Approvals", path: "/approvals" },
  { icon: Settings, label: "Settings", path: "/settings/preferences" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

function NavSection({ title, items, location, collapsed }: { 
  title: string; 
  items: typeof mainItems; 
  location: string;
  collapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sfs-beige/50 uppercase tracking-wider hover:text-sfs-gold transition-colors"
      >
        {!collapsed && <span>{title}</span>}
        {!collapsed && <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />}
      </button>
      {isOpen && (
        <div className="space-y-1">
          {items.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer",
                  location === item.path
                    ? "bg-sfs-gold/20 text-sfs-gold border-l-2 border-sfs-gold"
                    : "text-sfs-beige/70 hover:text-sfs-gold hover:bg-sfs-gold/10"
                )}
                data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sfs-black relative">
      {/* Circuit Background */}
      <div className="fixed inset-0 circuit-bg -z-10" />
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-sfs-black/90 backdrop-blur-xl border-r border-sfs-gold/20 z-50 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sfs-gold/20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sfs-black" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-sfs-gold">SFS PowerHouse</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex text-sfs-beige/70 hover:text-sfs-gold"
            data-testid="button-toggle-sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-sfs-beige/70 hover:text-sfs-gold"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <NavSection title="Main" items={mainItems} location={location} collapsed={!sidebarOpen} />
          <NavSection title="Content" items={contentItems} location={location} collapsed={!sidebarOpen} />
          <NavSection title="Connections" items={accountsItems} location={location} collapsed={!sidebarOpen} />
          <NavSection title="Settings" items={settingsItems} location={location} collapsed={!sidebarOpen} />
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between h-16 px-4 bg-sfs-black/80 backdrop-blur-md border-b border-sfs-gold/20 md:left-auto"
        style={{ width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)', left: sidebarOpen ? '16rem' : '4rem' }}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-sfs-beige/70 hover:text-sfs-gold"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-sfs-gold">SFS Social PowerHouse</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-sfs-beige/70 hover:text-sfs-gold">
            <Bell className="w-5 h-5" />
          </Button>
          <Link href="/settings/profile">
            <Button variant="ghost" size="icon" className="text-sfs-beige/70 hover:text-sfs-gold">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className={cn(
        "pt-16 transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
