import React from 'react';
import { cn } from '@/utils/cn';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex border-b border-border/70 gap-5 text-xs font-bold text-muted-foreground select-none text-left', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 border-b-2 transition-colors cursor-pointer focus:outline-none relative top-[1px]',
              isActive
                ? 'border-primary text-foreground font-extrabold'
                : 'border-transparent hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
