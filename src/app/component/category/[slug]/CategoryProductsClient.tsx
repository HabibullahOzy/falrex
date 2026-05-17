"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, X, SlidersHorizontal, ChevronRight,
  Star, Package, ArrowUpDown, Filter,
  ChevronLeft, Grid3x3, List,
  Check, Zap, MapPin, Tag,
} from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface SubSubItem   { name: string; slug: string; }
interface SubCategory  { _id: string; name: string; slug: string; subSubItems: SubSubItem[]; }
interface CategoryData {
  _id: string; name: string; slug: string; description: string;
  image: { url: string; public_id: string };
  subCategories: SubCategory[];
  order: number;
}

interface Product {
  _id: string; nameEng: string; brand?: string;
  price?: number; currency?: string; discount?: number;
  moq?: string; stock?: number; category?: string;
  subcategory?: string; subSubcategory?: string;
  images?: { url: string }[]; supplierName?: string;
  countryOfOrigin?: string; avgRating?: number;
  totalReviews?: number; tags?: string[];
  shortDescription?: string; createdAt?: string;
}

interface Meta {
  subCategories:    string[];
  subSubCategories: string[];
  priceRange:       { min: number; max: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function sym(currency?: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  return "৳";
}

function discountedPrice(price?: number, discount?: number) {
  if (!price || !discount) return null;
  return Math.round(price * (1 - discount / 100));
}

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest" },
  { value: "priceAsc",  label: "Price ↑" },
  { value: "priceDesc", label: "Price ↓" },
  { value: "popular",   label: "Popular" },
  { value: "nameAsc",   label: "A–Z" },
];

// ── Star rating ────────────────────────────────────────────────────────────
function Stars({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
      {count > 0 && <span className="text-[10px] text-gray-400">({count})</span>}
    </div>
  );
}

// ── Product Grid Card ──────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const s    = sym(product.currency);
  const disc = discountedPrice(product.price, product.discount);
  const img  = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-40 sm:h-48 bg-gray-50 overflow-hidden">
        {img ? (
          <Image width={10} height={10} src={img} alt={product.nameEng}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(product.discount || 0) > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-bold bg-gray-500 text-white px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
          {(product.stock || 0) > 0 && (product.stock || 0) <= 5 && (
            <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
              Low Stock
            </span>
          )}
        </div>
        {product.countryOfOrigin && (
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-white/80 backdrop-blur-sm text-gray-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <MapPin className="w-2 h-2" />
            {product.countryOfOrigin}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {product.supplierName && (
          <p className="text-[10px] text-orange-500 font-semibold truncate">{product.supplierName}</p>
        )}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.nameEng}
        </h3>
        {product.brand && <p className="text-[10px] text-gray-400">{product.brand}</p>}
        <Stars rating={product.avgRating} count={product.totalReviews} />
        {product.moq && <p className="text-[10px] text-gray-400">MOQ: {product.moq}</p>}
        <div className="flex flex-wrap gap-1">
          {product.subcategory && (
            <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
              {product.subcategory}
            </span>
          )}
          {product.subSubcategory && (
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
              {product.subSubcategory}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            {disc ? (
              <>
                <p className="text-sm font-bold text-gray-800">{s} {disc.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 line-through">{s} {product.price?.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-800">
                {product.price ? `${s} ${product.price.toLocaleString()}` : "Price on request"}
              </p>
            )}
          </div>
          <span className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded-lg font-semibold whitespace-nowrap group-hover:bg-purple-700 transition">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Product List Row ───────────────────────────────────────────────────────
function ProductRow({ product }: { product: Product }) {
  const s    = sym(product.currency);
  const disc = discountedPrice(product.price, product.discount);
  const img  = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`}
      className="group flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-3 sm:p-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {img
          ? <Image src={img} alt={product.nameEng} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-200" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        {product.supplierName && <p className="text-[10px] text-orange-500 font-semibold">{product.supplierName}</p>}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 mt-0.5">{product.nameEng}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Stars rating={product.avgRating} count={product.totalReviews} />
          {product.subcategory && (
            <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">{product.subcategory}</span>
          )}
          {product.subSubcategory && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{product.subSubcategory}</span>
          )}
        </div>
        {product.shortDescription && (
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{product.shortDescription}</p>
        )}
        {product.moq && <p className="text-[10px] text-gray-400 mt-0.5">MOQ: {product.moq}</p>}
      </div>
      <div className="text-right flex-shrink-0 flex flex-col justify-between">
        <div>
          {disc ? (
            <>
              <p className="text-sm font-bold text-gray-800">{s} {disc.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 line-through">{s} {product.price?.toLocaleString()}</p>
              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                -{product.discount}%
              </span>
            </>
          ) : (
            <p className="text-sm font-bold text-gray-800">
              {product.price ? `${s} ${product.price.toLocaleString()}` : "POA"}
            </p>
          )}
        </div>
        <span className="text-[10px] text-purple-600 font-semibold group-hover:underline mt-2">View →</span>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeletons({ view }: { view: "grid" | "list" }) {
  if (view === "list") return (
    <div className="space-y-3">
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-20 space-y-2">
            <div className="h-5 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({length: 8}).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-44 bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN CLIENT COMPONENT ──────────────────────────────────────────────────
export default function CategoryProductsClient({ category }: { category: CategoryData }) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  console.log(category)

  // ── FIX: Initialize state from URL search params ───────────────────────
  const [selectedSub,    setSelectedSub]    = useState(searchParams.get("sub")    ?? "");
  const [selectedSubSub, setSelectedSubSub] = useState(searchParams.get("subsub") ?? "");
  const [search,         setSearch]         = useState(searchParams.get("q")      ?? "");
  const [sort,           setSort]           = useState(searchParams.get("sort")   ?? "newest");
  const [minPrice,       setMinPrice]       = useState(searchParams.get("min")    ?? "");
  const [maxPrice,       setMaxPrice]       = useState(searchParams.get("max")    ?? "");
  const [inStock,        setInStock]        = useState(searchParams.get("stock")  === "1");
  const [page,           setPage]           = useState(Number(searchParams.get("p") ?? 1));
  const [viewMode,       setViewMode]       = useState<"grid" | "list">("grid");
  const [mobileFilter,   setMobileFilter]   = useState(false);
  const [bannerLoaded,   setBannerLoaded]   = useState(false);

  // Data state
  const [products,   setProducts]   = useState<Product[]>([]);
  const [meta,       setMeta]       = useState<Meta>({ subCategories: [], subSubCategories: [], priceRange: { min: 0, max: 100000 } });
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingMin, setPendingMin] = useState(minPrice);
  const [pendingMax, setPendingMax] = useState(maxPrice);

  const topRef = useRef<HTMLDivElement>(null);

  // ── Get sub-sub items for selected sub ────────────────────────────────────
  const activeSubCategory = category?.subCategories?.find(
    (s) => s.name === selectedSub || s.slug === selectedSub
  );

  // ── FIX: Sync URL — was completely commented out before ──────────────────
  useEffect(() => {
    const p = new URLSearchParams();
    if (selectedSub)         p.set("sub",    selectedSub);
    if (selectedSubSub)      p.set("subsub", selectedSubSub);
    if (search)              p.set("q",      search);
    if (sort !== "newest")   p.set("sort",   sort);
    if (minPrice)            p.set("min",    minPrice);
    if (maxPrice)            p.set("max",    maxPrice);
    if (inStock)             p.set("stock",  "1");
    if (page > 1)            p.set("p",      String(page));

    // FIX: use category.slug for the URL path (was broken before)
    router.replace(
      `/component/category/${category.slug}?${p.toString()}`,
      { scroll: false }
    );
  }, [selectedSub, selectedSubSub, search, sort, minPrice, maxPrice, inStock, page, category.slug, router]);

  // ── FIX: Fetch products — pass category.name (not slug) to the API ───────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        // FIX: API filter expects the category NAME, not the slug
        category: category.name,
        page:     String(page),
        limit:    "20",
        sort,
        ...(selectedSub    && { subcategory:    selectedSub }),
        ...(selectedSubSub && { subSubcategory: selectedSubSub }),
        ...(search         && { search }),
        ...(minPrice       && { minPrice }),
        ...(maxPrice       && { maxPrice }),
        ...(inStock        && { inStock: "true" }),
      });

      const res  = await fetch(`${API}/product/filter?${p.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setProducts(json.data);
      setTotal(json.total);
      setTotalPages(json.pages);
      setMeta(json.meta);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category.name, selectedSub, selectedSubSub, search, sort, minPrice, maxPrice, inStock, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetPage = () => setPage(1);

  const handleSubClick = (sub: string) => {
    setSelectedSub(sub === selectedSub ? "" : sub);
    setSelectedSubSub("");
    resetPage();
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSubSubClick = (s: string) => {
    setSelectedSubSub(s === selectedSubSub ? "" : s);
    resetPage();
  };

  const handlePriceApply = () => {
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    resetPage();
  };

  const resetAll = () => {
    setSelectedSub(""); setSelectedSubSub(""); setSearch("");
    setSort("newest"); setMinPrice(""); setMaxPrice("");
    setPendingMin(""); setPendingMax(""); setInStock(false); setPage(1);
  };

  const activeCount = [
    selectedSub,
    selectedSubSub,
    minPrice,
    maxPrice,
    inStock ? "1" : "",
  ].filter(Boolean).length;

  // ── Filter panel (shared desktop + mobile) ─────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-gray-800">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Subcategories */}
      {category?.subCategories?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subcategory</p>
          <div className="space-y-1">
            <button
              onClick={() => { setSelectedSub(""); setSelectedSubSub(""); resetPage(); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                !selectedSub ? "bg-purple-600 text-white" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {!selectedSub && <Check className="w-3 h-3" />}
              All {category.name}
            </button>
            {category.subCategories.map((sub) => (
              <button key={sub._id}
                onClick={() => handleSubClick(sub.name)}
                className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  selectedSub === sub.name ? "bg-purple-600 text-white" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="flex-1 truncate">{sub.name}</span>
                <span className={`text-[9px] flex-shrink-0 ${selectedSub === sub.name ? "text-white/70" : "text-gray-400"}`}>
                  {sub.subSubItems?.length || 0}
                </span>
                {selectedSub === sub.name && <Check className="w-3 h-3 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-subcategories from active subcategory */}
      {activeSubCategory && activeSubCategory.subSubItems.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedSubSub(""); resetPage(); }}
              className={`text-[11px] px-2.5 py-1.5 rounded-full border font-medium transition ${
                !selectedSubSub ? "bg-purple-600 border-purple-600 text-white" : "border-gray-200 text-gray-600 hover:border-purple-300"
              }`}
            >
              All
            </button>
            {activeSubCategory.subSubItems.map((item) => (
              <button key={item.name}
                onClick={() => handleSubSubClick(item.name)}
                className={`text-[11px] px-2.5 py-1.5 rounded-full border font-medium transition ${
                  selectedSubSub === item.name
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FIX: show meta sub-sub ONLY when no activeSubCategory (from DB meta) */}
      {!activeSubCategory && meta.subSubCategories.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedSubSub(""); resetPage(); }}
              className={`text-[11px] px-2.5 py-1.5 rounded-full border font-medium transition ${
                !selectedSubSub ? "bg-purple-600 border-purple-600 text-white" : "border-gray-200 text-gray-600 hover:border-purple-300"
              }`}
            >
              All
            </button>
            {meta.subSubCategories.map((s) => (
              <button key={s}
                onClick={() => handleSubSubClick(s)}
                className={`text-[11px] px-2.5 py-1.5 rounded-full border font-medium transition ${
                  selectedSubSub === s
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Price Range</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-1">Min</label>
            <input type="number" value={pendingMin}
              onChange={(e) => setPendingMin(e.target.value)}
              placeholder={`${meta.priceRange.min}`}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <span className="text-gray-300 mt-4">—</span>
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-1">Max</label>
            <input type="number" value={pendingMax}
              onChange={(e) => setPendingMax(e.target.value)}
              placeholder={`${meta.priceRange.max}`}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>
        <button onClick={handlePriceApply}
          className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition">
          Apply
        </button>
        {(minPrice || maxPrice) && (
          <button
            onClick={() => { setMinPrice(""); setMaxPrice(""); setPendingMin(""); setPendingMax(""); resetPage(); }}
            className="w-full text-xs text-red-400 hover:text-red-600 mt-1.5"
          >
            Clear price
          </button>
        )}
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setInStock(!inStock); resetPage(); }}
            className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors cursor-pointer ${inStock ? "bg-purple-600" : "bg-gray-200"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStock ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════ BANNER ════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 35vw, 420px)" }}>
        {category.image?.url ? (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage:    `url(${category.image.url})`,
                backgroundSize:     "cover",
                backgroundPosition: "center",
                filter:             "blur(20px) brightness(0.4)",
              }}
            />
            <Image
            width={10}
            height={10}
              src={category.image.url}
              alt={category.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${bannerLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setBannerLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-end px-4 md:px-8 pb-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3 flex-wrap">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categories" className="hover:text-white transition">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            {/* FIX: use category.slug in breadcrumb link */}
            <Link href={`/component/category/${category.slug}`} className="text-white font-medium hover:underline">
              {category.name}
            </Link>
            {selectedSub && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/80">{selectedSub}</span>
              </>
            )}
            {selectedSubSub && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/80">{selectedSubSub}</span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  <Tag className="w-3 h-3" />
                  {category?.subCategories?.length} Subcategories
                </span>
                {!loading && (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    <Package className="w-3 h-3" />
                    {total} Products
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ SUBCATEGORY TABS ════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {category?.subCategories?.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 border-b border-gray-100"
              style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => { setSelectedSub(""); setSelectedSubSub(""); resetPage(); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  !selectedSub ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {category.subCategories.map((sub) => (
                <button key={sub._id}
                  onClick={() => handleSubClick(sub.name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedSub === sub.name
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub.name}
                  {sub.subSubItems?.length > 0 && (
                    <span className={`ml-1.5 text-[9px] ${selectedSub === sub.name ? "text-white/70" : "text-gray-400"}`}>
                      ({sub.subSubItems.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Sub-subcategory chips */}
          {(activeSubCategory?.subSubItems.length || 0) > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2.5"
              style={{ scrollbarWidth: "none" }}>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex-shrink-0 mr-1">
                Type:
              </span>
              <button
                onClick={() => { setSelectedSubSub(""); resetPage(); }}
                className={`flex-shrink-0 text-[11px] px-3 py-1 rounded-full border font-medium transition ${
                  !selectedSubSub ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 text-gray-500 hover:border-indigo-300"
                }`}
              >
                All
              </button>
              {activeSubCategory!.subSubItems.map((item) => (
                <button key={item.name}
                  onClick={() => handleSubSubClick(item.name)}
                  className={`flex-shrink-0 text-[11px] px-3 py-1 rounded-full border font-medium transition whitespace-nowrap ${
                    selectedSubSub === item.name
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-200 text-gray-500 hover:border-indigo-300"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Search + Sort + View row */}
          <div className="flex items-center gap-2 py-3" ref={topRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder={`Search in ${selectedSub || category.name}...`}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition"
              />
              {search && (
                <button onClick={() => { setSearch(""); resetPage(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative hidden sm:block">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select value={sort} onChange={(e) => { setSort(e.target.value); resetPage(); }}
                className="pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none appearance-none bg-white focus:ring-2 focus:ring-purple-200 min-w-[130px]">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2 transition ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button onClick={() => setMobileFilter(true)}
              className="lg:hidden relative flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 transition">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Filter</span>
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
              {loading ? "…" : <b className="text-gray-700">{total}</b>} products
            </span>
          </div>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <div className="flex items-center gap-2 pb-3 flex-wrap">
              {selectedSub && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                  {selectedSub}
                  <button onClick={() => { setSelectedSub(""); setSelectedSubSub(""); resetPage(); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSubSub && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                  {selectedSubSub}
                  <button onClick={() => { setSelectedSubSub(""); resetPage(); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                  ৳{minPrice || 0}–{maxPrice || "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); setPendingMin(""); setPendingMax(""); resetPage(); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                  <Zap className="w-2.5 h-2.5" /> In Stock
                  <button onClick={() => { setInStock(false); resetPage(); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={resetAll} className="text-[11px] text-red-500 hover:text-red-700 font-semibold underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ════════ MAIN CONTENT ════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-[200px]">
            <FilterPanel />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Mobile sort + view */}
          <div className="flex sm:hidden items-center gap-2">
            <select value={sort} onChange={(e) => { setSort(e.target.value); resetPage(); }}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none appearance-none bg-white">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-400"}`}>
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{total} items</span>
          </div>

          {loading ? (
            <Skeletons view={viewMode} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-700">No products found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              <button onClick={resetAll}
                className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
                Reset Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => <ProductRow key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                Page <b>{page}</b> of <b>{totalPages}</b>
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1;
                  if (pg === 1 || pg === totalPages || (pg >= page - 1 && pg <= page + 1)) {
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                          pg === page ? "bg-purple-600 text-white shadow-md" : "border border-gray-200 hover:bg-gray-50"
                        }`}>
                        {pg}
                      </button>
                    );
                  }
                  if (pg === page - 2 || pg === page + 2)
                    return <span key={pg} className="text-gray-400">…</span>;
                  return null;
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilter && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileFilter(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <span className="font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" /> Filters
                {activeCount > 0 && (
                  <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </span>
              <button onClick={() => setMobileFilter(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterPanel />
            </div>
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { resetAll(); setMobileFilter(false); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition text-gray-600">
                Reset
              </button>
              <button onClick={() => setMobileFilter(false)}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition">
                Show {total} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}