import { apiClient } from './api';
import { Category } from '../types/category';

export const categoryService = {
  async getCategories() {
    const res = await apiClient.get('/categories');
    return res.data as Category[];
  },

  async getCategoryBySlug(slug: string) {
    const res = await apiClient.get(`/categories/slug/${slug}`);
    return res.data as Category;
  },

  async createCategory(payload: { name: string; slug?: string; description?: string; imageUrl?: string }) {
    const res = await apiClient.post('/categories', payload);
    return res.data as Category;
  },

  async updateCategory(id: string, payload: Partial<Category>) {
    const res = await apiClient.put(`/categories/${id}`, payload);
    return res.data as Category;
  },

  async deleteCategory(id: string) {
    return apiClient.delete(`/categories/${id}`);
  },
};
