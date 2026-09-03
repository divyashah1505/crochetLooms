import { apiClient } from './api';
import { Product, CreateProductDto } from '../types/product';

export const productService = {
  async getProducts(params?: any): Promise<{ items: Product[]; meta: any }> {
    const res: any = await apiClient.get('/products', { params });
    return res.data;
  },

  async getProductById(id: string): Promise<Product> {
    const res: any = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const res: any = await apiClient.post('/products', dto);
    return res.data;
  },

  async updateProduct(id: string, dto: Partial<CreateProductDto>): Promise<Product> {
    const res: any = await apiClient.put(`/products/${id}`, dto);
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
