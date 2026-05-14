'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { addToast } from '@heroui/toast';

import { sizeOptions } from "@/config/products";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { role } = useAuth();
  const { getProductBySlug, loading } = useProducts();
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const showSizeRequiredToast = () => {
    addToast({
      title: 'Select a size',
      description: 'Choose your preferred size before continuing.',
      color: 'warning',
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl py-6 text-center md:py-10">
        <p className="text-black/70">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl py-6 text-center md:py-10">
        <h1 className="text-3xl font-semibold text-black">Product not found</h1>
        <NextLink
          className="mt-6 inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black"
          href="/shop"
        >
          BACK TO SHOP
        </NextLink>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (role === 'admin') {
      return;
    }

    if (!selectedSize) {
      showSizeRequiredToast();
      return;
    }

    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (role === 'admin') {
      return;
    }

    if (!selectedSize) {
      showSizeRequiredToast();
      return;
    }

    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity,
    });

    router.push('/cart');
  };

  return (
    <section className="mx-auto max-w-7xl py-6 md:py-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="flex items-start justify-center bg-white p-0 lg:pt-0">
          <img
            alt={product.name}
            className="h-auto w-full max-h-[760px] object-contain object-top"
            src={product.image}
          />
        </div>

        <div className="flex flex-col justify-start rounded-3xl bg-white p-6 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-black/50">
            Fits Apparel
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-black md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-2xl font-semibold tracking-widest text-black md:text-3xl">
            {product.price}
          </p>

          <div className="mt-6 h-px w-16 bg-black/70" />

          <p className="mt-6 max-w-xl text-base leading-7 text-black/80 md:text-lg">
            {product.description}
          </p>

          {role === 'admin' ? (
            <div className="mt-10 rounded-xl border border-black/10 bg-black/[0.03] p-5">
              <p className="text-sm text-black/75">
                Admin accounts cannot add products to cart or checkout. Use the admin product manager to update this item.
              </p>
              <NextLink
                href="/admin/products"
                className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white"
              >
                MANAGE PRODUCTS
              </NextLink>
            </div>
          ) : product.soldOut ? (
            <>
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-black">Size:</h2>
                  <NextLink
                    className="text-lg text-black underline underline-offset-4"
                    href="/shop#size-chart"
                  >
                    Size chart
                  </NextLink>
                </div>
                <div className="mt-4">
                  <button
                    className="relative flex h-14 w-14 items-center justify-center border border-black text-xl text-black"
                    disabled
                    type="button"
                  >
                    S
                    <span className="pointer-events-none absolute left-1/2 top-1/2 h-[1px] w-[72px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black" />
                  </button>
                </div>
              </div>

              <button
                className="mt-10 w-full border border-black/15 bg-white px-6 py-4 text-sm font-medium tracking-[0.35em] text-black/85"
                disabled
                type="button"
              >
                SOLD OUT
              </button>
            </>
          ) : (
            <>
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-black">Size</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`min-w-14 border px-4 py-2 text-sm font-medium tracking-widest transition-colors ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-black text-black hover:bg-black hover:text-white'
                      }`}
                      onClick={() => setSelectedSize(size)}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="mt-2 text-xs text-red-600">Please select a size</p>
                )}
              </div>

              <div className="mt-8 flex items-center gap-5">
                <span className="text-lg font-semibold text-black">Quantity</span>
                <div className="flex items-center border border-black/10 bg-black/5">
                  <button
                    className="px-3 py-2 text-black hover:bg-black/10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-black">{quantity}</span>
                  <button
                    className="px-3 py-2 text-black hover:bg-black/10"
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  className={`border border-black px-6 py-4 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white ${
                    addedToCart ? 'bg-green-50 border-green-200 text-green-700' : ''
                  }`}
                  onClick={handleAddToCart}
                  type="button"
                >
                  {addedToCart ? '✓ ADDED TO CART' : 'ADD TO CART'}
                </button>
                <button
                  className="bg-black px-6 py-4 text-sm font-medium tracking-[0.2em] text-white transition-opacity hover:opacity-90"
                  onClick={handleBuyNow}
                  type="button"
                >
                  BUY IT NOW
                </button>
              </div>

              <div className="mt-10 rounded-2xl border border-black/10 bg-white p-4 flex justify-center">
                <img
                  alt={`${product.name} size chart`}
                  src="/sizechart.png"
                  className="w-full max-w-xs md:max-w-sm rounded-lg object-contain"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
