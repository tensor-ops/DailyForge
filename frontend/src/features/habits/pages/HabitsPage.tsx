import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { Habit, HabitCategory, EnrichedHabit, HabitsOverviewResponse } from '@/types/habit';

// Design System components
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { DeleteHabitModal } from '../components/DeleteHabitModal';
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
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES: ('all' | HabitCategory)[] = [
  'all',
  'Health',
  'Fitness',
  'Study',
  'Work',
  'Personal',
  'Finance',
  'Mindfulness',
  'Creativity',
  'Other',
];

type FilterType = 'all' | 'active' | 'at-risk' | 'strong' | 'new';
type SortField = 'default' | 'reliability' | 'completion' | 'streak';

export const HabitsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Your Habits');
  const navigate = useNavigate();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit?: (category?: HabitCategory) => void }>() || {};
  const { success, error } = useToast();

  const [overview, setOverview] = useState<HabitsOverviewResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortField>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenCreateHabit = () => {
    onOpenCreateHabit?.(selectedCategory !== 'all' ? selectedCategory : undefined);
  };

  // Deletion confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const fetchOverview = async () => {
    try {
      const data = await habitService.getHabitsOverview();
      setOverview(data);
    } catch {
      error('Failed to load habits', 'Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const handler = () => fetchOverview();
    window.addEventListener('habits-updated', handler);
    return () => window.removeEventListener('habits-updated', handler);
  }, []);

  const handleDeleteHabit = async (target: Habit) => {
    try {
      await habitService.deleteHabit(target.id);
      success('Habit deleted', `"${target.name}" was permanently removed.`);
      setOverview((prev) => {
        if (!prev) return prev;
        const updatedHabits = prev.habits.filter((h) => h.id !== target.id);
        const totalActive = updatedHabits.length;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            activeHabits: totalActive,
            atRisk: updatedHabits.filter((h) => h.isAtRisk).length,
            strong: updatedHabits.filter((h) => h.isStrong).length,
          },
          habits: updatedHabits,
        };
      });
      setDeleteTarget(null);
      window.dispatchEvent(new Event('habits-updated'));
    } catch {
      error('Deletion failed', 'Unable to delete habit.');
    }
  };

  const allHabits = useMemo(() => overview?.habits || [], [overview]);
  const summary = overview?.summary;

  // Filter & Sort Logic
  const filteredHabits = useMemo(() => {
    let result = allHabits.filter((h) => {
      // Category filter
      const matchCat = selectedCategory === 'all' || h.category === selectedCategory;

      // Status filter
      let matchStatus = true;
      if (filterType === 'active') {
        matchStatus = !h.isArchived;
      } else if (filterType === 'at-risk') {
        matchStatus = h.isAtRisk;
      } else if (filterType === 'strong') {
        matchStatus = h.isStrong;
      } else if (filterType === 'new') {
        matchStatus = h.isNew;
      }

      return matchCat && matchStatus;
    });

    // Sorting
    if (sortBy === 'reliability') {
      result = [...result].sort((a, b) => b.reliability - a.reliability);
    } else if (sortBy === 'completion') {
      result = [...result].sort((a, b) => b.completionRate - a.completionRate);
    } else if (sortBy === 'streak') {
      result = [...result].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
    }

    return result;
  }, [allHabits, selectedCategory, filterType, sortBy]);

  // Counts for filter badges
  const atRiskCount = useMemo(() => allHabits.filter((h) => h.isAtRisk).length, [allHabits]);
  const strongCount = useMemo(() => allHabits.filter((h) => h.isStrong).length, [allHabits]);
  const newCount = useMemo(() => allHabits.filter((h) => h.isNew).length, [allHabits]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setFilterType('all');
    setSortBy('default');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none pb-12">
      {/* Header */}
      <PageHeader
        title="Your Habits"
        description="Build routines that compound into lifelong consistency."
        actions={
          <button
            onClick={handleOpenCreateHabit}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </button>
        }
      />

      {/* Global Top KPI Cards (Unified Source of Truth) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Active Habits */}
        <div
          onClick={() => {
            setFilterType('all');
            setSelectedCategory('all');
          }}
          className="cursor-pointer transition-transform active:scale-[0.99]"
          title="Click to view all active habits"
        >
          <MetricCard
            title="Active Habits"
            value={summary ? summary.activeHabits : '—'}
            subtext="Across all categories"
            icon={Layers}
            accent="blue"
          />
        </div>

        {/* KPI 2: Average Reliability */}
        <div
          onClick={() => setSortBy(sortBy === 'reliability' ? 'default' : 'reliability')}
          className="cursor-pointer transition-transform active:scale-[0.99]"
          title="Click to sort by reliability"
        >
          <MetricCard
            title="Avg Reliability"
            value={summary ? `${summary.averageReliability}%` : '—'}
            subtext={sortBy === 'reliability' ? 'Sorted: Highest' : 'Scheduled adherence'}
            icon={TrendingUp}
            accent="blue"
          />
        </div>

        {/* KPI 3: Average Completion */}
        <div
          onClick={() => setSortBy(sortBy === 'completion' ? 'default' : 'completion')}
          className="cursor-pointer transition-transform active:scale-[0.99]"
          title="Click to sort by completion rate"
        >
          <MetricCard
            title="Avg Completion"
            value={summary ? `${summary.averageCompletion}%` : '—'}
            subtext={sortBy === 'completion' ? 'Sorted: Highest' : 'Last 30 days'}
            icon={CheckCircle2}
            accent="green"
          />
        </div>

        {/* KPI 4: At Risk Habits */}
        <div
          onClick={() => setFilterType('at-risk')}
          className="cursor-pointer transition-transform active:scale-[0.99]"
          title="Click to filter by at-risk habits"
        >
          <MetricCard
            title="At Risk"
            value={summary ? summary.atRisk : '—'}
            subtext={summary && summary.atRisk > 0 ? 'Requires attention' : 'All routines stable'}
            icon={AlertTriangle}
            accent={summary && summary.atRisk > 0 ? 'orange' : 'blue'}
          />
        </div>

        {/* KPI 5: Best Current Streak */}
        <div
          onClick={() => setSortBy(sortBy === 'streak' ? 'default' : 'streak')}
          className="cursor-pointer transition-transform active:scale-[0.99] col-span-2 sm:col-span-1"
          title="Click to sort by active streak"
        >
          <MetricCard
            title="Best Streak"
            value={summary ? `🔥 ${summary.bestCurrentStreak}d` : '—'}
            subtext={sortBy === 'streak' ? 'Sorted: Longest' : 'Active streak record'}
            icon={Flame}
            accent="orange"
          />
        </div>
      </div>

      {/* Habit Pulse & Health Distribution Strip */}
      {summary && summary.pulse && (
        <div className="p-3.5 rounded-2xl bg-surface-elevated/60 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="leading-snug">
              <strong className="text-primary font-bold mr-1">HABIT PULSE:</strong>
              {summary.pulse}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground shrink-0 self-end sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{summary.strong} Strong</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>{summary.healthDistribution.stable} Stable</span>
            </span>
            {summary.atRisk > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>{summary.atRisk} At Risk</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Controllers & View Switcher */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Status Filter Tabs with dynamic counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-bold text-xs">
            {([
              { id: 'all', label: 'All', count: allHabits.length },
              { id: 'active', label: 'Active', count: summary?.activeHabits || allHabits.length },
              { id: 'at-risk', label: 'At Risk', count: atRiskCount },
              { id: 'strong', label: 'Strong', count: strongCount },
              { id: 'new', label: 'New', count: newCount },
            ] as const).map((f) => {
              const isSelected = filterType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all border text-xs font-bold cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                      isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid / List Layout Switcher & Active Count */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[11px] font-semibold text-muted-foreground hidden md:inline-block">
              Showing {filteredHabits.length} of {allHabits.length} habits
            </span>

            <div className="flex items-center bg-surface-sunken p-1 border border-border rounded-xl text-muted-foreground">
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
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer select-none',
                selectedCategory === cat
                  ? 'bg-primary/15 border-primary text-primary shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
              )}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-muted/20 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        /* Contextual Empty State */
        allHabits.length === 0 ? (
          <EmptyState
            title="No habits created yet"
            description="Start forging consistency by creating your first daily or weekly routine."
            actionLabel="Create First Habit"
            onAction={handleOpenCreateHabit}
          />
        ) : (
          <div className="p-10 rounded-2xl border border-border/60 bg-surface-elevated/40 text-center space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <Filter className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-foreground">
                No matching habits found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No habits match the{' '}
                <strong className="text-foreground font-bold">
                  {filterType !== 'all' ? filterType : ''}{' '}
                  {selectedCategory !== 'all' ? selectedCategory : ''}
                </strong>{' '}
                criteria.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={handleOpenCreateHabit}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add {selectedCategory !== 'all' ? selectedCategory : ''} Habit
              </button>
            </div>
          </div>
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHabits.map((habit: EnrichedHabit) => {
            return (
              <Card
                key={habit.id}
                variant="interactive"
                className="p-5 flex flex-col justify-between gap-4 hover:border-primary/30 group"
              >
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground font-bold">
                          {habit.category}
                        </span>
                        {habit.isNew && (
                          <span className="text-[9px] bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-extrabold uppercase">
                            New
                          </span>
                        )}
                        {habit.isStrong && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-extrabold uppercase">
                            Strong
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-foreground leading-tight truncate">
                        {habit.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(habit);
                      }}
                      className="text-muted-foreground hover:text-danger p-1 rounded transition-colors cursor-pointer shrink-0"
                      title="Delete Habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Unified Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Reliability
                      </span>
                      <span className="text-foreground font-extrabold">{habit.reliability}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Consistency
                      </span>
                      <span className="text-foreground font-extrabold">{habit.consistency}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Current Streak
                      </span>
                      <span className="text-warning font-extrabold flex items-center gap-0.5">
                        <Flame className="h-3.5 w-3.5 fill-warning" />
                        {habit.currentStreak}d
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Friction
                      </span>
                      <span
                        className={cn(
                          'font-extrabold',
                          habit.friction === 'HIGH'
                            ? 'text-warning'
                            : habit.friction === 'MEDIUM'
                            ? 'text-blue-400'
                            : 'text-success'
                        )}
                      >
                        {habit.friction}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Stability Risk
                      </span>
                      <span
                        className={cn(
                          'font-extrabold',
                          habit.stabilityRisk === 'HIGH_RISK'
                            ? 'text-danger'
                            : habit.stabilityRisk === 'AT_RISK'
                            ? 'text-warning'
                            : habit.stabilityRisk === 'WATCH'
                            ? 'text-blue-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {habit.stabilityRisk.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Best Time
                      </span>
                      <span className="text-muted-foreground truncate block">
                        {habit.bestTime}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>Execution Progress</span>
                      <span>{habit.progress}%</span>
                    </div>
                    <ProgressBar value={habit.progress} />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/habits/${habit.id}`)}
                  className="w-full bg-surface-elevated border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm group-hover:bg-primary/10 group-hover:text-primary"
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
                {filteredHabits.map((habit: EnrichedHabit) => {
                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-muted/10 transition-all cursor-pointer"
                      onClick={() => navigate(`/habits/${habit.id}`)}
                    >
                      <td className="py-3 pl-2 text-foreground font-extrabold flex items-center gap-2">
                        <span>{habit.name}</span>
                        {habit.isNew && (
                          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.2 rounded font-extrabold">
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground font-bold">
                          {habit.category}
                        </span>
                      </td>
                      <td className="py-3 text-foreground font-bold">{habit.reliability}%</td>
                      <td className="py-3 text-foreground font-bold">{habit.consistency}%</td>
                      <td className="py-3 text-warning font-bold">🔥 {habit.currentStreak}d</td>
                      <td
                        className={cn(
                          'py-3 font-bold',
                          habit.friction === 'HIGH'
                            ? 'text-warning'
                            : habit.friction === 'MEDIUM'
                            ? 'text-blue-400'
                            : 'text-success'
                        )}
                      >
                        {habit.friction}
                      </td>
                      <td
                        className={cn(
                          'py-3 font-bold',
                          habit.stabilityRisk === 'HIGH_RISK'
                            ? 'text-danger'
                            : habit.stabilityRisk === 'AT_RISK'
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        )}
                      >
                        {habit.stabilityRisk.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-muted-foreground">{habit.bestTime}</td>
                      <td className="py-3 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(habit)}
                          className="text-muted-foreground hover:text-danger p-1.5 rounded transition-colors cursor-pointer"
                          title="Delete Habit"
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

      {/* GitHub-style Confirmation Dialog for Destructive Delete Action */}
      <DeleteHabitModal
        isOpen={!!deleteTarget}
        habit={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteHabit}
      />
    </div>
  );
};
