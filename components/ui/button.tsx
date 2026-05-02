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
    'bg-realm-dusk text-realm-parchment hover:bg-realm-dusk/90 active:bg-realm-dusk/95 focus-visible:ring-realm-dusk',
  secondary:
    'bg-realm-parchment text-realm-ink hover:bg-realm-parchment/80 border border-realm-ink/15 focus-visible:ring-realm-dusk',
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
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-realm-parchment dark:focus-visible:ring-offset-realm-midnight',
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
