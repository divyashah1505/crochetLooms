'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '../../types/category';
import { categoryService } from '../../services/category.service';
import { Button } from '../common/Button';

interface CategoryFormProps {
  initialCategory?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [slug, setSlug] = useState(initialCategory?.slug || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  const [imageUrl, setImageUrl] = useState(initialCategory?.imageUrl || '');
  const [parentId, setParentId] = useState<string>(initialCategory?.parentId || '');
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialCategory?.name || '');
    setSlug(initialCategory?.slug || '');
    setDescription(initialCategory?.description || '');
    setImageUrl(initialCategory?.imageUrl || '');
    setParentId(initialCategory?.parentId || '');

    categoryService.getCategories().then((allCats) => {
      // Only root categories (where parentId is null/empty and not the current editing category)
      const roots = (allCats || []).filter(
        (c) => !c.parentId && (!initialCategory || c.id !== initialCategory.id),
      );
      setParentOptions(roots);
    });
  }, [initialCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      parentId: parentId || null,
    };

    try {
      if (initialCategory) {
        await categoryService.updateCategory(initialCategory.id, payload);
      } else {
        await categoryService.createCategory(payload);
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
          Parent Category
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        >
          <option value="">📁 None (This is a Top-Level Parent Category)</option>
          {parentOptions.map((parent) => (
            <option key={parent.id} value={parent.id}>
              Subcategory under: {parent.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-stone-500 mt-1">
          Choose a parent to make this a subcategory (e.g. Tote Bags under Bags & Purses).
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Category Name *
        </label>
        <input
          type="text"
          value={name ?? ''}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bags & Purses, or Tote Bags"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Category Image URL
        </label>
        <input
          type="url"
          value={imageUrl ?? ''}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Artisanal category storytelling and craftsmanship details..."
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
