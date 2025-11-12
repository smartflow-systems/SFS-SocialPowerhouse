import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', charLimit: 63206 },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F', charLimit: 2200 },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2', charLimit: 280 },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', charLimit: 3000 },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', charLimit: 2200 },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', charLimit: 5000 },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023', charLimit: 500 },
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
}

export default function PlatformSelector({ selectedPlatforms, onPlatformToggle }: PlatformSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-primary">Target Platforms</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => onPlatformToggle(platform.id)}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all",
                "backdrop-filter backdrop-blur-lg",
                "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-primary/20 bg-[#3B2F2F]/30"
              )}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                </div>
              )}
              <div className="text-2xl mb-1">{platform.icon}</div>
              <div className="text-xs font-semibold text-primary">{platform.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.charLimit} chars</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
