'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../../types/product';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { ShoppingBag, Eye, Heart, Sparkles, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isLoading } = useCartStore();
  const { customerToken, openAuthModal } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const mainImage =
    product.images && product.images.length > 0 && product.images[0].imageUrl
      ? product.images[0].imageUrl
      : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    if (!customerToken) {
      useCartStore.setState({ pendingItem: { productId: product.id, quantity: 1 } });
      openAuthModal('login', 'Please sign in or create an account to add items to your cart.');
      return;
    }

    try {
      setIsAdding(true);
      await addItem(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: any) {
      if (err?.message !== 'AUTH_REQUIRED') {
        console.error('Failed to add to cart:', err);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl border border-cream-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
      
      {/* Product Image Container */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="relative block w-full aspect-square overflow-hidden bg-cream-100"
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yarn-honey text-amber-950 shadow-xs">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-clay-600 text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Tags overlay */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-md text-yarn-mocha shadow-xs border border-cream-200"
              >
                <span>{tag.icon || '🏷️'}</span>
                <span>{tag.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="p-2.5 rounded-full bg-white text-stone-800 shadow-md hover:scale-110 transition-transform">
            <Eye className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Name */}
          {product.category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-clay-500 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Product Name */}
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="text-sm font-bold text-yarn-mocha hover:text-clay-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-clay-700">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-[10px] font-medium text-sage-600">
                {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-red-500">
                Made to order
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock <= 0}
            className={`p-2.5 rounded-2xl transition-all duration-200 shadow-xs flex items-center justify-center ${
              justAdded
                ? 'bg-sage-600 text-white'
                : 'bg-cream-100 text-clay-700 hover:bg-clay-600 hover:text-white active:scale-95'
            }`}
            title="Add to Shopping Cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
