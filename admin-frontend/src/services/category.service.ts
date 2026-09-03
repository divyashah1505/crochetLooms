import { apiClient } from './api';
import { Category, CreateCategoryDto } from '../types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res: any = await apiClient.get('/categories');
    return res.data;
  },

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const res: any = await apiClient.post('/categories', dto);
    return res.data;
  },

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const res: any = await apiClient.put(`/categories/${id}`, dto);
    return res.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
