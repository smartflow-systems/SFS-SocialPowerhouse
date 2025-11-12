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
      <h3 className="text-sm font-semibold text-sfs-gold">Target Platforms</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => onPlatformToggle(platform.id)}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all",
                "hover:border-sfs-gold/60 hover:bg-sfs-gold/5",
                isSelected
                  ? "border-sfs-gold bg-sfs-gold/10"
                  : "border-sfs-gold/20 bg-sfs-brown/5"
              )}
            >
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-sfs-gold rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-sfs-black" />
                  </div>
                </div>
              )}
              <div className="text-2xl mb-1">{platform.icon}</div>
              <div className="text-xs font-semibold text-sfs-gold">{platform.name}</div>
              <div className="text-xs text-sfs-beige/40 mt-1">{platform.charLimit} chars</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
