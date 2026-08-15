import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateHabit?: () => void;
}

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | null;
  isAi?: boolean;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard?tab=today', label: 'Today', icon: Activity },
      { path: '/habits', label: 'My Habits', icon: CheckCircle2, badge: '5' },
      { path: '/dashboard?tab=calendar', label: 'Calendar', icon: CalendarIcon },
      { path: '/dashboard?tab=goals', label: 'Goals', icon: Target },
    ],
  },
  {
    groupName: 'Performance',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/analytics?tab=growth', label: 'Growth', icon: TrendingUp },
      { path: '/analytics?tab=momentum', label: 'Momentum', icon: Flame },
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
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Flattened for compatibility/mobile nav usage if needed
export const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateHabit,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname + location.search;
  const checkActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/';
    }
    return currentPath === path;
  };

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
          {isCollapsed ? (
            <Logo variant="icon" size={32} />
          ) : (
            <Logo variant="full" size={32} />
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

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
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
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative border border-transparent',
                        isActive
                          ? 'bg-primary/[0.12] border-blue-500/15 text-foreground'
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
                            : 'text-blue-500'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      size={18}
                    />
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-md',
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
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Collapse Footer */}
      <div className="p-3 border-t border-border/70 space-y-3">
        {/* Momentum Card */}
        {!isCollapsed && user && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B0F1A] border border-[#1D293D] text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] select-none">
              <Flame className="h-4 w-4 text-warning fill-warning" /> Momentum
            </span>
            <div className="text-right select-none font-semibold leading-tight">
              <span className="font-extrabold text-foreground">84</span>
              <span className="text-[9px] text-[#10B981] font-bold block">+12% this week</span>
            </div>
          </div>
        )}

        {/* User profile card */}
        {user && (
          <div className={cn(
            "p-2 rounded-xl bg-card border border-border flex items-center gap-2.5 transition-all select-none",
            isCollapsed ? "justify-center" : "px-3"
          )}>
            <Avatar name={user.name} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold truncate uppercase tracking-wider">
                  Consistency OS
                </p>
              </div>
            )}
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
