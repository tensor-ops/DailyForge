import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  CheckCircle2,
  Calendar as CalendarIcon,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Bot,
  Sparkles,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Beaker,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { habitService } from '@/services/habitService';
import { todayService } from '@/services/todayService';
import { analyticsService } from '@/services/analyticsService';
import { goalService } from '@/services/goalService';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateHabit?: () => void;
}

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number | null;
  isAi?: boolean;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateHabit,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const [activeHabitsCount, setActiveHabitsCount] = useState<number | null>(null);
  const [todayRemainingCount, setTodayRemainingCount] = useState<number | null>(null);
  const [activeGoalsCount, setActiveGoalsCount] = useState<number | null>(null);
  const [momentumScore, setMomentumScore] = useState<number>(84);

  const fetchBadgeCounts = async () => {
    try {
      const [overviewData, todayData, behaviorData, goalsData] = await Promise.all([
        habitService.getHabitsOverview().catch(() => null),
        todayService.getTodayOverview().catch(() => null),
        analyticsService.getBehaviorAnalytics('30d').catch(() => null),
        goalService.getGoals().catch(() => null),
      ]);

      if (overviewData) {
        setActiveHabitsCount(overviewData.summary.activeHabits);
      }
      if (todayData) {
        setTodayRemainingCount(todayData.progress.remaining);
      }
      if (behaviorData?.momentum?.score) {
        setMomentumScore(behaviorData.momentum.score);
      }
      if (goalsData?.summary) {
        setActiveGoalsCount(goalsData.summary.activeGoals);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchBadgeCounts();

    const handleUpdate = () => fetchBadgeCounts();
    window.addEventListener('habits-updated', handleUpdate);
    window.addEventListener('tasks-updated', handleUpdate);
    window.addEventListener('goals-updated', handleUpdate);
    return () => {
      window.removeEventListener('habits-updated', handleUpdate);
      window.removeEventListener('tasks-updated', handleUpdate);
      window.removeEventListener('goals-updated', handleUpdate);
    };
  }, []);

  const navGroups: NavGroup[] = [
    {
      groupName: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          path: '/today',
          label: 'Today',
          icon: Activity,
          badge: todayRemainingCount && todayRemainingCount > 0 ? todayRemainingCount : null,
        },
        {
          path: '/habits',
          label: 'My Habits',
          icon: CheckCircle2,
          badge: activeHabitsCount !== null ? activeHabitsCount : null,
        },
        { path: '/planner', label: 'Planner', icon: CalendarIcon },
        {
          path: '/goals',
          label: 'Goals',
          icon: Target,
          badge: activeGoalsCount !== null && activeGoalsCount > 0 ? activeGoalsCount : null,
        },
      ],
    },
    {
      groupName: 'Performance',
      items: [
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/analytics?tab=growth', label: 'Growth', icon: TrendingUp },
        {
          path: '/analytics?tab=momentum',
          label: 'Momentum',
          icon: Flame,
          badge: `${momentumScore}`,
        },
        { path: '/analytics?tab=milestones', label: 'Milestones', icon: Trophy },
        { path: '/forge-lab', label: 'Forge Lab', icon: Beaker },
      ],
    },
    {
      groupName: 'Intelligence',
      items: [
        { path: '/ai-insights', label: 'Forge Insights', icon: Sparkles, isAi: true },
        { path: '/ai-insights?tab=coach', label: 'AI Coach', icon: Bot, isAi: true, badge: 'AI' },
      ],
    },
    {
      groupName: 'System',
      items: [{ path: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

  const currentPath = location.pathname + location.search;
  const checkActive = (path: string) => {
    if (path === '/dashboard') {
      return (
        currentPath === '/dashboard' ||
        currentPath === '/dashboard/' ||
        (location.pathname === '/dashboard' && !location.search)
      );
    }
    if (path === '/today') {
      return location.pathname === '/today' || currentPath === '/dashboard?tab=today';
    }
    if (path === '/planner') {
      return (
        location.pathname.startsWith('/planner') ||
        location.pathname.startsWith('/calendar') ||
        currentPath === '/dashboard?tab=calendar' ||
        currentPath === '/dashboard?tab=planner'
      );
    }
    if (path === '/goals') {
      return location.pathname.startsWith('/goals') || currentPath === '/dashboard?tab=goals';
    }
    return currentPath === path;
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-sidebar border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/70 shrink-0">
        <NavLink
          to="/dashboard"
          className={cn(
            'flex items-center gap-3 transition-opacity',
            isCollapsed && 'justify-center w-full'
          )}
        >
          {isCollapsed ? <Logo variant="icon" size={32} /> : <Logo variant="full" size={32} />}
        </NavLink>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={onOpenCreateHabit}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm transition-all duration-150 shadow-sm select-none cursor-pointer',
            'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]',
            isCollapsed && 'px-0 py-2.5'
          )}
          title="Create New Habit"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Habit</span>}
        </button>
      </div>

      {/* Navigation Groups (Scrollable Body) */}
      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">
                {group.groupName}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = checkActive(item.path);
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={() =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative border border-transparent select-none',
                        isActive
                          ? 'bg-primary/[0.12] border-primary/15 text-foreground'
                          : 'hover:text-foreground hover:bg-muted/40 text-muted-foreground',
                        isCollapsed && 'justify-center px-0'
                      )
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-4.5 w-4.5 shrink-0 transition-colors',
                        isActive
                          ? item.isAi
                            ? 'text-ai'
                            : 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      size={18}
                    />

                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono',
                              item.isAi
                                ? 'bg-ai/15 text-ai border border-ai/30'
                                : isActive
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Active pill indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Collapse Footer */}
      <div className="p-3 border-t border-border/70 space-y-2 shrink-0">
        {/* User profile link */}
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'p-2 rounded-xl border flex items-center gap-2.5 transition-all select-none group',
                isActive
                  ? 'bg-primary/[0.12] border-primary/20 text-foreground'
                  : 'bg-surface-sunken/40 hover:bg-surface-elevated border-border/60 hover:border-border text-muted-foreground hover:text-foreground',
                isCollapsed ? 'justify-center' : 'px-3'
              )
            }
            title={isCollapsed ? user.name : 'View Profile'}
          >
            <Avatar name={user.name} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold truncate tracking-wide">
                  {user.email || 'Consistency OS'}
                </p>
              </div>
            )}
          </NavLink>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer',
              isCollapsed && 'w-full'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
