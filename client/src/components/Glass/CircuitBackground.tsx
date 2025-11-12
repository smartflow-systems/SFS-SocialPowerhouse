import { cn } from '@/lib/utils';

interface CircuitBackgroundProps {
  className?: string;
  opacity?: number;
  animate?: boolean;
}

export default function CircuitBackground({
  className,
  opacity = 0.05,
  animate = true
}: CircuitBackgroundProps) {
  const circuitSvg = `data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='circuit' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 10h20v20h-20z M40 10h20v20h-20z M70 10h20v20h-20z M10 40h20v20h-20z M40 40h20v20h-20z M70 40h20v20h-20z M10 70h20v20h-20z M40 70h20v20h-20z M70 70h20v20h-20z' fill='none' stroke='%23FFD700' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23FFD700'/%3E%3Ccircle cx='50' cy='20' r='2' fill='%23FFD700'/%3E%3Ccircle cx='80' cy='20' r='2' fill='%23FFD700'/%3E%3Ccircle cx='20' cy='50' r='2' fill='%23FFD700'/%3E%3Ccircle cx='50' cy='50' r='2' fill='%23FFD700'/%3E%3Ccircle cx='80' cy='50' r='2' fill='%23FFD700'/%3E%3Ccircle cx='20' cy='80' r='2' fill='%23FFD700'/%3E%3Ccircle cx='50' cy='80' r='2' fill='%23FFD700'/%3E%3Ccircle cx='80' cy='80' r='2' fill='%23FFD700'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23circuit)'/%3E%3C/svg%3E`;

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        animate && "animate-circuit-flow",
        className
      )}
      style={{
        backgroundImage: `url("${circuitSvg}")`,
        backgroundSize: '200px 200px',
        opacity: opacity,
      }}
    />
  );
}
