'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { categoryService } from '../../../services/category.service';
import { Category } from '../../../types/category';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { CategoryForm } from '../../../components/admin/CategoryForm';
import { Loader } from '../../../components/common/Loader';
import { Plus, Edit2, Trash2, FolderTree, ChevronRight, Sparkles } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const list = await categoryService.getCategories();
      setCategories(list || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (c: Category) => {
    setEditingCategory(c);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Any subcategories under it will also be updated.')) {
      try {
        await categoryService.deleteCategory(id);
        loadCategories();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  // Group into Parent -> Subcategories
  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Category & Subcategory Hierarchy"
        subtitle="Manage primary product collections and their nested subcategories."
        action={
          <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
            Create Category / Subcategory
          </Button>
        }
      />

      {isLoading ? (
        <Loader message="Loading category hierarchy..." />
      ) : (
        <div className="space-y-6">
          {parentCategories.map((parent) => {
            const subcats = categories.filter((c) => c.parentId === parent.id);

            return (
              <div
                key={parent.id}
                className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden p-6 space-y-4"
              >
                {/* Parent Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
                  <div className="flex items-center gap-4">
                    {parent.imageUrl ? (
                      <img
                        src={parent.imageUrl}
                        alt={parent.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-cream-200"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-clay-100 text-clay-700 flex items-center justify-center font-bold text-xl">
                        📁
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-clay-100 text-clay-700 uppercase tracking-wider">
                          Parent Category
                        </span>
                        <span className="text-xs text-stone-400 font-mono">/{parent.slug}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-yarn-mocha mt-0.5">{parent.name}</h3>
                      {parent.description && (
                        <p className="text-xs text-stone-500 line-clamp-1">{parent.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(parent)}
                      className="px-3 py-1.5 text-stone-600 hover:text-clay-600 hover:bg-cream-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 border border-cream-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="px-3 py-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 border border-cream-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Subcategories Nested Area */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-clay-600" /> Subcategories ({subcats.length})
                    </h4>
                  </div>

                  {subcats.length === 0 ? (
                    <p className="text-xs text-stone-400 italic bg-cream-50 p-3 rounded-2xl border border-cream-200">
                      No subcategories added yet under {parent.name}.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {subcats.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-2xl bg-cream-50/70 border border-cream-200 flex items-center justify-between gap-3 hover:border-clay-400 transition-colors"
                        >
                          <div className="truncate">
                            <p className="font-bold text-xs text-yarn-mocha truncate">{sub.name}</p>
                            <p className="text-[10px] font-mono text-stone-400 truncate">slug: {sub.slug}</p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1 text-stone-400 hover:text-clay-600 rounded"
                              title="Edit Subcategory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Category or Subcategory'}
        maxWidth="md"
      >
        <CategoryForm
          initialCategory={editingCategory}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
