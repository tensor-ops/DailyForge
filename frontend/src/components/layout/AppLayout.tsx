import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { CreateHabitModal } from '@/features/habits/components/CreateHabitModal';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
