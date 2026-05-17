"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search, X, SlidersHorizontal, ChevronDown,
  ChevronRight, Star, Package, RefreshCw,
  ArrowUpDown, Filter, ChevronLeft,
  ChevronUp, Tag, Zap, Check, Grid3x3, List,
} from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
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

interface FilterState {
  category:       string;
  subcategory:    string;
  subSubcategory: string;
  search:         string;
  minPrice:       string;
  maxPrice:       string;
  sort:           string;
  inStock:        boolean;
  page:           number;
}

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "priceAsc",  label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "popular",   label: "Most Popular" },
  { value: "nameAsc",   label: "Name A–Z" },
];

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

function getCurrencySymbol(c?: string) {
  if (!c) return "৳";
  if (c.includes("$")) return "$";
  if (c.includes("€")) return "€";
  return "৳";
}

// ── Star rating display ────────────────────────────────────────────────────
function StarRow({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      {count > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({count})</span>}
    </div>
  );
}

// ── Product card (grid) ────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const sym        = getCurrencySymbol(product.currency);
  const discounted = product.price && product.discount
    ? Math.round(product.price * (1 - product.discount / 100)) : null;
  const img = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">

      {/* Image */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {img ? (
          <Image src={img} alt={product.nameEng}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount && product.discount > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-bold bg-gray-400 text-white px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Country */}
        {product.countryOfOrigin && (
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-white/80 backdrop-blur-sm text-gray-700 px-1.5 py-0.5 rounded-full">
            {product.countryOfOrigin.slice(-4, -1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Supplier */}
        {product.supplierName && (
          <p className="text-[10px] text-orange-500 font-semibold truncate">{product.supplierName}</p>
        )}

        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.nameEng}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] text-gray-400">{product.brand}</p>
        )}

        {/* Rating */}
        <StarRow rating={product.avgRating} count={product.totalReviews} />

        {/* MOQ */}
        {product.moq && (
          <p className="text-[10px] text-gray-400">MOQ: {product.moq}</p>
        )}

        {/* Price */}
        <div className="mt-auto pt-1.5 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            {discounted ? (
              <>
                <p className="text-sm font-bold text-gray-800">{sym} {discounted.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 line-through">{sym} {product.price?.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-800">
                {product.price ? `${sym} ${product.price.toLocaleString()}` : "POA"}
              </p>
            )}
          </div>
          <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Product row (list view) ────────────────────────────────────────────────
