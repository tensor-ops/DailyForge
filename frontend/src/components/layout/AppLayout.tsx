import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { CreateHabitModal } from '@/features/habits/components/CreateHabitModal';
import { HabitCategory } from '@/types/habit';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalCategory, setCreateModalCategory] = useState<HabitCategory | undefined>(undefined);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleOpenCreateHabit = (category?: HabitCategory) => {
    setCreateModalCategory(category);
    setIsCreateModalOpen(true);
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
        onOpenCreateHabit={() => handleOpenCreateHabit()}
      />

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenCreateHabit={() => handleOpenCreateHabit()}
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
          onOpenCreateHabit={() => handleOpenCreateHabit()}
        />

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 animate-fade-in">
          <Outlet context={{ onOpenCreateHabit: handleOpenCreateHabit }} />
        </main>
      </div>

      {/* CREATE HABIT MODAL */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCategory={createModalCategory}
      />

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
            autoFocus
          />

          <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item.title}</span>
                  </span>
                  <span className="text-[10px] bg-surface-sunken px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                    {item.type}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No results found for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
