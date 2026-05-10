// "use client";
// import Marquee from "react-fast-marquee";
// import Image, { type StaticImageData } from "next/image";
// import img1 from "../../assets/b&e.jpg";
// import img2 from "../../assets/eae&e.jpg";
// import img3 from "../../assets/p&e.jpg";
// import img4 from "../../assets/p&e2.jpg";

// const products = [
//   { id: 1, name: "Wireless Headphones", image: img1, link: "/" },
//   { id: 2, name: "Smart Watch", image: img2, link: "/" },
//   { id: 3, name: "Bestseller Book", image: img4, link: "/" },
//   { id: 4, name: "Gaming Mouse", image: img3, link: "/" },
//   { id: 5, name: "Superstore Gadget", image: img4, link: "/" },
// ];

// type Product = {
//   link: string;
//   image: StaticImageData;
//   name: string;
//   id: number;
// };

// function ProductCard({ marqitem }: { marqitem: Product }) {
//   return (
//     <a
//       href={marqitem.link}
//       className="group mx-6 flex flex-col items-center"
//     >
//       <div className="relative w-32 h-32 overflow-hidden rounded-2xl shadow-md border border-gray-200 group-hover:scale-105 transition">
//         <Image
//           src={marqitem.image}
//           alt={marqitem.name}
//           fill
//           className="object-cover"
//         />
//       </div>
//       <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-green-600 transition">
//         {marqitem.name}
//       </p>
//     </a>
//   );
// }

// export default function Marque() {
//   return (
//     <div className="py-8 w-96 md:w-full lg:w-full space-y-6 shadow-inner">
//       {/* Top row → scroll left */}
//       <Marquee gradient={true
//       } speed={50} pauseOnHover direction="left">
//         {products.map((marqitems) => (
//           <ProductCard key={marqitems.id} marqitem={marqitems} />
//         ))}
//       </Marquee>

//       {/* Bottom row → scroll right */}
//       <Marquee gradient={false} speed={50} pauseOnHover direction="right">
//         {products.map((marqiteme) => (
//           <ProductCard key={marqiteme.id} marqitem={marqiteme} />
//         ))}
//       </Marquee>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import Image, { type StaticImageData } from "next/image";
import img1 from "../../assets/b&e.jpg";
import img2 from "../../assets/eae&e.jpg";
import img3 from "../../assets/p&e.jpg";
import img4 from "../../assets/p&e2.jpg";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

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
    <a href={marqitem.link} className="group mx-6 flex flex-col items-center">
      <div className="relative w-32 h-32 overflow-hidden rounded-2xl shadow-md border border-gray-200 group-hover:scale-105 transition">
        <Image
          src={marqitem.image}
          alt={marqitem.name}
          fill
          className="object-cover"
        />
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition">
        {marqitem.name}
      </p>
    </a>
  );
}

export default function Marque() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const slideProducts =
    filteredProducts.length > 0
      ? [
          ...filteredProducts.slice(activeIndex),
          ...filteredProducts.slice(0, activeIndex),
        ]
      : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

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

  return (
    <div className="py-8 w-96 md:w-full lg:w-full space-y-6 shadow-inner">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Category..."
          className="w-72 px-4 rounded-md border border-gray-300 outline-none focus:border-purple-600"
        />

        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            className=" rounded-md bg-[#7149f5] bg-gray-200 hover:bg-gray-300 transition"
          >
           <ArrowBigLeft />
          </button>

          <button
            onClick={handleNext}
            className="rounded-md bg-[#7149f5] text-white hover:bg-purple-300 transition"
          >
            <ArrowBigRight />
          </button>
        </div>
      </div>

      {slideProducts.length > 0 ? (
        <>
          {/* Top row → scroll left */}
          <Marquee gradient={true} speed={50} pauseOnHover direction="left">
            {slideProducts.map((marqitems) => (
              <ProductCard key={marqitems.id} marqitem={marqitems} />
            ))}
          </Marquee>

          {/* Bottom row → scroll right */}
          <Marquee gradient={false} speed={50} pauseOnHover direction="right">
            {slideProducts.map((marqiteme) => (
              <ProductCard key={marqiteme.id} marqitem={marqiteme} />
            ))}
          </Marquee>
        </>
      ) : (
        <p className="text-center text-sm font-medium text-gray-500">
          No products found
        </p>
      )}
    </div>
  );
}
