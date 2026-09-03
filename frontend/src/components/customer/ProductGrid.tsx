import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-cream-200 p-4 space-y-4 animate-pulse"
          >
            <div className="aspect-square bg-cream-200 rounded-2xl w-full" />
            <div className="space-y-2">
              <div className="h-4 bg-cream-200 rounded w-3/4" />
              <div className="h-3 bg-cream-200 rounded w-1/2" />
            </div>
            <div className="h-8 bg-cream-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="🌸"
        title="No creations found"
        description="We couldn't find any crochet items matching your selection. Try browsing all creations or clearing your filters."
        actionText="Browse All Creations"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
