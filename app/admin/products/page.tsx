'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { products as fallbackProducts } from '@/config/products';

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  image: string;
  description: string;
  stock: number;
  soldOut: boolean;
  hidden: boolean;
};

type ProductDoc = Omit<AdminProduct, 'id' | 'price'> & { price?: string | number };

type ProductFormState = Omit<AdminProduct, 'id'>;

const EMPTY_FORM: ProductFormState = {
  slug: '',
  name: '',
  price: '₱0.00',
  image: '',
  description: '',
  stock: 0,
  soldOut: false,
  hidden: false,
};

function buildSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const productCollection = useMemo(() => collection(db, 'products'), []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(productCollection);

      const fetched = snapshot.docs.map((docItem) => {
        const data = docItem.data() as ProductDoc;
        return {
          id: docItem.id,
          slug: data.slug || docItem.id,
          name: data.name || 'Untitled',
          price: typeof data.price === 'number' ? `₱${data.price.toFixed(2)}` : data.price || '₱0.00',
          image: data.image || '/shirt1.png',
          description: data.description || '',
          stock: typeof data.stock === 'number' ? data.stock : 0,
          soldOut: Boolean(data.soldOut),
          hidden: Boolean(data.hidden),
        };
      });

      setProducts(fetched);
    } catch (error) {
      console.error('Failed loading products:', error);
      setMessage('Could not load products right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInput = (field: keyof ProductFormState, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage('Product name is required.');
      return;
    }

    if (!form.image.trim()) {
      setMessage('Product image URL/path is required.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        ...form,
        slug: form.slug.trim() || buildSlug(form.name),
        soldOut: form.soldOut || form.stock <= 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload);
        setMessage('Product updated.');
      } else {
        await addDoc(productCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMessage('Product added.');
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchProducts();
    } catch (error) {
      console.error('Failed saving product:', error);
      setMessage('Failed saving product.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      stock: product.stock,
      soldOut: product.soldOut,
      hidden: product.hidden,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setMessage('Product deleted.');
      await fetchProducts();
    } catch (error) {
      console.error('Failed deleting product:', error);
      setMessage('Failed deleting product.');
    }
  };

  const seedFallbackProducts = async () => {
    try {
      setSaving(true);
      for (const product of fallbackProducts) {
        await addDoc(productCollection, {
          ...product,
          stock: product.soldOut ? 0 : 20,
          hidden: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setMessage('Seeded default products into Firestore.');
      await fetchProducts();
    } catch (error) {
      console.error('Failed seeding fallback products:', error);
      setMessage('Failed to seed fallback products.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl py-6 md:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-black md:text-4xl">Product Management</h1>
          <p className="mt-2 text-black/70">Add, edit, hide, or delete products and control inventory.</p>
        </div>
        <button
          className="rounded-lg border border-black/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white disabled:opacity-60"
          onClick={seedFallbackProducts}
          type="button"
          disabled={saving}
        >
          Seed Default Products
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm text-black/80">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <form className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm" onSubmit={handleSave}>
          <h2 className="text-lg font-semibold text-black">{editingId ? 'Edit Product' : 'Add Product'}</h2>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Product name"
              value={form.name}
              onChange={(event) => handleInput('name', event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(event) => handleInput('slug', event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Price (e.g. ₱550.00)"
              value={form.price}
              onChange={(event) => handleInput('price', event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Image URL or /public path"
              value={form.image}
              onChange={(event) => handleInput('image', event.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(event) => handleInput('description', event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(event) => handleInput('stock', Number(event.target.value || 0))}
            />

            <label className="flex items-center gap-2 text-sm text-black/80">
              <input
                checked={form.soldOut}
                type="checkbox"
                onChange={(event) => handleInput('soldOut', event.target.checked)}
              />
              Mark as sold out
            </label>
            <label className="flex items-center gap-2 text-sm text-black/80">
              <input
                checked={form.hidden}
                type="checkbox"
                onChange={(event) => handleInput('hidden', event.target.checked)}
              />
              Hide from storefront
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {editingId ? 'Update' : 'Add'} Product
            </button>
            {editingId && (
              <button
                className="rounded-lg border border-black/20 px-4 py-2 text-sm"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
          <table className="w-full min-w-[780px]">
            <thead className="border-b border-black/10 bg-black/[0.03]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">Product</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">Price</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">Stock</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-5 text-sm text-black/65" colSpan={5}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-sm text-black/65" colSpan={5}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-black/10">
                    <td className="px-5 py-4 text-sm">
                      <p className="font-medium text-black">{product.name}</p>
                      <p className="text-xs text-black/55">{product.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-black">{product.price}</td>
                    <td className="px-5 py-4 text-sm text-black">{product.stock}</td>
                    <td className="px-5 py-4 text-sm text-black">
                      {product.hidden ? 'Hidden' : product.soldOut || product.stock <= 0 ? 'Sold Out' : 'Available'}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-black/20 px-3 py-1"
                          onClick={() => handleEdit(product)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-red-200 px-3 py-1 text-red-700"
                          onClick={() => handleDelete(product.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
