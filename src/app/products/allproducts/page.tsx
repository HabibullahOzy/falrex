"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CartButtons from "../CartButtons";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface ProductImage {
  url: string;
  public_id: string;
  _id: string;
}

interface MongoProduct {
  _id: string;
  nameEng: string;
  brand?: string;
  price?: number;
  currency?: string;
  discount?: number;
  moq?: string;
  stock?: number;
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  supplierName?: string;
  countryOfOrigin?: string;
  supplierYears?: string;
  shortDescription?: string;
  description?: string;
  images?: ProductImage[];
  tags?: string[];
  variations?: { color: string; size: string; sku: string; stock: string }[];
  specifications?: Record<string, Record<string, string>>;
  slug?: string;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function getCurrencySymbol(currency?: string): string {
  if (!currency) return "৳";
  if (currency.includes("৳") || currency.includes("BDT")) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  if (currency.includes("£")) return "£";
  if (currency.includes("¥")) return "¥";
  if (currency.includes("₹")) return "₹";
  return "৳";
}

function getDiscountedPrice(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}

function getOriginShort(origin?: string): string {
  if (!origin) return "";
  const match = origin.match(/\((\w{2})\)/);
  return match ? match[1] : origin.slice(0, 2).toUpperCase();
}

const ORIGIN_FLAGS: Record<string, string> = {
  BD: "🇧🇩", CN: "🇨🇳", KR: "🇰🇷", JP: "🇯🇵",
  US: "🇺🇸", IN: "🇮🇳", DE: "🇩🇪", GB: "🇬🇧",
};

/* ═══════════════════════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white border border-neutral-100"
      style={{ height: "clamp(360px, 42vw, 430px)" }}
    >
      <div className="w-full bg-neutral-100 animate-pulse" style={{ height: "52%" }} />
      <div className="p-3 space-y-2.5">
        <div className="h-2 bg-neutral-100 rounded-full animate-pulse w-1/3" />
        <div className="h-3.5 bg-neutral-100 rounded-full animate-pulse" />
        <div className="h-3.5 bg-neutral-100 rounded-full animate-pulse w-4/5" />
        <div className="h-2.5 bg-neutral-100 rounded-full animate-pulse w-1/2" />
        <div className="h-2 bg-neutral-100 rounded-full animate-pulse w-2/3 mt-1" />
        <div className="h-8 bg-neutral-100 rounded-xl animate-pulse w-full mt-3" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT IMAGE FALLBACK
═══════════════════════════════════════════════════════════════ */
function ProductImg({ src, alt, brand }: { src?: string; alt: string; brand?: string }) {
  const [err, setErr] = useState(false);
  const letter = (brand ?? alt).charAt(0).toUpperCase();
  const hues: Record<string, number> = {
    A: 215, S: 220, X: 25, G: 142, J: 22, B: 258, C: 180, D: 280, E: 350,
  };
  const hue = hues[letter] ?? 258;
  const isDemo = !src || src.includes("/demo/") || src.includes("placeholder");

  if (err || isDemo) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2"
        style={{ background: `hsl(${hue},60%,96%)` }}
      >
        <div
          className="flex items-center justify-center rounded-full text-white font-black"
          style={{
            width: "clamp(44px,8vw,64px)",
            height: "clamp(44px,8vw,64px)",
            fontSize: "clamp(18px,3vw,26px)",
            background: `hsl(${hue},52%,54%)`,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {letter}
        </div>
        {brand && (
          <span
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: "clamp(8px,1.2vw,10px)", color: `hsl(${hue},52%,44%)` }}
          >
            {brand}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setErr(true)}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
      unoptimized
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLIP CARD
═══════════════════════════════════════════════════════════════ */
function FlipCard({ product, index }: { product: MongoProduct; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const symbol = getCurrencySymbol(product.currency);
  const originalPrice = product.price ?? 0;
  const discounted =
    product.discount && originalPrice
      ? getDiscountedPrice(originalPrice, product.discount)
      : null;
  const mainImage = product.images?.[0]?.url ?? null;
  const discountPct = product.discount ?? 0;
  const originCode = getOriginShort(product.countryOfOrigin);
  const flag = ORIGIN_FLAGS[originCode] ?? "🌐";
  const specEntries = Object.entries(product.specifications ?? {}).slice(0, 2);

  return (
    <motion.div
      className="relative w-full group cursor-pointer"
      style={{
        height: "clamp(360px, 42vw, 430px)",
        perspective: "1300px",
      }}
      onMouseEnter={() => !isMobile && setFlipped(true)}
      onMouseLeave={() => !isMobile && setFlipped(false)}
      onClick={() => isMobile && setFlipped((f) => !f)}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay: (index % 6) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ══ FRONT ══════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden bg-white"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* ── Image area ── */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ height: "52%" }}
          >
            <ProductImg src={mainImage ?? undefined} alt={product.nameEng} brand={product.brand} />

            {/* Gradient fade at bottom */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: "40%",
                background: "linear-gradient(to top, rgba(255,255,255,0.55), transparent)",
              }}
            />

            {/* Discount badge */}
            {discountPct > 0 && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-full text-white font-black"
                style={{
                  background: "linear-gradient(135deg,#e94560,#c0392b)",
                  boxShadow: "0 3px 10px rgba(233,69,96,0.35)",
                  fontSize: "clamp(8px,1.4vw,10px)",
                  padding: "2px 8px",
                }}
              >
                −{discountPct}%
              </motion.div>
            )}

            {/* Origin flag */}
            {originCode && (
              <div
                className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full font-bold"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(6px)",
                  fontSize: "clamp(8px,1.2vw,9px)",
                  padding: "2px 7px",
                  color: "#374151",
                }}
              >
                <span>{flag}</span>
                <span>{originCode}</span>
              </div>
            )}

            {/* Stock indicator */}
            {product.stock !== undefined && (
              <div
                className="absolute bottom-2 left-2 z-10 rounded-full font-semibold"
                style={{
                  background:
                    product.stock > 100
                      ? "rgba(34,197,94,0.15)"
                      : product.stock > 0
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color:
                    product.stock > 100
                      ? "#16a34a"
                      : product.stock > 0
                      ? "#d97706"
                      : "#dc2626",
                  fontSize: "clamp(7px,1.1vw,9px)",
                  padding: "2px 7px",
                  backdropFilter: "blur(4px)",
                }}
              >
                {product.stock > 100
                  ? "✓ In Stock"
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of Stock"}
              </div>
            )}

            {/* Mobile tap hint */}
            {isMobile && (
              <div
                className="absolute bottom-2 right-2 z-10 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(4px)",
                  color: "#fff",
                  fontSize: "8px",
                  padding: "2px 7px",
                }}
              >
                tap for details
              </div>
            )}
          </div>

