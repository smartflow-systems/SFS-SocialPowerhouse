import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/Glass/GlassCard';

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '💼', description: 'Formal and business-like' },
  { id: 'casual', label: 'Casual', emoji: '😊', description: 'Friendly and relaxed' },
  { id: 'witty', label: 'Witty', emoji: '😄', description: 'Clever and humorous' },
  { id: 'urgent', label: 'Urgent', emoji: '⚡', description: 'Time-sensitive and action-driven' },
  { id: 'friendly', label: 'Friendly', emoji: '🤗', description: 'Warm and welcoming' },
  { id: 'authoritative', label: 'Authoritative', emoji: '🎯', description: 'Expert and confident' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨', description: 'Motivating and uplifting' },
  { id: 'humorous', label: 'Humorous', emoji: '😂', description: 'Funny and entertaining' },
  { id: 'educational', label: 'Educational', emoji: '📚', description: 'Informative and teaching' },
  { id: 'promotional', label: 'Promotional', emoji: '🎁', description: 'Sales-focused and persuasive' },
];

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-sfs-gold">Select Tone</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onToneChange(tone.id)}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-all text-left",
              "hover:border-sfs-gold/60 hover:bg-sfs-gold/5",
              selectedTone === tone.id
                ? "border-sfs-gold bg-sfs-gold/10"
                : "border-sfs-gold/20 bg-sfs-brown/5"
            )}
          >
            {selectedTone === tone.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-sfs-gold rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-sfs-black" />
                </div>
              </div>
            )}
            <div className="text-2xl mb-1">{tone.emoji}</div>
            <div className="text-sm font-semibold text-sfs-gold">{tone.label}</div>
            <div className="text-xs text-sfs-beige/60 mt-1">{tone.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
