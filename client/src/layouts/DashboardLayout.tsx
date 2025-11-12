import { ReactNode, useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import CircuitBackground from '@/components/Glass/CircuitBackground';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sfs-black to-sfs-brown relative overflow-hidden">
      {/* Circuit background */}
      <CircuitBackground opacity={0.05} animate={true} />

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 p-6 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sfs-gold hover:bg-sfs-gold/10"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>

        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
