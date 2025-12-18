/**
 * SFS Design Kit - Glass Card Component
 * 
 * A glassmorphism card with SFS gold accent styling.
 * 
 * Usage:
 * import GlassCard from 'sfs-design-kit/components/GlassCard';
 * 
 * <GlassCard>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </GlassCard>
 */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ 
  children, 
  className = "", 
  hover = true 
}: GlassCardProps) {
  return (
    <div
      className={`
        bg-sfs-brown/25 backdrop-blur-xl
        border border-sfs-gold/30
        rounded-lg p-6
        shadow-[0_4px_24px_rgba(255,215,0,0.15),inset_0_1px_0_rgba(255,215,0,0.2)]
        ${hover ? "hover:border-sfs-gold/50 hover:shadow-[0_8px_32px_rgba(255,215,0,0.25)] hover:-translate-y-0.5 transition-all duration-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
