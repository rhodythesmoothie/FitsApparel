'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '@/config/firebase';
import { products as fallbackProducts, type Product } from '@/config/products';

type ProductDoc = {
  slug?: string;
  name?: string;
  price?: string | number;
  image?: string;
  description?: string;
  soldOut?: boolean;
  stock?: number;
  hidden?: boolean;
};

function normalizePrice(price: string | number | undefined) {
  if (typeof price === 'string') {
    return price.startsWith('₱') ? price : `₱${price}`;
  }

  if (typeof price === 'number') {
    return `₱${price.toFixed(2)}`;
  }

  return '₱0.00';
}

function mapProductDoc(id: string, data: ProductDoc): Product {
  return {
    slug: data.slug || id,
    name: data.name || 'Unnamed Product',
    price: normalizePrice(data.price),
    image: data.image || '/shirt1.png',
    description: data.description || 'Fits Apparel product',
    soldOut: Boolean(data.soldOut) || (typeof data.stock === 'number' && data.stock <= 0),
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isFirebaseConfigured || !db) {
        setProducts(fallbackProducts);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'products'));

        if (snapshot.empty) {
          setProducts(fallbackProducts);
          return;
        }

        const mapped = snapshot.docs
          .map((doc) => ({
            product: mapProductDoc(doc.id, doc.data() as ProductDoc),
            hidden: Boolean((doc.data() as ProductDoc).hidden),
          }))
          .filter((entry) => !entry.hidden)
          .map((entry) => entry.product)
          .filter((product) => product.slug && product.name)
          .filter((product, index, array) => array.findIndex((item) => item.slug === product.slug) === index);

        // Preserve the original relative order but place available products
        // before sold-out products (soldOut === true).
        const orderProducts = (list: Product[]) => {
          const available = list.filter((p) => !p.soldOut);
          const sold = list.filter((p) => p.soldOut);
          return [...available, ...sold];
        };

        setProducts(orderProducts(mapped.length > 0 ? mapped : fallbackProducts));
      } catch (error) {
        console.error('Failed to load products from Firestore:', error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productsBySlug = useMemo(() => {
    return new Map(products.map((product) => [product.slug, product]));
  }, [products]);

  return {
    products,
    loading,
    getProductBySlug: (slug: string) => productsBySlug.get(slug),
  };
}
