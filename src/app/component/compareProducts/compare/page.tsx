"use client";
import { useCompare } from "../../../context/CompareContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  X, GitCompare, Star, Package,
  Check, Minus, ChevronLeft,
  BadgeCheck, TrendingUp, ShoppingCart,
  Zap, Award, ExternalLink,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function getCurrencySymbol(currency: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  return "৳";
}

function getDiscountedPrice(price: number, discount: number) {
  if (!price) return 0;
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

function Stars({ rating = 0 }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${
          s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
        }`} />
      ))}
    </div>
  );
}

// ── COMPARE PAGE ───────────────────────────────────────────────────────────
export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nothing to Compare</h1>
          <p className="text-gray-500 text-sm mb-6">
            Add at least 2 products to start comparing side by side.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-600 text-white
                       rounded-xl font-bold hover:bg-purple-700 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  const products = compareList;
  const colCount = products.length;

  // ── Gather all spec keys across all products ────────────────────────────
  const allSpecGroups: Record<string, Set<string>> = {};
  products.forEach((p) => {
    Object.entries(p.specifications || {}).forEach(([groupKey, fields]) => {
      if (!allSpecGroups[groupKey]) allSpecGroups[groupKey] = new Set();
      Object.keys(fields || {}).forEach((fieldKey) => allSpecGroups[groupKey].add(fieldKey));
    });
  });

  // ── Grid cols ───────────────────────────────────────────────────────────
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[colCount] || "grid-cols-2";

  // ── Find best values for highlighting ──────────────────────────────────
  const bestPrice  = Math.min(...products.map((p) => getDiscountedPrice(p.price, p.discount)));
  const bestRating = Math.max(...products.map((p) => p.avgRating || 0));
  const bestStock  = Math.max(...products.map((p) => p.stock || 0));
  const lowestMoq  = Math.min(...products.map((p) => Number(p.moq) || Infinity));

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center
                           justify-center hover:bg-gray-50 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                  <GitCompare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Product Comparison</h1>
                  <p className="text-xs text-gray-400">
                    Comparing {products.length} products side by side
                  </p>
                </div>
              </div>
            </div>
            <button onClick={clearCompare}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200
                         rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ════════════════════════════════════
            PRODUCT HEADER CARDS
        ════════════════════════════════════ */}
        <div className={`grid ${gridCols} gap-4 mb-6`}>
          {products.map((product, idx) => {
            const sym      = getCurrencySymbol(product.currency);
            const discPrice = getDiscountedPrice(product.price, product.discount);
            const isBestPrice = discPrice === bestPrice;
            const img = product.images?.[0]?.url;

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden relative ${
                  isBestPrice ? "border-purple-400 ring-2 ring-purple-100" : "border-gray-200"
                }`}
              >
                {/* Best value badge */}
                {isBestPrice && products.length > 1 && (
                  <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white
                                  text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" /> Best Value
                  </div>
                )}

                {/* Remove */}
                <button
                  onClick={() => removeFromCompare(product._id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm
                             border border-gray-200 rounded-full flex items-center justify-center
                             hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Image */}
                <div className="h-44 bg-gray-50 overflow-hidden">
                  {img ? (
                    <img src={img} alt={product.nameEng}
                      className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5
                                     rounded-full font-semibold">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5
                                       rounded-full font-medium">
                        {product.subcategory}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                    {product.nameEng}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Stars rating={product.avgRating || 0} />
                    <span className="text-[10px] text-gray-400">
                      ({product.totalReviews || 0})
                    </span>
                    {(product.avgRating || 0) === bestRating && products.length > 1 && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5
                                       rounded-full font-bold">Top Rated</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <p className="text-xl font-bold text-gray-900">
                      {sym} {discPrice.toLocaleString()}
                    </p>
                    {product.discount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          {sym} {product.price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5
                                         rounded-full font-bold">
                          -{product.discount}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-2">
                    <Link href={`/products/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-600
                                 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition">
                      <ExternalLink className="w-3 h-3" /> View
                    </Link>
                    <button className="flex-1 flex items-center justify-center gap-1 py-2
                                       border border-gray-200 rounded-xl text-xs font-semibold
                                       hover:bg-gray-50 transition">
                      <ShoppingCart className="w-3 h-3" /> Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ════════════════════════════════════
            COMPARISON ROWS
        ════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Section: Key metrics ── */}
          <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Key Metrics" />

          <CompareRow
            label="Price (After Discount)"
            values={products.map((p) => {
              const sym  = getCurrencySymbol(p.currency);
              const disc = getDiscountedPrice(p.price, p.discount);
              const best = disc === bestPrice;
              return (
                <div key={p._id}>
                  <p className={`text-sm font-bold ${best ? "text-purple-600" : "text-gray-800"}`}>
                    {sym} {disc.toLocaleString()}
                  </p>
                  {best && products.length > 1 && (
                    <span className="text-[9px] text-purple-500 font-bold">✓ Lowest</span>
                  )}
                </div>
              );
            })}
          />

          <CompareRow
            label="Rating"
            values={products.map((p) => {
              const best = (p.avgRating || 0) === bestRating && bestRating > 0;
              return (
                <div key={p._id}>
                  <Stars rating={p.avgRating || 0} />
                  <p className={`text-xs mt-0.5 ${best ? "text-amber-600 font-bold" : "text-gray-500"}`}>
                    {p.avgRating?.toFixed(1) || "—"} ({p.totalReviews || 0} reviews)
                    {best && products.length > 1 && " ★"}
                  </p>
                </div>
              );
            })}
          />

          <CompareRow
            label="MOQ"
            values={products.map((p) => {
              const moqNum = Number(p.moq) || 0;
              const best   = moqNum === lowestMoq && lowestMoq < Infinity;
              return (
                <div key={p._id}>
                  <p className={`text-sm font-semibold ${best ? "text-green-600" : "text-gray-800"}`}>
                    {p.moq || "—"} pcs
                  </p>
                  {best && products.length > 1 && (
                    <span className="text-[9px] text-green-500 font-bold">✓ Lowest MOQ</span>
                  )}
                </div>
              );
            })}
          />

          <CompareRow
            label="Stock Available"
            values={products.map((p) => {
              const best = p.stock === bestStock && bestStock > 0;
              return (
                <div key={p._id}>
                  <p className={`text-sm font-semibold ${
                    p.stock === 0 ? "text-red-500"
                    : p.stock <= 10 ? "text-amber-500"
                    : best ? "text-green-600"
                    : "text-gray-800"
                  }`}>
                    {p.stock?.toLocaleString() || "0"} units
                  </p>
                  {p.stock === 0 && <p className="text-[9px] text-red-400">Out of stock</p>}
                  {(p.stock || 0) > 0 && (p.stock || 0) <= 10 && (
                    <p className="text-[9px] text-amber-500">Low stock</p>
                  )}
                </div>
              );
            })}
          />

          <CompareRow
            label="Sample Available"
            values={products.map((p) => (
              <BoolCell key={p._id}
                value={p.sampleAvailable?.includes("Yes")}
                trueLabel={p.sampleAvailable}
                falseLabel="Not available"
              />
            ))}
          />

          {/* ── Section: Supplier info ── */}
          <SectionHeader icon={<BadgeCheck className="w-4 h-4" />} title="Supplier Information" />

          <CompareRow
            label="Supplier Name"
            values={products.map((p) => (
              <p key={p._id} className="text-sm font-semibold text-gray-800 leading-snug">
                {p.supplierName || "—"}
              </p>
            ))}
          />

          <CompareRow
            label="Country of Origin"
            values={products.map((p) => (
              <p key={p._id} className="text-sm text-gray-700">{p.countryOfOrigin || "—"}</p>
            ))}
          />

          <CompareRow
            label="Certifications"
            values={products.map((p) => (
              <div key={p._id} className="flex flex-wrap gap-1">
                {p.certifications
                  ? p.certifications.split(",").map((c) => (
                      <span key={c.trim()}
                        className="text-[10px] bg-green-50 text-green-700 border border-green-100
                                   px-1.5 py-0.5 rounded-full font-medium">
                        {c.trim()}
                      </span>
                    ))
                  : <span className="text-xs text-gray-400">—</span>
                }
              </div>
            ))}
          />

          {/* ── Section: Shipping ── */}
          <SectionHeader icon={<Zap className="w-4 h-4" />} title="Shipping & Trade" />

          <CompareRow
            label="Incoterms"
            values={products.map((p) => (
              <span key={p._id}
                className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {p.incoterms || "—"}
              </span>
            ))}
          />

          <CompareRow
            label="Shipping Method"
            values={products.map((p) => (
              <p key={p._id} className="text-sm text-gray-700">{p.shippingMethod || "—"}</p>
            ))}
          />

          <CompareRow
            label="Lead Time"
            values={products.map((p) => (
              <p key={p._id} className="text-sm font-semibold text-gray-800">
                {p.leadTime ? `${p.leadTime} days` : "On Request"}
              </p>
            ))}
          />

          {/* ── Section: Specifications ── */}
          {Object.entries(allSpecGroups).map(([groupKey, fieldKeys]) => (
            <div key={groupKey}>
              <SectionHeader
                icon={<Package className="w-4 h-4" />}
                title={groupKey.charAt(0).toUpperCase() + groupKey.slice(1) + " Specs"}
                subtle
              />
              {Array.from(fieldKeys).map((fieldKey) => (
                <CompareRow
                  key={fieldKey}
                  label={fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  values={products.map((p) => {
                    const val = p.specifications?.[groupKey]?.[fieldKey];
                    return (
                      <p key={p._id} className={`text-sm ${val ? "text-gray-800" : "text-gray-300"}`}>
                        {val || "—"}
                      </p>
                    );
                  })}
                />
              ))}
            </div>
          ))}

          {/* ── Section: Tags ── */}
          {products.some((p) => (p as any).tags?.length > 0) && (
            <>
              <SectionHeader icon={<Award className="w-4 h-4" />} title="Tags" subtle />
              <CompareRow
                label="Tags"
                values={products.map((p) => (
                  <div key={p._id} className="flex flex-wrap gap-1">
                    {((p as any).tags || []).slice(0, 5).map((tag: string) => (
                      <span key={tag}
                        className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {!(p as any).tags?.length && (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                ))}
              />
            </>
          )}
        </div>

        {/* ── Add more button ── */}
        {compareList.length < 4 && (
          <div className="mt-4 text-center">
            <button onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed
                         border-gray-300 rounded-2xl text-sm font-semibold text-gray-500
                         hover:border-purple-400 hover:text-purple-600 transition">
              <GitCompare className="w-4 h-4" />
              Add another product ({4 - compareList.length} slot{4 - compareList.length > 1 ? "s" : ""} left)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({
  icon, title, subtle = false,
}: {
  icon: React.ReactNode; title: string; subtle?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-5 py-3 border-b border-gray-100 ${
      subtle ? "bg-gray-50" : "bg-gradient-to-r from-purple-50 to-indigo-50"
    }`}>
      <span className={subtle ? "text-gray-400" : "text-purple-600"}>{icon}</span>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${
        subtle ? "text-gray-500" : "text-purple-700"
      }`}>
        {title}
      </h3>
    </div>
  );
}

// ── Compare row ────────────────────────────────────────────────────────────
function CompareRow({
  label, values,
}: {
  label: string; values: React.ReactNode[];
}) {
  const colMap: Record<number, string> = {
    2: "grid-cols-[180px_1fr_1fr]",
    3: "grid-cols-[180px_1fr_1fr_1fr]",
    4: "grid-cols-[180px_1fr_1fr_1fr_1fr]",
  };
  const gridCls = colMap[values.length] || colMap[2];

  return (
    <div className={`grid ${gridCls} border-b border-gray-50 last:border-0
                     hover:bg-gray-50/50 transition-colors`}>
      {/* Label */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-r border-gray-100 flex items-start">
        <p className="text-xs font-semibold text-gray-500 leading-snug">{label}</p>
      </div>

      {/* Values */}
      {values.map((value, idx) => (
        <div key={idx}
          className={`px-4 py-3.5 flex items-start border-r border-gray-100 last:border-0 ${
            idx % 2 === 1 ? "bg-gray-50/30" : ""
          }`}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

// ── Bool cell ──────────────────────────────────────────────────────────────
function BoolCell({
  value, trueLabel, falseLabel,
}: {
  value: boolean; trueLabel?: string; falseLabel?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {value
        ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
        : <Minus className="w-4 h-4 text-gray-300 flex-shrink-0" />
      }
      <span className={`text-xs ${value ? "text-green-700 font-medium" : "text-gray-400"}`}>
        {value ? (trueLabel || "Yes") : (falseLabel || "No")}
      </span>
    </div>
  );
}