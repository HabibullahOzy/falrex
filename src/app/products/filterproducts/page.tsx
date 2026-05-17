"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, ChevronLeft,
  ChevronRight, Star, Package, BadgeCheck,
  ArrowUpDown, RotateCcw, TrendingUp, Filter,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductImage { url: string; public_id: string; }
interface Variation    { color: string; size: string; sku: string; stock: string; }

interface Product {
  _id:               string;
  nameEng:           string;
  nameLocal:         string;
  brand:             string;
  modelNumber:       string;
  sku:               string;
  slug:              string;
  category:          string;
  subcategory:       string;
  subSubcategory:    string;
  hsCode:            string;
  price:             number;
  currency:          string;
  discount:          number;
  moq:               string;
  stock:             number;
  sampleAvailable:   string;
  supplierName:      string;
  countryOfOrigin:   string;
  supplierYears:     string;
  certifications:    string;
  factoryLocation:   string;
  productionCapacity:string;
  incoterms:         string;
  shippingMethod:    string;
  leadTime:          string;
  portOfLoading:     string;
  shippingNotes:     string;
  specifications:    Record<string, Record<string, string>>;
  packagingDetails:  string;
  sellingUnit:       string;
  grossWeight:       string;
  cartonSize:        string;
  variations:        Variation[];
  tags:              string[];
  shortDescription:  string;
  description:       string;
  images:            ProductImage[];
  video:             { url: string; public_id: string } | null;
  avgRating:         number;
  totalReviews:      number;
  createdAt:         string;
  updatedAt:         string;
}

interface Meta {
  subCategories:    string[];
  subSubCategories: string[];
  priceRange:       { min: number; max: number };
}

interface ApiResponse {
  success: boolean;
  total:   number;
  page:    number;
  pages:   number;
  data:    Product[];
  meta:    Meta;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getCurrencySymbol(currency: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  if (currency.includes("£")) return "£";
  return "৳";
}

function getDiscountedPrice(price: number, discount: number) {
  if (!price || !discount) return price;
  return Math.round(price * (1 - discount / 100));
}

function formatPrice(price: number, currency: string) {
  const sym = getCurrencySymbol(currency);
  return `${sym} ${price?.toLocaleString("en-BD")}`;
}

function stripCountryCode(str: string) {
  // "Bangladesh (BD)" → "BD"
  const match = str?.match(/\(([A-Z]{2,3})\)/);
  return match ? match[1] : str;
}

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "priceAsc",  label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
  { value: "popular",   label: "Most Popular" },
  { value: "nameAsc",   label: "Name A–Z" },
];

