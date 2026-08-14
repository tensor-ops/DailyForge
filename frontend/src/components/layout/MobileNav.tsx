import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from './Sidebar';
import {
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Bot,
  User as UserIcon,
  X,
  Sparkles,
  Flame,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateHabit?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenCreateHabit,
}) => {
  const { user } = useAuth();

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const bottomNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/habits', label: 'Habits', icon: CheckCircle2 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/ai-insights', label: 'AI Coach', icon: Bot, isAi: true },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* 1. BOTTOM NAVIGATION BAR (Mobile only: < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-nav border-t border-border/80 px-2 py-1.5 flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors',
                  isActive
                    ? item.isAi ? 'text-ai font-semibold' : 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5 mb-0.5 transition-transform',
                      isActive && 'scale-110'
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 2. SLIDE-OUT DRAWER MENU (Mobile Drawer) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer content */}
          <div className="relative z-50 w-4/5 max-w-xs bg-surface border-r border-border h-full flex flex-col p-4 shadow-popover animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-ai text-white flex items-center justify-center shadow-ai-glow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-base text-foreground">DailyForge</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User card in drawer */}
            {user && (
              <div className="my-4 p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-warning">
                  <Flame className="h-3.5 w-3.5 fill-warning" />
                  <span>{user.currentStreak}d</span>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={() => {
                onClose();
                onOpenCreateHabit?.();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 bg-primary text-primary-foreground font-medium text-sm mb-4"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Habit</span>
            </button>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
