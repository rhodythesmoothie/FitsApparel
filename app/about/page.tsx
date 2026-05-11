export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl space-y-8 text-left">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
          Fits Apparel
        </p>

        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">
            About Us
          </h1>
          <div className="h-px w-16 bg-black/15" />
        </header>

        <p className="text-justify text-base leading-8 text-black/75 md:text-lg">
          Fits Apparel is a local clothing brand established in 2020, focused
          on creating high-quality, well-fitting garments that challenge the
          shortcomings of typical basics in the fashion market. The brand began
          with a deep focus on perfecting fit and quality, especially through
          its flagship T-shirt offerings, and aims to expand into a broader
          apparel line while keeping the same design ethos.
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-6 text-sm text-black/65">
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-black">
              2020
            </p>
            <p>Year established</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-black">
              01
            </p>
            <p>Focus: fit-first essentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
