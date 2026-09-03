'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { orderService } from '../../../../services/order.service';
import { Order } from '../../../../types/order';
import { Loader } from '../../../../components/common/Loader';
import { Users, Mail, Phone, ShoppingCart } from 'lucide-react';

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getAllOrdersAdmin()
      .then((data) => setOrders(data || []))
      .catch((err) => console.error('Failed to load orders for customers:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Group orders by customer
  const customerMap = new Map<
    string,
    { name: string; email: string; phone?: string; totalOrders: number; totalSpent: number; lastOrder: string }
  >();

  orders.forEach((o) => {
    const email = o.customer?.email || 'guest@example.com';
    const name = o.address?.fullName || o.customer?.name || 'Customer';
    const phone = o.address?.phone || o.customer?.phone;
    const amount = Number(o.totalAmount || 0);

    const existing = customerMap.get(email) || {
      name,
      email,
      phone,
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: o.createdAt,
    };

    existing.totalOrders += 1;
    existing.totalSpent += amount;
    if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
      existing.lastOrder = o.createdAt;
    }

    customerMap.set(email, existing);
  });

  const customerList = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Directory"
        subtitle="View all customers, purchase history, and contact details."
      />

      {isLoading ? (
        <Loader message="Compiling customer records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-yarn-mocha font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Value</th>
                  <th className="p-4">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {customerList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-500">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  customerList.map((c) => (
                    <tr key={c.email} className="hover:bg-cream-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-clay-100 text-clay-700 font-bold flex items-center justify-center text-xs border border-clay-300">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-yarn-mocha text-sm">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-stone-600">
                          <Mail className="w-3.5 h-3.5 text-stone-400" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-stone-400" /> {c.phone}
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-bold text-yarn-mocha">
                        {c.totalOrders} order{c.totalOrders > 1 ? 's' : ''}
                      </td>
                      <td className="p-4 font-black text-clay-700 text-sm">
                        ₹{c.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-stone-500">
                        {new Date(c.lastOrder).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
