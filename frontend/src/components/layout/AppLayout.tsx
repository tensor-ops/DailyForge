import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CreateHabitModal } from '@/features/habits/components/CreateHabitModal';
import { CommandPalette } from '@/components/dialogs/CommandPalette';
import { HabitCategory } from '@/types/habit';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalCategory, setCreateModalCategory] = useState<HabitCategory | undefined>(undefined);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

      {/* GLOBAL COMMAND PALETTE (Cmd+K) */}
      <CommandPalette
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onOpenCreateHabit={() => handleOpenCreateHabit()}
      />
    </div>
  );
};
