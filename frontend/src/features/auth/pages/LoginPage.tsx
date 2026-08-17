import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ArrowRight, Lock, Mail, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/utils/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthLayout } from '../components/AuthLayout';

export const LoginPage: React.FC = () => {
  useDocumentTitle('DailyForge — Sign In');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpStage, setOtpStage] = useState<'enter_email' | 'enter_otp'>('enter_email');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { sendOtp, verifyOtp, resendOtp, login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Send OTP for Sign In
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanEmail, 'login');
      setMaskedEmail(res.maskedEmail || cleanEmail);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtpStage('enter_otp');
      success('Verification code sent! ✉️', 'Check your inbox for your 6-digit code.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        setError(data?.message || 'Could not send verification email. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verify OTP for Sign In
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const targetOtp = (codeToVerify || otp).trim();
    setError('');

    if (targetOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), targetOtp, 'login');
      success('Welcome back! 👋', "Let's make today count.");
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        setError(data?.message || "Couldn't verify that code. Please try again.");
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);

    try {
      const res = await resendOtp(email.trim().toLowerCase(), 'login');
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtp('');
      success('New code sent! ✉️', 'A fresh 6-digit code has been dispatched.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        setError(data?.message || 'Could not resend code. Please try again shortly.');
      } else {
        setError('Failed to resend code.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle Password Login (Legacy/Fallback)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid credentials. Please try again.';
        setError(msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-5 text-left">
        {/* Method Toggle Pill */}
        <div className="flex bg-surface-sunken p-1 rounded-xl border border-border text-xs font-bold text-muted-foreground select-none">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              authMethod === 'otp'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border/60 font-black'
                : 'hover:text-foreground'
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              authMethod === 'password'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border/60 font-black'
                : 'hover:text-foreground'
            )}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password</span>
          </button>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* ================= OTP LOGIN FLOW ================= */}
        {authMethod === 'otp' && otpStage === 'enter_email' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Sign in to DailyForge
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your email address to receive a secure sign-in code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoFocus
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 font-bold shadow-md active:scale-[0.98] transition-all"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={isSubmitting}
              >
                Send Sign-In Code
              </Button>
            </form>
          </div>
        )}

        {/* ================= OTP ENTRY CARD: CHECK YOUR EMAIL ================= */}
        {authMethod === 'otp' && otpStage === 'enter_otp' && (
          <div className="space-y-5 animate-fade-in text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Mail className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit verification code to
              </p>
              <p className="text-xs font-mono font-extrabold text-foreground bg-surface-sunken px-3 py-1 rounded-lg border border-border inline-block">
                {maskedEmail || email}
              </p>
            </div>

            {/* 6-Digit OTP Input Box with auto-paste support */}
            <div className="py-2">
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={(completedCode) => handleVerifyOtp(completedCode)}
                disabled={isSubmitting}
                hasError={!!error}
                autoFocus
              />
            </div>

            {/* Verify CTA */}
            <Button
              type="button"
              variant="primary"
              onClick={() => handleVerifyOtp()}
              className="w-full h-11 font-bold shadow-md active:scale-[0.98] transition-all"
              isLoading={isSubmitting}
              disabled={isSubmitting || otp.length < 6}
            >
              Verify & Sign In
            </Button>

            {/* Resend Code Section with Countdown */}
            <div className="pt-2 text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <span>Didn&apos;t receive it?</span>
              {resendCooldown > 0 ? (
                <span className="font-mono text-xs text-muted-foreground/80 font-bold">
                  Resend code in <strong className="text-foreground">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isResending && 'animate-spin')} />
                  <span>Resend code</span>
                </button>
              )}
            </div>

            {/* Change Email */}
            <div className="pt-2 border-t border-border/80">
              <button
                type="button"
                onClick={() => {
                  setOtpStage('enter_email');
                  setOtp('');
                  setError('');
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground font-semibold transition-colors cursor-pointer"
              >
                &larr; Use a different email
              </button>
            </div>
          </div>
        )}

        {/* ================= PASSWORD LOGIN FLOW (FALLBACK) ================= */}
        {authMethod === 'password' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Sign in with password
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your DailyForge credentials.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@gmail.com"
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  }
                  required
                  disabled={isSubmitting}
                  className="pr-10"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 mt-2 font-bold shadow-md active:scale-[0.98] transition-all"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            {/* Demo Credentials Helper */}
            <button
              type="button"
              onClick={() => {
                setEmail('demo@aihabittracker.com');
                setPassword('Password123!');
                setError('');
              }}
              className="w-full text-center text-xs text-primary/80 hover:text-primary transition-colors font-semibold border border-dashed border-primary/25 rounded-xl p-2.5 bg-primary/5 cursor-pointer hover:border-primary/40"
            >
              ⚡ Fill Demo Credentials
            </button>
          </div>
        )}

        {/* Register Redirect */}
        <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border/80">
          New to Daily Forge?{' '}
          <Link to="/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
            Create your account &rarr;
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
