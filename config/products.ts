export type Product = {
  slug: string;
  name: string;
  price: string;
  image: string;
  description: string;
  soldOut?: boolean;
};

export const products: Product[] = [
  {
    slug: "fa-tee-white",
    name: "FA TEE (WHITE)",
    price: "₱550.00",
    image: "/shirt2.png",
    description: "Clean white tee with a minimal Fits Apparel look built for everyday wear.",
  },
  {
    slug: "fa-pride-tee",
    name: 'FA "PRIDE." TEE',
    price: "₱550.00",
    image: "/shirt1.png",
    description: "A statement tee with bold typography and a graphic-forward streetwear feel.",
  },
  {
    slug: "fa-tee-black",
    name: "FA TEE (BLACK)",
    price: "₱550.00",
    image: "/shirt3.png",
    description: "A black essential shirt with a sharp Fits Apparel mark for a clean finish.",
  },
  {
    slug: "fa-summer-tee",
    name: 'FA "SUMMER" TEE',
    price: "₱380.00",
    image: "/shirt4.png",
    description: "Limited release graphic tee from Fits Apparel.",
    soldOut: true,
  },
  {
    slug: "fa-area51-tee",
    name: 'FA "AREA 51" TEE',
    price: "₱380.00",
    image: "/shirt5.png",
    description: "Limited release graphic tee from Fits Apparel.",
    soldOut: true,
  },
];

export const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL"];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
