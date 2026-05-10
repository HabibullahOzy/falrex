"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Search, X, Upload,
  ChevronDown, ChevronRight, RefreshCw,
  Tag, Image as ImageIcon, CheckCircle,
  AlertTriangle, Package,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── CATEGORY_TREE for seeding ──────────────────────────────────────────────
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  "Consumer Electronics": {
    "TWS & Earphones":    ["Gaming Earbuds", "ANC Earbuds", "Wired Earphones", "Open-Ear"],
    "Headphones":         ["Over-Ear", "On-Ear", "Noise Cancelling", "Studio Monitor"],
    "Speakers":           ["Portable Bluetooth", "Smart Speaker", "Soundbar", "Party Speaker"],
    "Smartwatch & Bands": ["Fitness Tracker", "Smart Band", "Luxury Smartwatch", "Kids Watch"],
    "Mobile Accessories": ["Power Bank", "Charger & Cables", "Phone Case", "Screen Protector"],
    "PC Peripherals":     ["Mechanical Keyboard", "Gaming Mouse", "Webcam", "USB Hub"],
    "LED & Lighting":     ["LED Strip", "Smart Bulb", "Desk Lamp", "RGB Light"],
  },
  "Fashion & Apparel": {
    "Men's Clothing":  ["T-Shirt", "Polo Shirt", "Hoodie", "Jacket", "Trousers"],
    "Women's Clothing":["Dress", "Blouse", "Skirt", "Abaya", "Leggings"],
    "Streetwear":      ["Oversized Tee", "Cargo Pants", "Bomber Jacket", "Cap"],
    "Footwear":        ["Sneakers", "Sandals", "Formal Shoes", "Boots"],
    "Bags & Luggage":  ["Backpack", "Tote Bag", "Crossbody", "Luggage Set"],
  },
  "Beauty & Personal Care": {
    "Skincare":         ["Moisturizer", "Serum", "Sunscreen", "Face Wash", "Toner"],
    "Haircare":         ["Shampoo", "Conditioner", "Hair Oil", "Hair Mask"],
    "Makeup":           ["Foundation", "Lipstick", "Mascara", "Eyeshadow"],
    "Fragrances":       ["Perfume", "Body Mist", "Attar", "Deodorant"],
  },
  "Jewellery & Accessories": {
    "Gold Jewellery":       ["Gold Necklace", "Gold Ring", "Gold Crown", "Gold Bracelet", "Gold Earring"],
    "Silver Jewellery":     ["Silver Necklace", "Silver Ring", "Silver Bracelet", "Silver Earring"],
    "Artificial Jewellery": ["Fashion Necklace", "Fashion Ring", "Fashion Earring"],
    "Diamond Jewellery":    ["Diamond Ring", "Diamond Necklace", "Diamond Earring"],
    "Watches":              ["Luxury Watch", "Sports Watch", "Couple Watch"],
  },
  "Home & Kitchen": {
    "Cookware":           ["Non-Stick Pan", "Pressure Cooker", "Wok", "Pot Set"],
    "Kitchen Appliances": ["Blender", "Rice Cooker", "Air Fryer", "Microwave"],
    "Furniture":          ["Sofa", "Office Chair", "Dining Table", "Bookshelf"],
  },
  "Sports & Outdoors": {
    "Fitness Equipment": ["Dumbbell", "Resistance Band", "Yoga Mat", "Treadmill"],
    "Sportswear":        ["Jersey", "Track Suit", "Compression Wear", "Sports Shoes"],
    "Outdoor Gear":      ["Tent", "Sleeping Bag", "Hiking Boots", "Backpack"],
  },
  "Health & Medical": {
    "Medical Devices": ["Blood Pressure Monitor", "Glucometer", "Pulse Oximeter"],
    "Supplements":     ["Protein Powder", "Vitamins", "Fish Oil", "Probiotic"],
    "Wellness":        ["Essential Oil", "Massage Device", "Heating Pad"],
  },
  "Toys & Hobbies": {
    "Kids Toys":   ["Action Figure", "Doll", "Building Block", "RC Car"],
    "Board Games": ["Chess", "Puzzle", "Card Game", "Strategy Game"],
    "Art & Craft": ["Color Pencil", "Canvas", "Clay", "Painting Kit"],
  },
  "Automotive": {
    "Car Accessories":  ["Car Charger", "Dash Cam", "Car Perfume", "Seat Cover"],
    "Car Care":         ["Wax & Polish", "Microfiber Cloth", "Tyre Inflator"],
    "Navigation":       ["GPS Tracker", "HUD Display", "Backup Camera"],
  },
  "Food & Beverage": {
    "Snacks":           ["Chips", "Biscuits", "Nuts & Dried Fruits", "Energy Bar"],
    "Beverages":        ["Juice", "Energy Drink", "Tea & Coffee", "Mineral Water"],
    "Organic & Natural":["Organic Honey", "Cold Pressed Oil", "Herbal Tea", "Spices"],
  },
};

