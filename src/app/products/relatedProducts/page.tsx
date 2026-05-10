"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import img1 from "../../assets/b&e.jpg";
import img2 from "../../assets/eae&e.jpg";
import img3 from "../../assets/p&e.jpg";
import img4 from "../../assets/p&e2.jpg";

const products = [
  { id: 1, name: "Wireless Headphones", price: "$120", image: img1, link: "/" },
  { id: 2, name: "Smart Watch", price: "$90", image: img2, link: "/" },
  { id: 3, name: "Bestseller Book", price: "$35", image: img4, link: "/" },
  { id: 4, name: "Gaming Mouse", price: "$55", image: img3, link: "/" },
  { id: 5, name: "Superstore Gadget", price: "$75", image: img4, link: "/" },
];

type Product = {
  id: number;
  name: string;
  price: string;
  image: StaticImageData;
  link: string;
};

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.link}
      className="min-w-[220px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden rounded-md">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-gray-800">
        {product.name}
      </h3>

      <p className="mt-1 text-sm font-bold text-green-600">
        {product.price}
      </p>
    </a>
  );
}

export default function RelatedProducts() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleProducts = [
    ...filteredProducts.slice(activeIndex),
    ...filteredProducts.slice(0, activeIndex),
  ].slice(0, 4);

  const handlePrev = () => {
    if (filteredProducts.length === 0) return;

    setActiveIndex((prev) =>
      prev === 0 ? filteredProducts.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (filteredProducts.length === 0) return;

    setActiveIndex((prev) =>
      prev === filteredProducts.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    if (filteredProducts.length === 0) return;

    const slider = setInterval(() => {
      setActiveIndex((prev) =>
        prev === filteredProducts.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(slider);
  }, [filteredProducts.length]);

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-full px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Related Products
          </h2>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-600 sm:w-72"
          />
        </div>

        <div className="relative">
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
            aria-label="Previous product"
          >
            ←
          </button>

          <div className="mx-12 overflow-hidden">
            {visibleProducts.length > 0 ? (
              <div className="flex gap-5 transition-all duration-500">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm font-medium text-gray-500">
                No related products found
              </p>
            )}
          </div>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
            aria-label="Next product"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
