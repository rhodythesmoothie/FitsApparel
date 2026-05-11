import Image from "next/image";

type BlogCardProps = {
  src: string;
  alt: string;
  priority?: boolean;
  heightClass: string;
};

function BlogCard({ src, alt, priority = false, heightClass }: BlogCardProps) {
  return (
    <article className="border-[4px] border-black bg-black p-4">
      <div className={`relative w-full overflow-hidden ${heightClass}`}>
        <Image
          fill
          priority={priority}
          src={src}
          alt={alt}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </article>
  );
}

export default function BlogPage() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="w-full bg-black py-12 md:py-16 flex items-center justify-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-white text-center px-4 uppercase">Style With Attitude.</h1>
      </div>
      <div className="bg-white py-5 md:py-8">
        <div className="grid w-full grid-cols-1 gap-1.5 px-1.5 md:grid-cols-[1.4fr_1fr] md:px-2">
        <div className="grid gap-1.5">
          <BlogCard
            src="/blogimage1.jpg"
            alt="Fits Apparel event photo"
            priority
            heightClass="h-[420px] md:h-[520px]"
          />
          <BlogCard
            src="/blogimage2.jpg"
            alt="Lifestyle photo in black Fits Apparel shirt"
            heightClass="h-[340px] md:h-[470px]"
          />
        </div>

        <div className="grid gap-1.5">
          <BlogCard
            src="/blogimage3.jpg"
            alt="Fits Apparel shirt by the shore"
            heightClass="h-[250px] md:h-[320px]"
          />
          <BlogCard
            src="/blogimage4.jpg"
            alt="White Fits Apparel shirt on the sand"
            heightClass="h-[250px] md:h-[300px]"
          />
          <BlogCard
            src="/blogimage5.jpg"
            alt="Mirror selfie wearing Fits Apparel shirt"
            heightClass="h-[250px] md:h-[280px]"
          />
        </div>
      </div>
    </div>
    </div>
  );
}
