"use client";

import NextLink from "next/link";

import { useProducts } from "@/hooks/useProducts";

export default function ShopPage() {
  const { products, loading } = useProducts();

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black md:text-5xl">
            Shop
          </h1>
          <p className="mt-3 text-base text-black/70 md:text-lg">
            Browse our collection of premium Fits Apparel shirt designs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && products.map((shirt) => (
            <div
              key={shirt.slug}
              className="overflow-hidden rounded-xl border border-black/10 bg-white transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <article className="relative">
                {shirt.soldOut ? (
                  <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center">
                    <span className="bg-black text-white px-4 py-2 rounded-lg font-semibold">SOLD OUT</span>
                  </div>
                ) : null}
                <img
                  alt={shirt.name}
                  className="h-80 w-full object-cover object-center"
                  src={shirt.image}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-medium leading-tight text-black flex-1">{shirt.name}</h3>
                    <p className="text-lg font-semibold leading-none text-black">{shirt.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <NextLink
                      href={`/shop/${shirt.slug}`}
                      className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-lg transition-colors duration-200 ${
                        shirt.soldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-black/90'
                      }`}
                    >
                      {shirt.soldOut ? 'Sold Out' : 'View Details'}
                    </NextLink>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-black/10 bg-white p-6 md:p-8" id="size-chart">
          <h2 className="text-3xl font-bold text-black md:text-4xl">Shirt Size Guide</h2>
          <p className="mt-3 text-base text-black/70 md:text-lg">
            Find your best fit before placing an order.
          </p>
          <div className="mt-6 flex justify-center">
            <img
              alt="Fits Apparel Size Chart"
              className="max-w-lg w-full rounded-lg object-contain border border-black/10"
              src="/sizechart.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
