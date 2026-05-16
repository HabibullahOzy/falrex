"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Package, Tag, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORY_EMOJI: Record<string, string> = {
  "Consumer Electronics":    "🔌",
  "Fashion & Apparel":       "👗",
  "Beauty & Personal Care":  "💄",
  "Jewellery & Accessories": "💍",
  "Home & Kitchen":          "🏠",
  "Sports & Outdoors":       "⚽",
  "Industrial & Machinery":  "⚙️",
  "Health & Medical":        "🏥",
  "Toys & Hobbies":          "🎮",
  "Automotive":              "🚗",
  "Food & Beverage":         "🍎",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Consumer Electronics":    "from-violet-500 to-indigo-600",
  "Fashion & Apparel":       "from-pink-500 to-rose-600",
  "Beauty & Personal Care":  "from-amber-400 to-orange-500",
  "Jewellery & Accessories": "from-yellow-500 to-amber-600",
  "Home & Kitchen":          "from-emerald-500 to-teal-600",
  "Sports & Outdoors":       "from-blue-500 to-blue-700",
  "Industrial & Machinery":  "from-slate-500 to-slate-700",
  "Health & Medical":        "from-cyan-500 to-cyan-700",
  "Toys & Hobbies":          "from-purple-500 to-violet-600",
  "Automotive":              "from-red-500 to-red-700",
  "Food & Beverage":         "from-green-500 to-green-700",
};

interface Category {
  _id: string; name: string; slug: string; description: string;
  image: { url: string }; subCategories: { name: string; slug: string; subSubItems: { name: string }[] }[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/category/landing`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategories(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subCategories?.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <Tag className="w-3.5 h-3.5" /> All Categories
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Browse Categories</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Explore {categories.length} product categories
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 bg-white shadow-sm transition"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-28 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No categories found</p>
            {search && <button onClick={() => setSearch("")} className="mt-2 text-xs text-purple-600 hover:underline">Clear search</button>}
          </div>
        )}

        {/* Category grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((cat) => {
              const emoji     = CATEGORY_EMOJI[cat.name] || "📦";
              const gradient  = CATEGORY_COLORS[cat.name] || "from-purple-500 to-indigo-600";
              const isOpen    = expanded === cat._id;
              const hasImage  = !!cat.image?.url;

              return (
                <div key={cat._id} className="group">
                  <button
                    onClick={() => setExpanded(isOpen ? null : cat._id)}
                    className={`w-full bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition text-left ${
                      isOpen ? "border-purple-300 ring-2 ring-purple-200" : "border-gray-100"
                    }`}
                  >
                    {/* Image / gradient */}
                    <div className={`relative h-28 ${!hasImage ? `bg-gradient-to-br ${gradient}` : ""}`}>
                      {hasImage ? (
                        <img src={cat.image.url} alt={cat.name}
                          className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {emoji}
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOpen ? "bg-purple-600 text-white" : "bg-black/20 text-white"
                      }`}>
                        {cat.subCategories?.length || 0} subs
                      </div>
                    </div>

