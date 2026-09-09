'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { Button } from '../common/Button';

export const CartDrawer: React.FC = () => {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem, isLoading } = useCartStore();

  if (!isDrawerOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 0;
  const progressPercent = 100;
  const amountToFreeShipping = 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-50 shadow-2xl flex flex-col border-l border-cream-200 animate-slideInRight">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-cream-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-clay-600" />
              <h2 className="text-lg font-bold text-yarn-mocha">
                Shopping Cart ({cart?.totalItems || 0})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-cream-100/70 border-b border-cream-200 text-xs">
            {amountToFreeShipping > 0 ? (
              <p className="text-stone-700 mb-1.5 font-medium">
                Add <span className="font-bold text-clay-700">₹{amountToFreeShipping}</span> more to unlock <span className="text-sage-600 font-bold">FREE Shipping!</span>
              </p>
            ) : (
              <p className="text-sage-600 font-bold flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Congratulations! You unlocked Free Shipping!
              </p>
            )}
            <div className="w-full h-2 bg-cream-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-clay-500 to-sage-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="text-5xl">🧶</div>
                <h3 className="text-base font-bold text-yarn-mocha">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Explore our handmade collections and pick something lovely crafted with organic yarn.
                </p>
                <button
                  onClick={closeDrawer}
                  className="mt-2 text-xs font-bold text-clay-600 hover:underline"
                >
                  Start Browsing Creations &rarr;
                </button>
              </div>
            ) : (
              items.map((item) => {
                const img =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0].imageUrl
                    : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 bg-white rounded-2xl border border-cream-200 shadow-xs"
                  >
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-cream-200 flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                          onClick={closeDrawer}
                          className="text-xs font-bold text-yarn-mocha hover:text-clay-600 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controller */}
                        <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1 || isLoading}
                            className="p-1 hover:bg-cream-200 text-stone-600 disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-yarn-mocha">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.product.stock}
                            className="p-1 hover:bg-cream-200 text-stone-600 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-clay-700">
                          ₹{item.lineTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-cream-200 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-yarn-mocha">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-yarn-mocha">
                    {cart?.shippingFee === 0 ? (
                      <span className="text-sage-600 uppercase font-bold">Free</span>
                    ) : (
                      `₹${cart?.shippingFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-cream-200 flex justify-between text-sm font-bold text-yarn-mocha">
                  <span>Total Amount</span>
                  <span className="text-clay-700 text-base">₹{cart?.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeDrawer} className="w-full">
                  <Button variant="secondary" className="w-full text-xs py-3">
                    View Full Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeDrawer} className="w-full">
                  <Button
                    variant="primary"
                    className="w-full text-xs py-3"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
