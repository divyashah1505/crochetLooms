'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../../services/product.service';
import { useCartStore } from '../../../store/cart.store';
import { useAuthStore } from '../../../store/auth.store';
import { Product } from '../../../types/product';
import { Button } from '../../../components/common/Button';
import { Loader } from '../../../components/common/Loader';
import { ProductCard } from '../../../components/customer/ProductCard';
import {
  ShoppingBag,
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Ruler,
  Clock,
  Shirt,
  Sparkle,
  Layers,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;

  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { customerToken, openAuthModal } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchProduct = async () => {
      try {
        let prod: Product;
        try {
          prod = await productService.getProductBySlug(idOrSlug);
        } catch {
          prod = await productService.getProductById(idOrSlug);
        }
        setProduct(prod);

        if (prod.category?.slug) {
          const related = await productService.getProducts({
            category: prod.category.slug,
            limit: 4,
          });
          setRelatedProducts(related.items?.filter((p) => p.id !== prod.id) || []);
        }
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    if (!customerToken) {
      useCartStore.setState({ pendingItem: { productId: product.id, quantity } });
      openAuthModal('login', 'Please sign in or create an account to add items to your cart.');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      if (err?.message !== 'AUTH_REQUIRED') {
        console.error('Failed to add to cart:', err);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;

    if (!customerToken) {
      useCartStore.setState({ pendingItem: { productId: product.id, quantity } });
      openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
      return;
    }

    try {
      await addItem(product.id, quantity);
      router.push('/checkout');
    } catch (err: any) {
      if (err?.message !== 'AUTH_REQUIRED') {
        console.error('Failed to proceed with Buy Now:', err);
      }
    }
  };

  if (isLoading) {
    return <Loader message="Unwinding artisanal yarn details..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="text-5xl">🧶</div>
        <h2 className="text-2xl font-bold text-yarn-mocha">Product Not Found</h2>
        <p className="text-xs text-stone-500">
          {error || 'This handcrafted piece might have been sold or moved.'}
        </p>
        <Link href="/products">
          <Button variant="primary">Browse All Creations</Button>
        </Link>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: '1',
            productId: product.id,
            imageUrl:
              'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
            displayOrder: 0,
          },
        ];

  const currentImageUrl = images[selectedImageIndex]?.imageUrl || images[0].imageUrl;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  // Category & Subcategory breadcrumb computation
  const parentCategory = product.category?.parent || (!product.category?.parentId ? product.category : null);
  const subcategory = product.category?.parentId ? product.category : null;

  return (
    <div className="min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="border-b border-cream-200 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-stone-500 overflow-x-auto no-scrollbar">
          <Link href="/products" className="hover:text-clay-600 flex items-center gap-1 flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> All Creations
          </Link>
          <span>/</span>
          {parentCategory && (
            <>
              <Link
                href={`/products?category=${parentCategory.slug}`}
                className="hover:text-clay-600 flex-shrink-0"
              >
                {parentCategory.name}
              </Link>
              <span>/</span>
            </>
          )}
          {subcategory && (
            <>
              <Link
                href={`/products?category=${subcategory.slug}`}
                className="hover:text-clay-600 flex-shrink-0 font-medium text-stone-700"
              >
                {subcategory.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-yarn-mocha truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Presentation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Featured Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-cream-100 border border-cream-200 shadow-md">
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {product.isFeatured && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yarn-honey text-amber-950 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Masterpiece
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-clay-600 ring-2 ring-clay-600/30 scale-105 shadow-sm'
                        : 'border-cream-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tags Badges from 5 Master Tag Groups */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/products?tag=${tag.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-clay-100 text-clay-800 border border-clay-200 hover:bg-clay-200 transition-colors"
                  >
                    <span>{tag.icon || '🏷️'}</span>
                    <span>{tag.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-yarn-mocha tracking-tight leading-tight">
                {product.name}
              </h1>
              {product.category && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-clay-600 font-bold uppercase tracking-wider">
                    {parentCategory?.name} {subcategory ? `➔ ${subcategory.name}` : ''}
                  </span>
                  {product.sku && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-white border border-cream-200 shadow-xs">
              <span className="text-3xl font-black text-clay-700">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-clay-600 text-white">
                    Save{' '}
                    {Math.round(
                      ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100,
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

            {/* Artisanal Specifications Card */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2.5 text-xs text-stone-700">
              <h4 className="font-bold uppercase tracking-wider text-yarn-mocha text-[11px] flex items-center gap-1.5 pb-1 border-b border-cream-200">
                <Layers className="w-3.5 h-3.5 text-clay-600" /> Artisanal Specifications
              </h4>

              {product.materials && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 font-medium">🧶 Yarn & Materials:</span>
                  <span className="font-bold text-yarn-mocha text-right">{product.materials}</span>
                </div>
              )}

              {product.dimensions && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 font-medium">📏 Dimensions:</span>
                  <span className="font-bold text-yarn-mocha text-right">{product.dimensions}</span>
                </div>
              )}

              {product.craftingTime && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 font-medium">⏱️ Crafting Time:</span>
                  <span className="font-bold text-yarn-mocha text-right">{product.craftingTime}</span>
                </div>
              )}

              {product.careInstructions && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 font-medium">🧼 Care Guide:</span>
                  <span className="font-bold text-yarn-mocha text-right">
                    {product.careInstructions}
                  </span>
                </div>
              )}

              {product.weight && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 font-medium">⚖️ Weight:</span>
                  <span className="font-bold text-yarn-mocha text-right">{product.weight}</span>
                </div>
              )}
            </div>

            {/* Stock Availability Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {product.stock > 0 ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-ping" />
                  <span className="text-sage-700">
                    {product.stock <= 5 ? (
                      <strong className="text-amber-600">
                        ⚡ Only {product.stock} left in stock - order soon!
                      </strong>
                    ) : (
                      `In Stock • ${product.stock} units ready to ship`
                    )}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-amber-700">
                    Made to Order • Please allow 3-5 days for crafting
                  </span>
                </>
              )}
            </div>

            {/* Quantity Controller & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-yarn-mocha">
                  Quantity:
                </span>
                <div className="flex items-center border border-cream-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-cream-100 text-stone-600 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-yarn-mocha">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2.5 hover:bg-cream-100 text-stone-600 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  leftIcon={
                    addedSuccess ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />
                  }
                  className={addedSuccess ? '!bg-sage-600' : ''}
                >
                  {addedSuccess ? 'Added to Cart!' : 'Add to Cart'}
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleBuyNow}
                  className="font-bold"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Craft Guarantees Card */}
            <div className="p-5 rounded-3xl bg-cream-100/70 border border-cream-200 space-y-3 text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-clay-600 flex-shrink-0" />
                <span>100% Organic, Hypoallergenic Yarn Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-sage-600 flex-shrink-0" />
                <span>Free shipping on all orders over ₹1,000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-yarn-honey flex-shrink-0" />
                <span>Secure encrypted Razorpay checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-cream-200">
            <h3 className="text-2xl font-extrabold text-yarn-mocha tracking-tight mb-8">
              More Handcrafted Creations You May Love
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
