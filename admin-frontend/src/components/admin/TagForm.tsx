'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from '../../types/tag';
import { tagService } from '../../services/tag.service';
import { Button } from '../common/Button';

interface TagFormProps {
  initialTag?: Tag | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MASTER_GROUPS = [
  'Product Type',
  'Occasion',
  'Style',
  'Recipient',
  'Special Features',
];

const EMOJI_OPTIONS = [
  '🏷️', '🌸', '👜', '🧸', '🧶', '✨', '🛋️', '☕', '🎨', '🧣',
  '🎂', '💍', '🍼', '💖', '🥰', '🤍', '🪷', '⚡', '👩', '👨',
  '👧', '👶', '💑', '🌿', '🧵', '🎁', '🎀'
];

export const TagForm: React.FC<TagFormProps> = ({ initialTag, onSuccess, onCancel }) => {
  const [name, setName] = useState(initialTag?.name || '');
  const [slug, setSlug] = useState(initialTag?.slug || '');
  const [icon, setIcon] = useState(initialTag?.icon || '🏷️');
  const [group, setGroup] = useState(initialTag?.group || 'Product Type');
  const [description, setDescription] = useState(initialTag?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialTag?.name || '');
    setSlug(initialTag?.slug || '');
    setIcon(initialTag?.icon || '🏷️');
    setGroup(initialTag?.group || 'Product Type');
    setDescription(initialTag?.description || '');
  }, [initialTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      icon,
      group,
      description: description.trim() || undefined,
    };

    try {
      if (initialTag) {
        await tagService.updateTag(initialTag.id, payload);
      } else {
        await tagService.createTag(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save tag');
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
          Master Tag Category *
        </label>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
        >
          {MASTER_GROUPS.map((grp) => (
            <option key={grp} value={grp}>
              {grp}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Tag Name *
        </label>
        <input
          type="text"
          value={name ?? ''}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Birthday, Couples, 100% Handmade"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Select Icon / Emoji
        </label>
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-cream-50 rounded-xl border border-cream-200 max-h-28 overflow-y-auto">
          {EMOJI_OPTIONS.map((em) => (
            <button
              type="button"
              key={em}
              onClick={() => setIcon(em)}
              className={`w-8 h-8 text-base rounded-lg transition-all ${
                icon === em
                  ? 'bg-clay-600 text-white scale-110 shadow-xs'
                  : 'bg-white hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief note about this tag"
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
