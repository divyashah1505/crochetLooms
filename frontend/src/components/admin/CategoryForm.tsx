'use client';

import React, { useState } from 'react';
import { Category } from '../../types/category';
import { categoryService } from '../../services/category.service';
import { Button } from '../common/Button';

interface CategoryFormProps {
  initialCategory?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialCategory, onSuccess, onCancel }) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [slug, setSlug] = useState(initialCategory?.slug || '');
  const [imageUrl, setImageUrl] = useState(initialCategory?.imageUrl || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (initialCategory) {
        await categoryService.updateCategory(initialCategory.id, {
          name,
          slug: slug || undefined,
          imageUrl,
          description,
        });
      } else {
        await categoryService.createCategory({
          name,
          slug: slug || undefined,
          imageUrl,
          description,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Category Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amigurumi & Plushies, Bags & Purses"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Slug (Optional)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. bags-purses (auto-generated if empty)"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what makes this collection special..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialCategory ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
