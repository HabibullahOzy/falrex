"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { Search, X, ChevronLeft, ChevronRight, Package, Tag } from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface Category {
  _id: string;
  name: string;
  slug: string;
  image: { url: string; public_id: string };
  subCategories: { name: string; slug: string }[];
  order: number;
}

// ── Config ─────────────────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  "Consumer Electronics": "🔌",
  "Fashion & Apparel": "👗",
  "Beauty & Personal Care": "💄",
  "Jewellery & Accessories": "💍",
  "Home & Kitchen": "🏠",
  "Sports & Outdoors": "⚽",
  "Industrial & Machinery": "⚙️",
  "Health & Medical": "🏥",
  "Toys & Hobbies": "🎮",
  "Automotive": "🚗",
  "Food & Beverage": "🍎",
};

const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  "Consumer Electronics": { from: "#7c3aed", to: "#4f46e5" },
  "Fashion & Apparel": { from: "#db2777", to: "#ec4899" },
  "Beauty & Personal Care": { from: "#f59e0b", to: "#f97316" },
  "Jewellery & Accessories": { from: "#d97706", to: "#b45309" },
  "Home & Kitchen": { from: "#059669", to: "#047857" },
  "Sports & Outdoors": { from: "#2563eb", to: "#1d4ed8" },
  "Industrial & Machinery": { from: "#475569", to: "#334155" },
  "Health & Medical": { from: "#0891b2", to: "#0e7490" },
  "Toys & Hobbies": { from: "#7c3aed", to: "#a855f7" },
  "Automotive": { from: "#dc2626", to: "#b91c1c" },
  "Food & Beverage": { from: "#16a34a", to: "#15803d" },
};

function getColor(name: string) {
  return CATEGORY_COLORS[name] || { from: "#7149f5", to: "#4f46e5" };
}

// ── Single Category Card ───────────────────────────────────────────────────
// Clicking anywhere on the card redirects to /category/[slug]
function CategoryCard({ category }: { category: Category }) {
  const color = getColor(category.name);
  const emoji = CATEGORY_EMOJI[category.name] || "📦";
  // console.log(category.name)
  const hasImage = !!category.image?.url;
  // const slug = category?.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  // const slugify = () =>
  // category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and").replace(/[^a-z0-9-]/g, "");


  return (
    <Link
      href={`/component/category/${category.slug}`}
      className="mx-2 sm:mx-3 flex flex-col items-center group cursor-pointer focus:outline-none"
      title={category.name}
    >
      {/* Image / gradient tile */}
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md
                   group-hover:scale-105 group-hover:shadow-xl
                   transition-all duration-300"
        style={{
          background: hasImage
            ? undefined
            : `linear-gradient(135deg, ${color.from}, ${color.to})`,
        }}
      >
        {hasImage ? (
          <Image
          width={10}
          height={10}
            src={category?.image?.url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </div>
        )}

        {/* Dark hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15
                        transition-colors duration-300 rounded-2xl" />

        {/* Bottom gradient bar on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0
                     group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
          }}
        />
      </div>

      {/* Name */}
      <p className="mt-2 text-[11px] sm:text-xs font-semibold text-center
                   leading-tight max-w-[80px] sm:max-w-[96px]
                   text-gray-700 group-hover:text-purple-700
                   transition-colors duration-200 line-clamp-2">
        {category.name}
      </p>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="mx-2 sm:mx-3 flex flex-col items-center animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200" />
      <div className="mt-2 h-3 w-16 bg-gray-200 rounded-full" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CategoryMarquee() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/category`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setCategories(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Filter by search ───────────────────────────────────────────────────────
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subCategories?.some((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Reset rotation when search changes
  useEffect(() => { setStartIndex(0); }, [search]);

  // Rotate for prev/next
  const rotated = [
    ...filtered.slice(startIndex),
    ...filtered.slice(0, startIndex),
  ];

  // Top row = full rotated list
  // Bottom row = same list but offset by half (so different items appear first)
  const half = Math.ceil(rotated.length / 2);
  const topRow = rotated;
  const bottomRow = [...rotated.slice(half), ...rotated.slice(0, half)];

  const handlePrev = () => {
    if (!filtered.length) return;
    setStartIndex((i) => (i === 0 ? filtered.length - 1 : i - 1));
  };

  const handleNext = () => {
    if (!filtered.length) return;
    setStartIndex((i) => (i === filtered.length - 1 ? 0 : i + 1));
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-8 w-full space-y-4 overflow-hidden">
        <div className="flex justify-between items-center px-4 md:px-6">
          <div className="w-36 h-7 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="w-40 h-9 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 px-4 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="flex gap-3 px-4 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-gray-400">
        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Failed to load categories</p>
        <button onClick={fetchCategories}
          className="mt-2 text-xs text-purple-600 hover:underline font-medium">
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="py-8 w-full overflow-hidden">

      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 mb-5">

        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Browse Categories</h2>
            <p className="text-xs text-gray-400">{categories.length} categories available</p>
          </div>
        </div>

        {/* Search + nav */}
        <div className="flex items-center gap-2 w-full sm:w-auto">

          {/* Search input */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full sm:w-52 pl-9 pr-8 py-2 text-sm border border-gray-200
                         rounded-xl outline-none focus:ring-2 focus:ring-purple-200
                         focus:border-purple-300 transition"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Prev */}
          <button onClick={handlePrev} disabled={!filtered.length}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-white border border-gray-200 text-gray-600
                       hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600
                       disabled:opacity-40 transition shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next */}
          <button onClick={handleNext} disabled={!filtered.length}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-purple-600 text-white hover:bg-purple-700
                       disabled:opacity-40 transition shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Empty search result ── */}
      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No categories found for "{search}"</p>
          <button onClick={() => setSearch("")}
            className="mt-2 text-xs text-purple-600 hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* ── Marquee rows ── */}
      {filtered.length > 0 && (
        <div className="space-y-4">

          {/* Row 1 — scrolls LEFT */}
          <Marquee
            gradient
            gradientColor="white"
            gradientWidth={60}
            speed={38}
            pauseOnHover
            direction="left"
          >
            {topRow.map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </Marquee>

          {/* Row 2 — scrolls RIGHT, offset start */}
          <Marquee
            gradient
            gradientColor="white"
            gradientWidth={60}
            speed={30}
            pauseOnHover
            direction="right"
          >
            {bottomRow.map((cat, i) => (
              <CategoryCard key={`${cat._id}-r${i}`} category={cat} />
            ))}
          </Marquee>
        </div>
      )}

      {/* ── View all link ── */}
      {/* {categories.length > 0 && (
        <div className="text-center mt-6">
          <Link href="/component/category"
            className="inline-flex items-center gap-2 text-sm font-semibold
                       text-purple-600 hover:text-purple-700
                       bg-purple-50 hover:bg-purple-100
                       px-5 py-2.5 rounded-full transition">
            <Tag className="w-4 h-4" />
            View All {categories.length} Categories
          </Link>
        </div>
      )} */}
    </section>
  );
}