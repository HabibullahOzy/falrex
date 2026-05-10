"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import imgSunglass1 from "../../assets/glass.png";
import imgSunglass2 from "../../assets/glass.png";
import imgNecklace1 from "../../assets/goldhar.png";
import imgNecklace2 from "../../assets/goldhar.png";
import imgCap1 from "../../assets/cap.png";
import imgCap2 from "../../assets/capb0.png";
import imgNoseRing1 from "../../assets/nosring.png";
import imgNoseRing2 from "../../assets/learring.png";
import imgEarring1 from "../../assets/learring.png";
import imgEarring2 from "../../assets/learring.png";
import imgCrownShirt1 from "../../assets/crown.png";
import imgCrownShirt2 from "../../assets/crown.png";

/* ─── Dataset ────────────────────────────────────────────────── */
const accessoriesProducts = [
  {
    id: "B2B-SG01-001",
    name: "Polarized UV400 Aviator Sunglasses",
    slug: "polarized-uv400-aviator-sunglasses-oem-odm",
    price: 850,
    offerPrice: 650,
    moq: "20 pieces",
    supplier: { name: "GlareShield Optics Co.", yearsActive: "6 yrs", country: "CN", verified: true },
    selectedColor: "Gold",
    images: [imgSunglass1, imgSunglass2],
    description:
      "Premium aviator sunglasses with polarized UV400 lenses, lightweight metal alloy frame, and anti-reflective coating — ideal for retail, brand reselling, or custom logo B2B orders.",
    specifications: {
      optics: { lensType: "Polarized", uvProtection: "UV400", coating: "Anti-Reflective", lensThickness: "1.1 mm" },
      build: { frameMaterial: "Zinc Alloy", weight: "22g", templeLength: "140 mm", nosepad: "Adjustable Silicone" },
      style: { shape: "Aviator", gender: "Unisex", availableColors: "Gold, Silver, Black, Rose Gold" },
      business: { oemOdm: "Available", customLogo: "MOQ 200+", leadTime: "7-14 Days" },
    },
  },
  {
    id: "B2B-NK02-001",
    name: "18K Gold-Plated Layered Chain Necklace",
    slug: "18k-gold-plated-layered-chain-necklace-wholesale",
    price: 120000,
    offerPrice: 95000,
    moq: "15 pieces",
    supplier: { name: "AuraGold Jewelry Ltd.", yearsActive: "8 yrs", country: "CN", verified: true },
    selectedColor: "Gold",
    images: [imgNecklace1, imgNecklace2],
    description:
      "Elegant 18K gold-plated layered chain necklace with anti-tarnish coating and stainless steel base, designed for boutique resale, gifting brands, and fashion wholesale.",
    specifications: {
      material: { base: "316L Stainless Steel", plating: "18K Gold", coating: "Anti-Tarnish Epoxy", nickelFree: "Yes" },
      design: { style: "Layered Chain", chainLength: "40 cm + 5 cm extender", pendantSize: "N/A", clasp: "Lobster Claw" },
      packaging: { default: "Velvet Pouch", branded: "Custom Box Available", giftReady: "Yes" },
      business: { oemOdm: "Available", customLogo: "MOQ 100+", leadTime: "10-18 Days" },
    },
  },
  {
    id: "B2B-CP03-001",
    name: "Structured 6-Panel Snapback Cap",
    slug: "structured-6-panel-snapback-cap-oem-embroidery",
    price: 600,
    offerPrice: 450,
    moq: "30 pieces",
    supplier: { name: "TopThread Headwear Co.", yearsActive: "4 yrs", country: "BD", verified: true },
    selectedColor: "Black",
    images: [imgCap1, imgCap2],
    description:
      "High-quality structured snapback cap with breathable cotton-polyester blend, flat brim, and front embroidery panel — perfect for brand merchandise, streetwear labels, and team uniforms.",
    specifications: {
      material: { fabric: "60% Cotton / 40% Polyester", sweatband: "Terry Cloth", brim: "Flat, 7 cm" },
      fit: { closure: "Snapback Plastic Adjuster", panelCount: "6", crownHeight: "High Structured", sizeRange: "54-60 cm" },
      customization: { embroidery: "Front + Side Panels", printMethod: "3D Puff / Flat Embroidery", patchOption: "Available" },
      business: { oemOdm: "Available", customLogo: "MOQ 30+", leadTime: "14-21 Days" },
    },
  },
  {
    id: "B2B-NR04-001",
    name: "Sterling Silver CZ Nose Ring Stud",
    slug: "sterling-silver-cz-nose-ring-stud-wholesale",
    price: 320,
    offerPrice: 220,
    moq: "50 pieces",
    supplier: { name: "PureStone Piercing Co.", yearsActive: "3 yrs", country: "IN", verified: true },
    selectedColor: "Silver",
    images: [imgNoseRing1, imgNoseRing2],
    description:
      "Hypoallergenic 925 sterling silver nose ring stud set with AAA cubic zirconia, available in L-shaped and bone-pin styles — ideal for piercing studios and fashion jewelry retailers.",
    specifications: {
      material: { base: "925 Sterling Silver", stone: "AAA Cubic Zirconia", finish: "Rhodium Plated", hypoallergenic: "Yes" },
      design: { style: "L-Shape / Bone Pin", stoneDiameter: "2 mm", gaugeSizes: "20G, 22G", noseOpeningFit: "Universal" },
      safety: { nickelFree: "Yes", leadFree: "Yes", sterilized: "Individually Sealed" },
      business: { oemOdm: "Available", customLogo: "MOQ 500+", leadTime: "5-10 Days" },
    },
  },
  {
    id: "B2B-ER05-001",
    name: "18K Gold-Plated Geometric Drop Earrings",
    slug: "18k-gold-plated-geometric-drop-earrings-wholesale",
    price: 750,
    offerPrice: 550,
    moq: "20 pieces",
    supplier: { name: "LumiGold Accessories Ltd.", yearsActive: "5 yrs", country: "CN", verified: true },
    selectedColor: "Rose Gold",
    images: [imgEarring1, imgEarring2],
    description:
      "Trendy geometric drop earrings with 18K rose gold plating, stainless steel base, and push-back closure — suitable for boutique fashion retailers, influencer merchandise, and gifting brands.",
    specifications: {
      material: { base: "Stainless Steel", plating: "18K Rose Gold", coating: "Anti-Tarnish", nickelFree: "Yes" },
      design: { style: "Geometric Drop", length: "4.5 cm", earringType: "Dangle", closure: "Push Back / Butterfly" },
      packaging: { default: "Organza Bag", brandedBox: "Available", pairReady: "Yes" },
      business: { oemOdm: "Available", customLogo: "MOQ 200+", leadTime: "7-15 Days" },
    },
  },
  {
    id: "B2B-CS06-001",
    name: "Oversized Crown Print Graphic T-Shirt",
    slug: "oversized-crown-print-graphic-tshirt-streetwear",
    price: 950,
    offerPrice: 720,
    moq: "25 pieces",
    supplier: { name: "UrbanThread Apparel BD", yearsActive: "7 yrs", country: "BD", verified: true },
    selectedColor: "White",
    images: [imgCrownShirt1, imgCrownShirt2],
    description:
      "Premium oversized drop-shoulder T-shirt with bold crown graphic print using water-based ink on 220 GSM combed cotton — perfect for streetwear brands, private label, and influencer merchandise.",
    specifications: {
      fabric: { material: "100% Combed Cotton", gsm: "220 GSM", weave: "Single Jersey", finish: "Bio-Washed Soft" },
      fit: { style: "Oversized Drop Shoulder", neckline: "Crew Neck", sizes: "S, M, L, XL, XXL", length: "Extended Hip Length" },
      print: { method: "Water-Based Screen Print", placement: "Front Chest / Back", colorfastness: "Grade 4-5", inkType: "Eco Water-Based" },
      business: { oemOdm: "Available", customLogo: "MOQ 25+", leadTime: "14-20 Days" },
    },
  },
];

