"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const products = [
  {
    id: "B2B-MK47-001",
    name: "MK47 OEM/ODM Low Latency Gaming Earbuds - True Wireless Stereo TWS",
    slug: "mk47-gaming-earbuds-low-latency-tws",
    price: "৳ 700",
    offerPrice: "৳ 550",
    moq: "10 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Blue",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80"],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    description:
      "Engineered for competitive mobile gaming with ultra-low latency under 30ms, JL6983D2 chipset, and multicolor RGB breathing lights.",
    specifications: {
      audio: { chipset: "JL6983D2", soundProfile: "HiFi Ultra-Bass", latency: "< 30 ms", frequencyResponse: "20Hz - 20kHz" },
      battery: { earphoneCapacity: "30 mAh", chargingBox: "300 mAh", musicTime: "3-4 hrs", standby: "120 hrs" },
      build: { waterproof: "IPX-4", light: "Multicolor RGB LED", model: "MK47" },
      business: { oemOdm: "Available", customLogo: "MOQ 500+", leadTime: "7-15 Days" },
    },
  },
  {
    id: "B2B-HDP-002",
    name: "StudioPro Wireless Noise Cancelling Headphones - Bluetooth 5.3 HiFi",
    slug: "studiopro-wireless-noise-cancelling-headphones",
    price: "৳ 4,500",
    offerPrice: "৳ 3,800",
    moq: "5 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Midnight Black",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Experience acoustic perfection with Active Noise Cancellation, 40 hours of playtime, and memory foam ear cushions.",
    specifications: {
      audio: { driver: "40mm Neodymium", frequency: "20Hz - 40kHz", anc: "Hybrid ANC -35dB", mics: "4-Mic Beamforming" },
      battery: { playtime: "40 hrs ANC On", fastCharge: "10 min = 5 hrs", capacity: "750 mAh", interface: "USB-C" },
      business: { oemOdm: "Custom Logo Printing", warranty: "12 Months", leadTime: "10 Days" },
    },
  },
  {
    id: "B2B-SMW-003",
    name: "Ultra-Fit Series 9 Smartwatch - AMOLED Display Blood Oxygen Monitor",
    slug: "ultra-fit-series-9-smartwatch-amoled",
    price: "৳ 2,500",
    offerPrice: "৳ 1,950",
    moq: "10 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Titanium Grey",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "The ultimate fitness companion with AMOLED display, heart rate tracking, sleep monitoring, and 100+ sport modes.",
    specifications: {
      display: { type: "AMOLED Always-On", size: "1.96 Inch", resolution: "410x502px", brightness: "600 Nits" },
      sensors: { health: "HR, SpO2, Sleep", motion: "Accelerometer + Gyro", waterproof: "IP68 / 5ATM" },
      connectivity: { bluetooth: "v5.2 Calling", app: "FitCloudPro", compatibility: "iOS 10+ / Android 5+" },
      business: { packaging: "Retail Box", customization: "Custom Boot Logo", leadTime: "14 Days" },
    },
  },
  {
    id: "B2B-SPK-004",
    name: "BoomBox IPX7 Waterproof Portable Speaker - 20W Deep Bass Stereo",
    slug: "boombox-waterproof-portable-speaker-20w",
    price: "৳ 1,800",
    offerPrice: "৳ 1,500",
    moq: "15 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Ocean Blue",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Rugged outdoor speaker with TWS pairing, 20W deep bass stereo, and IPX7 waterproof protection.",
    specifications: {
      sound: { output: "20W Double Bass", twsMode: "Supported", signalNoise: ">=85dB" },
      protection: { rating: "IPX7 Waterproof", material: "Silicone Rugged Armor", impact: "Drop-proof 1.5m" },
      business: { moq: "500 for Custom Color", certifications: "CE, ROHS, FCC", leadTime: "7 Days" },
    },
  },
  {
    id: "B2B-JEW-005",
    name: "18K Gold Plated Luxury Necklace - Minimalist Pendant for Women",
    slug: "18k-gold-plated-luxury-necklace",
    price: "৳ 10,080",
    offerPrice: "৳ 8,500",
    moq: "3 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Rose Gold",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Crafted from hypoallergenic 925 Sterling Silver plated with 18K gold. Timeless minimalist pendant for daily wear.",
    specifications: {
      material: { base: "925 Sterling Silver", plating: "18K Gold 3 Microns", stones: "AAA Cubic Zirconia" },
      size: { chainLength: "45cm + 5cm", pendantSize: "12mm x 12mm", weight: "4.5g" },
      business: { packaging: "Velvet Pouch + Box", certificate: "Authenticity Card", oem: "Engraved Logo on Clasp" },
    },
  },
  {
    id: "B2B-CHR-006",
    name: "Ergonomic Mesh Office Chair - High Back Adjustable Lumbar Support",
    slug: "ergonomic-mesh-office-chair-high-back",
    price: "৳ 8,500",
    offerPrice: "৳ 7,200",
    moq: "10 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Grey/White",
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Engineered for long-hour comfort with breathable mesh and adjustable lumbar support.",
    specifications: {
      ergonomics: { backrest: "90-135 Recline", lumbar: "3D Adjustable", armrest: "2D Height Adjustable" },
      materials: { mesh: "High-Density Elastic", base: "Heavy Duty Nylon", gasLift: "Class 4 SGS Certified" },
      business: { assembly: "Tools Included 15min", weightCapacity: "150kg / 330lbs", leadTime: "25 Days" },
    },
  },
  {
    id: "B2B-PHN-007",
    name: "Gaming Mechanical Keyboard RGB - TKL Compact Hot-Swap Cherry MX",
    slug: "gaming-mechanical-keyboard-rgb-tkl",
    price: "৳ 3,200",
    offerPrice: "৳ 2,600",
    moq: "8 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Space Grey",
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "TKL hot-swap mechanical keyboard with per-key RGB, N-key rollover, and PBT double-shot keycaps.",
    specifications: {
      keyboard: { layout: "TKL 87-Key", switches: "Hot-Swap", keycaps: "PBT Double-Shot" },
      lighting: { rgb: "Per-Key RGB 16.8M Colors", effects: "20+ Preset Animations", software: "Custom Macro App" },
      connectivity: { interface: "USB-C Detachable", nkro: "Full N-Key Rollover", polling: "1000Hz" },
      business: { oemOdm: "Custom Layout Available", certifications: "CE, FCC, RoHS", leadTime: "12 Days" },
    },
  },
  {
    id: "B2B-MSE-008",
    name: "ProGamer Wireless Mouse - 26000 DPI PAW3395 Optical Sensor",
    slug: "progamer-wireless-mouse-26000dpi",
    price: "৳ 2,900",
    offerPrice: "৳ 2,400",
    moq: "10 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Matte Black",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Ultra-lightweight wireless gaming mouse with PAW3395 sensor, 70-hour battery life, and low-latency connection.",
    specifications: {
      sensor: { model: "PAW3395 Optical", dpi: "100 - 26000 DPI", ips: "650 IPS", acceleration: "50G" },
      design: { weight: "59g Ultralight", material: "Honeycomb Shell", buttons: "6 Programmable" },
      connectivity: { wireless: "2.4GHz USB Dongle", battery: "70 hrs per Charge", charging: "USB-C 1hr Fast" },
      business: { packaging: "Retail Giftbox", customLogo: "Laser Engraving", leadTime: "10 Days" },
    },
  },
  {
    id: "B2B-SHT-009",
    name: "Premium Cotton Oversized T-Shirt - Unisex Streetwear 280GSM",
    slug: "premium-cotton-oversized-tshirt-280gsm",
    price: "৳ 650",
    offerPrice: "৳ 480",
    moq: "50 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "BD", verified: true },
    selectedColor: "Washed Black",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Heavyweight 280GSM ringspun cotton oversized T-shirt, pre-shrunk and ready for printing or embroidery.",
    specifications: {
      fabric: { weight: "280GSM", composition: "100% Ringspun Cotton", finish: "Enzyme Washed" },
      sizing: { fit: "Oversized Unisex", sizes: "XS to 4XL", shrinkage: "Pre-Shrunk < 3%" },
      customization: { printing: "Screen Print / DTG / Embroidery", label: "Custom Woven Label", packaging: "Individual Poly Bag" },
      business: { moq: "50 pcs per Color", sampleTime: "5-7 Days", leadTime: "15-20 Days" },
    },
  },
  {
    id: "B2B-LED-010",
    name: "Smart LED Strip Lights - 5M WiFi RGBIC Music Sync Alexa Compatible",
    slug: "smart-led-strip-lights-5m-wifi-rgbic",
    price: "৳ 1,200",
    offerPrice: "৳ 950",
    moq: "20 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Multi-Color",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "RGBIC individually addressable LED strip with music sync, WiFi app control, and Alexa plus Google Home compatibility.",
    specifications: {
      lighting: { type: "RGBIC Individually Addressable", length: "5 Meters", ledCount: "300 LEDs / 5M", brightness: "1200 Lumens" },
      smart: { connectivity: "WiFi 2.4GHz", app: "Smart Life / Tuya", voiceControl: "Alexa + Google Home" },
      build: { voltage: "DC 12V", ip: "IP20 Indoor", adhesive: "3M Strong Tape" },
      business: { certifications: "CE, RoHS, ETL", customLength: "Custom Cut Available", leadTime: "7-10 Days" },
    },
  },
  {
    id: "B2B-BAG-011",
    name: "Anti-Theft Waterproof Laptop Backpack - 30L USB Charging Port",
    slug: "anti-theft-waterproof-laptop-backpack-30l",
    price: "৳ 2,100",
    offerPrice: "৳ 1,750",
    moq: "20 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Charcoal Grey",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Hidden zipper anti-theft backpack with USB charging port, TSA-friendly laptop compartment, and waterproof fabric.",
    specifications: {
      storage: { capacity: "30 Liters", laptopFit: "Up to 17 Inch", compartments: "5 Main Sections", pockets: "8 Total Pockets" },
      material: { outer: "900D Oxford Waterproof", inner: "Polyester Lining", handle: "Reinforced Luggage Strap" },
      features: { charging: "External USB-A Port", lock: "Hidden Anti-Theft Zipper", tsa: "TSA Approved Pass-Through" },
      business: { branding: "Embroidery or Patch Logo", moq: "50 pcs Custom", leadTime: "14-18 Days" },
    },
  },
  {
    id: "B2B-PWR-012",
    name: "65W GaN USB-C Power Bank - 20000mAh PD Fast Charge Slim",
    slug: "65w-gan-usbc-power-bank-20000mah",
    price: "৳ 3,500",
    offerPrice: "৳ 2,900",
    moq: "15 pieces",
    supplier: { name: "Shafir Express LTD", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Frost White",
    images: ["https://images.unsplash.com/photo-1609592806596-b43bada2f5b2?auto=format&fit=crop&w=900&q=80"],
    videos: [],
    description:
      "Slim 65W power bank with 20000mAh capacity, 3 outputs, and intelligent power distribution.",
    specifications: {
      power: { capacity: "20000 mAh", maxOutput: "65W PD via USB-C", totalOutput: "90W Combined", input: "45W USB-C PD" },
      ports: { usbC1: "65W Power Delivery", usbC2: "18W Fast Charge", usbA: "22.5W Quick Charge 3.0" },
      design: { thickness: "14.5mm Ultra-Slim", weight: "385g", display: "LED Digital % Indicator" },
      business: { certifications: "CE, FCC, ROHS, UN38.3", customLogo: "Laser or Print", leadTime: "10-12 Days" },
    },
  },
];

