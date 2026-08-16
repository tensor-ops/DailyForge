import React, { useEffect, useState, useMemo } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { GoalModal } from '@/features/goals/components/GoalModal';
import { goalService } from '@/services/goalService';
import { Goal, GoalOverviewSummary } from '@/types/goal';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
} from 'lucide-react';

export const GoalsDashboard: React.FC = () => {
  useDocumentTitle('DailyForge — Goals');
  const { success, error, info } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalOverviewSummary>({
    activeGoals: 0,
    averageProgress: 0,
    onTrackCount: 0,
    atRiskCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters and Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'updated' | 'progress' | 'deadline' | 'velocity' | 'name'>('updated');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getGoals({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
      });
      setGoals(res.goals);
      setSummary(res.summary);
    } catch {
      error('Failed to load goals', 'Could not retrieve goals data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();

    const handleUpdate = () => fetchGoals();
    window.addEventListener('goals-updated', handleUpdate);
    return () => window.removeEventListener('goals-updated', handleUpdate);
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGoals();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Sorted Goals
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'velocity') return (b.velocity || 0) - (a.velocity || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'deadline') {
        const da = a.targetDate || a.deadline || '9999-99-99';
        const db = b.targetDate || b.deadline || '9999-99-99';
        return da.localeCompare(db);
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [goals, sortBy]);

  // Handlers for Goal Card actions
  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handlePauseToggle = async (goalId: string) => {
    try {
      await goalService.togglePauseGoal(goalId);
      success('Goal status updated', 'Pause state modified.');
      fetchGoals();
    } catch {
      error('Update failed', 'Could not toggle pause state.');
    }
  };

  const handleDuplicate = async (goalId: string) => {
    try {
      await goalService.duplicateGoal(goalId);
      success('Goal duplicated! ✦', 'A copy of the goal has been created.');
      fetchGoals();
    } catch {
      error('Duplication failed', 'Could not duplicate goal.');
    }
  };

  const handleArchive = async (goalId: string) => {
    try {
      await goalService.archiveGoal(goalId);
      info('Goal archived', 'Goal moved to archive.');
      fetchGoals();
    } catch {
      error('Archive failed', 'Could not archive goal.');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this goal?')) return;
    try {
      await goalService.deleteGoal(goalId);
      success('Goal deleted', 'The goal and its associations were removed.');
      fetchGoals();
    } catch {
      error('Deletion failed', 'Could not delete goal.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none pb-12">
      {/* Header */}
      <PageHeader
        title="Goals"
        description="Turn long-term ambitions into daily actions."
        actions={
          <button
            onClick={() => {
              setSelectedGoal(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        }
      />

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Goals"
          value={summary.activeGoals}
          subtext="Target milestones"
          icon={Target}
          accent="blue"
        />
        <MetricCard
          title="Average Progress"
          value={`${summary.averageProgress}%`}
          subtext="Across active goals"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="On Track"
          value={summary.onTrackCount}
          subtext="Stable trajectory"
          icon={CheckCircle2}
          accent="green"
        />
        <MetricCard
          title="At Risk"
          value={summary.atRiskCount}
          subtext="Needs attention"
          icon={AlertTriangle}
          accent="orange"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search goals by title, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AHEAD">Ahead</option>
            <option value="AT_RISK">At Risk</option>
            <option value="BEHIND">Behind</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Career">Career</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Fitness">Fitness</option>
            <option value="Finance">Finance</option>
            <option value="Personal">Personal</option>
            <option value="Projects">Projects</option>
            <option value="Other">Other</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="updated">Recently Updated</option>
            <option value="progress">Highest Progress</option>
            <option value="velocity">Fastest Velocity</option>
            <option value="deadline">Upcoming Deadline</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : sortedGoals.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-card border border-border rounded-card p-6">
          <div className="text-4xl">🎯</div>
          <h3 className="text-base font-extrabold text-foreground">
            {search || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'
              ? 'No matching goals found'
              : 'No Goals Yet'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {search || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'
              ? 'Try adjusting your search criteria or filter selections.'
              : 'Turn long-term ambitions into a clear roadmap. Create your first goal and connect daily habits and tasks to make measurable progress.'}
          </p>
          <button
            onClick={() => {
              setSelectedGoal(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer mt-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onPauseToggle={handlePauseToggle}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onSuccess={fetchGoals}
      />
    </div>
  );
};
