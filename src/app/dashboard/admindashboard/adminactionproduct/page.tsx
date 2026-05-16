"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2, Pencil, BarChart2, Search, ChevronDown,
  ChevronUp, RefreshCw, X, AlertTriangle, CheckCircle,
  Package, TrendingUp, DollarSign, Layers, Eye,
  Download, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
// import UpdateProduct from "../updateProduct/page";
import { Router } from "next/router";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductImage { url: string; public_id: string; _id: string; }

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
  shortDescription?: string;
  images?: ProductImage[];
  tags?: string[];
  variations?: { color: string; size: string; sku: string; stock: string }[];
  specifications?: Record<string, Record<string, string>>;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  sku?: string;
  sampleAvailable?: string;
  incoterms?: string;
  shippingMethod?: string;
}

interface Stats {
  total: number;
  totalValue: number;
  lowStock: number;
  categories: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getCurrencySymbol(currency?: string): string {
  if (!currency) return "৳";
  if (currency.includes("৳")) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  return "৳";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getStockStatus(stock?: number) {
  if (!stock || stock === 0)  return { label: "Out of Stock", color: "bg-red-100 text-red-600" };
  if (stock < 10)             return { label: "Low Stock",    color: "bg-amber-100 text-amber-600" };
  return                             { label: "In Stock",     color: "bg-green-100 text-green-700" };
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel, loading }: {
  product: MongoProduct; onConfirm: () => void;
  onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Delete Product</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">"{product.nameEng}"</span>?
          This will also remove all images and videos from Cloudinary.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report Modal ───────────────────────────────────────────────────────────
function ReportModal({ product, onClose }: { product: MongoProduct; onClose: () => void }) {
  const sym = getCurrencySymbol(product.currency);
  const discounted = product.price && product.discount
    ? Math.round(product.price * (1 - product.discount / 100)) : null;

  const specEntries = Object.entries(product.specifications ?? {});
  const totalSpecFields = specEntries.reduce((acc, [, fields]) =>
    acc + Object.values(fields).filter(Boolean).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Product Report</h3>
              <p className="text-xs text-gray-400">ID: {product._id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Product header */}
          <div className="flex gap-4">
            {product.images?.[0]?.url ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                <img src={product.images[0].url} alt={product.nameEng}
                  className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                {product.nameEng}
              </h2>
              {product.brand && <p className="text-xs text-gray-500 mt-1">Brand: <b>{product.brand}</b></p>}
              {product.sku   && <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {product.category && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                    {product.category}
                  </span>
                )}
                {product.subcategory && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    {product.subcategory}
                  </span>
                )}
                {product.subSubcategory && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    {product.subSubcategory}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Price",     value: product.price ? `${sym} ${product.price.toLocaleString()}` : "—", color: "bg-blue-50 text-blue-700" },
              { label: "After Disc",value: discounted ? `${sym} ${discounted.toLocaleString()}` : "—",       color: "bg-green-50 text-green-700" },
              { label: "Discount",  value: product.discount ? `${product.discount}%` : "None",               color: "bg-red-50 text-red-600" },
              { label: "Stock",     value: product.stock ?? "—",                                              color: "bg-amber-50 text-amber-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                <p className="text-lg font-bold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Details table */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Product Details</h4>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {[
                ["MOQ",             product.moq || "—"],
                ["Currency",        product.currency || "—"],
                ["Sample",          product.sampleAvailable || "—"],
                ["Supplier",        product.supplierName || "—"],
                ["Country",         product.countryOfOrigin || "—"],
                ["Incoterms",       product.incoterms || "—"],
                ["Shipping",        product.shippingMethod || "—"],
                ["Images",          `${product.images?.length ?? 0} uploaded`],
                ["Variations",      `${product.variations?.length ?? 0} variants`],
                ["Spec Fields",     `${totalSpecFields} filled`],
                ["Tags",            product.tags?.join(", ") || "—"],
                ["Created",         formatDate(product.createdAt)],
                ["Last Updated",    formatDate(product.updatedAt)],
              ].map(([key, val], i) => (
                <div key={key}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <span className="text-gray-500 font-medium">{key}</span>
                  <span className="text-gray-800 font-semibold text-right max-w-[60%] truncate">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications summary */}
          {specEntries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Specifications</h4>
              <div className="space-y-2">
                {specEntries.map(([cat, fields]) => {
                  const filled = Object.entries(fields).filter(([, v]) => v);
                  if (!filled.length) return null;
                  return (
                    <div key={cat} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{cat}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {filled.map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-xs">
                            <span className="text-gray-400 capitalize shrink-0">{k}:</span>
                            <span className="text-gray-700 font-medium truncate">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Image gallery */}
          {product.images && product.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Images ({product.images.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noreferrer">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition">
                      <img src={img.url} alt={`img-${i}`} className="w-full h-full object-cover" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link href={`/products/${product._id}`}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-center hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" /> View Live
            </Link>
            <Link href={`/admin/products/edit/${product._id}`}
              className="flex-1 py-2.5 rounded-xl bg-[#7149f5] text-white text-sm font-semibold text-center hover:bg-[#5f3dd4] transition flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expandable Row Detail ──────────────────────────────────────────────────
function ExpandedRow({ product }: { product: MongoProduct }) {
  return (
    <tr>
      <td colSpan={8} className="bg-slate-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">

          <div>
            <p className="font-bold text-gray-500 uppercase tracking-widest mb-2">Pricing</p>
            <div className="space-y-1 text-gray-700">
              <p>Price: <b>{product.price ? `${getCurrencySymbol(product.currency)} ${product.price}` : "—"}</b></p>
              <p>Discount: <b>{product.discount ? `${product.discount}%` : "None"}</b></p>
              <p>MOQ: <b>{product.moq || "—"}</b></p>
              <p>Sample: <b>{product.sampleAvailable || "—"}</b></p>
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-500 uppercase tracking-widest mb-2">Supplier</p>
            <div className="space-y-1 text-gray-700">
              <p>Name: <b>{product.supplierName || "—"}</b></p>
              <p>Country: <b>{product.countryOfOrigin || "—"}</b></p>
              <p>Incoterms: <b>{product.incoterms || "—"}</b></p>
              <p>Shipping: <b>{product.shippingMethod || "—"}</b></p>
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-500 uppercase tracking-widest mb-2">Variations</p>
            {product.variations && product.variations.length > 0 ? (
              <div className="space-y-1">
                {product.variations.slice(0, 4).map((v, i) => (
                  <div key={i} className="flex gap-2 flex-wrap">
                    {v.color && <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">{v.color}</span>}
                    {v.size  && <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">{v.size}</span>}
                    {v.stock && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Stock: {v.stock}</span>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400">No variations</p>}
          </div>

          <div>
            <p className="font-bold text-gray-500 uppercase tracking-widest mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {product.tags && product.tags.length > 0
                ? product.tags.map((t, i) => (
                    <span key={i} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      #{t}
                    </span>
                  ))
                : <p className="text-gray-400">No tags</p>
              }
            </div>
            <p className="font-bold text-gray-500 uppercase tracking-widest mb-2 mt-3">Dates</p>
            <div className="space-y-1 text-gray-700">
              <p>Created: <b>{formatDate(product.createdAt)}</b></p>
              <p>Updated: <b>{formatDate(product.updatedAt)}</b></p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
      type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ── MAIN ADMIN PAGE ────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products,       setProducts]       = useState<MongoProduct[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  // Pagination
  const [page,           setPage]           = useState(1);
  const [total,          setTotal]          = useState(0);
  const limit = 10;

  // Search & filter
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy,         setSortBy]         = useState("createdAt");
  const [sortDir,        setSortDir]        = useState<"asc" | "desc">("desc");

  // UI state
  const [expandedRow,    setExpandedRow]    = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<MongoProduct | null>(null);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [reportTarget,   setReportTarget]   = useState<MongoProduct | null>(null);
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [toast,          setToast]          = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [stats,          setStats]          = useState<Stats>({ total: 0, totalValue: 0, lowStock: 0, categories: 0 });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page:  String(page),
        limit: String(limit),
        ...(search         && { search }),
        ...(filterCategory && { category: filterCategory }),
      });

      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const data: MongoProduct[] = json.data;
      setProducts(data);
      setTotal(json.total ?? data.length);

      // Compute stats
      const cats      = new Set(data.map((p) => p.category).filter(Boolean));
      const totalVal  = data.reduce((acc, p) => acc + (p.price ?? 0) * (p.stock ?? 0), 0);
      const lowStock  = data.filter((p) => (p.stock ?? 0) < 10).length;
      setStats({ total: json.total ?? data.length, totalValue: totalVal, lowStock, categories: cats.size });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setToast({ message: "Product deleted successfully", type: "success" });
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Bulk delete ──────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} selected products?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}`, { method: "DELETE" })
        )
      );
      setToast({ message: `${selectedIds.size} products deleted`, type: "success" });
      setSelectedIds(new Set());
      fetchProducts();
    } catch {
      setToast({ message: "Some deletions failed", type: "error" });
    }
  };

  // ── Select ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)));
    }
  };

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortedProducts = [...products].sort((a, b) => {
    let av: any = a[sortBy as keyof MongoProduct];
    let bv: any = b[sortBy as keyof MongoProduct];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp   className={`w-3 h-3 -mb-1 ${sortBy === col && sortDir === "asc"  ? "text-purple-600" : "text-gray-300"}`} />
      <ChevronDown className={`w-3 h-3 ${sortBy === col && sortDir === "desc" ? "text-purple-600" : "text-gray-300"}`} />
    </span>
  );

  const totalPages = Math.ceil(total / limit);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Supplier", "Created"];
    const rows = products.map((p) => [
      p._id, p.nameEng, p.category ?? "", p.price ?? "", p.stock ?? "",
      p.supplierName ?? "", formatDate(p.createdAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all B2B / OEM / ODM products</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/admin/products/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7149f5] text-white text-sm font-semibold hover:bg-[#5f3dd4] transition">
            <Package className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Package    className="w-5 h-5 text-blue-600"   />} label="Total Products"  value={stats.total}                                color="bg-blue-50"   />
        <StatCard icon={<DollarSign className="w-5 h-5 text-green-600"  />} label="Inventory Value" value={`৳ ${stats.totalValue.toLocaleString()}`}   color="bg-green-50"  sub="estimated" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-amber-600"  />} label="Low Stock"       value={stats.lowStock}                             color="bg-amber-50"  sub="< 10 units" />
        <StatCard icon={<Layers     className="w-5 h-5 text-purple-600" />} label="Categories"      value={stats.categories}                           color="bg-purple-50" sub="this page" />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              placeholder="Search products... (press Enter)"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none appearance-none bg-white min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Bulk delete */}
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
              <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={fetchProducts} className="ml-auto text-xs underline font-semibold">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {/* Checkbox */}
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selectedIds.size === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("nameEng")}>
                  Product <SortIcon col="nameEng" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden md:table-cell"
                  onClick={() => handleSort("category")}>
                  Category <SortIcon col="category" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("price")}>
                  Price <SortIcon col="price" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell"
                  onClick={() => handleSort("stock")}>
                  Stock <SortIcon col="stock" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-200 rounded-xl" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded-xl w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No products found</p>
                    <p className="text-xs mt-1">Try changing the search or filter</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  const sym      = getCurrencySymbol(product.currency);
                  const stock    = getStockStatus(product.stock);
                  const isExpanded = expandedRow === product._id;
                  const isSelected = selectedIds.has(product._id);
                  const discounted = product.price && product.discount
                    ? Math.round(product.price * (1 - product.discount / 100)) : null;

                  return (
                    <>
                      <tr key={product._id}
                        className={`hover:bg-gray-50 transition group ${isSelected ? "bg-purple-50" : ""}`}>

                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={isSelected}
                            onChange={() => toggleSelect(product._id)}
                            className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                          />
                        </td>

                        {/* Image */}
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.nameEng}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Product info */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2">
                            {product.nameEng}
                          </p>
                          {product.brand && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{product.brand}</p>
                          )}
                          {product.sku && (
                            <p className="text-[10px] text-gray-400 font-mono">{product.sku}</p>
                          )}
                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : product._id)}
                            className="text-[10px] text-purple-500 hover:text-purple-700 font-semibold mt-1 flex items-center gap-0.5">
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                          </button>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {product.category && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold block w-fit mb-1">
                              {product.category}
                            </span>
                          )}
                          {product.subcategory && (
                            <span className="text-[10px] text-gray-400">{product.subcategory}</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          {discounted ? (
                            <div>
                              <p className="font-bold text-gray-800 text-xs">{sym} {discounted.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400 line-through">{sym} {product.price?.toLocaleString()}</p>
                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                                -{product.discount}%
                              </span>
                            </div>
                          ) : (
                            <p className="font-bold text-gray-800 text-xs">
                              {product.price ? `${sym} ${product.price.toLocaleString()}` : "—"}
                            </p>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${stock.color}`}>
                            {stock.label}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">{product.stock ?? 0} units</p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-gray-500">{formatDate(product.createdAt)}</p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">

                            {/* Report */}
                            <button
                              onClick={() => setReportTarget(product)}
                              title="View Report"
                              className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center transition">
                              <BarChart2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <Link href={`/dashboard/admindashboard/updateProduct/${product._id}`}
                              title="Edit Product"
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition">
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
{/* <UpdateProduct
  productId="64abc..."
  onSuccess={(product) => console.log("Updated:", product)}
  onCancel={() => Router.back()}
/> */}

                            {/* View */}
                            <Link href={`/products/${product._id}`}
                              title="View Live"
                              className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(product)}
                              title="Delete Product"
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && <ExpandedRow key={`exp-${product._id}`} product={product} />}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              Showing <b>{(page - 1) * limit + 1}</b>–<b>{Math.min(page * limit, total)}</b> of <b>{total}</b> products
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pg = i + 1;
                if (pg === 1 || pg === totalPages || (pg >= page - 1 && pg <= page + 1)) {
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        pg === page
                          ? "bg-[#7149f5] text-white shadow-sm"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}>
                      {pg}
                    </button>
                  );
                }
                if (pg === page - 2 || pg === page + 2) return <span key={pg} className="text-gray-400 text-xs">…</span>;
                return null;
              })}

              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {reportTarget && (
        <ReportModal product={reportTarget} onClose={() => setReportTarget(null)} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}