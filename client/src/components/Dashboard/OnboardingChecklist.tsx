import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  Globe, 
  Sparkles, 
  Calendar, 
  Users, 
  ChevronDown, 
  ChevronUp,
  X
} from "lucide-react";
import { Link } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  onDismiss: () => void;
}

export default function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [steps] = useState<OnboardingStep[]>([
    {
      id: "connect",
      title: "Connect a social account",
      description: "Link your first social media account to start posting",
      icon: Globe,
      href: "/connections/social-accounts",
      completed: false
    },
    {
      id: "ai-post",
      title: "Create your first AI post",
      description: "Use AI to generate engaging content in seconds",
      icon: Sparkles,
      href: "/ai-studio",
      completed: false
    },
    {
      id: "schedule",
      title: "Schedule a post",
      description: "Plan your content with our smart scheduling",
      icon: Calendar,
      href: "/calendar",
      completed: false
    },
    {
      id: "team",
      title: "Invite a team member",
      description: "Collaborate with your team on content",
      icon: Users,
      href: "/connections/team",
      completed: false
    }
  ]);

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card className="glass-card overflow-hidden" data-testid="onboarding-checklist">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sfs-black" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Getting Started</h3>
              <p className="text-sm text-sfs-beige/60">
                Complete these steps to unlock the full power of SFS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-sfs-gold font-medium">
              {completedCount}/{steps.length} complete
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-onboarding"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDismiss}
              data-testid="button-dismiss-onboarding"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className="block"
              >
                <div 
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    step.completed 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-border/50 hover:border-sfs-gold/50 hover:bg-sfs-gold/5'
                  }`}
                  data-testid={`onboarding-step-${step.id}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500/20' 
                      : 'bg-sfs-gold/10'
                  }`}>
                    {step.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className="w-5 h-5 text-sfs-gold" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? 'text-sfs-beige/60 line-through' : 'text-white'}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-sfs-beige/50">
                      {step.description}
                    </p>
                  </div>
                  {!step.completed && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-sfs-gold/30 text-sfs-gold hover:bg-sfs-gold/10"
                    >
                      Start
                    </Button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
