'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Order } from '@/types';

export default function AdminSalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!db) {
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        setOrders(snapshot.docs.map((doc) => doc.data() as Order));
      } catch (error) {
        console.error('Failed loading sales summary:', error);
      }
    };

    fetchOrders();
  }, []);

  const summary = useMemo(() => {
    const completedStatuses = new Set(['confirmed', 'processing', 'ready_for_pickup', 'completed', 'approved']);
    const activeOrders = orders.filter((order) => completedStatuses.has(order.status));
    const revenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = activeOrders.length > 0 ? revenue / activeOrders.length : 0;

    const byPayment = activeOrders.reduce<Record<string, number>>((acc, order) => {
      const key = order.paymentMethod;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      revenue,
      averageOrder,
      completed: activeOrders.length,
      pending: orders.filter((order) => order.status === 'pending').length,
      cancelled: orders.filter((order) => order.status === 'cancelled' || order.status === 'rejected').length,
      byPayment,
    };
  }, [orders]);

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">Sales Summary</h1>
        <p className="mt-2 text-black/70">Track revenue, order completion, and payment trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-black">₱{summary.revenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Avg Order</p>
          <p className="mt-2 text-3xl font-semibold text-black">₱{summary.averageOrder.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-black">{summary.completed}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-black">{summary.pending}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Orders by Payment Method</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(['gcash', 'cod', 'card'] as const).map((method) => (
            <div key={method} className="rounded-xl border border-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-black/55">{method}</p>
              <p className="mt-2 text-2xl font-semibold text-black">{summary.byPayment[method] || 0}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-900">
            Cancelled or rejected orders: <span className="font-semibold">{summary.cancelled}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
