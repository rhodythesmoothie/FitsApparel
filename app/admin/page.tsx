'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Order } from '@/types';

type ProductDoc = {
  soldOut?: boolean;
  stock?: number;
  hidden?: boolean;
};

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersSnapshot, productsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users')),
        ]);

        const fetchedOrders = ordersSnapshot.docs.map((orderDoc) => orderDoc.data() as Order);
        const products = productsSnapshot.docs.map((productDoc) => productDoc.data() as ProductDoc);

        setOrders(fetchedOrders);
        setProductCount(products.length);
        setSoldOutCount(
          products.filter((product) => product.hidden || product.soldOut || (typeof product.stock === 'number' && product.stock <= 0)).length,
        );
        setCustomerCount(usersSnapshot.docs.length);
      } catch (error) {
        console.error('Failed loading admin summary:', error);
      }
    };

    fetchData();
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

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-black/70">Manage orders, products, customers, and sales in one place.</p>
      </div>

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
