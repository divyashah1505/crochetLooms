import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🧶',
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-6 bg-white/60 backdrop-blur rounded-3xl border border-cream-200">
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-xl font-bold text-yarn-mocha mb-2">{title}</h3>
      <p className="text-sm text-stone-600 max-w-md mb-6">{description}</p>
      {actionText && (
        actionHref ? (
          <Link href={actionHref}>
            <Button>{actionText}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionText}</Button>
        )
      )}
    </div>
  );
};
