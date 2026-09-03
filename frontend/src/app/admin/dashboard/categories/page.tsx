'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { categoryService } from '../../../../services/category.service';
import { Category } from '../../../../types/category';
import { Button } from '../../../../components/common/Button';
import { Modal } from '../../../../components/common/Modal';
import { CategoryForm } from '../../../../components/admin/CategoryForm';
import { Loader } from '../../../../components/common/Loader';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';

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

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        loadCategories();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Category Collections"
        subtitle="Organize crochet products into overarching departments and gift collections."
        action={
          <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Category
          </Button>
        }
      />

      {isLoading ? (
        <Loader message="Loading categories..." />
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.imageUrl ||
                            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover border border-cream-200"
                        />
                        <div>
                          <p className="font-bold text-yarn-mocha text-sm">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-clay-700 font-semibold">
                      {c.slug}
                    </td>
                    <td className="p-4 text-stone-600 max-w-md">
                      {c.description || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-stone-500 hover:text-clay-600 hover:bg-cream-100 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Category"
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

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category "${editingCategory.name}"` : 'Create Category'}
        maxWidth="md"
      >
        <CategoryForm
          initialCategory={editingCategory}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
