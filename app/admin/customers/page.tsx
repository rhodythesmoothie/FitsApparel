'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/config/firebase';

type Customer = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: { toDate?: () => Date } | Date | string;
};

type OrderDoc = {
  userId?: string;
};

function formatDate(value: Customer['createdAt']) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }
  return 'N/A';
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderCountByUser, setOrderCountByUser] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'), where('role', '==', 'user'));
        const [usersSnapshot, ordersSnapshot] = await Promise.all([
          getDocs(usersQuery),
          getDocs(collection(db, 'orders')),
        ]);

        const fetchedCustomers = usersSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Customer, 'id'>;
          return {
            id: doc.id,
            email: data.email,
            role: data.role,
            createdAt: data.createdAt,
          };
        });

        const counts: Record<string, number> = {};
        ordersSnapshot.docs.forEach((doc) => {
          const order = doc.data() as OrderDoc;
          if (!order.userId) {
            return;
          }
          counts[order.userId] = (counts[order.userId] || 0) + 1;
        });

        setCustomers(fetchedCustomers);
        setOrderCountByUser(counts);
      } catch (error) {
        console.error('Failed loading customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black md:text-4xl">Customers</h1>
        <p className="mt-2 text-black/70">View customer information required for order processing.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="w-full min-w-[680px]">
          <thead className="border-b border-black/10 bg-black/[0.03]">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-black">Email</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-black">Role</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-black">Joined</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-black">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td className="px-5 py-5 text-sm text-black/65" colSpan={4}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-black/10">
                  <td className="px-5 py-4 text-sm text-black">{customer.email}</td>
                  <td className="px-5 py-4 text-sm capitalize text-black">{customer.role}</td>
                  <td className="px-5 py-4 text-sm text-black">{formatDate(customer.createdAt)}</td>
                  <td className="px-5 py-4 text-sm text-black">{orderCountByUser[customer.id] || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
