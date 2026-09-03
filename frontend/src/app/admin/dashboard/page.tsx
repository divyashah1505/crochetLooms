'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { productService } from '../../../services/product.service';
import { orderService } from '../../../services/order.service';
import { tagService } from '../../../services/tag.service';
import { categoryService } from '../../../services/category.service';
import { Product } from '../../../types/product';
import { Order } from '../../../types/order';
import { Loader } from '../../../components/common/Loader';
import {
  Package,
  ShoppingCart,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tagsCount, setTagsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 100 }),
      orderService.getAllOrdersAdmin(),
      tagService.getTags(),
      categoryService.getCategories(),
    ])
      .then(([prodRes, orderList, tagList, catList]) => {
        setProducts(prodRes.items || []);
        setOrders(orderList || []);
        setTagsCount(tagList?.length || 0);
        setCategoriesCount(catList?.length || 0);
      })
      .catch((err) => console.error('Failed to load admin metrics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Loader message="Compiling studio metrics & stats..." />;
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING');
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Artisan Studio Dashboard"
        subtitle="Live metrics on revenue, orders, inventory stock, and Tag Master taxonomy."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-sage-100 text-sage-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Gross Sales Revenue</p>
            <h3 className="text-2xl font-black text-yarn-mocha mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-clay-100 text-clay-600 rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Total Customer Orders</p>
            <h3 className="text-2xl font-black text-yarn-mocha mt-0.5">
              {orders.length} <span className="text-xs font-semibold text-amber-600">({pendingOrders.length} active)</span>
            </h3>
          </div>
        </div>

        {/* Total Handcrafted Products */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-cream-200 text-stone-700 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Products in Catalog</p>
            <h3 className="text-2xl font-black text-yarn-mocha mt-0.5">
              {products.length}
            </h3>
          </div>
        </div>

        {/* Tag Master Items */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-yarn-dustyPink/40 text-clay-700 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Tag Master Taxonomy</p>
            <h3 className="text-2xl font-black text-yarn-mocha mt-0.5">
              {tagsCount} <span className="text-xs font-medium text-stone-400">({categoriesCount} cats)</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Pipeline */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-100">
            <h3 className="text-base font-bold text-yarn-mocha flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-clay-600" /> Recent Customer Orders
            </h3>
            <Link href="/admin/dashboard/orders" className="text-xs font-semibold text-clay-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-cream-100">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-yarn-mocha">#{order.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cream-100 text-stone-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {order.address?.fullName || 'Customer'} • {order.items?.length || 0} items
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-clay-700">
                    ₹{order.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Inventory Alert */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-100">
            <h3 className="text-base font-bold text-yarn-mocha flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Items (≤5)
            </h3>
            <Link href="/admin/dashboard/products" className="text-xs font-semibold text-clay-600 hover:underline">
              Manage Products
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-sage-600 py-6 text-center font-medium">
              ✓ All products have healthy stock levels!
            </p>
          ) : (
            <div className="divide-y divide-cream-100">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-xs font-bold text-yarn-mocha truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-500">₹{p.price}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 flex-shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
