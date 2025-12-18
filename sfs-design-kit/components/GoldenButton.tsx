/**
 * SFS Design Kit - Golden Button Component
 * 
 * A golden gradient button with SFS styling.
 * 
 * Usage:
 * import GoldenButton from 'sfs-design-kit/components/GoldenButton';
 * 
 * <GoldenButton onClick={() => console.log('clicked')}>
 *   Click Me
 * </GoldenButton>
 */

interface GoldenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export default function GoldenButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: GoldenButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-sfs-gold to-sfs-gold-hover
        text-sfs-black font-semibold
        px-6 py-2.5 rounded-lg
        shadow-[0_4px_15px_rgba(255,215,0,0.3)]
        hover:shadow-[0_6px_20px_rgba(255,215,0,0.5)]
        hover:-translate-y-0.5
        active:translate-y-0
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </button>
  );
}