const parseNumber = (value) => Number(String(value).replace(/[^\d]/g, "") || 0);

const getCategory = (name) => {
  const text = name.toLowerCase();

  if (text.includes("earbuds") || text.includes("headphones") || text.includes("speaker")) return "Audio";
  if (text.includes("watch")) return "Wearables";
  if (text.includes("keyboard") || text.includes("mouse")) return "Gaming";
  if (text.includes("necklace")) return "Jewelry";
  if (text.includes("chair")) return "Furniture";
  if (text.includes("shirt")) return "Apparel";
  if (text.includes("led")) return "Smart Home";
  if (text.includes("backpack")) return "Bags";
  if (text.includes("power bank")) return "Power";

  return "General";
};

const getLeadTime = (product) => product.specifications?.business?.leadTime || "Ready to quote";

const uniqueValues = (items, getter) =>
  Array.from(new Set(items.map(getter))).filter(Boolean);

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [page, setPage] = useState(1);

  const perPage = 6;

  const categories = useMemo(() => uniqueValues(products, (p) => getCategory(p.name)), []);
  const colors = useMemo(() => uniqueValues(products, (p) => p.selectedColor), []);
  const countries = useMemo(() => uniqueValues(products, (p) => p.supplier.country), []);

  const toggleFilter = (value, setSelected) => {
    setPage(1);
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const filteredProducts = useMemo(() => {
    let data = products.filter((product) => {
      const category = getCategory(product.name);
      const price = parseNumber(product.offerPrice || product.price);
      const keyword = search.trim().toLowerCase();

      const matchedSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.id.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.supplier.name.toLowerCase().includes(keyword);

      return (
        matchedSearch &&
        (selectedCategories.length ? selectedCategories.includes(category) : true) &&
        (selectedColors.length ? selectedColors.includes(product.selectedColor) : true) &&
        (selectedCountries.length ? selectedCountries.includes(product.supplier.country) : true) &&
        price >= priceRange[0] &&
        price <= priceRange[1]
      );
    });

    if (sortBy === "price-low") {
      data = [...data].sort((a, b) => parseNumber(a.offerPrice) - parseNumber(b.offerPrice));
    }

    if (sortBy === "price-high") {
      data = [...data].sort((a, b) => parseNumber(b.offerPrice) - parseNumber(a.offerPrice));
    }

    if (sortBy === "moq-low") {
      data = [...data].sort((a, b) => parseNumber(a.moq) - parseNumber(b.moq));
    }

    if (sortBy === "verified") {
      data = [...data].sort((a, b) => Number(b.supplier.verified) - Number(a.supplier.verified));
    }

    return data;
  }, [search, selectedCategories, selectedColors, selectedCountries, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * perPage, safePage * perPage);

  const activeFilterCount =
    selectedCategories.length + selectedColors.length + selectedCountries.length;

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedCountries([]);
    setPriceRange([0, 12000]);
    setSearch("");
    setSortBy("recommended");
    setPage(1);
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Global B2B Marketplace</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Wholesale Product Catalog
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Source verified products with MOQ, supplier history, lead time, wholesale price,
                and export-ready specifications.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Products" value={products.length} />
              <Stat label="Matched" value={filteredProducts.length} />
              <Stat label="Verified" value={products.filter((p) => p.supplier.verified).length} />
            </div>
          </div>
        </header>

        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_160px]">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search product name, supplier, SKU, or keyword..."
              className="h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="moq-low">Lowest MOQ</option>
              <option value="verified">Verified First</option>
            </select>

            <button
              onClick={resetFilters}
              className="h-11 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <motion.aside
            initial={{ x: -18, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">Filters</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
                </p>
              </div>

              <button
                onClick={resetFilters}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Clear
              </button>
            </div>

            <FilterGroup
              title="Category"
              items={categories}
              selected={selectedCategories}
              onToggle={(value) => toggleFilter(value, setSelectedCategories)}
            />

            <FilterGroup
              title="Color"
              items={colors}
              selected={selectedColors}
              onToggle={(value) => toggleFilter(value, setSelectedColors)}
            />

            <FilterGroup
              title="Supplier Country"
              items={countries}
              selected={selectedCountries}
              onToggle={(value) => toggleFilter(value, setSelectedCountries)}
            />

            <div className="border-t border-gray-200 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-950">Price Range</h3>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-gray-500">Min</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(event) => {
                      setPriceRange([Number(event.target.value), priceRange[1]]);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-gray-500">Max</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(event) => {
                      setPriceRange([priceRange[0], Number(event.target.value)]);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                  />
                </label>
              </div>
            </div>
          </motion.aside>

          <main>
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-950">{paginatedProducts.length}</span>{" "}
                of <span className="font-semibold text-gray-950">{filteredProducts.length}</span> products
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-md bg-gray-100 px-2.5 py-1">Trade Assurance</span>
                <span className="rounded-md bg-gray-100 px-2.5 py-1">OEM/ODM</span>
                <span className="rounded-md bg-gray-100 px-2.5 py-1">Fast RFQ</span>
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-950">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search keyword or removing selected filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="h-10 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>

              <div className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                Page {safePage} of {totalPages}
              </div>

              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-10 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }) {
  const category = getCategory(product.name);
  const leadTime = getLeadTime(product);
  const firstSpecGroup = Object.values(product.specifications || {})[0] || {};
  const highlights = Object.entries(firstSpecGroup).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.035 }}
      className="group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-64 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-full"
          />

          <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            {category}
          </span>

          {product.supplier.verified && (
            <span className="absolute right-3 top-3 rounded-md bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Verified
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{product.id}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{product.selectedColor}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{product.supplier.country}</span>
          </div>

          <h3 className="text-base font-semibold leading-6 text-gray-950">{product.name}</h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniInfo label="MOQ" value={product.moq} />
            <MiniInfo label="Lead Time" value={leadTime} />
            <MiniInfo label="Supplier" value={product.supplier.yearsActive} />
          </div>

          {highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {highlights.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-md bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600"
                >
                  <span className="font-medium capitalize text-gray-800">{key}: </span>
                  {String(value)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-gray-500">Wholesale price</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-950">{product.offerPrice}</span>
                  <span className="text-sm text-gray-400 line-through">{product.price}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Sample and bulk order supported</p>
              </div>

              <div className="flex gap-2">
                <button className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                  Contact
                </button>
                <button className="h-10 rounded-md bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{product.supplier.name}</span>
              <span>·</span>
              <span>{product.supplier.yearsActive}</span>
              <span>·</span>
              <span>Trade-ready supplier</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FilterGroup({ title, items, selected, onToggle }) {
  return (
    <div className="mb-5 border-t border-gray-200 pt-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-950">{title}</h3>

      <div className="space-y-1">
        {items.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <span className="pr-3">{item}</span>
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="h-4 w-4 accent-gray-900"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-950">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}





// "use client";
// import { useState, useMemo } from "react";

// // Dummy product data WITH IMAGES
// const productsData = [
//   { id: 1, name: "Red Shirt", category: "Clothing", price: 30, color: "Red", language: "English", image: "https://via.placeholder.com/250x200?text=Red+Shirt" },
//   { id: 2, name: "Blue Jeans", category: "Clothing", price: 50, color: "Blue", language: "English", image: "https://via.placeholder.com/250x200?text=Blue+Jeans" },
//   { id: 3, name: "Green Book", category: "Books", price: 20, color: "Green", language: "Bangla", image: "https://via.placeholder.com/250x200?text=Green+Book" },
//   { id: 4, name: "Black Laptop", category: "Electronics", price: 700, color: "Black", language: "English", image: "https://via.placeholder.com/250x200?text=Black+Laptop" },
//   { id: 5, name: "White Phone", category: "Electronics", price: 400, color: "White", language: "Hindi", image: "https://via.placeholder.com/250x200?text=White+Phone" },
// ];

// const getUniqueValues = (data, key) => [...new Set(data.map((item) => item[key]))];

// export default function ProductsPage() {
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedColors, setSelectedColors] = useState([]);
//   const [selectedLanguages, setSelectedLanguages] = useState([]);
//   const [priceRange, setPriceRange] = useState([0, 1000]);

//   const toggleFilter = (value, selected, setSelected) => {
//     setSelected((prev) =>
//       prev.includes(value)
//         ? prev.filter((v) => v !== value)
//         : [...prev, value]
//     );
//   };

//   const filteredProducts = useMemo(() => {
//     return productsData.filter((p) => {
//       return (
//         (selectedCategories.length ? selectedCategories.includes(p.category) : true) &&
//         (selectedColors.length ? selectedColors.includes(p.color) : true) &&
//         (selectedLanguages.length ? selectedLanguages.includes(p.language) : true) &&
//         p.price >= priceRange[0] &&
//         p.price <= priceRange[1]
//       );
//     });
//   }, [selectedCategories, selectedColors, selectedLanguages, priceRange]);

//   const categories = getUniqueValues(productsData, "category");
//   const colors = getUniqueValues(productsData, "color");
//   const languages = getUniqueValues(productsData, "language");

//   return (
//     <div className="flex gap-8 p-6">
//       {/* Filters */}
//       <aside className="w-1/4 space-y-6 p-4 border rounded-lg shadow">
//         <h2 className="text-xl font-semibold">Filters</h2>

//         {/* Category Filter */}
//         <div>
//           <h3 className="font-medium mb-2">Category</h3>
//           {categories.map((c) => (
//             <label key={c} className="flex items-center gap-2 mb-1">
//               <input
//                 type="checkbox"
//                 checked={selectedCategories.includes(c)}
//                 onChange={() => toggleFilter(c, selectedCategories, setSelectedCategories)}
//               />
//               {c}
//             </label>
//           ))}
//         </div>

//         {/* Color Filter */}
//         <div>
//           <h3 className="font-medium mb-2">Color</h3>
//           {colors.map((c) => (
//             <label key={c} className="flex items-center gap-2 mb-1">
//               <input
//                 type="checkbox"
//                 checked={selectedColors.includes(c)}
//                 onChange={() => toggleFilter(c, selectedColors, setSelectedColors)}
//               />
//               {c}
//             </label>
//           ))}
//         </div>

//         {/* Language Filter */}
//         <div>
//           <h3 className="font-medium mb-2">Language</h3>
//           {languages.map((l) => (
//             <label key={l} className="flex items-center gap-2 mb-1">
//               <input
//                 type="checkbox"
//                 checked={selectedLanguages.includes(l)}
//                 onChange={() => toggleFilter(l, selectedLanguages, setSelectedLanguages)}
//               />
//               {l}
//             </label>
//           ))}
//         </div>

//         {/* Price Range */}
//         <div>
//           <h3 className="font-medium mb-2">Price Range</h3>
//           <div className="flex items-center gap-2">
//             <input
//               type="number"
//               className="w-20 border rounded p-1"
//               value={priceRange[0]}
//               onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
//             />
//             <span>-</span>
//             <input
//               type="number"
//               className="w-20 border rounded p-1"
//               value={priceRange[1]}
//               onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
//             />
//           </div>
//         </div>

//         <button
//           onClick={() => {
//             setSelectedCategories([]);
//             setSelectedColors([]);
//             setSelectedLanguages([]);
//             setPriceRange([0, 1000]);
//           }}
//           className="w-full mt-4 bg-gray-200 hover:bg-gray-300 p-2 rounded"
//         >
//           Reset Filters
//         </button>
//       </aside>

//       {/* Product Grid */}
//       <main className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((p) => (
//             <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
//               <img
//                 src={p.image}
//                 alt={p.name}
//                 className="w-full h-40 object-cover rounded mb-3"
//               />
//               <h3 className="font-semibold">{p.name}</h3>
//               <p className="text-sm text-gray-600">{p.category}</p>
//               <p className="text-sm">Color: {p.color}</p>
//               <p className="text-sm">Language: {p.language}</p>
//               <p className="font-bold text-lg mt-1">${p.price}</p>
//             </div>
//           ))
//         ) : (
//           <p className="col-span-full text-center text-gray-500">No products found.</p>
//         )}
//       </main>
//     </div>
//   );
// }