          {/* ── Info area ── */}
          <div className="flex flex-col flex-1 px-3 pt-2 pb-3 gap-1 min-h-0">
            {/* Brand + supplier row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.brand && (
                <span
                  className="font-black uppercase rounded-full"
                  style={{
                    fontSize: "clamp(7px,1.1vw,9px)",
                    letterSpacing: "0.08em",
                    color: "#7c3aed",
                    background: "#ede9fe",
                    padding: "1px 6px",
                  }}
                >
                  {product.brand}
                </span>
              )}
              <span
                className="truncate"
                style={{ fontSize: "clamp(8px,1.2vw,10px)", color: "#9ca3af" }}
              >
                {product.supplierName}
              </span>
            </div>

            {/* Name */}
            <h2
              className="font-semibold leading-snug line-clamp-2 text-neutral-800"
              style={{
                fontSize: "clamp(11px,1.6vw,13px)",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              {product.nameEng}
            </h2>

            {/* Category + MOQ */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.subcategory && (
                <span style={{ fontSize: "clamp(8px,1.1vw,9px)", color: "#a78bfa", fontWeight: 600 }}>
                  {product.subcategory}
                </span>
              )}
              {product.moq && (
                <span style={{ fontSize: "clamp(8px,1.1vw,9px)", color: "#9ca3af" }}>
                  MOQ {product.moq}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
              {discounted != null ? (
                <>
                  <span
                    className="font-black"
                    style={{
                      fontSize: "clamp(14px,2.2vw,17px)",
                      color: "#ef4444",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {symbol}{discounted.toLocaleString()}
                  </span>
                  <span
                    className="line-through"
                    style={{ fontSize: "clamp(9px,1.3vw,11px)", color: "#d1d5db" }}
                  >
                    {symbol}{originalPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span
                  className="font-black text-neutral-800"
                  style={{
                    fontSize: "clamp(14px,2.2vw,17px)",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {symbol}{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {product.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full"
                    style={{
                      fontSize: "clamp(7px,1vw,9px)",
                      background: "#f1f5f9",
                      color: "#64748b",
                      padding: "1px 6px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/products/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-auto block"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl text-white font-bold tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  fontSize: "clamp(10px,1.4vw,12px)",
                  padding: "clamp(6px,1.2vw,9px) 0",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.28)",
                }}
              >
                Buy Now
              </motion.button>
            </Link>
          </div>
        </div>

        {/* ══ BACK ═══════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(155deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            padding: "clamp(12px,2vw,16px)",
          }}
        >
          {/* Subtle noise layer */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Supplier header */}
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0 font-bold"
              style={{
                width: "clamp(26px,4vw,32px)",
                height: "clamp(26px,4vw,32px)",
                fontSize: "clamp(12px,2vw,16px)",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              {flag}
            </div>
            <div className="min-w-0">
              <p
                className="text-white font-semibold leading-none truncate"
                style={{ fontSize: "clamp(9px,1.4vw,11px)" }}
              >
                {product.supplierName ?? "Supplier"}
              </p>
              <p
                className="leading-none mt-0.5 truncate"
                style={{ fontSize: "clamp(8px,1.1vw,9px)", color: "rgba(255,255,255,0.38)" }}
              >
                {product.supplierYears && `${product.supplierYears} yrs · `}
                {product.countryOfOrigin}
              </p>
            </div>
            {product.discount && product.discount > 0 && (
              <div
                className="ml-auto flex-shrink-0 rounded-lg text-center"
                style={{
                  background: "rgba(239,68,68,0.18)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  padding: "3px 8px",
                }}
              >
                <p
                  className="font-black text-red-400 leading-none"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(12px,2vw,16px)" }}
                >
                  −{product.discount}%
                </p>
              </div>
            )}
          </div>

          {/* Name */}
          <h2
            className="text-white font-bold leading-snug line-clamp-2 mb-1.5 relative z-10"
            style={{
              fontSize: "clamp(11px,1.6vw,13px)",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {product.nameEng}
          </h2>

          {/* Short description */}
          <p
            className="leading-relaxed line-clamp-2 mb-2 relative z-10"
            style={{ fontSize: "clamp(9px,1.3vw,11px)", color: "rgba(255,255,255,0.52)" }}
          >
            {product.shortDescription || product.description || "No description available."}
          </p>

          {/* Spec entries */}
          {specEntries.length > 0 && (
            <div className="space-y-1.5 mb-2 relative z-10 overflow-hidden">
              {specEntries.map(([cat, fields]) => (
                <div
                  key={cat}
                  className="rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "6px 10px",
                  }}
                >
                  <p
                    className="font-bold uppercase tracking-widest mb-0.5"
                    style={{ fontSize: "clamp(7px,1vw,8px)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {Object.entries(fields ?? {})
                      .filter(([, v]) => v)
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <span
                          key={k}
                          style={{ fontSize: "clamp(8px,1.2vw,10px)", color: "rgba(255,255,255,0.65)" }}
                        >
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>{k}: </span>
                          {v}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price row */}
          <div
            className="flex items-center justify-between rounded-xl mb-2 relative z-10"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.09)",
              padding: "6px 10px",
            }}
          >
            <div>
              {discounted != null ? (
                <>
                  <p
                    className="text-white font-black leading-none"
                    style={{
                      fontSize: "clamp(13px,2vw,16px)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {symbol}{discounted.toLocaleString()}
                  </p>
                  <p
                    className="line-through mt-0.5"
                    style={{ fontSize: "clamp(8px,1.1vw,10px)", color: "rgba(255,255,255,0.28)" }}
                  >
                    {symbol}{originalPrice.toLocaleString()}
                  </p>
                </>
              ) : (
                <p
                  className="text-white font-black leading-none"
                  style={{
                    fontSize: "clamp(13px,2vw,16px)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {symbol}{originalPrice.toLocaleString()}
                </p>
              )}
            </div>
            {product.moq && (
              <div className="text-right">
                <p
                  className="font-bold"
                  style={{ fontSize: "clamp(7px,1vw,9px)", color: "rgba(255,255,255,0.35)" }}
                >
                  MIN ORDER
                </p>
                <p
                  className="font-black text-white"
                  style={{ fontSize: "clamp(10px,1.5vw,12px)" }}
                >
                  {product.moq} pcs
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 mt-auto relative z-10">
            <Link
              href={`/products/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl text-white font-bold"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  fontSize: "clamp(10px,1.4vw,11px)",
                  padding: "clamp(6px,1.1vw,8px) 0",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                View Details →
              </motion.button>
            </Link>

            <CartButtons
              productId={product._id}
              quantity={1}
            />

            {isMobile && (
              <button
                className="font-medium underline underline-offset-2 text-center"
                style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="text-5xl mb-4 select-none"
      >
        📦
      </motion.div>
      <h3 className="font-bold text-neutral-600" style={{ fontSize: "clamp(14px,2vw,18px)" }}>
        No products found
      </h3>
      <p className="text-neutral-400 mt-1" style={{ fontSize: "clamp(11px,1.5vw,13px)" }}>
        Check back later or add products from the dashboard.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════════════════════ */
function Pagination({
  page, totalPages, setPage,
}: {
  page: number; totalPages: number; setPage: (p: number | ((prev: number) => number)) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).reduce<(number | "…")[]>(
    (acc, n, idx, arr) => {
      if (n === 1 || n === totalPages || Math.abs(n - page) <= 1) {
        if (acc.length && acc[acc.length - 1] !== "…" && (n - (acc[acc.length - 1] as number)) > 1)
          acc.push("…");
        acc.push(n);
      } else if (acc[acc.length - 1] !== "…") {
        acc.push("…");
      }
      return acc;
    }, []
  );

  const btnBase: React.CSSProperties = {
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        style={{
          ...btnBase,
          padding: "7px 14px",
          fontSize: "12px",
          color: page === 1 ? "#d1d5db" : "#374151",
          opacity: page === 1 ? 0.5 : 1,
          cursor: page === 1 ? "not-allowed" : "pointer",
        }}
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {pages.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="text-neutral-400 text-sm px-1">…</span>
        ) : (
          <button
            key={n}
            onClick={() => setPage(n as number)}
            style={{
              ...btnBase,
              width: "36px",
              height: "36px",
              fontSize: "13px",
              background: n === page ? "#7c3aed" : "#fff",
              borderColor: n === page ? "#7c3aed" : "#e5e7eb",
              color: n === page ? "#fff" : "#374151",
              boxShadow: n === page ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
            }}
          >
            {n}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        style={{
          ...btnBase,
          padding: "7px 14px",
          fontSize: "12px",
          color: page === totalPages ? "#d1d5db" : "#374151",
          opacity: page === totalPages ? 0.5 : 1,
          cursor: page === totalPages ? "not-allowed" : "pointer",
        }}
      >
        Next →
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LIMIT = 40;

export default function AllProducts() {
  const [products, setProducts] = useState<MongoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product?page=${page}&limit=${LIMIT}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load");

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

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .all-products-wrap { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>

      <section className="all-products-wrap min-h-full py-6 px-3 sm:px-4 md:px-6 lg:px-8">

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
              style={{
                background: "#fef2f2",
                borderColor: "#fecaca",
                color: "#dc2626",
              }}
            >
              <span className="text-lg flex-shrink-0">⚠️</span>
              <span className="flex-1 font-medium" style={{ fontSize: "clamp(11px,1.5vw,13px)" }}>
                {error}
              </span>
              <button
                onClick={() => setPage((p) => p)}
                className="underline underline-offset-2 font-bold flex-shrink-0"
                style={{ fontSize: "11px" }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Count bar ── */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-4 flex-wrap gap-2"
          >
            <p className="font-medium" style={{ fontSize: "clamp(11px,1.4vw,13px)", color: "#9ca3af" }}>
              Showing{" "}
              <strong className="text-neutral-700">{products.length}</strong> of{" "}
              <strong className="text-neutral-700">{total}</strong> products
            </p>
            <div
              className="rounded-full font-bold"
              style={{
                fontSize: "10px",
                background: "#ede9fe",
                color: "#7c3aed",
                padding: "3px 12px",
              }}
            >
              Page {page} of {totalPages || 1}
            </div>
          </motion.div>
        )}

        {/* ── Product Grid ── */}
        <div
          className="grid gap-3 sm:gap-4"
          style={{
            gridTemplateColumns:
              "repeat(2, minmax(0,1fr))",
          }}
        >
          {/* Responsive breakpoints via CSS */}
          <style>{`
            @media(min-width:640px){
              section .product-grid-inner{grid-template-columns:repeat(3,minmax(0,1fr))!important}
            }
            @media(min-width:1024px){
              section .product-grid-inner{grid-template-columns:repeat(4,minmax(0,1fr))!important}
            }
            @media(min-width:1280px){
              section .product-grid-inner{grid-template-columns:repeat(6,minmax(0,1fr))!important}
            }
          `}</style>
        </div>

        {/* Real grid (Tailwind classes for breakpoints) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: LIMIT > 12 ? 12 : LIMIT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : products.length === 0
            ? <EmptyState />
            : products.map((p, i) => (
                <FlipCard key={p._id} product={p} index={i} />
              ))}
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        )}
      </section>
    </>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import CartButtons from "../CartButtons";

// // ── Types ──────────────────────────────────────────────────────────────────
// interface ProductImage {
//   url: string;
//   public_id: string;
//   _id: string;
// }

// interface MongoProduct {
//   _id: string;
//   nameEng: string;
//   brand?: string;
//   price?: number;
//   currency?: string;
//   discount?: number;
//   moq?: string;
//   stock?: number;
//   category?: string;
//   subcategory?: string;
//   supplierName?: string;
//   countryOfOrigin?: string;
//   supplierYears?: string;
//   shortDescription?: string;
//   description?: string;
//   images?: ProductImage[];
//   tags?: string[];
//   variations?: { color: string; size: string; sku: string; stock: string }[];
//   specifications?: Record<string, Record<string, string>>;
//   slug?: string;
// }

// // ── Helpers ────────────────────────────────────────────────────────────────
// function getCurrencySymbol(currency?: string): string {
//   if (!currency) return "৳";
//   if (currency.includes("৳")) return "৳";
//   if (currency.includes("$")) return "$";
//   if (currency.includes("€")) return "€";
//   if (currency.includes("£")) return "£";
//   if (currency.includes("¥")) return "¥";
//   if (currency.includes("₹")) return "₹";
//   return "৳";
// }

// function getDiscountedPrice(price: number, discount: number): number {
//   return Math.round(price * (1 - discount / 100));
// }

// // ── Skeleton Card ──────────────────────────────────────────────────────────
// function SkeletonCard() {
//   return (
//     <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
//       <div className="w-full h-44 bg-gray-200" />
//       <div className="p-3 space-y-2">
//         <div className="h-3 bg-gray-200 rounded w-1/2" />
//         <div className="h-4 bg-gray-200 rounded w-full" />
//         <div className="h-4 bg-gray-200 rounded w-3/4" />
//         <div className="h-3 bg-gray-200 rounded w-1/3" />
//         <div className="h-8 bg-gray-200 rounded-xl w-full mt-2" />
//       </div>
//     </div>
//   );
// }

// // ── Flip Card ──────────────────────────────────────────────────────────────
// function FlipCard({ product, index }: { product: MongoProduct; index: number }) {
//   const [flipped, setFlipped] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   const symbol        = getCurrencySymbol(product.currency);
//   const originalPrice = product.price ?? 0;
//   const discounted    = product.discount && originalPrice
//     ? getDiscountedPrice(originalPrice, product.discount) : null;
//   const mainImage     = product.images?.[0]?.url ?? null;
//   const discountPct   = product.discount ?? 0;

//   const specEntries = Object.entries(product.specifications ?? {}).slice(0, 2);

//   const handleCardClick = () => {
//     if (isMobile) setFlipped((f) => !f);
//   };

//   return (
//     <motion.div
//       className="relative w-full h-[400px] sm:h-[420px] cursor-pointer"
//       style={{ perspective: "1200px" }}
//       onMouseEnter={() => !isMobile && setFlipped(true)}
//       onMouseLeave={() => !isMobile && setFlipped(false)}
//       onClick={handleCardClick}
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.5, delay: (index % 6) * 0.08, ease: [0.22, 1, 0.36, 1] }}
//     >
//       <motion.div
//         animate={{ rotateY: flipped ? 180 : 0 }}
//         transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
//         className="relative w-full h-full"
//         style={{ transformStyle: "preserve-3d" }}
//       >
//         {/* ── FRONT ── */}
//         <div
//           className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white"
//           style={{
//             backfaceVisibility: "hidden",
//             WebkitBackfaceVisibility: "hidden",
//             boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
//             border: "1px solid rgba(0,0,0,0.07)",
//           }}
//         >
//           {/* Image */}
//           <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gray-100 flex-shrink-0">
//             {mainImage ? (
//               <Image
//                 src={mainImage}
//                 alt={product.nameEng}
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
//                 unoptimized
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
//                 No Image
//               </div>
//             )}

//             {/* Discount badge */}
//             {discountPct > 0 && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ scale: { repeat: Infinity, repeatType: "mirror", duration: 1.8 } }}
//                 className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
//                 style={{
//                   background: "linear-gradient(135deg, #e94560, #c0392b)",
//                   boxShadow: "0 3px 10px rgba(233,69,96,0.4)",
//                 }}
//               >
//                 {discountPct}% OFF
//               </motion.div>
//             )}

//             {/* Country badge */}
//             {product.countryOfOrigin && (
//               <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
//                 {product.countryOfOrigin.slice(-4, -1)}
//               </div>
//             )}

//             {/* Mobile flip hint */}
//             {isMobile && (
//               <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded-full">
//                 Tap for details
//               </div>
//             )}
//           </div>

//           {/* Info */}
//           <div className="flex flex-col flex-1 px-3 pt-2 pb-3 gap-1">
//             {/* Supplier */}
//             <div className="flex items-center gap-1.5 flex-wrap">
//               {product.countryOfOrigin && (
//                 <span className="text-[9px] font-bold bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">
//                   {product.countryOfOrigin.slice(-4, -1)}
//                 </span>
//               )}
//               <span className="text-[10px] text-gray-400 truncate">
//                 {product.supplierName || "Supplier"}
//               </span>
//             </div>

//             {/* Name */}
//             <h2 className="text-black font-semibold text-[12px] sm:text-[13px] leading-snug line-clamp-2">
//               {product.nameEng}
//             </h2>

//             {/* MOQ */}
//             {product.moq && (
//               <p className="text-[10px] text-gray-400">MOQ: {product.moq} pcs</p>
//             )}

//             {/* Category */}
//             {product.category && (
//               <p className="text-[10px] text-purple-400 font-medium truncate">{product.category}</p>
//             )}

//             {/* Price */}
//             <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
//               {discounted ? (
//                 <>
//                   <span className="text-base sm:text-lg font-bold text-red-500">
//                     {symbol} {discounted.toLocaleString()}
//                   </span>
//                   <span className="text-xs text-gray-400 line-through">
//                     {symbol} {originalPrice.toLocaleString()}
//                   </span>
//                 </>
//               ) : (
//                 <span className="text-base sm:text-lg font-bold text-gray-700">
//                   {symbol} {originalPrice.toLocaleString()}
//                 </span>
//               )}
//             </div>

//             {/* Tags */}
//             {product.tags && product.tags.length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-0.5">
//                 {product.tags.slice(0, 2).map((tag, i) => (
//                   <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             )}

//             {/* Buy Now */}
//             <Link href={`/products/${product._id}`} onClick={(e) => e.stopPropagation()}>
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="mt-auto w-full py-2 rounded-xl text-white text-xs font-semibold"
//                 style={{ background: "#7149f5" }}
//               >
//                 Buy Now
//               </motion.button>
//             </Link>
//           </div>
//         </div>

//         {/* ── BACK ── */}
//         <div
//           className="absolute inset-0 rounded-2xl p-3 sm:p-4 flex flex-col justify-between bg-white"
//           style={{
//             backfaceVisibility: "hidden",
//             WebkitBackfaceVisibility: "hidden",
//             transform: "rotateY(180deg)",
//             boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
//             border: "1px solid rgba(0,0,0,0.07)",
//           }}
//         >
//           <div className="overflow-hidden">
//             <p
//               className="text-[10px] font-bold tracking-widest uppercase mb-1"
//               style={{
//                 background: "linear-gradient(135deg, #19827d, #7149f5)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               Overview
//             </p>

//             <h2 className="text-xs sm:text-sm font-bold leading-snug mb-1.5 line-clamp-2 text-gray-800">
//               {product.nameEng}
//             </h2>

//             {product.brand && (
//               <p className="text-[10px] text-gray-400 mb-1">Brand: <b>{product.brand}</b></p>
//             )}

//             <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
//               {product.shortDescription || product.description || "No description available."}
//             </p>

//             {/* Spec preview */}
//             {specEntries.length > 0 && (
//               <div className="mt-2 space-y-1.5">
//                 {specEntries.map(([cat, fields]) => (
//                   <div key={cat} className="bg-gray-50 rounded-lg px-2 py-1.5">
//                     <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
//                       {cat}
//                     </p>
//                     <div className="flex flex-wrap gap-x-2 gap-y-0.5">
//                       {Object.entries(fields)
//                         .filter(([, v]) => v)
//                         .slice(0, 3)
//                         .map(([k, v]) => (
//                           <span key={k} className="text-[10px] text-gray-600">
//                             <span className="text-gray-400">{k}: </span>{v}
//                           </span>
//                         ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-col gap-1.5 mt-2">
//             <Link href={`/products/${product._id}`} onClick={(e) => e.stopPropagation()}>
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="w-full py-2 rounded-xl text-white text-xs font-semibold"
//                 style={{ background: "#7149f5" }}
//               >
//                 View Details
//               </motion.button>
//             </Link>

//             <div className="flex gap-1.5">
//               {/* <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="flex-1 py-2 rounded-xl text-white text-xs font-semibold"
//                 style={{ background: "#19827d" }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 Add to Cart
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="flex-1 py-2 rounded-xl text-black text-xs font-semibold"
//                 style={{ background: "#73eef7" }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 Buy Now
//               </motion.button> */}


//               <CartButtons
//                             productId={product._id}
//                             // variation={selectedVariation}   // optional — from variation state
//                             quantity={1}
//                           />
//             </div>

//             {/* Mobile: tap to flip back */}
//             {isMobile && (
//               <button
//                 className="text-[10px] text-gray-400 text-center mt-1 underline"
//                 onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
//               >
//                 ← Back
//               </button>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ── Empty State ────────────────────────────────────────────────────────────
// function EmptyState() {
//   return (
//     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
//       <div className="text-5xl mb-4">📦</div>
//       <h3 className="text-lg font-bold text-gray-700">No products found</h3>
//       <p className="text-sm text-gray-400 mt-1">Check back later or add products from the dashboard.</p>
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────
// export default function AllProducts() {
//   const [products, setProducts] = useState<MongoProduct[]>([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState<string | null>(null);
//   const [page, setPage]         = useState(1);
//   const [total, setTotal]       = useState(0);
//   const limit = 40;

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/product?page=${page}&limit=${limit}`,
//           { cache: "no-store" }
//         );

//         console.log(res, process.env.NEXT_PUBLIC_API_URL)

//         if (!res.ok) throw new Error(`Server error: ${res.status}`);

//         const json = await res.json();

//         if (!json.success) throw new Error(json.message || "Failed to load");

//         setProducts(json.data);
//         setTotal(json.total ?? json.data.length);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [page]);

//   const totalPages = Math.ceil(total / limit);

//   return (
//     <section className="min-h-full py-6 px-3 sm:px-4 md:px-6">

//       {/* ── Error banner ── */}
//       {error && (
//         <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
//           <span className="text-lg">⚠️</span>
//           <span>{error}</span>
//           <button
//             onClick={() => setPage((p) => p)}
//             className="ml-auto text-xs underline font-semibold"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* ── Count ── */}
//       {!loading && !error && (
//         <p className="text-xs text-gray-400 mb-4">
//           Showing <b className="text-gray-600">{products.length}</b> of <b className="text-gray-600">{total}</b> products
//         </p>
//       )}

//       {/* ── Grid ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 text-black">
//         {loading
//           ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
//           : products.length === 0
//             ? <EmptyState />
//             : products.map((p, i) => <FlipCard key={p._id} product={p} index={i} />)
//         }
//       </div>

//       {/* ── Pagination ── */}
//       {!loading && totalPages > 1 && (
//         <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
//           >
//             ← Prev
//           </button>

//           {Array.from({ length: totalPages }).map((_, i) => {
//             const pg = i + 1;
//             // Show first, last, current ±1, and ellipsis
//             if (
//               pg === 1 || pg === totalPages ||
//               (pg >= page - 1 && pg <= page + 1)
//             ) {
//               return (
//                 <button
//                   key={pg}
//                   onClick={() => setPage(pg)}
//                   className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
//                     pg === page
//                       ? "bg-[#7149f5] text-white shadow-md"
//                       : "border border-gray-200 hover:bg-gray-50"
//                   }`}
//                 >
//                   {pg}
//                 </button>
//               );
//             }
//             if (pg === page - 2 || pg === page + 2) {
//               return <span key={pg} className="text-gray-400 text-sm">…</span>;
//             }
//             return null;
//           })}

//           <button
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
//           >
//             Next →
//           </button>
//         </div>
//       )}
//     </section>
//   );
// }



// // jsx

// // "use client";

// // import { useState } from "react";
// // import { motion } from "framer-motion";
// // import Image from "next/image";

// // import imgew from "../../assets/p&e.jpg";
// // import img2 from "../../assets/eae&e.jpg";
// // import img3 from "../../assets/p&e2.jpg";
// // import img4 from "../../assets/capb0.png";
// // import shirt from "../../assets/shirt.png";
// // import mouse from "../../assets/mouse.jpg";
// // import necles from "../../assets/goldhar.png";

// // function FlipCard({ product, index }) {
// //   const [flipped, setFlipped] = useState(false);

// //   const discount = product.offerPrice
// //     ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
// //     : null;

// //   return (
// //     <motion.div
// //       className="relative w-full max-w-xs h-[420px] cursor-pointer"
// //       style={{ perspective: "1200px" }}
// //       onMouseEnter={() => setFlipped(true)}
// //       onMouseLeave={() => setFlipped(false)}
// //       initial={{ opacity: 0, y: 40 }}
// //       whileInView={{ opacity: 1, y: 0 }}
// //       viewport={{ once: true }}
// //       transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
// //     >
// //       <motion.div
// //         animate={{ rotateY: flipped ? 180 : 0 }}
// //         transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
// //         className="relative w-full h-full"
// //         style={{ transformStyle: "preserve-3d" }}
// //       >
// //         <div
// //           className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col"
// //           style={{
// //             backfaceVisibility: "hidden",
// //             // background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
// //             boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
// //             border: "1px solid rgba(255,255,255,0.08)",
// //           }}
// //         >
// //           <div className="relative w-full h-52 overflow-hidden">
// //             <Image
// //               src={product.image}
// //               alt={product.title}
// //               width={400}
// //               height={400}
// //               className="w-full h-full transition-transform duration-700 group-hover:scale-105"
// //             />

// //             <div
// //               className="absolute inset-0"
// //               style={{
// //                 // background:
// //                 //   "linear-gradient(to bottom, rgba(0,0,0,0.05) 40%, rgba(15,30,60,0.85) 100%)",
// //               }}
// //             />

// //             {discount && (
// //               <motion.div
// //                 initial={{ scale: 0, rotate: -10 }}
// //                 animate={{ scale: [1, 1.08, 1], rotate: 0 }}
// //                 transition={{
// //                   scale: { repeat: Infinity, repeatType: "mirror", duration: 1.6 },
// //                   rotate: { duration: 0.4 },
// //                 }}
// //                 className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide"
// //                 style={{
// //                   background: "linear-gradient(135deg, #e94560, #c0392b)",
// //                   boxShadow: "0 4px 14px rgba(233,69,96,0.5)",
// //                   letterSpacing: "0.04em",
// //                 }}
// //               >
// //                 {discount}% OFF
// //               </motion.div>
// //             )}
// //           </div>

// //           <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
// //             <h2
// //               className="text-black font-semibold text-[15px] leading-snug line-clamp-2"
// //               // style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}
// //             >
// //               {product.title}
// //             </h2>

// //             <div className="flex items-baseline gap-2 mt-0.5">
// //               {product.offerPrice ? (
// //                 <>
// //                   <span
// //                     className="text-xl font-bold text-red-300"
// //                     style={{
                      
// //                       // WebkitBackgroundClip: "text",
// //                       // WebkitTextFillColor: "transparent",
// //                     }}
// //                   >
// //                     ${product.offerPrice}
// //                   </span>
// //                   <span className="text-sm text-gray-600 line-through">${product.price}</span>
// //                 </>
// //               ) : (
// //                 <span
// //                   className="text-xl font-bold text-gray-600"
// //                   // style={{ fontFamily: "'Outfit', sans-serif" }}
// //                 >
// //                   ${product.price}
// //                 </span>
// //               )}
// //             </div>

// //             <div
// //               className="w-full h-px mt-1"
// //               style={{
// //                 // background:
// //                 //   "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
// //               }}
// //             />

// //             <motion.button
// //               whileHover={{ scale: 1.03 }}
// //               whileTap={{ scale: 0.97 }}
// //               className="mt-auto w-full py-2.5 rounded-2xl text-white text-sm font-semibold tracking-wide transition-all"
// //               style={{
// //                 background: "#7149f5",
// //                 boxShadow: "0 4px 18px rgba(56,239,125,0.25)",
// //               }}
// //             >
// //               Buy Now
// //             </motion.button>
// //           </div>
// //         </div>

// //         <div
// //           className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between"
// //           style={{
// //             backfaceVisibility: "hidden",
// //             transform: "rotateY(180deg)",
// //             background: "#ffff",
// //             boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
// //             border: "1px solid rgba(255,255,255,0.1)",
// //           }}
// //         >
// //           <div
// //             className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
// //             style={{
// //               // background: "radial-gradient(circle, rgba(56,239,125,0.12) 0%, transparent 70%)",
// //               // filter: "blur(20px)",
// //             }}
// //           />

// //           <div className="relative z-10">
// //             <p
// //               className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
// //               style={{
// //                 background: "linear-gradient(135deg, #19827d, #f8dde5)",
// //                 WebkitBackgroundClip: "text",
// //                 WebkitTextFillColor: "transparent",
// //               }}
// //             >
// //               Overview
// //             </p>

// //             <h2
// //               className=" text-xl font-bold leading-tight mb-3"
// //               // style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
// //             >
// //               {product.title}
// //             </h2>

// //             <p
// //               className=" text-sm leading-relaxed line-clamp-4"
// //               // style={{ fontFamily: "'Outfit', sans-serif" }}
// //             >
// //               {product.description}
// //             </p>
// //           </div>

// //           <div className="relative z-10 flex flex-col gap-2.5 mt-4">
// //             <a href="/products/productdetails" className="block">
// //               <motion.button
// //                 whileHover={{ scale: 1.03 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 className="w-full py-2.5 rounded-2xl text-white text-sm font-semibold tracking-wide"
// //                 style={{
// //                   // fontFamily: "'Outfit', sans-serif",
// //                   background: "#7149f5",
// //                   // boxShadow: "0 4px 16px rgba(56,239,125,0.25)",
// //                 }}
// //               >
// //                 Learn More
// //               </motion.button>
// //             </a>

// //             <motion.button
// //               whileHover={{ scale: 1.03 }}
// //               whileTap={{ scale: 0.97 }}
// //               className="w-full py-2.5 rounded-2xl text-white text-sm font-semibold tracking-wide"
// //               style={{
// //                 background: "#7149f5",
// //                 boxShadow: "0 4px 16px rgba(79,172,254,0.25)",
// //               }}
// //             >
// //               Add to Cart
// //             </motion.button>

// //             <motion.button
// //               whileHover={{ scale: 1.03 }}
// //               whileTap={{ scale: 0.97 }}
// //               className="w-full py-2.5 rounded-2xl text-white text-sm font-semibold tracking-wide"
// //               style={{
// //                 background: "#7149f5",
// //                 boxShadow: "0 4px 16px rgba(161,140,209,0.25)",
// //               }}
// //             >
// //               Buy Now
// //             </motion.button>
// //           </div>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // export default function Allproducts() {
// //  const products = [
// //   {
// //     id: "B2B-HDP-005",
// //     name: "StudioPro Wireless Noise Cancelling Headphones - Bluetooth 5.3 High Fidelity",
// //     slug: "studiopro-wireless-noise-cancelling-headphones",
// //     price: "৳ 4,500",
// //     offerPrice: "৳ 3,800",
// //     moq: "5 pieces",
// //     supplier: {
// //       name: "Shafir Express LTD",
// //       yearsActive: "5 yrs",
// //       country: "CN",
// //       verified: true,
// //     },
// //     selectedColor: "Midnight Black",
// //     images: [img1.src, img2.src], // Replace with your actual imports
// //     videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
// //     description: "Experience acoustic perfection with Active Noise Cancellation (ANC). These headphones provide 40 hours of playtime and features memory foam ear cushions for long-duration studio sessions.",
// //     specifications: {
// //       audio: {
// //         driver: "40mm Neodymium",
// //         frequency: "20Hz - 40kHz (Hi-Res Audio)",
// //         noiseCancellation: "Hybrid ANC -35dB",
// //         microphones: "4-Mic Beamforming"
// //       },
// //       battery: {
// //         playtime: "40 hrs (ANC On)",
// //         fastCharge: "10 mins = 5 hrs playback",
// //         capacity: "750 mAh",
// //         interface: "USB-C"
// //       },
// //       business: {
// //         oemOdm: "Custom Logo Printing",
// //         warranty: "12 Months Replacement",
// //         leadTime: "10 Days"
// //       }
// //     }
// //   },
// //   {
// //     id: "B2B-SMW-006",
// //     name: "Ultra-Fit Series 9 Smartwatch - AMOLED Display with Blood Oxygen Monitor",
// //     slug: "ultra-fit-series-9-smartwatch-amoled",
// //     price: "৳ 2,500",
// //     offerPrice: "৳ 1,950",
// //     moq: "10 pieces",
// //     supplier: {
// //       name: "Shafir Express LTD",
// //       yearsActive: "5 yrs",
// //       country: "CN",
// //       verified: true,
// //     },
// //     selectedColor: "Titanium Grey",
// //     images: [img2.src, img4.src],
// //     videos: [],
// //     description: "The ultimate fitness companion. Features a 1.9-inch AMOLED display, heart rate tracking, Sleep Stages monitoring, and 100+ sport modes.",
// //     specifications: {
// //       display: {
// //         type: "AMOLED Always-On",
// //         size: "1.96 Inch",
// //         resolution: "410 x 502 Pixels",
// //         brightness: "600 Nits"
// //       },
// //       sensors: {
// //         health: "Heart Rate, SpO2, Sleep Monitor",
// //         motion: "3-Axis Accelerometer, Gyroscope",
// //         waterproof: "IP68 / 5ATM"
// //       },
// //       connectivity: {
// //         bluetooth: "v5.2 (Supports Calling)",
// //         app: "FitCloudPro / WearFit",
// //         compatibility: "iOS 10.0+ / Android 5.0+"
// //       },
// //       business: {
// //         packaging: "Retail Box Included",
// //         customization: "Custom UI Boot Logo",
// //         leadTime: "14 Days"
// //       }
// //     }
// //   },
// //   {
// //     id: "B2B-SPK-007",
// //     name: "BoomBox IPX7 Waterproof Portable Speaker - 20W Deep Bass Stereo",
// //     slug: "boombox-waterproof-portable-speaker-20w",
// //     price: "৳ 1,800",
// //     offerPrice: "৳ 1,500",
// //     moq: "15 pieces",
// //     supplier: {
// //       name: "Shafir Express LTD",
// //       yearsActive: "5 yrs",
// //       country: "CN",
// //       verified: true,
// //     },
// //     selectedColor: "Ocean Blue",
// //     images: [img.src, img2.src],
// //     videos: [],
// //     description: "Rugged outdoor speaker designed for the pool or beach. Features TWS pairing to connect two speakers for 40W surround sound.",
// //     specifications: {
// //       sound: {
// //         output: "20W (Double Bass Diaphragm)",
// //         twsMode: "Supported",
// //         signalNoise: "≥85dB"
// //       },
// //       protection: {
// //         rating: "IPX7 (Fully Waterproof)",
// //         material: "Silicone Rugged Armor",
// //         impact: "Drop-proof from 1.5m"
// //       },
// //       business: {
// //         moq: "500 for Color Customization",
// //         certifications: "CE, ROHS, FCC",
// //         leadTime: "7 Days"
// //       }
// //     }
// //   },
// //   {
// //     id: "B2B-JEW-008",
// //     name: "18K Gold Plated Luxury Necklace - Minimalist Pendant for Women",
// //     slug: "18k-gold-plated-luxury-necklace",
// //     price: "৳ 10,080",
// //     offerPrice: "৳ 8,500",
// //     moq: "3 pieces",
// //     supplier: {
// //       name: "Shafir Express LTD",
// //       yearsActive: "5 yrs",
// //       country: "CN",
// //       verified: true,
// //     },
// //     selectedColor: "Rose Gold",
// //     images: [necles.src], // Replace with your import
// //     videos: [],
// //     description: "Crafted from hypoallergenic 925 Sterling Silver and plated with 18K gold. A timeless piece of jewelry for daily wear or special occasions.",
// //     specifications: {
// //       material: {
// //         base: "925 Sterling Silver",
// //         plating: "18K Gold (3 Microns)",
// //         stones: "AAA Grade Cubic Zirconia"
// //       },
// //       size: {
// //         chainLength: "45cm + 5cm Adjustable",
// //         pendantSize: "12mm x 12mm",
// //         weight: "4.5g"
// //       },
// //       business: {
// //         packaging: "Velvet Pouch & Jewelry Box",
// //         certificate: "Authenticity Card Provided",
// //         oem: "Engraved Logo on Clasp"
// //       }
// //     }
// //   },
// //   {
// //     id: "B2B-OFF-009",
// //     name: "Ergonomic Mesh Office Chair - High Back with Lumbar Support",
// //     slug: "ergonomic-mesh-office-chair-high-back",
// //     price: "৳ 8,500",
// //     offerPrice: "৳ 7,200",
// //     moq: "10 pieces",
// //     supplier: {
// //       name: "Shafir Express LTD",
// //       yearsActive: "5 yrs",
// //       country: "CN",
// //       verified: true,
// //     },
// //     selectedColor: "Grey/White",
// //     images: [img4.src],
// //     videos: [],
// //     description: "Engineered for 8+ hours of comfort. High-breathability mesh keeps you cool, while the adjustable lumbar support prevents back strain.",
// //     specifications: {
// //       ergonomics: {
// //         backrest: "90° - 135° Recline",
// //         lumbar: "3D Adjustable",
// //         armrest: "Height Adjustable 2D"
// //       },
// //       materials: {
// //         mesh: "High-Density Elastic Mesh",
// //         base: "Heavy Duty Nylon Base",
// //         gasLift: "Class 4 SGS Certified"
// //       },
// //       business: {
// //         assembly: "Tools Included (15 Min Setup)",
// //         weightCapacity: "150kg / 330lbs",
// //         leadTime: "25 Days (Sea Freight Only)"
// //       }
// //     }
// //   }
// // ];

// //   return (
// //     <section
// //       className="min-h-screen py-4"
// //       // style={{
// //       //   background: "linear-gradient(160deg, #0d0d1a 0%, #12122a 50%, #0f1f3d 100%)",
// //       // }}
// //     >
// //       {/* <div className="text-center mb-12">
// //         <p
// //           className="text-xs font-semibold tracking-[0.25em] uppercase mb-2"
// //           style={{
// //             fontFamily: "'Outfit', sans-serif",
// //             background: "linear-gradient(135deg, #a8edea, #fed6e3)",
// //             WebkitBackgroundClip: "text",
// //             WebkitTextFillColor: "transparent",
// //           }}
// //         >
// //           Curated Collection
// //         </p>

// //         <h1
// //           className="text-4xl font-bold text-white"
// //           style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}
// //         >
// //           All Products
// //         </h1>

// //         <div
// //           className="mx-auto mt-3 h-0.5 w-16 rounded-full"
// //           style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)" }}
// //         />
// //       </div> */}

// //       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4  text-black">
// //         {products.map((p, i) => (
// //           <FlipCard key={i} product={p} index={i} />
// //         ))}
// //       </div>
// //     </section>
// //   );
// // }


// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";

// import imgew from "../../assets/p&e.jpg";
// import img2 from "../../assets/eae&e.jpg";
// import img3 from "../../assets/p&e2.jpg";
// import img4 from "../../assets/capb0.png";
// import shirt from "../../assets/shirt.png";
// import mouse from "../../assets/mouse.jpg";
// import crown from "../../assets/crown.png";
// import cap from "../../assets/cap.png";
// import necles from "../../assets/goldhar.png";
// import earring from "../../assets/learring.png";

// // ── Types ──────────────────────────────────────────────────────────────────
// interface Supplier {
//   name: string;
//   yearsActive: string;
//   country: string;
//   verified: boolean;
// }

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: string;
//   offerPrice?: string;
//   moq: string;
//   supplier: Supplier;
//   selectedColor: string;
//   images: string[];
//   videos: string[];
//   description: string;
//   specifications: Record<string, Record<string, string>>;
// }

// // ── Dataset ────────────────────────────────────────────────────────────────
// export const products: Product[] = [
//   {
//     id: "B2B-MK47-001",
//     name: "MK47 OEM/ODM Low Latency Gaming Earbuds - True Wireless Stereo TWS",
//     slug: "mk47-gaming-earbuds-low-latency-tws",
//     price: "৳ 700",
//     offerPrice: "৳ 550",
//     moq: "10 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Blue",
//     images: [imgew.src, img2.src],
//     videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
//     description:
//       "Engineered for competitive mobile gaming with ultra-low latency (under 30ms), JL6983D2 chipset, and multicolor RGB breathing lights for immersive gameplay.",
//     specifications: {
//       audio: { chipset: "JL6983D2", soundProfile: "HiFi Ultra-Bass", latency: "< 30 ms", frequencyResponse: "20Hz - 20kHz" },
//       battery: { earphoneCapacity: "30 mAh", chargingBox: "300 mAh", musicTime: "3-4 hrs", standby: "120 hrs" },
//       build: { waterproof: "IPX-4", light: "Multicolor RGB LED", model: "MK47" },
//       business: { oemOdm: "Available", customLogo: "MOQ 500+", leadTime: "7-15 Days" },
//     },
//   },
//   {
//     id: "B2B-HDP-002",
//     name: "StudioPro Wireless Noise Cancelling Headphones - Bluetooth 5.3 HiFi",
//     slug: "studiopro-wireless-noise-cancelling-headphones",
//     price: "৳ 4,500",
//     offerPrice: "৳ 3,800",
//     moq: "5 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Midnight Black",
//     images: [img2.src, img3.src],
//     videos: [],
//     description:
//       "Experience acoustic perfection with Active Noise Cancellation (-35dB). 40 hours of playtime and memory foam ear cushions for long studio sessions.",
//     specifications: {
//       audio: { driver: "40mm Neodymium", frequency: "20Hz - 40kHz", anc: "Hybrid ANC -35dB", mics: "4-Mic Beamforming" },
//       battery: { playtime: "40 hrs ANC On", fastCharge: "10 min = 5 hrs", capacity: "750 mAh", interface: "USB-C" },
//       business: { oemOdm: "Custom Logo Printing", warranty: "12 Months", leadTime: "10 Days" },
//     },
//   },
//   {
//     id: "B2B-SMW-003",
//     name: "Ultra-Fit Series 9 Smartwatch - AMOLED Display Blood Oxygen Monitor",
//     slug: "ultra-fit-series-9-smartwatch-amoled",
//     price: "৳ 2,500",
//     offerPrice: "৳ 1,950",
//     moq: "10 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Titanium Grey",
//     images: [crown.src, img2.src],
//     videos: [],
//     description:
//       "The ultimate fitness companion with 1.96-inch AMOLED display, heart rate tracking, Sleep Stages monitoring, and 100+ sport modes.",
//     specifications: {
//       display: { type: "AMOLED Always-On", size: "1.96 Inch", resolution: "410x502px", brightness: "600 Nits" },
//       sensors: { health: "HR, SpO2, Sleep", motion: "Accelerometer + Gyro", waterproof: "IP68 / 5ATM" },
//       connectivity: { bluetooth: "v5.2 Calling", app: "FitCloudPro", compatibility: "iOS 10+ / Android 5+" },
//       business: { packaging: "Retail Box", customization: "Custom Boot Logo", leadTime: "14 Days" },
//     },
//   },
//   {
//     id: "B2B-SPK-004",
//     name: "BoomBox IPX7 Waterproof Portable Speaker - 20W Deep Bass Stereo",
//     slug: "boombox-waterproof-portable-speaker-20w",
//     price: "৳ 1,800",
//     offerPrice: "৳ 1,500",
//     moq: "15 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Ocean Blue",
//     images: [imgew.src, img3.src],
//     videos: [],
//     description:
//       "Rugged outdoor speaker for pool or beach. TWS pairing connects two speakers for 40W surround sound. Fully waterproof rated IPX7.",
//     specifications: {
//       sound: { output: "20W Double Bass", twsMode: "Supported", signalNoise: "≥85dB" },
//       protection: { rating: "IPX7 Waterproof", material: "Silicone Rugged Armor", impact: "Drop-proof 1.5m" },
//       business: { moq: "500 for Custom Color", certifications: "CE, ROHS, FCC", leadTime: "7 Days" },
//     },
//   },
//   {
//     id: "B2B-JEW-005",
//     name: "18K Gold Plated Luxury Necklace - Minimalist Pendant for Women",
//     slug: "18k-gold-plated-luxury-necklace",
//     price: "৳ 10,080",
//     offerPrice: "৳ 8,500",
//     moq: "3 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Rose Gold",
//     images: [necles.src],
//     videos: [],
//     description:
//       "Crafted from hypoallergenic 925 Sterling Silver plated with 18K gold. Timeless minimalist pendant for daily wear or special occasions.",
//     specifications: {
//       material: { base: "925 Sterling Silver", plating: "18K Gold 3 Microns", stones: "AAA Cubic Zirconia" },
//       size: { chainLength: "45cm + 5cm", pendantSize: "12mm x 12mm", weight: "4.5g" },
//       business: { packaging: "Velvet Pouch + Box", certificate: "Authenticity Card", oem: "Engraved Logo on Clasp" },
//     },
//   },
//   {
//     id: "B2B-CHR-006",
//     name: "Ergonomic Mesh Office Chair - High Back Adjustable Lumbar Support",
//     slug: "ergonomic-mesh-office-chair-high-back",
//     price: "৳ 8,500",
//     offerPrice: "৳ 7,200",
//     moq: "10 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Grey/White",
//     images: [img4.src],
//     videos: [],
//     description:
//       "Engineered for 8+ hours of comfort. High-breathability mesh keeps you cool with 3D adjustable lumbar support preventing back strain.",
//     specifications: {
//       ergonomics: { backrest: "90°-135° Recline", lumbar: "3D Adjustable", armrest: "2D Height Adjustable" },
//       materials: { mesh: "High-Density Elastic", base: "Heavy Duty Nylon", gasLift: "Class 4 SGS Certified" },
//       business: { assembly: "Tools Included 15min", weightCapacity: "150kg / 330lbs", leadTime: "25 Days" },
//     },
//   },
//   {
//     id: "B2B-PHN-007",
//     name: "Gaming Mechanical Keyboard RGB - TKL Compact Hot-Swap Cherry MX",
//     slug: "gaming-mechanical-keyboard-rgb-tkl",
//     price: "৳ 3,200",
//     offerPrice: "৳ 2,600",
//     moq: "8 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Space Grey",
//     images: [mouse.src, img2.src],
//     videos: [],
//     description:
//       "TKL 87-key hot-swap mechanical keyboard with per-key RGB, N-key rollover, and PBT double-shot keycaps for the ultimate competitive gaming setup.",
//     specifications: {
//       keyboard: { layout: "TKL 87-Key", switches: "Hot-Swap (Cherry MX Compatible)", keycaps: "PBT Double-Shot" },
//       lighting: { rgb: "Per-Key RGB 16.8M Colors", effects: "20+ Preset Animations", software: "Custom Macro App" },
//       connectivity: { interface: "USB-C Detachable", nkro: "Full N-Key Rollover", polling: "1000Hz" },
//       business: { oemOdm: "Custom Layout Available", certifications: "CE, FCC, RoHS", leadTime: "12 Days" },
//     },
//   },
//   {
//     id: "B2B-MSE-008",
//     name: "ProGamer Wireless Mouse - 26000 DPI PAW3395 Optical Sensor",
//     slug: "progamer-wireless-mouse-26000dpi",
//     price: "৳ 2,900",
//     offerPrice: "৳ 2,400",
//     moq: "10 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Matte Black",
//     images: [img3.src, mouse.src],
//     videos: [],
//     description:
//       "Ultra-lightweight 59g wireless gaming mouse with PAW3395 sensor, 70-hour battery life, and 2.4GHz low-latency connection for esports professionals.",
//     specifications: {
//       sensor: { model: "PAW3395 Optical", dpi: "100 - 26000 DPI", ips: "650 IPS", acceleration: "50G" },
//       design: { weight: "59g Ultralight", material: "Honeycomb Shell", buttons: "6 Programmable" },
//       connectivity: { wireless: "2.4GHz USB Dongle", battery: "70 hrs per Charge", charging: "USB-C 1hr Fast" },
//       business: { packaging: "Retail Giftbox", customLogo: "Laser Engraving", leadTime: "10 Days" },
//     },
//   },
//   {
//     id: "B2B-SHT-009",
//     name: "Premium Cotton Oversized T-Shirt - Unisex Streetwear 280GSM",
//     slug: "premium-cotton-oversized-tshirt-280gsm",
//     price: "৳ 650",
//     offerPrice: "৳ 480",
//     moq: "50 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "BD", verified: true },
//     selectedColor: "Washed Black",
//     images: [shirt.src, img3.src],
//     videos: [],
//     description:
//       "Heavyweight 280GSM 100% ringspun cotton oversized fit. Pre-shrunk, enzyme-washed for a premium vintage feel. Perfect for screen printing or embroidery.",
//     specifications: {
//       fabric: { weight: "280GSM", composition: "100% Ringspun Cotton", finish: "Enzyme Washed" },
//       sizing: { fit: "Oversized Unisex", sizes: "XS to 4XL", shrinkage: "Pre-Shrunk < 3%" },
//       customization: { printing: "Screen Print / DTG / Embroidery", label: "Custom Woven Label", packaging: "Individual Poly Bag" },
//       business: { moq: "50 pcs per Color", sampleTime: "5-7 Days", leadTime: "15-20 Days" },
//     },
//   },
//   {
//     id: "B2B-LED-010",
//     name: "Smart LED Strip Lights - 5M WiFi RGBIC Music Sync Alexa Compatible",
//     slug: "smart-led-strip-lights-5m-wifi-rgbic",
//     price: "৳ 1,200",
//     offerPrice: "৳ 950",
//     moq: "20 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Multi-Color",
//     images: [cap.src, imgew.src],
//     videos: [],
//     description:
//       "RGBIC individually addressable LED strip with music sync mode, WiFi app control, and compatibility with Alexa and Google Home for smart home setups.",
//     specifications: {
//       lighting: { type: "RGBIC Individually Addressable", length: "5 Meters", ledCount: "300 LEDs / 5M", brightness: "1200 Lumens" },
//       smart: { connectivity: "WiFi 2.4GHz", app: "Smart Life / Tuya", voiceControl: "Alexa + Google Home" },
//       build: { voltage: "DC 12V", ip: "IP20 (Indoor)", adhesive: "3M Strong Tape" },
//       business: { certifications: "CE, RoHS, ETL", customLength: "Custom Cut Available", leadTime: "7-10 Days" },
//     },
//   },
//   {
//     id: "B2B-BAG-011",
//     name: "Anti-Theft Waterproof Laptop Backpack - 30L USB Charging Port",
//     slug: "anti-theft-waterproof-laptop-backpack-30l",
//     price: "৳ 2,100",
//     offerPrice: "৳ 1,750",
//     moq: "20 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Charcoal Grey",
//     images: [img4.src, img2.src],
//     videos: [],
//     description:
//       "Hidden zipper anti-theft backpack with USB charging port, TSA-friendly laptop compartment up to 17 inches, and waterproof 900D Oxford fabric.",
//     specifications: {
//       storage: { capacity: "30 Liters", laptopFit: "Up to 17 Inch", compartments: "5 Main Sections", pockets: "8 Total Pockets" },
//       material: { outer: "900D Oxford Waterproof", inner: "Polyester Lining", handle: "Reinforced Luggage Strap" },
//       features: { charging: "External USB-A Port", lock: "Hidden Anti-Theft Zipper", tsa: "TSA Approved Pass-Through" },
//       business: { branding: "Embroidery or Patch Logo", moq: "50 pcs Custom", leadTime: "14-18 Days" },
//     },
//   },
//   {
//     id: "B2B-PWR-012",
//     name: "65W GaN USB-C Power Bank - 20000mAh PD Fast Charge Slim",
//     slug: "65w-gan-usbc-power-bank-20000mah",
//     price: "৳ 3,500",
//     offerPrice: "৳ 2,900",
//     moq: "15 pieces",
//     supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
//     selectedColor: "Frost White",
//     images: [earring.src, img4.src],
//     videos: [],
//     description:
//       "Slim GaN 65W power bank with 20000mAh capacity. Simultaneously charge a laptop, phone, and earbuds with 3 outputs and intelligent power distribution.",
//     specifications: {
//       power: { capacity: "20000 mAh", maxOutput: "65W PD via USB-C", totalOutput: "90W (3 Ports Combined)", input: "45W USB-C PD" },
//       ports: { usbC1: "65W Power Delivery", usbC2: "18W Fast Charge", usbA: "22.5W Quick Charge 3.0" },
//       design: { thickness: "14.5mm Ultra-Slim", weight: "385g", display: "LED Digital % Indicator" },
//       business: { certifications: "CE, FCC, ROHS, UN38.3", customLogo: "Laser or Print", leadTime: "10-12 Days" },
//     },
//   },
// ];

// // ── Helpers ────────────────────────────────────────────────────────────────
// function parsePriceNumber(price: string): number {
//   return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
// }

// function calcDiscount(price: string, offerPrice: string): number {
//   const p = parsePriceNumber(price);
//   const o = parsePriceNumber(offerPrice);
//   return p > 0 ? Math.round(((p - o) / p) * 100) : 0;
// }

// // ── FlipCard ───────────────────────────────────────────────────────────────
// function FlipCard({ product, index }: { product: Product; index: number }) {
//   const [flipped, setFlipped] = useState(false);

//   const discount = product.offerPrice
//     ? calcDiscount(product.price, product.offerPrice)
//     : null;

//   const mainImage = product.images[0];

//   return (
//     <motion.div
//       className="relative w-full h-[400px] cursor-pointer"
//       style={{ perspective: "1200px" }}
//       onMouseEnter={() => setFlipped(true)}
//       onMouseLeave={() => setFlipped(false)}
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay: (index % 6) * 0.1, ease: [0.22, 1, 0.36, 1] }}
//     >
//       <motion.div
//         animate={{ rotateY: flipped ? 180 : 0 }}
//         transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//         className="relative w-full h-full"
//         style={{ transformStyle: "preserve-3d" }}
//       >
//         {/* ── Front face ── */}
//         <div
//           className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white"
//           style={{
//             backfaceVisibility: "hidden",
//             boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
//             border: "1px solid rgba(0,0,0,0.07)",
//           }}
//         >
//           {/* Image */}
//           <div className="relative w-full h-52 overflow-hidden bg-gray-100 flex-shrink-0">
//             {mainImage ? (
//               <Image
//                 src={mainImage}
//                 alt={product.name}
//                 fill
//                 className=""
//                 sizes="(max-width: 768px) 50vw, 25vw"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
//                 No Image
//               </div>
//             )}

//             {/* Discount badge */}
//             {discount && discount > 0 && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ scale: { repeat: Infinity, repeatType: "mirror", duration: 1.8 } }}
//                 className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
//                 style={{ background: "linear-gradient(135deg, #e94560, #c0392b)", boxShadow: "0 3px 10px rgba(233,69,96,0.45)" }}
//               >
//                 {discount}% OFF
//               </motion.div>
//             )}

//             {/* Verified badge */}
//             {product.supplier.verified && (
//               <div className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
//                 ✓ Verified
//               </div>
//             )}
//           </div>

//           {/* Info */}
//           <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1.5">
//             {/* Supplier + Country */}
//             <div className="flex items-center gap-1.5">
//               <span className="text-[9px] font-bold bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">
//                 {product.supplier.country}
//               </span>
//               <span className="text-[10px] text-gray-400 truncate">{product.supplier.name}</span>
//             </div>

//             {/* Name */}
//             <h2 className="text-black font-semibold text-[13px] leading-snug line-clamp-2">
//               {product.name}
//             </h2>

//             {/* MOQ */}
//             <p className="text-[10px] text-gray-400">MOQ: {product.moq}</p>

//             {/* Price */}
//             <div className="flex items-baseline gap-2 mt-0.5">
//               {product.offerPrice ? (
//                 <>
//                   <span className="text-lg font-bold text-red-500">{product.offerPrice}</span>
//                   <span className="text-xs text-gray-400 line-through">{product.price}</span>
//                 </>
//               ) : (
//                 <span className="text-lg font-bold text-gray-700">{product.price}</span>
//               )}
//             </div>

//             {/* Buy Now */}
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="mt-auto w-full py-2 rounded-xl text-white text-xs font-semibold"
//               style={{ background: "#7149f5" }}
//             >
//               Buy Now
//             </motion.button>
//           </div>
//         </div>

//         {/* ── Back face ── */}
//         <div
//           className="absolute inset-0 rounded-2xl p-4 flex flex-col justify-between bg-white"
//           style={{
//             backfaceVisibility: "hidden",
//             transform: "rotateY(180deg)",
//             boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
//             border: "1px solid rgba(0,0,0,0.07)",
//           }}
//         >
//           {/* Header */}
//           <div>
//             <p
//               className="text-[10px] font-bold tracking-widest uppercase mb-1"
//               style={{
//                 background: "linear-gradient(135deg, #19827d, #7149f5)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               Overview
//             </p>

//             <h2 className="text-sm font-bold leading-snug mb-2 line-clamp-2 text-gray-800">
//               {product.name}
//             </h2>

//             <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
//               {product.description}
//             </p>

//             {/* Top spec category preview */}
//             <div className="mt-3 space-y-1">
//               {Object.entries(product.specifications)
//                 .slice(0, 2)
//                 .map(([cat, fields]) => (
//                   <div key={cat} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
//                     <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
//                       {cat}
//                     </p>
//                     <div className="flex flex-wrap gap-x-3 gap-y-0.5">
//                       {Object.entries(fields)
//                         .slice(0, 3)
//                         .map(([k, v]) => (
//                           <span key={k} className="text-[10px] text-gray-600">
//                             <span className="text-gray-400">{k}: </span>
//                             {v}
//                           </span>
//                         ))}
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-col gap-2 mt-3">
//             <a href={`/products/${product.id}`} className="block">
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="w-full py-2 rounded-xl text-white text-xs font-semibold"
//                 style={{ background: "#7149f5" }}
//               >
//                 View Details
//               </motion.button>
//             </a>

//             <div className="flex gap-2">
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="flex-1 py-2 rounded-xl text-white text-xs font-semibold"
//                 style={{ background: "#19827d" }}
//               >
//                 Add to Cart
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="flex-1 py-2 rounded-xl text-black text-xs font-semibold"
//                 style={{ background: "#73eef7" }}
//               >
//                 Buy Now
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ── Page ───────────────────────────────────────────────────────────────────
// export default function AllProducts() {
//   return (
//     <section className="min-h-full py-6 px-4">
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 text-black">
//         {products.map((p, i) => (
//           <FlipCard key={p.id} product={p} index={i} />
//         ))}
//       </div>
//     </section>
//   );
// }