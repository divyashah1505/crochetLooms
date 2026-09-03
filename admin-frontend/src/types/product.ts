import { Category } from './category';
import { Tag } from './tag';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  publicId?: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categoryId: string;
  category?: Category;
  tags?: Tag[];
  images?: ProductImage[];
  isActive: boolean;
  isFeatured: boolean;
  materials?: string;
  dimensions?: string;
  careInstructions?: string;
  craftingTime?: string;
  weight?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categoryId: string;
  tagIds?: string[];
  images?: { imageUrl: string; publicId?: string; displayOrder?: number }[];
  isActive?: boolean;
  isFeatured?: boolean;
  materials?: string;
  dimensions?: string;
  careInstructions?: string;
  craftingTime?: string;
  weight?: string;
  sku?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'featured';
  isFeatured?: boolean;
  isActive?: boolean;
}
