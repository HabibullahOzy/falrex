"use client";
import {
  useState, useEffect, useRef, useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, X, Camera, Loader2, TrendingUp,
  Tag, Package, Star, ChevronRight, Clock,
  Zap,
} from "lucide-react";
import { useDebounce } from "../../../../lib/useDebounce";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface SearchProduct {
  _id:         string;
  nameEng:     string;
  brand:       string;
  sku:         string;
  slug:        string;
  category:    string;
  subcategory: string;
  price:       number;
  currency:    string;
  discount:    number;
  images:      { url: string }[];
  avgRating:   number;
  totalReviews:number;
  supplierName:string;
  stock:       number;
  moq:         string;
}

interface SearchResponse {
  success:     boolean;
  total:       number;
  data:        SearchProduct[];
  suggestions: { categories: string[]; brands: string[] };
}

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

const MAX_HISTORY = 6;

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem("falrex_search_history") || "[]");
  } catch { return []; }
}

function addToHistory(term: string) {
  try {
    const h = getSearchHistory().filter((t) => t !== term);
    localStorage.setItem(
      "falrex_search_history",
      JSON.stringify([term, ...h].slice(0, MAX_HISTORY))
    );
  } catch {}
}

function clearHistory() {
  try { localStorage.removeItem("falrex_search_history"); } catch {}
}

