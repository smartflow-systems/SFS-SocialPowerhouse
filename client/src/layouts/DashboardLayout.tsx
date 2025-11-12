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
    <>
      {/* Circuit Background - Fixed to viewport */}
      <div className="fixed inset-0 circuit-bg -z-10" />

      <SidebarProvider>
        <Sidebar collapsible="none" className="bg-sfs-black/80 backdrop-blur-sm border-r border-sfs-gold/20">
          <SidebarHeader className="p-4 border-b border-sfs-gold/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-bold text-lg text-sfs-gold">SFS PowerHouse</h2>
              </div>
            </div>
          </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={location === item.path} asChild>
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={location === item.path} asChild>
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Connections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountsItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={location === item.path} asChild>
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={location === item.path} asChild>
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sfs-gold/20 px-4 bg-sfs-black/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-sfs-gold">SFS PowerHouse</h2>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </>
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
