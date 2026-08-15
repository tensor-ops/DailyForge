import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch?: () => void;
  onOpenCreateHabit?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenCreateHabit,
}) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { info } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/habits':
        return 'My Habits';
      case '/analytics':
        return 'Analytics';
      case '/ai-insights':
        return 'Insights';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      default:
        return 'Today';
    }
  };

  const handleLogout = async () => {
    await logout();
    info('Logged out successfully', 'See you back tomorrow for your habit streaks.');
    navigate('/login');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 h-16 w-full glass-nav flex items-center justify-between px-4 sm:px-6 border-b border-border/80">
      {/* Left section: Mobile menu trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground hidden sm:inline-block">
            DailyForge
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">/</span>
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase">
            {getPageTitle(location.pathname)}
          </h2>
        </div>
      </div>

      {/* Center section: Current Date */}
      <div className="hidden md:block text-xs font-bold text-muted-foreground uppercase tracking-widest bg-[#080C14] px-3.5 py-1.5 rounded-full border border-border/40">
        {formattedDate}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-muted-foreground hover:text-foreground hover:border-border-strong transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/80 ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Primary CTA: + Add Habit */}
        {onOpenCreateHabit && (
          <button
            onClick={onOpenCreateHabit}
            className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors select-none"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Habit</span>
          </button>
        )}

        {/* Theme Switcher */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Laptop className="h-4 w-4" />
              )}
            </button>
          }
          items={[
            {
              id: 'light',
              label: 'Light Mode',
              icon: <Sun className="h-4 w-4" />,
              onClick: () => setTheme('light'),
            },
            {
              id: 'dark',
              label: 'Dark Mode',
              icon: <Moon className="h-4 w-4" />,
              onClick: () => setTheme('dark'),
            },
            {
              id: 'system',
              label: 'System Sync',
              icon: <Laptop className="h-4 w-4" />,
              onClick: () => setTheme('system'),
            },
          ]}
        />

        {/* Notification Bell */}
        <button
          onClick={() => info('Notifications', 'All habits and reminders are synchronized.')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-px bg-border mx-0.5 hidden sm:block" />

        {/* User Profile Avatar Dropdown */}
        {user ? (
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors">
                <Avatar name={user.name} size="sm" />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Consistency OS
                  </span>
                </div>
              </div>
            }
            items={[
              {
                id: 'profile',
                label: 'My Profile',
                icon: <UserIcon className="h-4 w-4" />,
                onClick: () => navigate('/profile'),
              },
              {
                id: 'settings',
                label: 'Account Settings',
                icon: <SettingsIcon className="h-4 w-4" />,
                onClick: () => navigate('/settings'),
              },
              'separator',
              {
                id: 'logout',
                label: 'Log out',
                icon: <LogOut className="h-4 w-4" />,
                danger: true,
                onClick: handleLogout,
              },
            ]}
          />
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};
