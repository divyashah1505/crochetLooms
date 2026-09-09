'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Trash2, Plus, Minus, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeItem, clearCart, isLoading } = useCartStore();
  const { customerToken, isInitialized, initAuth } = useAuthStore();

  const token = customerToken || (typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null);

  useEffect(() => {
    if (!isInitialized) {
      initAuth();
      return;
    }
    if (token) {
      fetchCart();
    }
  }, [token, isInitialized, initAuth, fetchCart]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = cart?.shippingFee ?? (subtotal > 1000 || subtotal <= 50 ? 0 : 50);
  const totalAmount = cart?.totalAmount ?? (subtotal + shippingFee);

  if (!isInitialized && !token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-stone-500">
        Loading cart...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon="🔒"
          title="Please Sign In"
          description="Log in or continue with Google to access your artisan crochet shopping cart."
          actionText="Sign In with Google / Email"
          actionHref="/login?redirect=/cart"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon="🧶"
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any handmade crochet creations yet."
          actionText="Explore All Creations"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pb-6 border-b border-cream-200 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
            Shopping Cart ({cart?.totalItems || 0} items)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review your handmade selections before proceeding to secure checkout.
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Cart Item Table / List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const img =
              item.product.images && item.product.images.length > 0
                ? item.product.images[0].imageUrl
                : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-3xl border border-cream-200 shadow-xs"
              >
                <img
                  src={img}
                  alt={item.product.name}
                  className="w-full sm:w-28 h-28 rounded-2xl object-cover border border-cream-200"
                />

                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      {item.product.category && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-clay-500">
                          {item.product.category.name}
                        </p>
                      )}
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                        className="text-sm font-bold text-yarn-mocha hover:text-clay-600 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                    <div className="flex items-center border border-cream-300 rounded-xl bg-cream-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || isLoading}
                        className="p-2 hover:bg-cream-200 text-stone-600 disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-yarn-mocha">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        className="p-2 hover:bg-cream-200 text-stone-600 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-clay-700">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-stone-400">
                        ₹{Number(item.price).toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4">
          <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-yarn-mocha pb-3 border-b border-cream-200">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart?.totalItems} items)</span>
                <span className="font-semibold text-yarn-mocha">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-yarn-mocha">
                  {shippingFee === 0 ? (
                    <span className="text-sage-600 font-bold uppercase">Free</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-cream-200 flex justify-between text-base font-extrabold text-yarn-mocha">
                <span>Estimated Total</span>
                <span className="text-clay-700 text-xl">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Checkout
              </Button>
            </Link>

            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-[11px] text-stone-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-yarn-mocha">
                <Sparkles className="w-3.5 h-3.5 text-clay-600" />
                <span>Handmade with Love</span>
              </div>
              <p>Every purchase directly empowers our community of passionate crochet craftswomen.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
