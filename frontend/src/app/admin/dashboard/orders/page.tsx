'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { orderService } from '../../../../services/order.service';
import { Order, OrderStatus } from '../../../../types/order';
import { OrderStatusModal } from '../../../../components/admin/OrderStatusModal';
import { Loader } from '../../../../components/common/Loader';
import { ShoppingCart, Edit3, CheckCircle, Clock, Truck, Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const list = await orderService.getAllOrdersAdmin(
        (selectedStatus as OrderStatus) || undefined,
      );
      setOrders(list || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Confirmed</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">🧶 In Production</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">🚚 Shipped</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sage-100 text-sage-700">✓ Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Order Fulfillment Pipeline"
        subtitle="Manage customer orders, track production progress, and update shipping statuses."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedStatus === st
                ? 'bg-clay-600 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-cream-100 border border-cream-200'
            }`}
          >
            {st ? st : 'All Orders'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader message="Loading order fulfillment records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer & Phone</th>
                  <th className="p-4">Delivery City</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-yarn-mocha">
                      #{o.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-yarn-mocha">{o.address?.fullName || o.customer?.name || 'Customer'}</p>
                      <p className="text-[10px] text-stone-500">{o.address?.phone || o.customer?.email}</p>
                    </td>
                    <td className="p-4 text-stone-600">
                      {o.address ? `${o.address.city}, ${o.address.state}` : '—'}
                    </td>
                    <td className="p-4 font-semibold text-stone-700">
                      {o.items?.length || 0} items
                    </td>
                    <td className="p-4 font-black text-clay-700 text-sm">
                      ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-clay-600 hover:text-white text-clay-800 font-bold transition-all shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Status Modal */}
      <OrderStatusModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadOrders()}
      />
    </div>
  );
}
