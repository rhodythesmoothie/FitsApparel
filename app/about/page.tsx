export default function AboutPage() {
  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
            About Fits Apparel
          </p>
          <h1 className="mt-4 text-5xl font-bold text-black md:text-6xl">
            About Us
          </h1>
          <div className="mt-6 h-1 w-16 bg-black" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center mb-16">
          {/* Text Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-3">Our Story</h2>
              <p className="text-base leading-8 text-black/75 md:text-lg">
                Fits Apparel is a local clothing brand established in 2020, focused
                on creating high-quality, well-fitting garments that challenge the
                shortcomings of typical basics in the fashion market.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-black mb-3">Our Style</h2>
              <p className="text-base leading-8 text-black/75 md:text-lg">
                The brand began with a deep focus on perfecting fit and quality, especially through
                our flagship T-shirt offerings. We believe that great basics should fit perfectly,
                feel comfortable, and look timeless.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-black mb-3">Our Goal</h2>
              <p className="text-base leading-8 text-black/75 md:text-lg">
                We aim to expand into a broader apparel line while keeping the same design ethos:
                style with attitude, quality you can trust, and a fit that makes you feel confident.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              alt="Fits Apparel Product"
              className="w-full max-w-md rounded-xl object-cover shadow-lg"
              src="/fa-logo.png"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 bg-white/95 rounded-2xl p-8 md:p-12 border border-black/10">
          <div className="text-center md:text-left space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-black">2020</p>
            <p className="text-base md:text-lg text-black/70 font-medium">Year Established</p>
            <p className="text-sm text-black/50">Building quality from the start</p>
          </div>
          <div className="text-center md:text-left space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-black">01</p>
            <p className="text-base md:text-lg text-black/70 font-medium">Core Focus</p>
            <p className="text-sm text-black/50">Fit-first essentials</p>
          </div>
          <div className="text-center md:text-left space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-black">100%</p>
            <p className="text-base md:text-lg text-black/70 font-medium">Local Pride</p>
            <p className="text-sm text-black/50">Cebu-based brand identity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
