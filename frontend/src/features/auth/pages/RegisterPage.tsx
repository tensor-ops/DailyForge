import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowRight, 
  ArrowLeft,
  Lock, 
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
  Eye,
  EyeOff
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
  useDocumentTitle('DailyForge — Join Us');
  
  const { register, isAuthenticated, user, updateUserPreferences } = useAuth();
  const { success: showToast } = useToast();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Account fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Onboarding state
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [dailyCommitment, setDailyCommitment] = useState<string>('');
  const [goals, setGoals] = useState<string[]>([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daily_forge_onboarding_draft');
      if (saved) {
        const draft: OnboardingDraft = JSON.parse(saved);
        if (draft.focusAreas) setFocusAreas(draft.focusAreas);
        if (draft.dailyCommitment) setDailyCommitment(draft.dailyCommitment);
        if (draft.goals) setGoals(draft.goals);
        
        // If authenticated, we skip account creation (Step 1)
        if (isAuthenticated) {
          setStep(Math.max(2, draft.step || 2));
        } else {
          setStep(draft.step || 1);
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
        goals
      };
      localStorage.setItem('daily_forge_onboarding_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save onboarding draft:', e);
    }
  }, [step, focusAreas, dailyCommitment, goals]);

  // Real-time password strength check
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, password);
      showToast('Account created! 🎉', 'Please configure your preferences to build your Forge.');
      setStep(2);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.error?.details && Array.isArray(data.error.details)) {
          setError(data.error.details.map((e: { message: string }) => e.message).join(' · '));
        } else {
          setError(data?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
        goals
      });
      
      // Update local storage returning stats cache
      localStorage.setItem('daily_forge_last_user', JSON.stringify({
        name: user?.name || name || 'Developer',
        streakDays: 0,
        consistency: 100,
        tasksCompleted: 0,
        activeGoals: goals.length,
      }));

      // Clear onboarding draft
      localStorage.removeItem('daily_forge_onboarding_draft');

      showToast('Forge Configured! ⚙️', 'Your dashboard insights have been prepared.');
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
    // Prevent logged-in users from backing into account creation
    if (step > 2) {
      setStep(step - 1);
    } else if (step === 2 && !isAuthenticated) {
      setStep(1);
    }
  };

  // Step definition details
  const steps = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Focus' },
    { num: 3, label: 'Commitment' },
    { num: 4, label: 'Goals' }
  ];

  // Onboarding Selection Cards Data
  const focusOptions = [
    { id: 'study', icon: GraduationCap, title: 'Study', desc: 'Academics, learning new skills, or research.' },
    { id: 'career', icon: Laptop, title: 'Career', desc: 'Professional growth, tasks, or side projects.' },
    { id: 'fitness', icon: Dumbbell, title: 'Fitness', desc: 'Workout routines, diet, and physical habits.' },
    { id: 'growth', icon: Brain, title: 'Personal Growth', desc: 'Mindfulness, reading, journaling, and tracking.' },
    { id: 'productivity', icon: Zap, title: 'Productivity', desc: 'Time management, organization, and focus.' },
    { id: 'multiple', icon: Rocket, title: 'Multiple Goals', desc: 'Balancing multiple spheres simultaneously.' }
  ];

  const commitmentOptions = [
    { id: '30m', title: '30 minutes', text: 'Slight habit building. Easy to start.' },
    { id: '60m', title: '60 minutes', text: 'Moderate execution. Highly recommended.' },
    { id: '90m', title: '90 minutes', text: 'Substantial daily efforts. serious track.' },
    { id: '2h+', title: '2+ hours', text: 'High-intensity transformation routines.' }
  ];

  const goalOptions = [
    'Consistency', 'Focus', 'Time Management', 'Learning', 'Career Growth', 
    'Fitness', 'Habits', 'Productivity', 'Personal Growth'
  ];

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Step Indicator Header (Only for Steps 1-4) */}
        {step <= 4 && (
          <div className="w-full pb-6 border-b border-border/10">
            <div className="flex items-center justify-between max-w-sm mx-auto relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#151D2C] -z-0">
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
                        "h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300",
                        isCompleted 
                          ? "bg-primary border-primary text-white" 
                          : isActive
                          ? "bg-[#101622] border-primary text-primary ring-4 ring-primary/10"
                          : "bg-[#101622] border-[#1D293D] text-slate-500"
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span 
                      className={cn(
                        "text-[10px] font-bold tracking-wide uppercase transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground/60"
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
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        {/* ================= STEP 1: CREATE ACCOUNT ================= */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">
                Create your Daily Forge
              </h2>
              <p className="text-sm text-slate-400">
                Build better days, one decision at a time.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4 pt-2">
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                required
                disabled={isSubmitting}
                className="bg-[#101622] border-[#1D293D] text-slate-100"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                disabled={isSubmitting}
                className="bg-[#101622] border-[#1D293D] text-slate-100"
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters with caps & numbers"
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
                  className="bg-[#101622] border-[#1D293D] text-slate-100"
                />

                {/* Password strength checklist */}
                {password && (
                  <div className="p-3 bg-[#101622] border border-border/5 rounded-lg space-y-2.5">
                    <div className="space-y-1">
                      <div className="h-1 w-full bg-[#151D2C] rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            strength >= 75 ? 'bg-success' : strength >= 50 ? 'bg-warning' : 'bg-danger'
                          )}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right font-medium">
                        {strength >= 75 ? 'Strong password' : strength >= 50 ? 'Medium strength' : 'Weak password'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
                      <div className={cn("flex items-center gap-1.5", password.length >= 8 ? "text-success" : "")}>
                        <Check className="h-3.5 w-3.5" />
                        <span>8+ characters</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5", /[A-Z]/.test(password) ? "text-success" : "")}>
                        <Check className="h-3.5 w-3.5" />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5", /[a-z]/.test(password) ? "text-success" : "")}>
                        <Check className="h-3.5 w-3.5" />
                        <span>Lowercase letter</span>
                      </div>
                      <div className={cn("flex items-center gap-1.5", /[0-9]/.test(password) ? "text-success" : "")}>
                        <Check className="h-3.5 w-3.5" />
                        <span>Number included</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                }
                required
                disabled={isSubmitting}
                className="bg-[#101622] border-[#1D293D] text-slate-100"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-10 mt-2 font-semibold active:scale-[0.98] transition-transform"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-border/10">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-hover transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 2: FOCUS ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">
                What are you currently focused on?
              </h2>
              <p className="text-sm text-slate-400">
                We&apos;ll use this to personalize your experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 max-h-[360px] overflow-y-auto pr-1">
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
                      "flex flex-col text-left p-4 rounded-xl border transition-all select-none focus:outline-none min-h-[110px] justify-between cursor-pointer",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 text-slate-100" 
                        : "border-[#1D293D] bg-[#101622] text-slate-400 hover:border-primary/50 hover:bg-[#151D2C]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <IconComponent className={cn("h-6 w-6 shrink-0", isSelected ? "text-primary" : "text-slate-400")} />
                      {isSelected && <Check className="h-4.5 w-4.5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{opt.title}</h4>
                      <p className="text-[10px] text-slate-400/80 leading-normal mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/10">
              {!isAuthenticated && (
                <Button variant="outline" onClick={handlePrev} className="h-10 px-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="primary" 
                onClick={handleStep2Next} 
                className="flex-1 h-10 font-semibold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DAILY COMMITMENT ================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">
                How much can you commit each day?
              </h2>
              <p className="text-sm text-slate-400">
                Consistency matters more than intensity.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {commitmentOptions.map((opt) => {
                const isSelected = dailyCommitment === opt.title;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDailyCommitment(opt.title)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer focus:outline-none",
                      isSelected 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-[#1D293D] bg-[#101622] text-slate-400 hover:border-primary/50 hover:bg-[#151D2C]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0", isSelected ? "border-primary" : "border-[#1D293D]")}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{opt.title}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">{opt.text}</p>
                      </div>
                    </div>
                    <Clock className="h-4.5 w-4.5 text-slate-400/50" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/10">
              <Button variant="outline" onClick={handlePrev} className="h-10 px-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStep3Next} 
                className="flex-1 h-10 font-semibold"
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
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">
                What would you like to improve?
              </h2>
              <p className="text-sm text-slate-400">
                Select the core targets Daily Forge should assist you with.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2 max-h-[300px] overflow-y-auto">
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
                      "px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 select-none",
                      isSelected
                        ? "border-primary bg-primary text-slate-50 hover:bg-primary-hover shadow-sm"
                        : "border-[#1D293D] bg-[#101622] text-slate-400 hover:border-primary/50"
                    )}
                  >
                    <span>{goalName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/10">
              <Button variant="outline" onClick={handlePrev} className="h-10 px-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStep4Submit} 
                className="flex-1 h-10 font-semibold"
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
          <div className="space-y-5 animate-fade-in py-2 text-left">
            <div className="flex justify-center my-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-ai-glow">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl font-extrabold text-slate-50 tracking-tight">
                Your Forge is Ready
              </h2>
              <p className="text-xs text-muted-foreground">
                Welcome to Daily Forge, <span className="text-primary font-bold">{user?.name || name || 'Developer'}</span>.
              </p>
            </div>

            {/* System Configuration Box */}
            <div className="bg-[#101622] border border-[#1D293D] rounded-xl p-5 space-y-4">
              <div className="space-y-2 border-b border-border/10 pb-3">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Profile</span>
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Your tracking nodes are initialized for:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {focusAreas.map((f) => (
                    <span key={f} className="text-[9px] font-bold bg-[#151D2C] text-slate-300 border border-border/5 px-2 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                  <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    {dailyCommitment}/day
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">Objectives Configured</span>
                <p className="text-xs text-slate-350 flex items-center justify-between">
                  <span>Consistency Focus:</span>
                  <span className="font-bold text-slate-100">{goals.slice(0, 3).join(', ')}</span>
                </p>
                <div className="bg-success/5 border border-success/15 rounded-lg p-2.5 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-success tracking-wide uppercase">First Objective</span>
                    <h5 className="text-xs font-bold text-slate-100 mt-0.5">Complete your first day</h5>
                  </div>
                  <span className="text-xs font-mono font-bold text-success/80">0 / 3 tasks</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                // Clear any drafts from storage
                localStorage.removeItem('daily_forge_onboarding_draft');
                navigate('/dashboard');
              }}
              className="w-full h-10 mt-3 font-semibold text-slate-50 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 shadow-md flex items-center justify-center gap-1.5 select-none active:scale-[0.98] transition-transform"
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
