'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/order';
import { orderService } from '../../services/order.service';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface OrderStatusModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order?.status || 'PENDING',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const statuses: { value: OrderStatus; label: string; desc: string }[] = [
    { value: 'PENDING', label: 'Pending', desc: 'Order received, awaiting payment or processing' },
    { value: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified, queued for artisan knitting' },
    { value: 'PROCESSING', label: 'In Production / Processing', desc: 'Artisans actively hand-stitching or packaging' },
    { value: 'SHIPPED', label: 'Shipped', desc: 'Handed over to courier with tracking' },
    { value: 'DELIVERED', label: 'Delivered', desc: 'Successfully received by customer' },
    { value: 'CANCELLED', label: 'Cancelled', desc: 'Order cancelled and stock restored' },
  ];

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await orderService.updateOrderStatusAdmin(order.id, selectedStatus);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Order #${order.orderNumber}`} maxWidth="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <p className="text-xs text-stone-600">
          Customer: <strong className="text-yarn-mocha">{order.address?.fullName || 'Customer'}</strong> • Total: <strong className="text-clay-700">₹{order.totalAmount}</strong>
        </p>

        <div className="space-y-2">
          {statuses.map((item) => (
            <label
              key={item.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedStatus === item.value
                  ? 'bg-clay-50 border-clay-500 shadow-xs'
                  : 'bg-white border-cream-200 hover:bg-cream-100'
              }`}
            >
              <input
                type="radio"
                name="order_status"
                value={item.value}
                checked={selectedStatus === item.value}
                onChange={() => setSelectedStatus(item.value)}
                className="mt-1 text-clay-600 focus:ring-clay-500"
              />
              <div className="text-xs">
                <p className="font-bold text-yarn-mocha">{item.label}</p>
                <p className="text-stone-500">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} isLoading={isLoading}>
            Save Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};