/* ─── Types ──────────────────────────────────────────────────── */
type Product = typeof accessoriesProducts[0];

/* ─── Flip Card ──────────────────────────────────────────────── */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : null;

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((v) => !v);
  };

  return (
    <motion.div
      className="group relative w-full cursor-pointer"
      style={{ perspective: "1200px", height: "clamp(360px, 45vw, 440px)" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => { setFlipped(false); setImgIdx(0); }}
      onClick={() => setFlipped((v) => !v)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image area */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ height: "58%" }}
            onMouseEnter={() => setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIdx}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.images[imgIdx]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Discount badge */}
            {discount && (
              <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                -{discount}%
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition hover:scale-110 active:scale-95"
            >
              <HeartIcon filled={wishlisted} />
            </button>

            {/* Image dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {product.images.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      imgIdx === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info area */}
          <div className="flex flex-1 flex-col justify-between p-3">
            <div>
              {/* <p className="text-[10px] font-medium uppercase tracking-wider text-[#7F626D]/70 mb-0.5">
                {product.supplier.country} · MOQ {product.moq}
              </p> */}
              <h3 className="text-[13px] font-semibold leading-snug text-gray-800 line-clamp-2">
                {product.name}
              </h3>
            </div>

            <div className="mt-2 flex items-end justify-between">
              <div>
                {product.offerPrice ? (
                  <>
                    <p className="text-base font-bold text-rose-600 leading-none">৳{product.offerPrice.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 line-through mt-0.5">৳{product.price.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-base font-bold text-gray-800">৳{product.price.toLocaleString()}</p>
                )}
              </div>

              <motion.button
                onClick={handleCart}
                whileTap={{ scale: 0.92 }}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white shadow transition-colors ${
                  addedToCart ? "bg-green-500" : "bg-[#19827d] hover:bg-[#9e7082]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckIcon /> Added
                  </>
                ) : (
                  <>
                    <CartIcon /> Cart
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>





        {/* ── BACK ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl text-black p-4 shadow-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Supplier badge */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold ">
              {product.supplier.country}
            </div>
            <div>
              <p className="text-[11px] font-semibold leading-none">{product.supplier.name}</p>
              <p className="text-[10px] text-white/60">{product.supplier.yearsActive} · {product.supplier.verified ? "✓ Verified" : "Unverified"}</p>
            </div>
          </div>

          <h3 className="mb-2 text-[14px] font-bold leading-snug line-clamp-2">
            {product.name}
          </h3>

          <p className="flex-1 text-[12px] leading-relaxed  line-clamp-4">
            {product.description}
          </p>

          {/* Spec chips */}
          <div className="my-3 flex flex-wrap gap-1.5">
            {Object.entries(Object.values(product.specifications)[0])
              .slice(0, 3)
              .map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium "
                >
                  {String(v)}
                </span>
              ))}
          </div>

          {/* Price row */}
          <div className="mb-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
            <div>
              {product.offerPrice ? (
                <>
                  <p className="text-base font-bold text-white leading-none">৳{product.offerPrice.toLocaleString()}</p>
                  <p className="text-[11px] text-white/50 line-through">৳{product.price.toLocaleString()}</p>
                </>
              ) : (
                <p className="text-base font-bold text-white">৳{product.price.toLocaleString()}</p>
              )}
            </div>
            {discount && (
              <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Save {discount}%
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="grid gap-2">
            <Link
              href={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center rounded-xl bg-[#7149f5] py-2 text-[12px] font-semibold text-white hover:text-black shadow transition hover:bg-white/90"
            >
              View Details
            </Link>
           <div className="flex justify-between gap-2">
             <Link
              href={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center rounded-xl bg-[#73eef7] py-2 px-2 text-[12px] font-semibold text-black shadow transition hover:bg-white/90"
            >
              Buy Now
            </Link>
            <button
              onClick={handleCart}
              className={`rounded-xl py-2 px-2 text-[12px] font-semibold shadow transition ${
                addedToCart ? "bg-[#19827d]" : "bg-[#19827d] hover:bg-white/30"
              }`}
            >
              {addedToCart ? "✓ Added!" : "Add to Cart"}
            </button>
           </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Inline SVG Icons ───────────────────────────────────────── */
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#e11d48" : "none"} stroke={filled ? "#e11d48" : "#9ca3af"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Section Header ─────────────────────────────────────────── */
function SectionHeader() {
  return (
    <div className="mb-8">
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-2 inline-block rounded-full bg-[#7F626D]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#7F626D]"
      >
        Trending Now
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="text-2xl font-bold text-gray-900 sm:text-3xl flex flex-col items-center text-center"
      >
        Popular Accessories
      </motion.h2>
      {/* <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-2 max-w-md text-sm text-gray-500"
      >
        Hover or tap any card to explore details, specs &amp; B2B pricing
      </motion.p> */}
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────── */
export default function Popular() {
  return (
    <section className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="">
        <SectionHeader />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {accessoriesProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}