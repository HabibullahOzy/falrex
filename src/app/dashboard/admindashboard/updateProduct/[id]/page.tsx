"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Upload, X, Plus, ChevronDown, ChevronUp,
  Loader2, CheckCircle, AlertTriangle, Trash2,
  Image as ImageIcon, Video, RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
interface CategoryData {
  _id: string; name: string; slug: string;
  subCategories: { _id: string; name: string; slug: string; subSubItems: { name: string; slug: string }[] }[];
}

interface ProductImage { url: string; public_id: string; _id: string; }
interface ProductVideo { url: string; public_id: string; }

// ── Spec definitions per category ─────────────────────────────────────────
const SPEC_BY_CATEGORY: Record<string, { key: string; label: string; fields: { key: string; label: string; placeholder: string }[] }[]> = {
  "Consumer Electronics": [
    { key: "audio", label: "Audio", fields: [
      { key: "chipset", label: "Chipset", placeholder: "e.g. JL6983D2" },
      { key: "soundProfile", label: "Sound Profile", placeholder: "e.g. HiFi Ultra-Bass" },
      { key: "driverSize", label: "Driver Size", placeholder: "e.g. 13mm" },
      { key: "latency", label: "Latency", placeholder: "e.g. < 30ms" },
      { key: "frequencyResponse", label: "Frequency Response", placeholder: "e.g. 20Hz-20kHz" },
    ]},
    { key: "battery", label: "Battery", fields: [
      { key: "earphoneCapacity", label: "Earphone Capacity", placeholder: "e.g. 30 mAh" },
      { key: "chargingBoxCapacity", label: "Charging Box", placeholder: "e.g. 300 mAh" },
      { key: "musicCallTime", label: "Music / Call Time", placeholder: "e.g. 3-4 hrs" },
      { key: "standbyTime", label: "Standby Time", placeholder: "e.g. 120 hrs" },
      { key: "chargingTime", label: "Charging Time", placeholder: "e.g. 1.5 hrs" },
      { key: "interface", label: "Charging Interface", placeholder: "e.g. Type-C" },
    ]},
    { key: "build", label: "Build & Design", fields: [
      { key: "waterproofStandard", label: "Waterproof", placeholder: "e.g. IPX-4" },
      { key: "material", label: "Material", placeholder: "e.g. ABS + PC" },
      { key: "weight", label: "Weight", placeholder: "e.g. 45g" },
    ]},
    { key: "connectivity", label: "Connectivity", fields: [
      { key: "bluetoothVersion", label: "Bluetooth", placeholder: "e.g. V5.3" },
      { key: "transmissionDistance", label: "Range", placeholder: "e.g. 10-15m" },
      { key: "protocols", label: "Protocols", placeholder: "e.g. HFP/A2DP" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "oemOdm", label: "OEM / ODM", placeholder: "e.g. Available" },
      { key: "customLogo", label: "Custom Logo", placeholder: "e.g. MOQ 500+" },
      { key: "leadTime", label: "Lead Time", placeholder: "e.g. 7-15 Days" },
    ]},
  ],
  "Jewellery & Accessories": [
    { key: "material", label: "Material & Metal", fields: [
      { key: "baseMetal", label: "Base Metal", placeholder: "e.g. 925 Sterling Silver" },
      { key: "plating", label: "Plating", placeholder: "e.g. 18K Gold" },
      { key: "purity", label: "Purity / Karat", placeholder: "e.g. 22K, 18K" },
      { key: "hallmark", label: "Hallmark", placeholder: "e.g. BIS 916" },
    ]},
    { key: "gemstone", label: "Gemstone", fields: [
      { key: "stoneType", label: "Stone Type", placeholder: "e.g. Diamond / Ruby" },
      { key: "stoneWeight", label: "Stone Weight", placeholder: "e.g. 0.5 Carat" },
      { key: "stoneCut", label: "Stone Cut", placeholder: "e.g. Round Brilliant" },
      { key: "clarity", label: "Clarity", placeholder: "e.g. VS1" },
    ]},
    { key: "dimensions", label: "Dimensions", fields: [
      { key: "itemWeight", label: "Item Weight", placeholder: "e.g. 4.5g" },
      { key: "length", label: "Length", placeholder: "e.g. 45cm" },
      { key: "width", label: "Width", placeholder: "e.g. 12mm" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "packaging", label: "Packaging", placeholder: "e.g. Velvet Box" },
      { key: "certificate", label: "Certificate", placeholder: "e.g. GIA / IGI" },
      { key: "leadTime", label: "Lead Time", placeholder: "e.g. 7-10 Days" },
    ]},
  ],
  "Fashion & Apparel": [
    { key: "fabric", label: "Fabric & Material", fields: [
      { key: "composition", label: "Composition", placeholder: "e.g. 100% Cotton" },
      { key: "weight", label: "Fabric Weight", placeholder: "e.g. 280 GSM" },
      { key: "finish", label: "Finish", placeholder: "e.g. Enzyme Washed" },
    ]},
    { key: "sizing", label: "Sizing", fields: [
      { key: "fit", label: "Fit", placeholder: "e.g. Oversized" },
      { key: "sizes", label: "Sizes", placeholder: "e.g. XS - 4XL" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "moqPerColor", label: "MOQ Per Color", placeholder: "e.g. 50 pcs" },
      { key: "leadTime", label: "Lead Time", placeholder: "e.g. 15-20 Days" },
    ]},
  ],
};

