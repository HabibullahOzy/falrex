// 'use client'
// import { useState, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import {
//   Upload, X, Plus, ChevronDown, ChevronUp,
//   Trash2, ImageOff, VideoOff, AlertTriangle,
//   CheckCircle2, Loader2, RefreshCw
// } from "lucide-react";

// // ── Category Tree & Specs (same as CreateProduct) ─────────────────────────
// const CATEGORY_TREE = {
//   "Consumer Electronics": {
//     "TWS & Earphones":     ["Gaming Earbuds", "ANC Earbuds", "Wired Earphones", "Open-Ear"],
//     "Headphones":          ["Over-Ear", "On-Ear", "Noise Cancelling", "Studio Monitor"],
//     "Speakers":            ["Portable Bluetooth", "Smart Speaker", "Soundbar", "Party Speaker"],
//     "Smartwatch & Bands":  ["Fitness Tracker", "Smart Band", "Luxury Smartwatch", "Kids Watch"],
//     "Mobile Accessories":  ["Power Bank", "Charger & Cables", "Phone Case", "Screen Protector"],
//     "PC Peripherals":      ["Mechanical Keyboard", "Gaming Mouse", "Webcam", "USB Hub"],
//     "LED & Lighting":      ["LED Strip", "Smart Bulb", "Desk Lamp", "RGB Light"],
//   },
//   "Fashion & Apparel": {
//     "Men's Clothing":      ["T-Shirt", "Polo Shirt", "Hoodie", "Jacket", "Trousers"],
//     "Women's Clothing":    ["Dress", "Blouse", "Skirt", "Abaya", "Leggings"],
//     "Streetwear":          ["Oversized Tee", "Cargo Pants", "Bomber Jacket", "Cap"],
//     "Footwear":            ["Sneakers", "Sandals", "Formal Shoes", "Boots"],
//     "Bags & Luggage":      ["Backpack", "Tote Bag", "Crossbody", "Luggage Set"],
//     "Headwear":            ["Baseball Cap", "Bucket Hat", "Beanie", "Hijab"],
//   },
//   "Beauty & Personal Care": {
//     "Skincare":            ["Moisturizer", "Serum", "Sunscreen", "Face Wash", "Toner"],
//     "Haircare":            ["Shampoo", "Conditioner", "Hair Oil", "Hair Mask"],
//     "Makeup":              ["Foundation", "Lipstick", "Mascara", "Eyeshadow"],
//     "Fragrances":          ["Perfume", "Body Mist", "Attar", "Deodorant"],
//     "Personal Hygiene":    ["Soap", "Hand Sanitizer", "Toothbrush", "Razor"],
//   },
//   "Jewellery & Accessories": {
//     "Gold Jewellery":      ["Gold Necklace", "Gold Ring", "Gold Crown", "Gold Bracelet", "Gold Earring", "Gold Bangle"],
//     "Silver Jewellery":    ["Silver Necklace", "Silver Ring", "Silver Bracelet", "Silver Earring"],
//     "Artificial Jewellery":["Fashion Necklace", "Fashion Ring", "Fashion Earring", "Fashion Bangle"],
//     "Diamond Jewellery":   ["Diamond Ring", "Diamond Necklace", "Diamond Earring", "Diamond Pendant"],
//     "Gemstone Jewellery":  ["Ruby", "Sapphire", "Emerald", "Pearl", "Opal"],
//     "Watches":             ["Luxury Watch", "Sports Watch", "Couple Watch", "Pocket Watch"],
//   },
//   "Home & Kitchen": {
//     "Cookware":            ["Non-Stick Pan", "Pressure Cooker", "Wok", "Pot Set"],
//     "Kitchen Appliances":  ["Blender", "Rice Cooker", "Air Fryer", "Microwave"],
//     "Furniture":           ["Sofa", "Office Chair", "Dining Table", "Bookshelf"],
//     "Bedding":             ["Pillow", "Blanket", "Mattress", "Bed Sheet"],
//     "Home Decor":          ["Wall Art", "Vase", "Mirror", "Curtains"],
//   },
//   "Sports & Outdoors": {
//     "Fitness Equipment":   ["Dumbbell", "Resistance Band", "Yoga Mat", "Treadmill"],
//     "Sportswear":          ["Jersey", "Track Suit", "Compression Wear", "Sports Shoes"],
//     "Outdoor Gear":        ["Tent", "Sleeping Bag", "Hiking Boots", "Backpack"],
//     "Team Sports":         ["Football", "Cricket Gear", "Basketball", "Badminton"],
//   },
//   "Industrial & Machinery": {
//     "Power Tools":         ["Drill", "Angle Grinder", "Circular Saw", "Welding Machine"],
//     "Safety Equipment":    ["Helmet", "Safety Gloves", "Reflective Vest", "Safety Boots"],
//     "Packaging Machinery": ["Sealing Machine", "Labelling Machine", "Filling Machine"],
//     "Electrical":          ["Cable & Wire", "Switch & Socket", "Circuit Breaker", "Generator"],
//   },
//   "Health & Medical": {
//     "Medical Devices":     ["Blood Pressure Monitor", "Glucometer", "Pulse Oximeter", "Thermometer"],
//     "Supplements":         ["Protein Powder", "Vitamins", "Fish Oil", "Probiotic"],
//     "PPE":                 ["Surgical Mask", "N95 Mask", "Gloves", "Gown"],
//     "Wellness":            ["Essential Oil", "Massage Device", "Heating Pad", "Eye Mask"],
//   },
//   "Toys & Hobbies": {
//     "Kids Toys":           ["Action Figure", "Doll", "Building Block", "RC Car"],
//     "Board Games":         ["Chess", "Puzzle", "Card Game", "Strategy Game"],
//     "Art & Craft":         ["Color Pencil", "Canvas", "Clay", "Painting Kit"],
//     "Collectibles":        ["Funko Pop", "Die-cast Model", "Trading Card", "Figurine"],
//   },
//   "Automotive": {
//     "Car Accessories":     ["Car Charger", "Dash Cam", "Car Perfume", "Seat Cover"],
//     "Motorcycle Parts":    ["Helmet", "Gloves", "Chain Lube", "Mirror"],
//     "Car Care":            ["Wax & Polish", "Microfiber Cloth", "Tyre Inflator", "Car Vacuum"],
//     "Navigation":          ["GPS Tracker", "HUD Display", "Backup Camera", "Car Mount"],
//   },
//   "Food & Beverage": {
//     "Snacks":              ["Chips", "Biscuits", "Nuts & Dried Fruits", "Energy Bar"],
//     "Beverages":           ["Juice", "Energy Drink", "Tea & Coffee", "Mineral Water"],
//     "Organic & Natural":   ["Organic Honey", "Cold Pressed Oil", "Herbal Tea", "Spices"],
//     "Dairy & Eggs":        ["Milk Powder", "Cheese", "Butter", "Yogurt"],
//   },
// };

