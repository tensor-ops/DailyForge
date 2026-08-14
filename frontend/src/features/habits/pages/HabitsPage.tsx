import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { Habit, HabitCategory } from '@/types/habit';
import { Plus, Search, Flame, Trash2 } from 'lucide-react';

const CATEGORIES: ('all' | HabitCategory)[] = [
  'all',
  'Health',
  'Fitness',
  'Study',
  'Work',
  'Personal',
  'Mindfulness',
];

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const HabitsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Habits');
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};
  const { success, error } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Deletion confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHabits = async () => {
    try {
      const list = await habitService.getHabits();
      setHabits(list);
    } catch {
      error('Failed to load habits', 'Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
    const handler = () => fetchHabits();
    window.addEventListener('habits-updated', handler);
    return () => window.removeEventListener('habits-updated', handler);
  }, []);

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchCat = selectedCategory === 'all' || h.category === selectedCategory;
      const matchSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [habits, selectedCategory, searchQuery]);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habit Management"
        description="Organize, review, and fine-tune your active daily routines and systems."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateHabit}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Habit
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="sm:w-64">
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Habit List or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-card bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          title="No habits found"
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'You have not created any habits yet. Start small to build consistency.'
          }
          actionLabel="Create First Habit"
          onAction={onOpenCreateHabit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              className="p-5 rounded-card border border-border bg-card hover:border-border-strong transition-all flex flex-col justify-between space-y-4 shadow-card"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-muted/80">{habit.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {habit.name}
                      </h3>
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {habit.category}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(habit)}
                    className="text-muted-foreground hover:text-danger p-1 rounded transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {habit.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {habit.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-warning font-semibold">
                  <Flame className="h-4 w-4 fill-warning" />
                  <span>{habit.currentStreak} day streak</span>
                </div>
                <div className="text-muted-foreground font-medium">
                  {habit.completionRate}% rate
                </div>
              </div>
            </div>
          ))}
        </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteHabit}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