// ── Types ──────────────────────────────────────────────────────────────────
interface SubSubItem { _id: string; name: string; slug: string; }
interface SubCategory { _id: string; name: string; slug: string; subSubItems: SubSubItem[]; }
interface Category {
  _id: string; name: string; slug: string; description: string;
  image: { url: string; public_id: string };
  subCategories: SubCategory[];
  isActive: boolean; order: number;
  createdAt: string; updatedAt: string;
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

// ── Category Form Modal ────────────────────────────────────────────────────
function CategoryModal({
  category, onClose, onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!category;
  const [name,        setName]        = useState(category?.name        || "");
  const [description, setDescription] = useState(category?.description || "");
  const [order,       setOrder]       = useState(String(category?.order ?? 0));
  const [isActive,    setIsActive]    = useState(category?.isActive ?? true);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [preview,     setPreview]     = useState(category?.image?.url || "");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");

    const fd = new FormData();
    fd.append("name",        name);
    fd.append("description", description);
    fd.append("order",       order);
    fd.append("isActive",    String(isActive));
    if (imageFile) fd.append("image", imageFile);

    try {
      const url    = isEdit ? `${API}/category/${category!._id}` : `${API}/category`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, { method, body: fd, credentials: "include" });
      const json   = await res.json();
      if (!json.success) throw new Error(json.message);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-4 hover:border-purple-400 transition bg-gray-50 relative overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded-xl">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Consumer Electronics"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none resize-none"
            />
          </div>

          {/* Order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
              <input
                type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={String(isActive)}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none appearance-none bg-white"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteConfirm({
  category, onConfirm, onCancel, loading,
}: {
  category: Category; onConfirm: () => void;
  onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Delete Category</h3>
            <p className="text-xs text-gray-500">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Delete <b>"{category.name}"</b>? This will also remove the image from Cloudinary.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat, onEdit, onDelete,
}: {
  cat: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${cat.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}>

      {/* Image */}
      <div className="relative h-36 bg-gray-50">
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}>
          {cat.isActive ? "Active" : "Inactive"}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button onClick={() => onEdit(cat)}
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(cat)}
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-red-50 text-red-500 flex items-center justify-center shadow-sm transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm leading-snug">{cat.name}</h3>
        {cat.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
            {cat.subCategories?.length || 0} subcategories
          </span>
          <span className="text-[10px] text-gray-400">Order: {cat.order}</span>
        </div>

        {/* Expand subcategories */}
        {cat.subCategories?.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-purple-500 mt-2 font-semibold hover:text-purple-700"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {expanded ? "Hide" : "Show"} subcategories
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                {cat.subCategories.map((sub) => (
                  <div key={sub._id} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-gray-700">{sub.name}</p>
                    {sub.subSubItems?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sub.subSubItems.slice(0, 4).map((s) => (
                          <span key={s._id}
                            className="text-[9px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {s.name}
                          </span>
                        ))}
                        {sub.subSubItems.length > 4 && (
                          <span className="text-[9px] text-gray-400">+{sub.subSubItems.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [editTarget,   setEditTarget]   = useState<Category | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [seedLoading,  setSeedLoading]  = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [total,        setTotal]        = useState(0);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search)       params.set("search", search);
      if (filterActive) params.set("active", filterActive);

      const res  = await fetch(`${API}/category?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setCategories(json.data);
      setTotal(json.total);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [search, filterActive]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`${API}/category/${deleteTarget._id}`, {
        method: "DELETE", credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Category deleted", "success");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally { setDeleteLoading(false); }
  };

  // ── Seed from CATEGORY_TREE ──────────────────────────────────────────────
  const handleSeed = async () => {
    if (!confirm("Seed all categories from CATEGORY_TREE? Existing ones will be skipped.")) return;
    setSeedLoading(true);
    try {
      const res  = await fetch(`${API}/category/seed`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ CATEGORY_TREE }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const created = json.results.filter((r: any) => r.status === "created").length;
      showToast(`Seeded ${created} new categories`, "success");
      fetchCategories();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally { setSeedLoading(false); }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} categories in database
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seedLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            {seedLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
            Seed from Tree
          </button>
          <button onClick={fetchCategories}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white min-w-[140px] focus:ring-2 focus:ring-purple-300"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={fetchCategories} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-600">No categories found</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Click "Seed from Tree" to populate from CATEGORY_TREE
          </p>
          <button onClick={handleSeed} disabled={seedLoading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700">
            Seed Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id} cat={cat}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CategoryModal
          category={null}
          onClose={() => setShowCreate(false)}
          onSaved={() => { showToast("Category created", "success"); fetchCategories(); }}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <CategoryModal
          category={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { showToast("Category updated", "success"); fetchCategories(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}