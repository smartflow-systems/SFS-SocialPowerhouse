import { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Live Dashboard", href: "/live-dashboard" },
  { label: "Social Inbox", href: "/social-inbox" },
  { label: "AI Studio", href: "/ai-studio" },
  { label: "Calendar", href: "/calendar" },
  { label: "Analytics", href: "/analytics" },
  { label: "Posts", href: "/posts" },
  { label: "AI Generator", href: "/ai/generator" },
  { label: "Visual Creator", href: "/ai-visual-creator" },
  { label: "Templates", href: "/templates" },
  { label: "Content Library", href: "/content-library" },
  { label: "Scheduler", href: "/scheduler" },
  { label: "Social Accounts", href: "/connections/social-accounts" },
  { label: "Social Listening", href: "/social-listening" },
  { label: "Competitor Intelligence", href: "/competitor-intelligence" },
  { label: "Growth Tools", href: "/growth-tools" },
  { label: "Integrations", href: "/connections/integrations" },
  { label: "Automation", href: "/connections/automation" },
  { label: "Alerts", href: "/connections/alerts" },
  { label: "Team Members", href: "/team" },
  { label: "Team Collaboration", href: "/connections/team" },
  { label: "Approval Flows", href: "/approvals" },
  { label: "Accounts", href: "/accounts" },
  { label: "Automation Rules", href: "/automation" },
  { label: "Profile", href: "/settings/profile" },
  { label: "Billing", href: "/settings/billing" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Preferences", href: "/settings/preferences" },
  { label: "Help Center", href: "/help" },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuContent = (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9998 }}
          onClick={closeMenu}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '224px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(59, 47, 47, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 215, 0, 0.3)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div style={{ 
          flexShrink: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px', 
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #FFD700, #E6C200)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#0D0D0D' }} />
            </div>
            <div>
              <h3 style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>SFS PowerHouse</h3>
              <p style={{ color: 'rgba(245, 245, 220, 0.6)', fontSize: '12px', margin: 0 }}>SmartFlow Systems</p>
            </div>
          </div>
          <button
            onClick={closeMenu}
            style={{ 
              padding: '8px', 
              color: 'rgba(255, 215, 0, 0.7)', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer' 
            }}
            aria-label="Close menu"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: 'rgba(245, 245, 220, 0.7)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                  e.currentTarget.style.color = '#FFD700';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(245, 245, 220, 0.7)';
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ 
          flexShrink: 0, 
          padding: '16px', 
          borderTop: '1px solid rgba(255, 215, 0, 0.2)', 
          textAlign: 'center' 
        }}>
          <p style={{ color: '#FFD700', fontWeight: '600', fontSize: '12px', margin: 0 }}>SmartFlow Systems</p>
          <p style={{ color: 'rgba(245, 245, 220, 0.4)', fontSize: '12px', margin: '4px 0 0 0' }}>2025 boweazy</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        style={{
          padding: '8px',
          color: '#FFD700',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Toggle menu"
        data-testid="button-hamburger"
      >
        {isOpen ? (
          <X style={{ width: '24px', height: '24px' }} />
        ) : (
          <Menu style={{ width: '24px', height: '24px' }} />
        )}
      </button>

      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
