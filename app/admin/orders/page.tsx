'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { 
  collection, 
  getDocs, 
  query, 
  updateDoc, 
  doc, 
  orderBy, 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';

export default function AdminOrdersPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { docId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'confirmed' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && (!user || role !== 'admin')) {
      router.push('/');
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fetchedOrders = snapshot.docs.map(doc => ({
          ...doc.data() as Order,
          docId: doc.id,
        }));

        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && role === 'admin') {
      fetchOrders();
    }
  }, [user, role]);

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  const handleApprove = async (orderId: string, docId: string) => {
    try {
      setActionLoading(orderId);
      const orderDoc = doc(db, 'orders', docId);
      await updateDoc(orderDoc, {
        status: 'confirmed',
        updatedAt: new Date(),
      });

      // Update local state
      setOrders(orders.map(order => 
        order.docId === docId ? { ...order, status: 'confirmed' } : order
      ));
    } catch (err) {
      console.error('Error approving order:', err);
      setError('Failed to approve order. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: string, docId: string) => {
    try {
      setActionLoading(orderId);
      const orderDoc = doc(db, 'orders', docId);
      await updateDoc(orderDoc, {
        status: 'rejected',
        updatedAt: new Date(),
      });

      // Update local state
      setOrders(orders.map(order => 
        order.docId === docId ? { ...order, status: 'rejected' } : order
      ));
    } catch (err) {
      console.error('Error rejecting order:', err);
      setError('Failed to reject order. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center md:py-24">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return (
      <div className="mx-auto max-w-4xl py-16 md:py-24">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-3xl font-semibold text-red-900">Access Denied</h1>
          <p className="mt-4 text-lg text-red-800">You do not have permission to access this page.</p>
          <NextLink
            className="mt-8 inline-block border border-red-600 px-6 py-3 text-sm font-medium tracking-[0.2em] text-red-600 transition-colors hover:bg-red-600 hover:text-white"
            href="/"
          >
            BACK HOME
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Order Management</h1>
        <p className="mt-2 text-black/70">Review and approve customer orders</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-black/10">
        {(['pending', 'approved', 'confirmed', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              filter === status
                ? 'border-b-2 border-black text-black'
                : 'border-b-2 border-transparent text-black/60 hover:text-black'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-black/70">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <p className="text-black/70">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.docId} className="border-b border-black/10 hover:bg-black/2">
                  <td className="px-6 py-4 text-sm text-black">{order.orderId}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-black">{order.shippingAddress.fullName}</div>
                    <div className="text-xs text-black/60">{order.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-black">₱{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-black capitalize">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-900' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-900' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-900' :
                      'bg-red-100 text-red-900'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(order.orderId, order.docId)}
                            disabled={actionLoading === order.orderId}
                            className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {actionLoading === order.orderId ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(order.orderId, order.docId)}
                            disabled={actionLoading === order.orderId}
                            className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {actionLoading === order.orderId ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
