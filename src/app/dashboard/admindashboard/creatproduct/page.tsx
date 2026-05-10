'use client'
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

// ── Category → SubCategory → SubSubCategory tree ───────────────────────────
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  "Consumer Electronics": {
    "TWS & Earphones":     ["Gaming Earbuds", "ANC Earbuds", "Wired Earphones", "Open-Ear"],
    "Headphones":          ["Over-Ear", "On-Ear", "Noise Cancelling", "Studio Monitor"],
    "Speakers":            ["Portable Bluetooth", "Smart Speaker", "Soundbar", "Party Speaker"],
    "Smartwatch & Bands":  ["Fitness Tracker", "Smart Band", "Luxury Smartwatch", "Kids Watch"],
    "Mobile Accessories":  ["Power Bank", "Charger & Cables", "Phone Case", "Screen Protector"],
    "PC Peripherals":      ["Mechanical Keyboard", "Gaming Mouse", "Webcam", "USB Hub"],
    "LED & Lighting":      ["LED Strip", "Smart Bulb", "Desk Lamp", "RGB Light"],
  },
  "Fashion & Apparel": {
    "Men's Clothing":      ["T-Shirt", "Polo Shirt", "Hoodie", "Jacket", "Trousers"],
    "Women's Clothing":    ["Dress", "Blouse", "Skirt", "Abaya", "Leggings"],
    "Streetwear":          ["Oversized Tee", "Cargo Pants", "Bomber Jacket", "Cap"],
    "Footwear":            ["Sneakers", "Sandals", "Formal Shoes", "Boots"],
    "Bags & Luggage":      ["Backpack", "Tote Bag", "Crossbody", "Luggage Set"],
    "Headwear":            ["Baseball Cap", "Bucket Hat", "Beanie", "Hijab"],
  },
  "Beauty & Personal Care": {
    "Skincare":            ["Moisturizer", "Serum", "Sunscreen", "Face Wash", "Toner"],
    "Haircare":            ["Shampoo", "Conditioner", "Hair Oil", "Hair Mask"],
    "Makeup":              ["Foundation", "Lipstick", "Mascara", "Eyeshadow"],
    "Fragrances":          ["Perfume", "Body Mist", "Attar", "Deodorant"],
    "Personal Hygiene":    ["Soap", "Hand Sanitizer", "Toothbrush", "Razor"],
  },
  "Jewellery & Accessories": {
    "Gold Jewellery":      ["Gold Necklace", "Gold Ring", "Gold Crown", "Gold Bracelet", "Gold Earring", "Gold Bangle"],
    "Silver Jewellery":    ["Silver Necklace", "Silver Ring", "Silver Bracelet", "Silver Earring"],
    "Artificial Jewellery":["Fashion Necklace", "Fashion Ring", "Fashion Earring", "Fashion Bangle"],
    "Diamond Jewellery":   ["Diamond Ring", "Diamond Necklace", "Diamond Earring", "Diamond Pendant"],
    "Gemstone Jewellery":  ["Ruby", "Sapphire", "Emerald", "Pearl", "Opal"],
    "Watches":             ["Luxury Watch", "Sports Watch", "Couple Watch", "Pocket Watch"],
  },
  "Home & Kitchen": {
    "Cookware":            ["Non-Stick Pan", "Pressure Cooker", "Wok", "Pot Set"],
    "Kitchen Appliances":  ["Blender", "Rice Cooker", "Air Fryer", "Microwave"],
    "Furniture":           ["Sofa", "Office Chair", "Dining Table", "Bookshelf"],
    "Bedding":             ["Pillow", "Blanket", "Mattress", "Bed Sheet"],
    "Home Decor":          ["Wall Art", "Vase", "Mirror", "Curtains"],
  },
  "Sports & Outdoors": {
    "Fitness Equipment":   ["Dumbbell", "Resistance Band", "Yoga Mat", "Treadmill"],
    "Sportswear":          ["Jersey", "Track Suit", "Compression Wear", "Sports Shoes"],
    "Outdoor Gear":        ["Tent", "Sleeping Bag", "Hiking Boots", "Backpack"],
    "Team Sports":         ["Football", "Cricket Gear", "Basketball", "Badminton"],
  },
  "Industrial & Machinery": {
    "Power Tools":         ["Drill", "Angle Grinder", "Circular Saw", "Welding Machine"],
    "Safety Equipment":    ["Helmet", "Safety Gloves", "Reflective Vest", "Safety Boots"],
    "Packaging Machinery": ["Sealing Machine", "Labelling Machine", "Filling Machine"],
    "Electrical":          ["Cable & Wire", "Switch & Socket", "Circuit Breaker", "Generator"],
  },
  "Health & Medical": {
    "Medical Devices":     ["Blood Pressure Monitor", "Glucometer", "Pulse Oximeter", "Thermometer"],
    "Supplements":         ["Protein Powder", "Vitamins", "Fish Oil", "Probiotic"],
    "PPE":                 ["Surgical Mask", "N95 Mask", "Gloves", "Gown"],
    "Wellness":            ["Essential Oil", "Massage Device", "Heating Pad", "Eye Mask"],
  },
  "Toys & Hobbies": {
    "Kids Toys":           ["Action Figure", "Doll", "Building Block", "RC Car"],
    "Board Games":         ["Chess", "Puzzle", "Card Game", "Strategy Game"],
    "Art & Craft":         ["Color Pencil", "Canvas", "Clay", "Painting Kit"],
    "Collectibles":        ["Funko Pop", "Die-cast Model", "Trading Card", "Figurine"],
  },
  "Automotive": {
    "Car Accessories":     ["Car Charger", "Dash Cam", "Car Perfume", "Seat Cover"],
    "Motorcycle Parts":    ["Helmet", "Gloves", "Chain Lube", "Mirror"],
    "Car Care":            ["Wax & Polish", "Microfiber Cloth", "Tyre Inflator", "Car Vacuum"],
    "Navigation":          ["GPS Tracker", "HUD Display", "Backup Camera", "Car Mount"],
  },
  "Food & Beverage": {
    "Snacks":              ["Chips", "Biscuits", "Nuts & Dried Fruits", "Energy Bar"],
    "Beverages":           ["Juice", "Energy Drink", "Tea & Coffee", "Mineral Water"],
    "Organic & Natural":   ["Organic Honey", "Cold Pressed Oil", "Herbal Tea", "Spices"],
    "Dairy & Eggs":        ["Milk Powder", "Cheese", "Butter", "Yogurt"],
  },
};