function ProductRow({ product }: { product: Product }) {
  const sym        = getCurrencySymbol(product.currency);
  const discounted = product.price && product.discount
    ? Math.round(product.price * (1 - product.discount / 100)) : null;
  const img = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`}
      className="group flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-3 items-center">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {img
          ? <Image src={img} alt={product.nameEng} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-200" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-orange-500 font-semibold">{product.supplierName}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.nameEng}</h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <StarRow rating={product.avgRating} count={product.totalReviews} />
          {product.category && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          )}
          {product.subcategory && (
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              {product.subcategory}
            </span>
          )}
        </div>
        {product.shortDescription && (
          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{product.shortDescription}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {discounted ? (
          <>
            <p className="text-sm font-bold text-gray-800">{sym} {discounted.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 line-through">{sym} {product.price?.toLocaleString()}</p>
          </>
        ) : (
          <p className="text-sm font-bold text-gray-800">
            {product.price ? `${sym} ${product.price.toLocaleString()}` : "POA"}
          </p>
        )}
        {product.discount && product.discount > 0 && (
          <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
            -{product.discount}%
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-44 bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Filter sidebar ─────────────────────────────────────────────────────────
function FilterSidebar({
  filters, meta, categories, onFilterChange, onReset,
}: {
  filters:        FilterState;
  meta:           Meta;
  categories:     string[];
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onReset:        () => void;
}) {
  const [priceMin, setPriceMin] = useState(filters.minPrice);
  const [priceMax, setPriceMax] = useState(filters.maxPrice);
  const [openSections, setOpenSections] = useState({
    category: true, subcategory: true, subSubcategory: true,
    price: true, stock: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPrice = () => {
    onFilterChange("minPrice", priceMin);
    onFilterChange("maxPrice", priceMax);
  };

  const SectionHeader = ({ label, skey }: { label: string; skey: keyof typeof openSections }) => (
    <button
      onClick={() => toggleSection(skey)}
      className="w-full flex items-center justify-between py-3 text-xs font-bold text-gray-700 uppercase tracking-widest"
    >
      {label}
      {openSections[skey] ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );

  return (
    <div className="space-y-0 divide-y divide-gray-100">

      {/* Reset */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-gray-800">Filters</span>
        </div>
        <button onClick={onReset}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
          <X className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <SectionHeader label="Category" skey="category" />
        {openSections.category && (
          <div className="space-y-1 pb-3">
            <button
              onClick={() => { onFilterChange("category", ""); onFilterChange("subcategory", ""); onFilterChange("subSubcategory", ""); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                !filters.category ? "bg-purple-600 text-white" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {!filters.category && <Check className="w-3 h-3" />}
              All Categories
            </button>
            {categories.map((cat) => (
              <button key={cat}
                onClick={() => { onFilterChange("category", cat); onFilterChange("subcategory", ""); onFilterChange("subSubcategory", ""); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  filters.category === cat
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span>{CATEGORY_EMOJI[cat] || "📦"}</span>
                <span className="flex-1 truncate">{cat}</span>
                {filters.category === cat && <Check className="w-3 h-3 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subcategory */}
      {meta.subCategories.length > 0 && (
        <div>
          <SectionHeader label="Subcategory" skey="subcategory" />
          {openSections.subcategory && (
            <div className="space-y-1 pb-3 max-h-48 overflow-y-auto">
              <button
                onClick={() => { onFilterChange("subcategory", ""); onFilterChange("subSubcategory", ""); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                  !filters.subcategory ? "bg-purple-100 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                All Subcategories
              </button>
              {meta.subCategories.map((sub) => (
                <button key={sub}
                  onClick={() => { onFilterChange("subcategory", sub); onFilterChange("subSubcategory", ""); }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    filters.subcategory === sub
                      ? "bg-purple-100 text-purple-700 font-bold"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="flex-1 truncate">{sub}</span>
                  {filters.subcategory === sub && <Check className="w-3 h-3 flex-shrink-0 text-purple-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-subcategory */}
      {meta.subSubCategories.length > 0 && (
        <div>
          <SectionHeader label="Type" skey="subSubcategory" />
          {openSections.subSubcategory && (
            <div className="flex flex-wrap gap-1.5 pb-3">
              <button
                onClick={() => onFilterChange("subSubcategory", "")}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                  !filters.subSubcategory
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                All
              </button>
              {meta.subSubCategories.map((s) => (
                <button key={s}
                  onClick={() => onFilterChange("subSubcategory", s)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                    filters.subSubcategory === s
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price range */}
      <div>
        <SectionHeader label="Price Range" skey="price" />
        {openSections.price && (
          <div className="pb-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 mb-1 block">Min</label>
                <input
                  type="number" value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder={String(meta.priceRange.min)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <span className="text-gray-400 mt-4">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 mb-1 block">Max</label>
                <input
                  type="number" value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder={String(meta.priceRange.max)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
            <button onClick={applyPrice}
              className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition">
              Apply Price
            </button>
            {(filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => { onFilterChange("minPrice", ""); onFilterChange("maxPrice", ""); setPriceMin(""); setPriceMax(""); }}
                className="w-full text-xs text-red-500 hover:underline">
                Clear price filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* In stock */}
      <div className="py-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => onFilterChange("inStock", !filters.inStock)}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
              filters.inStock ? "bg-purple-600" : "bg-gray-200"
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              filters.inStock ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </div>
          <span className="text-xs font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────
function Breadcrumb({ category, subcategory, subSubcategory, onNavigate }: {
  category?: string; subcategory?: string; subSubcategory?: string;
  onNavigate: (level: "category" | "subcategory" | "root") => void;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
      <button onClick={() => onNavigate("root")} className="hover:text-purple-600 font-medium transition">
        All Products
      </button>
      {category && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <button onClick={() => onNavigate("category")}
            className={`font-medium transition ${!subcategory ? "text-gray-800" : "hover:text-purple-600"}`}>
            {CATEGORY_EMOJI[category] || "📦"} {category}
          </button>
        </>
      )}
      {subcategory && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <button onClick={() => onNavigate("subcategory")}
            className={`font-medium transition ${!subSubcategory ? "text-gray-800" : "hover:text-purple-600"}`}>
            {subcategory}
          </button>
        </>
      )}
      {subSubcategory && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="font-semibold text-gray-800">{subSubcategory}</span>
        </>
      )}
    </nav>
  );
}

// ── MAIN PRODUCTS PAGE ─────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [products,     setProducts]     = useState<Product[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ subCategories: [], subSubCategories: [], priceRange: { min: 0, max: 100000 } });
  const [allCategories,setAllCategories]= useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");
  const [mobileFilter, setMobileFilter] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Init filters from URL
  const [filters, setFilters] = useState<FilterState>({
    category:       searchParams.get("category")       || "",
    subcategory:    searchParams.get("subcategory")    || "",
    subSubcategory: searchParams.get("subSubcategory") || "",
    search:         searchParams.get("search")         || "",
    minPrice:       searchParams.get("minPrice")       || "",
    maxPrice:       searchParams.get("maxPrice")       || "",
    sort:           searchParams.get("sort")           || "newest",
    inStock:        searchParams.get("inStock") === "true",
    page:           Number(searchParams.get("page"))   || 1,
  });

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== false && v !== 0) params.set(k, String(v));
      });

      const res  = await fetch(`${API}/product/filter?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setProducts(json.data);
      setTotal(json.total);
      setTotalPages(json.pages);
      setMeta(json.meta);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Fetch all categories for sidebar ─────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/category/landing`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setAllCategories(j.data.map((c: any) => c.name));
      })
      .catch(() => {});
  }, []);

  // ── Sync filters → URL ────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v !== false && v !== 0) params.set(k, String(v));
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setFilters({
      category: "", subcategory: "", subSubcategory: "",
      search: "", minPrice: "", maxPrice: "",
      sort: "newest", inStock: false, page: 1,
    });
  };

  const handleBreadcrumb = (level: "root" | "category" | "subcategory") => {
    if (level === "root") {
      setFilters((prev) => ({ ...prev, category: "", subcategory: "", subSubcategory: "", page: 1 }));
    } else if (level === "category") {
      setFilters((prev) => ({ ...prev, subcategory: "", subSubcategory: "", page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, subSubcategory: "", page: 1 }));
    }
  };

  const activeFilterCount = [
    filters.category, filters.subcategory, filters.subSubcategory,
    filters.minPrice, filters.maxPrice, filters.inStock ? "stock" : "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50" ref={topRef}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">

          {/* Row 1: Search + view toggle */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search products, brands, tags..."
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition"
              />
              {filters.search && (
                <button onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-purple-200 min-w-[160px]"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* View mode */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2.5 transition ${viewMode === "grid" ? "bg-purple-600 text-white" : "hover:bg-gray-50 text-gray-500"}`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-2.5 transition ${viewMode === "list" ? "bg-purple-600 text-white" : "hover:bg-gray-50 text-gray-500"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: Breadcrumb + count */}
          <div className="flex items-center justify-between mt-2.5 gap-3 flex-wrap">
            <Breadcrumb
              category={filters.category}
              subcategory={filters.subcategory}
              subSubcategory={filters.subSubcategory}
              onNavigate={handleBreadcrumb}
            />
            <p className="text-xs text-gray-500 flex-shrink-0">
              {loading ? "Loading..." : <><b className="text-gray-800">{total}</b> products</>}
            </p>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {filters.category && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                  {CATEGORY_EMOJI[filters.category] || "📦"} {filters.category}
                  <button onClick={() => handleBreadcrumb("root")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.subcategory && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                  {filters.subcategory}
                  <button onClick={() => handleBreadcrumb("category")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.subSubcategory && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                  {filters.subSubcategory}
                  <button onClick={() => handleBreadcrumb("subcategory")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                  ৳{filters.minPrice || 0}–{filters.maxPrice || "∞"}
                  <button onClick={() => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                  <Zap className="w-3 h-3" /> In Stock
                  <button onClick={() => updateFilter("inStock", false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={resetFilters}
                className="text-[11px] text-red-500 hover:text-red-700 font-semibold underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex gap-6">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-[140px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <FilterSidebar
              filters={filters}
              meta={meta}
              categories={allCategories}
              onFilterChange={updateFilter}
              onReset={resetFilters}
            />
          </div>
        </aside>

        {/* ── Products area ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Mobile sort */}
          <div className="flex sm:hidden items-center gap-2">
            <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-400"}`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subcategory quick pills (desktop) */}
          {meta.subCategories.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subcategories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { updateFilter("subcategory", ""); updateFilter("subSubcategory", ""); }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                    !filters.subcategory ? "bg-purple-600 border-purple-600 text-white" : "border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
                  }`}
                >
                  All
                </button>
                {meta.subCategories.map((sub) => (
                  <button key={sub}
                    onClick={() => { updateFilter("subcategory", sub); updateFilter("subSubcategory", ""); }}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                      filters.subcategory === sub
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Sub-subcategory pills */}
              {meta.subSubCategories.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => updateFilter("subSubcategory", "")}
                      className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                        !filters.subSubcategory ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 text-gray-500 hover:border-indigo-300"
                      }`}
                    >
                      All Types
                    </button>
                    {meta.subSubCategories.map((s) => (
                      <button key={s}
                        onClick={() => updateFilter("subSubcategory", s)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                          filters.subSubcategory === s
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-200 text-gray-500 hover:border-indigo-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <SkeletonGrid />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
              <Package className="w-14 h-14 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-600">No products found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              <button onClick={resetFilters}
                className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
                Reset Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                Page <b>{filters.page}</b> of <b>{totalPages}</b> · <b>{total}</b> products
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateFilter("page", Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1;
                  if (pg === 1 || pg === totalPages || (pg >= filters.page - 1 && pg <= filters.page + 1)) {
                    return (
                      <button key={pg} onClick={() => updateFilter("page", pg)}
                        className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                          pg === filters.page ? "bg-purple-600 text-white shadow-md" : "border border-gray-200 hover:bg-gray-50"
                        }`}>
                        {pg}
                      </button>
                    );
                  }
                  if (pg === filters.page - 2 || pg === filters.page + 2) {
                    return <span key={pg} className="text-gray-400 text-sm">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => updateFilter("page", Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileFilter && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileFilter(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-gray-800">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button onClick={() => setMobileFilter(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-4">
              <FilterSidebar
                filters={filters}
                meta={meta}
                categories={allCategories}
                onFilterChange={(key, value) => { updateFilter(key, value); }}
                onReset={() => { resetFilters(); setMobileFilter(false); }}
              />
            </div>
            <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
              <button onClick={() => setMobileFilter(false)}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
                Show {total} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={className} />;
} 