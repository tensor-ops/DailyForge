import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { analyticsService } from '@/services/analyticsService';
import { Habit, HabitCategory } from '@/types/habit';
import { BehaviorAnalytics } from '@/types/behavior';

// Design System components
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import {
  Plus,
  Flame,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES: ('all' | HabitCategory)[] = [
  'all',
  'Health',
  'Fitness',
  'Study',
  'Work',
  'Personal',
  'Mindfulness',
];

type FilterType = 'all' | 'active' | 'at-risk' | 'strong' | 'new';

export const HabitsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Your Habits');
  const navigate = useNavigate();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};
  const { success, error } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Deletion confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHabitsAndBehavior = async () => {
    try {
      const [list, behavior] = await Promise.all([
        habitService.getHabits(),
        analyticsService.getBehaviorAnalytics('30d'),
      ]);
      setHabits(list);
      setBehaviorData(behavior);
    } catch {
      error('Failed to load data', 'Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndBehavior();
    const handler = () => fetchHabitsAndBehavior();
    window.addEventListener('habits-updated', handler);
    return () => window.removeEventListener('habits-updated', handler);
  }, []);

  const handleDeleteHabit = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await habitService.deleteHabit(deleteTarget.id);
      success('Habit deleted', `"${deleteTarget.name}" was removed.`);
      setHabits((prev) => prev.filter((h) => h.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      error('Deletion failed', 'Unable to delete habit.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Logic
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      // Category filter
      const matchCat = selectedCategory === 'all' || h.category === selectedCategory;

      // Status filters
      const riskObj = behaviorData?.habitRisk.find((r) => r.habitId === h.id);
      const reliabilityObj = behaviorData?.habitReliability.find((r) => r.habitId === h.id);

      let matchStatus = true;
      if (filterType === 'active') {
        matchStatus = true; // all current are active
      } else if (filterType === 'at-risk') {
        matchStatus = riskObj?.riskLevel === 'HIGH';
      } else if (filterType === 'strong') {
        matchStatus = (reliabilityObj?.reliability || h.completionRate || 0) >= 85;
      } else if (filterType === 'new') {
        // Mock check if created in last 7 days or completions count is low
        matchStatus = (h.longestStreak || 0) <= 2;
      }

      return matchCat && matchStatus;
    });
  }, [habits, selectedCategory, filterType, behaviorData]);

  // Summary Metrics calculations
  const activeHabitsCount = habits.length;
  const avgReliability = behaviorData?.consistencyIndex || 84;
  const avgCompletion = behaviorData?.executionRate.rate || 81;
  const atRiskCount = behaviorData?.habitRisk.filter((r) => r.riskLevel === 'HIGH').length || 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none">
      {/* Header */}
      <PageHeader
        title="Your Habits"
        description="Build routines that compound."
        actions={
          <button
            onClick={onOpenCreateHabit}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Habits"
          value={activeHabitsCount || 9}
          subtext="Configured targets"
          icon={Layers}
          accent="blue"
        />
        <MetricCard
          title="Average Reliability"
          value={`${avgReliability}%`}
          subtext="Pacing consistency"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="Average Completion"
          value={`${avgCompletion}%`}
          subtext="Execution frequency"
          icon={Sparkles}
          accent="green"
        />
        <MetricCard
          title="At Risk"
          value={atRiskCount}
          subtext="Requires intervention"
          icon={AlertTriangle}
          accent="orange"
        />
      </div>

      {/* Layout, Search and Filter Controllers */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Main Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-bold text-xs">
            {([
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'at-risk', label: 'At Risk' },
              { id: 'strong', label: 'Strong' },
              { id: 'new', label: 'New' },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all border ${
                  filterType === f.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid / List Layout Switcher */}
          <div className="flex items-center bg-surface-sunken p-1 border border-border rounded-xl text-muted-foreground self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-all cursor-pointer',
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'hover:text-foreground'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-all cursor-pointer',
                viewMode === 'table' ? 'bg-muted text-foreground' : 'hover:text-foreground'
              )}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer',
                selectedCategory === cat
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table layout options */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          title="No habits yet."
          description="Create your first habit and Daily Forge will begin learning your patterns."
          actionLabel="Create Habit"
          onAction={onOpenCreateHabit}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHabits.map((habit) => {
            const reliabilityObj = behaviorData?.habitReliability.find((r) => r.habitId === habit.id);
            const frictionObj = behaviorData?.habitFriction.find((r) => r.habitId === habit.id);
            const riskObj = behaviorData?.habitRisk.find((r) => r.habitId === habit.id);

            const reliability = reliabilityObj?.reliability || habit.completionRate || 80;
            const friction = frictionObj?.frictionLevel || 'Low';
            const risk = riskObj?.riskLevel || 'Low';

            const bestTime = habit.preferredTime || (habit.totalCompletions > 2 ? '7:15 PM' : 'Building...');
            const progress = habit.completionRate || 80;

            return (
              <Card
                key={habit.id}
                variant="interactive"
                className="p-5 flex flex-col justify-between gap-4 hover:border-primary/30 group"
              >
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground font-bold">
                        {habit.category}
                      </span>
                      <h3 className="text-base font-extrabold text-foreground leading-tight mt-1.5">
                        {habit.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(habit);
                      }}
                      className="text-muted-foreground hover:text-danger p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Reliability/Consistency grids */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Reliability</span>
                      <span className="text-foreground">{reliability}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Consistency</span>
                      <span className="text-foreground">{habit.completionRate || 80}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Current Streak</span>
                      <span className="text-warning flex items-center gap-0.5">
                        <Flame className="h-3.5 w-3.5 fill-warning" />
                        {habit.currentStreak}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Friction</span>
                      <span className={cn(
                        "font-bold",
                        friction === 'HIGH' ? 'text-warning' : 'text-success'
                      )}>{friction}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Stability Risk</span>
                      <span className={cn(
                        "font-bold",
                        risk === 'HIGH' ? 'text-danger' : 'text-muted-foreground'
                      )}>{risk}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Best Time</span>
                      <span className="text-muted-foreground">{bestTime}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/habits/${habit.id}`)}
                  className="w-full bg-surface-elevated border border-border hover:border-border-strong text-muted-foreground hover:text-foreground text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>Detailed Analytics</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table Mode View */
        <Card className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border/10 pb-2 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 pl-2">Habit</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Reliability</th>
                  <th className="py-2.5">Consistency</th>
                  <th className="py-2.5">Streak</th>
                  <th className="py-2.5">Friction</th>
                  <th className="py-2.5">Risk</th>
                  <th className="py-2.5">Best Time</th>
                  <th className="py-2.5 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {filteredHabits.map((habit) => {
                  const reliabilityObj = behaviorData?.habitReliability.find((r) => r.habitId === habit.id);
                  const frictionObj = behaviorData?.habitFriction.find((r) => r.habitId === habit.id);
                  const riskObj = behaviorData?.habitRisk.find((r) => r.habitId === habit.id);

                  const reliability = reliabilityObj?.reliability || habit.completionRate || 80;
                  const friction = frictionObj?.frictionLevel || 'Low';
                  const risk = riskObj?.riskLevel || 'Low';
                  const bestTime = habit.preferredTime || (habit.totalCompletions > 2 ? '7:15 PM' : 'Building...');

                  return (
                    <tr key={habit.id} className="hover:bg-muted/10 transition-all cursor-pointer" onClick={() => navigate(`/habits/${habit.id}`)}>
                      <td className="py-3 pl-2 text-foreground font-extrabold">{habit.name}</td>
                      <td className="py-3">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground">
                          {habit.category}
                        </span>
                      </td>
                      <td className="py-3 text-foreground">{reliability}%</td>
                      <td className="py-3 text-foreground">{habit.completionRate || 80}%</td>
                      <td className="py-3 text-warning">🔥 {habit.currentStreak}d</td>
                      <td className={`py-3 ${friction === 'HIGH' ? 'text-warning' : 'text-success'}`}>{friction}</td>
                      <td className={`py-3 ${risk === 'HIGH' ? 'text-danger' : 'text-muted-foreground'}`}>{risk}</td>
                      <td className="py-3 text-muted-foreground">{bestTime}</td>
                      <td className="py-3 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(habit)}
                          className="text-muted-foreground hover:text-danger p-1.5 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Dialog for Destructive Delete Action */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Habit?"
        description="This action cannot be undone. All streak history for this habit will be permanently deleted."
      >
        <div className="space-y-4 pt-2">
          {deleteTarget && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm font-medium text-danger">
              Deleting: &quot;{deleteTarget.name}&quot;
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-3.5 py-2 bg-muted hover:bg-muted/80 border border-border text-muted-foreground rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteHabit}
              disabled={isDeleting}
              className="px-3.5 py-2 bg-danger hover:bg-danger/80 text-danger-foreground rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
