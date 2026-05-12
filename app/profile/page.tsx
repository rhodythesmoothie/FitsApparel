'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { docId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCreatedAtValue = (value: unknown) => {
    if (value && typeof value === 'object' && 'seconds' in value) {
      return (value as { seconds: number }).seconds;
    }

    if (value instanceof Date) {
      return value.getTime() / 1000;
    }

    return 0;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
        );
        const snapshot = await getDocs(q);
        
        const fetchedOrders = snapshot.docs
          .map((doc) => ({
            ...doc.data() as Order,
            docId: doc.id,
          }))
          .sort((a, b) => {
            return getCreatedAtValue(b.createdAt) - getCreatedAtValue(a.createdAt);
          });

        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchOrders();
    }
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatOrderDate = (value: unknown) => {
    if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
      const ts = value as { toDate: () => Date };
      return ts.toDate().toLocaleDateString();
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value).toLocaleDateString();
    }

    return 'N/A';
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-md py-12 text-center md:py-16">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">My Profile</h1>
        <p className="mt-2 text-black/70">Manage your account and view orders</p>
      </div>

      {/* Profile Info */}
      <div className="mb-10 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-black">Account Information</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          <div className="rounded-xl bg-black/[0.02] p-4">
            <p className="text-sm font-medium text-black/70">Email Address</p>
            <p className="mt-2 text-lg text-black">{user.email}</p>
          </div>

          <div className="rounded-xl bg-black/[0.02] p-4">
            <p className="text-sm font-medium text-black/70">Account Created</p>
            <p className="mt-2 text-lg text-black">
              {user.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row">
          <NextLink
            className="block w-full rounded-lg bg-black px-6 py-3 text-center text-sm font-semibold tracking-[0.2em] text-white transition-colors hover:bg-black/90"
            href="/shop"
          >
            CONTINUE SHOPPING
          </NextLink>
          <button
            className="w-full rounded-lg border border-black/20 px-6 py-3 text-sm font-semibold tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white sm:w-auto sm:flex-1"
            onClick={handleLogout}
            type="button"
          >
            LOG OUT
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <h2 className="text-2xl font-semibold text-black md:text-3xl">Order History</h2>
        <p className="mt-2 text-black/70">View and track all your orders</p>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-black">No orders yet.</p>
            <p className="mt-2 text-sm text-black/65">
              You have not placed any orders yet. Start shopping to view your order history here.
            </p>
            <NextLink
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold tracking-[0.2em] text-white transition-colors hover:bg-black/90"
              href="/shop"
            >
              START SHOPPING
            </NextLink>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.docId} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <p className="text-sm font-medium text-black/70">Order Number</p>
                    <p className="mt-1 font-mono text-black">{order.orderId}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black/70">Date</p>
                    <p className="mt-1 text-black">{formatOrderDate(order.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black/70">Items</p>
                    <p className="mt-1 text-black">{order.items.length}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black/70">Total</p>
                    <p className="mt-1 font-semibold text-black">₱{order.total.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black/70">Status</p>
                    <p className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-900' :
                        order.status === 'approved' ? 'bg-blue-100 text-blue-900' :
                        order.status === 'confirmed' ? 'bg-green-100 text-green-900' :
                        'bg-red-100 text-red-900'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="mt-6 border-t border-black/10 pt-6">
                  <p className="text-sm font-medium text-black/70">Items</p>
                  <div className="mt-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-black">
                        {item.name} (Size: {item.size}) x{item.quantity} - ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-black/70">Shipping Address</p>
                      <p className="mt-1 text-sm text-black">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-black/70">Payment & Shipping</p>
                      <p className="mt-1 text-sm text-black">
                        Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}<br />
                        Shipping: ₱{order.shippingCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-900"><strong>Processing:</strong> Your order is being reviewed by our admin team. You'll receive a confirmation email once it's approved.</p>
                  </div>
                )}

                {order.status === 'confirmed' && (
                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-sm text-green-900"><strong>Confirmed:</strong> Your order has been approved and is ready for shipping.</p>
                  </div>
                )}

                {order.status === 'rejected' && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-900"><strong>Rejected:</strong> Your order was rejected. Please contact support for more information.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
