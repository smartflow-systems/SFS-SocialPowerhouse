import { useState, useEffect } from 'react';
import { X, Menu, Home, Sparkles, Calendar, BarChart3, FileText, PenSquare, Clock, Globe, Users, Zap, User, CreditCard, Bell, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

export default function GitHubSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close sidebar on navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: Home },
        { label: 'AI Studio', href: '/ai-studio', icon: Sparkles },
        { label: 'Calendar', href: '/calendar', icon: Calendar },
        { label: 'Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'Content Library', href: '/content-library', icon: FileText },
      ],
    },
    {
      title: 'Content',
      items: [
        { label: 'Create Post', href: '/posts/create', icon: PenSquare },
        { label: 'Scheduled Posts', href: '/posts/scheduled', icon: Clock },
        { label: 'Drafts', href: '/posts/drafts', icon: FileText },
        { label: 'Templates', href: '/templates', icon: FileText },
      ],
    },
    {
      title: 'Connections',
      items: [
        { label: 'Social Accounts', href: '/connections/accounts', icon: Globe },
        { label: 'Team Members', href: '/connections/team', icon: Users },
        { label: 'Integrations', href: '/connections/integrations', icon: Zap },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Profile', href: '/settings/profile', icon: User },
        { label: 'Billing', href: '/settings/billing', icon: CreditCard },
        { label: 'Notifications', href: '/settings/notifications', icon: Bell },
        { label: 'Preferences', href: '/settings/preferences', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 z-50 p-2.5 bg-[#0D0D0D] rounded hover:bg-[#3B2F2F] transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6 text-[#FFD700]" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen w-[300px] bg-[#0D0D0D] text-[#F5F5DC] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[#FFD700] hover:text-[#E6C200] transition-colors"
          aria-label="Close Menu"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Header */}
        <div className="pt-16 px-5 pb-5 border-b border-[#3B2F2F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-[#FFD700] text-xl font-semibold">
              SFS PowerHouse
            </h2>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="flex-grow py-5">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-5 py-2 text-xs uppercase text-[#FFD700]/60 font-semibold">
                {section.title}
              </h3>
              <ul>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full flex items-center gap-3 py-3 px-5 text-[#F5F5DC] hover:bg-[#3B2F2F] hover:pl-7 border-l-[3px] transition-all duration-200 ${
                          isActive
                            ? 'border-[#FFD700] bg-[#3B2F2F]'
                            : 'border-transparent'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#3B2F2F]">
          <button
            onClick={() => handleNavigate('/auth/login')}
            className="block w-full py-3 px-4 bg-[#FFD700] text-[#0D0D0D] text-center font-semibold rounded hover:bg-[#E6C200] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
