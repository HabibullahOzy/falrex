"use client";
import Marquee from "react-fast-marquee";
import Image, { type StaticImageData } from "next/image";
import img1 from "../../assets/b&e.jpg";
import img2 from "../../assets/eae&e.jpg";
import img3 from "../../assets/p&e.jpg";
import img4 from "../../assets/p&e2.jpg";

const products = [
  { id: 1, name: "Wireless Headphones", image: img1, link: "/" },
  { id: 2, name: "Smart Watch", image: img2, link: "/" },
  { id: 3, name: "Bestseller Book", image: img4, link: "/" },
  { id: 4, name: "Gaming Mouse", image: img3, link: "/" },
  { id: 5, name: "Superstore Gadget", image: img4, link: "/" },
];

type Product = {
  link: string;
  image: StaticImageData;
  name: string;
  id: number;
};

function ProductCard({ marqitem }: { marqitem: Product }) {
  return (
    <a
      href={marqitem.link}
      className="group mx-6 flex flex-col items-center"
    >
      <div className="relative w-32 h-32 overflow-hidden rounded-2xl shadow-md border border-gray-200 group-hover:scale-105 transition">
        <Image
          src={marqitem.image}
          alt={marqitem.name}
          fill
          className="object-cover"
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-green-600 transition">
        {marqitem.name}
      </p>
    </a>
  );
}

export default function Marque() {
  return (
    <div className="py-8 w-96 md:w-full lg:w-full space-y-6 shadow-inner">
      {/* Top row → scroll left */}
      <Marquee gradient={true
      } speed={50} pauseOnHover direction="left">
        {products.map((marqitems) => (
          <ProductCard key={marqitems.id} marqitem={marqitems} />
        ))}
      </Marquee>

      {/* Bottom row → scroll right */}
      <Marquee gradient={false} speed={50} pauseOnHover direction="right">
        {products.map((marqiteme) => (
          <ProductCard key={marqiteme.id} marqitem={marqiteme} />
        ))}
      </Marquee>
    </div>
  );
}
