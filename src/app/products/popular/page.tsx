"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CartButtons from "../CartButtons";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
interface ProductImage {
  url: string;
  public_id: string;
}

interface ProductVariation {
  color: string;
  size: string;
  sku: string;
  stock: string;
}

interface ProductSpecGeneral {
  material?: string;
  weight?: string;
  color?: string;
  [key: string]: string | undefined;
}

interface Product {
  _id: string;
  nameEng: string;
  nameLocal: string;
  brand: string;
  modelNumber: string;
  sku: string;
  slug: string;
  category: string;
  subcategory: string;
  subSubcategory: string;
  price: number;
  currency: string;
  discount: number;
  moq: string;
  stock: number;
  sampleAvailable: string;
  supplierName: string;
  countryOfOrigin: string;
  supplierYears: string;
  certifications: string;
  shortDescription: string;
  description?: string;
  images: ProductImage[];
  specifications?: { general?: ProductSpecGeneral; [key: string]: unknown };
  variations?: ProductVariation[];
  tags: string[];
  createdAt: string;
}

interface PopularityResult {
  slug: string;
  popularityScore: number;
  trend: "rising" | "stable" | "declining";
  popularReason: string;
  globalRank: string;
}

type SortKey = "popularity" | "price_asc" | "price_desc" | "discount" | "stock";

/* ─────────────────────────────────────────────────────────────────
   CLAUDE POPULARITY API
───────────────────────────────────────────────────────────────── */
async function fetchPopularityScores(products: Product[]): Promise<Record<string, PopularityResult>> {
  if (!products.length) return {};

  const productList = products
    .map((p) => `slug:${p.slug} | ${p.nameEng} | Brand:${p.brand} | Category:${p.subSubcategory} | Tags:${p.tags.join(",")}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a global e-commerce market analyst with expertise in international product trends. For each product, assess its international website/search popularity score (0–100) based on: brand recognition globally, product category demand, search volume trends, and wholesale market relevance.

Return ONLY a valid JSON array. No markdown fences, no explanation. Schema per item:
{"slug":"","popularityScore":0,"trend":"rising|stable|declining","popularReason":"6 words max","globalRank":"Top X%"}

Products:
${productList}`,
        },
      ],
    }),
  });

  const data = await res.json();
  const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "[]";

  try {
    const parsed: PopularityResult[] = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return Object.fromEntries(parsed.map((r) => [r.slug, r]));
  } catch {
    return {};
  }
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const getOfferPrice = (price: number, discount: number): number | null =>
  discount > 0 ? Math.round(price * (1 - discount / 100)) : null;

const getOriginFlag = (origin: string): string => {
  if (origin.includes("Bangladesh")) return "🇧🇩";
  if (origin.includes("China")) return "🇨🇳";
  if (origin.includes("Korea")) return "🇰🇷";
  if (origin.includes("Japan")) return "🇯🇵";
  if (origin.includes("USA") || origin.includes("America")) return "🇺🇸";
  if (origin.includes("India")) return "🇮🇳";
  return "🌐";
};

const popColor = (score: number): string => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#94a3b8";
};

