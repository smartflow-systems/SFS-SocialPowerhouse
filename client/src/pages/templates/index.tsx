import { useState } from "react";
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Layout, Search, Plus, Copy, Sparkles, MessageSquare, Megaphone, GraduationCap, Instagram, Twitter, Facebook, Linkedin, Check } from 'lucide-react';
import { Link } from 'wouter';

interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  hashtags: string[];
  category: string;
  platforms: string[];
  icon: typeof MessageSquare;
}

const TEMPLATES: Template[] = [
  // Social Media Posts
  {
    id: "social-1",
    title: "Product Launch Announcement",
    description: "Announce new products with excitement and urgency",
    content: "Introducing something incredible that's about to change the game!\n\nWe've been working tirelessly behind the scenes, and now it's finally here.\n\nWhat makes it special:\n- Innovation you've been waiting for\n- Designed with YOU in mind\n- Quality that speaks for itself\n\nBe among the first to experience it. Link in bio!",
    hashtags: ["NewLaunch", "Innovation", "GameChanger", "ExcitingNews", "ComingSoon"],
    category: "Social Media Posts",
    platforms: ["instagram", "facebook", "linkedin"],
    icon: MessageSquare
  },
  {
    id: "social-2",
    title: "Engagement Question Post",
    description: "Boost engagement with thought-provoking questions",
    content: "Let's talk about something important today.\n\nIf you could change ONE thing about your daily routine to boost productivity, what would it be?\n\nDrop your answer below! I'll share my top tips in the comments.\n\nTag someone who needs to see this!",
    hashtags: ["Productivity", "DailyRoutine", "LifeHacks", "Community", "EngageWithMe"],
    category: "Social Media Posts",
    platforms: ["instagram", "twitter", "facebook"],
    icon: MessageSquare
  },
  {
    id: "social-3",
    title: "Behind The Scenes",
    description: "Share authentic moments from your work process",
    content: "A little peek behind the curtain...\n\nThis is what goes into making the magic happen. Late nights, early mornings, and a whole lot of passion.\n\nEvery detail matters. Every step counts.\n\nWhat's your favorite part of seeing behind-the-scenes content?",
    hashtags: ["BehindTheScenes", "WorkInProgress", "Authenticity", "CreativeProcess", "RealTalk"],
    category: "Social Media Posts",
    platforms: ["instagram", "facebook", "twitter"],
    icon: MessageSquare
  },

  // Stories
  {
    id: "story-1",
    title: "Poll Story Template",
    description: "Interactive poll to boost story engagement",
    content: "Quick question for you!\n\nWhat content do you want to see more of?\n\n[POLL]\nOption A: Tips & Tutorials\nOption B: Behind The Scenes\n\nTap to vote! Your feedback shapes what we create next.",
    hashtags: ["Poll", "YourChoice", "InteractiveStory", "Feedback", "Community"],
    category: "Stories",
    platforms: ["instagram"],
    icon: Instagram
  },
  {
    id: "story-2",
    title: "Limited Time Offer",
    description: "Create urgency with time-sensitive deals",
    content: "24 HOURS ONLY!\n\nDon't miss this exclusive offer.\n\nSwipe up before it's gone!\n\nWhy wait? The best deals don't last forever.\n\n[SWIPE UP LINK]",
    hashtags: ["LimitedTime", "FlashSale", "DontMissOut", "ExclusiveOffer", "ActNow"],
    category: "Stories",
    platforms: ["instagram", "facebook"],
    icon: Instagram
  },
  {
    id: "story-3",
    title: "Question Box Story",
    description: "Collect questions from your audience",
    content: "I want to hear from YOU!\n\nAsk me anything about [YOUR TOPIC].\n\n[QUESTION BOX]\n\nBest questions get answered in my next post!\n\nNo question is too big or too small.",
    hashtags: ["AMA", "AskMeAnything", "Questions", "Community", "LetsChat"],
    category: "Stories",
    platforms: ["instagram"],
    icon: Instagram
  },

  // Promotional
  {
    id: "promo-1",
    title: "Discount Announcement",
    description: "Promote sales and special discounts effectively",
    content: "HUGE NEWS!\n\nWe're giving you [X]% OFF everything!\n\nThis is our way of saying THANK YOU for being part of our community.\n\nUse code: THANKYOU at checkout\n\nValid until [DATE]. Don't wait - treat yourself today!",
    hashtags: ["Sale", "Discount", "ThankYou", "SpecialOffer", "ShopNow"],
    category: "Promotional",
    platforms: ["instagram", "facebook", "twitter"],
    icon: Megaphone
  },
  {
    id: "promo-2",
    title: "Free Resource Giveaway",
    description: "Promote lead magnets and free downloads",
    content: "FREE RESOURCE ALERT!\n\nI've put together a comprehensive guide that will help you [BENEFIT].\n\nWhat's inside:\n- Step-by-step strategies\n- Actionable templates\n- Expert tips & tricks\n\nGrab your free copy now! Link in bio.",
    hashtags: ["FreeResource", "Download", "Guide", "FreeTools", "LearnMore"],
    category: "Promotional",
    platforms: ["instagram", "linkedin", "twitter"],
    icon: Megaphone
  },
  {
    id: "promo-3",
    title: "Service Highlight",
    description: "Showcase your services and their benefits",
    content: "Struggling with [PAIN POINT]?\n\nYou're not alone. That's exactly why we created [SERVICE NAME].\n\nWhat you'll get:\n- Personalized solutions\n- Expert guidance\n- Real results\n\nReady to transform your [AREA]? Let's chat! DM us or book a call today.",
    hashtags: ["Services", "Solution", "Expert", "Results", "BookNow"],
    category: "Promotional",
    platforms: ["instagram", "linkedin", "facebook"],
    icon: Megaphone
  },

  // Educational
  {
    id: "edu-1",
    title: "Tips Carousel",
    description: "Share valuable tips in a carousel format",
    content: "5 Tips That Will Change Your [TOPIC] Game:\n\n1. Start with the basics - Master fundamentals first\n\n2. Consistency beats intensity - Show up every day\n\n3. Learn from others - Find mentors and role models\n\n4. Track your progress - What gets measured gets improved\n\n5. Never stop learning - Growth is a continuous journey\n\nSave this for later! Which tip resonates most with you?",
    hashtags: ["Tips", "Learning", "Growth", "Education", "SaveThisPost"],
    category: "Educational",
    platforms: ["instagram", "linkedin", "twitter"],
    icon: GraduationCap
  },
  {
    id: "edu-2",
    title: "Myth vs Fact",
    description: "Debunk common myths in your industry",
    content: "Let's bust some myths!\n\nMYTH: [Common misconception]\n\nFACT: [The truth with explanation]\n\nWhy this matters:\nMany people believe [myth] because [reason]. But the reality is [explanation].\n\nShare this with someone who needs to know the truth!",
    hashtags: ["MythBusters", "Facts", "Truth", "Education", "DidYouKnow"],
    category: "Educational",
    platforms: ["instagram", "twitter", "facebook"],
    icon: GraduationCap
  },
  {
    id: "edu-3",
    title: "How-To Tutorial",
    description: "Step-by-step instructions for your audience",
    content: "HOW TO [ACHIEVE RESULT] in 4 Simple Steps:\n\nStep 1: [First action]\nStart by gathering everything you need.\n\nStep 2: [Second action]\nFollow these instructions carefully.\n\nStep 3: [Third action]\nThis is where the magic happens.\n\nStep 4: [Fourth action]\nFinalize and celebrate your success!\n\nSave this tutorial and try it yourself! Tag us in your results.",
    hashtags: ["HowTo", "Tutorial", "StepByStep", "DIY", "LearnWithMe"],
    category: "Educational",
    platforms: ["instagram", "linkedin", "facebook"],
    icon: GraduationCap
  }
];

