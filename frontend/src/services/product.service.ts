import { apiClient } from './api';
import { Product, ProductQuery } from '../types/product';
import { PaginatedResult } from '../types/api';

export const productService = {
  async getProducts(query: ProductQuery = {}) {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.tag) params.append('tag', query.tag);
    if (query.minPrice !== undefined) params.append('minPrice', query.minPrice.toString());
    if (query.maxPrice !== undefined) params.append('maxPrice', query.maxPrice.toString());
    if (query.sort) params.append('sort', query.sort);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await apiClient.get(`/products?${params.toString()}`);
    return res.data as PaginatedResult<Product>;
  },

  async getProductById(id: string) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data as Product;
  },

  async getProductBySlug(slug: string) {
    const res = await apiClient.get(`/products/slug/${slug}`);
    return res.data as Product;
  },

  async createProduct(payload: any) {
    const res = await apiClient.post('/products', payload);
    return res.data as Product;
  },

  async updateProduct(id: string, payload: any) {
    const res = await apiClient.put(`/products/${id}`, payload);
    return res.data as Product;
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/products/${id}`);
  },
};
