import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Sparkles, Calendar, BarChart3, Users } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoFeatures = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Watch how our AI creates engaging posts in seconds",
    duration: "2 min"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "See how to plan and schedule content effortlessly",
    duration: "3 min"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Explore deep insights into your social performance",
    duration: "2 min"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Learn how teams work together on content",
    duration: "2 min"
  }
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-sfs-gold flex items-center gap-2">
            <Play className="w-6 h-6" />
            Product Demo
          </DialogTitle>
          <DialogDescription className="text-sfs-beige/80">
            See SFS Social PowerHouse in action. Choose a feature to explore.
          </DialogDescription>
        </DialogHeader>

        {selectedDemo === null ? (
          <div className="grid gap-4 py-4">
            {demoFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDemo(index)}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-sfs-gold/50 hover:bg-sfs-gold/5 transition-all text-left group"
                  data-testid={`demo-feature-${index}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <Icon className="w-6 h-6 text-sfs-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-sfs-beige/70">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sfs-gold">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">{feature.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-4">
            <div className="aspect-video bg-sfs-brown/30 rounded-lg flex items-center justify-center mb-4 border border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-sfs-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-sfs-gold" />
                </div>
                <p className="text-sfs-beige/80 mb-2">
                  {demoFeatures[selectedDemo].title} Demo
                </p>
                <p className="text-sm text-sfs-beige/50">
                  Video coming soon. Try the feature in our dashboard!
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedDemo(null)}
                className="border-sfs-gold/30"
              >
                Back to Features
              </Button>
              <Button
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
                onClick={onClose}
              >
                Try It Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
