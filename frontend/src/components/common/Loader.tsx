import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Crafting with love...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-clay-200 border-t-clay-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-lg">
          🧶
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-clay-700 animate-pulse">
        {message}
      </p>
    </div>
  );
};