const DEFAULT_SPECS = [
  { key: "general", label: "General Specs", fields: [
    { key: "material", label: "Material", placeholder: "e.g. Stainless Steel" },
    { key: "weight", label: "Weight", placeholder: "e.g. 500g" },
    { key: "color", label: "Color", placeholder: "e.g. Black / White" },
    { key: "size", label: "Size", placeholder: "e.g. 20 x 10 x 5 cm" },
  ]},
  { key: "business", label: "Business / OEM", fields: [
    { key: "moq", label: "MOQ", placeholder: "e.g. 100 pcs" },
    { key: "leadTime", label: "Lead Time", placeholder: "e.g. 15 Days" },
    { key: "oemOdm", label: "OEM / ODM", placeholder: "e.g. Available" },
  ]},
];

const CURRENCIES = ["BDT (৳)", "USD ($)", "EUR (€)", "GBP (£)", "CNY (¥)", "INR (₹)", "JPY (¥)"];
const SHIPPING_METHODS = ["Sea Freight", "Air Freight", "Express (DHL/FedEx)", "Rail Freight", "Road Freight"];
const INCOTERMS = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA"];
const COUNTRIES = ["Bangladesh (BD)", "China (CN)", "India (IN)", "United States (US)", "Germany (DE)", "United Kingdom (GB)", "Turkey (TR)", "Vietnam (VN)", "South Korea (KR)", "Japan (JP)"];

function buildEmptySpecs(cats: typeof DEFAULT_SPECS) {
  return Object.fromEntries(cats.map((c) => [c.key, Object.fromEntries(c.fields.map((f) => [f.key, ""]))]));
}

