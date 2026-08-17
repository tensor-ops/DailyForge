import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
  className,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));

  // Sync external value prop with internal digit boxes
  useEffect(() => {
    const valChars = (value || '').slice(0, length).split('');
    const newDigits = Array(length).fill('');
    valChars.forEach((ch, idx) => {
      newDigits[idx] = ch;
    });
    setDigits(newDigits);
  }, [value, length]);

  // Focus first input on mount if autoFocus
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    const fullOtp = newDigits.join('');
    onChange(fullOtp);

    // Auto-advance to next input if digit entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }

    // Trigger onComplete when full OTP entered
    if (newDigits.every((d) => d !== '') && fullOtp.length === length) {
      onComplete?.(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pastedData) return;

    const newDigits = Array(length).fill('');
    pastedData.split('').forEach((ch, idx) => {
      newDigits[idx] = ch;
    });
    setDigits(newDigits);

    const fullOtp = newDigits.join('');
    onChange(fullOtp);

    // Focus last filled input or next empty input
    const nextEmptyIndex = newDigits.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }

    if (pastedData.length === length) {
      onComplete?.(pastedData);
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={cn(
            'w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black font-mono rounded-xl border transition-all select-none',
            'bg-surface-elevated text-foreground outline-none',
            hasError
              ? 'border-danger/70 focus:border-danger focus:ring-2 focus:ring-danger/25 bg-danger/5 animate-shake'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/30',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-sunken'
          )}
        />
      ))}
    </div>
  );
};
