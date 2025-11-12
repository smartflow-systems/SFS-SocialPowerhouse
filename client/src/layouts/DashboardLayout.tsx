import { ReactNode } from 'react';
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
