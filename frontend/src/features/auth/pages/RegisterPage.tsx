import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Check,
  GraduationCap,
  Laptop,
  Dumbbell,
  Brain,
  Zap,
  Rocket,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/utils/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthLayout } from '../components/AuthLayout';

interface OnboardingDraft {
  step: number;
  focusAreas: string[];
  dailyCommitment: string;
  goals: string[];
}

export const RegisterPage: React.FC = () => {
  useDocumentTitle('DailyForge — Create Your Account');

  const { sendOtp, verifyOtp, resendOtp, isAuthenticated, user, updateUserPreferences } = useAuth();
  const { success: showToast } = useToast();
  const navigate = useNavigate();

  // Wizard state: 1 = Email & OTP, 2 = Focus, 3 = Commitment, 4 = Goals, 5 = Ready
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Email OTP flow states
  const [authStage, setAuthStage] = useState<'enter_email' | 'enter_otp'>('enter_email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Onboarding state
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [dailyCommitment, setDailyCommitment] = useState<string>('');
  const [goals, setGoals] = useState<string[]>([]);

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

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daily_forge_onboarding_draft');
      if (saved) {
        const draft: OnboardingDraft = JSON.parse(saved);
        if (draft.focusAreas) setFocusAreas(draft.focusAreas);
        if (draft.dailyCommitment) setDailyCommitment(draft.dailyCommitment);
        if (draft.goals) setGoals(draft.goals);

        if (isAuthenticated) {
          setStep(Math.max(2, draft.step || 2));
        }
      } else if (isAuthenticated) {
        setStep(2);
      }
    } catch (e) {
      console.error('Failed to parse onboarding draft:', e);
    }
  }, [isAuthenticated]);

  // Save draft to localStorage when step/selections change
  useEffect(() => {
    try {
      const draft: OnboardingDraft = {
        step,
        focusAreas,
        dailyCommitment,
        goals,
      };
      localStorage.setItem('daily_forge_onboarding_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save onboarding draft:', e);
    }
  }, [step, focusAreas, dailyCommitment, goals]);

  // Handle Send Verification Code
  const handleSendCode = async (e: React.FormEvent) => {
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
      const res = await sendOtp(cleanEmail, 'registration');
      setMaskedEmail(res.maskedEmail || cleanEmail);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setAuthStage('enter_otp');
      showToast('Verification code sent! ✉️', 'Check your inbox for your 6-digit code.');
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

  // Handle Verify OTP
  const handleVerifyCode = async (codeToVerify?: string) => {
    const targetOtp = (codeToVerify || otp).trim();
    setError('');

    if (targetOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(email.trim().toLowerCase(), targetOtp, 'registration', name.trim() || undefined);
      showToast('Email verified! 🎉', 'Welcome to DailyForge.');
      
      // If user is returning/existing with configured preferences, proceed to dashboard
      if (!res.isNewUser && res.user.preferences?.goals?.length) {
        navigate('/dashboard');
      } else {
        setStep(2);
      }
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

  // Handle Resend Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);

    try {
      const res = await resendOtp(email.trim().toLowerCase(), 'registration');
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtp('');
      showToast('New code sent! ✉️', 'A fresh 6-digit code has been dispatched.');
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

  const handleStep2Next = () => {
    if (focusAreas.length === 0) {
      setError('Please select at least one focus area.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!dailyCommitment) {
      setError('Please select your daily commitment.');
      return;
    }
    setError('');
    setStep(4);
  };

  const handleStep4Submit = async () => {
    if (goals.length === 0) {
      setError('Please select at least one goal to improve.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await updateUserPreferences({
        focusAreas,
        dailyCommitment,
        goals,
      });

      localStorage.setItem(
        'daily_forge_last_user',
        JSON.stringify({
          name: user?.name || name || 'Developer',
          streakDays: 0,
          consistency: 100,
          tasksCompleted: 0,
          activeGoals: goals.length,
        })
      );

      localStorage.removeItem('daily_forge_onboarding_draft');
      showToast('Forge Configured! ⚙️', 'Your personal dashboard has been prepared.');
      setStep(5);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to save your selections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    setError('');
    if (step > 2) {
      setStep(step - 1);
    } else if (step === 2 && !isAuthenticated) {
      setStep(1);
    }
  };

  const steps = [
    { num: 1, label: 'Verify' },
    { num: 2, label: 'Focus' },
    { num: 3, label: 'Commitment' },
    { num: 4, label: 'Goals' },
  ];

  const focusOptions = [
    { id: 'study', icon: GraduationCap, title: 'Study', desc: 'Academics, learning new skills, or research.' },
    { id: 'career', icon: Laptop, title: 'Career', desc: 'Professional growth, projects, or work routines.' },
    { id: 'fitness', icon: Dumbbell, title: 'Fitness', desc: 'Workout routines, diet, and physical health.' },
    { id: 'growth', icon: Brain, title: 'Personal Growth', desc: 'Mindfulness, reading, journaling, and tracking.' },
    { id: 'productivity', icon: Zap, title: 'Productivity', desc: 'Time management, organization, and deep focus.' },
    { id: 'multiple', icon: Rocket, title: 'Multiple Goals', desc: 'Balancing multiple growth spheres simultaneously.' },
  ];

  const commitmentOptions = [
    { id: '30m', title: '30 minutes', text: 'Slight habit building. Easy to start.' },
    { id: '60m', title: '60 minutes', text: 'Moderate execution. Highly recommended.' },
    { id: '90m', title: '90 minutes', text: 'Substantial daily efforts. Serious consistency.' },
    { id: '2h+', title: '2+ hours', text: 'High-intensity transformation routines.' },
  ];

  const goalOptions = [
    'Consistency',
    'Focus',
    'Time Management',
    'Learning',
    'Career Growth',
    'Fitness',
    'Habits',
    'Productivity',
    'Personal Growth',
  ];

  return (
    <AuthLayout>
      <div className="space-y-6 text-left">
        {/* Step Indicator Header */}
        {step <= 4 && (
          <div className="w-full pb-5 border-b border-border">
            <div className="flex items-center justify-between max-w-sm mx-auto relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-0">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-1.5 z-10">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300',
                        isCompleted
                          ? 'bg-primary border-primary text-white'
                          : isActive
                          ? 'bg-surface-elevated border-primary text-primary ring-4 ring-primary/15 font-black'
                          : 'bg-surface-sunken border-border text-muted-foreground'
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold tracking-wide uppercase transition-colors duration-300',
                        isActive ? 'text-primary font-extrabold' : 'text-muted-foreground/60'
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* ================= STEP 1: EMAIL OTP AUTHENTICATION ================= */}
        {step === 1 && authStage === 'enter_email' && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Create your DailyForge account
              </h2>
              <p className="text-sm text-muted-foreground">
                Build consistency. One day at a time.
              </p>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4 pt-1">
              <Input
                label="Full Name (Optional)"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                disabled={isSubmitting}
              />

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
                Send Verification Code
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border/80">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-hover transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 1 (OTP ENTRY CARD): CHECK YOUR EMAIL ================= */}
        {step === 1 && authStage === 'enter_otp' && (
          <div className="space-y-5 animate-fade-in text-center">
            {/* Header Icon */}
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
                onComplete={(completedCode) => handleVerifyCode(completedCode)}
                disabled={isSubmitting}
                hasError={!!error}
                autoFocus
              />
            </div>

            {/* Verify CTA */}
            <Button
              type="button"
              variant="primary"
              onClick={() => handleVerifyCode()}
              className="w-full h-11 font-bold shadow-md active:scale-[0.98] transition-all"
              isLoading={isSubmitting}
              disabled={isSubmitting || otp.length < 6}
            >
              Verify & Continue
            </Button>

            {/* Resend Code Section with Live Countdown */}
            <div className="pt-2 text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <span>Didn&apos;t receive it?</span>
              {resendCooldown > 0 ? (
                <span className="font-mono text-xs text-muted-foreground/80 font-bold">
                  Resend code in <strong className="text-foreground">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
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
                  setAuthStage('enter_email');
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

        {/* ================= STEP 2: FOCUS AREAS ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                What are you currently focused on?
              </h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use this to personalize your Daily Forge intelligence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 max-h-[360px] overflow-y-auto pr-1">
              {focusOptions.map((opt) => {
                const isSelected = focusAreas.includes(opt.title);
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFocusAreas(focusAreas.filter((a) => a !== opt.title));
                      } else {
                        setFocusAreas([...focusAreas, opt.title]);
                      }
                    }}
                    className={cn(
                      'flex flex-col text-left p-4 rounded-xl border transition-all select-none focus:outline-none min-h-[110px] justify-between cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20 text-foreground'
                        : 'border-border bg-surface-elevated text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <IconComponent
                        className={cn('h-6 w-6 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
                      />
                      {isSelected && <Check className="h-4.5 w-4.5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{opt.title}</h4>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="primary"
                onClick={handleStep2Next}
                className="w-full h-10 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: COMMITMENT ================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                How much can you commit each day?
              </h2>
              <p className="text-sm text-muted-foreground">
                Consistency matters more than intensity.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {commitmentOptions.map((opt) => {
                const isSelected = dailyCommitment === opt.title;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDailyCommitment(opt.title)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer focus:outline-none',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border bg-surface-elevated text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0',
                          isSelected ? 'border-primary' : 'border-border'
                        )}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{opt.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.text}</p>
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={handlePrev} className="h-10 px-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                onClick={handleStep3Next}
                className="flex-1 h-10 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: GOALS ================= */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                What would you like to improve?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select the core targets Daily Forge should assist you with.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 max-h-[300px] overflow-y-auto">
              {goalOptions.map((goalName) => {
                const isSelected = goals.includes(goalName);
                return (
                  <button
                    key={goalName}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setGoals(goals.filter((g) => g !== goalName));
                      } else {
                        setGoals([...goals, goalName]);
                      }
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 select-none',
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-border bg-surface-elevated text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <span>{goalName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={handlePrev} className="h-10 px-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                onClick={handleStep4Submit}
                className="flex-1 h-10 font-bold"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={isSubmitting}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: ONBOARDING SUCCESS ================= */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in py-2 text-center">
            <div className="flex justify-center my-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-ai-glow">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Your Forge is Ready
              </h2>
              <p className="text-xs text-muted-foreground">
                Welcome to Daily Forge, <span className="text-primary font-bold">{user?.name || name || 'Forger'}</span>.
              </p>
            </div>

            {/* System Configuration Summary Card */}
            <div className="bg-surface-elevated border border-border rounded-2xl p-5 space-y-4 text-left shadow-sm">
              <div className="space-y-2 border-b border-border/80 pb-3">
                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase">System Profile</span>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  Tracking nodes initialized for:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {focusAreas.map((f) => (
                    <span key={f} className="text-[10px] font-bold bg-surface-sunken text-foreground border border-border px-2.5 py-0.5 rounded-lg">
                      {f}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-lg">
                    {dailyCommitment}/day
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-cyan-500 tracking-widest uppercase">Objectives Configured</span>
                <p className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Consistency Focus:</span>
                  <span className="font-bold text-foreground">{goals.slice(0, 3).join(', ')}</span>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                localStorage.removeItem('daily_forge_onboarding_draft');
                navigate('/dashboard');
              }}
              className="w-full h-11 font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <span>Enter Your Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
