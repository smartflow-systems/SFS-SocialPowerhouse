import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/Glass/GlassCard';
import GoldenButton from '@/components/Glass/GoldenButton';
import CircuitBackground from '@/components/Glass/CircuitBackground';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Welcome to SFS PowerHouse!',
        description: 'Your account has been created successfully.',
      });

      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sfs-black to-sfs-brown flex items-center justify-center p-4 relative overflow-hidden">
      <CircuitBackground opacity={0.1} animate={true} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-sfs-gold to-sfs-gold-hover rounded-2xl mb-4 animate-float">
            <Sparkles className="w-12 h-12 text-sfs-black" />
          </div>
          <h1 className="text-3xl font-bold text-sfs-gold mb-2">Join SFS PowerHouse</h1>
          <p className="text-sfs-beige/60">Start automating your social media today</p>
        </div>

        {/* Register Card */}
        <GlassCard className="p-8" glow>
          <h2 className="text-2xl font-bold text-sfs-gold mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sfs-beige flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="John Doe"
                className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige placeholder:text-sfs-beige/40 focus:border-sfs-gold"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sfs-beige flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige placeholder:text-sfs-beige/40 focus:border-sfs-gold"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sfs-beige flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige placeholder:text-sfs-beige/40 focus:border-sfs-gold"
                required
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sfs-beige flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="••••••••"
                className="mt-2 bg-sfs-brown/20 border-sfs-gold/20 text-sfs-beige placeholder:text-sfs-beige/40 focus:border-sfs-gold"
                required
                minLength={8}
              />
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-sfs-gold/40 bg-sfs-brown/20 text-sfs-gold focus:ring-sfs-gold"
              />
              <label className="text-sfs-beige/70">
                I agree to the{' '}
                <a href="/terms" className="text-sfs-gold hover:text-sfs-gold-hover">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-sfs-gold hover:text-sfs-gold-hover">
                  Privacy Policy
                </a>
              </label>
            </div>

            <GoldenButton type="submit" className="w-full" loading={isLoading}>
              Create Account
            </GoldenButton>
          </form>

          <div className="mt-6 pt-6 border-t border-sfs-gold/20">
            <p className="text-center text-sfs-beige/60 text-sm">
              Already have an account?{' '}
              <a href="/auth/login" className="text-sfs-gold hover:text-sfs-gold-hover font-semibold">
                Sign in
              </a>
            </p>
          </div>

          {/* Social Register */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sfs-gold/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-sfs-brown/10 px-2 text-sfs-beige/60">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <GoldenButton variant="secondary" className="w-full">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </GoldenButton>
              <GoldenButton variant="secondary" className="w-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </GoldenButton>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-sfs-beige/40">
          <p>© 2025 SmartFlow Systems | Powered by boweazy</p>
        </div>
      </div>
    </div>
  );
}
