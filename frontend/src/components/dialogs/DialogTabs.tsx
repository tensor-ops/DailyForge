import React from 'react';
import { cn } from '@/utils/cn';

export interface DialogTabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
}

interface DialogTabsProps<T extends string> {
  tabs: DialogTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function DialogTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: DialogTabsProps<T>) {
  return (
    <div
      className={cn(
        'grid p-1 bg-[#070C18] border border-border/80 rounded-xl gap-1.5',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{tab.label}</span>
            {tab.badge && <div>{tab.badge}</div>}
          </button>
        );
      })}
    </div>
  );
}
