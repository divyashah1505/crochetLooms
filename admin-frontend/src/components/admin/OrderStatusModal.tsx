'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/order';
import { orderService } from '../../services/order.service';
import { Button } from '../common/Button';

interface OrderStatusModalProps {
  order: Order | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: '⏳ Pending Confirmation', color: 'text-amber-700' },
  { value: 'CONFIRMED', label: '✅ Order Confirmed', color: 'text-blue-700' },
  { value: 'PROCESSING', label: '🧶 Artisan Handcrafting / In Progress', color: 'text-purple-700' },
  { value: 'SHIPPED', label: '🚚 Shipped / In Transit', color: 'text-indigo-700' },
  { value: 'DELIVERED', label: '📦 Delivered Successfully', color: 'text-emerald-700' },
  { value: 'CANCELLED', label: '❌ Cancelled', color: 'text-red-700' },
];

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  onSuccess,
  onCancel,
}) => {
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'PENDING');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await orderService.updateOrderStatus(order.id, status);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-500 font-semibold">Order Number:</span>
          <span className="font-bold text-yarn-mocha">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-500 font-semibold">Customer:</span>
          <span className="font-bold text-yarn-mocha">
            {order.customer?.name} ({order.customer?.email})
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-500 font-semibold">Total Amount:</span>
          <span className="font-bold text-clay-700">₹{order.totalAmount}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-2">
          Update Fulfillment Status
        </label>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                status === opt.value
                  ? 'bg-cream-100 border-clay-500 shadow-xs'
                  : 'bg-white border-cream-200 hover:bg-cream-50'
              }`}
            >
              <input
                type="radio"
                name="orderStatus"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="text-clay-600 focus:ring-clay-500"
              />
              <span className={opt.color}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save Fulfillment Status
        </Button>
      </div>
    </form>
  );
};