// const SPEC_BY_CATEGORY = {
//   "Consumer Electronics": [
//     { key: "audio", label: "Audio", fields: [
//       { key: "chipset",           label: "Chipset",            placeholder: "e.g. JL6983D2" },
//       { key: "soundProfile",      label: "Sound Profile",      placeholder: "e.g. HiFi Ultra-Bass" },
//       { key: "driverSize",        label: "Driver Size",        placeholder: "e.g. 13mm Dynamic Driver" },
//       { key: "latency",           label: "Latency",            placeholder: "e.g. < 30ms Game Mode" },
//       { key: "frequencyResponse", label: "Frequency Response", placeholder: "e.g. 20Hz - 20kHz" },
//     ]},
//     { key: "battery", label: "Battery", fields: [
//       { key: "earphoneCapacity",    label: "Earphone Capacity",  placeholder: "e.g. 30 mAh" },
//       { key: "chargingBoxCapacity", label: "Charging Box",       placeholder: "e.g. 300 mAh" },
//       { key: "musicCallTime",       label: "Music / Call Time",  placeholder: "e.g. 3-4 hrs" },
//       { key: "standbyTime",         label: "Standby Time",       placeholder: "e.g. 120 hrs" },
//       { key: "chargingTime",        label: "Charging Time",      placeholder: "e.g. 1.5 hrs" },
//       { key: "interface",           label: "Charging Interface", placeholder: "e.g. Type-C" },
//     ]},
//     { key: "build", label: "Build & Design", fields: [
//       { key: "waterproofStandard",  label: "Waterproof Standard", placeholder: "e.g. IPX-4" },
//       { key: "gameAtmosphereLight", label: "Atmosphere Light",    placeholder: "e.g. RGB LED" },
//       { key: "material",            label: "Material",            placeholder: "e.g. ABS + PC" },
//       { key: "weight",              label: "Weight",              placeholder: "e.g. 45g" },
//     ]},
//     { key: "connectivity", label: "Connectivity", fields: [
//       { key: "bluetoothVersion",    label: "Bluetooth Version",     placeholder: "e.g. V5.3" },
//       { key: "transmissionDistance",label: "Transmission Distance", placeholder: "e.g. 10-15m" },
//       { key: "protocols",           label: "Protocols",             placeholder: "e.g. HFP/A2DP" },
//     ]},
//     { key: "business", label: "Business / OEM", fields: [
//       { key: "oemOdm",    label: "OEM / ODM",    placeholder: "e.g. Available" },
//       { key: "customLogo",label: "Custom Logo",  placeholder: "e.g. MOQ 500+" },
//       { key: "leadTime",  label: "Lead Time",    placeholder: "e.g. 7-15 Days" },
//     ]},
//   ],
//   "Fashion & Apparel": [
//     { key: "fabric", label: "Fabric & Material", fields: [
//       { key: "composition", label: "Composition",   placeholder: "e.g. 100% Cotton" },
//       { key: "weight",      label: "Fabric Weight", placeholder: "e.g. 280 GSM" },
//       { key: "finish",      label: "Finish",        placeholder: "e.g. Enzyme Washed" },
//       { key: "texture",     label: "Texture",       placeholder: "e.g. Fleece / Jersey" },
//     ]},
//     { key: "sizing", label: "Sizing", fields: [
//       { key: "fit",      label: "Fit",       placeholder: "e.g. Oversized / Slim Fit" },
//       { key: "sizes",    label: "Sizes",     placeholder: "e.g. XS - 4XL" },
//       { key: "shrinkage",label: "Shrinkage", placeholder: "e.g. Pre-shrunk < 3%" },
//     ]},
//     { key: "customization", label: "Customization", fields: [
//       { key: "printing",  label: "Printing Method", placeholder: "e.g. Screen Print / DTG" },
//       { key: "label",     label: "Label",           placeholder: "e.g. Custom Woven Label" },
//       { key: "packaging", label: "Packaging",       placeholder: "e.g. Individual Poly Bag" },
//     ]},
//     { key: "business", label: "Business / OEM", fields: [
//       { key: "moqPerColor",label: "MOQ Per Color", placeholder: "e.g. 50 pcs" },
//       { key: "sampleTime", label: "Sample Time",   placeholder: "e.g. 5-7 Days" },
//       { key: "leadTime",   label: "Lead Time",     placeholder: "e.g. 15-20 Days" },
//     ]},
//   ],
//   "Jewellery & Accessories": [
//     { key: "material", label: "Material & Metal", fields: [
//       { key: "baseMetal", label: "Base Metal",    placeholder: "e.g. 925 Sterling Silver" },
//       { key: "plating",   label: "Plating",       placeholder: "e.g. 18K Gold 3 Microns" },
//       { key: "purity",    label: "Purity / Karat",placeholder: "e.g. 22K, 18K, 14K" },
//       { key: "hallmark",  label: "Hallmark",      placeholder: "e.g. BIS 916 Certified" },
//     ]},
//     { key: "gemstone", label: "Gemstone", fields: [
//       { key: "stoneType",  label: "Stone Type",   placeholder: "e.g. Diamond / Ruby / CZ" },
//       { key: "stoneWeight",label: "Stone Weight", placeholder: "e.g. 0.5 Carat" },
//       { key: "stoneCut",   label: "Stone Cut",    placeholder: "e.g. Round Brilliant" },
//       { key: "clarity",    label: "Clarity",      placeholder: "e.g. VS1 / SI1" },
//       { key: "color",      label: "Color Grade",  placeholder: "e.g. D / E / F" },
//     ]},
//     { key: "dimensions", label: "Dimensions & Weight", fields: [
//       { key: "itemWeight", label: "Item Weight",   placeholder: "e.g. 4.5g" },
//       { key: "length",     label: "Length / Size", placeholder: "e.g. 45cm + 5cm adj." },
//       { key: "width",      label: "Width",         placeholder: "e.g. 12mm" },
//       { key: "thickness",  label: "Thickness",     placeholder: "e.g. 1.5mm" },
//     ]},
//     { key: "finish", label: "Finish & Style", fields: [
//       { key: "finish",    label: "Surface Finish", placeholder: "e.g. Polished / Matte" },
//       { key: "style",     label: "Style",          placeholder: "e.g. Minimalist / Antique" },
//       { key: "occasion",  label: "Occasion",       placeholder: "e.g. Wedding / Daily Wear" },
//       { key: "gender",    label: "Gender",         placeholder: "e.g. Women / Unisex" },
//     ]},
//     { key: "business", label: "Business / OEM", fields: [
//       { key: "packaging",  label: "Packaging",   placeholder: "e.g. Velvet Box + Pouch" },
//       { key: "certificate",label: "Certificate", placeholder: "e.g. GIA / IGI Certified" },
//       { key: "customLogo", label: "Custom Logo", placeholder: "e.g. Laser Engraving" },
//       { key: "leadTime",   label: "Lead Time",   placeholder: "e.g. 7-10 Days" },
//     ]},
//   ],
// };

