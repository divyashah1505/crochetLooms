'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { tagService } from '../../services/tag.service';
import { categoryService } from '../../services/category.service';
import { Product } from '../../types/product';
import { Order } from '../../types/order';
import { Loader } from '../../components/common/Loader';
import {
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tagCount, setTagCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, ordRes, tags, cats] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          orderService.getAllOrdersAdmin().catch(() => []),
          tagService.getTags(),
          categoryService.getCategories(),
        ]);
        setProducts(prodRes.items || []);
        setOrders(ordRes || []);
        setTagCount(tags.length || 0);
        setCategoryCount(cats.length || 0);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <Loader message="Compiling artisanal store analytics..." />;
  }

  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING');

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Artisan Dashboard Overview"
        subtitle="Manage your handcrafted catalog, customer orders, and store taxonomy."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Products
            </span>
            <span className="p-2.5 bg-clay-50 text-clay-600 rounded-2xl">
              <Package className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-yarn-mocha">{products.length}</p>
          <p className="text-[11px] text-stone-400">Handcrafted listings active</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Tag Master
            </span>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Tag className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-yarn-mocha">{tagCount}</p>
          <p className="text-[11px] text-stone-400">Taxonomy tags configured</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Orders
            </span>
            <span className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <ShoppingCart className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-yarn-mocha">{orders.length}</p>
          <p className="text-[11px] text-stone-400">
            {pendingOrders.length} pending fulfillment
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-clay-700">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-stone-400">From customer purchases</p>
        </div>
      </div>

      {/* Recent Products & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-cream-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-yarn-mocha text-sm">Recent Handcrafted Products</h3>
            <Link
              href="/dashboard/products"
              className="text-xs text-clay-600 hover:text-clay-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-cream-100">
            {products.slice(0, 5).map((p) => {
              const img =
                p.images && p.images.length > 0
                  ? p.images[0].imageUrl
                  : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80';

              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-cream-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-yarn-mocha">{p.name}</p>
                      <p className="text-[10px] text-clay-500 font-medium">
                        {p.category?.name || 'Handcrafted'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-xs text-clay-700">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-stone-400">{p.stock} in stock</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-cream-100 to-cream-200 rounded-3xl p-6 border border-cream-300 space-y-4">
          <div className="flex items-center gap-2 text-clay-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Storefront Architecture</span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            The customer storefront and admin portal now run on completely dedicated ports:
          </p>

          <div className="space-y-2.5">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="block p-3.5 bg-white rounded-2xl border border-cream-300 shadow-xs hover:border-clay-500 transition-all text-xs"
            >
              <p className="font-bold text-yarn-mocha">🛍️ Customer Storefront</p>
              <p className="text-clay-600 font-mono text-[11px] mt-0.5">http://localhost:3000</p>
            </a>

            <div className="p-3.5 bg-white rounded-2xl border border-clay-400 shadow-xs text-xs">
              <p className="font-bold text-clay-700">👑 Admin Portal (Current)</p>
              <p className="text-stone-500 font-mono text-[11px] mt-0.5">http://localhost:3001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