// ── Spec definitions per category ──────────────────────────────────────────
const SPEC_BY_CATEGORY: Record<string, { key: string; label: string; fields: { key: string; label: string; placeholder: string }[] }[]> = {
  "Consumer Electronics": [
    { key: "audio", label: "Audio", fields: [
      { key: "chipset",           label: "Chipset",            placeholder: "e.g. JL6983D2" },
      { key: "soundProfile",      label: "Sound Profile",      placeholder: "e.g. HiFi Ultra-Bass" },
      { key: "driverSize",        label: "Driver Size",        placeholder: "e.g. 13mm Dynamic Driver" },
      { key: "latency",           label: "Latency",            placeholder: "e.g. < 30ms Game Mode" },
      { key: "frequencyResponse", label: "Frequency Response", placeholder: "e.g. 20Hz - 20kHz" },
    ]},
    { key: "battery", label: "Battery", fields: [
      { key: "earphoneCapacity",     label: "Earphone Capacity",    placeholder: "e.g. 30 mAh" },
      { key: "chargingBoxCapacity",  label: "Charging Box",         placeholder: "e.g. 300 mAh" },
      { key: "musicCallTime",        label: "Music / Call Time",    placeholder: "e.g. 3-4 hrs" },
      { key: "standbyTime",          label: "Standby Time",         placeholder: "e.g. 120 hrs" },
      { key: "chargingTime",         label: "Charging Time",        placeholder: "e.g. 1.5 hrs" },
      { key: "interface",            label: "Charging Interface",   placeholder: "e.g. Type-C" },
    ]},
    { key: "build", label: "Build & Design", fields: [
      { key: "waterproofStandard",    label: "Waterproof Standard", placeholder: "e.g. IPX-4" },
      { key: "gameAtmosphereLight",   label: "Atmosphere Light",    placeholder: "e.g. RGB LED" },
      { key: "material",              label: "Material",            placeholder: "e.g. ABS + PC" },
      { key: "weight",                label: "Weight",              placeholder: "e.g. 45g" },
    ]},
    { key: "connectivity", label: "Connectivity", fields: [
      { key: "bluetoothVersion",     label: "Bluetooth Version",      placeholder: "e.g. V5.3" },
      { key: "transmissionDistance", label: "Transmission Distance",  placeholder: "e.g. 10-15m" },
      { key: "protocols",            label: "Protocols",              placeholder: "e.g. HFP/A2DP" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "oemOdm",    label: "OEM / ODM",    placeholder: "e.g. Available" },
      { key: "customLogo", label: "Custom Logo", placeholder: "e.g. MOQ 500+" },
      { key: "leadTime",  label: "Lead Time",    placeholder: "e.g. 7-15 Days" },
    ]},
  ],

  "Fashion & Apparel": [
    { key: "fabric", label: "Fabric & Material", fields: [
      { key: "composition",  label: "Composition",     placeholder: "e.g. 100% Cotton" },
      { key: "weight",       label: "Fabric Weight",   placeholder: "e.g. 280 GSM" },
      { key: "finish",       label: "Finish",          placeholder: "e.g. Enzyme Washed" },
      { key: "texture",      label: "Texture",         placeholder: "e.g. Fleece / Jersey" },
    ]},
    { key: "sizing", label: "Sizing", fields: [
      { key: "fit",       label: "Fit",        placeholder: "e.g. Oversized / Slim Fit" },
      { key: "sizes",     label: "Sizes",      placeholder: "e.g. XS - 4XL" },
      { key: "shrinkage", label: "Shrinkage",  placeholder: "e.g. Pre-shrunk < 3%" },
    ]},
    { key: "customization", label: "Customization", fields: [
      { key: "printing",   label: "Printing Method", placeholder: "e.g. Screen Print / DTG" },
      { key: "label",      label: "Label",           placeholder: "e.g. Custom Woven Label" },
      { key: "packaging",  label: "Packaging",       placeholder: "e.g. Individual Poly Bag" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "moqPerColor", label: "MOQ Per Color", placeholder: "e.g. 50 pcs" },
      { key: "sampleTime",  label: "Sample Time",   placeholder: "e.g. 5-7 Days" },
      { key: "leadTime",    label: "Lead Time",     placeholder: "e.g. 15-20 Days" },
    ]},
  ],

  "Jewellery & Accessories": [
    { key: "material", label: "Material & Metal", fields: [
      { key: "baseMetal",   label: "Base Metal",    placeholder: "e.g. 925 Sterling Silver" },
      { key: "plating",     label: "Plating",       placeholder: "e.g. 18K Gold 3 Microns" },
      { key: "purity",      label: "Purity / Karat",placeholder: "e.g. 22K, 18K, 14K" },
      { key: "hallmark",    label: "Hallmark",      placeholder: "e.g. BIS 916 Certified" },
    ]},
    { key: "gemstone", label: "Gemstone", fields: [
      { key: "stoneType",   label: "Stone Type",    placeholder: "e.g. Diamond / Ruby / CZ" },
      { key: "stoneWeight", label: "Stone Weight",  placeholder: "e.g. 0.5 Carat" },
      { key: "stoneCut",    label: "Stone Cut",     placeholder: "e.g. Round Brilliant" },
      { key: "clarity",     label: "Clarity",       placeholder: "e.g. VS1 / SI1" },
      { key: "color",       label: "Color Grade",   placeholder: "e.g. D / E / F" },
    ]},
    { key: "dimensions", label: "Dimensions & Weight", fields: [
      { key: "itemWeight",  label: "Item Weight",   placeholder: "e.g. 4.5g" },
      { key: "length",      label: "Length / Size", placeholder: "e.g. 45cm + 5cm adj." },
      { key: "width",       label: "Width",         placeholder: "e.g. 12mm" },
      { key: "thickness",   label: "Thickness",     placeholder: "e.g. 1.5mm" },
    ]},
    { key: "finish", label: "Finish & Style", fields: [
      { key: "finish",      label: "Surface Finish", placeholder: "e.g. Polished / Matte" },
      { key: "style",       label: "Style",          placeholder: "e.g. Minimalist / Antique" },
      { key: "occasion",    label: "Occasion",       placeholder: "e.g. Wedding / Daily Wear" },
      { key: "gender",      label: "Gender",         placeholder: "e.g. Women / Unisex" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "packaging",   label: "Packaging",      placeholder: "e.g. Velvet Box + Pouch" },
      { key: "certificate", label: "Certificate",    placeholder: "e.g. GIA / IGI Certified" },
      { key: "customLogo",  label: "Custom Logo",    placeholder: "e.g. Laser Engraving" },
      { key: "leadTime",    label: "Lead Time",      placeholder: "e.g. 7-10 Days" },
    ]},
  ],

  "Beauty & Personal Care": [
    { key: "formula", label: "Formula & Ingredients", fields: [
      { key: "keyIngredients", label: "Key Ingredients",  placeholder: "e.g. Hyaluronic Acid, Niacinamide" },
      { key: "skinType",       label: "Skin Type",        placeholder: "e.g. All Skin Types / Oily" },
      { key: "formula",        label: "Formula Type",     placeholder: "e.g. Water-Based / Oil-Free" },
      { key: "spf",            label: "SPF",              placeholder: "e.g. SPF 50 PA+++" },
    ]},
    { key: "packaging", label: "Packaging", fields: [
      { key: "volume",       label: "Volume / Weight", placeholder: "e.g. 50ml / 100g" },
      { key: "container",    label: "Container Type",  placeholder: "e.g. Pump Bottle / Tube" },
      { key: "material",     label: "Material",        placeholder: "e.g. Recyclable PET" },
    ]},
    { key: "certifications", label: "Certifications", fields: [
      { key: "crueltyFree",  label: "Cruelty Free",   placeholder: "e.g. Leaping Bunny Certified" },
      { key: "organic",      label: "Organic",        placeholder: "e.g. ECOCERT Certified" },
      { key: "dermatologist",label: "Dermatologist",  placeholder: "e.g. Dermatologist Tested" },
      { key: "halal",        label: "Halal",          placeholder: "e.g. JAKIM Halal Certified" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "oemOdm",    label: "OEM / ODM",    placeholder: "e.g. Private Label Available" },
      { key: "moq",       label: "MOQ",          placeholder: "e.g. 500 units" },
      { key: "leadTime",  label: "Lead Time",    placeholder: "e.g. 30-45 Days" },
    ]},
  ],

  "Home & Kitchen": [
    { key: "build", label: "Build & Material", fields: [
      { key: "material",  label: "Material",     placeholder: "e.g. Stainless Steel 304" },
      { key: "coating",   label: "Coating",      placeholder: "e.g. PFOA-Free Non-Stick" },
      { key: "capacity",  label: "Capacity",     placeholder: "e.g. 5 Liters" },
      { key: "color",     label: "Color",        placeholder: "e.g. Midnight Black" },
    ]},
    { key: "dimensions", label: "Dimensions", fields: [
      { key: "size",      label: "Size",         placeholder: "e.g. 28cm Diameter" },
      { key: "weight",    label: "Weight",       placeholder: "e.g. 1.2 kg" },
      { key: "voltage",   label: "Voltage",      placeholder: "e.g. 220V / 50Hz" },
      { key: "power",     label: "Power",        placeholder: "e.g. 1500W" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "certifications", label: "Certifications", placeholder: "e.g. CE, FDA, LFGB" },
      { key: "moq",            label: "MOQ",            placeholder: "e.g. 100 pcs" },
      { key: "leadTime",       label: "Lead Time",      placeholder: "e.g. 20-30 Days" },
    ]},
  ],

  "Sports & Outdoors": [
    { key: "specs", label: "Product Specs", fields: [
      { key: "material",  label: "Material",     placeholder: "e.g. Neoprene / Nylon" },
      { key: "weight",    label: "Weight",       placeholder: "e.g. 500g per pair" },
      { key: "size",      label: "Size Range",   placeholder: "e.g. S / M / L / XL" },
      { key: "color",     label: "Available Colors", placeholder: "e.g. Black, Red, Blue" },
    ]},
    { key: "performance", label: "Performance", fields: [
      { key: "waterproof",  label: "Waterproof",    placeholder: "e.g. IPX7 / Waterproof" },
      { key: "breathable",  label: "Breathable",    placeholder: "e.g. Mesh Ventilation" },
      { key: "load",        label: "Max Load",      placeholder: "e.g. 120kg" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "certifications", label: "Certifications", placeholder: "e.g. CE, SGS" },
      { key: "moq",            label: "MOQ",            placeholder: "e.g. 100 pcs" },
      { key: "leadTime",       label: "Lead Time",      placeholder: "e.g. 14-21 Days" },
    ]},
  ],

  "Health & Medical": [
    { key: "technical", label: "Technical Specs", fields: [
      { key: "measurement",  label: "Measurement Range",  placeholder: "e.g. 0-300 mmHg" },
      { key: "accuracy",     label: "Accuracy",           placeholder: "e.g. ±2 mmHg" },
      { key: "display",      label: "Display",            placeholder: "e.g. 3.5\" LCD" },
      { key: "memory",       label: "Memory",             placeholder: "e.g. 60 readings" },
      { key: "power",        label: "Power Source",       placeholder: "e.g. 4x AA Batteries" },
    ]},
    { key: "certifications", label: "Certifications", fields: [
      { key: "ce",    label: "CE",     placeholder: "e.g. CE Marked" },
      { key: "fda",   label: "FDA",    placeholder: "e.g. FDA 510k Cleared" },
      { key: "iso",   label: "ISO",    placeholder: "e.g. ISO 13485 Certified" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "oemOdm",   label: "OEM / ODM",  placeholder: "e.g. White Label Available" },
      { key: "moq",      label: "MOQ",        placeholder: "e.g. 200 units" },
      { key: "leadTime", label: "Lead Time",  placeholder: "e.g. 30 Days" },
    ]},
  ],

  "Automotive": [
    { key: "compatibility", label: "Compatibility", fields: [
      { key: "fitment",     label: "Fitment",      placeholder: "e.g. Universal / Toyota Corolla" },
      { key: "year",        label: "Year Range",   placeholder: "e.g. 2015 - 2024" },
      { key: "position",    label: "Position",     placeholder: "e.g. Front / Rear / Universal" },
    ]},
    { key: "specs", label: "Product Specs", fields: [
      { key: "material",   label: "Material",    placeholder: "e.g. ABS Plastic / Aluminum" },
      { key: "voltage",    label: "Voltage",     placeholder: "e.g. 12V DC" },
      { key: "resolution", label: "Resolution",  placeholder: "e.g. 1080P Full HD" },
      { key: "waterproof", label: "Waterproof",  placeholder: "e.g. IP67" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "certifications", label: "Certifications", placeholder: "e.g. CE, ROHS, E-Mark" },
      { key: "moq",            label: "MOQ",            placeholder: "e.g. 50 pcs" },
      { key: "leadTime",       label: "Lead Time",      placeholder: "e.g. 10-15 Days" },
    ]},
  ],

  "Food & Beverage": [
    { key: "nutritional", label: "Nutritional Info", fields: [
      { key: "weight",     label: "Net Weight",    placeholder: "e.g. 500g / 1kg" },
      { key: "calories",   label: "Calories",      placeholder: "e.g. 250 kcal per 100g" },
      { key: "ingredients",label: "Ingredients",   placeholder: "e.g. Water, Sugar, Citric Acid" },
      { key: "allergens",  label: "Allergens",     placeholder: "e.g. Contains Nuts, Gluten-Free" },
    ]},
    { key: "storage", label: "Storage & Shelf Life", fields: [
      { key: "shelfLife",  label: "Shelf Life",    placeholder: "e.g. 12 months" },
      { key: "storage",    label: "Storage",       placeholder: "e.g. Cool & Dry Place" },
      { key: "temp",       label: "Temperature",   placeholder: "e.g. Below 25°C" },
    ]},
    { key: "certifications", label: "Certifications", fields: [
      { key: "halal",   label: "Halal",   placeholder: "e.g. JAKIM Certified" },
      { key: "organic", label: "Organic", placeholder: "e.g. USDA Organic" },
      { key: "fda",     label: "FDA",     placeholder: "e.g. FDA Approved" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "moq",       label: "MOQ",        placeholder: "e.g. 500 units" },
      { key: "leadTime",  label: "Lead Time",  placeholder: "e.g. 7-14 Days" },
      { key: "packaging", label: "Packaging",  placeholder: "e.g. Private Label Box" },
    ]},
  ],

  "Industrial & Machinery": [
    { key: "specs", label: "Technical Specs", fields: [
      { key: "power",     label: "Power",     placeholder: "e.g. 1500W / 220V" },
      { key: "speed",     label: "Speed",     placeholder: "e.g. 0-3000 RPM" },
      { key: "torque",    label: "Torque",    placeholder: "e.g. 60 Nm" },
      { key: "weight",    label: "Weight",    placeholder: "e.g. 3.5 kg" },
      { key: "material",  label: "Material",  placeholder: "e.g. Carbon Steel" },
    ]},
    { key: "certifications", label: "Certifications", fields: [
      { key: "ce",    label: "CE",    placeholder: "e.g. CE Certified" },
      { key: "iso",   label: "ISO",   placeholder: "e.g. ISO 9001:2015" },
      { key: "rohs",  label: "RoHS",  placeholder: "e.g. RoHS Compliant" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "moq",       label: "MOQ",       placeholder: "e.g. 10 units" },
      { key: "warranty",  label: "Warranty",  placeholder: "e.g. 12 Months" },
      { key: "leadTime",  label: "Lead Time", placeholder: "e.g. 25-30 Days" },
    ]},
  ],

  "Toys & Hobbies": [
    { key: "specs", label: "Product Specs", fields: [
      { key: "ageRange",   label: "Age Range",   placeholder: "e.g. 3+ Years" },
      { key: "material",   label: "Material",    placeholder: "e.g. BPA-Free ABS Plastic" },
      { key: "dimensions", label: "Dimensions",  placeholder: "e.g. 30 x 15 x 10 cm" },
      { key: "weight",     label: "Weight",      placeholder: "e.g. 250g" },
      { key: "batteries",  label: "Batteries",   placeholder: "e.g. 3x AA (Not Included)" },
    ]},
    { key: "safety", label: "Safety", fields: [
      { key: "certifications", label: "Safety Certs", placeholder: "e.g. CE, ASTM F963, EN71" },
      { key: "material",       label: "Material Safety", placeholder: "e.g. Non-Toxic Paint" },
    ]},
    { key: "business", label: "Business / OEM", fields: [
      { key: "customLogo", label: "Custom Logo",  placeholder: "e.g. Sticker / Mold" },
      { key: "moq",        label: "MOQ",          placeholder: "e.g. 200 pcs" },
      { key: "leadTime",   label: "Lead Time",    placeholder: "e.g. 20-25 Days" },
    ]},
  ],
};