// const DEFAULT_SPECS = [
//   { key: "general", label: "General Specs", fields: [
//     { key: "material", label: "Material", placeholder: "e.g. Stainless Steel" },
//     { key: "weight",   label: "Weight",   placeholder: "e.g. 500g" },
//     { key: "color",    label: "Color",    placeholder: "e.g. Black / White" },
//     { key: "size",     label: "Size",     placeholder: "e.g. 20 x 10 x 5 cm" },
//   ]},
//   { key: "business", label: "Business / OEM", fields: [
//     { key: "moq",      label: "MOQ",       placeholder: "e.g. 100 pcs" },
//     { key: "leadTime", label: "Lead Time", placeholder: "e.g. 15 Days" },
//     { key: "oemOdm",   label: "OEM / ODM", placeholder: "e.g. Available" },
//   ]},
// ];

// const CURRENCIES       = ["BDT (৳)", "USD ($)", "EUR (€)", "GBP (£)", "CNY (¥)", "INR (₹)", "JPY (¥)"];
// const SHIPPING_METHODS = ["Sea Freight", "Air Freight", "Express (DHL/FedEx)", "Rail Freight", "Road Freight"];
// const INCOTERMS        = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA"];
// const COUNTRIES        = ["Bangladesh (BD)", "China (CN)", "India (IN)", "United States (US)",
//   "Germany (DE)", "United Kingdom (GB)", "Turkey (TR)", "Vietnam (VN)",
//   "South Korea (KR)", "Japan (JP)", "Italy (IT)", "France (FR)"];

// function buildEmptySpecs(categories) {
//   return Object.fromEntries(
//     categories.map((cat) => [
//       cat.key,
//       Object.fromEntries(cat.fields.map((f) => [f.key, ""])),
//     ])
//   );
// }

// // ── UI helpers ────────────────────────────────────────────────────────────
// function SectionCard({ title, badge, children }) {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
//       <div className="flex items-center gap-2">
//         <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
//         {badge && (
//           <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
//             {badge}
//           </span>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
//       {children}
//     </div>
//   );
// }

