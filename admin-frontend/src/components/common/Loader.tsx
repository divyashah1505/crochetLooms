import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading artisanal crafts...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-clay-600`} />
        <span className="absolute text-xs">🧶</span>
      </div>
      {message && <p className="text-xs font-medium text-stone-500 animate-pulse">{message}</p>}
    </div>
  );
};
