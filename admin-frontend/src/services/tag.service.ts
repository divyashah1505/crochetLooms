import { apiClient } from './api';
import { Tag, CreateTagDto } from '../types/tag';

export const tagService = {
  async getTags(): Promise<Tag[]> {
    const res: any = await apiClient.get('/tags');
    return res.data;
  },

  async getTagById(id: string): Promise<Tag> {
    const res: any = await apiClient.get(`/tags/${id}`);
    return res.data;
  },

  async createTag(dto: CreateTagDto): Promise<Tag> {
    const res: any = await apiClient.post('/tags', dto);
    return res.data;
  },

  async updateTag(id: string, dto: Partial<CreateTagDto>): Promise<Tag> {
    const res: any = await apiClient.put(`/tags/${id}`, dto);
    return res.data;
  },

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