// const inputCls  = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm";
// const selectCls = `${inputCls} appearance-none`;

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// // ═══════════════════════════════════════════════════════════════════════════
// // UpdateProduct Component
// // Props:
// //   productId  — string  (the _id of the product to update)
// //   onSuccess  — fn(updatedProduct)  called after successful save
// //   onCancel   — fn()  called when user clicks Cancel
// // ═══════════════════════════════════════════════════════════════════════════
// export default function UpdateProduct({ productId, onSuccess, onCancel }) {
//   const { register, reset, handleSubmit, setValue } = useForm();

//   // ── Loading / status ────────────────────────────────────────────────────
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [saving,       setSaving]       = useState(false);
//   const [toast,        setToast]        = useState(null); // { type: 'success'|'error', msg }

//   // ── Category cascade ────────────────────────────────────────────────────
//   const [selectedCategory,  setSelectedCategory]  = useState("");
//   const [selectedSubCat,    setSelectedSubCat]    = useState("");
//   const [selectedSubSubCat, setSelectedSubSubCat] = useState("");

//   // ── Specs ───────────────────────────────────────────────────────────────
//   const [specCategories,   setSpecCategories]   = useState(DEFAULT_SPECS);
//   const [specs,            setSpecs]            = useState(buildEmptySpecs(DEFAULT_SPECS));
//   const [openSpecCategory, setOpenSpecCategory] = useState(null);

//   // ── Existing media (from DB) ────────────────────────────────────────────
//   const [existingImages,  setExistingImages]  = useState([]); // [{url, public_id}]
//   const [existingVideo,   setExistingVideo]   = useState(null); // {url, public_id} | null
//   const [deletedImageIds, setDeletedImageIds] = useState([]); // public_ids queued for deletion
//   const [deleteVideo,     setDeleteVideo]     = useState(false);

//   // ── New media files to upload ───────────────────────────────────────────
//   const [newImages, setNewImages] = useState([]); // File[]
//   const [newVideo,  setNewVideo]  = useState(null); // File | null

//   // ── Tags / Variations / Packaging ──────────────────────────────────────
//   const [tags,            setTags]            = useState([]);
//   const [tagInput,        setTagInput]        = useState("");
//   const [variations,      setVariations]      = useState([{ color: "", size: "", sku: "", stock: "" }]);
//   const [packagingDetails,setPackagingDetails]= useState("");
//   const [sellingUnit,     setSellingUnit]     = useState("Single item");

//   // ── Derived selects ─────────────────────────────────────────────────────
//   const subCategories    = selectedCategory ? Object.keys(CATEGORY_TREE[selectedCategory] ?? {}) : [];
//   const subSubCategories = selectedSubCat   ? (CATEGORY_TREE[selectedCategory]?.[selectedSubCat] ?? []) : [];

//   // ── Show toast ──────────────────────────────────────────────────────────
//   const showToast = (type, msg) => {
//     setToast({ type, msg });
//     setTimeout(() => setToast(null), 4000);
//   };

//   // ── Fetch existing product ──────────────────────────────────────────────
//   const fetchProduct = useCallback(async () => {
//     setFetchLoading(true);
//     try {
//       const res  = await fetch(`${API}/product/${productId}`);
//       const json = await res.json();
//       if (!json.success) throw new Error(json.message);
//       const p = json.data;

//       // Fill react-hook-form fields
//       reset({
//         nameEng:            p.nameEng            ?? "",
//         nameLocal:          p.nameLocal          ?? "",
//         brand:              p.brand              ?? "",
//         modelNumber:        p.modelNumber        ?? "",
//         sku:                p.sku                ?? "",
//         slug:               p.slug               ?? "",
//         hsCode:             p.hsCode             ?? "",
//         price:              p.price              ?? "",
//         currency:           p.currency           ?? "BDT (৳)",
//         discount:           p.discount           ?? "",
//         moq:                p.moq                ?? "",
//         stock:              p.stock              ?? "",
//         sampleAvailable:    p.sampleAvailable    ?? "Yes — Free Sample",
//         supplierName:       p.supplierName       ?? "",
//         countryOfOrigin:    p.countryOfOrigin    ?? "Bangladesh (BD)",
//         supplierYears:      p.supplierYears      ?? "",
//         certifications:     p.certifications     ?? "",
//         factoryLocation:    p.factoryLocation    ?? "",
//         productionCapacity: p.productionCapacity ?? "",
//         incoterms:          p.incoterms          ?? "FOB",
//         shippingMethod:     p.shippingMethod     ?? "Sea Freight",
//         leadTime:           p.leadTime           ?? "",
//         portOfLoading:      p.portOfLoading      ?? "",
//         shippingNotes:      p.shippingNotes      ?? "",
//         grossWeight:        p.grossWeight        ?? "",
//         cartonSize:         p.cartonSize         ?? "",
//         shortDescription:   p.shortDescription   ?? "",
//         description:        p.description        ?? "",
//       });

//       // Category cascade
//       setSelectedCategory(p.category    ?? "");
//       setSelectedSubCat(  p.subcategory ?? "");
//       setSelectedSubSubCat(p.subSubcategory ?? "");

//       // Specs
//       const cats = SPEC_BY_CATEGORY[p.category] ?? DEFAULT_SPECS;
//       setSpecCategories(cats);
//       const emptySpecs = buildEmptySpecs(cats);
//       // Merge saved specs into empty template (so all keys exist)
//       const merged = {};
//       cats.forEach((cat) => {
//         merged[cat.key] = { ...emptySpecs[cat.key], ...(p.specifications?.[cat.key] ?? {}) };
//       });
//       setSpecs(merged);

