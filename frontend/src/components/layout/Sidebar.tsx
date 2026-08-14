import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Bot,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateHabit?: () => void;
}

export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: '/habits',
    label: 'Habits',
    icon: CheckCircle2,
    badge: '5',
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    path: '/ai-insights',
    label: 'AI Coach',
    icon: Bot,
    badge: 'AI',
    isAi: true,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    badge: null,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    badge: null,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateHabit,
}) => {
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-surface border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/70">
        <NavLink
          to="/dashboard"
          className={cn(
            'flex items-center gap-3 transition-opacity',
            isCollapsed && 'justify-center w-full'
          )}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-ai text-white flex items-center justify-center shadow-ai-glow shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                HABITI <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-ai/15 text-ai border border-ai/20">AI</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Consistency OS
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenCreateHabit}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm transition-all duration-150 shadow-sm select-none',
            'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]',
            isCollapsed && 'px-0 py-2.5'
          )}
          title="Create New Habit"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Habit</span>}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? item.isAi ? 'text-ai' : 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                              item.isAi
                                ? 'bg-ai/15 text-ai border border-ai/30'
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
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* AI Coach Mini Card (When Expanded) */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="p-3.5 rounded-xl border border-ai/30 bg-ai/5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-ai animate-pulse" />
              <span className="text-xs font-semibold text-ai uppercase tracking-wider">AI Coach Active</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              &quot;Morning habits have a 34% higher completion rate today.&quot;
            </p>
          </div>
        </div>
      )}

      {/* Footer / User & Collapse */}
      <div className="p-3 border-t border-border/70 space-y-2">
        {/* Streak Preview */}
        {!isCollapsed && user && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-sunken border border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-warning fill-warning" /> Current Streak
            </span>
            <span className="font-bold text-foreground">{user.currentStreak} Days</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
              isCollapsed && 'w-full'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
