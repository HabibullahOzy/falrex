"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Upload, X, Plus, Trash2, ChevronDown,
  ChevronRight, Check, AlertTriangle, Loader2,
  Lightbulb, Edit3, GripVertical, Tag, ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface SubSubItem   { name: string; slug?: string; }
interface SubCategory  { name: string; subSubItems: SubSubItem[]; }
interface CategoryTree { [cat: string]: { [sub: string]: string[] } }

interface ExistingCategory {
  _id:           string;
  name:          string;
  slug:          string;
  description:   string;
  order:         number;
  isActive:      boolean;
  status:        "pending" | "approved" | "rejected";
  image?:        { url: string; public_id: string };
  subCategories: SubCategory[];
  createdBy?:    { uid: string; role: string };
}

// ── Slug generator ─────────────────────────────────────────────────────────
function makeSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Input styles ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm " +
  "focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none bg-white transition";

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700 border-green-200",
    pending:  "bg-amber-100  text-amber-700  border-amber-200",
    rejected: "bg-red-100   text-red-700    border-red-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Editable sub-sub chip ──────────────────────────────────────────────────
function SubSubChip({
  name, onRemove, onEdit,
}: { name: string; onRemove: () => void; onEdit: (val: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(name);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    if (val.trim()) onEdit(val.trim());
    else            onRemove();
    setEditing(false);
  };

  if (editing) return (
    <input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="text-xs px-2 py-1 border-2 border-purple-400 rounded-full outline-none bg-white min-w-[60px] max-w-[140px]"
    />
  );

  return (
    <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2.5 py-1 rounded-full group">
      <button type="button" onClick={() => setEditing(true)} className="hover:text-purple-900">
        {name}
      </button>
      <button type="button" onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100">
        <Edit3 className="w-2.5 h-2.5" />
      </button>
      <button type="button" onClick={onRemove} className="opacity-0 group-hover:opacity-100 hover:text-red-600">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ── Sub-category row ───────────────────────────────────────────────────────
function SubCategoryRow({
  sub, index, onChange, onRemove,
}: {
  sub: SubCategory; index: number;
  onChange: (updated: SubCategory) => void;
  onRemove: () => void;
}) {
  const [newItem,  setNewItem]  = useState("");
  const [expanded, setExpanded] = useState(true);

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    if (!sub.subSubItems.find((i) => i.name === v)) {
      onChange({ ...sub, subSubItems: [...sub.subSubItems, { name: v }] });
    }
    setNewItem("");
  };

  const removeItem = (idx: number) =>
    onChange({ ...sub, subSubItems: sub.subSubItems.filter((_, i) => i !== idx) });

  const editItem = (idx: number, val: string) =>
    onChange({
      ...sub,
      subSubItems: sub.subSubItems.map((it, i) => (i === idx ? { name: val } : it)),
    });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
        <button type="button" onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 flex-1 text-left">
          {expanded
            ? <ChevronDown  className="w-3.5 h-3.5 text-gray-400" />
            : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          <input
            type="text"
            value={sub.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...sub, name: e.target.value })}
            placeholder="Subcategory name"
            className="flex-1 text-sm font-semibold text-gray-700 bg-transparent border-none outline-none"
          />
        </button>
        <span className="text-[10px] text-gray-400">{sub.subSubItems.length} items</span>
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {sub.subSubItems.map((item, idx) => (
              <SubSubChip
                key={idx}
                name={item.name}
                onRemove={() => removeItem(idx)}
                onEdit={(val) => editItem(idx, val)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
              placeholder="Add item..."
              className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-purple-300"
            />
            <button type="button" onClick={addItem}
              className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition">
              + Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function UpdateCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  // Original data (for reset)
  const [original,      setOriginal]      = useState<ExistingCategory | null>(null);

  // Form state
  const [name,          setName]          = useState("");
  const [description,   setDescription]   = useState("");
  const [order,         setOrder]         = useState("0");
  const [isActive,      setIsActive]      = useState(true);
  const [existingImage, setExistingImage] = useState<{ url: string; public_id: string } | null>(null);
  const [imageFile,     setImageFile]     = useState<File | null>(null);
  const [preview,       setPreview]       = useState("");
  const [removeImage,   setRemoveImage]   = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // Suggest state
  const [tree,            setTree]            = useState<CategoryTree>({});
  const [suggestions,     setSuggestions]     = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // UI state
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [isDirty,      setIsDirty]      = useState(false);

  // ── Fetch existing category ──────────────────────────────────────────────
  useEffect(() => {
    if (!categoryId) return;
    const fetchCategory = async () => {
      setFetchLoading(true);
      setError("");
      try {
        const res  = await fetch(`${API}/category/${categoryId}`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load category");

        const cat: ExistingCategory = json.data;
        setOriginal(cat);
        populateForm(cat);
      } catch (err: any) {
        setError(err.message || "Could not load category");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // Populate all form fields from category data
  const populateForm = (cat: ExistingCategory) => {
    setName(cat.name || "");
    setDescription(cat.description || "");
    setOrder(String(cat.order ?? 0));
    setIsActive(cat.isActive ?? true);
    setExistingImage(cat.image || null);
    setPreview(cat.image?.url || "");
    setRemoveImage(false);
    setImageFile(null);
    setSubCategories(
      (cat.subCategories || []).map((sub) => ({
        name:        sub.name,
        subSubItems: (sub.subSubItems || []).map((i) => ({ name: i.name })),
      }))
    );
    setIsDirty(false);
  };

  // Reset to original values
  const handleReset = () => {
    if (original) populateForm(original);
  };

  // Track dirty state
  useEffect(() => { setIsDirty(true); }, [name, description, order, isActive, imageFile, removeImage, subCategories]);
  useEffect(() => { setIsDirty(false); }, [original]); // reset after populate

  // ── Fetch category tree for suggestions ─────────────────────────────────
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res  = await fetch(`${API}/category/tree`);
        const json = await res.json();
        if (json.success) setTree(json.data);
      } catch {}
    };
    fetchTree();
  }, []);

  // ── Auto-suggest ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!name.trim() || !Object.keys(tree).length) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    const q    = name.toLowerCase();
    const hits = Object.keys(tree).filter((k) => k.toLowerCase().includes(q));
    setSuggestions(hits);
    setShowSuggestions(hits.length > 0);
  }, [name, tree]);

  const applySuggestion = useCallback((catName: string) => {
    setName(catName);
    setShowSuggestions(false);
    const subTree = tree[catName] || {};
    const subs: SubCategory[] = Object.entries(subTree).map(([subName, items]) => ({
      name:        subName,
      subSubItems: items.map((s) => ({ name: s })),
    }));
    setSubCategories(subs);
  }, [tree]);

  // ── Image handler ─────────────────────────────────────────────────────────
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setPreview("");
    setImageFile(null);
    setRemoveImage(true);
  };

  const handleRestoreImage = () => {
    if (existingImage) {
      setPreview(existingImage.url);
      setRemoveImage(false);
      setImageFile(null);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Category name is required"); return; }
    setLoading(true); setError(""); setSuccess("");

    const fd = new FormData();
    fd.append("name",          name.trim());
    fd.append("description",   description);
    fd.append("order",         order);
    fd.append("isActive",      String(isActive));
    fd.append("subCategories", JSON.stringify(subCategories));
    if (imageFile)   fd.append("image",       imageFile);
    if (removeImage) fd.append("removeImage", "true");

    try {
      const res  = await fetch(`${API}/category/${categoryId}`, {
        method:      "PUT",
        body:        fd,
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setSuccess("Category updated successfully!");
      setOriginal(json.data);
      setIsDirty(false);
      setTimeout(() => router.push("/dashboard/admindashboard/categorycreat/categorylist"), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (fetchLoading) return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        {[140, 180, 320, 200].map((h, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`bg-gray-100 rounded-xl animate-pulse`} style={{ height: h }} />
          </div>
        ))}
      </div>
    </div>
  );

  // ── Fetch error ───────────────────────────────────────────────────────────
  if (!original && !fetchLoading) return (
    <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold mb-1">Category not found</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
          Go Back
        </button>
      </div>
    </div>
  );

  const isApproved = original?.status === "approved";

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-400 font-mono">{original?.slug}</p>
              {original?.status && <StatusBadge status={original.status} />}
            </div>
          </div>

          {/* Reset button */}
          {isDirty && (
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition">
              <RefreshCw className="w-3.5 h-3.5" /> Reset Changes
            </button>
          )}
        </div>

        {/* Approved warning for sellers */}
        {isApproved && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <b>This category is approved.</b> Editing it will reset its status to{" "}
              <b>pending</b> and require re-approval from an admin.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Image upload ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category Image
              {existingImage && !imageFile && !removeImage && (
                <span className="ml-2 text-[10px] font-normal text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Current image
                </span>
              )}
              {imageFile && (
                <span className="ml-2 text-[10px] font-normal text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  New image selected
                </span>
              )}
              {removeImage && (
                <span className="ml-2 text-[10px] font-normal text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Image will be removed
                </span>
              )}
            </label>

            <label
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition overflow-hidden bg-gray-50 ${
                removeImage ? "border-red-300 opacity-50" : "border-gray-200 hover:border-purple-400"
              }`}
              style={{ minHeight: 140 }}
            >
              {preview && !removeImage ? (
                <>
                  <Image width={10} height={10} src={preview} alt="preview"
                    className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <div className="text-white text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs font-semibold">Change Image</span>
                    </div>
                  </div>
                </>
              ) : removeImage ? (
                <div className="text-center py-6">
                  <X className="w-8 h-8 text-red-300 mx-auto mb-2" />
                  <p className="text-sm text-red-400 font-medium">Image will be removed</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage}
                disabled={removeImage} />
            </label>

            {/* Image action buttons */}
            <div className="flex gap-3 mt-2">
              {(preview || imageFile) && !removeImage && (
                <button type="button" onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition">
                  <X className="w-3 h-3" /> Remove image
                </button>
              )}
              {removeImage && existingImage && (
                <button type="button" onClick={handleRestoreImage}
                  className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 transition">
                  <RefreshCw className="w-3 h-3" /> Restore original
                </button>
              )}
            </div>
          </div>

          {/* ── Category name with suggestions ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Consumer Electronics, Jewellery..."
                className={inputCls}
                required
              />

              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">
                      Suggested categories — click to auto-fill
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onMouseDown={() => applySuggestion(s)}
                        className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-sm font-medium text-gray-700 hover:text-purple-700 transition flex items-center justify-between group">
                        <span>{s}</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-purple-400">
                          {Object.keys(tree[s] || {}).length} subcategories →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {name && (
              <p className="mt-1.5 text-[11px] text-gray-400">
                Slug: <span className="font-mono text-gray-600">{makeSlug(name)}</span>
                {original?.slug && makeSlug(name) !== original.slug && (
                  <span className="ml-2 text-amber-500">(changed from: {original.slug})</span>
                )}
              </p>
            )}

            {/* Description */}
            <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category..."
              rows={2}
              className={`${inputCls} resize-none`}
            />

            {/* Order + isActive row */}
            <div className="flex items-center gap-6 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number" min="0" value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className={`${inputCls} w-32`}
                />
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    isActive ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {isActive ? "Active" : "Inactive"}
                </span>
                {original && original.isActive !== isActive && (
                  <span className="text-[10px] text-amber-500 font-medium">changed</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Subcategories ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Subcategories
                  <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                    {subCategories.length}
                  </span>
                  {original && subCategories.length !== original.subCategories.length && (
                    <span className="ml-1 text-[10px] text-amber-500 font-medium">
                      (was {original.subCategories.length})
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Edit, add, or remove subcategories and their items freely.
                </p>
              </div>
              <button type="button"
                onClick={() => setSubCategories((prev) => [...prev, { name: "", subSubItems: [] }])}
                className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition">
                <Plus className="w-3.5 h-3.5" /> Add Sub
              </button>
            </div>

            {subCategories.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No subcategories</p>
                <p className="text-xs mt-1">Add subcategories or pick a suggestion above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subCategories.map((sub, idx) => (
                  <SubCategoryRow
                    key={idx}
                    sub={sub}
                    index={idx}
                    onChange={(updated) => {
                      const copy = [...subCategories];
                      copy[idx]  = updated;
                      setSubCategories(copy);
                    }}
                    onRemove={() =>
                      setSubCategories((prev) => prev.filter((_, i) => i !== idx))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Preview ── */}
          {subCategories.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Preview</p>
              <p className="text-white font-bold text-sm mb-2">{name || "Category Name"}</p>
              <div className="space-y-1.5">
                {subCategories.map((sub, i) => sub.name && (
                  <div key={i}>
                    <p className="text-slate-300 text-xs font-semibold">{sub.name}</p>
                    {sub.subSubItems.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 ml-3">
                        {sub.subSubItems.map((item, j) => (
                          <span key={j}
                            className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                            {item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Errors / Success ── */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          {/* ── Approved re-review note ── */}
          {isApproved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 leading-relaxed">
                <b>Note:</b> Saving changes to this approved category will set its status back to{" "}
                <b>pending</b> until reviewed by an admin.
              </div>
            </div>
          )}

          {/* ── Buttons ── */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            {isDirty && (
              <button type="button" onClick={handleReset}
                className="py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            )}
            <button type="submit" disabled={loading || !isDirty}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                : <><Check className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}