//       // Tags, variations, packaging
//       setTags(p.tags ?? []);
//       setVariations(
//         p.variations?.length > 0
//           ? p.variations
//           : [{ color: "", size: "", sku: "", stock: "" }]
//       );
//       setPackagingDetails(p.packagingDetails ?? "");
//       setSellingUnit(p.sellingUnit ?? "Single item");

//       // Media
//       setExistingImages(p.images ?? []);
//       setExistingVideo(p.video?.url ? p.video : null);

//     } catch (err) {
//       showToast("error", `Failed to load product: ${err.message}`);
//     } finally {
//       setFetchLoading(false);
//     }
//   }, [productId, reset]);

//   useEffect(() => { fetchProduct(); }, [fetchProduct]);

//   // ── When category changes manually ─────────────────────────────────────
//   const handleCategoryChange = (cat) => {
//     setSelectedCategory(cat);
//     setSelectedSubCat("");
//     setSelectedSubSubCat("");
//     const newCats = SPEC_BY_CATEGORY[cat] ?? DEFAULT_SPECS;
//     setSpecCategories(newCats);
//     setSpecs(buildEmptySpecs(newCats));
//     setOpenSpecCategory(null);
//   };

//   // ── Spec handler ────────────────────────────────────────────────────────
//   const updateSpec = (category, field, value) => {
//     setSpecs((prev) => ({
//       ...prev,
//       [category]: { ...prev[category], [field]: value },
//     }));
//   };

//   // ── Existing image: mark for deletion ───────────────────────────────────
//   const markImageForDeletion = (public_id) => {
//     setDeletedImageIds((prev) =>
//       prev.includes(public_id) ? prev.filter((id) => id !== public_id) : [...prev, public_id]
//     );
//   };

//   // ── New images ──────────────────────────────────────────────────────────
//   const handleNewImages = (e) => {
//     if (e.target.files) setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
//   };
//   const removeNewImage = (i) => setNewImages((prev) => prev.filter((_, idx) => idx !== i));

//   // ── Tags ─────────────────────────────────────────────────────────────────
//   const addTag = (e) => {
//     e.preventDefault();
//     if (tagInput.trim() && !tags.includes(tagInput.trim())) {
//       setTags([...tags, tagInput.trim()]);
//       setTagInput("");
//     }
//   };

//   // ── Variations ──────────────────────────────────────────────────────────
//   const addVariation    = () => setVariations([...variations, { color: "", size: "", sku: "", stock: "" }]);
//   const removeVariation = (i) => setVariations((prev) => prev.filter((_, idx) => idx !== i));
//   const updateVariation = (i, field, value) => {
//     const updated = [...variations];
//     updated[i] = { ...updated[i], [field]: value };
//     setVariations(updated);
//   };

//   // ── Submit ──────────────────────────────────────────────────────────────
//   const onSubmit = async (data) => {
//     setSaving(true);
//     try {
//       const formData = new FormData();

//       // Scalar fields
//       Object.entries(data).forEach(([k, v]) => formData.append(k, v ?? ""));
//       formData.set("category",       selectedCategory);
//       formData.set("subcategory",    selectedSubCat);
//       formData.set("subSubcategory", selectedSubSubCat);

//       // JSON fields
//       formData.append("specifications",  JSON.stringify(specs));
//       formData.append("tags",            JSON.stringify(tags));
//       formData.append("variations",      JSON.stringify(variations));
//       formData.append("packagingDetails",packagingDetails);
//       formData.append("sellingUnit",     sellingUnit);

//       // Media deletion flags
//       if (deletedImageIds.length > 0)
//         formData.append("deletedImages", JSON.stringify(deletedImageIds));
//       if (deleteVideo)
//         formData.append("deleteVideo", "true");

//       // New files
//       newImages.forEach((f) => formData.append("images", f));
//       if (newVideo) formData.append("video", newVideo);

//       const res  = await fetch(`${API}/product/${productId}`, { method: "PUT", body: formData });
//       const json = await res.json();

//       if (!json.success) throw new Error(json.message);

//       showToast("success", "✅ Product updated successfully!");
//       if (onSuccess) onSuccess(json.data);

//       // Refresh local state from response
//       setExistingImages(json.data.images ?? []);
//       setExistingVideo(json.data.video?.url ? json.data.video : null);
//       setDeletedImageIds([]);
//       setDeleteVideo(false);
//       setNewImages([]);
//       setNewVideo(null);

//     } catch (err) {
//       showToast("error", `❌ Update failed: ${err.message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Loading skeleton ────────────────────────────────────────────────────
//   if (fetchLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center space-y-4">
//           <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
//           <p className="text-gray-500 font-medium">Loading product data…</p>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ──────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen flex justify-center items-start p-4 md:p-6 bg-gray-50">

//       {/* Toast */}
//       {toast && (
//         <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
//           toast.type === "success" ? "bg-green-600" : "bg-red-600"
//         }`}>
//           {toast.type === "success"
//             ? <CheckCircle2 className="w-5 h-5" />
//             : <AlertTriangle className="w-5 h-5" />}
//           {toast.msg}
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-5xl space-y-8">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">✏️ Update Product</h1>
//             <p className="text-sm text-gray-500 mt-1">Edit product details · changes save to database & Cloudinary</p>
//           </div>
//           <button onClick={() => fetchProduct()}
//             title="Reload from database"
//             className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
//             <RefreshCw className="w-5 h-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

