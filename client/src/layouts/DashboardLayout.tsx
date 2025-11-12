import { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  Home, Sparkles, Calendar, BarChart3, Users, Settings,
  Zap, Bell, CreditCard, HelpCircle, FileText, Globe, CheckCircle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

const mainItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles, label: "AI Studio", path: "/ai-studio" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const contentItems = [
  { icon: Sparkles, label: "AI Generator", path: "/ai/generator" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Calendar, label: "Scheduler", path: "/scheduler" },
];

const accountsItems = [
  { icon: Globe, label: "Social Accounts", path: "/accounts" },
  { icon: Zap, label: "Automation", path: "/automation" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
];

const settingsItems = [
  { icon: Users, label: "Team", path: "/team" },
  { icon: CheckCircle, label: "Approvals", path: "/approvals" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];
import GitHubSidebar from '@/components/GitHubSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Circuit Background */}
      <div className="circuit-bg" />

      {/* GitHub-style Sidebar */}
      <GitHubSidebar />

      {/* Main Content */}
      <main className="relative z-10 pt-20 px-5">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
