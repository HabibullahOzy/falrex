"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { useSwipeable } from "react-swipeable";
import { usePinch } from "@use-gesture/react";
import Link from "next/link";
import RelatedProducts from "../relatedProducts/page";
import CartButtons from "../CartButtons";
import ProductReviews from "@/app/component/reviewcomp/ProductReviews";
import ChatButton from "@/app/component/socialCommunication/ChatButton";

interface ProductImage {
  url: string;
  public_id: string;
  _id: string;
}

interface ProductVideo {
  url: string;
  public_id: string;
}

interface Variation {
  color: string;
  size: string;
  sku: string;
  stock: string;
  _id: string;
}

interface MongoProduct {
  _id: string;
  nameEng: string;
  nameLocal?: string;
  brand?: string;
  modelNumber?: string;
  sku?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  hsCode?: string;
  price?: number;
  currency?: string;
  discount?: number;
  moq?: string;
  stock?: number;
  sampleAvailable?: string;
  supplierName?: string;
  countryOfOrigin?: string;
  supplierYears?: string;
  certifications?: string;
  factoryLocation?: string;
  productionCapacity?: string;
  incoterms?: string;
  shippingMethod?: string;
  leadTime?: string;
  portOfLoading?: string;
  shippingNotes?: string;
  specifications?: Record<string, Record<string, string>>;
  packagingDetails?: string;
  sellingUnit?: string;
  grossWeight?: string;
  cartonSize?: string;
  variations?: Variation[];
  tags?: string[];
  shortDescription?: string;
  description?: string;
  images?: ProductImage[];
  video?: ProductVideo | null;
}

interface SpecField {
  key: string;
  label: string;
  unit?: string;
}

interface SpecGroup {
  label: string;
  icon: string;
  fields: SpecField[];
}

