import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <h3 className="text-sm font-semibold text-primary">Select Tone</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onToneChange(tone.id)}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-all text-left",
              "backdrop-filter backdrop-blur-lg",
              "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",
              selectedTone === tone.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-primary/20 bg-[#3B2F2F]/30"
            )}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {selectedTone === tone.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              </div>
            )}
            <div className="text-2xl mb-1">{tone.emoji}</div>
            <div className="text-sm font-semibold text-primary">{tone.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{tone.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
