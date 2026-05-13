'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { collection, onSnapshot, type FirestoreError } from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Order } from '@/types';

type ProductDoc = {
  soldOut?: boolean;
  stock?: number;
  hidden?: boolean;
};

type SummaryCollection = 'orders' | 'products' | 'users';

const tiles = [
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Sales Summary', href: '/admin/sales' },
];

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [soldOutCount, setSoldOutCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [readErrors, setReadErrors] = useState<Record<SummaryCollection, string | null>>({
    orders: null,
    products: null,
    users: null,
  });

  useEffect(() => {
    if (!db) {
      const message = 'Firebase is not configured. Add your Firebase values to .env.local to load live dashboard data.';
      setReadErrors({ orders: message, products: message, users: message });
      return;
    }

    const setCollectionError = (collectionName: SummaryCollection, error: FirestoreError) => {
      const message =
        error.code === 'permission-denied'
          ? 'Permission denied. Deploy the updated Firestore rules so admin users can read this collection.'
          : error.message;

      setReadErrors((prev) => ({ ...prev, [collectionName]: message }));
    };

    const clearCollectionError = (collectionName: SummaryCollection) => {
      setReadErrors((prev) => ({ ...prev, [collectionName]: null }));
    };

    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setOrders(snapshot.docs.map((orderDoc) => orderDoc.data() as Order));
        clearCollectionError('orders');
      },
      (error) => setCollectionError('orders', error),
    );

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const products = snapshot.docs.map((productDoc) => productDoc.data() as ProductDoc);
        setProductCount(products.length);
        setSoldOutCount(
          products.filter(
            (product) =>
              product.hidden ||
              product.soldOut ||
              (typeof product.stock === 'number' && product.stock <= 0),
          ).length,
        );
        clearCollectionError('products');
      },
      (error) => setCollectionError('products', error),
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setCustomerCount(snapshot.docs.length);
        clearCollectionError('users');
      },
      (error) => setCollectionError('users', error),
    );

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
    };
  }, []);

  const metrics = useMemo(() => {
    const totalSales = orders
      .filter((order) => ['completed', 'confirmed', 'processing', 'ready_for_pickup', 'approved'].includes(order.status))
      .reduce((sum, order) => sum + order.total, 0);

    const pending = orders.filter((order) => order.status === 'pending').length;

    return {
      totalOrders: orders.length,
      totalSales,
      pending,
    };
  }, [orders]);

  const visibleErrors = Object.entries(readErrors).filter(([, message]) => Boolean(message));

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-black/70">Manage orders, products, customers, and sales in one place.</p>
      </div>

      {visibleErrors.length > 0 ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Some live dashboard data could not be loaded.</p>
          <div className="mt-2 space-y-1">
            {visibleErrors.map(([collectionName, message]) => (
              <p key={collectionName}>
                <span className="font-medium capitalize">{collectionName}:</span> {message}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Orders</p>
          <p className="mt-2 text-3xl font-semibold text-black">{metrics.totalOrders}</p>
          <p className="mt-1 text-sm text-black/60">{metrics.pending} pending review</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Sales</p>
          <p className="mt-2 text-3xl font-semibold text-black">₱{metrics.totalSales.toFixed(2)}</p>
          <p className="mt-1 text-sm text-black/60">Confirmed and completed orders</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Products</p>
          <p className="mt-2 text-3xl font-semibold text-black">{productCount}</p>
          <p className="mt-1 text-sm text-black/60">{soldOutCount} unavailable items</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-black/55">Customers</p>
          <p className="mt-2 text-3xl font-semibold text-black">{customerCount}</p>
          <p className="mt-1 text-sm text-black/60">Registered accounts</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <NextLink
            key={tile.href}
            href={tile.href}
            className="rounded-xl border border-black/10 bg-white p-5 text-black shadow-sm transition-colors hover:bg-black hover:text-white"
          >
            <p className="text-sm uppercase tracking-[0.16em]">Open</p>
            <p className="mt-1 text-xl font-semibold">{tile.label}</p>
          </NextLink>
        ))}
      </div>
    </section>
  );
}
