'use client';

import { useCart } from '@/context/CartContext';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center md:py-24">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl py-16 md:py-24">
        <div className="rounded-2xl border border-black/10 bg-white p-8">
          <h1 className="text-3xl font-semibold text-black">Shopping Cart</h1>
          <p className="mt-6 text-lg text-black/70">
            Your cart is empty.
          </p>
          <NextLink
            className="mt-8 inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
            href="/shop"
          >
            CONTINUE SHOPPING
          </NextLink>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="mx-auto max-w-6xl py-8 md:py-16">
      <h1 className="text-3xl font-semibold text-black">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.slug}-${item.size}`}
                className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-4 sm:flex-row"
              >
                <img
                  alt={item.name}
                  className="h-24 w-24 self-center object-cover sm:self-auto"
                  src={item.image}
                />

                <div className="flex flex-1 flex-col">
                  <h3 className="text-lg font-medium text-black">{item.name}</h3>
                  <p className="mt-1 text-sm text-black/70">Size: {item.size}</p>
                  <p className="mt-1 text-lg font-semibold text-black">
                    {item.price}
                  </p>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">
                  <button
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                    onClick={() => removeItem(item.slug, item.size)}
                    type="button"
                  >
                    Remove
                  </button>

                  <div className="flex items-center gap-2 border border-black/10 rounded">
                    <button
                      className="px-2 py-1 text-black hover:bg-black/5"
                      onClick={() =>
                        updateQuantity(item.slug, item.size, item.quantity - 1)
                      }
                      type="button"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-black">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 text-black hover:bg-black/5"
                      onClick={() =>
                        updateQuantity(item.slug, item.size, item.quantity + 1)
                      }
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/10 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-black">Order Summary</h2>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
              <div className="flex justify-between text-black">
                <span>Subtotal</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black">
                <span>Shipping</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between text-black">
                <span>Tax</span>
                <span>TBD</span>
              </div>

              <div className="border-t border-black/10 pt-3 flex justify-between text-lg font-semibold text-black">
                <span>Total</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="mt-8 w-full bg-black px-6 py-4 text-sm font-medium tracking-[0.1em] text-white transition-opacity hover:opacity-90 sm:tracking-[0.2em]"
              disabled
              type="button"
            >
              PROCEED TO CHECKOUT
            </button>

            <NextLink
              className="mt-3 block w-full border border-black px-6 py-3 text-center text-sm font-medium tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white sm:tracking-[0.2em]"
              href="/shop"
            >
              CONTINUE SHOPPING
            </NextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
