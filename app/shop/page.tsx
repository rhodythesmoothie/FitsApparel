import NextLink from "next/link";

import { products } from "@/config/products";

export default function ShopPage() {

  return (
    <section className="pb-14 md:pb-20">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white/90 p-5 shadow-xl backdrop-blur-sm md:p-8">
        <h2 className="text-2xl font-semibold text-black md:text-3xl">
          Available Shirts
        </h2>
        <p className="mt-2 text-sm text-black/70 md:text-base">
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((shirt) => (
            <NextLink
              key={shirt.slug}
              className="block overflow-hidden rounded-xl border border-black/10 bg-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              href={`/shop/${shirt.slug}`}
            >
              <article className="relative">
                {shirt.soldOut ? (
                  <span className="absolute left-3 top-3 z-10 bg-[#e8e8e8] px-3 py-1 text-xs tracking-[0.3em] text-black/70">
                    SOLD OUT
                  </span>
                ) : null}
                <img
                  alt={shirt.name}
                  className="h-80 w-full object-cover"
                  src={shirt.image}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-medium leading-tight text-black">{shirt.name}</h3>
                    <p className="text-lg font-medium leading-none text-black">{shirt.price}</p>
                  </div>
                </div>
              </article>
            </NextLink>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-black/10 bg-white p-4 md:p-6" id="size-chart">
          <h2 className="text-2xl font-semibold text-black md:text-3xl">Size Chart</h2>
          <p className="mt-2 text-sm text-black/70 md:text-base">
            Find your best fit before placing an order.
          </p>
          <img
            alt="Fits Apparel Size Chart"
            className="mt-5 mx-auto w-full max-w-2xl rounded-lg object-contain"
            src="/sizechart.png"
          />
        </div>
      </div>
    </section>
  );
}