// Fallback for categories not in SPEC_BY_CATEGORY
const DEFAULT_SPECS = [
  { key: "general", label: "General Specs", fields: [
    { key: "material",  label: "Material",  placeholder: "e.g. Stainless Steel" },
    { key: "weight",    label: "Weight",    placeholder: "e.g. 500g" },
    { key: "color",     label: "Color",     placeholder: "e.g. Black / White" },
    { key: "size",      label: "Size",      placeholder: "e.g. 20 x 10 x 5 cm" },
  ]},
  { key: "business", label: "Business / OEM", fields: [
    { key: "moq",       label: "MOQ",       placeholder: "e.g. 100 pcs" },
    { key: "leadTime",  label: "Lead Time", placeholder: "e.g. 15 Days" },
    { key: "oemOdm",    label: "OEM / ODM", placeholder: "e.g. Available" },
  ]},
];

const CURRENCIES  = ["BDT (৳)", "USD ($)", "EUR (€)", "GBP (£)", "CNY (¥)", "INR (₹)", "JPY (¥)"];
const SHIPPING_METHODS = ["Sea Freight", "Air Freight", "Express (DHL/FedEx)", "Rail Freight", "Road Freight"];
const INCOTERMS   = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA"];

// ── Helpers ────────────────────────────────────────────────────────────────
function buildEmptySpecs(categories: typeof DEFAULT_SPECS) {
  return Object.fromEntries(
    categories.map((cat) => [
      cat.key,
      Object.fromEntries(cat.fields.map((f) => [f.key, ""])),
    ])
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
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

const inputCls  = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm";
const selectCls = `${inputCls} appearance-none`;

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreateProduct() {
  const { register, handleSubmit } = useForm();

  // Category cascade
  const [selectedCategory,    setSelectedCategory]    = useState("");
  const [selectedSubCat,      setSelectedSubCat]      = useState("");
  const [selectedSubSubCat,   setSelectedSubSubCat]   = useState("");

  // Dynamic spec categories based on selected category
  const [specCategories, setSpecCategories] = useState(DEFAULT_SPECS);

  // Specs state — reset when category changes
  const [specs,             setSpecs]             = useState<Record<string, Record<string, string>>>(buildEmptySpecs(DEFAULT_SPECS));
  const [openSpecCategory,  setOpenSpecCategory]  = useState<string | null>(null);

  // Media
  const [images, setImages] = useState<File[]>([]);
  const [video,  setVideo]  = useState<File | null>(null);

  // Tags & Variations
  const [tags,       setTags]       = useState<string[]>([]);
  const [tagInput,   setTagInput]   = useState("");
  const [variations, setVariations] = useState([{ color: "", size: "", sku: "", stock: "" }]);

  // Packaging
  const [packagingDetails, setPackagingDetails] = useState("");
  const [sellingUnit,      setSellingUnit]       = useState("Single item");

  // ── When category changes → update spec template ───────────────────────
  useEffect(() => {
    const newCats = SPEC_BY_CATEGORY[selectedCategory] ?? DEFAULT_SPECS;
    setSpecCategories(newCats);
    setSpecs(buildEmptySpecs(newCats));
    setOpenSpecCategory(null);
    setSelectedSubCat("");
    setSelectedSubSubCat("");
  }, [selectedCategory]);

  // Sub-category list
  const subCategories    = selectedCategory ? Object.keys(CATEGORY_TREE[selectedCategory] ?? {}) : [];
  const subSubCategories = selectedSubCat   ? (CATEGORY_TREE[selectedCategory]?.[selectedSubCat] ?? []) : [];

  // ── Spec handler ───────────────────────────────────────────────────────
  const updateSpec = (category: string, field: string, value: string) => {
    setSpecs((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  // ── Media handlers ─────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  // ── Tag handlers ───────────────────────────────────────────────────────
  const addTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // ── Variation handlers ─────────────────────────────────────────────────
  const addVariation    = () => setVariations([...variations, { color: "", size: "", sku: "", stock: "" }]);
  const removeVariation = (i: number) => setVariations((prev) => prev.filter((_, idx) => idx !== i));
  const updateVariation = (i: number, field: string, value: string) => {
    const updated = [...variations];
    updated[i] = { ...updated[i], [field]: value };
    setVariations(updated);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: Record<string, string>) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v ?? ""));

      // Override category fields with cascade state
      formData.set("category",       selectedCategory);
      formData.set("subcategory",    selectedSubCat);
      formData.set("subSubcategory", selectedSubSubCat);

      formData.append("specifications", JSON.stringify(specs));
      formData.append("tags",           JSON.stringify(tags));
      formData.append("variations",     JSON.stringify(variations));
      formData.append("packagingDetails", packagingDetails);
      formData.append("sellingUnit",      sellingUnit);

      images.forEach((f) => formData.append("images", f));
      if (video) formData.append("video", video);

      const res  = await fetch("http://localhost:5000/product", { method: "POST", body: formData });
      const json = await res.json();
      console.log("✅ Response:", json);
      alert("✅ Product published successfully!");
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("❌ Failed to submit. Check console.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex justify-center items-start p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-5xl space-y-8">

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🌏 Add International Product</h1>
          <p className="text-sm text-gray-500 mt-1">B2B / OEM / ODM product listing with full specifications</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ── 1. Basic Info ── */}
          <SectionCard title="1. Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product Name (English) *">
                <input {...register("nameEng", { required: true })} type="text"
                  placeholder="e.g. MK47 OEM/ODM Gaming Earbuds TWS" className={inputCls} />
              </Field>
              <Field label="Product Name (Local / Chinese)">
                <input {...register("nameLocal")} type="text"
                  placeholder="Optional local language name" className={inputCls} />
              </Field>
              <Field label="Brand / Trade Name">
                <input {...register("brand")} type="text"
                  placeholder="e.g. Shafir Express" className={inputCls} />
              </Field>
              <Field label="Model Number">
                <input {...register("modelNumber")} type="text"
                  placeholder="e.g. MK47" className={inputCls} />
              </Field>
              <Field label="SKU / Product ID">
                <input {...register("sku")} type="text"
                  placeholder="e.g. B2B-MK47-9921" className={inputCls} />
              </Field>
              <Field label="Slug / URL Key">
                <input {...register("slug")} type="text"
                  placeholder="e.g. mk47-gaming-earbuds-tws" className={inputCls} />
              </Field>
            </div>
          </SectionCard>

          {/* ── 2. Category Cascade ── */}
          <SectionCard title="2. Category & Classification">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Category */}
              <Field label="Category *">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Select Category —</option>
                  {Object.keys(CATEGORY_TREE).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              {/* SubCategory */}
              <Field label="Subcategory">
                <select
                  value={selectedSubCat}
                  onChange={(e) => { setSelectedSubCat(e.target.value); setSelectedSubSubCat(""); }}
                  className={selectCls}
                  disabled={!selectedCategory}
                >
                  <option value="">— Select Subcategory —</option>
                  {subCategories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              {/* Sub-SubCategory */}
              <Field label="Sub-subcategory">
                <select
                  value={selectedSubSubCat}
                  onChange={(e) => setSelectedSubSubCat(e.target.value)}
                  className={selectCls}
                  disabled={!selectedSubCat}
                >
                  <option value="">— Select Type —</option>
                  {subSubCategories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Category path preview */}
            {selectedCategory && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {selectedCategory}
                </span>
                {selectedSubCat && (
                  <>
                    <span className="text-gray-400 text-xs">›</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {selectedSubCat}
                    </span>
                  </>
                )}
                {selectedSubSubCat && (
                  <>
                    <span className="text-gray-400 text-xs">›</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {selectedSubSubCat}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* HS Code */}
            <Field label="HS Code (Harmonized System)">
              <input {...register("hsCode")} type="text"
                placeholder="e.g. 8518.30.00" className={inputCls} />
            </Field>
          </SectionCard>

          {/* ── 3. Pricing ── */}
          <SectionCard title="3. Pricing & Order Info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Unit Price">
                <input {...register("price")} type="number" step="0.01"
                  placeholder="e.g. 700" className={inputCls} />
              </Field>
              <Field label="Currency">
                <select {...register("currency")} className={selectCls}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Discount (%)">
                <input {...register("discount")} type="number"
                  placeholder="Optional" className={inputCls} />
              </Field>
              <Field label="MOQ">
                <input {...register("moq")} type="text"
                  placeholder="e.g. 10 pieces" className={inputCls} />
              </Field>
              <Field label="Stock / Inventory">
                <input {...register("stock")} type="number"
                  placeholder="Available units" className={inputCls} />
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
              <Field label="Supplier / Company Name">
                <input {...register("supplierName")} type="text"
                  placeholder="e.g. Shafir Express LTD" className={inputCls} />
              </Field>
              <Field label="Country of Origin">
                <select {...register("countryOfOrigin")} className={selectCls}>
                  {["Bangladesh (BD)", "China (CN)", "India (IN)", "United States (US)",
                    "Germany (DE)", "United Kingdom (GB)", "Turkey (TR)", "Vietnam (VN)",
                    "South Korea (KR)", "Japan (JP)", "Italy (IT)", "France (FR)"]
                    .map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Years in Business">
                <input {...register("supplierYears")} type="text"
                  placeholder="e.g. 5 yrs" className={inputCls} />
              </Field>
              <Field label="Certifications">
                <input {...register("certifications")} type="text"
                  placeholder="e.g. CE, RoHS, FCC, ISO 9001" className={inputCls} />
              </Field>
              <Field label="Factory Location">
                <input {...register("factoryLocation")} type="text"
                  placeholder="e.g. Shenzhen, Guangdong, China" className={inputCls} />
              </Field>
              <Field label="Production Capacity">
                <input {...register("productionCapacity")} type="text"
                  placeholder="e.g. 50,000 pcs/month" className={inputCls} />
              </Field>
            </div>
          </SectionCard>

          {/* ── 5. Shipping ── */}
          <SectionCard title="5. Shipping & Trade Terms">
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
                <input {...register("leadTime")} type="text"
                  placeholder="e.g. 7-15 business days" className={inputCls} />
              </Field>
              <Field label="Port of Loading">
                <input {...register("portOfLoading")} type="text"
                  placeholder="e.g. Shenzhen Port, CN" className={inputCls} />
              </Field>
            </div>
            <Field label="Shipping Details / Notes">
              <textarea {...register("shippingNotes")} rows={3}
                placeholder="e.g. Free sea freight for orders above 500 units..."
                className={inputCls} />
            </Field>
          </SectionCard>

          {/* ── 6. Dynamic Specifications ── */}
          <SectionCard title="6. Technical Specifications">
            {/* Info banner showing which category's specs are loaded */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
              selectedCategory
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {selectedCategory ? (
                <>✅ Showing <b>{selectedCategory}</b> specifications</>
              ) : (
                <>⚠️ Select a category above to load relevant specification fields</>
              )}
            </div>

            <div className="space-y-3">
              {specCategories.map((cat) => {
                const isOpen = openSpecCategory === cat.key;
                return (
                  <div key={cat.key} className="rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenSpecCategory(isOpen ? null : cat.key)}
                      className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                        {/* Show filled count */}
                        {(() => {
                          const filled = Object.values(specs[cat.key] ?? {}).filter(Boolean).length;
                          return filled > 0 ? (
                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                              {filled} filled
                            </span>
                          ) : null;
                        })()}
                      </div>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 pt-2 bg-gray-50">
                        {cat.fields.map((f) => (
                          <Field key={f.key} label={f.label}>
                            <input
                              type="text"
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
                  placeholder="e.g. 1pc in giftbox, 10 boxes per carton" className={inputCls} />
              </Field>
              <Field label="Selling Unit">
                <input type="text" value={sellingUnit}
                  onChange={(e) => setSellingUnit(e.target.value)}
                  placeholder="e.g. Single item, Set, Carton" className={inputCls} />
              </Field>
              <Field label="Gross Weight (per unit)">
                <input {...register("grossWeight")} type="text"
                  placeholder="e.g. 150g" className={inputCls} />
              </Field>
              <Field label="Carton Size (L × W × H cm)">
                <input {...register("cartonSize")} type="text"
                  placeholder="e.g. 40 × 30 × 25 cm" className={inputCls} />
              </Field>
            </div>
          </SectionCard>

          {/* ── 8. Variations ── */}
          <SectionCard title="8. Product Variations">
            {variations.map((v, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 items-center">
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
                    <button type="button" onClick={() => removeVariation(i)}
                      className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariation}
              className="flex items-center gap-1 text-sm text-green-600 mt-1 hover:text-green-700">
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
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium whitespace-nowrap">
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
            <Field label="Short Description / Marketing Copy">
              <textarea {...register("shortDescription")} rows={3}
                placeholder="Brief selling pitch..." className={inputCls} />
            </Field>
            <Field label="Full Description">
              <textarea {...register("description")} rows={6}
                placeholder="Detailed product description..." className={inputCls} />
            </Field>
          </SectionCard>

          {/* ── 11. Media ── */}
          <SectionCard title="11. Product Media">
            <Field label="Product Images (Multiple)">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-6 hover:border-green-500 transition bg-white">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-500 mt-2 text-sm">Click to upload images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 md:w-24 md:h-24">
                      <img src={URL.createObjectURL(img)} alt="Preview"
                        className="w-full h-full object-cover rounded-lg border" />
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                        <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Product Video (Optional)">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-6 hover:border-green-500 transition bg-white">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-500 mt-2 text-sm">Click to upload video</span>
                <input type="file" accept="video/*" className="hidden"
                  onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
              </label>
              {video && (
                <video controls className="mt-3 w-full rounded-lg border"
                  src={URL.createObjectURL(video)} />
              )}
            </Field>
          </SectionCard>

          {/* ── Submit ── */}
          <button type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 transition font-bold text-lg shadow-md">
            🌏 Publish International Product
          </button>
        </form>
      </div>
    </div>
  );
}




// properly worked

// 'use client'
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Upload, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

// // ── Spec category definitions ──────────────────────────────────────────────
// const SPEC_CATEGORIES = [
//   {
//     key: "audio",
//     label: "Audio",
//     fields: [
//       { key: "chipset", label: "Chipset", placeholder: "e.g. JL6983D2" },
//       { key: "soundProfile", label: "Sound Profile", placeholder: "e.g. HiFi Ultra-Bass" },
//       { key: "driverSize", label: "Driver Size", placeholder: "e.g. 13mm Dynamic Driver" },
//       { key: "latency", label: "Latency", placeholder: "e.g. < 30 ms (Game Mode)" },
//       { key: "frequencyResponse", label: "Frequency Response", placeholder: "e.g. 20Hz - 20kHz" },
//     ],
//   },
//   {
//     key: "battery",
//     label: "Battery",
//     fields: [
//       { key: "earphoneCapacity", label: "Earphone Capacity", placeholder: "e.g. 30 mAh" },
//       { key: "chargingBoxCapacity", label: "Charging Box Capacity", placeholder: "e.g. 300 mAh" },
//       { key: "musicCallTime", label: "Music / Call Time", placeholder: "e.g. 3-4 hrs" },
//       { key: "standbyTime", label: "Standby Time", placeholder: "e.g. 120 hrs" },
//       { key: "chargingTime", label: "Charging Time", placeholder: "e.g. 1.5 hrs" },
//       { key: "interface", label: "Charging Interface", placeholder: "e.g. Type-C Fast Charge" },
//     ],
//   },
//   {
//     key: "build",
//     label: "Build & Design",
//     fields: [
//       { key: "modelNumber", label: "Model Number", placeholder: "e.g. MK47" },
//       { key: "waterproofStandard", label: "Waterproof Standard", placeholder: "e.g. IPX-4" },
//       { key: "gameAtmosphereLight", label: "Atmosphere Light", placeholder: "e.g. Multicolor RGB LED" },
//       { key: "batteryIndicator", label: "Battery Indicator", placeholder: "e.g. LED Digital Display" },
//       { key: "material", label: "Material", placeholder: "e.g. ABS + PC Fireproof Plastic" },
//     ],
//   },
//   {
//     key: "connectivity",
//     label: "Connectivity",
//     fields: [
//       { key: "bluetoothVersion", label: "Bluetooth Version", placeholder: "e.g. V5.3" },
//       { key: "transmissionDistance", label: "Transmission Distance", placeholder: "e.g. 10-15 meters" },
//       { key: "protocols", label: "Protocols", placeholder: "e.g. HFP/A2DP/HSP/AVRCP" },
//     ],
//   },
//   {
//     key: "business",
//     label: "Business / OEM",
//     fields: [
//       { key: "oemOdm", label: "OEM / ODM", placeholder: "e.g. Available / Welcomed" },
//       { key: "customLogo", label: "Custom Logo", placeholder: "e.g. Supported (MOQ 500+)" },
//       { key: "leadTime", label: "Lead Time", placeholder: "e.g. 7-15 Days" },
//     ],
//   },
// ];

// const CATEGORIES = [
//   "Consumer Electronics",
//   "Fashion & Apparel",
//   "Beauty & Personal Care",
//   "Home & Kitchen",
//   "Sports & Outdoors",
//   "Industrial & Machinery",
//   "Health & Medical",
//   "Toys & Hobbies",
//   "Automotive",
//   "Food & Beverage",
// ];

// const CURRENCIES = ["BDT (৳)","USD ($)", "EUR (€)", "GBP (£)", "CNY (¥)", "INR (₹)", "JPY (¥)"];

// const COUNTRIES = [
//   "Bangladesh (BD)","China (CN)", "India (IN)", "United States (US)",
//   "Germany (DE)", "United Kingdom (GB)", "Turkey (TR)", "Vietnam (VN)",
//   "South Korea (KR)", "Japan (JP)", "Italy (IT)", "France (FR)",
// ];

// const SHIPPING_METHODS = ["Sea Freight", "Air Freight", "Express (DHL/FedEx)", "Rail Freight", "Road Freight"];

// const INCOTERMS = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA"];

// // ── Helpers ────────────────────────────────────────────────────────────────
// function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
//       <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
//       {children}
//     </div>
//   );
// }

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
//       {children}
//     </div>
//   );
// }

// const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm";
// const selectCls = `${inputCls} appearance-none`;

// // ── Main Component ─────────────────────────────────────────────────────────
// export default function CreateProduct() {
//   const { register, handleSubmit } = useForm();

//   // Media
//   const [images, setImages] = useState<File[]>([]);
//   const [video, setVideo] = useState<File | null>(null);

//   // Tags
//   const [tags, setTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");

//   // Variations
//   const [variations, setVariations] = useState([{ color: "", size: "", sku: "", stock: "" }]);

//   // Specifications — nested: { audio: { chipset: "", ... }, battery: {...}, ... }
//   const [specs, setSpecs] = useState<Record<string, Record<string, string>>>(() =>
//     Object.fromEntries(SPEC_CATEGORIES.map((cat) => [
//       cat.key,
//       Object.fromEntries(cat.fields.map((f) => [f.key, ""])),
//     ]))
//   );
//   const [openSpecCategory, setOpenSpecCategory] = useState<string | null>(null);

//   // Packaging
//   const [packagingDetails, setPackagingDetails] = useState("");
//   const [sellingUnit, setSellingUnit] = useState("Single item");

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const updateSpec = (category: string, field: string, value: string) => {
//     setSpecs((prev) => ({
//       ...prev,
//       [category]: { ...prev[category], [field]: value },
//     }));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
//   };

//   const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

//   const addTag = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (tagInput.trim() && !tags.includes(tagInput.trim())) {
//       setTags([...tags, tagInput.trim()]);
//       setTagInput("");
//     }
//   };

//   const addVariation = () =>
//     setVariations([...variations, { color: "", size: "", sku: "", stock: "" }]);

//   const updateVariation = (i: number, field: string, value: string) => {
//     const updated = [...variations];
//     updated[i] = { ...updated[i], [field]: value };
//     setVariations(updated);
//   };

//   const removeVariation = (i: number) =>
//     setVariations((prev) => prev.filter((_, idx) => idx !== i));

//   // ── Submit ─────────────────────────────────────────────────────────────────
//   const onSubmit = async (data: Record<string, string>) => {
//     try {
//       const formData = new FormData();

//       // Basic fields
//       Object.entries(data).forEach(([k, v]) => formData.append(k, v ?? ""));

//       // Nested specs — send as JSON
//       formData.append("specifications", JSON.stringify(specs));

//       // Arrays
//       formData.append("tags", JSON.stringify(tags));
//       formData.append("variations", JSON.stringify(variations));

//       // Packaging
//       formData.append("packagingDetails", packagingDetails);
//       formData.append("sellingUnit", sellingUnit);

//       // Files
//       images.forEach((f) => formData.append("images", f));
//       if (video) formData.append("video", video);

//       const res = await fetch("http://localhost:5000/product", {
//         method: "POST",
//         body: formData,
//       });
//       const json = await res.json();
//       console.log("✅ Response:", json);
//     } catch (err) {
//       console.error("❌ Submit error:", err);
//     }
//   };

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen flex justify-center items-start p-6">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl space-y-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-800">🌏 Add International Product</h1>
//           <p className="text-sm text-gray-500 mt-1">B2B / OEM / ODM product listing with full specifications</p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

//           {/* ── 1. Basic Info ── */}
//           <SectionCard title="1. Basic Information">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Product Name (English)">
//                 <input {...register("nameEng", { required: true })} type="text"
//                   placeholder="e.g. MK47 OEM/ODM Gaming Earbuds TWS" className={inputCls} />
//               </Field>
//               <Field label="Product Name (Local / Chinese)">
//                 <input {...register("nameLocal")} type="text"
//                   placeholder="Optional local language name" className={inputCls} />
//               </Field>
//               <Field label="Brand / Trade Name">
//                 <input {...register("brand")} type="text"
//                   placeholder="e.g. Shafir Express" className={inputCls} />
//               </Field>
//               <Field label="Model Number">
//                 <input {...register("modelNumber")} type="text"
//                   placeholder="e.g. MK47" className={inputCls} />
//               </Field>
//               <Field label="SKU / Product ID">
//                 <input {...register("sku")} type="text"
//                   placeholder="e.g. B2B-MK47-9921" className={inputCls} />
//               </Field>
//               <Field label="Slug / URL Key">
//                 <input {...register("slug")} type="text"
//                   placeholder="e.g. mk47-gaming-earbuds-tws" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 2. Category ── */}
//           <SectionCard title="2. Category & Classification">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Category">
//                 <select {...register("category")} className={selectCls}>
//                   {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Subcategory">
//                 <input {...register("subcategory")} type="text"
//                   placeholder="e.g. TWS Earphones & Headphones" className={inputCls} />
//               </Field>
//               <Field label="Sub-subcategory">
//                 <input {...register("subSubcategory")} type="text"
//                   placeholder="e.g. Non-Noise Cancelling TWS" className={inputCls} />
//               </Field>
//               <Field label="HS Code (Harmonized System)">
//                 <input {...register("hsCode")} type="text"
//                   placeholder="e.g. 8518.30.00" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 3. Pricing & MOQ ── */}
//           <SectionCard title="3. Pricing & Order Info">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Field label="Unit Price">
//                 <input {...register("price")} type="number" step="0.01"
//                   placeholder="e.g. 700" className={inputCls} />
//               </Field>
//               <Field label="Currency">
//                 <select {...register("currency")} className={selectCls}>
//                   {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Discount (%)">
//                 <input {...register("discount")} type="number"
//                   placeholder="Optional" className={inputCls} />
//               </Field>
//               <Field label="Minimum Order Quantity (MOQ)">
//                 <input {...register("moq")} type="text"
//                   placeholder="e.g. 10 pieces" className={inputCls} />
//               </Field>
//               <Field label="Stock / Inventory">
//                 <input {...register("stock")} type="number"
//                   placeholder="Available units" className={inputCls} />
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

//           {/* ── 4. Supplier / Manufacturer ── */}
//           <SectionCard title="4. Supplier / Manufacturer">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Supplier / Company Name">
//                 <input {...register("supplierName")} type="text"
//                   placeholder="e.g. Shafir Express LTD" className={inputCls} />
//               </Field>
//               <Field label="Country of Origin">
//                 <select {...register("countryOfOrigin")} className={selectCls}>
//                   {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Years in Business">
//                 <input {...register("supplierYears")} type="text"
//                   placeholder="e.g. 5 yrs" className={inputCls} />
//               </Field>
//               <Field label="Certifications">
//                 <input {...register("certifications")} type="text"
//                   placeholder="e.g. CE, RoHS, FCC, ISO 9001" className={inputCls} />
//               </Field>
//               <Field label="Factory Location">
//                 <input {...register("factoryLocation")} type="text"
//                   placeholder="e.g. Shenzhen, Guangdong, China" className={inputCls} />
//               </Field>
//               <Field label="Production Capacity">
//                 <input {...register("productionCapacity")} type="text"
//                   placeholder="e.g. 50,000 pcs/month" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 5. Shipping & Trade ── */}
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
//                 <input {...register("leadTime")} type="text"
//                   placeholder="e.g. 7-15 business days" className={inputCls} />
//               </Field>
//               <Field label="Port of Loading">
//                 <input {...register("portOfLoading")} type="text"
//                   placeholder="e.g. Shenzhen Port, CN" className={inputCls} />
//               </Field>
//             </div>
//             <Field label="Shipping Details / Notes">
//               <textarea {...register("shippingNotes")} rows={3}
//                 placeholder="e.g. Free sea freight for orders above 500 units, insurance included..."
//                 className={inputCls} />
//             </Field>
//           </SectionCard>

//           {/* ── 6. Specifications (nested accordion) ── */}
//           <SectionCard title="6. Technical Specifications">
//             <p className="text-xs text-gray-400 -mt-2">
//               Fill in only the categories relevant to your product.
//             </p>
//             <div className="space-y-3">
//               {SPEC_CATEGORIES.map((cat) => {
//                 const isOpen = openSpecCategory === cat.key;
//                 return (
//                   <div key={cat.key} className="rounded-xl border border-gray-200 overflow-hidden">
//                     {/* Accordion header */}
//                     <button
//                       type="button"
//                       onClick={() => setOpenSpecCategory(isOpen ? null : cat.key)}
//                       className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
//                     >
//                       <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
//                       {isOpen
//                         ? <ChevronUp className="w-4 h-4 text-gray-400" />
//                         : <ChevronDown className="w-4 h-4 text-gray-400" />
//                       }
//                     </button>

//                     {/* Accordion body */}
//                     {isOpen && (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 pt-2 bg-gray-50">
//                         {cat.fields.map((f) => (
//                           <Field key={f.key} label={f.label}>
//                             <input
//                               type="text"
//                               placeholder={f.placeholder}
//                               value={specs[cat.key][f.key]}
//                               onChange={(e) => updateSpec(cat.key, f.key, e.target.value)}
//                               className={inputCls}
//                             />
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
//                 <input
//                   type="text"
//                   value={packagingDetails}
//                   onChange={(e) => setPackagingDetails(e.target.value)}
//                   placeholder="e.g. 1pc in giftbox, 10 boxes per carton"
//                   className={inputCls}
//                 />
//               </Field>
//               <Field label="Selling Unit">
//                 <input
//                   type="text"
//                   value={sellingUnit}
//                   onChange={(e) => setSellingUnit(e.target.value)}
//                   placeholder="e.g. Single item, Set, Carton"
//                   className={inputCls}
//                 />
//               </Field>
//               <Field label="Gross Weight (per unit)">
//                 <input {...register("grossWeight")} type="text"
//                   placeholder="e.g. 150g" className={inputCls} />
//               </Field>
//               <Field label="Carton Size (L × W × H cm)">
//                 <input {...register("cartonSize")} type="text"
//                   placeholder="e.g. 40 × 30 × 25 cm" className={inputCls} />
//               </Field>
//             </div>
//           </SectionCard>

//           {/* ── 8. Product Variations ── */}
//           <SectionCard title="8. Product Variations">
//             {variations.map((v, i) => (
//               <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 items-center">
//                 <input type="text" placeholder="Color" value={v.color}
//                   onChange={(e) => updateVariation(i, "color", e.target.value)}
//                   className={inputCls} />
//                 <input type="text" placeholder="Size" value={v.size}
//                   onChange={(e) => updateVariation(i, "size", e.target.value)}
//                   className={inputCls} />
//                 <input type="text" placeholder="Variant SKU" value={v.sku}
//                   onChange={(e) => updateVariation(i, "sku", e.target.value)}
//                   className={inputCls} />
//                 <div className="flex gap-2">
//                   <input type="text" placeholder="Stock" value={v.stock}
//                     onChange={(e) => updateVariation(i, "stock", e.target.value)}
//                     className={inputCls} />
//                   {variations.length > 1 && (
//                     <button type="button" onClick={() => removeVariation(i)}
//                       className="text-red-400 hover:text-red-600">
//                       <X className="w-5 h-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             <button type="button" onClick={addVariation}
//               className="flex items-center gap-1 text-sm text-green-600 mt-1 hover:text-green-700">
//               <Plus className="w-4 h-4" /> Add Variation
//             </button>
//           </SectionCard>

//           {/* ── 9. Tags ── */}
//           <SectionCard title="9. Tags & Keywords">
//             <div className="flex gap-2">
//               <input type="text" value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && addTag(e as any)}
//                 placeholder="e.g. gaming, TWS, low-latency, OEM"
//                 className={`${inputCls} flex-grow`} />
//               <button onClick={addTag}
//                 className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium">
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {tags.map((t, i) => (
//                 <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1.5">
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
//                 placeholder="Brief selling pitch for search results and cards..."
//                 className={inputCls} />
//             </Field>
//             <Field label="Full Description">
//               <textarea {...register("description")} rows={6}
//                 placeholder="Detailed product description, use case, features..."
//                 className={inputCls} />
//             </Field>
//           </SectionCard>

//           {/* ── 11. Media ── */}
//           <SectionCard title="11. Product Media">
//             {/* Images */}
//             <Field label="Product Images (Multiple)">
//               <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-6 hover:border-green-500 transition bg-white">
//                 <Upload className="w-8 h-8 text-gray-400" />
//                 <span className="text-gray-500 mt-2 text-sm">Click to upload images</span>
//                 <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
//               </label>
//               {images.length > 0 && (
//                 <div className="flex flex-wrap gap-3 mt-3">
//                   {images.map((img, idx) => (
//                     <div key={idx} className="relative w-24 h-24">
//                       <img src={URL.createObjectURL(img)} alt="Preview"
//                         className="w-full h-full object-cover rounded-lg border" />
//                       <button type="button" onClick={() => removeImage(idx)}
//                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
//                         <X className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Field>

//             {/* Video */}
//             <Field label="Product Video (Optional)">
//               <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer p-6 hover:border-green-500 transition bg-white">
//                 <Upload className="w-8 h-8 text-gray-400" />
//                 <span className="text-gray-500 mt-2 text-sm">Click to upload video</span>
//                 <input type="file" accept="video/*" className="hidden"
//                   onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
//               </label>
//               {video && (
//                 <video controls className="mt-3 w-full rounded-lg border"
//                   src={URL.createObjectURL(video)} />
//               )}
//             </Field>
//           </SectionCard>

//           {/* ── Submit ── */}
//           <button type="submit"
//             className="w-full bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 transition font-bold text-lg shadow-md">
//             🌏 Publish International Product
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }




// 1st jsx

// 'use client'
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Upload, X, Plus } from "lucide-react";

// export default function CreateProduct() {
//   const { register, handleSubmit, reset } = useForm();
//   const [images, setImages] = useState([]);
//   const [video, setVideo] = useState(null);
//   const [tags, setTags] = useState([]);
//   const [tagInput, setTagInput] = useState("");
//   const [variations, setVariations] = useState([{ color: "", size: "" }]);

//   // const onSubmit = (data) => {
//   //   const fullProduct = {
//   //     ...data,
//   //     tags,
//   //     variations,
//   //     images,  
//   //     video,
//   //   };
//   //   console.log("📦 Full Product Data:", fullProduct);
//   //   // Here send to backend via fetch/axios
//   // };

//   const onSubmit = async (data) => {
//     // setLoading(true);
//     // setResponse(null);

//     try {
//       const formData = new FormData();

//       // add basic fields
//       formData.append("nameeng", data.name || "");
//       formData.append("productPrice", data.price || "");
//       formData.append("description", data.description || "");
//       formData.append("category", data.category || "");
//       formData.append("subcategory", data.subcategory || "");
//       formData.append("sku", data.sku || "");
//       formData.append("stock", data.stock || "");
//       formData.append("shipping", data.shipping || "");

//       // tags & variations as JSON strings
//       formData.append("tags", JSON.stringify(tags));
//       formData.append("variations", JSON.stringify(variations));

//       // append images
//       images.forEach((f) => {
//         formData.append("images", f);
//       });

//       // optional video and pdf
//       if (video) formData.append("video", video);
//       // if (pdf) formData.append("pdf", pdf);

//       // send to backend (adjust URL if needed)
//       const res = await fetch("http://localhost:5000/product", {
//         method: "POST",
//         body: formData,
//       });

//       const json = await res.json();
//       setResponse(json);
//     } catch (err) {
//       console.error(err);
//       setResponse({ status: 'error', message: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages((prev) => [...prev, ...files]);
//   };

//   const handleVideoChange = (e) => {
//     setVideo(e.target.files[0]);
//   };

//   const removeImage = (index) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const addTag = (e) => {
//     e.preventDefault();
//     if (tagInput && !tags.includes(tagInput)) {
//       setTags([...tags, tagInput]);
//       setTagInput("");
//     }
//   };

//   const removeTag = (t) => {
//     setTags(tags.filter((tag) => tag !== t));
//   };

//   const addVariation = () => {
//     setVariations([...variations, { color: "", size: "" }]);
//   };

//   const updateVariation = (index, field, value) => {
//     const updated = [...variations];
//     updated[index][field] = value;
//     setVariations(updated);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl">
//         <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
//           🛍️ Add New Product
//         </h1>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Basic Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Product Name
//               </label>
//               <input
//                 {...register("name", { required: true })}
//                 type="text"
//                 placeholder="Example: Wireless Bluetooth Headphones"
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Brand
//               </label>
//               <input
//                 {...register("brand")}
//                 type="text"
//                 placeholder="Brand Name"
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>
//           </div>

//           {/* Category */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category
//               </label>
//               <select
//                 {...register("category")}
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               >
//                 <option>Electronics</option>
//                 <option>Fashion</option>
//                 <option>Beauty</option>
//                 <option>Home & Kitchen</option>
//                 <option>Sports</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Subcategory
//               </label>
//               <input
//                 {...register("subcategory")}
//                 type="text"
//                 placeholder="Example: Headphones, Shoes, Bags..."
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>
//           </div>

//           {/* Price Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Price ($)
//               </label>
//               <input
//                 {...register("price")}
//                 type="number"
//                 placeholder="Enter price"
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Discount (%)
//               </label>
//               <input
//                 {...register("discount")}
//                 type="number"
//                 placeholder="Optional"
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Stock Quantity
//               </label>
//               <input
//                 {...register("stock")}
//                 type="number"
//                 placeholder="Available units"
//                 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>
//           </div>

//           {/* SKU */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               SKU / Product Code
//             </label>
//             <input
//               {...register("sku")}
//               type="text"
//               placeholder="Unique product code"
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               {...register("description")}
//               rows="5"
//               placeholder="Enter detailed product description..."
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Product Variations */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               Product Variations
//             </label>
//             {variations.map((v, i) => (
//               <div key={i} className="flex gap-3 mb-3">
//                 <input
//                   type="text"
//                   placeholder="Color"
//                   value={v.color}
//                   onChange={(e) =>
//                     updateVariation(i, "color", e.target.value)
//                   }
//                   className="w-1/2 px-4 py-2 border rounded-xl"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Size"
//                   value={v.size}
//                   onChange={(e) => updateVariation(i, "size", e.target.value)}
//                   className="w-1/2 px-4 py-2 border rounded-xl"
//                 />
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addVariation}
//               className="flex items-center gap-1 text-green-600 mt-1"
//             >
//               <Plus className="w-4 h-4" /> Add Variation
//             </button>
//           </div>

//           {/* Tags */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Tags (press add)
//             </label>
//             <div className="flex gap-2 mb-2">
//               <input
//                 type="text"
//                 value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 placeholder="Add keyword"
//                 className="flex-grow px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//               />
//               <button
//                 onClick={addTag}
//                 className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
//               >
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {tags.map((t, i) => (
//                 <span
//                   key={i}
//                   className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-2"
//                 >
//                   {t}
//                   <X
//                     className="w-4 h-4 cursor-pointer"
//                     onClick={() => removeTag(t)}
//                   />
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Shipping Info */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Shipping Details
//             </label>
//             <textarea
//               {...register("shipping")}
//               rows="3"
//               placeholder="Example: Free shipping worldwide, 3-5 days delivery..."
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Image Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Product Images (Multiple)
//             </label>
//             <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 hover:border-green-500">
//               <Upload className="w-8 h-8 text-gray-400" />
//               <span className="text-gray-500 mt-2">Click to upload images</span>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={handleImageChange}
//               />
//             </label>
//             <div className="flex flex-wrap gap-3 mt-3">
//               {images.map((img, index) => (
//                 <div key={index} className="relative w-24 h-24">
//                   <img
//                     src={URL.createObjectURL(img)}
//                     alt="Preview"
//                     className="w-full h-full object-cover rounded-lg border"
//                   />
//                   <button
//                     type="button"
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
//                     onClick={() => removeImage(index)}
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Video Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Product Video (Optional)
//             </label>
//             <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 hover:border-green-500">
//               <Upload className="w-8 h-8 text-gray-400" />
//               <span className="text-gray-500 mt-2">Click to upload video</span>
//               <input
//                 type="file"
//                 accept="video/*"
//                 className="hidden"
//                 onChange={handleVideoChange}
//               />
//             </label>
//             {video && (
//               <video
//                 controls
//                 className="mt-3 w-full rounded-lg border"
//                 src={URL.createObjectURL(video)}
//               />
//             )}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold text-lg"
//           >
//             Add Product
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }




// 2nd

// "use client";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Upload, X } from "lucide-react";

// export default function Creatproduct() {
//   const { register, handleSubmit } = useForm();
//   const [images, setImages] = useState([]);
//   const [video, setVideo] = useState(null);

//   const onSubmit = (data) => {
//     console.log("Form Data:", data);
//     console.log("Images:", images);
//     console.log("Video:", video);
//     // send to backend (Cloudinary, S3, etc.)
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages((prev) => [...prev, ...files]);
//   };

//   const handleVideoChange = (e) => {
//     setVideo(e.target.files[0]);
//   };

//   const removeImage = (index) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
//       <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Product Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Product Name
//             </label>
//             <input
//               {...register("name")}
//               type="text"
//               placeholder="Enter product name"
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Price */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Price
//             </label>
//             <input
//               {...register("price")}
//               type="number"
//               placeholder="Enter price"
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               {...register("description")}
//               rows="4"
//               placeholder="Enter product description"
//               className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
//             />
//           </div>

//           {/* Image Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Product Images (Multiple)
//             </label>
//             <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 hover:border-green-500">
//               <Upload className="w-8 h-8 text-gray-400" />
//               <span className="text-gray-500 mt-2">Click to upload images</span>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={handleImageChange}
//               />
//             </label>
//             <div className="flex flex-wrap gap-3 mt-3">
//               {images.map((img, index) => (
//                 <div key={index} className="relative w-24 h-24">
//                   <img
//                     src={URL.createObjectURL(img)}
//                     alt="Preview"
//                     className="w-full h-full object-cover rounded-lg border"
//                   />
//                   <button
//                     type="button"
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
//                     onClick={() => removeImage(index)}
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Video Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Short Video (Optional)
//             </label>
//             <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 hover:border-green-500">
//               <Upload className="w-8 h-8 text-gray-400" />
//               <span className="text-gray-500 mt-2">Click to upload video</span>
//               <input
//                 type="file"
//                 accept="video/*"
//                 className="hidden"
//                 onChange={handleVideoChange}
//               />
//             </label>
//             {video && (
//               <video
//                 controls
//                 className="mt-3 w-full rounded-lg border"
//                 src={URL.createObjectURL(video)}
//               />
//             )}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
//           >
//             Add Product
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
