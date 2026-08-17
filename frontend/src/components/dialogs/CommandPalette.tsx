import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from './Dialog';
import {
  Search,
  Plus,
  Calendar,
  Target,
  Beaker,
  Flame,
  CheckCircle2,
  ListTodo,
  BarChart3,
  Bot,
  Settings,
  Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateHabit?: () => void;
  onOpenQuickAdd?: (type?: 'habit' | 'task' | 'event') => void;
  onOpenCreateGoal?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Habits & Routines' | 'Goals & Milestones';
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateHabit,
  onOpenQuickAdd,
  onOpenCreateGoal,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Cmd+K trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Quick Actions
    {
      id: 'act-add-habit',
      title: 'Create New Habit',
      category: 'Actions',
      icon: Plus,
      shortcut: 'H',
      action: () => {
        onClose();
        onOpenCreateHabit?.();
      },
    },
    {
      id: 'act-add-task',
      title: 'Add New Task',
      category: 'Actions',
      icon: ListTodo,
      shortcut: 'T',
      action: () => {
        onClose();
        onOpenQuickAdd?.('task');
      },
    },
    {
      id: 'act-schedule-block',
      title: 'Schedule Time Block in Planner',
      category: 'Actions',
      icon: Calendar,
      shortcut: 'P',
      action: () => {
        onClose();
        navigate('/planner');
      },
    },
    {
      id: 'act-create-goal',
      title: 'Create Long-term Goal',
      category: 'Actions',
      icon: Target,
      shortcut: 'G',
      action: () => {
        onClose();
        onOpenCreateGoal?.();
      },
    },
    {
      id: 'act-forge-lab',
      title: 'Run Personal Behavior Experiment',
      category: 'Actions',
      icon: Beaker,
      action: () => {
        onClose();
        navigate('/forge-lab');
      },
    },

    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Open Dashboard',
      category: 'Navigation',
      icon: CheckCircle2,
      action: () => {
        onClose();
        navigate('/dashboard');
      },
    },
    {
      id: 'nav-today',
      title: "Today's Execution Cockpit",
      category: 'Navigation',
      icon: Clock,
      action: () => {
        onClose();
        navigate('/today');
      },
    },
    {
      id: 'nav-planner',
      title: 'Execution Planner & Calendar',
      category: 'Navigation',
      icon: Calendar,
      action: () => {
        onClose();
        navigate('/planner');
      },
    },
    {
      id: 'nav-goals',
      title: 'Goals & Milestones',
      category: 'Navigation',
      icon: Target,
      action: () => {
        onClose();
        navigate('/goals');
      },
    },
    {
      id: 'nav-analytics',
      title: 'Analytics & Forge Score',
      category: 'Navigation',
      icon: BarChart3,
      action: () => {
        onClose();
        navigate('/analytics');
      },
    },
    {
      id: 'nav-momentum',
      title: 'Momentum & Recovery Trajectory',
      category: 'Navigation',
      icon: Flame,
      action: () => {
        onClose();
        navigate('/analytics?tab=momentum');
      },
    },
    {
      id: 'nav-coach',
      title: 'Ask AI Coach',
      category: 'Navigation',
      icon: Bot,
      action: () => {
        onClose();
        navigate('/ai-insights?tab=coach');
      },
    },
    {
      id: 'nav-settings',
      title: 'Account & Preferences Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        onClose();
        navigate('/settings');
      },
    },
  ], [navigate, onClose, onOpenCreateHabit, onOpenQuickAdd, onOpenCreateGoal]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Arrow key navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      className="p-0 border-border bg-surface-elevated"
    >
      <div className="space-y-2">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface-elevated">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, habit, goal, or search DailyForge..."
            className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-sunken border border-border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="px-2 py-1 max-h-[60vh] overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or actions found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all select-none',
                    isSelected
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-white' : 'text-primary')} />
                    <span className="truncate">{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'text-[10px] font-mono uppercase tracking-wider',
                        isSelected ? 'text-white/80' : 'text-muted-foreground/60'
                      )}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border',
                          isSelected
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-surface-sunken border-border text-muted-foreground'
                        )}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-border bg-surface-sunken/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>Navigate with ↑ ↓</span>
          <span>Select with ↵</span>
        </div>
      </div>
    </Dialog>
  );
};
