import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  glow = false
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glass effect
        "relative backdrop-blur-xl bg-sfs-brown/10 rounded-lg",
        "border border-sfs-gold/20",
        "shadow-[0_8px_32px_rgba(255,215,0,0.1)]",

        // Hover effects
        hover && "transition-all duration-300 hover:bg-sfs-brown/20 hover:border-sfs-gold/40 hover:shadow-[0_12px_48px_rgba(255,215,0,0.2)]",

        // Glow effect
        glow && "animate-pulse-gold",

        className
      )}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sfs-gold/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
