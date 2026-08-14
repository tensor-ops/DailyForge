import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Bot,
  Flame,
  Circle,
  TrendingUp,
  ArrowUpRight,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Scroll tracking for Navbar background transition
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Hero Preview checklist interactive state
  const [previewHabits, setPreviewHabits] = useState([
    { id: 1, name: 'Morning walk', completed: true, category: 'Health', icon: '🚶‍♂️', streak: 14 },
    { id: 2, name: 'Read 20 pages', completed: true, category: 'Personal', icon: '📚', streak: 8 },
    { id: 3, name: 'Exercise', completed: false, category: 'Fitness', icon: '🏋️‍♂️', streak: 5 },
    { id: 4, name: 'Journal', completed: false, category: 'Mindfulness', icon: '✍️', streak: 12 },
  ]);

  const togglePreviewHabit = (id: number) => {
    setPreviewHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completed: !h.completed,
              streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );
  };

  const completedCount = previewHabits.filter((h) => h.completed).length;
  const totalCount = previewHabits.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Subtle intelligence interactive suggestion box state
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  // Navigation handlers
  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Static mock contribution grid data for HabitKit visualization
  // 5 rows (days of week roughly) x 24 columns for compact look
  const contributionGrid = [
    [2, 0, 1, 3, 0, 2, 4, 1, 0, 3, 2, 1, 0, 2, 4, 0, 1, 3, 0, 2, 1, 0, 3, 2],
    [0, 3, 2, 0, 4, 1, 0, 2, 3, 1, 0, 4, 2, 0, 1, 3, 2, 0, 4, 1, 0, 3, 2, 0],
    [1, 2, 0, 3, 1, 0, 2, 4, 0, 3, 2, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 0, 1, 3],
    [3, 0, 4, 1, 0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 0, 1, 3, 0, 2, 1, 0],
    [2, 1, 0, 3, 2, 1, 0, 2, 4, 0, 1, 3, 0, 2, 4, 1, 0, 3, 2, 1, 0, 3, 2, 4],
  ];

  // Colors mapping for levels of consistency
  const getContributionColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-primary/20 dark:bg-primary/30';
      case 2: return 'bg-primary/45 dark:bg-primary/50';
      case 3: return 'bg-primary/70 dark:bg-primary/70';
      case 4: return 'bg-primary dark:bg-primary-hover';
      default: return 'bg-muted/50 dark:bg-muted/30';
    }
  };

  const faqData = [
    {
      q: 'What makes this different from a normal habit tracker?',
      a: 'Instead of just logging checkmarks, we help you understand the invisible patterns behind your actions. We analyze consistency trends and note peak performance windows to help you adapt your routines organically.',
    },
    {
      q: 'Can I create custom habits?',
      a: 'Absolutely. You can define custom habit names, select custom icons, categorize your goals, and set flexible schedules that align with your lifestyle.',
    },
    {
      q: 'How does the suggestion system work?',
      a: 'Our intelligence system analyzes completed times, streaks, and days of the week to highlight trends. For example, it detects if you complete a habit significantly more consistently at a specific hour and suggests simple schedule refinements.',
    },
    {
      q: 'Can I track measurable habits?',
      a: 'Yes, you can track both simple checkmarks and progress-based habits with specific targets (like pages read, miles run, or ounces of hydration).',
    },
    {
      q: 'Is Notion integration supported?',
      a: 'Yes. You can optionally link your Notion workspace to sync daily habit metrics directly to your private databases for centralized knowledge management.',
    },
    {
      q: 'Is my data private and secure?',
      a: 'Your privacy is paramount. Your tracked logs, analysis, and custom goals remain private, stored securely, and are fully exportable at any point.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 scroll-smooth">
      {/* 1. STICKY NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3 shadow-subtle'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo checkmark loop */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-subtle border border-primary/10">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" className="opacity-45" />
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">DailyForge</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">How it works</button>
            <button onClick={() => scrollToSection('analytics')} className="hover:text-foreground transition-colors">Insights</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-foreground transition-colors">FAQ</button>
          </div>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg h-9 w-9 p-0"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-foreground/90 font-medium"
            >
              Sign in
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCTA}
              className="px-4 shadow-subtle"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center gap-2.5 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg h-8 w-8 p-0"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground/80 hover:text-foreground focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 border-b border-border/80 px-6 py-6 space-y-4 shadow-popover backdrop-blur-xl animate-scale-in">
            <div className="flex flex-col gap-4 font-semibold text-base text-foreground/85">
              <button onClick={() => scrollToSection('features')} className="text-left py-1 hover:text-primary transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1 hover:text-primary transition-colors">How it works</button>
              <button onClick={() => scrollToSection('analytics')} className="text-left py-1 hover:text-primary transition-colors">Insights</button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-1 hover:text-primary transition-colors">FAQ</button>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-foreground/90 py-2.5"
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTA();
                }}
                className="w-full py-2.5"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Soft atmospheric radial gradient glow */}
        <div className="absolute top-16 -z-10 h-[360px] w-[360px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-36 -z-10 h-[360px] w-[360px] rounded-full bg-ai/10 blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 tracking-wide animate-fade-in">
          <span>Build better routines.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.12] mb-6 animate-fade-in">
          Build habits that <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-ai bg-clip-text text-transparent">actually stick.</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8 animate-fade-in [animation-delay:100ms]">
          Track what matters, understand your progress, and build routines that fit your life. Motivation gets you started, a clean system keeps you consistent.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-3 animate-fade-in [animation-delay:200ms]">
          <Button
            size="lg"
            variant="primary"
            onClick={handleCTA}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full sm:w-auto shadow-elevated px-7"
          >
            Start Building Habits
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection('how-it-works')}
            className="w-full sm:w-auto px-7"
          >
            See How It Works
          </Button>
        </div>
        <span className="text-xs text-muted-foreground mt-2 animate-fade-in [animation-delay:250ms]">
          No complicated setup. Just start with one habit.
        </span>

        {/* 3. HERO VISUAL - INTERACTIVE PRODUCT PREVIEW */}
        <div className="mt-16 w-full max-w-4xl p-2 sm:p-4 rounded-2xl border border-border/80 bg-card/45 backdrop-blur-md shadow-popover animate-fade-in [animation-delay:300ms]">
          <div className="rounded-xl border border-border/60 bg-surface-sunken p-4 sm:p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger/60" />
                <span className="h-3 w-3 rounded-full bg-warning/60" />
                <span className="h-3 w-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs font-mono text-muted-foreground/80 hidden sm:inline-block">app.dailyforge.com/dashboard</span>
              <Badge variant="warning" size="sm" className="font-semibold">🔥 14-Day Streak</Badge>
            </div>

            {/* Simulated Live Grid inside Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
              {/* Left Column: Progress Ring & Insight Card */}
              <div className="md:col-span-5 flex flex-col justify-between gap-4">
                <Card className="p-5 flex items-center justify-between bg-card/90">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Today&apos;s Score</span>
                    <div className="text-3xl font-extrabold text-foreground mt-1">{completionPercentage}%</div>
                    <span className="text-xs text-success-foreground font-semibold bg-success/15 px-2 py-0.5 rounded-md inline-block">
                      +12% vs last week
                    </span>
                  </div>
                  <ProgressRing
                    value={completionPercentage}
                    size={80}
                    strokeWidth={7}
                    color="rgb(var(--color-primary))"
                    trackColor="rgb(var(--color-muted) / 0.7)"
                    label={`${completedCount}/${totalCount}`}
                    sublabel="Done"
                    animated
                  />
                </Card>

                {/* Subtle AI Insight Box */}
                <Card variant="ai" className="p-4 bg-card/90 flex flex-col justify-between gap-3 border-l-4 border-l-ai">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-ai uppercase tracking-wider">Consistency Trend</span>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        Your mornings have been your most consistent time. Completed habits are 40% higher before 10 AM.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Habits Checklist */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <Card className="p-5 bg-card/90 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Habits</span>
                    <span className="text-[10px] text-muted-foreground/80 font-mono italic">Click checklist to interact</span>
                  </div>

                  <div className="space-y-2.5">
                    {previewHabits.map((habit) => (
                      <div
                        key={habit.id}
                        onClick={() => togglePreviewHabit(habit.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                          habit.completed
                            ? 'bg-success/5 border-success/20 hover:border-success/35'
                            : 'bg-surface hover:bg-card-hover border-border hover:border-border-strong'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg p-1.5 rounded-lg bg-muted/60 dark:bg-muted/20 shrink-0">{habit.icon}</span>
                          <div>
                            <p className={`text-xs sm:text-sm font-semibold truncate ${
                              habit.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}>
                              {habit.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium">{habit.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-semibold text-warning/90 flex items-center gap-0.5">
                            <Flame className="h-3 w-3 fill-warning" /> {habit.streak}d
                          </span>
                          <button
                            type="button"
                            aria-label={habit.completed ? 'Mark incomplete' : 'Mark complete'}
                            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              habit.completed
                                ? 'bg-success text-success-foreground'
                                : 'border border-border text-muted-foreground hover:border-primary'
                            }`}
                          >
                            {habit.completed ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF */}
      <section className="py-12 border-y border-border/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">Designed for everyday consistency</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-bold text-muted-foreground/60">
            <span className="hover:text-foreground/80 transition-colors">React 18</span>
            <span className="hover:text-foreground/80 transition-colors">Tailwind CSS</span>
            <span className="hover:text-foreground/80 transition-colors">NodeJS</span>
            <span className="hover:text-foreground/80 transition-colors">MongoDB</span>
            <span className="hover:text-foreground/80 transition-colors">Modern Web APIs</span>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Most habit trackers help you record. <br />
            <span className="text-muted-foreground font-semibold">Few help you understand.</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Completing tasks is only half the battle. Building a sustainable system requires noticing what keeps you from finishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 bg-card/60 hover:border-primary/30 transition-colors">
            <div className="text-2xl font-mono font-extrabold text-primary/30">01</div>
            <h3 className="text-lg font-bold text-foreground">Too much friction</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You spend more time configuring reminders, typing, and managing widgets than actually doing the habits.
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-card/60 hover:border-indigo-400/30 transition-colors">
            <div className="text-2xl font-mono font-extrabold text-indigo-400/30">02</div>
            <h3 className="text-lg font-bold text-foreground">Progress gets blurry</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A completed checkbox doesn&apos;t explain why you succeeded on Tuesday but struggled on Thursday.
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-card/60 hover:border-ai/30 transition-colors">
            <div className="text-2xl font-mono font-extrabold text-ai/30">03</div>
            <h3 className="text-lg font-bold text-foreground">Motivation fades</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Missing a day should be a learning point, not a penalty that forces you to restart your progress entirely.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. PRODUCT SOLUTION LOOP */}
      <section className="py-20 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">The Consistency Loop</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Meet your simpler way to stay consistent.</h2>
          </div>

          {/* Process flow layout */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative">
            <div className="text-center space-y-3 p-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-lg font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Plan</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose what matters and set scheduling constraints.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto text-lg font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">Do</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Execute your routine with minimal mental overhead.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="h-12 w-12 rounded-2xl bg-ai/10 text-ai flex items-center justify-center mx-auto text-lg font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">Track</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Log items with a single tap as you complete your day.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="h-12 w-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto text-lg font-bold">
                4
              </div>
              <h3 className="font-bold text-base text-foreground">Understand</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Discover schedule trends and lock in your gains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURE SHOWCASE */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-12">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Everything you need to build a routine</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            A complete suite of clear, human-focused capabilities to support long-term self-awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">01 / Track</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create habits that fit your actual schedule. Track weekday targets, daily metrics, or customizable monthly goals.
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">02 / Understand</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See patterns through streaks, history, and meaningful analytics. No numbers that overwhelm, just the clarity you need.
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-ai/10 text-ai flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">03 / Improve</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get thoughtful suggestions based on how you actually behave. Invisible, supportive intelligence working below the surface.
            </p>
          </div>
        </div>
      </section>

      {/* 8. HABIT TRACKING GRID & ANNOTATIONS */}
      <section className="py-20 border-t border-border/50 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card shadow-card space-y-3.5 relative overflow-hidden">
                {/* Annotations overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    One-tap completion
                  </span>
                  <span className="text-[10px] font-semibold bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded">
                    Dynamic streaks
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Morning Routines</span>
                  <span className="text-[10px] text-muted-foreground">3 habits</span>
                </div>

                {/* Habit Cards mockup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">💧</span>
                      <span className="text-xs font-bold text-foreground">Hydration & Electrolytes</span>
                    </div>
                    <span className="text-[10px] font-semibold text-warning flex items-center gap-0.5">
                      <Flame className="h-3 w-3 fill-warning" /> 18d
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🧘‍♂️</span>
                      <span className="text-xs font-bold text-foreground">Mindful Breathing</span>
                    </div>
                    <span className="text-[10px] font-semibold text-warning flex items-center gap-0.5">
                      <Flame className="h-3 w-3 fill-warning" /> 5d
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text description */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Clarity First</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Your day, at a glance.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log routines without breaking flow. See daily progress rings update in real-time, maintain habit streaks easily, and manage everything with simple gestures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTRIBUTION GRID SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-border/50">
        <div className="space-y-4 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Consistency Over Time</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">See your consistency take shape.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every small action becomes part of a bigger picture. Track daily progress patterns and watch your habit history turn into lasting routines.
          </p>
        </div>

        {/* Visual HabitKit Contribution Heat Map */}
        <Card className="p-6 max-w-2xl mx-auto bg-card/75 border-border/80">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">Consistency Heatmap</span>
              <span>Last 120 Days</span>
            </div>

            {/* Contribution boxes */}
            <div className="flex flex-col gap-1.5 overflow-x-auto pb-2 scrollbar-none items-center">
              {contributionGrid.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-1.5 min-w-max">
                  {row.map((level, cIdx) => (
                    <div
                      key={cIdx}
                      className={`h-4.5 w-4.5 rounded-[3px] transition-colors duration-300 hover:scale-115 ${getContributionColor(level)}`}
                      title={`Level ${level} consistency`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Grid Legend */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground mt-1">
              <span>Less consistent</span>
              <div className="h-3.5 w-3.5 rounded-[2px] bg-muted/50 dark:bg-muted/30" />
              <div className="h-3.5 w-3.5 rounded-[2px] bg-primary/20 dark:bg-primary/30" />
              <div className="h-3.5 w-3.5 rounded-[2px] bg-primary/45 dark:bg-primary/50" />
              <div className="h-3.5 w-3.5 rounded-[2px] bg-primary/70 dark:bg-primary/70" />
              <div className="h-3.5 w-3.5 rounded-[2px] bg-primary" />
              <span>More consistent</span>
            </div>
          </div>
        </Card>
      </section>

      {/* 10. ANALYTICS SECTION */}
      <section id="analytics" className="py-24 border-t border-border/50 bg-muted/20 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text description */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Meaningful Trends</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Progress you can actually understand.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Look beyond today&apos;s checkbox. See how your routines evolve over time, notice which categories thrive, and build long-term Momentum with clean, readable reports.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-foreground/80">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Completion trends</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Category analysis</span>
              </div>
            </div>

            {/* Visual Analytics preview */}
            <div className="lg:col-span-7">
              <Card className="p-6 bg-card border-border/80 space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Weekly Completion Rate</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Average consistency score: 87%</p>
                  </div>
                  <Badge variant="success" size="sm" className="font-semibold">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2% Period
                  </Badge>
                </div>

                {/* SVG/div Column Chart */}
                <div className="h-36 flex items-end justify-between gap-3.5 pt-2">
                  {[
                    { day: 'M', pct: 75 },
                    { day: 'T', pct: 88 },
                    { day: 'W', pct: 100 },
                    { day: 'T', pct: 60 },
                    { day: 'F', pct: 85 },
                    { day: 'S', pct: 70 },
                    { day: 'S', pct: 95 },
                  ].map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[9px] font-mono text-muted-foreground font-semibold">{d.pct}%</span>
                      <div className="w-full bg-muted/60 dark:bg-muted/20 rounded-t-md overflow-hidden h-full max-h-24 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-indigo-500 rounded-t-md transition-all duration-500"
                          style={{ height: `${d.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold">{d.day}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 11. SUBTLE INTELLIGENCE SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual suggestion card */}
          <div className="lg:col-span-6 flex justify-center">
            <Card variant="ai" className="p-6 max-w-sm w-full bg-card/90 border-ai/20 shadow-ai-glow">
              <div className="flex items-start justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-ai" />
                  <span className="text-xs font-bold text-ai uppercase tracking-wider">Pattern Noticed</span>
                </div>
                <Badge variant="ai" size="sm" className="text-[10px]">92% confidence</Badge>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                  You are consistently completing <strong className="text-primary font-semibold">Mindful Reading</strong> before 10 AM.
                </p>
                <div className="p-3 rounded-lg bg-surface border border-border/80 text-xs text-muted-foreground leading-relaxed">
                  18 of your last 22 sessions were completed in the morning. Try shifting your reminder to 9:00 AM.
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                  {suggestionApplied ? (
                    <span className="text-xs text-success font-semibold flex items-center gap-1 py-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Suggestion applied to 9:00 AM
                    </span>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setSuggestionApplied(true)} className="text-xs">
                        Dismiss
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setSuggestionApplied(true)} className="text-xs px-3.5 bg-ai hover:bg-ai/90">
                        Apply suggestion
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Text description */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-ai uppercase tracking-wide">Thoughtful suggestions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Your habits tell a story.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As you build your routine, the system detects patterns that are easy to miss. Rather than offering pushy reminders, it suggests minor changes to help habits fit your schedule naturally.
            </p>
            <div className="pt-2 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ai" /> Personalized guidance based on actual behavior.</p>
              <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ai" /> Quiet coach approach—never a chatbot gimmick.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. GOALS SECTION */}
      <section className="py-20 border-t border-border/50 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text description */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Purpose-driven systems</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Connect habits to bigger goals.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Habits become more meaningful when they have a clear reason. Map daily checklist routines to overarching goals, tracking your progress dynamically.
              </p>
            </div>

            {/* Visual Goals Mockup */}
            <div className="lg:col-span-7">
              <Card className="p-6 bg-card border-border/80 space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Goal Focus</span>
                    <h3 className="text-sm font-bold text-foreground">Prepare for Placements</h3>
                  </div>
                  <Badge variant="default" size="sm" className="font-semibold">68% Complete</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Associated Habits</span>
                    <span>Status</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { habit: 'DSA Practice', status: '✓ Complete', color: 'text-success' },
                      { habit: 'Technical Reading', status: '✓ Complete', color: 'text-success' },
                      { habit: 'Exercise', status: '○ Remaining', color: 'text-muted-foreground' },
                      { habit: 'Consistent Sleep Schedule', status: '○ Remaining', color: 'text-muted-foreground' },
                    ].map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border text-xs">
                        <span className="font-semibold text-foreground">{h.habit}</span>
                        <span className={`font-medium ${h.color}`}>{h.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 13. ACHIEVEMENTS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border/50">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Celebration</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Progress worth celebrating.</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Not an arcade, just meaningful milestones to acknowledge your consistency over time.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { badge: '🌱', title: 'First Step', desc: 'Completed first habit' },
            { badge: '🔥', title: '7 Day Streak', desc: 'Maintained consistency' },
            { badge: '💯', title: '100 Completions', desc: 'Milestone reached' },
            { badge: '🏆', title: 'Perfect Week', desc: 'All habits checked' },
          ].map((item, idx) => (
            <Card key={idx} className="p-5 text-center space-y-3 bg-card hover:scale-102 transition-transform duration-200">
              <span className="text-3xl block">{item.badge}</span>
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 14. NOTION SECTION */}
      <section className="py-20 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text description */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Integrations</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Your habits can live wherever you work.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create your personal Habit OS in Notion. Keep habits, reflections, goals, and daily progress together in a unified workspace database.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowUpRight className="h-3 w-3" />}>
                  Create My Habit OS
                </Button>
              </div>
            </div>

            {/* Visual Notion preview */}
            <div className="lg:col-span-7">
              <Card className="p-5 bg-card border-border/80 font-sans space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-muted flex items-center justify-center font-bold text-foreground text-[10px]">N</span>
                    <span className="font-bold text-foreground">Notion Habit Sync DB</span>
                  </div>
                  <span className="text-[10px] text-success font-medium">● Connected</span>
                </div>

                {/* Simulated database rows */}
                <div className="space-y-2 font-mono">
                  <div className="grid grid-cols-12 gap-2 p-2 rounded bg-surface border border-border text-[10px]">
                    <div className="col-span-5 font-bold text-foreground truncate">Habit Name</div>
                    <div className="col-span-4 text-muted-foreground text-center">Frequency</div>
                    <div className="col-span-3 text-right text-primary font-bold">Sync Status</div>
                  </div>
                  {[
                    { name: 'Morning walk', freq: 'Daily', status: 'Synced' },
                    { name: 'Technical Reading', freq: 'Daily', status: 'Synced' },
                    { name: 'DSA Practice', freq: 'Weekdays', status: 'Synced' },
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2 rounded bg-surface/50 border border-border/60 text-[10px]">
                      <div className="col-span-5 font-semibold text-foreground truncate">{row.name}</div>
                      <div className="col-span-4 text-muted-foreground text-center">{row.freq}</div>
                      <div className="col-span-3 text-right text-success font-medium">{row.status}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 15. WEEKLY REVIEW SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Weekly review preview */}
          <div className="lg:col-span-6 flex justify-center">
            <Card className="p-6 max-w-sm w-full bg-card border-border/80 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Week</span>
                <Badge variant="success" size="sm" className="font-semibold">+12% vs last week</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">87% Completion</span>
                  <span className="text-xs text-muted-foreground">24/28 completed</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-success/5 rounded border border-success/15">
                    <span className="text-muted-foreground">Strongest habit:</span>
                    <span className="font-bold text-foreground">Reading</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-warning/5 rounded border border-warning/15">
                    <span className="text-muted-foreground">Needs attention:</span>
                    <span className="font-bold text-foreground">Exercise</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground leading-relaxed">
                  💡 A small change for next week: Move exercise to mornings.
                </div>
              </div>
            </Card>
          </div>

          {/* Text description */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Reflections</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Learn from your weeks.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every Sunday, receive a simple weekly snapshot. Acknowledge what went well, identify minor friction points, and start the upcoming week with a better plan.
            </p>
          </div>
        </div>
      </section>

      {/* 16. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 border-t border-border/50 bg-muted/20 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Simple workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">How it works</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Three clear steps to establish behavioral momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center space-y-3 bg-card/60">
              <span className="text-3xl">01</span>
              <h3 className="text-base font-bold text-foreground">Create</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose a habit that matters. Setup schedule frequency and custom reminders.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 bg-card/60">
              <span className="text-3xl">02</span>
              <h3 className="text-base font-bold text-foreground">Track</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Make it part of your day. Log tasks with a single tap in your dashboard checklist.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 bg-card/60">
              <span className="text-3xl">03</span>
              <h3 className="text-base font-bold text-foreground">Improve</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Learn from your progress. Apply minor shifts to optimize your daily consistency.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 17. FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto border-t border-border/50 scroll-mt-12">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">
            Clear responses to common questions about our system.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border-b border-border/60 pb-4">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2 font-semibold text-sm sm:text-base text-foreground focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2.5 animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 18. FINAL CTA */}
      <section className="relative py-24 px-6 border-t border-border/50 bg-gradient-to-b from-transparent to-primary/5 text-center overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Start with one habit.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            You don&apos;t need to change everything today. Just start with something that matters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleCTA}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto shadow-elevated px-7 animate-pulse-subtle"
            >
              Create Your First Habit
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-7"
            >
              Explore the App
            </Button>
          </div>
        </div>
      </section>

      {/* 19. FOOTER */}
      <footer className="border-t border-border bg-surface/30 px-6 py-16 text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">D</div>
              <span className="font-extrabold text-sm text-foreground">DailyForge</span>
            </div>
            <p className="max-w-xs leading-relaxed text-muted-foreground/80">
              A beautifully designed habit system that helps you become more consistent. Turn daily routines into lasting progress.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">Habits</button></li>
              <li><button onClick={() => scrollToSection('analytics')} className="hover:text-foreground transition-colors">Analytics</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">Goals</button></li>
            </ul>
          </div>

          {/* Resources links */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Resources</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">How it works</button></li>
              <li><button onClick={() => scrollToSection('faq')} className="hover:text-foreground transition-colors">FAQ</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">Documentation</button></li>
            </ul>
          </div>

          {/* Connect links */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Connect</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} DailyForge. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
          <span className="text-[11px] font-semibold text-primary/80 uppercase tracking-wide">Built for better routines.</span>
        </div>
      </footer>
    </div>
  );
};
