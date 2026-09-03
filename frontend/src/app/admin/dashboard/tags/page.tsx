'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { tagService } from '../../../../services/tag.service';
import { Tag } from '../../../../types/tag';
import { Button } from '../../../../components/common/Button';
import { Modal } from '../../../../components/common/Modal';
import { TagForm } from '../../../../components/admin/TagForm';
import { Loader } from '../../../../components/common/Loader';
import { Plus, Edit2, Trash2, Tag as TagIcon, Sparkles } from 'lucide-react';

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

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tag from Tag Master?')) {
      try {
        await tagService.deleteTag(id);
        loadTags();
      } catch (err) {
        alert('Failed to delete tag');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    loadTags();
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Tag Master Taxonomy"
        subtitle="Manage universal crochet product tags (e.g. flower, purse, cardigan) used for navigation and customer filtering."
        action={
          <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Tag
          </Button>
        }
      />

      {isLoading ? (
        <Loader message="Loading Tag Master taxonomy..." />
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Icon & Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {tags.map((t) => (
                  <tr key={t.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-xl shadow-xs">
                          {t.icon || '🏷️'}
                        </span>
                        <div>
                          <p className="font-bold text-yarn-mocha text-sm">{t.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-clay-700 font-semibold">
                      {t.slug}
                    </td>
                    <td className="p-4 text-stone-600 max-w-md">
                      {t.description || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-stone-500 hover:text-clay-600 hover:bg-cream-100 rounded-lg transition-colors"
                          title="Edit Tag"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tag Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? `Edit Tag "${editingTag.name}"` : 'Create Tag in Tag Master'}
        maxWidth="md"
      >
        <TagForm
          initialTag={editingTag}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
