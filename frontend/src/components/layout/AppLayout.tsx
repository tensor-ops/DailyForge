import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { HabitCategory } from '@/types/habit';
import { Search } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Create Habit Form State
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('Health');
  const [habitDescription, setHabitDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleCreateHabitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      error('Habit name required', 'Please enter a name for your habit.');
      return;
    }

    setIsCreating(true);
    try {
      await habitService.createHabit({
        name: habitName,
        category: habitCategory,
        description: habitDescription,
        icon: getCategoryIcon(habitCategory),
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
      });

      success('Habit created! ✓', `"${habitName}" added to your daily tracker.`);
      setHabitName('');
      setHabitDescription('');
      setIsCreateModalOpen(false);
      
      // Dispatch custom event so pages can refresh if needed
      window.dispatchEvent(new Event('habits-updated'));
    } catch {
      error('Creation failed', 'Could not create habit. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryIcon = (cat: HabitCategory) => {
    switch (cat) {
      case 'Health': return '💧';
      case 'Fitness': return '⚡';
      case 'Study': return '🧠';
      case 'Work': return '💼';
      case 'Personal': return '📖';
      case 'Finance': return '💰';
      case 'Mindfulness': return '✨';
      default: return '🎯';
    }
  };

  // Keyboard shortcut listener for Command + K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = [
    { title: 'Dashboard', path: '/dashboard', type: 'View' },
    { title: 'Habits Management', path: '/habits', type: 'View' },
    { title: 'Analytics & Trends', path: '/analytics', type: 'View' },
    { title: 'AI Habit Coach', path: '/ai-insights', type: 'AI Feature' },
    { title: 'Profile & Consistency Score', path: '/profile', type: 'User' },
    { title: 'Account Settings', path: '/settings', type: 'Settings' },
  ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenCreateHabit={() => setIsCreateModalOpen(true)}
      />

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenCreateHabit={() => setIsCreateModalOpen(true)}
      />

      {/* Main Container Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <TopBar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenCreateHabit={() => setIsCreateModalOpen(true)}
        />

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 animate-fade-in">
          <Outlet context={{ onOpenCreateHabit: () => setIsCreateModalOpen(true) }} />
        </main>
      </div>

      {/* CREATE HABIT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Habit"
        description="Establish a new routine with clear intention and frequency."
      >
        <form onSubmit={handleCreateHabitSubmit} className="space-y-4 pt-2">
          <Input
            label="Habit Name"
            placeholder="e.g., Morning 20m Yoga & Mobility"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <select
              value={habitCategory}
              onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="Health">Health 💧</option>
              <option value="Fitness">Fitness ⚡</option>
              <option value="Study">Study 🧠</option>
              <option value="Work">Work 💼</option>
              <option value="Personal">Personal 📖</option>
              <option value="Finance">Finance 💰</option>
              <option value="Mindfulness">Mindfulness ✨</option>
              <option value="Other">Other 🎯</option>
            </select>
          </div>

          <Input
            label="Description / Motivation"
            placeholder="e.g., Start with sun salutations to elevate focus"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating}>
              Create Habit
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUICK COMMAND / SEARCH MODAL */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Quick Navigator"
        description="Search pages, actions, and features."
        size="md"
      >
        <div className="space-y-3">
          <Input
            placeholder="Type a command or page name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            autoFocus
          />

          <div className="divide-y divide-border/60 max-h-60 overflow-y-auto pt-2">
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchModalOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted text-left transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
                    {item.type}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matching results found.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
