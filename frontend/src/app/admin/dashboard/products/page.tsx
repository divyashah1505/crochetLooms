'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { productService } from '../../../../services/product.service';
import { Product } from '../../../../types/product';
import { Button } from '../../../../components/common/Button';
import { Modal } from '../../../../components/common/Modal';
import { ProductForm } from '../../../../components/admin/ProductForm';
import { Loader } from '../../../../components/common/Loader';
import { Plus, Edit2, Trash2, Eye, Sparkles } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.items || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this handcrafted piece from the store?')) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Products Management"
        subtitle="Create, edit, and organize artisanal crochet listings and stock inventory."
        action={
          <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Product
          </Button>
        }
      />

      {isLoading ? (
        <Loader message="Loading product catalog..." />
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Tags (Tag Master)</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {products.map((p) => {
                  const img =
                    p.images && p.images.length > 0
                      ? p.images[0].imageUrl
                      : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80';

                  return (
                    <tr key={p.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-cream-200"
                          />
                          <div>
                            <p className="font-bold text-yarn-mocha">{p.name}</p>
                            <p className="text-[10px] text-stone-400">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-stone-600 font-medium">
                        {p.category?.name || 'Uncategorized'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.tags && p.tags.length > 0 ? (
                            p.tags.map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-clay-100 text-clay-700"
                              >
                                <span>{t.icon || '🏷️'}</span>
                                <span>{t.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-400 text-[10px]">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-clay-700">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-extrabold ${
                            p.stock <= 5 ? 'text-red-600' : 'text-stone-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-sage-100 text-sage-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-stone-500 hover:text-clay-600 hover:bg-cream-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create Handcrafted Product'}
        maxWidth="2xl"
      >
        <ProductForm
          initialProduct={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
