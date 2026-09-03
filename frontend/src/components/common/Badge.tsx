import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'clay' | 'sage' | 'pastel' | 'warning' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'clay',
  size = 'md',
  className,
}) => {
  const variants = {
    clay: 'bg-clay-100 text-clay-700 border border-clay-200',
    sage: 'bg-sage-100 text-sage-600 border border-sage-200',
    pastel: 'bg-cream-100 text-yarn-mocha border border-cream-300',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    gray: 'bg-stone-100 text-stone-700 border border-stone-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-full',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-full',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
