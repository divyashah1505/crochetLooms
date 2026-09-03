'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { tagService } from '../../../services/tag.service';
import { Tag } from '../../../types/tag';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { TagForm } from '../../../components/admin/TagForm';
import { Loader } from '../../../components/common/Loader';
import { Plus, Edit2, Trash2, Tag as TagIcon, Sparkles } from 'lucide-react';

const MASTER_GROUPS = [
  { name: 'Product Type', icon: '📦', subtitle: 'Bags, Keychains, Flowers, Toys, Clothing' },
  { name: 'Occasion', icon: '🎉', subtitle: 'Birthday, Anniversary, Baby Shower, Valentine’s Day' },
  { name: 'Style', icon: '✨', subtitle: 'Cute, Minimalist, Aesthetic, Traditional, Modern' },
  { name: 'Recipient', icon: '👥', subtitle: 'Women, Men, Kids, Babies, Couples' },
  { name: 'Special Features', icon: '🌟', subtitle: '100% Handmade, Customizable, Eco-Friendly, Premium Yarn' },
];

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const list = await tagService.getTags();
      setTags(list || []);
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (t: Tag) => {
    setEditingTag(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this taxonomy tag?')) {
      try {
        await tagService.deleteTag(id);
        loadTags();
      } catch (err) {
        alert('Failed to delete tag');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    loadTags();
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Tag Master Taxonomy (5 Master Dimensions)"
        subtitle="Manage universal tags grouped by Product Type, Occasion, Style, Recipient, and Special Features."
        action={
          <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
            Create New Tag
          </Button>
        }
      />

      {isLoading ? (
        <Loader message="Loading Tag Master taxonomy..." />
      ) : (
        <div className="space-y-8">
          {MASTER_GROUPS.map((grp) => {
            const groupTags = tags.filter((t) => (t.group || 'Product Type') === grp.name);

            return (
              <div key={grp.name} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{grp.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-yarn-mocha">{grp.name}</h3>
                      <p className="text-[11px] text-stone-400">{grp.subtitle}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cream-100 text-clay-700">
                    {groupTags.length} tag(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupTags.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 flex items-center justify-between gap-3 hover:border-clay-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-lg">{t.icon || '🏷️'}</span>
                        <div className="truncate">
                          <p className="font-bold text-xs text-yarn-mocha truncate">{t.name}</p>
                          <p className="text-[10px] font-mono text-stone-400 truncate">/{t.slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 text-stone-400 hover:text-clay-600 rounded"
                          title="Edit Tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tag Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? `Edit Tag: ${editingTag.name}` : 'Create Tag Master Item'}
        maxWidth="md"
      >
        <TagForm
          initialTag={editingTag}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
