import React from 'react';
import { cn } from '@/utils/cn';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 32,
  className,
  theme = 'auto',
}) => {
  const isIcon = variant === 'icon';
  const isCompact = variant === 'compact';

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="df-flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          
          {/* Flame backfill */}
          <path
            d="M12 2C9.5 5.5 8 8 8 11C8 14.5 10 16.5 12 16.5C14 16.5 16 14.5 16 11C16 8 14.5 5.5 12 2Z"
            fill="url(#df-flame-grad)"
            className="opacity-[0.15] dark:opacity-20"
          />
          
          {/* Flame Outline */}
          <path
            d="M12 2C9.5 5.5 8 8 8 11C8 14.5 10 16.5 12 16.5C14 16.5 16 14.5 16 11C16 8 14.5 5.5 12 2Z"
            stroke="url(#df-flame-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Growth bar indicators behind flame */}
          <line x1="6" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />
          <line x1="16" y1="19" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />
          <line x1="18" y1="19" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />

          {/* Checkmark sweeping into growth arrow */}
          <path
            d="M9.5 11L11.5 13L15.5 8.5"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 8.5H15.5V10.5"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {!isIcon && (
        <span
          className={cn(
            "font-extrabold text-foreground tracking-tight transition-colors",
            isCompact ? "text-sm" : "text-lg",
            theme === 'light' ? 'text-slate-900' : theme === 'dark' ? 'text-slate-50' : ''
          )}
        >
          DailyForge
        </span>
      )}
    </div>
  );
};