// ── Star row ───────────────────────────────────────────────────────────────
function Stars({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${
            s <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
      {count > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({count})</span>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="grid sm:grid-cols-[200px_1fr]">
        <div className="h-56 sm:h-full bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}
          </div>
          <div className="h-8 bg-gray-200 rounded-xl mt-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ── Product card ───────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const sym          = getCurrencySymbol(product.currency);
  const discounted   = getDiscountedPrice(product.price, product.discount);
  const imgUrl       = product.images?.[0]?.url || "";
  const countryCode  = stripCountryCode(product.countryOfOrigin);

  // First spec group for highlights
  const firstSpecGroup = Object.values(product.specifications || {})[0] || {};
  const highlights     = Object.entries(firstSpecGroup).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3) }}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="grid sm:grid-cols-[200px_1fr]">

        {/* Image */}
        <div className="relative h-56 sm:h-full bg-gray-100 overflow-hidden">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.nameEng}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-14 h-14 text-gray-300" />
            </div>
          )}

          {/* Category badge */}
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700
                           text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {product.subcategory || product.category}
          </span>

          {/* Verified badge */}
          {product.certifications && (
            <span className="absolute top-2 right-2 bg-gray-900 text-white
                             text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}

          {/* Discount */}
          {(product.discount || 0) > 0 && (
            <span className="absolute bottom-2 left-2 bg-red-500 text-white
                             text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}

          {/* Low stock */}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="absolute bottom-2 right-2 bg-amber-400 text-white
                             text-[10px] font-bold px-2 py-0.5 rounded-full">
              Low Stock
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between">
          <div>
            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-1.5 mb-2">
              <span className="text-[10px] text-gray-400 font-mono">{product.sku}</span>
              <span className="text-gray-300">·</span>
              <span className="text-[10px] text-gray-500">{product.brand}</span>
              <span className="text-gray-300">·</span>
              <span className="text-[10px] text-gray-500">{countryCode}</span>
              {product.subSubcategory && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                    {product.subSubcategory}
                  </span>
                </>
              )}
            </div>

            {/* Name */}
            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
              {product.nameEng}
            </h3>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            <div className="mt-2">
              <Stars rating={product.avgRating} count={product.totalReviews} />
            </div>

            {/* Quick info grid */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <MiniInfo label="MOQ"       value={`${product.moq} pcs`} />
              <MiniInfo label="Lead Time" value={product.leadTime || "On Request"} />
              <MiniInfo label="Supplier"  value={`${product.supplierYears}yr exp`} />
            </div>

            {/* Spec highlights */}
            {highlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {highlights.map(([key, value]) => (
                  <span key={key}
                    className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    <span className="font-semibold text-gray-800 capitalize">{key}:</span> {String(value)}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.tags.slice(0, 4).map((tag) => (
                  <span key={tag}
                    className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              {/* Price */}
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Wholesale price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(discounted, product.currency)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {product.sampleAvailable?.includes("Yes") ? "✓ Sample available" : "Sample on request"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button className="h-9 px-3 rounded-xl border border-gray-200 bg-white
                                   text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
                  Contact
                </button>
                <Link href={`/products/${product._id}`}
                  className="h-9 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold
                             hover:bg-gray-700 transition flex items-center justify-center">
                  View Details
                </Link>
              </div>
            </div>

            {/* Supplier row */}
            <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-wrap">
              <BadgeCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800 truncate">{product.supplierName}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-[10px] text-gray-500">{product.supplierYears}yr</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-[10px] text-gray-500">{product.factoryLocation}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-[10px] text-gray-500">{product.incoterms}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── Mini info box ──────────────────────────────────────────────────────────
function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-2.5 py-2">
      <p className="text-[9px] text-gray-400 font-medium">{label}</p>
      <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{value}</p>
    </div>
  );
}

// ── Stat box ───────────────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ── Checkbox filter group ──────────────────────────────────────────────────
function FilterGroup({
  title, items, selected, onToggle,
}: {
  title: string; items: string[];
  selected: string[]; onToggle: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  if (!items.length) return null;

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</h3>
        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {items.map((item) => (
            <label key={item}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg
                         text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
              <span className="pr-2 truncate text-xs">{item}</span>
              <input type="checkbox"
                checked={selected.includes(item)}
                onChange={() => onToggle(item)}
                className="h-3.5 w-3.5 accent-gray-900 flex-shrink-0"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Active filter chip ─────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-gray-900 text-white
                     px-2.5 py-1 rounded-full font-semibold">
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function ProductsFilterPage() {
  // Data state
  const [products,   setProducts]   = useState<Product[]>([]);
  const [meta,       setMeta]       = useState<Meta>({
    subCategories: [], subSubCategories: [], priceRange: { min: 0, max: 100000 },
  });
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);

  // Filter state
  const [search,           setSearch]           = useState("");
  const [sort,             setSort]             = useState("newest");
  const [page,             setPage]             = useState(1);
  const [selectedCats,     setSelectedCats]     = useState<string[]>([]);
  const [selectedSubCats,  setSelectedSubCats]  = useState<string[]>([]);
  const [selectedCountries,setSelectedCountries]= useState<string[]>([]);
  const [selectedBrands,   setSelectedBrands]   = useState<string[]>([]);
  const [minPrice,         setMinPrice]         = useState("");
  const [maxPrice,         setMaxPrice]         = useState("");
  const [pendingMin,       setPendingMin]       = useState("");
  const [pendingMax,       setPendingMax]       = useState("");
  const [inStockOnly,      setInStockOnly]      = useState(false);
  const [mobileFilter,     setMobileFilter]     = useState(false);

  // Derived filter options from loaded products
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allCountries,  setAllCountries]  = useState<string[]>([]);
  const [allBrands,     setAllBrands]     = useState<string[]>([]);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: "8",
        sort,
        ...(search        && { search }),
        ...(minPrice      && { minPrice }),
        ...(maxPrice      && { maxPrice }),
        ...(inStockOnly   && { inStock: "true" }),
        ...(selectedCats.length === 1     && { category:       selectedCats[0] }),
        ...(selectedSubCats.length === 1  && { subcategory:    selectedSubCats[0] }),
      });

      const res  = await fetch(`${API}/product/filter?${params}`);
      const json: ApiResponse = await res.json();

      if (!json.success) throw new Error("Failed to load products");

      setProducts(json.data);
      setTotal(json.total);
      setTotalPages(json.pages);
      setMeta(json.meta);

      // Build filter options from first full load
      if (page === 1 && !search && !selectedCats.length) {
        const cats      = [...new Set(json.data.map((p) => p.category))].filter(Boolean);
        const countries = [...new Set(json.data.map((p) => p.countryOfOrigin))].filter(Boolean);
        const brands    = [...new Set(json.data.map((p) => p.brand))].filter(Boolean);
        if (cats.length)      setAllCategories(cats);
        if (countries.length) setAllCountries(countries);
        if (brands.length)    setAllBrands(brands);
      }
    } catch (err) {
      console.error("fetchProducts error:", err);
    } finally { setLoading(false); }
  }, [page, sort, search, minPrice, maxPrice, inStockOnly, selectedCats, selectedSubCats]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Fetch all categories from category API for sidebar ────────────────────
  useEffect(() => {
    fetch(`${API}/category/landing`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.length) {
          setAllCategories(j.data.map((c: any) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const resetPage = () => setPage(1);

  const toggleFilter = (val: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
    set((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
    resetPage();
  };

  const resetAll = () => {
    setSearch(""); setSort("newest"); setPage(1);
    setSelectedCats([]); setSelectedSubCats([]);
    setSelectedCountries([]); setSelectedBrands([]);
    setMinPrice(""); setMaxPrice("");
    setPendingMin(""); setPendingMax(""); setInStockOnly(false);
  };

  const activeCount = [
    ...selectedCats, ...selectedSubCats, ...selectedCountries, ...selectedBrands,
    minPrice, maxPrice, inStockOnly ? "1" : "",
  ].filter(Boolean).length;

  // ── Filter sidebar content ────────────────────────────────────────────────
  const FilterContent = () => (
    <div className="space-y-1">

      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-800">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold
                             rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll}
            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterGroup
        title="Category"
        items={allCategories}
        selected={selectedCats}
        onToggle={(v) => toggleFilter(v, setSelectedCats)}
      />

      {/* Subcategories from meta */}
      {meta.subCategories.length > 0 && (
        <FilterGroup
          title="Subcategory"
          items={meta.subCategories}
          selected={selectedSubCats}
          onToggle={(v) => toggleFilter(v, setSelectedSubCats)}
        />
      )}

      {/* Brands */}
      <FilterGroup
        title="Brand"
        items={allBrands}
        selected={selectedBrands}
        onToggle={(v) => toggleFilter(v, setSelectedBrands)}
      />

      {/* Country */}
      <FilterGroup
        title="Origin Country"
        items={allCountries}
        selected={selectedCountries}
        onToggle={(v) => toggleFilter(v, setSelectedCountries)}
      />

      {/* Price range */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">
          Price Range
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Min</label>
            <input type="number" value={pendingMin}
              onChange={(e) => setPendingMin(e.target.value)}
              placeholder={String(meta.priceRange.min)}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none
                         focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Max</label>
            <input type="number" value={pendingMax}
              onChange={(e) => setPendingMax(e.target.value)}
              placeholder={String(meta.priceRange.max)}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none
                         focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
        <button
          onClick={() => { setMinPrice(pendingMin); setMaxPrice(pendingMax); resetPage(); }}
          className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold
                     hover:bg-gray-700 transition"
        >
          Apply Price
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

      {/* In stock toggle */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setInStockOnly(!inStockOnly); resetPage(); }}
            className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors cursor-pointer ${
              inStockOnly ? "bg-gray-900" : "bg-gray-200"
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow
                             transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-xs font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Global B2B Marketplace
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                Wholesale Product Catalog
              </h1>
              <p className="mt-1 text-sm text-gray-500 max-w-xl">
                Source verified products with MOQ, supplier history, lead time, and export-ready specifications.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total"   value={total} />
              <Stat label="Pages"   value={totalPages} />
              <Stat label="Showing" value={products.length} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Search name, brand, SKU, supplier..."
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm
                           outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
              />
              {search && (
                <button onClick={() => { setSearch(""); resetPage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); resetPage(); }}
                className="pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           outline-none appearance-none bg-white focus:ring-2 focus:ring-gray-300
                           min-w-[160px]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile filter */}
            <button
              onClick={() => setMobileFilter(true)}
              className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 border
                         border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white
                                 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Reset */}
            <button onClick={resetAll}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
                         rounded-xl text-sm font-semibold hover:bg-gray-50 transition text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {selectedCats.map((v) => (
                <Chip key={v} label={v} onRemove={() => toggleFilter(v, setSelectedCats)} />
              ))}
              {selectedSubCats.map((v) => (
                <Chip key={v} label={v} onRemove={() => toggleFilter(v, setSelectedSubCats)} />
              ))}
              {selectedCountries.map((v) => (
                <Chip key={v} label={stripCountryCode(v)} onRemove={() => toggleFilter(v, setSelectedCountries)} />
              ))}
              {selectedBrands.map((v) => (
                <Chip key={v} label={v} onRemove={() => toggleFilter(v, setSelectedBrands)} />
              ))}
              {(minPrice || maxPrice) && (
                <Chip
                  label={`৳${minPrice || 0}–${maxPrice || "∞"}`}
                  onRemove={() => { setMinPrice(""); setMaxPrice(""); setPendingMin(""); setPendingMax(""); resetPage(); }}
                />
              )}
              {inStockOnly && (
                <Chip label="In Stock" onRemove={() => { setInStockOnly(false); resetPage(); }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex gap-6">

        {/* Desktop sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block w-64 flex-shrink-0"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-[130px]">
            <FilterContent />
          </div>
        </motion.aside>

        {/* Products */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* Result count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2
                          bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-600">
              Showing <b className="text-gray-900">{products.length}</b> of{" "}
              <b className="text-gray-900">{total}</b> products
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
              <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">Trade Assurance</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">OEM/ODM</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">Fast RFQ</span>
            </div>
          </div>

          {/* Mobile sort */}
          <div className="flex sm:hidden">
            <select value={sort} onChange={(e) => { setSort(e.target.value); resetPage(); }}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                         outline-none appearance-none bg-white">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm
                            flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-14 h-14 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-600">No products found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
              <button onClick={resetAll}
                className="mt-5 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm
                           font-bold hover:bg-gray-700 transition">
                Clear All Filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <div className="space-y-4">
                {products.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                Page <b>{page}</b> of <b>{totalPages}</b> · <b>{total}</b> products
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center
                             justify-center hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1;
                  if (
                    pg === 1 || pg === totalPages ||
                    (pg >= page - 1 && pg <= page + 1)
                  ) {
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                          pg === page
                            ? "bg-gray-900 text-white shadow-md"
                            : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  if (pg === page - 2 || pg === page + 2) {
                    return <span key={pg} className="text-gray-400 text-sm">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center
                             justify-center hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {mobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileFilter(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl
                         shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <span className="font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                  {activeCount > 0 && (
                    <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold
                                     rounded-full flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </span>
                <button onClick={() => setMobileFilter(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterContent />
              </div>
              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => { resetAll(); setMobileFilter(false); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold
                             hover:bg-gray-50 transition text-gray-600">
                  Reset
                </button>
                <button onClick={() => setMobileFilter(false)}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold
                             hover:bg-gray-700 transition">
                  Show {total} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}