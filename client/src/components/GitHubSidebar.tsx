import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Menu,
  Home,
  Sparkles,
  Calendar,
  BarChart3,
  FileText,
  PenSquare,
  Clock,
  Globe,
  Users,
  Zap,
  User,
  CreditCard,
  Bell,
  Settings,
} from 'lucide-react';
import { useLocation } from 'wouter';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

/**
 * Menu configuration moved outside the component to avoid recreation on each render
 */
const MENU_SECTIONS: MenuSection[] = [
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

export default function GitHubSidebar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();

  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Normalize path for comparisons: remove query/hash and trailing slash
  const normalizePath = useCallback((path: string) => {
    try {
      const withoutHash = path.split('#')[0];
      const withoutQuery = withoutHash.split('?')[0];
      return withoutQuery.replace(/\/+$/, '') || '/';
    } catch {
      return path;
    }
  }, []);

  const normalizedLocation = useMemo(() => normalizePath(location || '/'), [location, normalizePath]);

  // Helper to test if a menu href is active (exact or nested)
  const isHrefActive = useCallback(
    (href: string) => {
      const normalizedHref = normalizePath(href);
      return (
        normalizedLocation === normalizedHref || normalizedLocation.startsWith(normalizedHref + '/')
      );
    },
    [normalizedLocation, normalizePath]
  );

  const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
    if (!container) return [];
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(container.querySelectorAll<HTMLElement>(selector));
    // filter out elements that are not actually visible
    return nodes.filter((el) => {
      // offsetParent null check handles display:none; fallback to bounding rect
      if (el.offsetParent === null) {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
      return true;
    });
  };

  // Focus management & focus trap
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const navEl = navRef.current;
    if (isOpen && navEl) {
      // store last focused element to restore later
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      // focus the nav itself (tabindex=-1) so screen readers announce dialog
      navEl.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          // trap focus within the nav
          const focusable = getFocusableElements(navEl);
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement as HTMLElement | null;

          if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && (active === first || active === navEl)) {
            e.preventDefault();
            last.focus();
          }
        }
      };

      // add listener to trap Tab; Escape handled below by separate listener
      document.addEventListener('keydown', handleKeyDown);

      // prevent body scroll
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    } else {
      // restore body overflow when closed (in case effect cleanup didn't run)
      document.body.style.overflow = '';
      // restore focus to the hamburger button if available
      if (!isOpen && lastFocusedRef.current) {
        lastFocusedRef.current.focus();
      } else if (!isOpen && hamburgerRef.current) {
        hamburgerRef.current.focus();
      }
    }
  }, [isOpen]);

  // Close on ESC key (separate effect so it's always responsive)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // restore focus after closing
        const toFocus = lastFocusedRef.current || hamburgerRef.current;
        toFocus?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // navigate helper
  const handleNavigate = useCallback(
    (path: string) => {
      // close first for smoother UX; navigate after to ensure route change happens
      setIsOpen(false);
      navigate(path);
    },
    [navigate]
  );

  // Improved Sign Out flow
  const signOut = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        // best effort logout call
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      // log and proceed with client-side cleanup and redirect
      // eslint-disable-next-line no-console
      console.error('Logout call failed:', err);
    } finally {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {
          // ignore storage errors
        }
      }
      setIsOpen(false);
      navigate('/auth/login');
    }
  }, [navigate]);

  // overlay aria-hidden value
  const overlayAriaHidden = !isOpen;

  // visually label the dialog for screen readers using aria-label
  return (
    <>
      {/* Hamburger Button */}
      <button
        ref={hamburgerRef}
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 z-50 p-2.5 bg-[#0D0D0D] rounded hover:bg-[#3B2F2F] transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6 text-[#FFD700]" aria-hidden="true" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden={overlayAriaHidden}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <nav
        ref={navRef}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label="Main menu"
        tabIndex={-1}
        className={`fixed top-0 left-0 h-screen w-[300px] bg-[#0D0D0D] text-[#F5F5DC] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            // restore focus
            const toFocus = lastFocusedRef.current || hamburgerRef.current;
            toFocus?.focus();
          }}
          className="absolute top-4 right-4 text-[#FFD700] hover:text-[#E6C200] transition-colors"
          aria-label="Close Menu"
        >
          <X className="w-8 h-8" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="pt-16 px-5 pb-5 border-b border-[#3B2F2F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FFD700]" aria-hidden="true" />
            <h2 className="text-[#FFD700] text-xl font-semibold">SFS PowerHouse</h2>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="flex-grow py-5">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-5 py-2 text-xs uppercase text-[#FFD700]/60 font-semibold">
                {section.title}
              </h3>
              <ul>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isHrefActive(item.href);
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full flex items-center gap-3 py-3 px-5 text-[#F5F5DC] hover:bg-[#3B2F2F] hover:pl-7 border-l-[3px] transition-all duration-200 ${
                          active ? 'border-[#FFD700] bg-[#3B2F2F]' : 'border-transparent'
                        }`}
                        aria-current={active ? 'page' : undefined}
                        // keep semantic button, which is keyboard-focusable
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
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
            onClick={signOut}
            className="block w-full py-3 px-4 bg-[#FFD700] text-[#0D0D0D] text-center font-semibold rounded hover:bg-[#E6C200] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
/**
 * Comprehensive GitHubSidebar with Full SFS-SocialPowerhouse Navigation
 * Now includes ALL features and sections from the dashboard sidebar
 */

import HamburgerMenu from './HamburgerMenu';

export default function GitHubSidebar() {
  return <HamburgerMenu />;
}
