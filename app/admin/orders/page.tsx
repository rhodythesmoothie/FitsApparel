'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Order } from '@/types';

type AdminOrder = Order & { docId: string };

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'ready_for_pickup',
  'completed',
  'cancelled',
];

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleString();
  }
  return 'N/A';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!db) {
        setError('Firebase is not configured. Add your Firebase values to .env.local to manage orders.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        const fetched = snapshot.docs.map((orderDoc) => ({
          ...(orderDoc.data() as Order),
          docId: orderDoc.id,
        }));

        setOrders(fetched);
      } catch (fetchError) {
        console.error('Failed fetching admin orders:', fetchError);
        setError('Unable to fetch orders right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === filter || (order.status === 'approved' && filter === 'confirmed') || (order.status === 'rejected' && filter === 'cancelled'));
  }, [filter, orders]);

  const handleStatusUpdate = async (docId: string, nextStatus: OrderStatus) => {
    if (!db) {
      setError('Firebase is not configured. Add your Firebase values to .env.local to manage orders.');
      return;
    }

    try {
      setSavingId(docId);
      await updateDoc(doc(db, 'orders', docId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      setOrders((prev) => prev.map((order) => (order.docId === docId ? { ...order, status: nextStatus } : order)));
    } catch (updateError) {
      console.error('Failed updating order status:', updateError);
      setError('Could not update order status.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">Orders</h1>
        <p className="mt-2 text-black/70">Review customer purchases and update fulfillment status.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', ...ORDER_STATUSES] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
              filter === status ? 'border-black bg-black text-white' : 'border-black/20 text-black hover:border-black/40'
            }`}
          >
            {status === 'all' ? 'All' : statusLabel[status]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-black/70">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-black/70">No matching orders found.</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article key={order.docId} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Order</p>
                  <p className="mt-1 font-mono text-sm text-black">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Customer</p>
                  <p className="mt-1 text-sm text-black">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-black/60">{order.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Date</p>
                  <p className="mt-1 text-sm text-black">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Total</p>
                  <p className="mt-1 text-sm font-semibold text-black">₱{order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Payment</p>
                  <p className="mt-1 text-sm text-black uppercase">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Status</p>
                  <select
                    className="mt-1 w-full rounded border border-black/20 px-2 py-1 text-sm"
                    value={order.status === 'approved' ? 'confirmed' : order.status === 'rejected' ? 'cancelled' : order.status}
                    onChange={(event) => handleStatusUpdate(order.docId, event.target.value as OrderStatus)}
                    disabled={savingId === order.docId}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Products</p>
                  <div className="mt-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <p key={`${order.docId}-item-${idx}`} className="text-sm text-black">
                        {item.name} x{item.quantity} ({item.size}) - ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-black/55">Shipping / Contact</p>
                  <p className="mt-2 text-sm text-black">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-black/75">{order.shippingAddress.phone}</p>
                  <p className="text-sm text-black/75">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