export default function SearchBar() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [query,         setQuery]         = useState("");
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [results,       setResults]       = useState<SearchProduct[]>([]);
  const [suggestions,   setSuggestions]   = useState<{ categories: string[]; brands: string[] }>({
    categories: [], brands: [],
  });
  const [total,         setTotal]         = useState(0);
  const [trending,      setTrending]      = useState<SearchProduct[]>([]);
  const [trendLoading,  setTrendLoading]  = useState(false);
  const [history,       setHistory]       = useState<string[]>([]);
  const [previewImage,  setPreviewImage]  = useState<string | null>(null);
  const [imgSearching,  setImgSearching]  = useState(false);

  const inputRef     = useRef<HTMLInputElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const debouncedQ   = useDebounce(query, 300);

  // ── Fetch trending on mount ─────────────────────────────────────────────
  useEffect(() => {
    setTrendLoading(true);
    fetch(`${API}/product/trending?limit=6`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setTrending(j.data); })
      .catch(() => {})
      .finally(() => setTrendLoading(false));
  }, []);

  // ── Load history when dropdown opens ───────────────────────────────────
  useEffect(() => {
    if (open) setHistory(getSearchHistory());
  }, [open]);

  // ── Fetch search results ────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQ.trim()) {
      setResults([]); setSuggestions({ categories: [], brands: [] }); setTotal(0);
      return;
    }
    setLoading(true);
    fetch(`${API}/product/search?q=${encodeURIComponent(debouncedQ)}&limit=6`)
      .then((r) => r.json())
      .then((json: SearchResponse) => {
        if (json.success) {
          setResults(json.data);
          setSuggestions(json.suggestions);
          setTotal(json.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // ── Close on outside click ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Submit search ───────────────────────────────────────────────────────
  const handleSubmit = useCallback((q?: string) => {
    const term = (q || query).trim();
    if (!term) return;
    addToHistory(term);
    setOpen(false);
    router.push(`/products/filterproducts?search=${encodeURIComponent(term)}`);
  }, [query, router]);

  // ── Keyboard navigation ─────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  // ── Image search ────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setPreviewImage(dataUrl);
      setImgSearching(true);
      setOpen(true);
      setQuery("");

      try {
        // Client-side perceptual hash
        const hash = await getImageHash(dataUrl);

        // Fetch all product thumbnails and compare
        const res  = await fetch(`${API}/product/filter?limit=50&sort=newest`);
        const json = await res.json();

        if (json.success) {
          const matches: SearchProduct[] = [];
          for (const product of json.data) {
            const imgUrl = product.images?.[0]?.url;
            if (!imgUrl) continue;
            try {
              const productHash = await getImageHash(imgUrl);
              const dist        = hammingDistance(hash, productHash);
              if (dist <= 12) matches.push(product);
            } catch {}
          }
          setResults(matches);
          setTotal(matches.length);
        }
      } catch {}
      finally { setImgSearching(false); }
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreviewImage(null);
    setResults([]);
    setTotal(0);
  };

  const showDropdown   = open;
  const showResults    = results.length > 0;
  const showEmpty      = !query && !previewImage;
  const showNoResults  = (query || previewImage) && !loading && !imgSearching && results.length === 0;

  return (
    <div ref={dropdownRef} className="relative w-full">

      {/* ── Search input ── */}
      <div className={`flex items-center bg-white border-2 rounded-2xl px-3 py-2 gap-2
                        transition-all duration-200 ${
        open ? "border-purple-500 shadow-lg shadow-purple-100" : "border-gray-200 hover:border-gray-300"
      }`}>

        {/* Search icon */}
        <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${open ? "text-purple-500" : "text-gray-400"}`} />

        {/* Image preview */}
        {previewImage && (
          <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-2 py-1 flex-shrink-0">
            <img src={previewImage} alt="search" className="w-6 h-6 rounded object-cover" />
            <button onClick={clearPreview} className="text-gray-400 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={previewImage ? "Image search active..." : "Search products, brands, SKU..."}
          className="flex-1 bg-transparent outline-none text-sm text-gray-800
                     placeholder-gray-400 min-w-0"
        />

        {/* Loading spinner */}
        {(loading || imgSearching) && (
          <Loader2 className="w-4 h-4 text-purple-500 animate-spin flex-shrink-0" />
        )}

        {/* Clear */}
        {(query || previewImage) && !loading && !imgSearching && (
          <button
            onClick={() => { setQuery(""); clearPreview(); inputRef.current?.focus(); }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Image search upload */}
        <label className="flex-shrink-0 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
            previewImage ? "bg-purple-600" : "bg-purple-100 hover:bg-purple-200"
          }`}>
            <Camera className={`w-4 h-4 ${previewImage ? "text-white" : "text-purple-600"}`} />
          </div>
        </label>
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200
                        rounded-2xl shadow-2xl shadow-gray-200/80 z-50 overflow-hidden
                        max-h-[80vh] overflow-y-auto">

          {/* ── Image searching state ── */}
          {imgSearching && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Searching by image...</p>
              <p className="text-xs text-gray-400 mt-1">Comparing visual similarity</p>
            </div>
          )}

          {/* ── Results ── */}
          {!imgSearching && showResults && (
            <div>
              {/* Suggestions row */}
              {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                <div className="px-4 pt-3 pb-2 border-b border-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setQuery(cat);
                          router.push(`/products/filterproducts?category=${encodeURIComponent(cat)}`);
                          setOpen(false);
                        }}
                        className="flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700
                                   border border-purple-100 px-2.5 py-1 rounded-full font-semibold
                                   hover:bg-purple-100 transition"
                      >
                        <Tag className="w-3 h-3" /> {cat}
                      </button>
                    ))}
                    {suggestions.brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setQuery(brand);
                          handleSubmit(brand);
                        }}
                        className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700
                                   border border-blue-100 px-2.5 py-1 rounded-full font-semibold
                                   hover:bg-blue-100 transition"
                      >
                        <Zap className="w-3 h-3" /> {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result count */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
                <p className="text-xs text-gray-400">
                  <b className="text-gray-700">{total}</b> products found
                </p>
                {total > 6 && (
                  <button
                    onClick={() => handleSubmit()}
                    className="text-xs text-purple-600 font-semibold hover:underline
                               flex items-center gap-1"
                  >
                    View all {total} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Product list */}
              <div className="py-1">
                {results.map((product) => (
                  <SearchResultItem
                    key={product._id}
                    product={product}
                    query={query}
                    onSelect={() => {
                      addToHistory(product.nameEng);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>

              {/* View all button */}
              {total > 0 && (
                <div className="px-4 py-3 border-t border-gray-50">
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full flex items-center justify-center gap-2 py-2.5
                               bg-purple-600 text-white rounded-xl text-sm font-bold
                               hover:bg-purple-700 transition"
                  >
                    <Search className="w-4 h-4" />
                    See all {total} results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── No results ── */}
          {!imgSearching && showNoResults && (
            <div className="py-10 text-center px-4">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">
                No products found for "{query || "uploaded image"}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try different keywords or browse by category
              </p>
              <Link
                href="/categories"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 mt-3 text-xs text-purple-600
                           font-semibold hover:underline"
              >
                Browse categories <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* ── Empty state: history + trending ── */}
          {showEmpty && !loading && (
            <div>

              {/* Search history */}
              {history.length > 0 && (
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                                  flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </p>
                    <button
                      onClick={() => { clearHistory(); setHistory([]); }}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((term) => (
                      <button
                        key={term}
                        onClick={() => { setQuery(term); handleSubmit(term); }}
                        className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600
                                   px-2.5 py-1 rounded-full hover:bg-gray-200 transition font-medium"
                      >
                        <Clock className="w-2.5 h-2.5" /> {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div className={`px-4 ${history.length > 0 ? "pt-2" : "pt-4"} pb-3`}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                              flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3 h-3" /> Trending Products
                </p>

                {trendLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {trending.map((product) => (
                      <TrendingItem
                        key={product._id}
                        product={product}
                        onSelect={() => setOpen(false)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Quick category shortcuts */}
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Quick Browse
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Consumer Electronics", "Jewellery & Accessories",
                    "Fashion & Apparel", "Home & Kitchen",
                    "Health & Medical", "Automotive",
                  ].map((cat) => (
                    <Link
                      key={cat}
                      href={`/products/filterproducts?category=${encodeURIComponent(cat)}`}
                      onClick={() => setOpen(false)}
                      className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600
                                 px-2.5 py-1.5 rounded-full hover:border-purple-300
                                 hover:text-purple-600 transition font-medium"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Search result item ─────────────────────────────────────────────────────
function SearchResultItem({
  product, query, onSelect,
}: {
  product: SearchProduct; query: string; onSelect: () => void;
}) {
  const sym      = getCurrencySymbol(product.currency);
  const discPrice = getDiscountedPrice(product.price, product.discount);
  const img      = product.images?.[0]?.url;

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
            : part
        )}
      </>
    );
  };

  return (
    <Link
      href={`/products/${product._id}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group"
    >
      {/* Image */}
      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {img ? (
          <img src={img} alt={product.nameEng}
            className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {highlight(product.nameEng)}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400">{product.brand}</span>
          {product.category && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5
                               rounded-full font-medium">
                {product.category}
              </span>
            </>
          )}
          {product.avgRating > 0 && (
            <>
              <span className="text-gray-200">·</span>
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {product.avgRating.toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">
          {sym} {discPrice.toLocaleString()}
        </p>
        {(product.discount || 0) > 0 && (
          <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
            -{product.discount}%
          </span>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-purple-500 transition" />
    </Link>
  );
}

// ── Trending item ──────────────────────────────────────────────────────────
function TrendingItem({
  product, onSelect,
}: {
  product: SearchProduct; onSelect: () => void;
}) {
  const sym      = getCurrencySymbol(product.currency);
  const discPrice = getDiscountedPrice(product.price, product.discount);
  const img      = product.images?.[0]?.url;

  return (
    <Link
      href={`/products/${product._id}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition group"
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {img ? (
          <img src={img} alt={product.nameEng}
            className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{product.nameEng}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-gray-500">
            {product.avgRating?.toFixed(1) || "—"}
            {product.totalReviews > 0 && ` (${product.totalReviews})`}
          </span>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-800 flex-shrink-0">
        {sym} {discPrice.toLocaleString()}
      </p>
    </Link>
  );
}

// ── Perceptual hash helpers ────────────────────────────────────────────────
async function getImageHash(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img      = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src        = src;
    img.onload     = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8; canvas.height = 8;
      const ctx    = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 8, 8);
      const data   = ctx.getImageData(0, 0, 8, 8).data;
      const grays  = Array.from({ length: 64 }, (_, i) =>
        (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3
      );
      const avg    = grays.reduce((a, b) => a + b, 0) / grays.length;
      resolve(grays.map((v) => (v > avg ? "1" : "0")).join(""));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
  });
}

function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 64;
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++;
  }
  return dist;
}