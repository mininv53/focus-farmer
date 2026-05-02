'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-garden-loam text-garden-cream hover:bg-garden-loam/90 active:bg-garden-loam/95 focus-visible:ring-garden-loam',
  secondary:
    'bg-garden-cream text-garden-loam hover:bg-garden-cream/80 border border-garden-loam/15 focus-visible:ring-garden-loam dark:bg-white/10 dark:text-garden-cream dark:border-white/15',
  ghost: 'bg-transparent text-current hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-garden-cream dark:focus-visible:ring-offset-garden-night',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANT[variant],
          SIZE[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
