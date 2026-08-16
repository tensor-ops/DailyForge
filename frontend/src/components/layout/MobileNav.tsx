import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  User as UserIcon,
  X,
  Plus,
  Activity,
  Calendar as CalendarIcon,
  Target,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/brand/Logo';

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
    { path: '/today', label: 'Today', icon: Activity },
    { path: '/habits', label: 'Habits', icon: CheckCircle2 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const drawerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/today', label: 'Today', icon: Activity },
    { path: '/habits', label: 'My Habits', icon: CheckCircle2 },
    { path: '/dashboard?tab=calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/ai-insights', label: 'Forge Insights', icon: Sparkles },
    { path: '/profile', label: 'Profile', icon: UserIcon },
    { path: '/settings', label: 'Settings', icon: Settings },
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
                    ? 'text-primary font-semibold'
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
              <Logo variant="full" size={28} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User card in drawer */}
            {user && (
              <NavLink
                to="/profile"
                onClick={onClose}
                className="my-4 p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3 hover:border-border transition-colors select-none"
              >
                <Avatar name={user.name} size="md" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </NavLink>
            )}

            {/* Add Habit CTA button */}
            <button
              onClick={() => {
                onClose();
                onOpenCreateHabit?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-all mb-4 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Habit</span>
            </button>

            {/* Drawer nav list */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {drawerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      )
                    }
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
