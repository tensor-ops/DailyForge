import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      success('Welcome back! 👋', "Let's make today count.");
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.';
        setError(msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-ai text-white flex items-center justify-center shadow-ai-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-foreground">DailyForge</span>
      </div>

      <Card className="max-w-md w-full p-6 sm:p-8 bg-card border border-border shadow-popover">
        <div className="text-center space-y-1.5 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter your credentials to access your daily habits and AI insights
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
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
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-primary hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full text-xs"
            onClick={() => {
              setEmail('demo@aihabittracker.com');
              setPassword('Password123!');
              setError('');
            }}
          >
            🚀 Fill Demo Credentials
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};
