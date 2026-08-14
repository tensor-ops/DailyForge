import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  animated?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'rgb(var(--color-primary))',
  trackColor = 'rgb(var(--color-muted))',
  label,
  sublabel,
  className,
  animated = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedValue / 100);

  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${clampedValue}%` : `${clampedValue}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-700 ease-out' : ''}
        />
      </svg>
      {/* Center content */}
      {(label !== undefined || sublabel !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label !== undefined && (
            <span
              className="font-extrabold text-foreground leading-none"
              style={{ fontSize: size * 0.16 }}
            >
              {label}
            </span>
          )}
          {sublabel !== undefined && (
            <span
              className="text-muted-foreground uppercase font-medium mt-0.5"
              style={{ fontSize: size * 0.09 }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