const inputCls  = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm";
const selectCls = `${inputCls} appearance-none`;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ── MAIN EDIT PAGE ─────────────────────────────────────────────────────────
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id as string;

  const { register, handleSubmit, reset, watch } = useForm();

  // ── Loading states ─────────────────────────────────────────────────────
  const [pageLoading,   setPageLoading]   = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");

  // ── Category data from DB ─────────────────────────────────────────────
  const [dbCategories,   setDbCategories]   = useState<CategoryData[]>([]);
  const [selectedCat,    setSelectedCat]    = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");
  const [selectedSubSub, setSelectedSubSub] = useState("");

  // ── Computed subcategory options from DB ──────────────────────────────
  const dbSubCategories = dbCategories.find((c) => c.name === selectedCat)?.subCategories || [];
  const dbSubSubItems   = dbSubCategories.find((s) => s.name === selectedSubCat)?.subSubItems || [];

  // ── Spec state ────────────────────────────────────────────────────────
  const [specCategories,   setSpecCategories]   = useState(DEFAULT_SPECS);
  const [specs,            setSpecs]            = useState<Record<string, Record<string, string>>>(buildEmptySpecs(DEFAULT_SPECS));
  const [openSpecCategory, setOpenSpecCategory] = useState<string | null>(null);

  // ── Media state ───────────────────────────────────────────────────────
  const [existingImages,  setExistingImages]  = useState<ProductImage[]>([]);
  const [existingVideo,   setExistingVideo]   = useState<ProductVideo | null>(null);
  const [newImages,       setNewImages]       = useState<File[]>([]);
  const [newVideo,        setNewVideo]        = useState<File | null>(null);
  const [imagesToDelete,  setImagesToDelete]  = useState<string[]>([]);  // public_ids
  const [deleteVideo,     setDeleteVideo]     = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // ── Tags & Variations ─────────────────────────────────────────────────
  const [tags,       setTags]       = useState<string[]>([]);
  const [tagInput,   setTagInput]   = useState("");
  const [variations, setVariations] = useState([{ color: "", size: "", sku: "", stock: "" }]);

  // ── Packaging ─────────────────────────────────────────────────────────
  const [packagingDetails, setPackagingDetails] = useState("");
  const [sellingUnit,      setSellingUnit]       = useState("Single item");

  // ── Fetch DB categories ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/category/admin/all?limit=100`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setDbCategories(j.data); })
      .catch(console.error);
  }, []);

  // ── Fetch product data ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setPageLoading(true);

    fetch(`${API}/product/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const p = json.data;

        // Populate form fields
        reset({
          nameEng:            p.nameEng            || "",
          nameLocal:          p.nameLocal           || "",
          brand:              p.brand               || "",
          modelNumber:        p.modelNumber         || "",
          sku:                p.sku                 || "",
          slug:               p.slug                || "",
          hsCode:             p.hsCode              || "",
          price:              p.price               || "",
          currency:           p.currency            || "BDT (৳)",
          discount:           p.discount            || "",
          moq:                p.moq                 || "",
          stock:              p.stock               || "",
          sampleAvailable:    p.sampleAvailable     || "No",
          supplierName:       p.supplierName        || "",
          countryOfOrigin:    p.countryOfOrigin     || "Bangladesh (BD)",
          supplierYears:      p.supplierYears       || "",
          certifications:     p.certifications      || "",
          factoryLocation:    p.factoryLocation     || "",
          productionCapacity: p.productionCapacity  || "",
          incoterms:          p.incoterms           || "FOB",
          shippingMethod:     p.shippingMethod      || "Sea Freight",
          leadTime:           p.leadTime            || "",
          portOfLoading:      p.portOfLoading       || "",
          shippingNotes:      p.shippingNotes       || "",
          grossWeight:        p.grossWeight         || "",
          cartonSize:         p.cartonSize          || "",
          shortDescription:   p.shortDescription    || "",
          description:        p.description         || "",
        });

        // Category cascade
        setSelectedCat(p.category    || "");
        setSelectedSubCat(p.subcategory    || "");
        setSelectedSubSub(p.subSubcategory || "");

        // Specs
        const newCats = SPEC_BY_CATEGORY[p.category] ?? DEFAULT_SPECS;
        setSpecCategories(newCats);
        const emptySpecs = buildEmptySpecs(newCats);
        if (p.specifications) {
          Object.entries(p.specifications).forEach(([catKey, fields]) => {
            if (emptySpecs[catKey]) {
              emptySpecs[catKey] = { ...emptySpecs[catKey], ...(fields as any) };
            } else {
              emptySpecs[catKey] = fields as any;
            }
          });
        }
        setSpecs(emptySpecs);

        // Tags & variations
        setTags(p.tags       || []);
        setVariations(p.variations?.length > 0
          ? p.variations.map((v: any) => ({ color: v.color || "", size: v.size || "", sku: v.sku || "", stock: v.stock || "" }))
          : [{ color: "", size: "", sku: "", stock: "" }]
        );

        // Packaging
        setPackagingDetails(p.packagingDetails || "");
        setSellingUnit(p.sellingUnit       || "Single item");

        // Media
        setExistingImages(p.images || []);
        setExistingVideo(p.video   || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setPageLoading(false));
  }, [id, reset]);

  // ── When category changes, update spec template ───────────────────────
  useEffect(() => {
    if (!selectedCat) return;
    const newCats = SPEC_BY_CATEGORY[selectedCat] ?? DEFAULT_SPECS;
    setSpecCategories(newCats);
    // Preserve existing spec values when switching
    const emptySpecs = buildEmptySpecs(newCats);
    setSpecs((prev) => {
      const merged = { ...emptySpecs };
      Object.entries(prev).forEach(([catKey, fields]) => {
        if (merged[catKey]) merged[catKey] = { ...merged[catKey], ...fields };
      });
      return merged;
    });
    setOpenSpecCategory(null);
  }, [selectedCat]);

  // ── Mark image for deletion (soft delete — actual delete on save) ──────
  const markImageForDeletion = (public_id: string) => {
    setImagesToDelete((prev) => [...prev, public_id]);
    setExistingImages((prev) => prev.filter((img) => img.public_id !== public_id));
  };

  // ── Instant delete image from Cloudinary ─────────────────────────────
  const deleteImageNow = async (public_id: string, imgId: string) => {
    setDeletingImageId(imgId);
    try {
      const res  = await fetch(
        `${API}/product/${id}/image/${encodeURIComponent(public_id)}`,
        { method: "DELETE", credentials: "include" }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setExistingImages((prev) => prev.filter((img) => img._id !== imgId));
    } catch (err: any) {
      setError("Failed to delete image: " + err.message);
    } finally { setDeletingImageId(null); }
  };

  // ── Instant delete video ──────────────────────────────────────────────
  const deleteVideoNow = async () => {
    try {
      const res  = await fetch(`${API}/product/${id}/video`, {
        method: "DELETE", credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setExistingVideo(null);
    } catch (err: any) {
      setError("Failed to delete video: " + err.message);
    }
  };

  const updateSpec = (category: string, field: string, value: string) => {
    setSpecs((prev) => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const addTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addVariation    = () => setVariations([...variations, { color: "", size: "", sku: "", stock: "" }]);
  const removeVariation = (i: number) => setVariations((prev) => prev.filter((_, idx) => idx !== i));
  const updateVariation = (i: number, field: string, value: string) => {
    const updated = [...variations];
    updated[i] = { ...updated[i], [field]: value };
    setVariations(updated);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: Record<string, string>) => {
    setSubmitLoading(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();

      // Basic fields
      Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""));

      // Category
      fd.set("category",       selectedCat);
      fd.set("subcategory",    selectedSubCat);
      fd.set("subSubcategory", selectedSubSub);

      // JSON fields
      fd.append("specifications",  JSON.stringify(specs));
      fd.append("tags",            JSON.stringify(tags));
      fd.append("variations",      JSON.stringify(variations));
      fd.append("packagingDetails", packagingDetails);
      fd.append("sellingUnit",      sellingUnit);

      // Images to delete (server will remove from Cloudinary)
      if (imagesToDelete.length > 0) {
        fd.append("deleteImages", JSON.stringify(imagesToDelete));
      }

      // Delete video flag
      if (deleteVideo) fd.append("deleteVideo", "true");

      // New files
      newImages.forEach((f) => fd.append("images", f));
      if (newVideo) fd.append("video", newVideo);

      const res  = await fetch(`${API}/product/${id}`, {
        method:      "PUT",
        body:        fd,
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setSuccess("Product updated successfully!");
      setImagesToDelete([]);
      setDeleteVideo(false);
      setNewImages([]);
      setNewVideo(null);

      // Refresh existing media
      setExistingImages(json.data.images || []);
      setExistingVideo(json.data.video   || null);

      setTimeout(() => router.push("/dashboard/admindashboard/adminactionproduct"), 1500);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally { setSubmitLoading(false); }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">✏️ Edit Product</h1>
            <p className="text-sm text-gray-500 mt-0.5">ID: <span className="font-mono text-xs">{id}</span></p>
          </div>
          <button onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
            ← Back
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── 1. Basic Info ── */}
          <SectionCard title="1. Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product Name (English) *">
                <input {...register("nameEng", { required: true })} className={inputCls} placeholder="e.g. MK47 Gaming Earbuds" />
              </Field>
              <Field label="Product Name (Local)">
                <input {...register("nameLocal")} className={inputCls} placeholder="Optional" />
              </Field>
              <Field label="Brand">
                <input {...register("brand")} className={inputCls} placeholder="e.g. Shafir Express" />
              </Field>
              <Field label="Model Number">
                <input {...register("modelNumber")} className={inputCls} placeholder="e.g. MK47" />
              </Field>
              <Field label="SKU">
                <input {...register("sku")} className={inputCls} placeholder="e.g. B2B-MK47-9921" />
              </Field>
              <Field label="Slug / URL Key">
                <input {...register("slug")} className={inputCls} placeholder="e.g. mk47-gaming-earbuds" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 2. Category from DB ── */}
          <SectionCard title="2. Category & Classification">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Category */}
              <Field label="Category *">
                <select
                  value={selectedCat}
                  onChange={(e) => { setSelectedCat(e.target.value); setSelectedSubCat(""); setSelectedSubSub(""); }}
                  className={selectCls}
                >
                  <option value="">— Select Category —</option>
                  {dbCategories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>

              {/* Subcategory */}
              <Field label="Subcategory">
                <select
                  value={selectedSubCat}
                  onChange={(e) => { setSelectedSubCat(e.target.value); setSelectedSubSub(""); }}
                  className={selectCls}
                  disabled={!selectedCat || dbSubCategories.length === 0}
                >
                  <option value="">— Select Subcategory —</option>
                  {dbSubCategories.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </Field>

              {/* Sub-Subcategory */}
              <Field label="Type / Sub-subcategory">
                <select
                  value={selectedSubSub}
                  onChange={(e) => setSelectedSubSub(e.target.value)}
                  className={selectCls}
                  disabled={!selectedSubCat || dbSubSubItems.length === 0}
                >
                  <option value="">— Select Type —</option>
                  {dbSubSubItems.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Category path preview */}
            {selectedCat && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{selectedCat}</span>
                {selectedSubCat && (
                  <><span className="text-gray-400 text-xs">›</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{selectedSubCat}</span></>
                )}
                {selectedSubSub && (
                  <><span className="text-gray-400 text-xs">›</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{selectedSubSub}</span></>
                )}
              </div>
            )}

            <Field label="HS Code">
              <input {...register("hsCode")} className={inputCls} placeholder="e.g. 8518.30.00" />
            </Field>
          </SectionCard>

          {/* ── 3. Pricing ── */}
          <SectionCard title="3. Pricing & Order Info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Unit Price">
                <input {...register("price")} type="number" step="0.01" className={inputCls} placeholder="e.g. 700" />
              </Field>
              <Field label="Currency">
                <select {...register("currency")} className={selectCls}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Discount (%)">
                <input {...register("discount")} type="number" className={inputCls} placeholder="Optional" />
              </Field>
              <Field label="MOQ">
                <input {...register("moq")} className={inputCls} placeholder="e.g. 10 pieces" />
              </Field>
              <Field label="Stock">
                <input {...register("stock")} type="number" className={inputCls} placeholder="Available units" />
              </Field>
              <Field label="Sample Available?">
                <select {...register("sampleAvailable")} className={selectCls}>
                  <option>Yes — Free Sample</option>
                  <option>Yes — Paid Sample</option>
                  <option>No</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          {/* ── 4. Supplier ── */}
          <SectionCard title="4. Supplier / Manufacturer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Supplier Name">
                <input {...register("supplierName")} className={inputCls} placeholder="e.g. Shafir Express LTD" />
              </Field>
              <Field label="Country of Origin">
                <select {...register("countryOfOrigin")} className={selectCls}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Years in Business">
                <input {...register("supplierYears")} className={inputCls} placeholder="e.g. 5 yrs" />
              </Field>
              <Field label="Certifications">
                <input {...register("certifications")} className={inputCls} placeholder="e.g. CE, RoHS, FCC" />
              </Field>
              <Field label="Factory Location">
                <input {...register("factoryLocation")} className={inputCls} placeholder="e.g. Shenzhen, China" />
              </Field>
              <Field label="Production Capacity">
                <input {...register("productionCapacity")} className={inputCls} placeholder="e.g. 50,000 pcs/month" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 5. Shipping ── */}
          <SectionCard title="5. Shipping & Trade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Incoterms">
                <select {...register("incoterms")} className={selectCls}>
                  {INCOTERMS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Shipping Method">
                <select {...register("shippingMethod")} className={selectCls}>
                  {SHIPPING_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Lead Time">
                <input {...register("leadTime")} className={inputCls} placeholder="e.g. 7-15 business days" />
              </Field>
              <Field label="Port of Loading">
                <input {...register("portOfLoading")} className={inputCls} placeholder="e.g. Shenzhen Port" />
              </Field>
            </div>
            <Field label="Shipping Notes">
              <textarea {...register("shippingNotes")} rows={2} className={inputCls}
                placeholder="e.g. Free sea freight above 500 units" />
            </Field>
          </SectionCard>

          {/* ── 6. Specifications ── */}
          <SectionCard title="6. Technical Specifications">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
              selectedCat ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {selectedCat ? <>✅ Showing <b>{selectedCat}</b> specs</> : <>⚠️ Select a category to load specs</>}
            </div>

            <div className="space-y-3">
              {specCategories.map((cat) => {
                const isOpen = openSpecCategory === cat.key;
                const filled = Object.values(specs[cat.key] ?? {}).filter(Boolean).length;
                return (
                  <div key={cat.key} className="rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button"
                      onClick={() => setOpenSpecCategory(isOpen ? null : cat.key)}
                      className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                        {filled > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                            {filled} filled
                          </span>
                        )}
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 pt-2 bg-gray-50">
                        {cat.fields.map((f) => (
                          <Field key={f.key} label={f.label}>
                            <input type="text"
                              placeholder={f.placeholder}
                              value={specs[cat.key]?.[f.key] ?? ""}
                              onChange={(e) => updateSpec(cat.key, f.key, e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ── 7. Packaging ── */}
          <SectionCard title="7. Packaging & Delivery">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Packaging Details">
                <input type="text" value={packagingDetails}
                  onChange={(e) => setPackagingDetails(e.target.value)}
                  className={inputCls} placeholder="e.g. 1pc in giftbox" />
              </Field>
              <Field label="Selling Unit">
                <input type="text" value={sellingUnit}
                  onChange={(e) => setSellingUnit(e.target.value)}
                  className={inputCls} placeholder="e.g. Single item" />
              </Field>
              <Field label="Gross Weight">
                <input {...register("grossWeight")} className={inputCls} placeholder="e.g. 150g" />
              </Field>
              <Field label="Carton Size">
                <input {...register("cartonSize")} className={inputCls} placeholder="e.g. 40×30×25 cm" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 8. Variations ── */}
          <SectionCard title="8. Product Variations">
            {variations.map((v, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input type="text" placeholder="Color" value={v.color}
                  onChange={(e) => updateVariation(i, "color", e.target.value)} className={inputCls} />
                <input type="text" placeholder="Size" value={v.size}
                  onChange={(e) => updateVariation(i, "size", e.target.value)} className={inputCls} />
                <input type="text" placeholder="Variant SKU" value={v.sku}
                  onChange={(e) => updateVariation(i, "sku", e.target.value)} className={inputCls} />
                <div className="flex gap-2">
                  <input type="text" placeholder="Stock" value={v.stock}
                    onChange={(e) => updateVariation(i, "stock", e.target.value)} className={inputCls} />
                  {variations.length > 1 && (
                    <button type="button" onClick={() => removeVariation(i)} className="text-red-400 hover:text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariation}
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <Plus className="w-4 h-4" /> Add Variation
            </button>
          </SectionCard>

          {/* ── 9. Tags ── */}
          <SectionCard title="9. Tags & Keywords">
            <div className="flex gap-2">
              <input type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag(e as any)}
                placeholder="e.g. gaming, TWS, OEM"
                className={`${inputCls} flex-grow`} />
              <button onClick={addTag}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1.5">
                  {t}
                  <X className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
                </span>
              ))}
            </div>
          </SectionCard>

          {/* ── 10. Description ── */}
          <SectionCard title="10. Description">
            <Field label="Short Description">
              <textarea {...register("shortDescription")} rows={2} className={inputCls}
                placeholder="Brief selling pitch..." />
            </Field>
            <Field label="Full Description">
              <textarea {...register("description")} rows={5} className={inputCls}
                placeholder="Detailed product description..." />
            </Field>
          </SectionCard>

          {/* ── 11. Media ── */}
          <SectionCard title="11. Product Media">

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Current Images ({existingImages.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img) => (
                    <div key={img._id} className="relative w-24 h-24 group">
                      <img src={img.url} alt="existing"
                        className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => deleteImageNow(img.public_id, img._id)}
                        disabled={deletingImageId === img._id}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                                   flex items-center justify-center opacity-0 group-hover:opacity-100
                                   transition hover:bg-red-600 disabled:opacity-50"
                        title="Delete from Cloudinary"
                      >
                        {deletingImageId === img._id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Trash2 className="w-3 h-3" />
                        }
                      </button>
                      <div className="absolute bottom-1 left-1 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                        saved
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new images */}
            <Field label="Add New Images">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-5 hover:border-green-500 transition bg-white">
                <Upload className="w-7 h-7 text-gray-400" />
                <span className="text-gray-500 mt-2 text-sm">Click to upload more images</span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => {
                    if (e.target.files)
                      setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }}
                />
              </label>
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 group">
                      <img src={URL.createObjectURL(img)} alt="new"
                        className="w-full h-full object-cover rounded-xl border-2 border-green-300" />
                      <button type="button"
                        onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                        new
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {/* Existing video */}
            {existingVideo?.url && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-500" /> Current Video
                </p>
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <video controls src={existingVideo.url}
                    className="w-full max-h-48 object-cover" />
                  <button type="button"
                    onClick={deleteVideoNow}
                    className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white
                               text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition">
                    <Trash2 className="w-3 h-3" /> Delete Video
                  </button>
                </div>
              </div>
            )}

            {/* Add new video */}
            {!existingVideo?.url && (
              <Field label="Add Video (Optional)">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-5 hover:border-green-500 transition bg-white">
                  <Upload className="w-7 h-7 text-gray-400" />
                  <span className="text-gray-500 mt-2 text-sm">Click to upload video</span>
                  <input type="file" accept="video/*" className="hidden"
                    onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)} />
                </label>
                {newVideo && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-green-300">
                    <video controls src={URL.createObjectURL(newVideo)} className="w-full max-h-48" />
                    <button type="button"
                      onClick={() => setNewVideo(null)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
                                 flex items-center justify-center hover:bg-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </Field>
            )}

            {/* Replace existing video */}
            {existingVideo?.url && !newVideo && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Or replace video:</p>
                <label className="flex items-center gap-2 border border-dashed border-gray-200 rounded-xl cursor-pointer px-4 py-3 hover:border-green-400 transition bg-white text-sm text-gray-500">
                  <Upload className="w-4 h-4" /> Upload replacement video
                  <input type="file" accept="video/*" className="hidden"
                    onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            )}
          </SectionCard>

          {/* ── Submit ── */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitLoading}
              className="flex-1 bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                : <>✅ Update Product</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}