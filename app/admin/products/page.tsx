'use client';

import { Button } from '@heroui/button';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';

import { db, storage } from '@/config/firebase';
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const productCollection = useMemo(() => (db ? collection(db, 'products') : null), []);

  const fetchProducts = async () => {
    if (!productCollection) {
      setLoading(false);
      setMessage('Firebase is not configured. Add your Firebase values to .env.local to manage products.');
      return;
    }

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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (!storage) {
      setMessage('Firebase Storage is not configured. Add your storage bucket to .env.local to upload photos.');
      event.target.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      setMessage(null);

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const productName = form.name.trim() || file.name.replace(/\.[^.]+$/, '');
      const safeName = buildSlug(productName) || 'product-photo';
      const imageRef = storageRef(
        storage,
        `products/${safeName}-${Date.now()}.${fileExtension}`,
      );

      await uploadBytes(imageRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(imageRef);

      handleInput('image', downloadUrl);
      setMessage('Photo uploaded.');
    } catch (error) {
      console.error('Failed uploading photo:', error);
      setMessage(error instanceof Error ? error.message : 'Failed uploading photo.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage('Product name is required.');
      return;
    }

    if (!form.image.trim()) {
      setMessage('Product photo is required.');
      return;
    }

    try {
      if (!productCollection || !db) {
        throw new Error('Firebase is not configured. Add your Firebase values to .env.local to manage products.');
      }

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
      setMessage(error instanceof Error ? error.message : 'Failed saving product.');
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
      if (!db) {
        throw new Error('Firebase is not configured. Add your Firebase values to .env.local to manage products.');
      }

      await deleteDoc(doc(db, 'products', id));
      setMessage('Product deleted.');
      await fetchProducts();
    } catch (error) {
      console.error('Failed deleting product:', error);
      setMessage(error instanceof Error ? error.message : 'Failed deleting product.');
    }
  };

  const seedFallbackProducts = async () => {
    try {
      if (!productCollection) {
        throw new Error('Firebase is not configured. Add your Firebase values to .env.local to manage products.');
      }

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
      setMessage(error instanceof Error ? error.message : 'Failed to seed fallback products.');
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
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleImageUpload}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  className="bg-black px-4 font-semibold text-white"
                  isDisabled={saving || uploadingImage}
                  isLoading={uploadingImage}
                  radius="sm"
                  size="sm"
                  type="button"
                  onPress={() => fileInputRef.current?.click()}
                >
                  {form.image ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <span className="text-sm text-black/60">
                  {form.image ? 'Photo ready for this product.' : 'Upload a product photo.'}
                </span>
              </div>
              {form.image && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-2">
                  <img
                    alt="Product preview"
                    className="h-20 w-20 rounded-md border border-black/10 object-cover"
                    src={form.image}
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="text-sm font-medium text-black">Product photo selected</p>
                    <Button
                      className="mt-2 border-black/20 text-black"
                      radius="sm"
                      size="sm"
                      type="button"
                      variant="bordered"
                      onPress={() => handleInput('image', '')}
                    >
                      Remove Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
              disabled={saving || uploadingImage}
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