                    {/* Name */}
                    <div className="p-3">
                      <p className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <Link
                          href={`/products?category=${encodeURIComponent(cat.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-purple-600 font-semibold hover:underline"
                        >
                          Browse →
                        </Link>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded subcategories */}
                  {isOpen && (
                    <div className="mt-2 bg-white rounded-2xl border border-purple-100 p-3 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Subcategories
                      </p>
                      <div className="space-y-1">
                        {cat.subCategories?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={`/products?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition group/sub"
                          >
                            <span className="text-xs font-medium text-gray-700 group-hover/sub:text-purple-700">
                              {sub.name}
                            </span>
                            <span className="text-[9px] text-gray-400 group-hover/sub:text-purple-400">
                              {sub.subSubItems?.length || 0} items
                            </span>
                          </Link>
                        ))}
                        {(!cat.subCategories || cat.subCategories.length === 0) && (
                          <p className="text-xs text-gray-400 text-center py-2">No subcategories</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}




// // "use client";
// // import Marquee from "react-fast-marquee";
// // import Image, { type StaticImageData } from "next/image";
// // import img1 from "../../assets/b&e.jpg";
// // import img2 from "../../assets/eae&e.jpg";
// // import img3 from "../../assets/p&e.jpg";
// // import img4 from "../../assets/p&e2.jpg";

// // const products = [
// //   { id: 1, name: "Wireless Headphones", image: img1, link: "/" },
// //   { id: 2, name: "Smart Watch", image: img2, link: "/" },
// //   { id: 3, name: "Bestseller Book", image: img4, link: "/" },
// //   { id: 4, name: "Gaming Mouse", image: img3, link: "/" },
// //   { id: 5, name: "Superstore Gadget", image: img4, link: "/" },
// // ];

// // type Product = {
// //   link: string;
// //   image: StaticImageData;
// //   name: string;
// //   id: number;
// // };

// // function ProductCard({ marqitem }: { marqitem: Product }) {
// //   return (
// //     <a
// //       href={marqitem.link}
// //       className="group mx-6 flex flex-col items-center"
// //     >
// //       <div className="relative w-32 h-32 overflow-hidden rounded-2xl shadow-md border border-gray-200 group-hover:scale-105 transition">
// //         <Image
// //           src={marqitem.image}
// //           alt={marqitem.name}
// //           fill
// //           className="object-cover"
// //         />
// //       </div>
// //       <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-green-600 transition">
// //         {marqitem.name}
// //       </p>
// //     </a>
// //   );
// // }

// // export default function Marque() {
// //   return (
// //     <div className="py-8 w-96 md:w-full lg:w-full space-y-6 shadow-inner">
// //       {/* Top row → scroll left */}
// //       <Marquee gradient={true
// //       } speed={50} pauseOnHover direction="left">
// //         {products.map((marqitems) => (
// //           <ProductCard key={marqitems.id} marqitem={marqitems} />
// //         ))}
// //       </Marquee>

// //       {/* Bottom row → scroll right */}
// //       <Marquee gradient={false} speed={50} pauseOnHover direction="right">
// //         {products.map((marqiteme) => (
// //           <ProductCard key={marqiteme.id} marqitem={marqiteme} />
// //         ))}
// //       </Marquee>
// //     </div>
// //   );
// // }




// "use client";

// import { useEffect, useState } from "react";
// import Marquee from "react-fast-marquee";
// import Image, { type StaticImageData } from "next/image";
// import img1 from "../../assets/b&e.jpg";
// import img2 from "../../assets/eae&e.jpg";
// import img3 from "../../assets/p&e.jpg";
// import img4 from "../../assets/p&e2.jpg";
// import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

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
//     <a href={marqitem.link} className="group mx-6 flex flex-col items-center">
//       <div className="relative w-32 h-32 overflow-hidden rounded-2xl shadow-md border border-gray-200 group-hover:scale-105 transition">
//         <Image
//           src={marqitem.image}
//           alt={marqitem.name}
//           fill
//           className="object-cover"
//         />
//       </div>

//       <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition">
//         {marqitem.name}
//       </p>
//     </a>
//   );
// }

// export default function Marque() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [search, setSearch] = useState("");

//   const filteredProducts = products.filter((product) =>
//     product.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const slideProducts =
//     filteredProducts.length > 0
//       ? [
//           ...filteredProducts.slice(activeIndex),
//           ...filteredProducts.slice(0, activeIndex),
//         ]
//       : [];

//   useEffect(() => {
//     setActiveIndex(0);
//   }, [search]);

//   const handlePrev = () => {
//     if (filteredProducts.length === 0) return;

//     setActiveIndex((prev) =>
//       prev === 0 ? filteredProducts.length - 1 : prev - 1
//     );
//   };

//   const handleNext = () => {
//     if (filteredProducts.length === 0) return;

//     setActiveIndex((prev) =>
//       prev === filteredProducts.length - 1 ? 0 : prev + 1
//     );
//   };

//   return (
//     <div className="py-8 w-96 md:w-full lg:w-full space-y-6 shadow-inner">
//       <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search Category..."
//           className="w-72 px-4 rounded-md border border-gray-300 outline-none focus:border-purple-600"
//         />

//         <div className="flex gap-4">
//           <button
//             onClick={handlePrev}
//             className=" rounded-md bg-[#7149f5] bg-gray-200 hover:bg-gray-300 transition"
//           >
//            <ArrowBigLeft />
//           </button>

//           <button
//             onClick={handleNext}
//             className="rounded-md bg-[#7149f5] text-white hover:bg-purple-300 transition"
//           >
//             <ArrowBigRight />
//           </button>
//         </div>
//       </div>

//       {slideProducts.length > 0 ? (
//         <>
//           {/* Top row → scroll left */}
//           <Marquee gradient={true} speed={50} pauseOnHover direction="left">
//             {slideProducts.map((marqitems) => (
//               <ProductCard key={marqitems.id} marqitem={marqitems} />
//             ))}
//           </Marquee>

//           {/* Bottom row → scroll right */}
//           <Marquee gradient={false} speed={50} pauseOnHover direction="right">
//             {slideProducts.map((marqiteme) => (
//               <ProductCard key={marqiteme.id} marqitem={marqiteme} />
//             ))}
//           </Marquee>
//         </>
//       ) : (
//         <p className="text-center text-sm font-medium text-gray-500">
//           No products found
//         </p>
//       )}
//     </div>
//   );
// }
