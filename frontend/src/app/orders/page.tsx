'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { orderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../types/order';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader } from '../../components/common/Loader';
import { Package, Clock, CheckCircle2, Truck, Sparkles, MapPin } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { customerToken } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerToken) {
      router.push('/login?redirect=/orders');
      return;
    }

    orderService
      .getCustomerOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => console.error('Failed to fetch orders:', err))
      .finally(() => setIsLoading(false));
  }, [customerToken, router]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Confirmed</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">🧶 In Production</span>;
      case 'SHIPPED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">🚚 Shipped</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sage-100 text-sage-700">✓ Delivered</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">Pending</span>;
    }
  };

  if (isLoading) {
    return <Loader message="Fetching your handmade order history..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon="📦"
          title="No Orders Found"
          description="You haven't placed any orders yet. Discover our handmade crochet pieces and start your collection today!"
          actionText="Browse Handcrafted Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-cream-200 mb-8">
        <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
          My Orders & Tracking
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Track the progress of your handmade crochet pieces from artisan stitching to doorstep delivery.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden"
          >
            {/* Order Card Header */}
            <div className="p-6 bg-cream-50/70 border-b border-cream-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl border border-cream-200 text-clay-600 shadow-xs">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-yarn-mocha">
                      Order #{order.orderNumber}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-500">Total Paid</span>
                <p className="text-xl font-extrabold text-clay-700">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 space-y-4">
              <div className="divide-y divide-cream-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 rounded-xl object-cover border border-cream-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-cream-100 flex items-center justify-center text-xl">
                          🧶
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-yarn-mocha">{item.productName}</h4>
                        <p className="text-xs text-stone-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-clay-700">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address Snapshot */}
              {order.address && (
                <div className="pt-4 border-t border-cream-100 flex items-start gap-2 text-xs text-stone-600 bg-cream-50/50 p-4 rounded-2xl">
                  <MapPin className="w-4 h-4 text-clay-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-yarn-mocha">Delivering to: </span>
                    <span>
                      {order.address.fullName}, {order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.postalCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
