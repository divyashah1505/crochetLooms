'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { tagService } from '../../services/tag.service';
import { Tag } from '../../types/tag';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface TagNavProps {
  onSelectTag?: (tagSlug: string | null) => void;
  selectedTag?: string | null;
}

function TagNavContent({ onSelectTag, selectedTag: propSelectedTag }: TagNavProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTag = propSelectedTag !== undefined ? propSelectedTag : searchParams.get('tag');

  useEffect(() => {
    let isMounted = true;
    tagService
      .getTags()
      .then((data) => {
        if (isMounted) {
          setTags(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load tags:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTagClick = (slug: string | null) => {
    if (onSelectTag) {
      onSelectTag(slug);
    } else {
      if (!slug) {
        router.push('/products');
      } else {
        router.push(`/products?tag=${slug}`);
      }
    }
  };

  if (isLoading && tags.length === 0) {
    return (
      <div className="w-full py-3 overflow-x-auto no-scrollbar border-y border-cream-200 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-cream-200 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2.5 overflow-x-auto no-scrollbar border-y border-cream-200/80 bg-white/80 backdrop-blur-md shadow-xs sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
        <span className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-clay-700 mr-2 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-clay-500" />
          Tags:
        </span>

        {/* All Items Button */}
        <button
          onClick={() => handleTagClick(null)}
          className={clsx(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 flex items-center gap-1.5',
            !currentTag
              ? 'bg-clay-600 text-white shadow-sm ring-2 ring-clay-600 ring-offset-1 font-semibold'
              : 'bg-cream-100 text-stone-700 hover:bg-cream-200 hover:text-clay-800',
          )}
        >
          <span>✨</span>
          <span>All Creations</span>
        </button>

        {/* Dynamic Tags from Tag Master */}
        {tags.map((tag) => {
          const isActive = currentTag === tag.slug;
          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 group',
                isActive
                  ? 'bg-clay-600 text-white shadow-sm ring-2 ring-clay-600 ring-offset-1 font-semibold scale-105'
                  : 'bg-cream-100 text-stone-700 hover:bg-clay-100 hover:text-clay-800',
              )}
            >
              <span className="group-hover:scale-110 transition-transform">
                {tag.icon || '🧶'}
              </span>
              <span>{tag.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const TagNav: React.FC<TagNavProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="w-full py-3 border-y border-cream-200 bg-white/70">
          <div className="max-w-7xl mx-auto px-4 text-xs text-stone-400">Loading tags...</div>
        </div>
      }
    >
      <TagNavContent {...props} />
    </Suspense>
  );
};
