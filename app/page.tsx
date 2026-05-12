"use client";

import NextLink from "next/link";

import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <>
      <section
        className="relative left-1/2 w-screen -translate-x-1/2 -mt-20 min-h-[72vh] bg-cover bg-center bg-no-repeat md:-mt-24 md:min-h-screen flex items-center justify-center"
        style={{ 
          backgroundImage: 'url("/fits-apparel-bg.jpg")',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide">Fits Apparel</h1>
          <p className="mt-4 text-lg md:text-xl opacity-95">Style With Attitude.</p>
          <NextLink
            href="/shop"
            className="mt-8 inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-colors duration-200"
          >
            Shop Now
          </NextLink>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm md:p-8">
          <h2 className="text-3xl font-bold text-black md:text-4xl">
            Fits Apparel Tees
          </h2>
          <p className="mt-2 text-sm text-black/70 md:text-base">
            Premium quality t-shirts crafted for the perfect fit.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

          <div className="mt-12 rounded-xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="text-3xl font-bold text-black md:text-4xl">Shirt Size Guide</h2>
            <p className="mt-2 text-sm text-black/70 md:text-base">
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
    </>
  );
}
