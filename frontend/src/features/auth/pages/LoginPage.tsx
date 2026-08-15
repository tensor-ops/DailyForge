import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthLayout } from '../components/AuthLayout';

export const LoginPage: React.FC = () => {
  useDocumentTitle('DailyForge — Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      setLoginStatus('error');
      return;
    }

    setIsSubmitting(true);
    setLoginStatus('loading');
    setError('');

    try {
      await login(email, password);
      setLoginStatus('success');

      // Play success animation briefly before redirection
      setTimeout(() => {
        success('Welcome back! 👋', "Let's make today count.");
        navigate('/dashboard');
      }, 800);
    } catch (err: unknown) {
      setLoginStatus('error');
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.';
        setError(msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="space-y-1.5 text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back.
          </h2>
          <p className="text-sm text-muted-foreground">
            Continue forging your best self.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            disabled={isSubmitting}
          />

          <div className="space-y-1.5 relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              }
              required
              disabled={isSubmitting}
              className="bg-surface border-border focus:ring-primary/50 text-foreground pr-10"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-border bg-surface text-primary focus:ring-0 focus:ring-offset-0" 
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-primary hover:text-primary-hover font-semibold transition-colors">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 mt-2 font-semibold shadow-md active:scale-[0.98] transition-transform"
            isLoading={isSubmitting}
            rightIcon={loginStatus !== 'success' ? <ArrowRight className="h-4 w-4" /> : undefined}
            disabled={isSubmitting}
          >
            {loginStatus === 'success'
              ? 'Loading your Forge...'
              : loginStatus === 'loading'
              ? 'Signing in...'
              : 'Sign In'}
          </Button>
        </form>

        {/* Social Authentication */}
        <div className="space-y-4 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/10" />
            </div>
            <span className="relative bg-background px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={() => success('Google Sign-In', 'This is a visual demo slot for Google OAuth.')}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-surface/60 hover:bg-surface hover:border-border-strong text-xs font-semibold text-foreground transition-all select-none active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Demo Credentials Helper */}
        <button
          type="button"
          onClick={() => {
            setEmail('demo@aihabittracker.com');
            setPassword('Password123!');
            setError('');
          }}
          className="w-full text-center text-xs text-primary/80 hover:text-primary transition-colors font-medium border border-dashed border-primary/20 rounded-lg p-2.5 bg-primary/5 cursor-pointer hover:border-primary/40"
        >
          🚀 Fill Demo Credentials
        </button>

        {/* Register Redirect */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          New to Daily Forge?{' '}
          <Link to="/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
            Create your account &rarr;
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
