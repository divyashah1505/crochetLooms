'use client';

import React, { useState } from 'react';
import { Tag } from '../../types/tag';
import { tagService } from '../../services/tag.service';
import { Button } from '../common/Button';

interface TagFormProps {
  initialTag?: Tag | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TagForm: React.FC<TagFormProps> = ({ initialTag, onSuccess, onCancel }) => {
  const [name, setName] = useState(initialTag?.name || '');
  const [slug, setSlug] = useState(initialTag?.slug || '');
  const [icon, setIcon] = useState(initialTag?.icon || '🏷️');
  const [description, setDescription] = useState(initialTag?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (initialTag) {
        await tagService.updateTag(initialTag.id, {
          name,
          slug: slug || undefined,
          icon,
          description,
        });
      } else {
        await tagService.createTag({
          name,
          slug: slug || undefined,
          icon,
          description,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save tag');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleIcons = ['🌸', '👜', '🧸', '🧶', '✨', '🛋️', '☕', '🎨', '🌻', '🎁', '🧣', '👒'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Tag Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flower, Purse, Cardigan"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Tag Icon (Emoji)
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-16 px-3 py-2 text-center text-lg bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {sampleIcons.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setIcon(emoji)}
                className="p-1 text-base hover:bg-cream-200 rounded-lg transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Slug (Optional)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. flower, purse (auto-generated if blank)"
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
          placeholder="Brief note about this tag category..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialTag ? 'Update Tag' : 'Create Tag'}
        </Button>
      </div>
    </form>
  );
};
