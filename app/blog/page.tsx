import Image from "next/image";

type BlogCardProps = {
  src: string;
  alt: string;
  title: string;
  description: string;
  priority?: boolean;
  heightClass: string;
};

function BlogCard({ src, alt, title, description, priority = false, heightClass }: BlogCardProps) {
  return (
    <article className="group rounded-xl overflow-hidden bg-white border border-black/10 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className={`relative w-full overflow-hidden ${heightClass} bg-black`}>
        <Image
          fill
          priority={priority}
          src={src}
          alt={alt}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl font-semibold text-black">{title}</h3>
        <p className="mt-2 text-sm md:text-base text-black/70 line-clamp-2">{description}</p>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const blogCards = [
    {
      src: "/blogimage1.jpg",
      alt: "Fits Apparel event photo",
      title: "Event Collection",
      description: "Experience Fits Apparel at exclusive events.",
      priority: true,
      heightClass: "h-[280px] md:h-[350px]"
    },
    {
      src: "/blogimage2.jpg",
      alt: "Lifestyle photo in black Fits Apparel shirt",
      title: "Street Style",
      description: "How to style Fits Apparel for everyday wear.",
      priority: false,
      heightClass: "h-[280px] md:h-[350px]"
    },
    {
      src: "/blogimage3.jpg",
      alt: "Fits Apparel shirt by the shore",
      title: "Summer Vibes",
      description: "Perfect for beach days and summer adventures.",
      priority: false,
      heightClass: "h-[280px] md:h-[350px]"
    },
    {
      src: "/blogimage4.jpg",
      alt: "White Fits Apparel shirt on the sand",
      title: "Minimalist Aesthetic",
      description: "Clean lines, timeless design, maximum comfort.",
      priority: false,
      heightClass: "h-[280px] md:h-[350px]"
    },
    {
      src: "/blogimage5.jpg",
      alt: "Mirror selfie wearing Fits Apparel shirt",
      title: "Personal Style",
      description: "Express yourself with Fits Apparel basics.",
      priority: false,
      heightClass: "h-[280px] md:h-[350px]"
    }
  ];

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black">Blog</h1>
          <p className="mt-3 text-base md:text-lg text-black/70">Stories and inspiration from the Fits Apparel community</p>
        </div>
        
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogCards.map((card, idx) => (
            <BlogCard
              key={idx}
              src={card.src}
              alt={card.alt}
              title={card.title}
              description={card.description}
              priority={card.priority}
              heightClass={card.heightClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