//           {/* ── 1. Basic Info ── */}
//           <SectionCard title="1. Basic Information">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Product Name (English) *">
//                 <input {...register("nameEng", { required: true })} type="text"
//                   placeholder="e.g. MK47 OEM/ODM Gaming Earbuds TWS" className={inputCls} />
//               </Field>
//               <Field label="Product Name (Local / Chinese)">
//                 <input {...register("nameLocal")} type="text"
//                   placeholder="Optional local language name" className={inputCls} />
//               </Field>
//               <Field label="Brand / Trade Name">
//                 <input {...register("brand")} type="text" placeholder="e.g. Shafir Express" className={inputCls} />
//               </Field>
//               <Field label="Model Number">
//                 <input {...register("modelNumber")} type="text" placeholder="e.g. MK47" className={inputCls} />
//               </Field>
//               <Field label="SKU / Product ID">
//                 <input {...register("sku")} type="text" placeholder="e.g. B2B-MK47-9921" className={inputCls} />
//               </Field>
//               <Field label="Slug / URL Key">
//                 <input {...register("slug")} type="text" placeholder="e.g. mk47-gaming-earbuds-tws" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 2. Category ── */}
//           <SectionCard title="2. Category & Classification">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Field label="Category *">
//                 <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className={selectCls}>
//                   <option value="">— Select Category —</option>
//                   {Object.keys(CATEGORY_TREE).map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Subcategory">
//                 <select value={selectedSubCat}
//                   onChange={(e) => { setSelectedSubCat(e.target.value); setSelectedSubSubCat(""); }}
//                   className={selectCls} disabled={!selectedCategory}>
//                   <option value="">— Select Subcategory —</option>
//                   {subCategories.map((s) => <option key={s}>{s}</option>)}
//                 </select>
//               </Field>
//               <Field label="Sub-subcategory">
//                 <select value={selectedSubSubCat} onChange={(e) => setSelectedSubSubCat(e.target.value)}
//                   className={selectCls} disabled={!selectedSubCat}>
//                   <option value="">— Select Type —</option>
//                   {subSubCategories.map((s) => <option key={s}>{s}</option>)}
//                 </select>
//               </Field>
//             </div>

//             {selectedCategory && (
//               <div className="flex items-center gap-2 flex-wrap mt-1">
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{selectedCategory}</span>
//                 {selectedSubCat && (<><span className="text-gray-400 text-xs">›</span>
//                   <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{selectedSubCat}</span></>)}
//                 {selectedSubSubCat && (<><span className="text-gray-400 text-xs">›</span>
//                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{selectedSubSubCat}</span></>)}
//               </div>
//             )}

//             <Field label="HS Code">
//               <input {...register("hsCode")} type="text" placeholder="e.g. 8518.30.00" className={inputCls} />
//             </Field>
//           </SectionCard>

//           {/* ── 3. Pricing ── */}
//           <SectionCard title="3. Pricing & Order Info">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Field label="Unit Price">
//                 <input {...register("price")} type="number" step="0.01" placeholder="e.g. 700" className={inputCls} />
//               </Field>
//               <Field label="Currency">
//                 <select {...register("currency")} className={selectCls}>
//                   {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Discount (%)">
//                 <input {...register("discount")} type="number" placeholder="Optional" className={inputCls} />
//               </Field>
//               <Field label="MOQ">
//                 <input {...register("moq")} type="text" placeholder="e.g. 10 pieces" className={inputCls} />
//               </Field>
//               <Field label="Stock / Inventory">
//                 <input {...register("stock")} type="number" placeholder="Available units" className={inputCls} />
//               </Field>
//               <Field label="Sample Available?">
//                 <select {...register("sampleAvailable")} className={selectCls}>
//                   <option>Yes — Free Sample</option>
//                   <option>Yes — Paid Sample</option>
//                   <option>No</option>
//                 </select>
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 4. Supplier ── */}
//           <SectionCard title="4. Supplier / Manufacturer">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Supplier / Company Name">
//                 <input {...register("supplierName")} type="text" placeholder="e.g. Shafir Express LTD" className={inputCls} />
//               </Field>
//               <Field label="Country of Origin">
//                 <select {...register("countryOfOrigin")} className={selectCls}>
//                   {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Years in Business">
//                 <input {...register("supplierYears")} type="text" placeholder="e.g. 5 yrs" className={inputCls} />
//               </Field>
//               <Field label="Certifications">
//                 <input {...register("certifications")} type="text" placeholder="e.g. CE, RoHS, FCC, ISO 9001" className={inputCls} />
//               </Field>
//               <Field label="Factory Location">
//                 <input {...register("factoryLocation")} type="text" placeholder="e.g. Shenzhen, Guangdong, China" className={inputCls} />
//               </Field>
//               <Field label="Production Capacity">
//                 <input {...register("productionCapacity")} type="text" placeholder="e.g. 50,000 pcs/month" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 5. Shipping ── */}
//           <SectionCard title="5. Shipping & Trade Terms">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Incoterms">
//                 <select {...register("incoterms")} className={selectCls}>
//                   {INCOTERMS.map((t) => <option key={t}>{t}</option>)}
//                 </select>
//               </Field>
//               <Field label="Shipping Method">
//                 <select {...register("shippingMethod")} className={selectCls}>
//                   {SHIPPING_METHODS.map((m) => <option key={m}>{m}</option>)}
//                 </select>
//               </Field>
//               <Field label="Lead Time">
//                 <input {...register("leadTime")} type="text" placeholder="e.g. 7-15 business days" className={inputCls} />
//               </Field>
//               <Field label="Port of Loading">
//                 <input {...register("portOfLoading")} type="text" placeholder="e.g. Shenzhen Port, CN" className={inputCls} />
//               </Field>
//             </div>
//             <Field label="Shipping Details / Notes">
//               <textarea {...register("shippingNotes")} rows={3}
//                 placeholder="e.g. Free sea freight for orders above 500 units…" className={inputCls} />
//             </Field>
//           </SectionCard>

