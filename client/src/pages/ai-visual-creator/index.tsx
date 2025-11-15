import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Wand2,
  Image as ImageIcon,
  Scissors,
  Sparkles,
  Download,
  Palette,
  Type,
  Layers,
  Zap,
  Upload,
  Copy,
  Trash2,
  Grid3x3,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  style: string;
  timestamp: string;
  size: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  aspectRatio: string;
}

export default function AIVisualCreator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const { toast } = useToast();

  const aiStyles = [
    { id: 'professional', name: 'Professional', icon: '💼', description: 'Clean, corporate aesthetic' },
    { id: 'vibrant', name: 'Vibrant', icon: '🎨', description: 'Bold colors and energy' },
    { id: 'minimal', name: 'Minimal', icon: '⚡', description: 'Simple and elegant' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬', description: 'Movie-like quality' },
    { id: 'artistic', name: 'Artistic', icon: '🖼️', description: 'Creative and expressive' },
    { id: 'modern', name: 'Modern', icon: '✨', description: 'Contemporary design' },
  ];

  const templates: Template[] = [
    { id: '1', name: 'Instagram Post', category: 'Social Media', thumbnail: '📷', aspectRatio: '1:1' },
    { id: '2', name: 'Instagram Story', category: 'Social Media', thumbnail: '📱', aspectRatio: '9:16' },
    { id: '3', name: 'Twitter Header', category: 'Social Media', thumbnail: '🐦', aspectRatio: '3:1' },
    { id: '4', name: 'LinkedIn Banner', category: 'Social Media', thumbnail: '💼', aspectRatio: '4:1' },
    { id: '5', name: 'YouTube Thumbnail', category: 'Video', thumbnail: '📹', aspectRatio: '16:9' },
    { id: '6', name: 'Facebook Cover', category: 'Social Media', thumbnail: '📘', aspectRatio: '16:6' },
    { id: '7', name: 'Pinterest Pin', category: 'Social Media', thumbnail: '📌', aspectRatio: '2:3' },
    { id: '8', name: 'TikTok Cover', category: 'Video', thumbnail: '🎵', aspectRatio: '9:16' },
  ];

  const generatedImages: GeneratedImage[] = [
    {
      id: '1',
      prompt: 'Futuristic social media dashboard with AI elements',
      url: '🖼️',
      style: 'Professional',
      timestamp: '2 min ago',
      size: '1080x1080',
    },
    {
      id: '2',
      prompt: 'Abstract digital marketing concept with golden accents',
      url: '🎨',
      style: 'Artistic',
      timestamp: '15 min ago',
      size: '1920x1080',
    },
    {
      id: '3',
      prompt: 'Minimalist social media icons floating in space',
      url: '✨',
      style: 'Minimal',
      timestamp: '1 hour ago',
      size: '1080x1350',
    },
    {
      id: '4',
      prompt: 'Vibrant content creation workspace with laptop',
      url: '💻',
      style: 'Vibrant',
      timestamp: '2 hours ago',
      size: '1080x1080',
    },
  ];

  const editingTools = [
    { id: 'resize', name: 'Resize', icon: Grid3x3, description: 'Change dimensions' },
    { id: 'crop', name: 'Crop', icon: Scissors, description: 'Crop to focus' },
    { id: 'background', name: 'Remove BG', icon: Layers, description: 'AI background removal' },
    { id: 'filters', name: 'Filters', icon: Palette, description: 'Apply effects' },
    { id: 'text', name: 'Add Text', icon: Type, description: 'Text overlays' },
    { id: 'enhance', name: 'Enhance', icon: Sparkles, description: 'AI enhancement' },
  ];

  const quickActions = [
    {
      title: 'Batch Processing',
      description: 'Process multiple images at once',
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Smart Resize',
      description: 'AI-powered content-aware resize',
      icon: Grid3x3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Style Transfer',
      description: 'Apply artistic styles instantly',
      icon: Palette,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
    },
    {
      title: 'Auto-Enhance',
      description: 'One-click AI enhancement',
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt to generate an image',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Image Generated!',
        description: 'Your AI-generated image is ready',
      });
      setPrompt('');
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-sfs-gold mb-1 flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            AI Visual Creator
          </h1>
          <p className="text-sm text-sfs-beige/70">
            Create stunning visuals with AI-powered tools
          </p>
        </div>

        {/* AI Generator */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-sfs-gold" />
            <h3 className="text-lg font-semibold text-sfs-gold">AI Image Generator</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-auto">
              Powered by AI
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-sfs-beige mb-2 block">
                Describe what you want to create
              </label>
              <Textarea
                placeholder="e.g., A modern social media dashboard with vibrant colors and futuristic elements..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-sfs-beige mb-3 block">
                Select Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {aiStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedStyle === style.id
                        ? 'bg-sfs-gold/20 border-sfs-gold/50'
                        : 'bg-sfs-brown/20 border-sfs-gold/10 hover:border-sfs-gold/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <p className="text-xs font-semibold text-sfs-gold">{style.name}</p>
                    <p className="text-xs text-sfs-beige/60 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`p-4 rounded-lg border text-left transition-all ${action.bgColor} ${action.borderColor} hover:scale-105`}
            >
              <action.icon className={`w-6 h-6 ${action.color} mb-2`} />
              <p className={`font-semibold ${action.color}`}>{action.title}</p>
              <p className="text-xs text-sfs-beige/70 mt-1">{action.description}</p>
            </button>
          ))}
        </div>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-sfs-brown/30">
            <TabsTrigger value="recent">Recent Creations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="tools">Editing Tools</TabsTrigger>
          </TabsList>

          {/* Recent Creations Tab */}
          <TabsContent value="recent" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <Card key={image.id} className="glass-card p-4 group">
                  <div className="aspect-square bg-gradient-to-br from-sfs-gold/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center text-6xl">
                    {image.url}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-sfs-gold/20 text-sfs-gold border-sfs-gold/30">
                        {image.style}
                      </Badge>
                      <span className="text-xs text-sfs-beige/50">{image.timestamp}</span>
                    </div>
                    <p className="text-sm text-sfs-beige line-clamp-2">{image.prompt}</p>
                    <p className="text-xs text-sfs-beige/50 mt-1">{image.size}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="glass-card p-4 cursor-pointer hover:scale-105 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center text-5xl">
                    {template.thumbnail}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-sfs-gold">{template.name}</p>
                      <p className="text-xs text-sfs-beige/60">{template.category}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {template.aspectRatio}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Editing Tools Tab */}
          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingTools.map((tool) => (
                <Card key={tool.id} className="glass-card p-4 cursor-pointer hover:scale-105 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-sfs-gold/20 border border-sfs-gold/30">
                      <tool.icon className="w-6 h-6 text-sfs-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sfs-gold mb-1">{tool.name}</p>
                      <p className="text-sm text-sfs-beige/70">{tool.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-sfs-gold">Pro Features</h3>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-auto">
                  Premium
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-400">AI Upscaling</p>
                      <p className="text-sm text-sfs-beige/70 mt-1">
                        Increase image resolution up to 4x with AI
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <Wand2 className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-400">Object Removal</p>
                      <p className="text-sm text-sfs-beige/70 mt-1">
                        Remove unwanted objects with AI precision
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-400">Layer Management</p>
                      <p className="text-sm text-sfs-beige/70 mt-1">
                        Advanced layering and compositing tools
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-400">Batch Export</p>
                      <p className="text-sm text-sfs-beige/70 mt-1">
                        Export to multiple formats simultaneously
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