const CATEGORIES = [
  { name: "Social Media Posts", icon: MessageSquare, color: "text-blue-400" },
  { name: "Stories", icon: Instagram, color: "text-pink-400" },
  { name: "Promotional", icon: Megaphone, color: "text-sfs-gold" },
  { name: "Educational", icon: GraduationCap, color: "text-green-400" }
];

const platformIcons: Record<string, typeof Twitter> = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin
};

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const filteredTemplates = TEMPLATES.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = async (content: string, hashtags: string[]) => {
    const fullContent = `${content}\n\n${hashtags.map(h => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Template content has been copied with hashtags.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sfs-gold mb-2 flex items-center gap-2" data-testid="text-page-title">
              <Layout className="w-8 h-8 text-primary" />
              Templates
            </h1>
            <p className="text-muted-foreground">
              Browse and use pre-made content templates
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-template">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        {/* Search */}
        <Card className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-templates"
            />
          </div>
        </Card>

        {/* Template Categories */}
        <div className="space-y-8">
          {CATEGORIES.map((category) => {
            const categoryTemplates = filteredTemplates.filter(t => t.category === category.name);
            if (categoryTemplates.length === 0) return null;

            return (
              <div key={category.name}>
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <h2 className="text-xl font-semibold" data-testid={`text-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category.name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="glass-card p-4 hover-elevate cursor-pointer transition-all"
                      onClick={() => setSelectedTemplate(template)}
                      data-testid={`card-template-${template.id}`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-sfs-gold/20 to-sfs-brown/20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <template.icon className="w-12 h-12 text-sfs-gold/60" />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {template.platforms.slice(0, 3).map((platform) => {
                            const Icon = platformIcons[platform];
                            return Icon ? <Icon key={platform} className="w-3 h-3 text-muted-foreground" /> : null;
                          })}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1" data-testid={`text-template-title-${template.id}`}>{template.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                          data-testid={`button-view-template-${template.id}`}
                        >
                          View
                        </Button>
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(template.content, template.hashtags);
                          }}
                          data-testid={`button-use-template-${template.id}`}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="glass-card p-12 text-center">
            <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </Card>
        )}
      </div>

      {/* Template Preview Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selectedTemplate.icon className="w-5 h-5 text-sfs-gold" />
                  {selectedTemplate.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Platforms */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Best for:</span>
                  <div className="flex gap-2">
                    {selectedTemplate.platforms.map((platform) => {
                      const Icon = platformIcons[platform];
                      return Icon ? (
                        <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-full">
                          <Icon className="w-3 h-3" />
                          <span className="text-xs capitalize">{platform}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Content:</h4>
                  <p className="whitespace-pre-wrap text-sm" data-testid="text-template-content">
                    {selectedTemplate.content}
                  </p>
                </div>

                {/* Hashtags */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Suggested Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.hashtags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-sfs-gold/20 text-sfs-gold rounded-full text-xs"
                        data-testid={`tag-${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => copyToClipboard(selectedTemplate.content, selectedTemplate.hashtags)}
                    data-testid="button-copy-template"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                  <Link href="/ai-studio">
                    <Button className="flex-1" data-testid="button-customize-with-ai">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Customize with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
