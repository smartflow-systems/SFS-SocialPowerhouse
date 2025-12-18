import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SiLinkedin, SiX, SiGithub, SiInstagram } from "react-icons/si";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!email) {
      toast({
        title: "Please enter your email",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Thanks for subscribing!",
      description: "You'll receive our latest updates and tips.",
    });
    setEmail("");
  };

  return (
    <footer className="border-t border-sfs-gold/20 bg-sfs-black" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <div className="w-8 h-8 bg-gradient-to-br from-sfs-gold to-sfs-gold-hover rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sfs-black" />
              </div>
              <span className="font-bold text-white" data-testid="text-footer-brand">SFS-SocialPowerhouse</span>
            </Link>
            <p className="text-sm text-sfs-beige/60 mb-4" data-testid="text-footer-tagline">
              Transform your social media with AI-powered content generation and intelligent scheduling.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-sfs-gold/10 hover:bg-sfs-gold/20 flex items-center justify-center transition-colors" data-testid="link-social-linkedin">
                <SiLinkedin className="w-4 h-4 text-sfs-gold" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-sfs-gold/10 hover:bg-sfs-gold/20 flex items-center justify-center transition-colors" data-testid="link-social-x">
                <SiX className="w-4 h-4 text-sfs-gold" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-sfs-gold/10 hover:bg-sfs-gold/20 flex items-center justify-center transition-colors" data-testid="link-social-instagram">
                <SiInstagram className="w-4 h-4 text-sfs-gold" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-sfs-gold/10 hover:bg-sfs-gold/20 flex items-center justify-center transition-colors" data-testid="link-social-github">
                <SiGithub className="w-4 h-4 text-sfs-gold" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4" data-testid="text-footer-product-heading">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-features">Features</a></li>
              <li><a href="#pricing" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-pricing-footer">Pricing</a></li>
              <li><Link href="/ai-studio" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-ai-studio">AI Studio</Link></li>
              <li><Link href="/calendar" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-calendar">Content Calendar</Link></li>
              <li><Link href="/analytics" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-analytics">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4" data-testid="text-footer-resources-heading">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-documentation">Documentation</a></li>
              <li><a href="#" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-blog">Blog</a></li>
              <li><a href="#faq" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-faq">FAQ</a></li>
              <li><Link href="/help" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-support">Support</Link></li>
              <li><a href="#" className="text-sfs-beige/60 hover:text-sfs-gold transition-colors" data-testid="link-community">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4" data-testid="text-footer-newsletter-heading">Stay Updated</h4>
            <p className="text-sm text-sfs-beige/60 mb-4" data-testid="text-newsletter-description">
              Get the latest updates and tips for social media success.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sfs-brown/30 border-sfs-gold/20 text-white placeholder:text-sfs-beige/40"
                data-testid="input-newsletter-email"
              />
              <Button 
                onClick={handleSubscribe} 
                className="bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black"
                data-testid="button-newsletter-subscribe"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-sfs-gold/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-sfs-beige/50" data-testid="text-copyright">
            © 2024 SFS-SocialPowerhouse. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-sfs-beige/50 hover:text-sfs-gold transition-colors" data-testid="link-terms">Terms</a>
            <a href="#" className="text-sfs-beige/50 hover:text-sfs-gold transition-colors" data-testid="link-privacy">Privacy</a>
            <a href="#" className="text-sfs-beige/50 hover:text-sfs-gold transition-colors" data-testid="link-cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
