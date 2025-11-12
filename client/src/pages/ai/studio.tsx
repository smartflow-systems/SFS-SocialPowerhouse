import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import GlassCard from '@/components/Glass/GlassCard';
import GoldenButton from '@/components/Glass/GoldenButton';
import ToneSelector from '@/components/AI/ToneSelector';
import PlatformSelector from '@/components/AI/PlatformSelector';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Copy, Download, Share2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIStudio() {
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing prompt',
        description: 'Please enter a content brief or idea',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: 'No platforms selected',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Call OpenAI API endpoint
      // Simulating API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      setGeneratedContent(`[${selectedTone.toUpperCase()} TONE]\n\n${prompt}\n\nThis is where the AI-generated content will appear. The content will be optimized for: ${selectedPlatforms.join(', ')}\n\n#SocialMedia #ContentCreation #AI`);

      toast({
        title: 'Content generated!',
        description: 'Your AI content is ready',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-sfs-gold mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            AI Content Studio
          </h1>
          <p className="text-sfs-beige/60">
            Generate engaging social media content with AI in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-sfs-gold mb-4">Content Brief</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-sfs-beige">
                    What do you want to post about?
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Example: Write a post about the benefits of morning meditation for busy professionals..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-2 min-h-32 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige placeholder:text-sfs-beige/40"
                  />
                  <p className="text-xs text-sfs-beige/40 mt-1">
                    {prompt.length} characters
                  </p>
                </div>

                <ToneSelector
                  selectedTone={selectedTone}
                  onToneChange={setSelectedTone}
                />

                <PlatformSelector
                  selectedPlatforms={selectedPlatforms}
                  onPlatformToggle={handlePlatformToggle}
                />

                <GoldenButton
                  className="w-full"
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={isGenerating}
                >
                  <Wand2 className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate Content'}
                </GoldenButton>
              </div>
            </GlassCard>

            {/* Advanced Options */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-sfs-gold mb-4">Advanced Options</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="keywords" className="text-sfs-beige">
                    Keywords (comma-separated)
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="meditation, wellness, productivity"
                    className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige"
                  />
                </div>

                <div>
                  <Label htmlFor="cta" className="text-sfs-beige">
                    Call to Action
                  </Label>
                  <Input
                    id="cta"
                    placeholder="Learn more, Sign up, Shop now..."
                    className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige"
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-sfs-gold">Generated Content</h2>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-sfs-gold/20 hover:bg-sfs-gold/30 text-sfs-gold transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-sfs-gold/20 hover:bg-sfs-gold/30 text-sfs-gold transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-sfs-gold/20 hover:bg-sfs-gold/30 text-sfs-gold transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-sfs-brown/20">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-sfs-gold/20 data-[state=active]:text-sfs-gold">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html" className="data-[state=active]:bg-sfs-gold/20 data-[state=active]:text-sfs-gold">
                    HTML
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-96 p-4 rounded-lg bg-sfs-brown/10 border border-sfs-gold/10">
                    {generatedContent ? (
                      <div className="whitespace-pre-wrap text-sfs-beige">
                        {generatedContent}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sfs-beige/40">
                        Generated content will appear here
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-4">
                  <div className="min-h-96 p-4 rounded-lg bg-sfs-brown/10 border border-sfs-gold/10 font-mono text-sm">
                    {generatedContent ? (
                      <pre className="text-sfs-beige/80">
                        {`<div>\n  ${generatedContent.replace(/\n/g, '\n  ')}\n</div>`}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sfs-beige/40">
                        HTML code will appear here
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>

            {/* Variations */}
            {generatedContent && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-sfs-gold mb-3">Variations</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-sfs-gold/20 hover:border-sfs-gold/40 hover:bg-sfs-gold/5 cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-sfs-beige/80">
                        Variation {i} - Click to load
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