const SPEC_SCHEMAS: Record<string, Record<string, SpecGroup>> = {
  "Consumer Electronics": {
    audio: {
      label: "Audio Performance",
      icon: "🔊",
      fields: [
        { key: "chipset", label: "Chipset" },
        { key: "soundProfile", label: "Sound Profile" },
        { key: "driverSize", label: "Driver Size" },
        { key: "latency", label: "Latency" },
        { key: "frequencyResponse", label: "Frequency Response" },
        { key: "noiseCancellation", label: "Noise Cancellation" },
        { key: "microphone", label: "Microphone" },
      ],
    },
    battery: {
      label: "Battery & Power",
      icon: "🔋",
      fields: [
        { key: "earphoneCapacity", label: "Earphone Battery", unit: "mAh" },
        { key: "chargingBoxCapacity", label: "Case Battery", unit: "mAh" },
        { key: "musicCallTime", label: "Music / Call Time", unit: "hrs" },
        { key: "standbyTime", label: "Standby Time", unit: "hrs" },
        { key: "chargingTime", label: "Charging Time", unit: "hrs" },
        { key: "interface", label: "Charging Port" },
        { key: "fastCharging", label: "Fast Charging" },
      ],
    },
    build: {
      label: "Build & Design",
      icon: "🏗️",
      fields: [
        { key: "modelNumber", label: "Model Number" },
        { key: "waterproofStandard", label: "Water Resistance" },
        { key: "gameAtmosphereLight", label: "Atmosphere Light" },
        { key: "material", label: "Material" },
        { key: "weight", label: "Weight", unit: "g" },
        { key: "color", label: "Color" },
        { key: "formFactor", label: "Form Factor" },
        { key: "batteryIndicator", label: "Battery Indicator" },
      ],
    },
    connectivity: {
      label: "Connectivity",
      icon: "📶",
      fields: [
        { key: "bluetoothVersion", label: "Bluetooth Version" },
        { key: "transmissionDistance", label: "Range", unit: "m" },
        { key: "protocols", label: "Protocols" },
        { key: "multipoint", label: "Multipoint" },
        { key: "nfc", label: "NFC" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Logo / MOQ" },
        { key: "leadTime", label: "Lead Time" },
        { key: "packaging", label: "Packaging" },
        { key: "certificate", label: "Certificate" },
      ],
    },
  },

  "Jewellery & Accessories": {
    material: {
      label: "Material & Metal",
      icon: "💍",
      fields: [
        { key: "metalType", label: "Metal Type" },
        { key: "plating", label: "Plating" },
        { key: "karat", label: "Karat" },
        { key: "purity", label: "Purity" },
        { key: "baseMetal", label: "Base Metal" },
        { key: "finish", label: "Finish" },
        { key: "weight", label: "Weight", unit: "g" },
      ],
    },
    stone: {
      label: "Stone & Gem",
      icon: "💎",
      fields: [
        { key: "stoneType", label: "Stone Type" },
        { key: "stoneCut", label: "Stone Cut" },
        { key: "stoneColor", label: "Stone Color" },
        { key: "stoneCarat", label: "Carat Weight" },
        { key: "clarity", label: "Clarity" },
        { key: "certification", label: "Gem Certificate" },
        { key: "synthetic", label: "Synthetic / Natural" },
      ],
    },
    dimensions: {
      label: "Size & Dimensions",
      icon: "📐",
      fields: [
        { key: "length", label: "Length", unit: "cm" },
        { key: "width", label: "Width", unit: "mm" },
        { key: "diameter", label: "Diameter", unit: "mm" },
        { key: "adjustable", label: "Adjustable" },
        { key: "size", label: "Size" },
        { key: "closure", label: "Closure Type" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "packaging", label: "Packaging" },
        { key: "certificate", label: "Certificate" },
        { key: "customLogo", label: "Custom Logo / Box" },
        { key: "leadTime", label: "Lead Time" },
        { key: "oemOdm", label: "OEM / ODM" },
      ],
    },
  },

  "Fashion & Apparel": {
    fabric: {
      label: "Fabric & Material",
      icon: "🧵",
      fields: [
        { key: "fabricType", label: "Fabric Type" },
        { key: "composition", label: "Composition" },
        { key: "gsm", label: "GSM", unit: "g/m²" },
        { key: "weave", label: "Weave" },
        { key: "finish", label: "Finish" },
        { key: "careInstructions", label: "Care Instructions" },
      ],
    },
    sizing: {
      label: "Sizing & Fit",
      icon: "📏",
      fields: [
        { key: "availableSizes", label: "Available Sizes" },
        { key: "fit", label: "Fit Type" },
        { key: "gender", label: "Gender" },
        { key: "ageGroup", label: "Age Group" },
        { key: "sizeChart", label: "Size Chart" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Label / Tag" },
        { key: "leadTime", label: "Lead Time" },
        { key: "packaging", label: "Packaging" },
        { key: "printMethod", label: "Print Method" },
      ],
    },
  },

  "Beauty & Personal Care": {
    formula: {
      label: "Formula & Ingredients",
      icon: "🧪",
      fields: [
        { key: "keyIngredients", label: "Key Ingredients" },
        { key: "skinType", label: "Skin Type" },
        { key: "fragrance", label: "Fragrance" },
        { key: "spf", label: "SPF" },
        { key: "vegan", label: "Vegan / Cruelty Free" },
        { key: "formulaType", label: "Formula Type" },
      ],
    },
    packaging: {
      label: "Packaging & Volume",
      icon: "📦",
      fields: [
        { key: "volume", label: "Volume", unit: "ml" },
        { key: "weight", label: "Weight", unit: "g" },
        { key: "packagingType", label: "Packaging Type" },
        { key: "shelfLife", label: "Shelf Life" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Label" },
        { key: "leadTime", label: "Lead Time" },
        { key: "certificate", label: "Certifications" },
        { key: "regulatoryApproval", label: "Regulatory Approval" },
      ],
    },
  },

  "Health & Medical": {
    technical: {
      label: "Technical Specs",
      icon: "⚕️",
      fields: [
        { key: "measurementRange", label: "Measurement Range" },
        { key: "accuracy", label: "Accuracy" },
        { key: "displayType", label: "Display" },
        { key: "memory", label: "Memory" },
        { key: "power", label: "Power Source" },
      ],
    },
    compliance: {
      label: "Compliance & Safety",
      icon: "✅",
      fields: [
        { key: "fda", label: "FDA Approved" },
        { key: "ce", label: "CE Marking" },
        { key: "iso", label: "ISO Standard" },
        { key: "sterilization", label: "Sterilization" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
        { key: "packaging", label: "Packaging" },
      ],
    },
  },

  "Home & Kitchen": {
    build: {
      label: "Build & Material",
      icon: "🏠",
      fields: [
        { key: "material", label: "Material" },
        { key: "capacity", label: "Capacity", unit: "L" },
        { key: "power", label: "Power", unit: "W" },
        { key: "voltage", label: "Voltage", unit: "V" },
        { key: "dimensions", label: "Dimensions" },
        { key: "color", label: "Color" },
      ],
    },
    features: {
      label: "Features",
      icon: "✨",
      fields: [
        { key: "coating", label: "Coating" },
        { key: "heatResistant", label: "Heat Resistant" },
        { key: "dishwasherSafe", label: "Dishwasher Safe" },
        { key: "smartFeatures", label: "Smart Features" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
        { key: "packaging", label: "Packaging" },
      ],
    },
  },

  "Sports & Outdoors": {
    performance: {
      label: "Performance",
      icon: "🏋️",
      fields: [
        { key: "material", label: "Material" },
        { key: "weight", label: "Weight", unit: "kg" },
        { key: "maxLoad", label: "Max Load", unit: "kg" },
        { key: "resistance", label: "Resistance Level" },
        { key: "dimensions", label: "Dimensions" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
      ],
    },
  },

  Automotive: {
    technical: {
      label: "Technical Specs",
      icon: "🚗",
      fields: [
        { key: "compatibility", label: "Compatibility" },
        { key: "voltage", label: "Voltage", unit: "V" },
        { key: "resolution", label: "Resolution" },
        { key: "viewAngle", label: "View Angle" },
        { key: "material", label: "Material" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
      ],
    },
  },

  "Industrial & Machinery": {
    technical: {
      label: "Technical Specs",
      icon: "⚙️",
      fields: [
        { key: "power", label: "Power", unit: "W" },
        { key: "voltage", label: "Voltage", unit: "V" },
        { key: "rpm", label: "RPM" },
        { key: "torque", label: "Torque", unit: "Nm" },
        { key: "capacity", label: "Capacity" },
        { key: "material", label: "Material" },
        { key: "ipRating", label: "IP Rating" },
      ],
    },
    compliance: {
      label: "Standards & Safety",
      icon: "✅",
      fields: [
        { key: "certification", label: "Certification" },
        { key: "safetyStandard", label: "Safety Standard" },
        { key: "warranty", label: "Warranty" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
      ],
    },
  },

  "Food & Beverage": {
    nutrition: {
      label: "Nutrition & Ingredients",
      icon: "🍎",
      fields: [
        { key: "ingredients", label: "Ingredients" },
        { key: "calories", label: "Calories", unit: "kcal" },
        { key: "protein", label: "Protein", unit: "g" },
        { key: "sugar", label: "Sugar", unit: "g" },
        { key: "allergens", label: "Allergens" },
        { key: "halal", label: "Halal Certificate" },
        { key: "organic", label: "Organic" },
      ],
    },
    packaging: {
      label: "Packaging & Storage",
      icon: "📦",
      fields: [
        { key: "volume", label: "Volume / Weight" },
        { key: "shelfLife", label: "Shelf Life" },
        { key: "storage", label: "Storage Conditions" },
        { key: "packagingType", label: "Packaging Type" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLabel", label: "Custom Label" },
        { key: "leadTime", label: "Lead Time" },
        { key: "moqBulk", label: "Bulk MOQ" },
      ],
    },
  },

  "Toys & Hobbies": {
    details: {
      label: "Product Details",
      icon: "🎮",
      fields: [
        { key: "ageRange", label: "Age Range" },
        { key: "material", label: "Material" },
        { key: "batteryRequired", label: "Battery Required" },
        { key: "dimensions", label: "Dimensions" },
        { key: "safety", label: "Safety Standard" },
      ],
    },
    business: {
      label: "Business / OEM",
      icon: "🏭",
      fields: [
        { key: "oemOdm", label: "OEM / ODM" },
        { key: "customLogo", label: "Custom Branding" },
        { key: "leadTime", label: "Lead Time" },
      ],
    },
  },
};

const FALLBACK_SCHEMA: Record<string, SpecGroup> = {
  general: {
    label: "General Specifications",
    icon: "📋",
    fields: [],
  },
  business: {
    label: "Business / OEM",
    icon: "🏭",
    fields: [
      { key: "oemOdm", label: "OEM / ODM" },
      { key: "customLogo", label: "Custom Branding" },
      { key: "leadTime", label: "Lead Time" },
      { key: "packaging", label: "Packaging" },
      { key: "certificate", label: "Certificate" },
    ],
  },
};

function toLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

function currencySymbol(currency?: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  if (currency.includes("৳") || currency.includes("BDT")) return "৳";
  return currency;
}

const StarRating = ({ rating = 4 }: { rating?: number }) => (
  <div className="mt-3 flex items-center gap-2">
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`text-xl ${index < rating ? "text-yellow-400" : "text-slate-300"}`}
        >
          ★
        </span>
      ))}
    </div>
    <span className="text-sm font-semibold text-slate-700">{rating}</span>
  </div>
);

function SpecTable({
  group,
  data,
}: {
  group: SpecGroup;
  data: Record<string, string>;
}) {
  const knownKeys = new Set(group.fields.map((field) => field.key));

  const knownRows = group.fields
    .filter((field) => data[field.key])
    .map((field) => ({
      label: field.label,
      value: `${data[field.key]}${field.unit ? ` ${field.unit}` : ""}`,
    }));

  const extraRows = Object.entries(data)
    .filter(([key, value]) => !knownKeys.has(key) && value)
    .map(([key, value]) => ({
      label: toLabel(key),
      value,
    }));

  const rows = [...knownRows, ...extraRows];

  if (!rows.length) return null;

  const pairedRows: [{ label: string; value: string }, { label: string; value: string } | null][] = [];

  for (let index = 0; index < rows.length; index += 2) {
    pairedRows.push([rows[index], rows[index + 1] ?? null]);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 bg-slate-800 px-4 py-2">
        <span className="text-base">{group.icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white">
          {group.label}
        </span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {pairedRows.map(([left, right], index) => (
            <tr key={`${left.label}-${index}`} className={index % 2 ? "bg-slate-50" : "bg-white"}>
              <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">
                {left.label}
              </td>
              <td className="w-[28%] border-b border-r border-slate-200 px-4 py-3 font-semibold text-slate-800">
                {left.value}
              </td>
              <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">
                {right?.label ?? ""}
              </td>
              <td className="w-[28%] border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
                {right?.value ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SmartSpecSection({ product }: { product: MongoProduct }) {
  const category = product.category ?? "";
  const specs = product.specifications ?? {};
  const schema = SPEC_SCHEMAS[category] ?? FALLBACK_SCHEMA;

  const groupKeys = Array.from(
    new Set([...Object.keys(schema), ...Object.keys(specs)])
  );

  const renderedGroups = groupKeys
    .map((groupKey) => {
      const groupData = specs[groupKey];

      if (!groupData || Object.keys(groupData).length === 0) return null;

      const group: SpecGroup = schema[groupKey] ?? {
        label: toLabel(groupKey),
        icon: "📋",
        fields: [],
      };

      return <SpecTable key={groupKey} group={group} data={groupData} />;
    })
    .filter(Boolean);

  if (!renderedGroups.length) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No specifications available for this product.
      </p>
    );
  }

  return <div className="mt-6 flex flex-col gap-4">{renderedGroups}</div>;
}

export default function ProductDetails({ product }: { product: MongoProduct }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState("Attributes");

  const imageUrls = (product.images ?? []).map((image) => image.url);
  const videoUrls = product.video?.url ? [product.video.url] : [];
  const media = [...imageUrls, ...videoUrls];

  if (!media.length) {
    media.push("https://placehold.co/600x400?text=No+Image");
  }

  const selectedMedia = media[currentIndex] ?? media[0];

  const isVideo =
    selectedMedia.includes("youtube.com") ||
    selectedMedia.includes("youtu.be") ||
    selectedMedia.includes(".mp4");

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((index) => (index + 1) % media.length),
    onSwipedRight: () =>
      setCurrentIndex((index) => (index - 1 + media.length) % media.length),
    trackMouse: true,
  });

  const bindPinch = usePinch(
    ({ offset: [distance], memo }) => {
      const startScale = memo || scale;
      setScale(Math.min(Math.max(startScale * distance, 1), 3));
      return startScale;
    },
    { pointer: { touch: true } }
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();

    setPosition({
      x: ((event.pageX - left) / width) * 100,
      y: ((event.pageY - top) / height) * 100,
    });
  };

  const goPrevious = (event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentIndex((index) => (index - 1 + media.length) % media.length);
    setScale(1);
  };

  const goNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentIndex((index) => (index + 1) % media.length);
    setScale(1);
  };

  const symbol = currencySymbol(product.currency);

  const displayPrice = product.price
    ? `${symbol} ${product.price.toLocaleString()}`
    : "Price on request";

  const discountedPrice =
    product.price && product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : null;

  const categoryPath = [product.category, product.subcategory, product.subSubcategory]
    .filter(Boolean)
    .join(" › ");

  return (
    <div className="min-h-screen px-4 py-3 text-black md:px-8 mt-5">
      <div className="mx-auto grid max-w-[96%] grid-cols-1 gap-2 lg:grid-cols-12">
        <div className="h-fit lg:sticky lg:top-5 lg:col-span-6">
          <div {...handlers} className="grid grid-cols-1 gap-5 sm:grid-cols-[64px_minmax(0,718px)]">
            <div className="flex flex-row items-center gap-4 sm:flex-col">
              {media.map((item, index) => (
                <button
                  key={item}
                  onClick={() => {
                    setCurrentIndex(index);
                    setScale(1);
                  }}
                  className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 transition ${currentIndex === index
                    ? "border-black"
                    : "border-transparent hover:border-slate-300"
                    }`}
                >
                  {item.includes(".mp4") || item.includes("youtube") ? (
                    <span className="px-1 text-center text-xs font-semibold">▶ Video</span>
                  ) : (
                    <img src={item} alt={`thumb-${index}`} className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>

            <div
              className="group relative flex h-[360px] max-w-[718px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#f3f3f3] sm:h-[501px]"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => {
                setZoom(false);
                setPosition({ x: 50, y: 50 });
              }}
              onMouseMove={handleMouseMove}
              onClick={() => setLightboxOpen(true)}
            >
              <button
                className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-2xl text-slate-400 shadow-sm"
                onClick={goPrevious}
              >
                &lt;
              </button>

              <button
                className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-sm"
                onClick={goNext}
              >
                &gt;
              </button>

              {isVideo ? (
                <ReactPlayer src={selectedMedia} controls width="100%" height="501px" />
              ) : (
                <motion.img
                  src={selectedMedia}
                  alt={product.nameEng}
                  className="h-full w-full object-contain"
                  style={{ transformOrigin: `${position.x}% ${position.y}%` }}
                  animate={{ scale: zoom ? 1.55 : 1 }}
                />
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5 lg:col-span-4">
          {categoryPath && <p className="mb-2 text-xs text-slate-400">{categoryPath}</p>}

          <span className="inline-flex rounded bg-orange-50 px-2 py-1 text-md font-semibold text-orange-600">
            {product.supplierName || "Supplier"}
          </span>

          <h1 className="mt-2 text-xl font-bold leading-7">{product.nameEng}</h1>

          {product.brand && (
            <p className="mt-1 text-sm text-slate-500">
              Brand: <b>{product.brand}</b>
            </p>
          )}

          <p className="mt-4 text-sm text-slate-500">
            MOQ: <b>{product.moq || "—"} {product.sellingUnit || "pieces"}</b>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold">{displayPrice}</p>

            {discountedPrice && (
              <>
                <p className="text-lg font-bold text-green-600">
                  {symbol} {discountedPrice.toLocaleString()}
                </p>
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                  -{product.discount}%
                </span>
              </>
            )}
          </div>

          <StarRating rating={4} />

          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="my-6 border-t border-slate-200" />

          {product.variations && product.variations.length > 0 && (
            <>
              <h2 className="text-xl font-bold">Variations</h2>

              <div className="mt-4 space-y-2">
                {product.variations.map((variation, index) => (
                  <div key={variation._id || index} className="flex flex-wrap gap-2 text-sm">
                    {variation.color && (
                      <span className="rounded bg-slate-100 px-2 py-1">
                        <b>Color:</b> {variation.color}
                      </span>
                    )}
                    {variation.size && (
                      <span className="rounded bg-slate-100 px-2 py-1">
                        <b>Size:</b> {variation.size}
                      </span>
                    )}
                    {variation.stock && (
                      <span className="rounded bg-slate-100 px-2 py-1">
                        <b>Stock:</b> {variation.stock}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {imageUrls.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-14 w-14 overflow-hidden rounded-lg border bg-white p-1 ${currentIndex === index ? "border-2 border-black" : "border-slate-200"
                      }`}
                  >
                    <img src={url} alt={`variation-${index}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="my-6 border-t border-slate-200" />

          <h3 className="text-lg font-bold">Shipping</h3>

          <p className="mt-3 text-sm leading-6">
            {product.shippingNotes || "Shipping details to be negotiated."}
          </p>

          {product.shippingMethod && (
            <p className="mt-1 text-xs text-slate-500">
              Method: <b>{product.shippingMethod}</b>
              {product.incoterms && <> · <b>{product.incoterms}</b></>}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {/* <button className="flex-1 rounded-full bg-[#7149f5] px-6 py-3 text-sm font-bold text-white hover:bg-[#8e6bff]">
              Buy Now
            </button> */}
            {/* <button className="flex-1 rounded-full border border-black bg-white px-6 py-3 text-sm font-bold hover:bg-slate-50">
              Add to Cart
            </button> */}
            <CartButtons
              productId={product._id}
              // variation={selectedVariation}   // optional — from variation state
              quantity={1}
            />
            {/* <button className="flex-1 rounded-full bg-[#7149f5] px-6 py-3 text-sm font-bold text-white hover:bg-[#8e6bff]">
              Chat Now
            </button> */}

            <ChatButton
              targetUid={product.supplierUid || "seller-uid"}
              targetName={product.supplierName || "Seller"}
              targetRole="seller"
            />
          </div>
        </aside>

        <div className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5 lg:col-span-2">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bae5f5] text-[#09b7f6]">
              <span className="text-2xl font-bold">VR</span>
            </div>

            <h3 className="text-lg font-bold">Virtual Trial Room</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Preview this product in a virtual fitting experience.
            </p>

            <Link
              href={`/tryonvertually/juelarytryon/${product._id}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6]"
            >
              Try Now
            </Link>


            {/* {
              if(product.category=="Fashion & Apparel"){
                if(product.subSubCategories == "Sunglasses"){
<Link
              href={`/tryonvertually/juelarytryon/${product._id}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6]"
            >
              Try Now
            </Link>
                }
            
              }else if(product.category == "Jewellery & Accessories"){
              <Link
                href={`/tryonvertually/juelarytryon/${product._id}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6]"
              >
                {product.category}Try Now
              </Link>
            }else if(){

            }
            } */}
          </div>
        </div>
      </div>

      <section className="mx-auto mt-14 max-w-[1360px]">
        <div className="flex gap-8 border-b border-slate-200 text-base">
          {["Attributes", "Reviews", "Supplier", "Description"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-6 transition hover:text-[#e64500] ${activeTab === tab ? "border-b-4 border-black font-bold" : ""
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Attributes" && (
          <>
            <div className="mt-6 flex items-center gap-2">
              <h2 className="text-xl font-bold">Key Attributes</h2>

              {product.category && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {product.category}
                </span>
              )}
            </div>

            <SmartSpecSection product={product} />

            <h2 className="mt-8 text-lg font-bold">Packaging and Delivery</h2>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-white">
                    <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Packaging</td>
                    <td className="w-[28%] border-r border-slate-200 px-4 py-4 font-semibold">
                      {product.packagingDetails || "—"}
                    </td>
                    <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Selling Unit</td>
                    <td className="w-[28%] px-4 py-4 font-semibold">{product.sellingUnit || "—"}</td>
                  </tr>

                  <tr className="bg-slate-50">
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-500">Gross Weight</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 font-semibold">
                      {product.grossWeight || "—"}
                    </td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-500">Carton Size</td>
                    <td className="border-t border-slate-200 px-4 py-4 font-semibold">
                      {product.cartonSize || "—"}
                    </td>
                  </tr>

                  <tr className="bg-white">
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-500">Lead Time</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 font-semibold">
                      {product.leadTime || "—"}
                    </td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-500">Port of Loading</td>
                    <td className="border-t border-slate-200 px-4 py-4 font-semibold">
                      {product.portOfLoading || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "Reviews" && (
          // <div className="mt-9 border border-slate-200 p-6">
          //   <div className="flex flex-wrap items-center gap-4">
          //     <p className="text-4xl font-bold">4.8</p>
          //     <div>
          //       <h2 className="text-xl font-bold">Customer reviews</h2>
          //       <p className="mt-1 text-sm text-slate-600">126 reviews from verified buyers</p>
          //     </div>
          //   </div>
          // </div>

          <ProductReviews productId={product._id} />
        )}

        {activeTab === "Supplier" && (
          <div className="mt-9 grid gap-4 border border-slate-200 p-6 md:grid-cols-3">
            {[
              ["Company", product.supplierName],
              ["Experience", product.supplierYears ? `${product.supplierYears} yrs` : "—"],
              ["Location", product.countryOfOrigin],
              ["Factory", product.factoryLocation],
              ["Certs", product.certifications],
              ["Capacity", product.productionCapacity],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-bold">{value || "—"}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Description" && (
          <div className="mt-9 border border-slate-200 p-6">
            <h2 className="text-xl font-bold">Product description</h2>

            {product.shortDescription && (
              <p className="mt-3 max-w-4xl rounded bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-600">
                {product.shortDescription}
              </p>
            )}

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">
              {product.description || "No description."}
            </p>
          </div>
        )}
      </section>
      {
        product?.subSubcategory &&
        <div className="mx-auto mt-10 max-w-[1360px]">
          <RelatedProducts subSubcategory={product?.subSubcategory} />
        </div>
      }


      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute right-5 top-5 z-50 rounded-full bg-white/10 px-4 py-2 text-xl text-white hover:bg-white/20"
              onClick={() => {
                setLightboxOpen(false);
                setScale(1);
              }}
            >
              ✕
            </button>

            <button
              className="absolute left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white"
              onClick={goPrevious}
            >
              &lt;
            </button>

            <button
              className="absolute right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white"
              onClick={goNext}
            >
              &gt;
            </button>

            <div className="flex max-h-full max-w-full flex-col items-center" {...handlers}>
              {isVideo ? (
                <ReactPlayer src={selectedMedia} controls width="80vw" height="70vh" />
              ) : (
                <motion.div
                  {...bindPinch()}
                  onMouseEnter={() => setZoom(true)}
                  onMouseLeave={() => {
                    setZoom(false);
                    setPosition({ x: 50, y: 50 });
                  }}
                  onMouseMove={handleMouseMove}
                  drag={scale > 1 ? "x" : false}
                  dragConstraints={{ left: -500, right: 500 }}
                >
                  <motion.img
                    src={selectedMedia}
                    alt="Product"
                    className="max-h-[80vh] max-w-full rounded-md object-contain"
                    style={{ transformOrigin: `${position.x}% ${position.y}%` }}
                    animate={{ scale: zoom ? scale : 1 }}
                  />
                </motion.div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {media.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setScale(1);
                  }}
                  className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-2 bg-white ${currentIndex === index ? "border-orange-500" : "border-transparent"
                    }`}
                >
                  {item.includes(".mp4") || item.includes("youtube") ? (
                    <span className="text-xs font-semibold">▶</span>
                  ) : (
                    <img src={item} alt="thumb" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




// 'use client'

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ReactPlayer from "react-player";
// import { useSwipeable } from "react-swipeable";
// import { usePinch } from "@use-gesture/react";
// import Link from "next/link";
// import RelatedProducts from "../relatedProducts/page";

// // ── Type ───────────────────────────────────────────────────────────────────
// interface ProductImage  { url: string; public_id: string; _id: string; }
// interface ProductVideo  { url: string; public_id: string; }
// interface Variation     { color: string; size: string; sku: string; stock: string; _id: string; }

// interface MongoProduct {
//   _id: string;
//   nameEng: string;
//   nameLocal?: string;
//   brand?: string;
//   modelNumber?: string;
//   sku?: string;
//   slug?: string;
//   category?: string;
//   subcategory?: string;
//   price?: number;
//   currency?: string;
//   discount?: number;
//   moq?: string;
//   stock?: number;
//   sampleAvailable?: string;
//   supplierName?: string;
//   countryOfOrigin?: string;
//   supplierYears?: string;
//   certifications?: string;
//   factoryLocation?: string;
//   productionCapacity?: string;
//   incoterms?: string;
//   shippingMethod?: string;
//   leadTime?: string;
//   portOfLoading?: string;
//   shippingNotes?: string;
//   specifications?: Record<string, Record<string, string>>;
//   packagingDetails?: string;
//   sellingUnit?: string;
//   grossWeight?: string;
//   cartonSize?: string;
//   variations?: Variation[];
//   tags?: string[];
//   shortDescription?: string;
//   description?: string;
//   images?: ProductImage[];
//   video?: ProductVideo | null;
// }

// // ── Helpers ────────────────────────────────────────────────────────────────
// function toLabel(key: string) {
//   return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
// }

// const categoryLabels: Record<string, string> = {
//   audio: "Audio", battery: "Battery", build: "Build & Design",
//   connectivity: "Connectivity", business: "Business / OEM",
// };

// const StarRating = ({ rating = 4 }: { rating?: number }) => (
//   <div className="flex items-center gap-2">
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <span key={i} className={`text-xl ${i < rating ? "text-yellow-400" : "text-slate-300"}`}>★</span>
//       ))}
//     </div>
//     <span className="text-sm font-semibold text-slate-700">{rating}</span>
//   </div>
// );

// // ── Component receives product as PROP (already fetched server-side) ────────
// export default function ProductDetails({ product }: { product: MongoProduct }) {

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [scale, setScale]               = useState(1);
//   const [zoom, setZoom]                 = useState(false);
//   const [position, setPosition]         = useState({ x: 50, y: 50 });
//   const [activeTab, setActiveTab]       = useState("Attributes");

//   // Build media array
//   const imageUrls = (product.images || []).map((img) => img.url);
//   const videoUrl  = product.video?.url ? [product.video.url] : [];
//   const media     = [...imageUrls, ...videoUrl];
//   if (media.length === 0) media.push("https://placehold.co/600x400?text=No+Image");

//   const selectedMedia = media[currentIndex] ?? media[0];
//   const isVideo = selectedMedia?.includes("youtube.com") ||
//                   selectedMedia?.includes("youtu.be")    ||
//                   selectedMedia?.includes(".mp4");

//   const handlers = useSwipeable({
//     onSwipedLeft:  () => setCurrentIndex((i) => (i + 1) % media.length),
//     onSwipedRight: () => setCurrentIndex((i) => (i - 1 + media.length) % media.length),
//     trackMouse: true,
//   });

//   const bindPinch = usePinch(
//     ({ offset: [d], memo }) => {
//       if (!memo) memo = scale;
//       setScale(Math.min(Math.max(memo * d, 1), 3));
//       return memo;
//     },
//     { pointer: { touch: true } }
//   );

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     setPosition({ x: ((e.pageX - left) / width) * 100, y: ((e.pageY - top) / height) * 100 });
//   };

//   const goPrevious = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i - 1 + media.length) % media.length);
//   };
//   const goNext = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i + 1) % media.length);
//   };

//   const specCategories = Object.entries(product.specifications || {}) as [string, Record<string, string>][];

//   const currencySymbol  = product.currency?.includes("৳") ? "৳" : product.currency?.includes("$") ? "$" : "";
//   const displayPrice    = product.price ? `${currencySymbol} ${product.price.toLocaleString()}` : "Price on request";
//   const discountedPrice = product.price && product.discount
//     ? Math.round(product.price * (1 - product.discount / 100)) : null;

//   return (
//     <div className="min-h-screen px-4 py-3 text-black md:px-8 mt-5">
//       <div className="mx-auto grid max-w-[96%] grid-cols-1 gap-2 lg:grid-cols-12">

//         {/* ── LEFT: Gallery ── */}
//         <div className="lg:col-span-6 h-fit lg:sticky lg:top-5">
//           <div {...handlers} className="grid grid-cols-1 gap-5 sm:grid-cols-[64px_minmax(0,718px)]">
//             <div className="flex flex-row items-center gap-4 sm:flex-col">
//               {media.map((item, i) => (
//                 <button key={i} onClick={() => { setCurrentIndex(i); setScale(1); }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 transition ${
//                     currentIndex === i ? "border-black" : "border-transparent hover:border-slate-300"}`}>
//                   {item.includes(".mp4") || item.includes("youtube")
//                     ? <span className="text-xs font-semibold text-center px-1">▶ Video</span>
//                     : <img src={item} alt={`thumb-${i}`} className="h-full w-full object-cover" />}
//                 </button>
//               ))}
//             </div>

//             <div
//               className="group relative flex h-[360px] max-w-[718px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#f3f3f3] sm:h-[501px]"
//               onMouseEnter={() => setZoom(true)}
//               onMouseLeave={() => { setZoom(false); setPosition({ x: 50, y: 50 }); }}
//               onMouseMove={handleMouseMove}
//               onClick={() => setLightboxOpen(true)}
//             >
//               <button className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-2xl text-slate-400 shadow-sm" onClick={goPrevious}>&lt;</button>
//               <button className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-sm" onClick={goNext}>&gt;</button>
//               {isVideo
//                 ? <ReactPlayer src={selectedMedia} controls width="100%" height="501px" />
//                 : <motion.img src={selectedMedia} alt={product.nameEng}
//                     className="h-full w-full object-contain"
//                     style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                     animate={{ scale: zoom ? 1.55 : 1 }} />}
//             </div>
//           </div>
//         </div>

//         {/* ── MIDDLE: Inquiry card ── */}
//         <aside className="h-fit lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <span className="inline-flex rounded bg-orange-50 px-2 py-1 text-md font-semibold text-orange-600">
//             {product.supplierName || "Supplier"}
//           </span>
//           <h1 className="mt-2 text-xl font-bold leading-7">{product.nameEng}</h1>
//           {product.brand && <p className="mt-1 text-sm text-slate-500">Brand: <b>{product.brand}</b></p>}
//           <p className="mt-4 text-sm text-slate-500">MOQ: <b>{product.moq || "—"} pieces</b></p>

//           <div className="mt-2 flex items-center gap-3 flex-wrap">
//             <p className="text-2xl font-bold">{displayPrice}</p>
//             {discountedPrice && (
//               <>
//                 <p className="text-lg font-bold text-green-600">{currencySymbol} {discountedPrice.toLocaleString()}</p>
//                 <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">-{product.discount}%</span>
//               </>
//             )}
//           </div>

//           <StarRating rating={4} />

//           {product.tags && product.tags.length > 0 && (
//             <div className="mt-3 flex flex-wrap gap-1">
//               {product.tags.map((tag, i) => (
//                 <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">#{tag}</span>
//               ))}
//             </div>
//           )}

//           <div className="my-6 border-t border-slate-200" />

//           {product.variations && product.variations.length > 0 && (
//             <>
//               <h2 className="text-xl font-bold">Variations</h2>
//               <div className="mt-4 space-y-2">
//                 {product.variations.map((v, i) => (
//                   <div key={i} className="flex gap-2 flex-wrap text-sm">
//                     {v.color && <span className="rounded bg-slate-100 px-2 py-1"><b>Color:</b> {v.color}</span>}
//                     {v.size  && <span className="rounded bg-slate-100 px-2 py-1"><b>Size:</b> {v.size}</span>}
//                     {v.stock && <span className="rounded bg-slate-100 px-2 py-1"><b>Stock:</b> {v.stock}</span>}
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 flex gap-3 flex-wrap">
//                 {imageUrls.map((url, i) => (
//                   <button key={i} onClick={() => setCurrentIndex(i)}
//                     className={`h-14 w-14 overflow-hidden rounded-lg border bg-white p-1 ${currentIndex === i ? "border-2 border-black" : "border-slate-200"}`}>
//                     <img src={url} alt={`var-${i}`} className="h-full w-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}

//           <div className="my-6 border-t border-slate-200" />
//           <h3 className="text-lg font-bold">Shipping</h3>
//           <p className="mt-3 text-sm leading-6">{product.shippingNotes || "Shipping details to be negotiated."}</p>
//           {product.shippingMethod && (
//             <p className="mt-1 text-xs text-slate-500">
//               Method: <b>{product.shippingMethod}</b>
//               {product.incoterms && <> · <b>{product.incoterms}</b></>}
//             </p>
//           )}

//           <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//             <button className="flex-1 rounded-full bg-[#7149f5] px-6 py-3 text-sm font-bold text-white hover:bg-[#8e6bff]">Buy Now</button>
//             <button className="flex-1 rounded-full border border-black bg-white px-6 py-3 text-sm font-bold hover:bg-slate-50">Add to Cart</button>
//             <button className="flex-1 rounded-full bg-[#7149f5] px-6 py-3 text-sm font-bold text-white hover:bg-[#8e6bff]">Chat Now</button>
//           </div>
//         </aside>

//         {/* ── RIGHT: Virtual Trial Room ── */}
//         <div className="h-fit lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <div className="flex flex-col items-center text-center">
//             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bae5f5] text-[#09b7f6]">
//               <span className="text-2xl font-bold">VR</span>
//             </div>
//             <h3 className="text-lg font-bold">Virtual Trial Room</h3>
//             <p className="mt-2 text-sm leading-6 text-slate-600">Preview this product in a virtual fitting experience.</p>
//             <Link href="/virtual-trial-room"
//               className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6]">
//               Try Now
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ── TABS ── */}
//       <section className="mx-auto mt-14 max-w-[1360px]">
//         <div className="flex gap-8 border-b border-slate-200 text-base">
//           {["Attributes", "Reviews", "Supplier", "Description"].map((tab) => (
//             <button key={tab} onClick={() => setActiveTab(tab)}
//               className={`pb-6 transition hover:text-[#e64500] ${activeTab === tab ? "border-b-4 border-black font-bold" : ""}`}>
//               {tab}
//             </button>
//           ))}
//         </div>

//         {activeTab === "Attributes" && (
//           <>
//             <h2 className="mt-9 text-xl font-bold">Key attributes</h2>
//             {specCategories.length > 0 ? (
//               <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
//                 <table className="w-full text-sm">
//                   <tbody>
//                     {specCategories.map(([category, fields]) => {
//                       const entries = Object.entries(fields).filter(([, v]) => v);
//                       if (!entries.length) return null;
//                       return (
//                         <React.Fragment key={category}>
//                           <tr className="bg-slate-800">
//                             <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
//                               {categoryLabels[category] ?? toLabel(category)}
//                             </td>
//                           </tr>
//                           {Array.from({ length: Math.ceil(entries.length / 2) }).map((_, rowIdx) => {
//                             const left = entries[rowIdx * 2], right = entries[rowIdx * 2 + 1];
//                             return (
//                               <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
//                                 <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">{toLabel(left[0])}</td>
//                                 <td className="w-[28%] border-b border-r border-slate-200 px-4 py-3 font-semibold text-slate-800">{left[1]}</td>
//                                 <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">{right ? toLabel(right[0]) : ""}</td>
//                                 <td className="w-[28%] border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">{right ? right[1] : ""}</td>
//                               </tr>
//                             );
//                           })}
//                         </React.Fragment>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             ) : <p className="mt-4 text-sm text-slate-500">No specifications available.</p>}

//             <h2 className="mt-8 text-lg font-bold">Packaging and delivery</h2>
//             <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
//               <table className="w-full text-sm">
//                 <tbody>
//                   <tr className="bg-white">
//                     <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Packaging</td>
//                     <td className="w-[28%] border-r border-slate-200 px-4 py-4 font-semibold">{product.packagingDetails || "—"}</td>
//                     <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Selling Unit</td>
//                     <td className="w-[28%] px-4 py-4 font-semibold">{product.sellingUnit || "—"}</td>
//                   </tr>
//                   <tr className="bg-slate-50">
//                     <td className="w-[22%] border-r border-t border-slate-200 px-4 py-4 text-slate-500">Gross Weight</td>
//                     <td className="w-[28%] border-r border-t border-slate-200 px-4 py-4 font-semibold">{product.grossWeight || "—"}</td>
//                     <td className="w-[22%] border-r border-t border-slate-200 px-4 py-4 text-slate-500">Carton Size</td>
//                     <td className="w-[28%] border-t border-slate-200 px-4 py-4 font-semibold">{product.cartonSize || "—"}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}

//         {activeTab === "Reviews" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <div className="flex flex-wrap items-center gap-4">
//               <p className="text-4xl font-bold">4.8</p>
//               <div>
//                 <h2 className="text-xl font-bold">Customer reviews</h2>
//                 <p className="mt-1 text-sm text-slate-600">126 reviews from verified buyers</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "Supplier" && (
//           <div className="mt-9 grid gap-4 border border-slate-200 p-6 md:grid-cols-3">
//             {[
//               ["Company",    product.supplierName],
//               ["Experience", product.supplierYears ? `${product.supplierYears} yrs` : "—"],
//               ["Location",   product.countryOfOrigin],
//               ["Factory",    product.factoryLocation],
//               ["Certs",      product.certifications],
//               ["Capacity",   product.productionCapacity],
//             ].map(([label, val]) => (
//               <div key={label}>
//                 <p className="text-sm text-slate-500">{label}</p>
//                 <p className="mt-2 font-bold">{val || "—"}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === "Description" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <h2 className="text-xl font-bold">Product description</h2>
//             {product.shortDescription && (
//               <p className="mt-3 max-w-4xl text-sm font-medium leading-6 text-slate-600 bg-slate-50 rounded p-3">
//                 {product.shortDescription}
//               </p>
//             )}
//             <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">{product.description || "No description."}</p>
//           </div>
//         )}
//       </section>

//       <div className="mx-auto mt-10 max-w-[1360px]"><RelatedProducts /></div>

//       {/* ── LIGHTBOX ── */}
//       <AnimatePresence>
//         {lightboxOpen && (
//           <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-3"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <button className="absolute right-5 top-5 z-50 rounded-full bg-white/10 px-4 py-2 text-xl text-white hover:bg-white/20"
//               onClick={() => { setLightboxOpen(false); setScale(1); }}>✕</button>
//             <button className="absolute left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white" onClick={goPrevious}>&lt;</button>
//             <button className="absolute right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white" onClick={goNext}>&gt;</button>
//             <div className="flex max-h-full max-w-full flex-col items-center" {...handlers}>
//               {isVideo
//                 ? <ReactPlayer src={selectedMedia} controls width="80vw" height="70vh" />
//                 : <motion.div {...bindPinch()} onMouseEnter={() => setZoom(true)}
//                     onMouseLeave={() => { setZoom(false); setPosition({ x: 50, y: 50 }); }}
//                     onMouseMove={handleMouseMove} drag={scale > 1 ? "x" : false}
//                     dragConstraints={{ left: -500, right: 500 }}>
//                     <motion.img src={selectedMedia} alt="Product"
//                       className="max-h-[80vh] max-w-full rounded-md object-contain"
//                       style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                       animate={{ scale: zoom ? scale : 1 }} />
//                   </motion.div>}
//             </div>
//             <div className="mt-4 flex flex-wrap justify-center gap-2">
//               {media.map((item, i) => (
//                 <button key={i} onClick={() => { setCurrentIndex(i); setScale(1); }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-2 bg-white ${currentIndex === i ? "border-orange-500" : "border-transparent"}`}>
//                   {item.includes(".mp4") || item.includes("youtube")
//                     ? <span className="text-xs font-semibold">▶</span>
//                     : <img src={item} alt="thumb" className="h-full w-full object-cover" />}
//                 </button>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ReactPlayer from "react-player";
// import { useSwipeable } from "react-swipeable";
// import { usePinch } from "@use-gesture/react";
// import img from "../../assets/glass.png";
// import img1 from "../../assets/p&e2.jpg";
// import img2 from "../../assets/falrex2.png";
// import RelatedProducts from "../relatedProducts/page";
// import Link from "next/link";

// const product = {
//   id: "B2B-SG-V100",
//   name: "Classic Aviator Polarized Sunglasses - UV400 Protection Luxury Men's Eyewear",
//   slug: "classic-aviator-polarized-sunglasses-uv400",
//   price: "৳ 1,250",
//   moq: "5 pieces",
//   supplier: {
//     name: "Shafir Express LTD",
//     yearsActive: "5 yrs",
//     country: "CN",
//     verified: true,
//   },
//   selectedColor: "Gold/Black",
//   images: [img.src, img1.src, img2.src], // Using your existing image imports
//   videos: ["https://www.youtube.com/watch?v=2AoEHeC-uvg"],
//   description:
//     "Experience superior optical clarity with our Classic Aviator Series. Designed for professional drivers and outdoor enthusiasts, these sunglasses feature a 9-layer polarization tech and a lightweight Monel metal frame for all-day comfort and durability.",
//   specifications: {
//     lens: {
//       material: "TAC (Tri-Acetate Cellulose)",
//       technology: "9-Layer Polarization",
//       uvRating: "UV400 (100% UVA/UVB)",
//       vltCategory: "Cat. 3 (High Sun Protection)",
//       coating: "Hydrophobic & Anti-Reflective",
//     },
//     frame: {
//       material: "Corrosion-Resistant Monel Metal",
//       hingeType: "Reinforced Spring Hinge",
//       shape: "Classic Aviator",
//       nosePad: "Soft Medical-Grade Silicone",
//       finish: "Electroplated 24K Gold",
//     },
//     dimensions: {
//       lensWidth: "58 mm",
//       bridgeWidth: "14 mm",
//       templeLength: "135 mm",
//       totalWidth: "142 mm",
//       frameWeight: "22g (Ultra-Light)",
//     },
//     packaging: {
//       caseIncluded: "Hard Leather Protective Case",
//       cleaningCloth: "Microfiber Ultra-Soft",
//       innerBox: "Branded Gift Box",
//       cartonSize: "50x40x30 cm (for 100 units)",
//     },
//     business: {
//       oemOdm: "Available (Custom Frame/Lens)",
//       customLogo: "Supported (MOQ 200+)",
//       leadTime: "10-20 Days",
//       samplePolicy: "Free Sample Available (Pay Shipping)",
//     },
//   },
// };


// // const product = {
// //   id: "B2B-MK47-9921",
// //   name: "MK47 OEM/ODM Low Latency Gaming Earbuds - True Wireless Stereo (TWS)",
// //   slug: "mk47-gaming-earbuds-low-latency-tws",
// //   price: "৳ 700",
// //   moq: "10 pieces",
// //   supplier: {
// //     name: "Shafir Express LTD",
// //     yearsActive: "5 yrs",
// //     country: "CN",
// //     verified: true,
// //   },
// //   selectedColor: "Blue",
// //   images: [img.src, img1.src, img2.src],
// //   videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
// //   description:
// //     "The MK47 Gaming Earbuds are engineered for competitive mobile gaming. Featuring a dedicated JL6983D2 chipset, they provide ultra-low latency audio (under 30ms) to ensure your sound is perfectly synced with your screen action.",
// //   specifications: {
// //     audio: {
// //       chipset: "JL6983D2",
// //       soundProfile: "HiFi Ultra-Bass",
// //       driverSize: "13mm Dynamic Driver",
// //       latency: "< 30 ms (Game Mode)",
// //       frequencyResponse: "20Hz - 20kHz",
// //     },
// //     battery: {
// //       earphoneCapacity: "30 mAh",
// //       chargingBoxCapacity: "300 mAh",
// //       musicCallTime: "3-4 hrs",
// //       standbyTime: "120 hrs",
// //       chargingTime: "1.5 hrs",
// //       interface: "Type-C Fast Charge",
// //     },
// //     build: {
// //       modelNumber: "MK47",
// //       waterproofStandard: "IPX-4 (Sweat & Rain Proof)",
// //       gameAtmosphereLight: "Multicolor RGB LED",
// //       batteryIndicator: "LED Digital Display",
// //       material: "ABS + PC Fireproof Plastic",
// //     },
// //     connectivity: {
// //       bluetoothVersion: "V5.3",
// //       transmissionDistance: "10-15 meters",
// //       protocols: "HFP/A2DP/HSP/AVRCP",
// //     },
// //     business: {
// //       oemOdm: "Available / Welcomed",
// //       customLogo: "Supported (MOQ 500+)",
// //       leadTime: "7-15 Days",
// //     },
// //   },
// // };

// // Helper: convert camelCase to readable label
// function toLabel(key: string) {
//   return key
//     .replace(/([A-Z])/g, " $1")
//     .replace(/^./, (s) => s.toUpperCase());
// }

// // Category label map (optional display names for category headings)
// const categoryLabels: Record<string, string> = {
//   audio: "Audio",
//   battery: "Battery",
//   build: "Build & Design",
//   connectivity: "Connectivity",
//   business: "Business / OEM",
// };

// const StarRating = ({ rating = 4.8, total = 5 }: { rating?: number; total?: number }) => (
//   <div className="flex items-center gap-2">
//     <div className="flex items-center gap-1">
//       {Array.from({ length: total }).map((_, index) => (
//         <span
//           key={index}
//           className={`text-xl ${index < rating ? "text-yellow-400" : "text-slate-300"}`}
//         >
//           ★
//         </span>
//       ))}
//     </div>
//     <span className="text-sm font-semibold text-slate-700">{rating}</span>
//   </div>
// );

// type Params = Promise<{ id: string }>;

// export default function ProductDetails({params}) {
//   console.log(params)
//   const media = [...product.images, ...product.videos];
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [scale, setScale] = useState(1);
//   const [zoom, setZoom] = useState(false);
//   const [position, setPosition] = useState({ x: 50, y: 50 });
//   const [activeTab, setActiveTab] = useState("Attributes");
//   // Track which spec category is expanded (null = all collapsed, or show all)
//   const [openCategory, setOpenCategory] = useState<string | null>(null);

//   const selectedMedia = media[currentIndex];
//   const isVideo =
//     selectedMedia.includes("youtube.com") ||
//     selectedMedia.includes("youtu.be") ||
//     selectedMedia.includes(".mp4");

//   const handlers = useSwipeable({
//     onSwipedLeft: () => setCurrentIndex((i) => (i + 1) % media.length),
//     onSwipedRight: () => setCurrentIndex((i) => (i - 1 + media.length) % media.length),
//     trackMouse: true,
//   });

//   const bindPinch = usePinch(
//     ({ offset: [d], memo }) => {
//       if (!memo) memo = scale;
//       const newScale = Math.min(Math.max(memo * d, 1), 3);
//       setScale(newScale);
//       return memo;
//     },
//     { pointer: { touch: true } }
//   );

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     setPosition({
//       x: ((e.pageX - left) / width) * 100,
//       y: ((e.pageY - top) / height) * 100,
//     });
//   };

//   const goPrevious = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i - 1 + media.length) % media.length);
//   };

//   const goNext = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i + 1) % media.length);
//   };

//   // Build flat category entries for rendering
//   const specCategories = Object.entries(product.specifications) as [
//     string,
//     Record<string, string>
//   ][];

//   return (
//     <div className="min-h-screen px-4 py-3 text-black md:px-8 mt-5">
//       <div className="mx-auto grid max-w-[96%] grid-cols-1 gap-2 lg:grid-cols-12">
//         {/* ── LEFT: Image gallery ── */}
//         <div className="lg:col-span-6 h-fit lg:sticky lg:top-5">
//           <div {...handlers} className="grid grid-cols-1 gap-5 sm:grid-cols-[64px_minmax(0,718px)]">
//             {/* Thumbnails */}
//             <div className="flex flex-row items-center gap-4 sm:flex-col">
//               {media.map((item, i) => (
//                 <button
//                   key={i}
//                   onClick={() => { setCurrentIndex(i); setScale(1); }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 transition ${currentIndex === i ? "border-black" : "border-transparent hover:border-slate-300"
//                     }`}
//                 >
//                   {item.includes(".mp4") || item.includes("youtube") ? (
//                     <span className="text-xs font-semibold">Video</span>
//                   ) : (
//                     <img src={item} alt="thumbnail" className="h-full w-full object-cover" />
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Main viewer */}
//             <div
//               className="group relative flex h-[360px] max-w-[718px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#f3f3f3] sm:h-[501px]"
//               onMouseEnter={() => setZoom(true)}
//               onMouseLeave={() => { setZoom(false); setPosition({ x: 50, y: 50 }); }}
//               onMouseMove={handleMouseMove}
//               onClick={() => setLightboxOpen(true)}
//             >
//               <button className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-2xl text-slate-400 shadow-sm" onClick={goPrevious}>&lt;</button>
//               <button className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-sm" onClick={goNext}>&gt;</button>
//               {isVideo ? (
//                 <ReactPlayer src={selectedMedia} controls width="100%" height="501px" />
//               ) : (
//                 <motion.img
//                   src={selectedMedia}
//                   alt="Product"
//                   className="h-full w-full object-contain"
//                   style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                   animate={{ scale: zoom ? 1.55 : 1 }}
//                 />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ── MIDDLE: Inquiry card ── */}
//         <aside className="h-fit lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <span className="inline-flex rounded bg-orange-50 px-2 py-1 text-md font-semibold text-orange-600">
//             {product.supplier.name}
//           </span>
//           <h1 className="max-w-4xl text-xl font-bold leading-7 md:text-xl">{product.name}</h1>
//           <p className="mt-6 text-sm text-slate-500">Minimum order quantity: {product.moq}</p>
//           <p className="mt-2 text-2xl font-bold">{product.price}</p>
//           <StarRating rating={3} />
//           <div className="my-6 border-t border-slate-200" />

//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold">Variations</h2>
//             <button className="text-sm font-semibold underline">Select now</button>
//           </div>
//           <p className="mt-6 text-sm"><span className="font-bold">color:</span> {product.selectedColor}</p>
//           <div className="mt-5 flex gap-5">
//             {product.images.map((item, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentIndex(i)}
//                 className={`h-14 w-14 overflow-hidden rounded-lg border bg-white p-1 ${currentIndex === i ? "border-2 border-black" : "border-slate-200"
//                   }`}
//               >
//                 <img src={item} alt="variation" className="h-full w-full object-cover" />
//               </button>
//             ))}
//           </div>

//           <h3 className="mt-6 text-lg font-bold">Connectors</h3>
//           <button className="mt-4 rounded-md border border-black px-3 py-1 text-sm">Other</button>

//           <div className="mt-7 flex items-center justify-between">
//             <h3 className="text-lg font-bold">Customization options</h3>
//             <span className="text-3xl leading-none text-slate-500">&gt;</span>
//           </div>
//           <ul className="mt-4 space-y-3 text-sm">
//             <li>Customized logo <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//             <li>Customized packaging <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//             <li>Graphic customization <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//           </ul>

//           <div className="my-6 border-t border-slate-200" />
//           <h3 className="text-lg font-bold">Shipping</h3>
//           <p className="mt-5 text-sm leading-6">
//             Shipping fee and delivery date to be negotiated. Chat with supplier now for more details.
//           </p>

//           <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//             <button className="flex-1 rounded-full bg-[#e64500] px-6 py-3 text-sm font-bold text-white hover:bg-[#d83f00]">Buy Now</button>
//             <button className="flex-1 rounded-full border border-black bg-white px-6 py-3 text-sm font-bold hover:bg-slate-50">Add to Cart</button>
//             <button className="flex-1 rounded-full bg-[#e64500] px-6 py-3 text-sm font-bold text-white hover:bg-[#d83f00]">Chat Now</button>
//           </div>
//         </aside>

//         {/* ── RIGHT: Virtual Trial Room ── */}
//         <div className="h-fit lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <div className="flex flex-col items-center text-center">
//             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bae5f5] text-[#09b7f6]">
//               <span className="text-2xl font-bold">VR</span>
//             </div>
//             <h3 className="text-lg font-bold">Virtual Trial Room</h3>
//             <p className="mt-2 text-sm leading-6 text-slate-600">Preview this product in a virtual fitting experience before ordering.</p>
//             <Link href="/tryonvertually/sunglasstryon" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6]">
//               Try Now
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ── TABS ── */}
//       <section className="mx-auto mt-14 max-w-[1360px]">
//         <div className="flex gap-8 border-b border-slate-200 text-base">
//           {["Attributes", "Reviews", "Supplier", "Description"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`pb-6 transition hover:text-[#e64500] ${activeTab === tab ? "border-b-4 border-black font-bold" : ""
//                 }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* ── ATTRIBUTES TAB: multi-category specs ── */}

//         {activeTab === "Attributes" && (
//           <>
//             <h2 className="mt-9 text-xl font-bold">Key attributes</h2>

//             <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
//               <table className="w-full text-sm">
//                 <tbody>
//                   {specCategories.map(([category, fields]) => {
//                     const label = categoryLabels[category] ?? toLabel(category);
//                     const entries = Object.entries(fields);

//                     return (
//                       <React.Fragment key={category}>
//                         {/* Category heading row */}
//                         <tr className="bg-slate-800">
//                           <td
//                             colSpan={4}
//                             className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
//                           >
//                             {label}
//                           </td>
//                         </tr>

//                         {/* Spec rows — pair every two entries side by side */}
//                         {Array.from({ length: Math.ceil(entries.length / 2) }).map((_, rowIdx) => {
//                           const left = entries[rowIdx * 2];
//                           const right = entries[rowIdx * 2 + 1];
//                           return (
//                             <tr
//                               key={rowIdx}
//                               className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}
//                             >
//                               {/* Left key */}
//                               <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">
//                                 {toLabel(left[0])}
//                               </td>
//                               {/* Left value */}
//                               <td className="w-[28%] border-b border-r border-slate-200 px-4 py-3 font-semibold text-slate-800">
//                                 {left[1]}
//                               </td>
//                               {/* Right key (may be empty) */}
//                               <td className="w-[22%] border-b border-r border-slate-200 px-4 py-3 text-slate-500">
//                                 {right ? toLabel(right[0]) : ""}
//                               </td>
//                               {/* Right value */}
//                               <td className="w-[28%] border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
//                                 {right ? right[1] : ""}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <h2 className="mt-8 text-lg font-bold">Packaging and delivery</h2>
//             <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
//               <table className="w-full text-sm">
//                 <tbody>
//                   <tr className="bg-white">
//                     <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Packaging Details</td>
//                     <td className="w-[28%] border-r border-slate-200 px-4 py-4 font-semibold text-slate-800">
//                       1pc in 1 giftbox, 10 giftboxes in 1 inner carton
//                     </td>
//                     <td className="w-[22%] border-r border-slate-200 px-4 py-4 text-slate-500">Selling Units</td>
//                     <td className="w-[28%] px-4 py-4 font-semibold text-slate-800">Single item</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}


//         {activeTab === "Reviews" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <div className="flex flex-wrap items-center gap-4">
//               <p className="text-4xl font-bold">4.8</p>
//               <div>
//                 <h2 className="text-xl font-bold">Customer reviews</h2>
//                 <p className="mt-1 text-sm text-slate-600">126 reviews from verified buyers</p>
//               </div>
//             </div>
//             <div className="mt-6 space-y-4">
//               <div className="border-t border-slate-200 pt-4">
//                 <p className="font-bold">Great quality for bulk order</p>
//                 <p className="mt-2 text-sm leading-6 text-slate-600">Fast response from supplier, clean packaging, and the sample matched the product photos.</p>
//               </div>
//               <div className="border-t border-slate-200 pt-4">
//                 <p className="font-bold">Good sound and finish</p>
//                 <p className="mt-2 text-sm leading-6 text-slate-600">The product feels solid and the customization options were clearly explained.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "Supplier" && (
//           <div className="mt-9 grid gap-4 border border-slate-200 p-6 md:grid-cols-3">
//             <div>
//               <p className="text-sm text-slate-500">Company</p>
//               <h2 className="mt-2 text-lg font-bold">{product.supplier.name}</h2>
//             </div>
//             <div>
//               <p className="text-sm text-slate-500">Experience</p>
//               <p className="mt-2 font-bold">{product.supplier.yearsActive} on marketplace</p>
//             </div>
//             <div>
//               <p className="text-sm text-slate-500">Location</p>
//               <p className="mt-2 font-bold">{product.supplier.country}</p>
//             </div>
//           </div>
//         )}

//         {activeTab === "Description" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <h2 className="text-xl font-bold">Product description</h2>
//             <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">{product.description}</p>
//           </div>
//         )}
//       </section>

//       <div className="mx-auto mt-10 max-w-[1360px]">
//         <RelatedProducts />
//       </div>

//       {/* ── LIGHTBOX ── */}
//       <AnimatePresence>
//         {lightboxOpen && (
//           <motion.div
//             className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-3"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           >
//             <button className="absolute right-5 top-5 z-50 rounded-full bg-white/10 px-4 py-2 text-xl text-white hover:bg-white/20" onClick={() => { setLightboxOpen(false); setScale(1); }}>✕</button>
//             <button className="absolute left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20" onClick={goPrevious}>&lt;</button>
//             <button className="absolute right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20" onClick={goNext}>&gt;</button>
//             <div className="flex max-h-full max-w-full flex-col items-center" {...handlers}>
//               {isVideo ? (
//                 <ReactPlayer src={selectedMedia} controls width="80vw" height="70vh" />
//               ) : (
//                 <motion.div
//                   {...bindPinch()}
//                   onMouseEnter={() => setZoom(true)}
//                   onMouseLeave={() => { setZoom(false); setPosition({ x: 50, y: 50 }); }}
//                   onMouseMove={handleMouseMove}
//                   drag={scale > 1 ? "x" : false}
//                   dragConstraints={{ left: -500, right: 500 }}
//                 >
//                   <motion.img
//                     src={selectedMedia}
//                     alt="Product"
//                     className="max-h-[80vh] max-w-full rounded-md object-contain"
//                     style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                     animate={{ scale: zoom ? scale : 1 }}
//                   />
//                 </motion.div>
//               )}
//             </div>
//             <div className="mt-4 flex flex-wrap justify-center gap-2">
//               {media.map((item, i) => (
//                 <button key={i} onClick={() => { setCurrentIndex(i); setScale(1); }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-2 bg-white ${currentIndex === i ? "border-orange-500" : "border-transparent"}`}>
//                   {item.includes(".mp4") || item.includes("youtube") ? (
//                     <span className="text-xs font-semibold">Video</span>
//                   ) : (
//                     <img src={item} alt="thumbnail" className="h-full w-full object-cover" />
//                   )}
//                 </button>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


{/* ── ATTRIBUTES TAB: multi-category specs ── */ }

//  {activeTab === "Attributes" && (
//           <>
//             <h2 className="mt-9 text-xl font-bold">Key attributes</h2>

//             <div className="mt-6 space-y-4">
//               {specCategories.map(([category, fields]) => {
//                 const isOpen = openCategory === category;
//                 const label = categoryLabels[category] ?? toLabel(category);
//                 const entries = Object.entries(fields);

//                 return (
//                   <div key={category} className="overflow-hidden rounded-lg border border-slate-200">
//                     {/* Category header / accordion toggle */}
//                     <button
//                       onClick={() => setOpenCategory(isOpen ? null : category)}
//                       className="flex w-full items-center justify-between bg-slate-100 px-4 py-3 text-left"
//                     >
//                       <span className="font-bold text-sm uppercase tracking-wide text-slate-700">
//                         {label}
//                       </span>
//                       <span className="text-slate-500 text-lg leading-none">
//                         {isOpen ? "−" : "+"}
//                       </span>
//                     </button>

//                     {/* Spec rows — shown when category is open */}
//                     {isOpen && (
//                       <div className="grid grid-cols-1 md:grid-cols-4">
//                         {entries.map(([key, value]) => (
//                           <React.Fragment key={key}>
//                             <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm md:border-r">
//                               {toLabel(key)}
//                             </div>
//                             <div className="border-b border-slate-200 px-4 py-3 text-sm font-bold md:border-r">
//                               {value}
//                             </div>
//                           </React.Fragment>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             <h2 className="mt-8 text-lg font-bold">Packaging and delivery</h2>
//             <div className="mt-4 grid grid-cols-1 border border-slate-200 md:grid-cols-4">
//               <div className="bg-slate-50 px-4 py-5 text-sm">Packaging Details</div>
//               <div className="px-4 py-5 text-sm font-bold">1pc in 1 giftbox, 10 giftboxes in 1 inner carton</div>
//               <div className="bg-slate-50 px-4 py-5 text-sm">Selling Units</div>
//               <div className="px-4 py-5 text-sm font-bold">Single item</div>
//             </div>
//           </>
//         )}







// "use client";
// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ReactPlayer from "react-player";
// import { useSwipeable } from "react-swipeable";
// import { usePinch } from "@use-gesture/react";
// import img from "../../assets/p&e1.jpg";
// import img1 from "../../assets/p&e2.jpg";
// import img2 from "../../assets/falrex2.png";
// import RelatedProducts from "../relatedProducts/page"

// const product = {
//   name: "Smart Watch Pro X1",
//   price: "$249",
//   description:
//     "Premium smart watch with AMOLED display, fitness tracking, and 7-day battery life. Ikigai (pronounced ee-key-guy) is a Japanese concept that combines 2 words: “iki” which means life and “gai” which means “purpose”. It is similar to the French concept “Raison d’être” or reason for being and basically refers to having a reason to get up in the morning… This can be achieved by finding and living your true purpose.Ikigai should not be confused with the concept of blue zones. Blue zones are regions in the world where people seem to live longer than average, and the Okinawa Prefecture in Japan is one of those regions. Obviously having a long and happy life depends on many factors, such as eating well, exercising, getting enough sleep and having positive people around you… Sadly, finding your ikigai will not magically help you live longer, however, the Japanese have a proverb which perfectly explains the importance of finding your purpose or ikigai:",
//   images: [img.src, img1.src, img2.src],
//   videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
//   specifications: {
//     Display: "1.9” AMOLED, 450x450",
//     Battery: "7 days typical use",
//     Connectivity: "Bluetooth 5.2, WiFi",
//     Waterproof: "5ATM",
//     Weight: "42g",
//   },
// };

// export default function ProductDetails() {
//   const media = [...product.images, ...product.videos];
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [scale, setScale] = useState(1);
//   const [zoom, setZoom] = useState(false);
//   const [position, setPosition] = useState({ x: 50, y: 50 });

//   const selectedMedia = media[currentIndex];
//   const isVideo =
//     selectedMedia.includes("youtube.com") ||
//     selectedMedia.includes("youtu.be") ||
//     selectedMedia.includes(".mp4");

//   // Swipe for gallery
//   const handlers = useSwipeable({
//     onSwipedLeft: () => setCurrentIndex((i) => (i + 1) % media.length),
//     onSwipedRight: () => setCurrentIndex((i) => (i - 1 + media.length) % media.length),
//     trackMouse: true,
//   });

//   // Pinch zoom in modal
//   const bindPinch = usePinch(
//     ({ offset: [d], memo }) => {
//       if (!memo) memo = scale;
//       const newScale = Math.min(Math.max(memo * d, 1), 3);
//       setScale(newScale);
//       return memo;
//     },
//     { pointer: { touch: true } }
//   );

//   // Hover zoom
//   const handleMouseMove = (e) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     const x = ((e.pageX - left) / width) * 100;
//     const y = ((e.pageY - top) / height) * 100;
//     setPosition({ x, y });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Main Image + Gallery */}
//         <div {...handlers} className="flex flex-col relative">
//           <div
//             className="rounded-2xl overflow-hidden shadow-lg bg-white relative cursor-pointer"
//             onMouseEnter={() => setZoom(true)}
//             onMouseLeave={() => {
//               setZoom(false);
//               setPosition({ x: 50, y: 50 });
//             }}
//             onMouseMove={handleMouseMove}
//             onClick={() => setLightboxOpen(true)}
//           >
//             {isVideo ? (
//               <ReactPlayer
//                 src={selectedMedia}
//                 controls
//                 width="100%"
//                 height="400px"
//                 className="rounded-2xl"
//               />
//             ) : (
//               <div className="relative w-full h-[400px] overflow-hidden">
//                 <motion.img
//                   src={selectedMedia}
//                   alt="Product"
//                   className="w-full h-full transition-transform duration-300"
//                   style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                   animate={{ scale: zoom ? 1.8 : 1 }}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Thumbnails */}
//           <div className="flex flex-wrap justify-start mt-4 gap-3">
//             {media.map((item, i) => (
//               <div
//                 key={i}
//                 onClick={() => {
//                   setCurrentIndex(i);
//                   setScale(1);
//                 }}
//                 className={`w-20 h-20 flex items-center justify-center rounded-xl cursor-pointer border-2 overflow-hidden ${
//                   currentIndex === i ? "border-blue-500" : "border-transparent"
//                 }`}
//               >
//                 {item.includes(".mp4") || item.includes("youtube") ? (
//                   <div className="w-full h-full flex items-center justify-center bg-gray-200">▶️</div>
//                 ) : (
//                   <img src={item} alt="thumbnail" className="w-full h-full object-cover" />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="flex flex-col justify-center space-y-6">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
//             <p className="text-xl md:text-2xl text-blue-600 mt-2">{product.price}</p>
//           </div>

//           <p className="text-gray-600">{product.description}</p>

//           {/* Specifications */}
//           <div className="bg-white rounded-xl shadow p-4">
//             <h2 className="text-lg font-semibold mb-2">Specifications</h2>
//             <ul className="text-sm text-gray-700 space-y-1">
//               {Object.entries(product.specifications).map(([key, val]) => (
//                 <li key={key} className="flex justify-between">
//                   <span className="font-medium">{key}</span>
//                   <span>{val}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
//               Add to Cart
//             </button>
//             <button className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition">
//               Buy Now
//             </button>
//           </div>
//         </div>



//       </div>

//       <div className="max-w-10/12 mx-auto">
//         <RelatedProducts></RelatedProducts>
//       </div>

//       {/* Fullscreen Modal Gallery */}
//       <AnimatePresence>
//         {lightboxOpen && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             {/* Close */}
//             <button
//               className="absolute top-5 right-5 text-white bg-black/50 p-2 rounded-full text-xl z-50"
//               onClick={() => {
//                 setLightboxOpen(false);
//                 setScale(1);
//               }}
//             >
//               ✕
//             </button>

//             {/* Prev / Next arrows */}
//             <button
//               className="absolute left-5 text-white text-3xl bg-black/40 p-2 rounded-full z-40"
//               onClick={() => setCurrentIndex((i) => (i - 1 + media.length) % media.length)}
//             >
//               ‹
//             </button>
//             <button
//               className="absolute right-5 text-white text-3xl bg-black/40 p-2 rounded-full z-40"
//               onClick={() => setCurrentIndex((i) => (i + 1) % media.length)}
//             >
//               ›
//             </button>

//             {/* Main content */}
//             <div className="max-w-full max-h-full flex flex-col items-center" {...handlers}>
//               {isVideo ? (
//                 <ReactPlayer
//                   src={selectedMedia}
//                   controls
//                   width="80vw"
//                   height="70vh"
//                   className="rounded-xl"
//                 />
//               ) : (
//                 <motion.div
//                   {...bindPinch()}
//                   onMouseEnter={() => setZoom(true)}
//                   onMouseLeave={() => {
//                     setZoom(false);
//                     setPosition({ x: 50, y: 50 });
//                   }}
//                   onMouseMove={handleMouseMove}
//                   drag={scale > 1 ? "x" : false}
//                   dragConstraints={{ left: -500, right: 500 }}
//                   className="relative"
//                 >
//                   <motion.img
//                     src={selectedMedia}
//                     alt="Product"
//                     className="max-w-full max-h-[80vh] object-contain rounded-xl"
//                     style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                     animate={{ scale: zoom ? scale : 1 }}
//                   />
//                 </motion.div>
//               )}
//             </div>

//             {/* Thumbnails inside modal */}
//             <div className="flex flex-wrap justify-center mt-4 gap-2">
//               {media.map((item, i) => (
//                 <div
//                   key={i}
//                   onClick={() => {
//                     setCurrentIndex(i);
//                     setScale(1);
//                   }}
//                   className={`w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer border-2 overflow-hidden ${
//                     currentIndex === i ? "border-blue-500" : "border-transparent"
//                   }`}
//                 >
//                   {item.includes(".mp4") || item.includes("youtube") ? (
//                     <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">
//                       ▶️
//                     </div>
//                   ) : (
//                     <img src={item} alt="thumbnail" className="w-full h-full object-cover" />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// main jsx
// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ReactPlayer from "react-player";
// import { useSwipeable } from "react-swipeable";
// import { usePinch } from "@use-gesture/react";
// import img from "../../assets/glass.png";
// import img1 from "../../assets/p&e2.jpg";
// import img2 from "../../assets/falrex2.png";
// import RelatedProducts from "../relatedProducts/page";
// import Link from "next/link";

// const product = {
//   name: "Free Sample MK47 OEM ODM Earbuds Audifonos Gaming Earbuds Tws Earbuds Wireless Gaming Earphone",
//   price: "৳ 700",
//   moq: "10 pieces",
//   supplierName: "Shafir express LTD",
//   supplierYears: "5 yrs",
//   country: "CN",
//   selectedColor: "Blue",
//   description:
//     "Premium smart watch with AMOLED display, fitness tracking, and 7-day battery life. Ikigai is a Japanese concept that combines life and purpose. It is similar to the French concept Raison d'etre and refers to having a reason to get up in the morning.",
//   images: [img.src, img1.src, img2.src],
//   videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
//   specifications: {
//     "wireless delay time": "less than 30 ms",
//     "Waterproof Standard": "IPX-4",
//     "Game atmosphere light": "Multicolor",
//     "battery indicator": "LED",
//     "model number": "MK47",
//     "Product name": "MK47 Game earbuds",
//     Chipset: "JL6983D2",
//     "Music/Call time": "3-4 hrs",
//     "Earphone battery": "30 mAh",
//     Model: "MK47",
//     "Charging box": "300mAh",
//     "Charging time": "1-2 hrs",
//     Feature: "HiFi sound quality",
//     "Standby time": "120hrs",
//     "OEM ODM": "Welcomed",
//   },
// };

// export default function ProductDetails() {
//   const media = [...product.images, ...product.videos];
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [scale, setScale] = useState(1);
//   const [zoom, setZoom] = useState(false);
//   const [position, setPosition] = useState({ x: 50, y: 50 });
//   const [activeTab, setActiveTab] = useState("Attributes");

//   const selectedMedia = media[currentIndex];
//   const isVideo =
//     selectedMedia.includes("youtube.com") ||
//     selectedMedia.includes("youtu.be") ||
//     selectedMedia.includes(".mp4");

//   const handlers = useSwipeable({
//     onSwipedLeft: () => setCurrentIndex((i) => (i + 1) % media.length),
//     onSwipedRight: () => setCurrentIndex((i) => (i - 1 + media.length) % media.length),
//     trackMouse: true,
//   });

//   const bindPinch = usePinch(
//     ({ offset: [d], memo }) => {
//       if (!memo) memo = scale;
//       const newScale = Math.min(Math.max(memo * d, 1), 3);
//       setScale(newScale);
//       return memo;
//     },
//     { pointer: { touch: true } }
//   );

//   const handleMouseMove = (e) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     const x = ((e.pageX - left) / width) * 100;
//     const y = ((e.pageY - top) / height) * 100;
//     setPosition({ x, y });
//   };

//   const goPrevious = (e) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i - 1 + media.length) % media.length);
//   };

//   const goNext = (e) => {
//     e.stopPropagation();
//     setCurrentIndex((i) => (i + 1) % media.length);
//   };

//   const specEntries = Object.entries(product.specifications);

//   // rating

//   const StarRating = ({ rating = 4.8, total = 5 }) => {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex items-center gap-1">
//         {Array.from({ length: total }).map((_, index) => {
//           const filled = index + 1 <= Math.floor(rating);
//           const half = index < rating && index + 1 > rating;

//           return (
//             <span
//               key={index}
//               className={`text-xl ${
//                 filled || half ? "text-yellow-400" : "text-slate-300"
//               }`}
//             >
//               {half ? "★" : "★"}
//             </span>
//           );
//         })}
//       </div>

//       <span className="text-sm font-semibold text-slate-700">{rating}</span>
//     </div>
//   );
// };


//   return (
//     <div className="min-h-screen px-4 py-3 text-black md:px-8 mt-5">
//       <div className="mx-auto grid max-w-[96%] grid-cols-1 gap-2 lg:grid-cols-12">
//         <div className="lg:col-span-6 h-fit lg:sticky lg:top-5">
//           {/* <div className="mb-4 text-xs leading-5 text-slate-700">
//             <span>Consumer Electronics</span>
//             <span className="mx-2 text-slate-400">&gt;</span>
//             <span>Earphone & Headphone & Accessories</span>
//             <span className="mx-2 text-slate-400">&gt;</span>
//             <span>TWS Earphones & Headphones</span>
//             <p>Non-Noise Cancelling TWS Earphones & Headphones</p>
//           </div> */}


//           {/* <div className="mt-3 flex max-w-4xl items-center gap-3 rounded bg-slate-50 px-3 py-3 text-sm">
//             <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-[10px] text-slate-400">
//               logo
//             </div>
//             <button className="underline">{product.supplierName}</button>
//             <span className="font-semibold">.</span>
//             <span>{product.supplierYears}</span>
//             <span className="font-semibold">.</span>
//             <span className="inline-flex h-3 w-5 items-center justify-center bg-red-600 text-[8px] text-yellow-300">CN</span>
//             <span>{product.country}</span>
//           </div> */}

//           {/* Main Image + Gallery */}
//           <div {...handlers} className=" grid grid-cols-1 gap-5 sm:grid-cols-[64px_minmax(0,718px)]">
//             {/* Thumbnails */}
//             <div className="flex flex-row items-center gap-4 sm:flex-col">
//               {media.map((item, i) => (
//                 <button
//                   key={i}
//                   onClick={() => {
//                     setCurrentIndex(i);
//                     setScale(1);
//                   }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 transition ${currentIndex === i ? "border-black" : "border-transparent hover:border-slate-300"
//                     }`}
//                 >
//                   {item.includes(".mp4") || item.includes("youtube") ? (
//                     <span className="text-xs font-semibold">Video</span>
//                   ) : (
//                     <img src={item} alt="thumbnail" className="h-full w-full object-cover" />
//                   )}
//                 </button>
//               ))}
//               <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
//                 v
//               </button>
//             </div>

//             <div
//               className="group relative flex h-[360px] max-w-[718px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#f3f3f3] sm:h-[501px]"
//               onMouseEnter={() => setZoom(true)}
//               onMouseLeave={() => {
//                 setZoom(false);
//                 setPosition({ x: 50, y: 50 });
//               }}
//               onMouseMove={handleMouseMove}
//               onClick={() => setLightboxOpen(true)}
//             >
//               <button
//                 className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-2xl text-slate-400 shadow-sm"
//                 onClick={goPrevious}
//               >
//                 &lt;
//               </button>
//               <button
//                 className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-sm"
//                 onClick={goNext}
//               >
//                 &gt;
//               </button>
//               <button className="absolute right-4 top-7 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold shadow">
//                 Save
//               </button>
//               <button className="absolute right-4 top-20 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold shadow">
//                 View
//               </button>

//               {isVideo ? (
//                 <ReactPlayer src={selectedMedia} controls width="100%" height="501px" />
//               ) : (
//                 <motion.img
//                   src={selectedMedia}
//                   alt="Product"
//                   className="h-full w-full object-contain transition-transform duration-300"
//                   style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                   animate={{ scale: zoom ? 1.55 : 1 }}
//                 />
//               )}
//             </div>
//           </div>

//           <div className="mt-4 flex max-w-[718px] justify-center sm:ml-[84px]">
//             <div className="flex rounded-lg bg-slate-50 p-1 text-sm">
//               <button className="rounded-md bg-white px-4 py-2 font-semibold shadow-sm">Photos</button>
//               <button className="rounded-md px-4 py-2">Video</button>
//             </div>
//           </div>
//         </div>

//         {/* Inquiry Card */}
//         <aside className="h-fit lg:col-span-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <span className="inline-flex rounded bg-orange-50 px-2 py-1 text-md font-semibold text-orange-600">
//             {product.supplierName}
//           </span>
//           <h1 className="max-w-4xl text-xl font-bold leading-7 md:text-xl">{product.name}</h1>
//           <p className="mt-6 text-sm text-slate-500">Minimum order quantity: {product.moq}</p>
//           <p className="mt-2 text-2xl font-bold">{product.price}</p>

//           <StarRating rating={3} />

//           <div className="my-6 border-t border-slate-200" />

//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold">Variations</h2>
//             <button className="text-sm font-semibold underline">Select now</button>
//           </div>

//           <p className="mt-6 text-sm">
//             <span className="font-bold">color:</span> {product.selectedColor}
//           </p>
//           <div className="mt-5 flex gap-5">
//             {product.images.map((item, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentIndex(i)}
//                 className={`h-14 w-14 overflow-hidden rounded-lg border bg-white p-1 ${currentIndex === i ? "border-2 border-black" : "border-slate-200"
//                   }`}
//               >
//                 <img src={item} alt="variation" className="h-full w-full object-cover" />
//               </button>
//             ))}
//           </div>

//           <h3 className="mt-6 text-lg font-bold">Connectors</h3>
//           <button className="mt-4 rounded-md border border-black px-3 py-1 text-sm">Other</button>

//           <div className="mt-7 flex items-center justify-between">
//             <h3 className="text-lg font-bold">Customization options</h3>
//             <span className="text-3xl leading-none text-slate-500">&gt;</span>
//           </div>
//           <ul className="mt-4 space-y-3 text-sm">
//             <li>Customized logo <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//             <li>Customized packaging <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//             <li>Graphic customization <span className="text-slate-500">(Min. order: 1,000 pieces)</span></li>
//           </ul>

//           <div className="my-6 border-t border-slate-200" />

//           <h3 className="text-lg font-bold">Shipping</h3>
//           <p className="mt-5 text-sm leading-6">
//             Shipping fee and delivery date to be negotiated. Chat with supplier now for more details.
//           </p>

//           <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//             <button className="flex-1 buttonbg rounded-full bg-[#e64500] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d83f00]">
//               Buy Now
//             </button>
//             <button className="flex-1 rounded-full border border-black bg-white px-6 py-3 text-sm font-bold transition hover:bg-slate-50">
//               Add to Cart
//             </button>
//             <button className="flex-1 buttonbg rounded-full bg-[#e64500] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d83f00]">
//               Chat Now
//             </button>
//           </div>
//         </aside>

//         <div className="h-fit lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
//           <div className="flex flex-col items-center text-center">
//             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bae5f5] text-[#09b7f6]">
//               <span className="text-2xl font-bold">VR</span>
//             </div>

//             <h3 className="text-lg font-bold">Virtual Trial Room</h3>
//             <p className="mt-2 text-sm leading-6 text-slate-600">
//               Preview this product in a virtual fitting experience before ordering.
//             </p>

//             <Link
//               href="/virtual-trial-room"
//               className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a5e0f6]"
//             >
//               Try Now
//             </Link>
//           </div>
//         </div>


//       </div>

//       <section className="mx-auto mt-14 max-w-[1360px]">
//         <div className="flex gap-8 border-b border-slate-200 text-base">
//           {["Attributes", "Reviews", "Supplier", "Description"].map((tab) => (
//             <button
//               key={tab}
//               type="button"
//               onClick={() => setActiveTab(tab)}
//               className={`pb-6 transition hover:text-[#e64500] ${activeTab === tab ? "border-b-4 border-black font-bold" : ""
//                 }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {activeTab === "Attributes" && (
//           <>
//             <h2 className="mt-9 text-xl font-bold">Key attributes</h2>
//             <div className="mt-6 overflow-hidden border border-slate-200">
//               <div className="grid grid-cols-1 md:grid-cols-4">
//                 {specEntries.map(([key, value]) => (
//                   <React.Fragment key={key}>
//                     <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 text-sm md:border-r">
//                       {key}
//                     </div>
//                     <div className="border-b border-slate-200 px-4 py-4 text-sm font-bold md:border-r">
//                       {value}
//                     </div>
//                   </React.Fragment>
//                 ))}
//               </div>
//             </div>

//             <h2 className="mt-6 text-lg font-bold">Packaging and delivery</h2>
//             <div className="mt-4 grid grid-cols-1 border border-slate-200 md:grid-cols-4">
//               <div className="bg-slate-50 px-4 py-5 text-sm">Packaging Details</div>
//               <div className="px-4 py-5 text-sm font-bold">1pc in 1 giftbox, 10 giftboxes in 1 inner carton</div>
//               <div className="bg-slate-50 px-4 py-5 text-sm">Selling Units</div>
//               <div className="px-4 py-5 text-sm font-bold">Single item</div>
//             </div>
//           </>
//         )}

//         {activeTab === "Reviews" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <div className="flex flex-wrap items-center gap-4">
//               <p className="text-4xl font-bold">4.8</p>
//               <div>
//                 <h2 className="text-xl font-bold">Customer reviews</h2>
//                 <p className="mt-1 text-sm text-slate-600">126 reviews from verified buyers</p>
//               </div>
//             </div>
//             <div className="mt-6 space-y-4">
//               <div className="border-t border-slate-200 pt-4">
//                 <p className="font-bold">Great quality for bulk order</p>
//                 <p className="mt-2 text-sm leading-6 text-slate-600">
//                   Fast response from supplier, clean packaging, and the sample matched the product photos.
//                 </p>
//               </div>
//               <div className="border-t border-slate-200 pt-4">
//                 <p className="font-bold">Good sound and finish</p>
//                 <p className="mt-2 text-sm leading-6 text-slate-600">
//                   The product feels solid and the customization options were clearly explained.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "Supplier" && (
//           <div className="mt-9 grid gap-4 border border-slate-200 p-6 md:grid-cols-3">
//             <div>
//               <p className="text-sm text-slate-500">Company</p>
//               <h2 className="mt-2 text-lg font-bold">{product.supplierName}</h2>
//             </div>
//             <div>
//               <p className="text-sm text-slate-500">Experience</p>
//               <p className="mt-2 font-bold">{product.supplierYears} on marketplace</p>
//             </div>
//             <div>
//               <p className="text-sm text-slate-500">Location</p>
//               <p className="mt-2 font-bold">{product.country}</p>
//             </div>
//           </div>
//         )}

//         {activeTab === "Description" && (
//           <div className="mt-9 border border-slate-200 p-6">
//             <h2 className="text-xl font-bold">Product description</h2>
//             <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">{product.description}</p>
//           </div>
//         )}
//       </section>

//       <div className="mx-auto mt-10 max-w-[1360px]">
//         <RelatedProducts></RelatedProducts>
//       </div>

//       {/* Fullscreen Modal Gallery */}
//       <AnimatePresence>
//         {lightboxOpen && (
//           <motion.div
//             className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-3"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <button
//               className="absolute right-5 top-5 z-50 rounded-full bg-white/10 px-4 py-2 text-xl text-white hover:bg-white/20"
//               onClick={() => {
//                 setLightboxOpen(false);
//                 setScale(1);
//               }}
//             >
//               x
//             </button>

//             <button
//               className="absolute left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20"
//               onClick={goPrevious}
//             >
//               &lt;
//             </button>
//             <button
//               className="absolute right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20"
//               onClick={goNext}
//             >
//               &gt;
//             </button>

//             <div className="flex max-h-full max-w-full flex-col items-center" {...handlers}>
//               {isVideo ? (
//                 <ReactPlayer src={selectedMedia} controls width="80vw" height="70vh" />
//               ) : (
//                 <motion.div
//                   {...bindPinch()}
//                   onMouseEnter={() => setZoom(true)}
//                   onMouseLeave={() => {
//                     setZoom(false);
//                     setPosition({ x: 50, y: 50 });
//                   }}
//                   onMouseMove={handleMouseMove}
//                   drag={scale > 1 ? "x" : false}
//                   dragConstraints={{ left: -500, right: 500 }}
//                   className="relative"
//                 >
//                   <motion.img
//                     src={selectedMedia}
//                     alt="Product"
//                     className="max-h-[80vh] max-w-full rounded-md object-contain"
//                     style={{ transformOrigin: `${position.x}% ${position.y}%` }}
//                     animate={{ scale: zoom ? scale : 1 }}
//                   />
//                 </motion.div>
//               )}
//             </div>

//             <div className="mt-4 flex flex-wrap justify-center gap-2">
//               {media.map((item, i) => (
//                 <button
//                   key={i}
//                   onClick={() => {
//                     setCurrentIndex(i);
//                     setScale(1);
//                   }}
//                   className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-2 bg-white ${currentIndex === i ? "border-orange-500" : "border-transparent"
//                     }`}
//                 >
//                   {item.includes(".mp4") || item.includes("youtube") ? (
//                     <span className="text-xs font-semibold">Video</span>
//                   ) : (
//                     <img src={item} alt="thumbnail" className="h-full w-full object-cover" />
//                   )}
//                 </button>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

