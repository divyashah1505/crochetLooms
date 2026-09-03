'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { orderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../types/order';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { OrderStatusModal } from '../../../components/admin/OrderStatusModal';
import { Loader } from '../../../components/common/Loader';
import { ShoppingCart, RefreshCw, Eye, Edit } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const status = selectedStatus === 'ALL' ? undefined : (selectedStatus as OrderStatus);
      const list = await orderService.getAllOrdersAdmin(status);
      setOrders(list || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Orders & Fulfillment"
        subtitle="Manage order progression, tracking status, and fulfillment updates."
        action={
          <Button onClick={loadOrders} variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-clay-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              {st}
            </button>
          ),
        )}
      </div>

      {isLoading ? (
        <Loader message="Fetching order records..." />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-3">
          <div className="text-4xl">📦</div>
          <h3 className="font-bold text-yarn-mocha text-sm">No Orders Found</h3>
          <p className="text-xs text-stone-500">
            {selectedStatus === 'ALL'
              ? 'Customer orders placed on the storefront will appear here.'
              : `No orders currently in ${selectedStatus} status.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-yarn-mocha">{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-yarn-mocha">{ord.customer?.name || 'Guest'}</p>
                      <p className="text-[10px] text-stone-400">{ord.customer?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-stone-700">
                        {ord.items?.length || 0} product(s)
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-xs">
                        {ord.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </p>
                    </td>
                    <td className="p-4 font-extrabold text-clay-700">
                      ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment?.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.payment?.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(
                          ord.status,
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingOrder(ord)}
                        className="p-1.5 text-clay-600 hover:text-clay-800 hover:bg-cream-100 rounded-lg transition-colors font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Update Status</span>
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
      <Modal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        title="Update Order Fulfillment"
        maxWidth="md"
      >
        <OrderStatusModal
          order={editingOrder}
          onSuccess={() => {
            setEditingOrder(null);
            loadOrders();
          }}
          onCancel={() => setEditingOrder(null)}
        />
      </Modal>
    </div>
  );
}