//           {/* ── 6. Technical Specifications ── */}
//           <SectionCard title="6. Technical Specifications">
//             <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
//               selectedCategory
//                 ? "bg-blue-50 text-blue-700 border border-blue-200"
//                 : "bg-amber-50 text-amber-700 border border-amber-200"
//             }`}>
//               {selectedCategory
//                 ? <>✅ Showing <b>{selectedCategory}</b> specifications</>
//                 : <>⚠️ Select a category above to load relevant specification fields</>}
//             </div>

//             <div className="space-y-3">
//               {specCategories.map((cat) => {
//                 const isOpen = openSpecCategory === cat.key;
//                 const filled = Object.values(specs[cat.key] ?? {}).filter(Boolean).length;
//                 return (
//                   <div key={cat.key} className="rounded-xl border border-gray-200 overflow-hidden">
//                     <button type="button"
//                       onClick={() => setOpenSpecCategory(isOpen ? null : cat.key)}
//                       className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
//                         {filled > 0 && (
//                           <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
//                             {filled} filled
//                           </span>
//                         )}
//                       </div>
//                       {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
//                     </button>

//                     {isOpen && (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 pt-2 bg-gray-50">
//                         {cat.fields.map((f) => (
//                           <Field key={f.key} label={f.label}>
//                             <input type="text" placeholder={f.placeholder}
//                               value={specs[cat.key]?.[f.key] ?? ""}
//                               onChange={(e) => updateSpec(cat.key, f.key, e.target.value)}
//                               className={inputCls} />
//                           </Field>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </SectionCard>

//           {/* ── 7. Packaging ── */}
//           <SectionCard title="7. Packaging & Delivery">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Packaging Details">
//                 <input type="text" value={packagingDetails}
//                   onChange={(e) => setPackagingDetails(e.target.value)}
//                   placeholder="e.g. 1pc in giftbox, 10 boxes per carton" className={inputCls} />
//               </Field>
//               <Field label="Selling Unit">
//                 <input type="text" value={sellingUnit}
//                   onChange={(e) => setSellingUnit(e.target.value)}
//                   placeholder="e.g. Single item, Set, Carton" className={inputCls} />
//               </Field>
//               <Field label="Gross Weight (per unit)">
//                 <input {...register("grossWeight")} type="text" placeholder="e.g. 150g" className={inputCls} />
//               </Field>
//               <Field label="Carton Size (L × W × H cm)">
//                 <input {...register("cartonSize")} type="text" placeholder="e.g. 40 × 30 × 25 cm" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 8. Variations ── */}
//           <SectionCard title="8. Product Variations">
//             {variations.map((v, i) => (
//               <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 items-center">
//                 <input type="text" placeholder="Color" value={v.color}
//                   onChange={(e) => updateVariation(i, "color", e.target.value)} className={inputCls} />
//                 <input type="text" placeholder="Size" value={v.size}
//                   onChange={(e) => updateVariation(i, "size", e.target.value)} className={inputCls} />
//                 <input type="text" placeholder="Variant SKU" value={v.sku}
//                   onChange={(e) => updateVariation(i, "sku", e.target.value)} className={inputCls} />
//                 <div className="flex gap-2">
//                   <input type="text" placeholder="Stock" value={v.stock}
//                     onChange={(e) => updateVariation(i, "stock", e.target.value)} className={inputCls} />
//                   {variations.length > 1 && (
//                     <button type="button" onClick={() => removeVariation(i)}
//                       className="text-red-400 hover:text-red-600 flex-shrink-0">
//                       <X className="w-5 h-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             <button type="button" onClick={addVariation}
//               className="flex items-center gap-1 text-sm text-blue-600 mt-1 hover:text-blue-700">
//               <Plus className="w-4 h-4" /> Add Variation
//             </button>
//           </SectionCard>