const trendMeta = (trend: string) => {
  if (trend === "rising") return { icon: "↑", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
  if (trend === "declining") return { icon: "↓", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
  return { icon: "→", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
};

/* ─────────────────────────────────────────────────────────────────
   PRODUCT IMAGE (with elegant fallback)
───────────────────────────────────────────────────────────────── */
function ProductImg({ src, alt, brand }: { src?: string; alt: string; brand: string }) {
  const [err, setErr] = useState(false);
  const letter = brand.charAt(0).toUpperCase();
  const hues: Record<string, string> = {
    A: "215", S: "220", X: "25", G: "142", J: "22",
    default: "258",
  };
  const hue = hues[letter] ?? hues.default;
  const isDemo = !src || src.includes("/demo/");

  if (err || isDemo) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `hsl(${hue},60%,96%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: `hsl(${hue},55%,55%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "900",
            color: "#fff",
            fontFamily: "'DM Serif Display', Georgia, serif",
            letterSpacing: "-1px",
          }}
        >
          {letter}
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: `hsl(${hue},55%,45%)`,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {brand}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-108"
      onError={() => setErr(true)}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white">
      <div className="h-52 bg-neutral-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-neutral-100 rounded-full animate-pulse w-2/3" />
        <div className="h-3 bg-neutral-100 rounded-full animate-pulse" />
        <div className="h-3 bg-neutral-100 rounded-full animate-pulse w-4/5" />
        <div className="h-2 bg-neutral-100 rounded-full animate-pulse w-1/2 mt-3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────────────────── */
function ProductCard({
  product,
  idx,
  pop,
  popLoading,
}: {
  product: Product;
  idx: number;
  pop?: PopularityResult;
  popLoading: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [wished, setWished] = useState(false);
  const [carted, setCarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const offer = getOfferPrice(product.price, product.discount);
  const flag = getOriginFlag(product.countryOfOrigin);
  const trend = pop ? trendMeta(pop.trend) : null;
  const pc = pop ? popColor(pop.popularityScore) : "#94a3b8";
  const scoreW = pop ? `${pop.popularityScore}%` : "0%";

  const onCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarted(true);
    setTimeout(() => setCarted(false), 1800);
  };

  return (
    <div
      ref={ref}
      className="group relative cursor-pointer"
      style={{
        height: "clamp(380px, 46vw, 450px)",
        perspective: "1400px",
        animationDelay: `${idx * 70}ms`,
      }}
      onMouseEnter={() => !isMobile && setFlipped(true)}
      onMouseLeave={() => !isMobile && setFlipped(false)}
      onClick={() => isMobile && setFlipped((v) => !v)}
    >
      {/* 3D wrapper */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.75s cubic-bezier(0.22,1,0.36,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl bg-white border border-neutral-100 overflow-hidden shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image */}
          <div className="relative overflow-hidden flex-shrink-0" style={{ height: "57%" }}>
            <ProductImg src={product.images?.[0]?.url} alt={product.nameEng} brand={product.brand} />

            {/* Gradient overlay at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-10"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.08), transparent)" }}
            />

            {/* Discount badge */}
            {product.discount > 0 && (
              <div
                className="absolute top-2.5 left-2.5 z-10 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ background: "#ef4444", fontFamily: "'DM Serif Display', serif", letterSpacing: "0.02em" }}
              >
                -{product.discount}%
              </div>
            )}

            {/* Popularity pill */}
            <div className="absolute top-2.5 right-9 z-10 flex items-center gap-1">
              {popLoading && !pop ? (
                <div
                  className="rounded-full px-2 py-0.5 flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#818cf8", animation: "pulseDot 1.2s ease-in-out infinite" }}
                  />
                  <span className="text-[9px] font-semibold" style={{ color: "#818cf8" }}>
                    Scoring…
                  </span>
                </div>
              ) : pop ? (
                <div
                  className="rounded-full px-2 py-0.5 flex items-center gap-1"
                  style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: `1px solid ${pc}33` }}
                >
                  <span className="text-[10px] font-black" style={{ color: pc }}>
                    {pop.popularityScore}
                  </span>
                  <span className="text-[8px] font-semibold" style={{ color: "#94a3b8" }}>
                    /100
                  </span>
                </div>
              ) : null}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.stopPropagation(); setWished((v) => !v); }}
              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={wished ? "#e11d48" : "none"} stroke={wished ? "#e11d48" : "#9ca3af"} strokeWidth="2.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Trend badge bottom-left */}
            {trend && pop && (
              <div
                className="absolute bottom-2 left-2 z-10 rounded-full flex items-center gap-1 px-1.5 py-0.5"
                style={{ background: trend.bg, backdropFilter: "blur(4px)" }}
              >
                <span className="text-[10px] font-bold" style={{ color: trend.color }}>{trend.icon}</span>
                <span className="text-[8px] font-semibold capitalize" style={{ color: trend.color }}>{pop.trend}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 justify-between p-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#c4b5fd" }}>
                {product.brand} · {product.subSubcategory}
              </p>
              <h3 className="text-[12.5px] font-semibold leading-snug text-neutral-800 line-clamp-2">
                {product.nameEng}
              </h3>

              {/* Score bar */}
              {pop && (
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: scoreW, background: pc }}
                    />
                  </div>
                  <p className="text-[9px] mt-0.5 italic" style={{ color: "#94a3b8" }}>{pop.popularReason}</p>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between mt-2">
              <div>
                {offer != null ? (
                  <>
                    <p className="text-[15px] font-black leading-none" style={{ color: "#ef4444", fontFamily: "'DM Serif Display', serif" }}>
                      ৳{offer.toLocaleString()}
                    </p>
                    <p className="text-[10px] line-through mt-0.5" style={{ color: "#cbd5e1" }}>
                      ৳{product.price.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-[15px] font-black leading-none text-neutral-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    ৳{product.price.toLocaleString()}
                  </p>
                )}
              </div>

              <button
                onClick={onCart}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95"
                style={{ background: carted ? "#22c55e" : "#6d28d9" }}
              >
                {carted ? "✓ Added" : "+ Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col p-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          }}
        >
          {/* Fine grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Supplier row */}
          <div className="flex items-center gap-2 mb-3 relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {flag}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white leading-none truncate">{product.supplierName}</p>
              <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {product.supplierYears} yrs · {product.certifications} · ✓ Verified
              </p>
            </div>

            {pop && (
              <div
                className="ml-auto flex-shrink-0 rounded-xl px-2.5 py-1.5 text-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-lg font-black text-white leading-none" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {pop.popularityScore}
                </p>
                <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Score
                </p>
              </div>
            )}
          </div>

          <h3 className="text-[13px] font-bold text-white leading-snug mb-1.5 line-clamp-2">
            {product.nameEng}
          </h3>

          <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
            {product.shortDescription}
          </p>

          {/* Popularity insight block */}
          {pop && (
            <div
              className="rounded-xl p-2.5 mb-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Global Popularity
                </span>
                <span
                  className="text-[9px] font-bold rounded-full px-2 py-0.5"
                  style={{ color: trendMeta(pop.trend).color, background: trendMeta(pop.trend).bg }}
                >
                  {trendMeta(pop.trend).icon} {pop.trend} · {pop.globalRank}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: scoreW, background: `linear-gradient(90deg, ${pc}, ${pc}aa)` }}
                />
              </div>
              <p className="text-[9px] mt-1 italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                {pop.popularReason}
              </p>
            </div>
          )}

          {/* Spec chips */}
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(product.specifications?.general ?? {})
              .slice(0, 4)
              .map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full text-[9px] font-semibold px-2 py-0.5"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                >
                  {v}
                </span>
              ))}
            <span
              className="rounded-full text-[9px] font-semibold px-2 py-0.5"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              MOQ {product.moq}
            </span>
          </div>

          {/* Price row */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div>
              {offer != null ? (
                <>
                  <p
                    className="text-base font-black text-white leading-none"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    ৳{offer.toLocaleString()}
                  </p>
                  <p className="text-[9px] line-through mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    ৳{product.price.toLocaleString()}
                  </p>
                </>
              ) : (
                <p
                  className="text-base font-black text-white leading-none"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  ৳{product.price.toLocaleString()}
                </p>
              )}
            </div>
            {product.discount > 0 && (
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="grid gap-1.5 mt-auto">
            <Link
              href={`/products/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center rounded-xl py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
            >
              View Details →
            </Link>
            <div className="">

              <CartButtons
              productId={product._id}
              quantity={1}
              />
              {/* <Link
                href={`/products/${product._id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-opacity hover:opacity-90"
                style={{ background: "#06b6d4", color: "#083344" }}
              >
                Buy Now
              </Link>
              <button
                onClick={onCart}
                className="rounded-xl py-1.5 text-[10px] font-bold text-white transition-colors"
                style={{ background: carted ? "#22c55e" : "#19827d" }}
              >
                {carted ? "✓ Added!" : "Add to Cart"}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const PAGE_LIMIT = 12;

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [popularityData, setPopularityData] = useState<Record<string, PopularityResult>>({});
  const [popLoading, setPopLoading] = useState(false);

  const [sortBy, setSortBy] = useState<SortKey>("popularity");
  const [activeCategory, setActiveCategory] = useState("All");

  /* Fetch products from your API */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product?page=${page}&limit=${PAGE_LIMIT}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load products");

        setProducts(json.data);
        setTotal(json.total ?? json.data.length);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  /* Fetch popularity scores whenever products change */
  const runPopularityCheck = useCallback(async (list: Product[]) => {
    if (!list.length) return;
    setPopLoading(true);
    try {
      const scores = await fetchPopularityScores(list);
      setPopularityData((prev) => ({ ...prev, ...scores }));
    } catch {
      // Popularity is non-critical — fail silently
    } finally {
      setPopLoading(false);
    }
  }, []);

  useEffect(() => {
    if (products.length) runPopularityCheck(products);
  }, [products, runPopularityCheck]);

  /* Derived data */
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.subSubcategory)))];

  const displayed = [...products]
    .filter((p) => activeCategory === "All" || p.subSubcategory === activeCategory)
    .sort((a, b) => {
      if (sortBy === "popularity") {
        return (popularityData[b.slug]?.popularityScore ?? 0) - (popularityData[a.slug]?.popularityScore ?? 0);
      }
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "discount") return b.discount - a.discount;
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });

  const avgScore =
    Object.values(popularityData).length
      ? Math.round(
          Object.values(popularityData).reduce((s, d) => s + d.popularityScore, 0) /
            Object.values(popularityData).length
        )
      : null;

  const topEntry = Object.entries(popularityData).sort((a, b) => b[1].popularityScore - a[1].popularityScore)[0];
  const topBrand = topEntry ? products.find((p) => p.slug === topEntry[0])?.brand ?? "—" : "—";
  const risingCount = Object.values(popularityData).filter((d) => d.trend === "rising").length;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.45}}
        .pop-card-anim{opacity:0;animation:fadeUp .5s ease forwards}
        .pop-font{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        .pop-select{appearance:none;background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:7px 30px 7px 12px;font-size:12px;font-weight:600;color:#374151;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;font-family:'Plus Jakarta Sans',sans-serif}
        .pop-select:focus{outline:none;border-color:#7c3aed}
        .cat-chip{padding:5px 13px;border-radius:99px;font-size:11px;font-weight:700;border:1.5px solid #e5e7eb;background:#fff;color:#9ca3af;cursor:pointer;transition:all .18s;white-space:nowrap;letter-spacing:.02em;font-family:'Plus Jakarta Sans',sans-serif}
        .cat-chip:hover{border-color:#a78bfa;color:#7c3aed}
        .cat-chip.on{background:#7c3aed;color:#fff;border-color:#7c3aed}
        .page-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;font-size:13px;font-weight:700;color:#374151;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
        .page-btn:hover:not(:disabled){border-color:#7c3aed;color:#7c3aed}
        .page-btn:disabled{opacity:.35;cursor:not-allowed}
        .page-btn.active-pg{background:#7c3aed;border-color:#7c3aed;color:#fff}
        @media(max-width:639px){.pop-grid{grid-template-columns:repeat(2,1fr)!important}.pop-stats{grid-template-columns:repeat(2,1fr)!important}}
        @media(min-width:640px) and (max-width:1023px){.pop-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(min-width:1024px) and (max-width:1279px){.pop-grid{grid-template-columns:repeat(4,1fr)!important}}
        @media(min-width:1280px){.pop-grid{grid-template-columns:repeat(6,1fr)!important}}
      `}</style>

      <section className="pop-font w-full py-12 px-4 ">
        <div >

          {/* ── Header ── */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div
                className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: "linear-gradient(90deg,#ede9fe,#fce7f3)", color: "#7c3aed" }}
              >
                🌐 AI Global Rank
              </div>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-neutral-900 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}
            >
              Popular Products
            </h2>
            <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
              Hover cards to explore · Popularity powered by AI analysis
            </p>
          </div>

          {/* ── Stats Bar ── */}
          {!popLoading && avgScore !== null && (
            <div className="pop-stats grid grid-cols-3 gap-3 mb-7">
              {[
                { label: "Avg AI Score", value: `${avgScore}/100`, icon: "◆", color: "#7c3aed" },
                { label: "Top Brand", value: topBrand, icon: "★", color: "#f59e0b" },
                { label: "Rising Trend", value: `${risingCount} items`, icon: "↑", color: "#22c55e" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl flex items-center gap-3 px-4 py-3 border"
                  style={{ background: "#fff", borderColor: "#f0f0f0" }}
                >
                  <span className="text-xl" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#d1d5db" }}>{s.label}</p>
                    <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Controls ── */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-chip ${activeCategory === c ? "on" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {popLoading && (
                <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "#a78bfa" }}>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: "#a78bfa", animation: "pulseDot 1.2s ease-in-out infinite" }}
                  />
                  AI scoring…
                </span>
              )}
              <select className="pop-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
                <option value="popularity">Sort: Popularity</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="discount">Highest Discount</option>
                <option value="stock">In Stock First</option>
              </select>
            </div>
          </div>

          {/* ── Error ── */}
          {error && !loading && (
            <div
              className="rounded-2xl p-6 text-center mb-6 border"
              style={{ background: "#fef2f2", borderColor: "#fecaca" }}
            >
              <p className="text-sm font-semibold text-red-600 mb-2">⚠ {error}</p>
              <button
                onClick={() => setPage((p) => p)}
                className="text-[12px] font-bold text-red-500 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Grid ── */}
          <div className="pop-grid grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            {loading
              ? Array.from({ length: PAGE_LIMIT }).map((_, i) => <Skeleton key={i} />)
              : displayed.map((product, i) => (
                  <div key={product._id} className="pop-card-anim" style={{ animationDelay: `${i * 65}ms` }}>
                    <ProductCard
                      product={product}
                      idx={i}
                      pop={popularityData[product.slug]}
                      popLoading={popLoading}
                    />
                  </div>
                ))}
          </div>

          {/* ── Empty state ── */}
          {!loading && !error && displayed.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold text-neutral-500">No products found</p>
            </div>
          )}

          {/* ── Pagination ── */}
          {/* {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`e${i}`} className="text-neutral-400 text-sm px-1">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`page-btn ${n === page ? "active-pg" : ""}`}
                      onClick={() => setPage(n as number)}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                className="page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>

              <span className="text-[12px] font-semibold ml-2" style={{ color: "#9ca3af" }}>
                {total} products
              </span>
            </div>
          )} */}
        </div>
      </section>
    </>
  );
}




// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";

// /* ─────────────────────────────────────────────────────────────────
//    TYPES
// ───────────────────────────────────────────────────────────────── */
// interface ProductImage {
//   url: string;
//   public_id: string;
// }

// interface ProductVariation {
//   color: string;
//   size: string;
//   sku: string;
//   stock: string;
// }

// interface ProductSpecGeneral {
//   material?: string;
//   weight?: string;
//   color?: string;
//   [key: string]: string | undefined;
// }

// interface Product {
//   _id: string;
//   nameEng: string;
//   nameLocal: string;
//   brand: string;
//   modelNumber: string;
//   sku: string;
//   slug: string;
//   category: string;
//   subcategory: string;
//   subSubcategory: string;
//   price: number;
//   currency: string;
//   discount: number;
//   moq: string;
//   stock: number;
//   sampleAvailable: string;
//   supplierName: string;
//   countryOfOrigin: string;
//   supplierYears: string;
//   certifications: string;
//   shortDescription: string;
//   description?: string;
//   images: ProductImage[];
//   specifications?: { general?: ProductSpecGeneral; [key: string]: unknown };
//   variations?: ProductVariation[];
//   tags: string[];
//   createdAt: string;
// }

// interface PopularityResult {
//   slug: string;
//   popularityScore: number;
//   trend: "rising" | "stable" | "declining";
//   popularReason: string;
//   globalRank: string;
// }

// type SortKey = "popularity" | "price_asc" | "price_desc" | "discount" | "stock";

// /* ─────────────────────────────────────────────────────────────────
//    CLAUDE POPULARITY API
// ───────────────────────────────────────────────────────────────── */
// async function fetchPopularityScores(products: Product[]): Promise<Record<string, PopularityResult>> {
//   if (!products.length) return {};

//   const productList = products
//     .map((p) => `slug:${p.slug} | ${p.nameEng} | Brand:${p.brand} | Category:${p.subSubcategory} | Tags:${p.tags.join(",")}`)
//     .join("\n");

//   const res = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "user",
//           content: `You are a global e-commerce market analyst with expertise in international product trends. For each product, assess its international website/search popularity score (0–100) based on: brand recognition globally, product category demand, search volume trends, and wholesale market relevance.

// Return ONLY a valid JSON array. No markdown fences, no explanation. Schema per item:
// {"slug":"","popularityScore":0,"trend":"rising|stable|declining","popularReason":"6 words max","globalRank":"Top X%"}

// Products:
// ${productList}`,
//         },
//       ],
//     }),
//   });

//   const data = await res.json();
//   const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "[]";

//   try {
//     const parsed: PopularityResult[] = JSON.parse(raw.replace(/```json|```/g, "").trim());
//     return Object.fromEntries(parsed.map((r) => [r.slug, r]));
//   } catch {
//     return {};
//   }
// }

// /* ─────────────────────────────────────────────────────────────────
//    HELPERS
// ───────────────────────────────────────────────────────────────── */
// const getOfferPrice = (price: number, discount: number): number | null =>
//   discount > 0 ? Math.round(price * (1 - discount / 100)) : null;

// const getOriginFlag = (origin: string): string => {
//   if (origin.includes("Bangladesh")) return "🇧🇩";
//   if (origin.includes("China")) return "🇨🇳";
//   if (origin.includes("Korea")) return "🇰🇷";
//   if (origin.includes("Japan")) return "🇯🇵";
//   if (origin.includes("USA") || origin.includes("America")) return "🇺🇸";
//   if (origin.includes("India")) return "🇮🇳";
//   return "🌐";
// };

// const popColor = (score: number): string => {
//   if (score >= 80) return "#22c55e";
//   if (score >= 60) return "#3b82f6";
//   if (score >= 40) return "#f59e0b";
//   return "#94a3b8";
// };

// const trendMeta = (trend: string) => {
//   if (trend === "rising") return { icon: "↑", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
//   if (trend === "declining") return { icon: "↓", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
//   return { icon: "→", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
// };

// /* ─────────────────────────────────────────────────────────────────
//    PRODUCT IMAGE (with elegant fallback)
// ───────────────────────────────────────────────────────────────── */
// function ProductImg({ src, alt, brand }: { src?: string; alt: string; brand: string }) {
//   const [err, setErr] = useState(false);
//   const letter = brand.charAt(0).toUpperCase();
//   const hues: Record<string, string> = {
//     A: "215", S: "220", X: "25", G: "142", J: "22",
//     default: "258",
//   };
//   const hue = hues[letter] ?? hues.default;
//   const isDemo = !src || src.includes("/demo/");

//   if (err || isDemo) {
//     return (
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           background: `hsl(${hue},60%,96%)`,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",
//         }}
//       >
//         <div
//           style={{
//             width: "64px",
//             height: "64px",
//             borderRadius: "50%",
//             background: `hsl(${hue},55%,55%)`,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "28px",
//             fontWeight: "900",
//             color: "#fff",
//             fontFamily: "'DM Serif Display', Georgia, serif",
//             letterSpacing: "-1px",
//           }}
//         >
//           {letter}
//         </div>
//         <span
//           style={{
//             fontSize: "10px",
//             fontWeight: "700",
//             color: `hsl(${hue},55%,45%)`,
//             letterSpacing: "0.12em",
//             textTransform: "uppercase",
//           }}
//         >
//           {brand}
//         </span>
//       </div>
//     );
//   }

//   return (
//     <Image
//       src={src}
//       alt={alt}
//       fill
//       className="object-cover transition-transform duration-700 group-hover:scale-108"
//       onError={() => setErr(true)}
//       sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────────
//    SKELETON
// ───────────────────────────────────────────────────────────────── */
// function Skeleton() {
//   return (
//     <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white">
//       <div className="h-52 bg-neutral-100 animate-pulse" />
//       <div className="p-3 space-y-2">
//         <div className="h-2.5 bg-neutral-100 rounded-full animate-pulse w-2/3" />
//         <div className="h-3 bg-neutral-100 rounded-full animate-pulse" />
//         <div className="h-3 bg-neutral-100 rounded-full animate-pulse w-4/5" />
//         <div className="h-2 bg-neutral-100 rounded-full animate-pulse w-1/2 mt-3" />
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────────
//    PRODUCT CARD
// ───────────────────────────────────────────────────────────────── */
// function ProductCard({
//   product,
//   idx,
//   pop,
//   popLoading,
// }: {
//   product: Product;
//   idx: number;
//   pop?: PopularityResult;
//   popLoading: boolean;
// }) {
//   const [flipped, setFlipped] = useState(false);
//   const [wished, setWished] = useState(false);
//   const [carted, setCarted] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   const offer = getOfferPrice(product.price, product.discount);
//   const flag = getOriginFlag(product.countryOfOrigin);
//   const trend = pop ? trendMeta(pop.trend) : null;
//   const pc = pop ? popColor(pop.popularityScore) : "#94a3b8";
//   const scoreW = pop ? `${pop.popularityScore}%` : "0%";

//   const onCart = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCarted(true);
//     setTimeout(() => setCarted(false), 1800);
//   };

//   return (
//     <div
//       ref={ref}
//       className="group relative cursor-pointer"
//       style={{
//         height: "clamp(380px, 46vw, 450px)",
//         perspective: "1400px",
//         animationDelay: `${idx * 70}ms`,
//       }}
//       onMouseEnter={() => !isMobile && setFlipped(true)}
//       onMouseLeave={() => !isMobile && setFlipped(false)}
//       onClick={() => isMobile && setFlipped((v) => !v)}
//     >
//       {/* 3D wrapper */}
//       <div
//         className="relative w-full h-full"
//         style={{
//           transformStyle: "preserve-3d",
//           transition: "transform 0.75s cubic-bezier(0.22,1,0.36,1)",
//           transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
//         }}
//       >
//         {/* ── FRONT ── */}
//         <div
//           className="absolute inset-0 flex flex-col rounded-2xl bg-white border border-neutral-100 overflow-hidden shadow-sm"
//           style={{ backfaceVisibility: "hidden" }}
//         >
//           {/* Image */}
//           <div className="relative overflow-hidden flex-shrink-0" style={{ height: "57%" }}>
//             <ProductImg src={product.images?.[0]?.url} alt={product.nameEng} brand={product.brand} />

//             {/* Gradient overlay at bottom */}
//             <div
//               className="absolute inset-x-0 bottom-0 h-10"
//               style={{ background: "linear-gradient(to top, rgba(0,0,0,0.08), transparent)" }}
//             />

//             {/* Discount badge */}
//             {product.discount > 0 && (
//               <div
//                 className="absolute top-2.5 left-2.5 z-10 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full"
//                 style={{ background: "#ef4444", fontFamily: "'DM Serif Display', serif", letterSpacing: "0.02em" }}
//               >
//                 -{product.discount}%
//               </div>
//             )}

//             {/* Popularity pill */}
//             <div className="absolute top-2.5 right-9 z-10 flex items-center gap-1">
//               {popLoading && !pop ? (
//                 <div
//                   className="rounded-full px-2 py-0.5 flex items-center gap-1.5"
//                   style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}
//                 >
//                   <div
//                     className="w-1.5 h-1.5 rounded-full"
//                     style={{ background: "#818cf8", animation: "pulseDot 1.2s ease-in-out infinite" }}
//                   />
//                   <span className="text-[9px] font-semibold" style={{ color: "#818cf8" }}>
//                     Scoring…
//                   </span>
//                 </div>
//               ) : pop ? (
//                 <div
//                   className="rounded-full px-2 py-0.5 flex items-center gap-1"
//                   style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: `1px solid ${pc}33` }}
//                 >
//                   <span className="text-[10px] font-black" style={{ color: pc }}>
//                     {pop.popularityScore}
//                   </span>
//                   <span className="text-[8px] font-semibold" style={{ color: "#94a3b8" }}>
//                     /100
//                   </span>
//                 </div>
//               ) : null}
//             </div>

//             {/* Wishlist */}
//             <button
//               onClick={(e) => { e.stopPropagation(); setWished((v) => !v); }}
//               className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90"
//               style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill={wished ? "#e11d48" : "none"} stroke={wished ? "#e11d48" : "#9ca3af"} strokeWidth="2.2">
//                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//               </svg>
//             </button>

//             {/* Trend badge bottom-left */}
//             {trend && pop && (
//               <div
//                 className="absolute bottom-2 left-2 z-10 rounded-full flex items-center gap-1 px-1.5 py-0.5"
//                 style={{ background: trend.bg, backdropFilter: "blur(4px)" }}
//               >
//                 <span className="text-[10px] font-bold" style={{ color: trend.color }}>{trend.icon}</span>
//                 <span className="text-[8px] font-semibold capitalize" style={{ color: trend.color }}>{pop.trend}</span>
//               </div>
//             )}
//           </div>

//           {/* Info */}
//           <div className="flex flex-col flex-1 justify-between p-3">
//             <div>
//               <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#c4b5fd" }}>
//                 {product.brand} · {product.subSubcategory}
//               </p>
//               <h3 className="text-[12.5px] font-semibold leading-snug text-neutral-800 line-clamp-2">
//                 {product.nameEng}
//               </h3>

//               {/* Score bar */}
//               {pop && (
//                 <div className="mt-2">
//                   <div className="h-1 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
//                     <div
//                       className="h-full rounded-full transition-all duration-1000"
//                       style={{ width: scoreW, background: pc }}
//                     />
//                   </div>
//                   <p className="text-[9px] mt-0.5 italic" style={{ color: "#94a3b8" }}>{pop.popularReason}</p>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-end justify-between mt-2">
//               <div>
//                 {offer != null ? (
//                   <>
//                     <p className="text-[15px] font-black leading-none" style={{ color: "#ef4444", fontFamily: "'DM Serif Display', serif" }}>
//                       ৳{offer.toLocaleString()}
//                     </p>
//                     <p className="text-[10px] line-through mt-0.5" style={{ color: "#cbd5e1" }}>
//                       ৳{product.price.toLocaleString()}
//                     </p>
//                   </>
//                 ) : (
//                   <p className="text-[15px] font-black leading-none text-neutral-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
//                     ৳{product.price.toLocaleString()}
//                   </p>
//                 )}
//               </div>

//               <button
//                 onClick={onCart}
//                 className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95"
//                 style={{ background: carted ? "#22c55e" : "#6d28d9" }}
//               >
//                 {carted ? "✓ Added" : "+ Cart"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── BACK ── */}
//         <div
//           className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col p-4"
//           style={{
//             backfaceVisibility: "hidden",
//             transform: "rotateY(180deg)",
//             background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
//           }}
//         >
//           {/* Fine grain texture overlay */}
//           <div
//             className="absolute inset-0 opacity-[0.04] pointer-events-none"
//             style={{
//               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
//             }}
//           />

//           {/* Supplier row */}
//           <div className="flex items-center gap-2 mb-3 relative">
//             <div
//               className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
//               style={{ background: "rgba(255,255,255,0.08)" }}
//             >
//               {flag}
//             </div>
//             <div className="min-w-0">
//               <p className="text-[11px] font-semibold text-white leading-none truncate">{product.supplierName}</p>
//               <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
//                 {product.supplierYears} yrs · {product.certifications} · ✓ Verified
//               </p>
//             </div>

//             {pop && (
//               <div
//                 className="ml-auto flex-shrink-0 rounded-xl px-2.5 py-1.5 text-center"
//                 style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
//               >
//                 <p className="text-lg font-black text-white leading-none" style={{ fontFamily: "'DM Serif Display', serif" }}>
//                   {pop.popularityScore}
//                 </p>
//                 <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
//                   Score
//                 </p>
//               </div>
//             )}
//           </div>

//           <h3 className="text-[13px] font-bold text-white leading-snug mb-1.5 line-clamp-2">
//             {product.nameEng}
//           </h3>

//           <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
//             {product.shortDescription}
//           </p>

//           {/* Popularity insight block */}
//           {pop && (
//             <div
//               className="rounded-xl p-2.5 mb-3"
//               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
//             >
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
//                   Global Popularity
//                 </span>
//                 <span
//                   className="text-[9px] font-bold rounded-full px-2 py-0.5"
//                   style={{ color: trendMeta(pop.trend).color, background: trendMeta(pop.trend).bg }}
//                 >
//                   {trendMeta(pop.trend).icon} {pop.trend} · {pop.globalRank}
//                 </span>
//               </div>
//               <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
//                 <div
//                   className="h-full rounded-full"
//                   style={{ width: scoreW, background: `linear-gradient(90deg, ${pc}, ${pc}aa)` }}
//                 />
//               </div>
//               <p className="text-[9px] mt-1 italic" style={{ color: "rgba(255,255,255,0.35)" }}>
//                 {pop.popularReason}
//               </p>
//             </div>
//           )}

//           {/* Spec chips */}
//           <div className="flex flex-wrap gap-1 mb-3">
//             {Object.entries(product.specifications?.general ?? {})
//               .slice(0, 4)
//               .map(([k, v]) => (
//                 <span
//                   key={k}
//                   className="rounded-full text-[9px] font-semibold px-2 py-0.5"
//                   style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
//                 >
//                   {v}
//                 </span>
//               ))}
//             <span
//               className="rounded-full text-[9px] font-semibold px-2 py-0.5"
//               style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
//             >
//               MOQ {product.moq}
//             </span>
//           </div>

//           {/* Price row */}
//           <div
//             className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
//             style={{ background: "rgba(255,255,255,0.07)" }}
//           >
//             <div>
//               {offer != null ? (
//                 <>
//                   <p
//                     className="text-base font-black text-white leading-none"
//                     style={{ fontFamily: "'DM Serif Display', serif" }}
//                   >
//                     ৳{offer.toLocaleString()}
//                   </p>
//                   <p className="text-[9px] line-through mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
//                     ৳{product.price.toLocaleString()}
//                   </p>
//                 </>
//               ) : (
//                 <p
//                   className="text-base font-black text-white leading-none"
//                   style={{ fontFamily: "'DM Serif Display', serif" }}
//                 >
//                   ৳{product.price.toLocaleString()}
//                 </p>
//               )}
//             </div>
//             {product.discount > 0 && (
//               <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>
//                 Save {product.discount}%
//               </span>
//             )}
//           </div>

//           {/* CTAs */}
//           <div className="grid gap-1.5 mt-auto">
//             <Link
//               href={`/products/${product._id}`}
//               onClick={(e) => e.stopPropagation()}
//               className="flex items-center justify-center rounded-xl py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
//               style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
//             >
//               View Details →
//             </Link>
//             <div className="grid grid-cols-2 gap-1.5">
//               <Link
//                 href={`/products/${product._id}`}
//                 onClick={(e) => e.stopPropagation()}
//                 className="flex items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-opacity hover:opacity-90"
//                 style={{ background: "#06b6d4", color: "#083344" }}
//               >
//                 Buy Now
//               </Link>
//               <button
//                 onClick={onCart}
//                 className="rounded-xl py-1.5 text-[10px] font-bold text-white transition-colors"
//                 style={{ background: carted ? "#22c55e" : "#19827d" }}
//               >
//                 {carted ? "✓ Added!" : "Add to Cart"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────────
//    MAIN COMPONENT
// ───────────────────────────────────────────────────────────────── */
// const PAGE_LIMIT = 12;

// export default function PopularProducts() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const [popularityData, setPopularityData] = useState<Record<string, PopularityResult>>({});
//   const [popLoading, setPopLoading] = useState(false);

//   const [sortBy, setSortBy] = useState<SortKey>("popularity");
//   const [activeCategory, setActiveCategory] = useState("All");

//   /* Fetch products from your API */
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/product?page=${page}&limit=${PAGE_LIMIT}`,
//           { cache: "no-store" }
//         );

//         if (!res.ok) throw new Error(`Server error: ${res.status}`);

//         const json = await res.json();
//         if (!json.success) throw new Error(json.message || "Failed to load products");

//         setProducts(json.data);
//         setTotal(json.total ?? json.data.length);
//       } catch (err: unknown) {
//         setError(err instanceof Error ? err.message : "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [page]);

//   /* Fetch popularity scores whenever products change */
//   const runPopularityCheck = useCallback(async (list: Product[]) => {
//     if (!list.length) return;
//     setPopLoading(true);
//     try {
//       const scores = await fetchPopularityScores(list);
//       setPopularityData((prev) => ({ ...prev, ...scores }));
//     } catch {
//       // Popularity is non-critical — fail silently
//     } finally {
//       setPopLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (products.length) runPopularityCheck(products);
//   }, [products, runPopularityCheck]);

//   /* Derived data */
//   const categories = ["All", ...Array.from(new Set(products.map((p) => p.subSubcategory)))];

//   const displayed = [...products]
//     .filter((p) => activeCategory === "All" || p.subSubcategory === activeCategory)
//     .sort((a, b) => {
//       if (sortBy === "popularity") {
//         return (popularityData[b.slug]?.popularityScore ?? 0) - (popularityData[a.slug]?.popularityScore ?? 0);
//       }
//       if (sortBy === "price_asc") return a.price - b.price;
//       if (sortBy === "price_desc") return b.price - a.price;
//       if (sortBy === "discount") return b.discount - a.discount;
//       if (sortBy === "stock") return b.stock - a.stock;
//       return 0;
//     });

//   const avgScore =
//     Object.values(popularityData).length
//       ? Math.round(
//           Object.values(popularityData).reduce((s, d) => s + d.popularityScore, 0) /
//             Object.values(popularityData).length
//         )
//       : null;

//   const topEntry = Object.entries(popularityData).sort((a, b) => b[1].popularityScore - a[1].popularityScore)[0];
//   const topBrand = topEntry ? products.find((p) => p.slug === topEntry[0])?.brand ?? "—" : "—";
//   const risingCount = Object.values(popularityData).filter((d) => d.trend === "rising").length;
//   const totalPages = Math.ceil(total / PAGE_LIMIT);

//   return (
//     <>
//       {/* Global styles */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
//         @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.45}}
//         .pop-card-anim{opacity:0;animation:fadeUp .5s ease forwards}
//         .pop-font{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
//         .pop-select{appearance:none;background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:7px 30px 7px 12px;font-size:12px;font-weight:600;color:#374151;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;font-family:'Plus Jakarta Sans',sans-serif}
//         .pop-select:focus{outline:none;border-color:#7c3aed}
//         .cat-chip{padding:5px 13px;border-radius:99px;font-size:11px;font-weight:700;border:1.5px solid #e5e7eb;background:#fff;color:#9ca3af;cursor:pointer;transition:all .18s;white-space:nowrap;letter-spacing:.02em;font-family:'Plus Jakarta Sans',sans-serif}
//         .cat-chip:hover{border-color:#a78bfa;color:#7c3aed}
//         .cat-chip.on{background:#7c3aed;color:#fff;border-color:#7c3aed}
//         .page-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;font-size:13px;font-weight:700;color:#374151;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
//         .page-btn:hover:not(:disabled){border-color:#7c3aed;color:#7c3aed}
//         .page-btn:disabled{opacity:.35;cursor:not-allowed}
//         .page-btn.active-pg{background:#7c3aed;border-color:#7c3aed;color:#fff}
//         @media(max-width:639px){.pop-grid{grid-template-columns:repeat(2,1fr)!important}.pop-stats{grid-template-columns:repeat(2,1fr)!important}}
//         @media(min-width:640px) and (max-width:1023px){.pop-grid{grid-template-columns:repeat(3,1fr)!important}}
//         @media(min-width:1024px) and (max-width:1279px){.pop-grid{grid-template-columns:repeat(4,1fr)!important}}
//         @media(min-width:1280px){.pop-grid{grid-template-columns:repeat(6,1fr)!important}}
//       `}</style>

//       <section className="pop-font w-full py-12 px-4 sm:px-6 lg:px-8" style={{ background: "#fafaf9" }}>
//         <div style={{ maxWidth: "1440px", margin: "0 auto" }}>

//           {/* ── Header ── */}
//           <div className="mb-8 text-center">
//             <div className="flex items-center justify-center gap-2 mb-3">
//               <div
//                 className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
//                 style={{ background: "linear-gradient(90deg,#ede9fe,#fce7f3)", color: "#7c3aed" }}
//               >
//                 🌐 AI Global Rank
//               </div>
//             </div>
//             <h2
//               className="text-3xl sm:text-4xl font-black text-neutral-900 mb-1"
//               style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}
//             >
//               Popular Products
//             </h2>
//             <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
//               Hover cards to explore · Popularity powered by AI analysis
//             </p>
//           </div>

//           {/* ── Stats Bar ── */}
//           {!popLoading && avgScore !== null && (
//             <div className="pop-stats grid grid-cols-3 gap-3 mb-7">
//               {[
//                 { label: "Avg AI Score", value: `${avgScore}/100`, icon: "◆", color: "#7c3aed" },
//                 { label: "Top Brand", value: topBrand, icon: "★", color: "#f59e0b" },
//                 { label: "Rising Trend", value: `${risingCount} items`, icon: "↑", color: "#22c55e" },
//               ].map((s) => (
//                 <div
//                   key={s.label}
//                   className="rounded-2xl flex items-center gap-3 px-4 py-3 border"
//                   style={{ background: "#fff", borderColor: "#f0f0f0" }}
//                 >
//                   <span className="text-xl" style={{ color: s.color }}>{s.icon}</span>
//                   <div>
//                     <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#d1d5db" }}>{s.label}</p>
//                     <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* ── Controls ── */}
//           <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
//             {/* Category pills */}
//             <div className="flex gap-2 flex-wrap">
//               {categories.map((c) => (
//                 <button
//                   key={c}
//                   className={`cat-chip ${activeCategory === c ? "on" : ""}`}
//                   onClick={() => setActiveCategory(c)}
//                 >
//                   {c}
//                 </button>
//               ))}
//             </div>

//             <div className="flex items-center gap-2">
//               {popLoading && (
//                 <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "#a78bfa" }}>
//                   <span
//                     className="w-2 h-2 rounded-full inline-block"
//                     style={{ background: "#a78bfa", animation: "pulseDot 1.2s ease-in-out infinite" }}
//                   />
//                   AI scoring…
//                 </span>
//               )}
//               <select className="pop-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
//                 <option value="popularity">Sort: Popularity</option>
//                 <option value="price_asc">Price: Low → High</option>
//                 <option value="price_desc">Price: High → Low</option>
//                 <option value="discount">Highest Discount</option>
//                 <option value="stock">In Stock First</option>
//               </select>
//             </div>
//           </div>

//           {/* ── Error ── */}
//           {error && !loading && (
//             <div
//               className="rounded-2xl p-6 text-center mb-6 border"
//               style={{ background: "#fef2f2", borderColor: "#fecaca" }}
//             >
//               <p className="text-sm font-semibold text-red-600 mb-2">⚠ {error}</p>
//               <button
//                 onClick={() => setPage((p) => p)}
//                 className="text-[12px] font-bold text-red-500 underline underline-offset-2"
//               >
//                 Try again
//               </button>
//             </div>
//           )}

//           {/* ── Grid ── */}
//           <div className="pop-grid grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
//             {loading
//               ? Array.from({ length: PAGE_LIMIT }).map((_, i) => <Skeleton key={i} />)
//               : displayed.map((product, i) => (
//                   <div key={product._id} className="pop-card-anim" style={{ animationDelay: `${i * 65}ms` }}>
//                     <ProductCard
//                       product={product}
//                       idx={i}
//                       pop={popularityData[product.slug]}
//                       popLoading={popLoading}
//                     />
//                   </div>
//                 ))}
//           </div>

//           {/* ── Empty state ── */}
//           {!loading && !error && displayed.length === 0 && (
//             <div className="text-center py-20">
//               <p className="text-4xl mb-3">📦</p>
//               <p className="font-semibold text-neutral-500">No products found</p>
//             </div>
//           )}

//           {/* ── Pagination ── */}
//           {!loading && totalPages > 1 && (
//             <div className="flex items-center justify-center gap-2 mt-10">
//               <button
//                 className="page-btn"
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => p - 1)}
//               >
//                 ‹
//               </button>

//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
//                 .reduce<(number | "…")[]>((acc, n, idx, arr) => {
//                   if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
//                   acc.push(n);
//                   return acc;
//                 }, [])
//                 .map((n, i) =>
//                   n === "…" ? (
//                     <span key={`e${i}`} className="text-neutral-400 text-sm px-1">…</span>
//                   ) : (
//                     <button
//                       key={n}
//                       className={`page-btn ${n === page ? "active-pg" : ""}`}
//                       onClick={() => setPage(n as number)}
//                     >
//                       {n}
//                     </button>
//                   )
//                 )}

//               <button
//                 className="page-btn"
//                 disabled={page === totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//               >
//                 ›
//               </button>

//               <span className="text-[12px] font-semibold ml-2" style={{ color: "#9ca3af" }}>
//                 {total} products
//               </span>
//             </div>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }



// jsx

// "use client";

// import { useState, useEffect, useCallback } from "react";

// /* ─── Mock Dataset (from API/DB) ─────────────────────────────── */
// const rawProducts = [
//   {
//     _id: "6a04ad645ba474d41ca2dd39",
//     nameEng: "Anker Gaming Earbuds ANK-967Pro",
//     nameLocal: "Anker Gaming Earbuds ANK-967Pro",
//     brand: "Anker",
//     modelNumber: "ANK-967Pro",
//     sku: "ANK-00001",
//     slug: "anker-gaming-earbuds-1",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "Gaming Earbuds",
//     price: 955,
//     currency: "BDT (৳)",
//     discount: 15,
//     moq: "10",
//     stock: 2134,
//     sampleAvailable: "Yes — Paid Sample",
//     supplierName: "BD Export Hub Ltd",
//     countryOfOrigin: "Bangladesh (BD)",
//     supplierYears: "5",
//     certifications: "ISO",
//     shortDescription: "Anker branded gaming earbuds for retail and wholesale supply chain.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-1" }
//     ],
//     specifications: {
//       general: { material: "Aluminum", weight: "339g", color: "Black" }
//     },
//     tags: ["gaming earbuds", "anker", "tws & earphones"],
//   },
//   {
//     _id: "6a04ad645ba474d41ca2dd3a",
//     nameEng: "Xiaomi ANC Earbuds XIA-863X",
//     nameLocal: "Xiaomi ANC Earbuds XIA-863X",
//     brand: "Xiaomi",
//     modelNumber: "XIA-863X",
//     sku: "XIA-00002",
//     slug: "xiaomi-anc-earbuds-2",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "ANC Earbuds",
//     price: 20743,
//     currency: "BDT (৳)",
//     discount: 20,
//     moq: "20",
//     stock: 2894,
//     sampleAvailable: "Yes — Paid Sample",
//     supplierName: "BD Export Hub Ltd",
//     countryOfOrigin: "Bangladesh (BD)",
//     supplierYears: "15",
//     certifications: "ISO",
//     shortDescription: "Xiaomi branded anc earbuds for retail and wholesale supply chain.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-2" }
//     ],
//     specifications: {
//       general: { material: "Steel", weight: "702g", color: "Black" }
//     },
//     tags: ["anc earbuds", "xiaomi", "tws & earphones"],
//   },
//   {
//     _id: "6a04ad645ba474d41ca2dd3b",
//     nameEng: "Samsung Galaxy Buds Pro SE-88X",
//     nameLocal: "Samsung Galaxy Buds Pro SE-88X",
//     brand: "Samsung",
//     modelNumber: "SE-88X",
//     sku: "SAM-00003",
//     slug: "samsung-galaxy-buds-3",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "True Wireless",
//     price: 18500,
//     currency: "BDT (৳)",
//     discount: 10,
//     moq: "15",
//     stock: 1540,
//     sampleAvailable: "Yes — Paid Sample",
//     supplierName: "TechWorld Exports",
//     countryOfOrigin: "South Korea",
//     supplierYears: "10",
//     certifications: "CE, FCC",
//     shortDescription: "Premium Samsung Galaxy Buds Pro for wholesale buyers and retail chains.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-3" }
//     ],
//     specifications: {
//       general: { material: "Polycarbonate", weight: "215g", color: "Phantom Silver" }
//     },
//     tags: ["galaxy buds", "samsung", "tws"],
//   },
//   {
//     _id: "6a04ad645ba474d41ca2dd3c",
//     nameEng: "Apple AirPods Compatible TWS AP-X1",
//     nameLocal: "Apple AirPods Compatible TWS AP-X1",
//     brand: "Generic",
//     modelNumber: "AP-X1",
//     sku: "APX-00004",
//     slug: "airpods-compatible-tws-4",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "Compatible TWS",
//     price: 1200,
//     currency: "BDT (৳)",
//     discount: 25,
//     moq: "50",
//     stock: 5000,
//     sampleAvailable: "Yes — Free Sample",
//     supplierName: "EliteGadgets BD",
//     countryOfOrigin: "China",
//     supplierYears: "7",
//     certifications: "ISO",
//     shortDescription: "High-quality AirPods compatible TWS for volume wholesale orders.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-4" }
//     ],
//     specifications: {
//       general: { material: "ABS Plastic", weight: "55g", color: "White" }
//     },
//     tags: ["airpods compatible", "tws", "wireless earbuds"],
//   },
//   {
//     _id: "6a04ad645ba474d41ca2dd3d",
//     nameEng: "Sony WF-Sport Wireless Earphones SON-77S",
//     nameLocal: "Sony WF-Sport Wireless Earphones SON-77S",
//     brand: "Sony",
//     modelNumber: "SON-77S",
//     sku: "SON-00005",
//     slug: "sony-wf-sport-5",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "Sport Earphones",
//     price: 12000,
//     currency: "BDT (৳)",
//     discount: 18,
//     moq: "10",
//     stock: 890,
//     sampleAvailable: "Yes — Paid Sample",
//     supplierName: "ProAudio Wholesale",
//     countryOfOrigin: "Japan",
//     supplierYears: "12",
//     certifications: "CE, ISO",
//     shortDescription: "Sony sport wireless earphones for active lifestyle wholesale.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-5" }
//     ],
//     specifications: {
//       general: { material: "Rubber + Plastic", weight: "180g", color: "Black/Blue" }
//     },
//     tags: ["sony", "sport earphones", "wireless"],
//   },
//   {
//     _id: "6a04ad645ba474d41ca2dd3e",
//     nameEng: "JBL Tune 230NC TWS JBL-T230",
//     nameLocal: "JBL Tune 230NC TWS JBL-T230",
//     brand: "JBL",
//     modelNumber: "JBL-T230",
//     sku: "JBL-00006",
//     slug: "jbl-tune-230-6",
//     category: "Consumer Electronics",
//     subcategory: "TWS & Earphones",
//     subSubcategory: "ANC Earbuds",
//     price: 8900,
//     currency: "BDT (৳)",
//     discount: 12,
//     moq: "20",
//     stock: 2100,
//     sampleAvailable: "Yes — Paid Sample",
//     supplierName: "AudioHub International",
//     countryOfOrigin: "USA",
//     supplierYears: "9",
//     certifications: "CE, FCC, ISO",
//     shortDescription: "JBL Tune 230NC TWS with active noise cancellation for premium wholesale.",
//     images: [
//       { url: "https://res.cloudinary.com/demo/image/upload/v1778234006/products/images/product-6" }
//     ],
//     specifications: {
//       general: { material: "Premium Plastic", weight: "195g", color: "White/Black" }
//     },
//     tags: ["jbl", "anc", "tws earphones"],
//   },
// ];

// /* ─── Popularity Check via Claude API ───────────────────────── */
// async function checkProductPopularity(products) {
//   const productList = products.map(p => `- ${p.nameEng} by ${p.brand} (${p.subSubcategory})`).join("\n");

//   const response = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       messages: [{
//         role: "user",
//         content: `You are a global market analyst. For each product below, assess its international website/search popularity on a score from 0-100 based on brand recognition, product category demand, and global market trends. Also assign a trend direction: "rising", "stable", or "declining". Return ONLY valid JSON array, no markdown, no explanation. Format:
// [{"slug":"product-slug","popularityScore":85,"trend":"rising","popularReason":"Short 6-word reason","globalRank":"Top 10%"}]

// Products to analyze:
// ${products.map(p => `slug:${p.slug} | ${p.nameEng} | Brand:${p.brand} | Category:${p.subSubcategory}`).join("\n")}`
//       }]
//     })
//   });

//   const data = await response.json();
//   const text = data.content?.find(b => b.type === "text")?.text || "[]";
//   try {
//     const clean = text.replace(/```json|```/g, "").trim();
//     return JSON.parse(clean);
//   } catch {
//     return [];
//   }
// }

// /* ─── Helpers ────────────────────────────────────────────────── */
// function getOfferPrice(price, discount) {
//   if (!discount) return null;
//   return Math.round(price * (1 - discount / 100));
// }

// function getCountryCode(origin) {
//   if (origin.includes("Bangladesh")) return "BD";
//   if (origin.includes("China")) return "CN";
//   if (origin.includes("Korea")) return "KR";
//   if (origin.includes("Japan")) return "JP";
//   if (origin.includes("USA")) return "US";
//   return origin.slice(0, 2).toUpperCase();
// }

// function getTrendColor(trend) {
//   if (trend === "rising") return "#10b981";
//   if (trend === "declining") return "#ef4444";
//   return "#f59e0b";
// }

// function getTrendIcon(trend) {
//   if (trend === "rising") return "↑";
//   if (trend === "declining") return "↓";
//   return "→";
// }

// function getPopularityBar(score) {
//   if (score >= 80) return { label: "Very High", color: "#10b981" };
//   if (score >= 60) return { label: "High", color: "#3b82f6" };
//   if (score >= 40) return { label: "Medium", color: "#f59e0b" };
//   return { label: "Low", color: "#6b7280" };
// }

// /* ─── Image Component with fallback ────────────────────────── */
// function ProductImage({ src, alt }) {
//   const [error, setError] = useState(false);
//   const brandColors = {
//     A: "#ff6b35", S: "#1428a0", X: "#ff6900", G: "#34a853",
//     J: "#f96714", default: "#6366f1"
//   };
//   const letter = alt?.charAt(0)?.toUpperCase() || "P";
//   const bgColor = brandColors[letter] || brandColors.default;

//   if (error || !src || src.includes("demo/image")) {
//     return (
//       <div style={{
//         width: "100%", height: "100%", background: `linear-gradient(135deg, ${bgColor}22 0%, ${bgColor}44 100%)`,
//         display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px"
//       }}>
//         <div style={{
//           width: "56px", height: "56px", borderRadius: "50%", background: bgColor,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           fontSize: "24px", fontWeight: "800", color: "#fff", fontFamily: "system-ui"
//         }}>{letter}</div>
//         <span style={{ fontSize: "10px", color: bgColor, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>
//           {alt?.split(" ").slice(0, 2).join(" ")}
//         </span>
//       </div>
//     );
//   }

//   return (
//     <img
//       src={src} alt={alt} onError={() => setError(true)}
//       style={{ width: "100%", height: "100%", objectFit: "cover" }}
//     />
//   );
// }

// /* ─── Popularity Badge ───────────────────────────────────────── */
// function PopularityBadge({ data, loading }) {
//   if (loading) {
//     return (
//       <div style={{
//         position: "absolute", top: "8px", left: "8px", zIndex: 20,
//         background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
//         borderRadius: "20px", padding: "3px 8px",
//         display: "flex", alignItems: "center", gap: "5px"
//       }}>
//         <div style={{
//           width: "8px", height: "8px", borderRadius: "50%",
//           background: "#6366f1", animation: "pulse 1.2s ease-in-out infinite"
//         }} />
//         <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: "600" }}>Checking...</span>
//       </div>
//     );
//   }

//   if (!data) return null;
//   const pop = getPopularityBar(data.popularityScore);
//   const trendColor = getTrendColor(data.trend);

//   return (
//     <div style={{
//       position: "absolute", top: "8px", left: "8px", zIndex: 20,
//       display: "flex", flexDirection: "column", gap: "4px"
//     }}>
//       <div style={{
//         background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
//         borderRadius: "20px", padding: "3px 8px",
//         display: "flex", alignItems: "center", gap: "4px",
//         border: `1px solid ${pop.color}33`
//       }}>
//         <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pop.color }} />
//         <span style={{ fontSize: "10px", color: pop.color, fontWeight: "700" }}>{data.popularityScore}</span>
//         <span style={{ fontSize: "9px", color: "#6b7280" }}>{pop.label}</span>
//       </div>
//       <div style={{
//         background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
//         borderRadius: "20px", padding: "2px 7px",
//         display: "flex", alignItems: "center", gap: "3px"
//       }}>
//         <span style={{ fontSize: "11px", color: trendColor, fontWeight: "700" }}>{getTrendIcon(data.trend)}</span>
//         <span style={{ fontSize: "9px", color: trendColor, fontWeight: "600", textTransform: "capitalize" }}>{data.trend}</span>
//       </div>
//     </div>
//   );
// }

// /* ─── Product Card ───────────────────────────────────────────── */
// function ProductCard({ product, index, popularityData, popularityLoading }) {
//   const [flipped, setFlipped] = useState(false);
//   const [wishlisted, setWishlisted] = useState(false);
//   const [addedToCart, setAddedToCart] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 640);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   const offerPrice = getOfferPrice(product.price, product.discount);
//   const countryCode = getCountryCode(product.countryOfOrigin);
//   const pop = popularityData?.[product.slug];
//   const popBar = pop ? getPopularityBar(pop.popularityScore) : null;

//   const handleCart = (e) => {
//     e.stopPropagation();
//     setAddedToCart(true);
//     setTimeout(() => setAddedToCart(false), 1800);
//   };

//   const handleWishlist = (e) => {
//     e.stopPropagation();
//     setWishlisted(v => !v);
//   };

//   const cardH = isMobile ? "380px" : "420px";

//   return (
//     <div
//       style={{
//         width: "100%", height: cardH, perspective: "1200px", cursor: "pointer",
//         opacity: 0, animation: `fadeSlideUp 0.5s ease forwards`,
//         animationDelay: `${index * 0.08}s`
//       }}
//       onMouseEnter={() => !isMobile && setFlipped(true)}
//       onMouseLeave={() => !isMobile && setFlipped(false)}
//       onClick={() => isMobile && setFlipped(v => !v)}
//     >
//       <div style={{
//         position: "relative", width: "100%", height: "100%",
//         transformStyle: "preserve-3d",
//         transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
//         transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
//       }}>

//         {/* ── FRONT ── */}
//         <div style={{
//           position: "absolute", inset: 0,
//           background: "#ffffff", borderRadius: "16px",
//           border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//           backfaceVisibility: "hidden", display: "flex", flexDirection: "column",
//           overflow: "hidden"
//         }}>
//           {/* Image */}
//           <div style={{ position: "relative", height: "56%", overflow: "hidden", flexShrink: 0 }}>
//             <ProductImage
//               src={product.images?.[0]?.url}
//               alt={product.nameEng}
//             />

//             <PopularityBadge data={pop} loading={popularityLoading && !pop} />

//             {product.discount > 0 && (
//               <div style={{
//                 position: "absolute", top: "8px", right: "8px", zIndex: 10,
//                 background: "#ef4444", color: "#fff", borderRadius: "20px",
//                 padding: "2px 8px", fontSize: "10px", fontWeight: "700"
//               }}>
//                 -{product.discount}%
//               </div>
//             )}

//             <button
//               onClick={handleWishlist}
//               style={{
//                 position: "absolute", bottom: "8px", right: "8px", zIndex: 10,
//                 width: "30px", height: "30px", borderRadius: "50%",
//                 background: "rgba(255,255,255,0.9)", border: "none",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
//               }}
//             >
//               <svg width="14" height="14" viewBox="0 0 24 24"
//                 fill={wishlisted ? "#e11d48" : "none"}
//                 stroke={wishlisted ? "#e11d48" : "#9ca3af"} strokeWidth="2">
//                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//               </svg>
//             </button>
//           </div>

//           {/* Info */}
//           <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 12px 12px" }}>
//             <div>
//               <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 3px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                 {product.brand} · {product.subSubcategory}
//               </p>
//               <h3 style={{
//                 fontSize: "12px", fontWeight: "600", color: "#1f2937",
//                 margin: 0, lineHeight: 1.35,
//                 display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
//               }}>
//                 {product.nameEng}
//               </h3>

//               {/* Popularity bar */}
//               {popBar && (
//                 <div style={{ marginTop: "6px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
//                     <span style={{ fontSize: "9px", color: "#9ca3af" }}>Popularity</span>
//                     <span style={{ fontSize: "9px", color: popBar.color, fontWeight: "600" }}>{pop.popularityScore}/100</span>
//                   </div>
//                   <div style={{ height: "3px", background: "#f3f4f6", borderRadius: "2px", overflow: "hidden" }}>
//                     <div style={{
//                       height: "100%", width: `${pop.popularityScore}%`,
//                       background: popBar.color, borderRadius: "2px",
//                       transition: "width 0.8s ease"
//                     }} />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "8px" }}>
//               <div>
//                 {offerPrice ? (
//                   <>
//                     <p style={{ fontSize: "15px", fontWeight: "700", color: "#ef4444", margin: 0, lineHeight: 1 }}>
//                       ৳{offerPrice.toLocaleString()}
//                     </p>
//                     <p style={{ fontSize: "10px", color: "#d1d5db", textDecoration: "line-through", margin: "2px 0 0" }}>
//                       ৳{product.price.toLocaleString()}
//                     </p>
//                   </>
//                 ) : (
//                   <p style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", margin: 0 }}>
//                     ৳{product.price.toLocaleString()}
//                   </p>
//                 )}
//               </div>

//               <button
//                 onClick={handleCart}
//                 style={{
//                   display: "flex", alignItems: "center", gap: "4px",
//                   background: addedToCart ? "#10b981" : "#19827d",
//                   color: "#fff", border: "none", borderRadius: "10px",
//                   padding: "6px 10px", fontSize: "11px", fontWeight: "600",
//                   cursor: "pointer", transition: "background 0.2s"
//                 }}
//               >
//                 {addedToCart ? "✓ Added" : "+ Cart"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── BACK ── */}
//         <div style={{
//           position: "absolute", inset: 0,
//           background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
//           borderRadius: "16px", padding: "14px",
//           backfaceVisibility: "hidden",
//           transform: "rotateY(180deg)",
//           display: "flex", flexDirection: "column",
//           overflow: "hidden"
//         }}>
//           {/* Supplier */}
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
//             <div style={{
//               width: "28px", height: "28px", borderRadius: "50%",
//               background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "9px", fontWeight: "700", color: "#fff"
//             }}>{countryCode}</div>
//             <div>
//               <p style={{ fontSize: "10px", fontWeight: "600", color: "#fff", margin: 0 }}>{product.supplierName}</p>
//               <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.55)", margin: 0 }}>
//                 {product.supplierYears} yrs · {product.certifications} · ✓ Verified
//               </p>
//             </div>
//             {pop && (
//               <div style={{
//                 marginLeft: "auto", textAlign: "center",
//                 background: "rgba(255,255,255,0.12)", borderRadius: "8px",
//                 padding: "3px 8px"
//               }}>
//                 <p style={{ fontSize: "14px", fontWeight: "800", color: "#fff", margin: 0, lineHeight: 1 }}>
//                   {pop.popularityScore}
//                 </p>
//                 <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                   Pop Score
//                 </p>
//               </div>
//             )}
//           </div>

//           <h3 style={{
//             fontSize: "12px", fontWeight: "700", color: "#fff",
//             margin: "0 0 6px", lineHeight: 1.35,
//             display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
//           }}>
//             {product.nameEng}
//           </h3>

//           <p style={{
//             fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: "0 0 8px", lineHeight: 1.5,
//             display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
//           }}>
//             {product.shortDescription}
//           </p>

//           {/* Popularity insight */}
//           {pop && (
//             <div style={{
//               background: "rgba(255,255,255,0.08)", borderRadius: "10px",
//               padding: "8px 10px", marginBottom: "8px",
//               border: "1px solid rgba(255,255,255,0.12)"
//             }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
//                 <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                   Global Popularity
//                 </span>
//                 <span style={{
//                   fontSize: "9px", fontWeight: "700",
//                   color: getTrendColor(pop.trend),
//                   display: "flex", alignItems: "center", gap: "2px"
//                 }}>
//                   {getTrendIcon(pop.trend)} {pop.trend?.charAt(0).toUpperCase() + pop.trend?.slice(1)}
//                 </span>
//               </div>
//               <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
//                 <div style={{
//                   height: "100%", width: `${pop.popularityScore}%`,
//                   background: getTrendColor(pop.trend), borderRadius: "2px"
//                 }} />
//               </div>
//               <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0", fontStyle: "italic" }}>
//                 {pop.popularReason}
//               </p>
//             </div>
//           )}

//           {/* Spec chips */}
//           <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
//             {Object.entries(product.specifications.general).slice(0, 3).map(([k, v]) => (
//               <span key={k} style={{
//                 background: "rgba(255,255,255,0.12)", borderRadius: "20px",
//                 padding: "2px 8px", fontSize: "9px", color: "rgba(255,255,255,0.8)", fontWeight: "500"
//               }}>
//                 {String(v)}
//               </span>
//             ))}
//             <span style={{
//               background: "rgba(255,255,255,0.12)", borderRadius: "20px",
//               padding: "2px 8px", fontSize: "9px", color: "rgba(255,255,255,0.8)"
//             }}>
//               MOQ: {product.moq}
//             </span>
//           </div>

//           {/* Price */}
//           <div style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             background: "rgba(255,255,255,0.1)", borderRadius: "10px",
//             padding: "6px 10px", marginBottom: "8px"
//           }}>
//             <div>
//               {offerPrice ? (
//                 <>
//                   <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: 0, lineHeight: 1 }}>
//                     ৳{offerPrice.toLocaleString()}
//                   </p>
//                   <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", textDecoration: "line-through", margin: "1px 0 0" }}>
//                     ৳{product.price.toLocaleString()}
//                   </p>
//                 </>
//               ) : (
//                 <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: 0 }}>
//                   ৳{product.price.toLocaleString()}
//                 </p>
//               )}
//             </div>
//             {product.discount > 0 && (
//               <span style={{
//                 background: "#ef4444", color: "#fff", borderRadius: "20px",
//                 padding: "2px 8px", fontSize: "10px", fontWeight: "700"
//               }}>
//                 Save {product.discount}%
//               </span>
//             )}
//           </div>

//           {/* Buttons */}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "5px", marginTop: "auto" }}>
//             <a
//               href={`/products/${product._id}`}
//               onClick={(e) => e.stopPropagation()}
//               style={{
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 background: "#7c3aed", color: "#fff", borderRadius: "10px",
//                 padding: "7px", fontSize: "11px", fontWeight: "600",
//                 textDecoration: "none", transition: "background 0.2s"
//               }}
//             >
//               View Details
//             </a>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
//               <a
//                 href={`/products/${product._id}/buy`}
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   background: "#06b6d4", color: "#0c4a6e", borderRadius: "10px",
//                   padding: "6px", fontSize: "10px", fontWeight: "700",
//                   textDecoration: "none"
//                 }}
//               >
//                 Buy Now
//               </a>
//               <button
//                 onClick={handleCart}
//                 style={{
//                   background: addedToCart ? "#10b981" : "#19827d",
//                   color: "#fff", border: "none", borderRadius: "10px",
//                   padding: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer"
//                 }}
//               >
//                 {addedToCart ? "✓ Added!" : "Add to Cart"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─── Loading Skeleton ───────────────────────────────────────── */
// function SkeletonCard() {
//   return (
//     <div style={{
//       width: "100%", height: "420px", borderRadius: "16px",
//       background: "#f9fafb", border: "1px solid #f0f0f0", overflow: "hidden"
//     }}>
//       <div style={{ height: "56%", background: "#e5e7eb", animation: "shimmer 1.5s infinite" }} />
//       <div style={{ padding: "12px" }}>
//         <div style={{ height: "10px", background: "#e5e7eb", borderRadius: "4px", marginBottom: "8px", width: "60%", animation: "shimmer 1.5s infinite" }} />
//         <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", marginBottom: "6px", animation: "shimmer 1.5s infinite" }} />
//         <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "80%", animation: "shimmer 1.5s infinite" }} />
//       </div>
//     </div>
//   );
// }

// /* ─── Main Component ─────────────────────────────────────────── */
// export default function PopularProducts() {
//   const [products] = useState(rawProducts);
//   const [popularityData, setPopularityData] = useState({});
//   const [popularityLoading, setPopularityLoading] = useState(true);
//   const [popularityError, setPopularityError] = useState(null);
//   const [sortBy, setSortBy] = useState("popularity");
//   const [filterCategory, setFilterCategory] = useState("All");

//   const categories = ["All", ...new Set(rawProducts.map(p => p.subSubcategory))];

//   const fetchPopularity = useCallback(async () => {
//     setPopularityLoading(true);
//     setPopularityError(null);
//     try {
//       const results = await checkProductPopularity(products);
//       const map = {};
//       results.forEach(r => { map[r.slug] = r; });
//       setPopularityData(map);
//     } catch (err) {
//       setPopularityError("Failed to fetch popularity data.");
//     } finally {
//       setPopularityLoading(false);
//     }
//   }, [products]);

//   useEffect(() => { fetchPopularity(); }, [fetchPopularity]);

//   const filteredProducts = products
//     .filter(p => filterCategory === "All" || p.subSubcategory === filterCategory)
//     .sort((a, b) => {
//       if (sortBy === "popularity") {
//         const pa = popularityData[a.slug]?.popularityScore || 0;
//         const pb = popularityData[b.slug]?.popularityScore || 0;
//         return pb - pa;
//       }
//       if (sortBy === "price_low") return a.price - b.price;
//       if (sortBy === "price_high") return b.price - a.price;
//       if (sortBy === "discount") return b.discount - a.discount;
//       return 0;
//     });

//   const avgPopularity = Object.values(popularityData).length
//     ? Math.round(Object.values(popularityData).reduce((s, d) => s + d.popularityScore, 0) / Object.values(popularityData).length)
//     : null;

//   const topProduct = Object.entries(popularityData).sort((a, b) => b[1].popularityScore - a[1].popularityScore)[0];
//   const topProductName = topProduct ? products.find(p => p.slug === topProduct[0])?.brand : null;
//   const risingCount = Object.values(popularityData).filter(d => d.trend === "rising").length;

//   return (
//     <>
//       <style>{`
//         @keyframes fadeSlideUp {
//           from { opacity: 0; transform: translateY(24px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes shimmer {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.6; transform: scale(0.85); }
//         }
//         * { box-sizing: border-box; }
//         .pop-select {
//           appearance: none; background: #f9fafb; border: 1px solid #e5e7eb;
//           border-radius: 8px; padding: 6px 28px 6px 10px; font-size: 12px;
//           color: #374151; cursor: pointer; outline: none;
//           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
//           background-repeat: no-repeat; background-position: right 8px center;
//         }
//         .pop-select:hover { border-color: #6366f1; }
//         .cat-pill {
//           padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
//           border: 1px solid #e5e7eb; background: #fff; color: #6b7280;
//           cursor: pointer; transition: all 0.2s; white-space: nowrap;
//         }
//         .cat-pill.active { background: #6366f1; color: #fff; border-color: #6366f1; }
//         .cat-pill:hover:not(.active) { border-color: #6366f1; color: #6366f1; }
//         @media (max-width: 639px) {
//           .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
//           .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
//         }
//         @media (min-width: 640px) and (max-width: 767px) {
//           .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
//         }
//         @media (min-width: 768px) and (max-width: 1023px) {
//           .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
//         }
//         @media (min-width: 1024px) {
//           .products-grid { grid-template-columns: repeat(6, 1fr) !important; }
//         }
//       `}</style>

//       <section style={{ width: "100%", padding: "40px 16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
//         <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

//           {/* Header */}
//           <div style={{ marginBottom: "28px", textAlign: "center" }}>
//             <span style={{
//               display: "inline-block", background: "#ede9fe", color: "#7c3aed",
//               borderRadius: "20px", padding: "4px 14px", fontSize: "11px",
//               fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px"
//             }}>
//               🌐 AI Popularity Ranked
//             </span>
//             <h2 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>
//               Popular Products
//             </h2>
//             <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
//               Hover or tap cards · Popularity scores checked by AI in real-time
//             </p>
//           </div>

//           {/* Stats bar */}
//           {!popularityLoading && Object.keys(popularityData).length > 0 && (
//             <div className="stats-grid" style={{
//               display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
//               gap: "10px", marginBottom: "20px"
//             }}>
//               {[
//                 { label: "Avg Popularity", value: `${avgPopularity}/100`, icon: "📊", color: "#6366f1" },
//                 { label: "Top Brand", value: topProductName || "—", icon: "🏆", color: "#f59e0b" },
//                 { label: "Rising Trend", value: `${risingCount} products`, icon: "📈", color: "#10b981" },
//               ].map(stat => (
//                 <div key={stat.label} style={{
//                   background: "#fff", border: "1px solid #f0f0f0",
//                   borderRadius: "12px", padding: "12px 14px",
//                   display: "flex", alignItems: "center", gap: "10px"
//                 }}>
//                   <span style={{ fontSize: "20px" }}>{stat.icon}</span>
//                   <div>
//                     <p style={{ fontSize: "9px", color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                       {stat.label}
//                     </p>
//                     <p style={{ fontSize: "13px", fontWeight: "700", color: stat.color, margin: 0 }}>
//                       {stat.value}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Controls */}
//           <div style={{
//             display: "flex", flexWrap: "wrap", gap: "10px",
//             alignItems: "center", justifyContent: "space-between", marginBottom: "20px"
//           }}>
//             {/* Category pills */}
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {categories.map(cat => (
//                 <button
//                   key={cat}
//                   className={`cat-pill${filterCategory === cat ? " active" : ""}`}
//                   onClick={() => setFilterCategory(cat)}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>

//             {/* Sort */}
//             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//               {popularityError && (
//                 <button
//                   onClick={fetchPopularity}
//                   style={{
//                     fontSize: "11px", color: "#ef4444", background: "#fef2f2",
//                     border: "1px solid #fecaca", borderRadius: "6px",
//                     padding: "4px 10px", cursor: "pointer"
//                   }}
//                 >
//                   ↻ Retry
//                 </button>
//               )}
//               <select className="pop-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
//                 <option value="popularity">Sort: Popularity</option>
//                 <option value="price_low">Price: Low → High</option>
//                 <option value="price_high">Price: High → Low</option>
//                 <option value="discount">Highest Discount</option>
//               </select>
//             </div>
//           </div>

//           {/* Grid */}
//           <div className="products-grid" style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(2, 1fr)",
//             gap: "12px"
//           }}>
//             {filteredProducts.map((product, i) => (
//               <ProductCard
//                 key={product._id}
//                 product={product}
//                 index={i}
//                 popularityData={popularityData}
//                 popularityLoading={popularityLoading}
//               />
//             ))}
//           </div>

//           {/* Loading overlay hint */}
//           {popularityLoading && (
//             <div style={{
//               textAlign: "center", marginTop: "16px",
//               display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
//             }}>
//               <div style={{
//                 width: "8px", height: "8px", borderRadius: "50%",
//                 background: "#6366f1", animation: "pulse 1.2s infinite"
//               }} />
//               <span style={{ fontSize: "12px", color: "#9ca3af" }}>
//                 AI is analyzing global popularity...
//               </span>
//             </div>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }






// // tsx



// // "use client";

// // import { useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import Image from "next/image";
// // import Link from "next/link";

// // import imgSunglass1 from "../../assets/glass.png";
// // import imgSunglass2 from "../../assets/glass.png";
// // import imgNecklace1 from "../../assets/goldhar.png";
// // import imgNecklace2 from "../../assets/goldhar.png";
// // import imgCap1 from "../../assets/cap.png";
// // import imgCap2 from "../../assets/capb0.png";
// // import imgNoseRing1 from "../../assets/nosring.png";
// // import imgNoseRing2 from "../../assets/learring.png";
// // import imgEarring1 from "../../assets/learring.png";
// // import imgEarring2 from "../../assets/learring.png";
// // import imgCrownShirt1 from "../../assets/crown.png";
// // import imgCrownShirt2 from "../../assets/crown.png";

// // /* ─── Dataset ────────────────────────────────────────────────── */
// // const accessoriesProducts = [
// //   {
// //     id: "B2B-SG01-001",
// //     name: "Polarized UV400 Aviator Sunglasses",
// //     slug: "polarized-uv400-aviator-sunglasses-oem-odm",
// //     price: 850,
// //     offerPrice: 650,
// //     moq: "20 pieces",
// //     supplier: { name: "GlareShield Optics Co.", yearsActive: "6 yrs", country: "CN", verified: true },
// //     selectedColor: "Gold",
// //     images: [imgSunglass1, imgSunglass2],
// //     description:
// //       "Premium aviator sunglasses with polarized UV400 lenses, lightweight metal alloy frame, and anti-reflective coating — ideal for retail, brand reselling, or custom logo B2B orders.",
// //     specifications: {
// //       optics: { lensType: "Polarized", uvProtection: "UV400", coating: "Anti-Reflective", lensThickness: "1.1 mm" },
// //       build: { frameMaterial: "Zinc Alloy", weight: "22g", templeLength: "140 mm", nosepad: "Adjustable Silicone" },
// //       style: { shape: "Aviator", gender: "Unisex", availableColors: "Gold, Silver, Black, Rose Gold" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 200+", leadTime: "7-14 Days" },
// //     },
// //   },
// //   {
// //     id: "B2B-NK02-001",
// //     name: "18K Gold-Plated Layered Chain Necklace",
// //     slug: "18k-gold-plated-layered-chain-necklace-wholesale",
// //     price: 120000,
// //     offerPrice: 95000,
// //     moq: "15 pieces",
// //     supplier: { name: "AuraGold Jewelry Ltd.", yearsActive: "8 yrs", country: "CN", verified: true },
// //     selectedColor: "Gold",
// //     images: [imgNecklace1, imgNecklace2],
// //     description:
// //       "Elegant 18K gold-plated layered chain necklace with anti-tarnish coating and stainless steel base, designed for boutique resale, gifting brands, and fashion wholesale.",
// //     specifications: {
// //       material: { base: "316L Stainless Steel", plating: "18K Gold", coating: "Anti-Tarnish Epoxy", nickelFree: "Yes" },
// //       design: { style: "Layered Chain", chainLength: "40 cm + 5 cm extender", pendantSize: "N/A", clasp: "Lobster Claw" },
// //       packaging: { default: "Velvet Pouch", branded: "Custom Box Available", giftReady: "Yes" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 100+", leadTime: "10-18 Days" },
// //     },
// //   },
// //   {
// //     id: "B2B-CP03-001",
// //     name: "Structured 6-Panel Snapback Cap",
// //     slug: "structured-6-panel-snapback-cap-oem-embroidery",
// //     price: 600,
// //     offerPrice: 450,
// //     moq: "30 pieces",
// //     supplier: { name: "TopThread Headwear Co.", yearsActive: "4 yrs", country: "BD", verified: true },
// //     selectedColor: "Black",
// //     images: [imgCap1, imgCap2],
// //     description:
// //       "High-quality structured snapback cap with breathable cotton-polyester blend, flat brim, and front embroidery panel — perfect for brand merchandise, streetwear labels, and team uniforms.",
// //     specifications: {
// //       material: { fabric: "60% Cotton / 40% Polyester", sweatband: "Terry Cloth", brim: "Flat, 7 cm" },
// //       fit: { closure: "Snapback Plastic Adjuster", panelCount: "6", crownHeight: "High Structured", sizeRange: "54-60 cm" },
// //       customization: { embroidery: "Front + Side Panels", printMethod: "3D Puff / Flat Embroidery", patchOption: "Available" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 30+", leadTime: "14-21 Days" },
// //     },
// //   },
// //   {
// //     id: "B2B-NR04-001",
// //     name: "Sterling Silver CZ Nose Ring Stud",
// //     slug: "sterling-silver-cz-nose-ring-stud-wholesale",
// //     price: 320,
// //     offerPrice: 220,
// //     moq: "50 pieces",
// //     supplier: { name: "PureStone Piercing Co.", yearsActive: "3 yrs", country: "IN", verified: true },
// //     selectedColor: "Silver",
// //     images: [imgNoseRing1, imgNoseRing2],
// //     description:
// //       "Hypoallergenic 925 sterling silver nose ring stud set with AAA cubic zirconia, available in L-shaped and bone-pin styles — ideal for piercing studios and fashion jewelry retailers.",
// //     specifications: {
// //       material: { base: "925 Sterling Silver", stone: "AAA Cubic Zirconia", finish: "Rhodium Plated", hypoallergenic: "Yes" },
// //       design: { style: "L-Shape / Bone Pin", stoneDiameter: "2 mm", gaugeSizes: "20G, 22G", noseOpeningFit: "Universal" },
// //       safety: { nickelFree: "Yes", leadFree: "Yes", sterilized: "Individually Sealed" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 500+", leadTime: "5-10 Days" },
// //     },
// //   },
// //   {
// //     id: "B2B-ER05-001",
// //     name: "18K Gold-Plated Geometric Drop Earrings",
// //     slug: "18k-gold-plated-geometric-drop-earrings-wholesale",
// //     price: 750,
// //     offerPrice: 550,
// //     moq: "20 pieces",
// //     supplier: { name: "LumiGold Accessories Ltd.", yearsActive: "5 yrs", country: "CN", verified: true },
// //     selectedColor: "Rose Gold",
// //     images: [imgEarring1, imgEarring2],
// //     description:
// //       "Trendy geometric drop earrings with 18K rose gold plating, stainless steel base, and push-back closure — suitable for boutique fashion retailers, influencer merchandise, and gifting brands.",
// //     specifications: {
// //       material: { base: "Stainless Steel", plating: "18K Rose Gold", coating: "Anti-Tarnish", nickelFree: "Yes" },
// //       design: { style: "Geometric Drop", length: "4.5 cm", earringType: "Dangle", closure: "Push Back / Butterfly" },
// //       packaging: { default: "Organza Bag", brandedBox: "Available", pairReady: "Yes" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 200+", leadTime: "7-15 Days" },
// //     },
// //   },
// //   {
// //     id: "B2B-CS06-001",
// //     name: "Oversized Crown Print Graphic T-Shirt",
// //     slug: "oversized-crown-print-graphic-tshirt-streetwear",
// //     price: 950,
// //     offerPrice: 720,
// //     moq: "25 pieces",
// //     supplier: { name: "UrbanThread Apparel BD", yearsActive: "7 yrs", country: "BD", verified: true },
// //     selectedColor: "White",
// //     images: [imgCrownShirt1, imgCrownShirt2],
// //     description:
// //       "Premium oversized drop-shoulder T-shirt with bold crown graphic print using water-based ink on 220 GSM combed cotton — perfect for streetwear brands, private label, and influencer merchandise.",
// //     specifications: {
// //       fabric: { material: "100% Combed Cotton", gsm: "220 GSM", weave: "Single Jersey", finish: "Bio-Washed Soft" },
// //       fit: { style: "Oversized Drop Shoulder", neckline: "Crew Neck", sizes: "S, M, L, XL, XXL", length: "Extended Hip Length" },
// //       print: { method: "Water-Based Screen Print", placement: "Front Chest / Back", colorfastness: "Grade 4-5", inkType: "Eco Water-Based" },
// //       business: { oemOdm: "Available", customLogo: "MOQ 25+", leadTime: "14-20 Days" },
// //     },
// //   },
// // ];

// // /* ─── Types ──────────────────────────────────────────────────── */
// // type Product = typeof accessoriesProducts[0];

// // /* ─── Flip Card ──────────────────────────────────────────────── */
// // function ProductCard({ product, index }: { product: Product; index: number }) {
// //   const [flipped, setFlipped] = useState(false);
// //   const [imgIdx, setImgIdx] = useState(0);
// //   const [wishlisted, setWishlisted] = useState(false);
// //   const [addedToCart, setAddedToCart] = useState(false);

// //   const discount = product.offerPrice
// //     ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
// //     : null;

// //   const handleCart = (e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setAddedToCart(true);
// //     setTimeout(() => setAddedToCart(false), 1800);
// //   };

// //   const handleWishlist = (e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setWishlisted((v) => !v);
// //   };

// //   return (
// //     <motion.div
// //       className="group relative w-full cursor-pointer"
// //       style={{ perspective: "1200px", height: "clamp(360px, 45vw, 440px)" }}
// //       onMouseEnter={() => setFlipped(true)}
// //       onMouseLeave={() => { setFlipped(false); setImgIdx(0); }}
// //       onClick={() => setFlipped((v) => !v)}
// //       initial={{ opacity: 0, y: 40 }}
// //       whileInView={{ opacity: 1, y: 0 }}
// //       viewport={{ once: true, amount: 0.2 }}
// //       transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
// //     >
// //       <motion.div
// //         className="relative h-full w-full"
// //         style={{ transformStyle: "preserve-3d" }}
// //         animate={{ rotateY: flipped ? 180 : 0 }}
// //         transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
// //       >

// //         {/* ── FRONT ── */}
// //         <div
// //           className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100"
// //           style={{ backfaceVisibility: "hidden" }}
// //         >
// //           {/* Image area */}
// //           <div
// //             className="relative overflow-hidden flex-shrink-0"
// //             style={{ height: "58%" }}
// //             onMouseEnter={() => setImgIdx(1)}
// //             onMouseLeave={() => setImgIdx(0)}
// //           >
// //             <AnimatePresence mode="wait">
// //               <motion.div
// //                 key={imgIdx}
// //                 className="absolute inset-0"
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 exit={{ opacity: 0 }}
// //                 transition={{ duration: 0.3 }}
// //               >
// //                 <Image
// //                   src={product.images[imgIdx]}
// //                   alt={product.name}
// //                   fill
// //                   className="object-cover transition-transform duration-700 group-hover:scale-105"
// //                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
// //                 />
// //               </motion.div>
// //             </AnimatePresence>

// //             {/* Discount badge */}
// //             {discount && (
// //               <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
// //                 -{discount}%
// //               </div>
// //             )}

// //             {/* Wishlist */}
// //             <button
// //               onClick={handleWishlist}
// //               aria-label="Add to wishlist"
// //               className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition hover:scale-110 active:scale-95"
// //             >
// //               <HeartIcon filled={wishlisted} />
// //             </button>

// //             {/* Image dots */}
// //             {product.images.length > 1 && (
// //               <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
// //                 {product.images.map((_, i) => (
// //                   <span
// //                     key={i}
// //                     className={`block h-1.5 rounded-full transition-all duration-300 ${
// //                       imgIdx === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
// //                     }`}
// //                   />
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           {/* Info area */}
// //           <div className="flex flex-1 flex-col justify-between p-3">
// //             <div>
// //               {/* <p className="text-[10px] font-medium uppercase tracking-wider text-[#7F626D]/70 mb-0.5">
// //                 {product.supplier.country} · MOQ {product.moq}
// //               </p> */}
// //               <h3 className="text-[13px] font-semibold leading-snug text-gray-800 line-clamp-2">
// //                 {product.name}
// //               </h3>
// //             </div>

// //             <div className="mt-2 flex items-end justify-between">
// //               <div>
// //                 {product.offerPrice ? (
// //                   <>
// //                     <p className="text-base font-bold text-rose-600 leading-none">৳{product.offerPrice.toLocaleString()}</p>
// //                     <p className="text-[11px] text-gray-400 line-through mt-0.5">৳{product.price.toLocaleString()}</p>
// //                   </>
// //                 ) : (
// //                   <p className="text-base font-bold text-gray-800">৳{product.price.toLocaleString()}</p>
// //                 )}
// //               </div>

// //               <motion.button
// //                 onClick={handleCart}
// //                 whileTap={{ scale: 0.92 }}
// //                 className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white shadow transition-colors ${
// //                   addedToCart ? "bg-green-500" : "bg-[#19827d] hover:bg-[#9e7082]"
// //                 }`}
// //               >
// //                 {addedToCart ? (
// //                   <>
// //                     <CheckIcon /> Added
// //                   </>
// //                 ) : (
// //                   <>
// //                     <CartIcon /> Cart
// //                   </>
// //                 )}
// //               </motion.button>
// //             </div>
// //           </div>
// //         </div>





// //         {/* ── BACK ── */}
// //         <div
// //           className="absolute inset-0 flex flex-col rounded-2xl text-black p-4 shadow-xl"
// //           style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
// //         >
// //           {/* Supplier badge */}
// //           <div className="mb-3 flex items-center gap-2">
// //             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold ">
// //               {product.supplier.country}
// //             </div>
// //             <div>
// //               <p className="text-[11px] font-semibold leading-none">{product.supplier.name}</p>
// //               <p className="text-[10px] text-white/60">{product.supplier.yearsActive} · {product.supplier.verified ? "✓ Verified" : "Unverified"}</p>
// //             </div>
// //           </div>

// //           <h3 className="mb-2 text-[14px] font-bold leading-snug line-clamp-2">
// //             {product.name}
// //           </h3>

// //           <p className="flex-1 text-[12px] leading-relaxed  line-clamp-4">
// //             {product.description}
// //           </p>

// //           {/* Spec chips */}
// //           <div className="my-3 flex flex-wrap gap-1.5">
// //             {Object.entries(Object.values(product.specifications)[0])
// //               .slice(0, 3)
// //               .map(([k, v]) => (
// //                 <span
// //                   key={k}
// //                   className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium "
// //                 >
// //                   {String(v)}
// //                 </span>
// //               ))}
// //           </div>

// //           {/* Price row */}
// //           <div className="mb-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
// //             <div>
// //               {product.offerPrice ? (
// //                 <>
// //                   <p className="text-base font-bold text-white leading-none">৳{product.offerPrice.toLocaleString()}</p>
// //                   <p className="text-[11px] text-white/50 line-through">৳{product.price.toLocaleString()}</p>
// //                 </>
// //               ) : (
// //                 <p className="text-base font-bold text-white">৳{product.price.toLocaleString()}</p>
// //               )}
// //             </div>
// //             {discount && (
// //               <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
// //                 Save {discount}%
// //               </span>
// //             )}
// //           </div>

// //           {/* CTA buttons */}
// //           <div className="grid gap-2">
// //             <Link
// //               href={`/products/${product.id}`}
// //               onClick={(e) => e.stopPropagation()}
// //               className="flex items-center justify-center rounded-xl bg-[#7149f5] py-2 text-[12px] font-semibold text-white hover:text-black shadow transition hover:bg-white/90"
// //             >
// //               View Details
// //             </Link>
// //            <div className="flex justify-between gap-2">
// //              <Link
// //               href={`/products/${product.id}`}
// //               onClick={(e) => e.stopPropagation()}
// //               className="flex items-center justify-center rounded-xl bg-[#73eef7] py-2 px-2 text-[12px] font-semibold text-black shadow transition hover:bg-white/90"
// //             >
// //               Buy Now
// //             </Link>
// //             <button
// //               onClick={handleCart}
// //               className={`rounded-xl py-2 px-2 text-[12px] font-semibold shadow transition ${
// //                 addedToCart ? "bg-[#19827d]" : "bg-[#19827d] hover:bg-white/30"
// //               }`}
// //             >
// //               {addedToCart ? "✓ Added!" : "Add to Cart"}
// //             </button>
// //            </div>
// //           </div>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // /* ─── Inline SVG Icons ───────────────────────────────────────── */
// // function HeartIcon({ filled }: { filled: boolean }) {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#e11d48" : "none"} stroke={filled ? "#e11d48" : "#9ca3af"} strokeWidth="2">
// //       <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
// //     </svg>
// //   );
// // }

// // function CartIcon() {
// //   return (
// //     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
// //       <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
// //       <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
// //     </svg>
// //   );
// // }

// // function CheckIcon() {
// //   return (
// //     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //       <polyline points="20 6 9 17 4 12" />
// //     </svg>
// //   );
// // }

// // /* ─── Section Header ─────────────────────────────────────────── */
// // function SectionHeader() {
// //   return (
// //     <div className="mb-8">
// //       <motion.span
// //         initial={{ opacity: 0, y: -10 }}
// //         whileInView={{ opacity: 1, y: 0 }}
// //         viewport={{ once: true }}
// //         transition={{ duration: 0.4 }}
// //         className="mb-2 inline-block rounded-full bg-[#7F626D]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#7F626D]"
// //       >
// //         Trending Now
// //       </motion.span>
// //       <motion.h2
// //         initial={{ opacity: 0, y: 10 }}
// //         whileInView={{ opacity: 1, y: 0 }}
// //         viewport={{ once: true }}
// //         transition={{ duration: 0.45, delay: 0.1 }}
// //         className="text-2xl font-bold text-gray-900 sm:text-3xl flex flex-col items-center text-center"
// //       >
// //         Popular Accessories
// //       </motion.h2>
// //       {/* <motion.p
// //         initial={{ opacity: 0 }}
// //         whileInView={{ opacity: 1 }}
// //         viewport={{ once: true }}
// //         transition={{ duration: 0.4, delay: 0.2 }}
// //         className="mt-2 max-w-md text-sm text-gray-500"
// //       >
// //         Hover or tap any card to explore details, specs &amp; B2B pricing
// //       </motion.p> */}
// //     </div>
// //   );
// // }

// // /* ─── Main Export ────────────────────────────────────────────── */
// // export default function Popular() {
// //   return (
// //     <section className="w-full px-4 py-12 sm:px-6 lg:px-8">
// //       <div className="">
// //         <SectionHeader />
// //         <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
// //           {accessoriesProducts.map((product, i) => (
// //             <ProductCard key={product.id} product={product} index={i} />
// //           ))}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }