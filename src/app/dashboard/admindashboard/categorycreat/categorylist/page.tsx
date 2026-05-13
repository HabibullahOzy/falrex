"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Check, X, Clock, RefreshCw,
  Pencil, Trash2, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, Package, Filter,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: { url: string; public_id: string };
  subCategories: { name: string; subSubItems: { name: string }[] }[];
  isActive: boolean;
  order: number;
  status: "pending" | "approved" | "rejected";
  rejectedReason: string;
  createdBy: { uid: string; name: string; role: string; email: string };
  approvedBy: { uid: string; name: string };
  approvedAt: string;
  createdAt: string;
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    approved: { color: "bg-green-100 text-green-700", icon: <Check className="w-3 h-3" /> },
    pending:  { color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> },
    rejected: { color: "bg-red-100 text-red-600",    icon: <X className="w-3 h-3" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
      {s.icon} {status}
    </span>
  );
}

// ── Reject reason modal ────────────────────────────────────────────────────
function RejectModal({
  onConfirm, onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-800 mb-2">Reject Category</h3>
        <p className="text-sm text-gray-500 mb-4">Provide a reason (optional):</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Duplicate category, unclear name..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat, isAdmin, onApprove, onReject, onDelete, actionLoading,
}: {
  cat: Category; isAdmin: boolean;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  onDelete:  (id: string) => void;
  actionLoading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const loading = actionLoading === cat._id;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
      cat.status === "pending"  ? "border-amber-200" :
      cat.status === "rejected" ? "border-red-200"   : "border-gray-100"
    }`}>

      {/* Image */}
      <div className="relative h-32 bg-gray-50">
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}

        {/* Status */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={cat.status} />
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Link href={`/dashboard/categories/edit/${cat._id}`}
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm transition">
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => onDelete(cat._id)}
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-red-50 text-red-500 flex items-center justify-center shadow-sm transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm">{cat.name}</h3>
        {cat.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>
        )}

        {/* Creator */}
        <p className="text-[10px] text-gray-400 mt-1">
          By: <b className="text-gray-600">{cat.createdBy?.name || "—"}</b>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full font-semibold ${
            cat.createdBy?.role === "seller" ? "bg-blue-50 text-blue-600" :
            "bg-purple-50 text-purple-600"
          }`}>
            {cat.createdBy?.role}
          </span>
        </p>

        {/* Subcategory count */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
            {cat.subCategories?.length || 0} subcategories
          </span>
          {cat.subCategories?.length > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-purple-500 hover:text-purple-700 flex items-center gap-0.5">
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {expanded ? "Hide" : "Show"}
            </button>
          )}
        </div>

        {/* Expanded subcategories */}
        {expanded && cat.subCategories?.length > 0 && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {cat.subCategories.map((sub, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-2 py-1.5">
                <p className="text-[11px] font-semibold text-gray-700">{sub.name}</p>
                {sub.subSubItems?.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {sub.subSubItems.slice(0, 5).map((s, j) => (
                      <span key={j} className="text-[9px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {s.name}
                      </span>
                    ))}
                    {sub.subSubItems.length > 5 && (
                      <span className="text-[9px] text-gray-400">+{sub.subSubItems.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rejected reason */}
        {cat.status === "rejected" && cat.rejectedReason && (
          <div className="mt-2 bg-red-50 rounded-lg px-2 py-1.5">
            <p className="text-[10px] text-red-600"><b>Reason:</b> {cat.rejectedReason}</p>
          </div>
        )}

        {/* Admin approve/reject buttons */}
        {isAdmin && cat.status === "pending" && (
          <div className="flex gap-1.5 mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => onApprove(cat._id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Approve
            </button>
            <button
              onClick={() => onReject(cat._id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Reject
            </button>
          </div>
        )}

        {/* Approved info */}
        {cat.status === "approved" && cat.approvedBy?.name && (
          <p className="text-[10px] text-green-600 mt-2">
            ✓ Approved by <b>{cat.approvedBy.name}</b>
          </p>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [total,        setTotal]        = useState(0);
  const [counts,       setCounts]       = useState({ pending: 0, approved: 0, rejected: 0 });
  const [actionLoading,setActionLoading]= useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // TODO: get from auth context — for demo we assume admin
  const isAdmin = true;
  console.log(isAdmin)
  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search)                          params.set("search", search);
      if (filterStatus !== "all")          params.set("status", filterStatus);

      // Admin sees all; use admin endpoint
      const url  = isAdmin
        ? `${API}/category/admin/all?${params}`
        : `${API}/category?${params}`;

      const res  = await fetch(url, { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setCategories(json.data);
      setTotal(json.total);
      if (isAdmin) {
        setCounts({
          pending:  json.pending  || 0,
          approved: json.approved || 0,
          rejected: json.rejected || 0,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [search, filterStatus, isAdmin]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/category/${id}/approve`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Category approved ✓", "success");
      fetchCategories();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setActionLoading(null); }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      const res  = await fetch(`${API}/category/${rejectTarget}/approve`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject", reason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Category rejected", "success");
      fetchCategories();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setActionLoading(null); setRejectTarget(null); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/category/${id}`, {
        method: "DELETE", credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Category deleted", "success");
      fetchCategories();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} categories total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCategories}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link href="/dashboard/admindashboard/categorycreat/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition">
            <Plus className="w-4 h-4" /> Add Category
          </Link>
        </div>
      </div>

      {/* Admin stat cards */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Pending",  value: counts.pending,  color: "bg-amber-50 text-amber-700 border-amber-200",  icon: <Clock className="w-4 h-4" /> },
            { label: "Approved", value: counts.approved, color: "bg-green-50 text-green-700 border-green-200",  icon: <Check className="w-4 h-4" /> },
            { label: "Rejected", value: counts.rejected, color: "bg-red-50 text-red-600 border-red-200",        icon: <X className="w-4 h-4" /> },
          ].map(({ label, value, color, icon }) => (
            <button
              key={label}
              onClick={() => setFilterStatus(label.toLowerCase())}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition hover:shadow-sm ${color} ${
                filterStatus === label.toLowerCase() ? "ring-2 ring-offset-1 ring-current" : ""
              }`}
            >
              {icon}
              <div>
                <p className="text-xs font-medium opacity-80">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search categories..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white min-w-[130px] focus:ring-2 focus:ring-purple-300"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" /> {error}
          <button onClick={fetchCategories} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Pending alert */}
      {isAdmin && counts.pending > 0 && filterStatus !== "pending" && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            <b>{counts.pending}</b> categor{counts.pending > 1 ? "ies" : "y"} awaiting your approval
          </p>
          <button onClick={() => setFilterStatus("pending")}
            className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 underline">
            Review now →
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-600">No categories found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {filterStatus === "pending" ? "No pending categories to review" : "Add your first category"}
          </p>
          <Link href="/dashboard/categories/create"
            className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
            + Add Category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              cat={cat}
              isAdmin={isAdmin}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              onDelete={handleDelete}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}