//           {/* ── 9. Tags ── */}
//           <SectionCard title="9. Tags & Keywords">
//             <div className="flex gap-2">
//               <input type="text" value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && addTag(e)}
//                 placeholder="e.g. gaming, TWS, OEM"
//                 className={`${inputCls} flex-grow`} />
//               <button onClick={addTag}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium whitespace-nowrap">
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {tags.map((t, i) => (
//                 <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1.5">
//                   {t}
//                   <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
//                 </span>
//               ))}
//             </div>
//           </SectionCard>

//           {/* ── 10. Description ── */}
//           <SectionCard title="10. Description">
//             <Field label="Short Description / Marketing Copy">
//               <textarea {...register("shortDescription")} rows={3}
//                 placeholder="Brief selling pitch…" className={inputCls} />
//             </Field>
//             <Field label="Full Description">
//               <textarea {...register("description")} rows={6}
//                 placeholder="Detailed product description…" className={inputCls} />
//             </Field>
//           </SectionCard>

//           {/* ── 11. Media Management ── */}
//           <SectionCard title="11. Product Media" badge="Cloudinary">

//             {/* Existing Images */}
//             <div>
//               <p className="text-sm font-semibold text-gray-700 mb-3">
//                 Existing Images
//                 {deletedImageIds.length > 0 && (
//                   <span className="ml-2 text-red-500 text-xs font-normal">
//                     ({deletedImageIds.length} marked for deletion)
//                   </span>
//                 )}
//               </p>

//               {existingImages.length === 0 ? (
//                 <p className="text-sm text-gray-400 italic">No images saved yet.</p>
//               ) : (
//                 <div className="flex flex-wrap gap-3">
//                   {existingImages.map((img, idx) => {
//                     const markedForDelete = deletedImageIds.includes(img.public_id);
//                     return (
//                       <div key={idx} className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 transition ${
//                         markedForDelete ? "border-red-400 opacity-50" : "border-gray-200"
//                       }`}>
//                         <img src={img.url} alt={`Product ${idx}`}
//                           className="w-full h-full object-cover" />
//                         {/* Delete toggle */}
//                         <button type="button"
//                           onClick={() => markImageForDeletion(img.public_id)}
//                           title={markedForDelete ? "Undo delete" : "Mark for deletion"}
//                           className={`absolute top-1 right-1 rounded-full p-0.5 text-white transition ${
//                             markedForDelete
//                               ? "bg-gray-500 hover:bg-gray-700"
//                               : "bg-red-500 hover:bg-red-700"
//                           }`}>
//                           {markedForDelete
//                             ? <RefreshCw className="w-3 h-3" />
//                             : <Trash2 className="w-3 h-3" />}
//                         </button>
//                         {markedForDelete && (
//                           <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
//                             <ImageOff className="w-5 h-5 text-red-600" />
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               {/* Upload new images */}
//               <div className="mt-4">
//                 <p className="text-sm font-medium text-gray-600 mb-2">Add New Images</p>
//                 <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-5 hover:border-blue-500 transition bg-white">
//                   <Upload className="w-7 h-7 text-gray-400" />
//                   <span className="text-gray-500 mt-1.5 text-sm">Click to upload images</span>
//                   <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
//                 </label>
//                 {newImages.length > 0 && (
//                   <div className="flex flex-wrap gap-3 mt-3">
//                     {newImages.map((img, idx) => (
//                       <div key={idx} className="relative w-24 h-24">
//                         <img src={URL.createObjectURL(img)} alt="New"
//                           className="w-full h-full object-cover rounded-xl border-2 border-blue-300" />
//                         <span className="absolute bottom-1 left-1 text-[9px] bg-blue-500 text-white px-1 rounded font-bold">NEW</span>
//                         <button type="button" onClick={() => removeNewImage(idx)}
//                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
//                           <X className="w-3 h-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Divider */}
//             <hr className="border-gray-200" />

//             {/* Existing Video */}
//             <div>
//               <p className="text-sm font-semibold text-gray-700 mb-3">Product Video</p>

//               {existingVideo && !deleteVideo && (
//                 <div className="relative rounded-xl overflow-hidden border border-gray-200">
//                   <video controls src={existingVideo.url} className="w-full max-h-64 bg-black" />
//                   <button type="button"
//                     onClick={() => setDeleteVideo(true)}
//                     className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
//                     <VideoOff className="w-3.5 h-3.5" /> Remove Video
//                   </button>
//                 </div>
//               )}

//               {deleteVideo && existingVideo && (
//                 <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
//                   <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
//                   <div className="text-sm text-red-700 flex-grow">
//                     Existing video will be deleted from Cloudinary on save.
//                   </div>
//                   <button type="button" onClick={() => setDeleteVideo(false)}
//                     className="text-xs font-semibold text-red-600 underline hover:no-underline">
//                     Undo
//                   </button>
//                 </div>
//               )}

//               {/* Upload new video */}
//               <div className="mt-3">
//                 <p className="text-sm font-medium text-gray-600 mb-2">
//                   {existingVideo ? "Replace Video" : "Upload Video (Optional)"}
//                 </p>
//                 <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-5 hover:border-blue-500 transition bg-white">
//                   <Upload className="w-7 h-7 text-gray-400" />
//                   <span className="text-gray-500 mt-1.5 text-sm">Click to upload video</span>
//                   <input type="file" accept="video/*" className="hidden"
//                     onChange={(e) => { setNewVideo(e.target.files?.[0] ?? null); if (e.target.files?.[0]) setDeleteVideo(true); }} />
//                 </label>
//                 {newVideo && (
//                   <div className="mt-3 relative rounded-xl overflow-hidden border-2 border-blue-300">
//                     <video controls src={URL.createObjectURL(newVideo)} className="w-full max-h-48 bg-black" />
//                     <span className="absolute top-2 left-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold">NEW</span>
//                     <button type="button" onClick={() => { setNewVideo(null); setDeleteVideo(false); }}
//                       className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
//                       <X className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </SectionCard>

//           {/* ── Actions ── */}
//           <div className="flex flex-col sm:flex-row gap-3 pt-2">
//             {onCancel && (
//               <button type="button" onClick={onCancel}
//                 className="flex-1 border-2 border-gray-200 text-gray-600 py-3.5 rounded-2xl hover:bg-gray-50 transition font-semibold text-base">
//                 Cancel
//               </button>
//             )}
//             <button type="submit" disabled={saving}
//               className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-bold text-base shadow-md flex items-center justify-center gap-2">
//               {saving ? (
//                 <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
//               ) : (
//                 <>✅ Save Changes</>
//               )}
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }