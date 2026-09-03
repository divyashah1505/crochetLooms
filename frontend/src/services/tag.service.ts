import { apiClient } from './api';
import { Tag } from '../types/tag';

export const tagService = {
  async getTags() {
    const res = await apiClient.get('/tags');
    return res.data as Tag[];
  },

  async getTagBySlug(slug: string) {
    const res = await apiClient.get(`/tags/slug/${slug}`);
    return res.data as Tag;
  },

  async createTag(payload: { name: string; slug?: string; description?: string; icon?: string }) {
    const res = await apiClient.post('/tags', payload);
    return res.data as Tag;
  },

  async updateTag(id: string, payload: Partial<Tag>) {
    const res = await apiClient.put(`/tags/${id}`, payload);
    return res.data as Tag;
  },

  async deleteTag(id: string) {
    return apiClient.delete(`/tags/${id}`);
  },
};
