"use client";

/**
 * TryOnButton
 * -----------
 * Renders the correct "Try Now" CTA (or nothing) based on
 * product.category and product.subSubCategories.
 *
 * Supported try-on routes:
 *   • Jewellery & Accessories  → /tryonvirtually/necklacetryon/[id]
 *   • Fashion & Apparel > Sunglasses → /tryonvirtually/glassestryOn/[id]
 *   • (more can be added below)
 */

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import Sunglasstryon from "./sunglasstryon/page";
import CaptryOn from "../../app/tryonvertually/favrics/captryon/page"
import { RiJewelryFill } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa";
import { BsSunglasses } from "react-icons/bs";

// Lazy-load the heavy AR component only when the modal is opened
const Necklacetryon = dynamic(() => import("../../app/tryonvertually/juelarytryon/neclesstryon/page"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    _id: string;
    category: string;
    subCategories?: string;
    subSubCategories?: string;
    images: string[];          // array of image URLs from DB
    name?: string;
}

interface TryOnButtonProps {
    product: Product;
    /** "inline" opens an AR modal in-page; "page" navigates to a dedicated route */
    mode?: "inline" | "page";
}

// ─── Shared button style (matches the site's existing CTA) ───────────────────
const BTN =
    "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#09b7f6] px-5 py-3 text-sm font-bold text-white hover:bg-[#a5e0f6] transition-colors";

// ─── Component ────────────────────────────────────────────────────────────────
export default function TryOnButton({ product, mode = "inline" }: TryOnButtonProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const {
  _id,
  category,
  subcategory,
  subSubcategory,
  images,
} = product;
const sunCategoris =subcategory;
    
// ── 1. Jewellery & Accessories ───────────────────────────────────────────



const necklaceSubSubcategories = [
  "Gold Necklace",
  "Silver Necklace",
  "Fashion Necklace",
  "Diamond Necklace",
];

const isNecklaceTryOn =
  category === "Jewellery & Accessories" &&
  necklaceSubSubcategories.includes(subSubcategory);

if (isNecklaceTryOn) {
  if (mode === "page") {
    return (
      <Link
        href={`/tryonvertually/juelarytryon/neclesstryon`}
        className={BTN}
      >
       <RiJewelryFill className="text-2xl"/> Try Now
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={BTN}
        onClick={() => setModalOpen(true)}
      >
        <RiJewelryFill className="text-2xl text-amber-400"/> Try Now
      </button>

      {modalOpen && (
        <TryOnModal onClose={() => setModalOpen(false)}>
          <Necklacetryon product={product} />
        </TryOnModal>
      )}
    </>
  );
}

    // if (category === "Jewellery & Accessories" && subSubcategories=="Gold Necklace" || subSubcategories=="Silver Necklace" || subSubcategories=="Fashion Necklace" || subSubcategories=="Diamond Necklace") {
    //     if (mode === "page") {
    //         return (
    //             <Link href={`/tryonvertually/juelarytryon/neclesstryon`} className={BTN}>
    //                 💍 Try Now
    //             </Link>
    //         );
    //     }

    //     return (
    //         <>
    //             <button type="button" className={BTN} onClick={() => setModalOpen(true)}>
    //                 💍 Try Now
    //             </button>

    //             {modalOpen && (
                    
    //                 <TryOnModal onClose={() => setModalOpen(false)}>
    //                     {/* Pass all product images; user can switch between them in the gallery */}
    //                     {/* <Necklacetryon productImages={images} /> */}
    //                     <Necklacetryon
    //                         product={product}
    //                     />
    //                 </TryOnModal>
    //             )}
    //         </>
    //     );
    // }

    // ── 2. Fashion & Apparel → Sunglasses ────────────────────────────────────
    if (category === "Fashion & Apparel" && subcategory === "Sunglasses") {
        // return (
        //     <Link href={`/tryonvirtually/glassestryOn/${_id}`} className={BTN}>
        //         🕶️ Try Now
        //     </Link>
        // );

        return (
    <>
      <button className={BTN} onClick={() => setModalOpen(true)}> <BsSunglasses className="text-2xl text-black"/> Try Now</button>
      {modalOpen && (
        <TryOnModal onClose={() => setModalOpen(false)}>
          <Sunglasstryon product={product} />
        </TryOnModal>
      )}
    </>
  );
    }



     // ── 2. Fashion & Apparel → Sunglasses ────────────────────────────────────
    if (category === "Fashion & Apparel" && subSubcategory === "Cap" || subSubcategory ===  "Baseball Cap" || subSubcategory === "Gold Crown") {
        // return (
        //     <Link href={`/tryonvirtually/glassestryOn/${_id}`} className={BTN}>
        //         🕶️ Try Now
        //     </Link>
        // );

        return (
    <>
      <button className={BTN} onClick={() => setModalOpen(true)}><FaGraduationCap className="text-sky-100 text-2xl"/> Try Now</button>
      {modalOpen && (
        <TryOnModal onClose={() => setModalOpen(false)}>
          <CaptryOn product={product} />
        </TryOnModal>
      )}
    </>
  );
    }

    // ── 3. Fashion & Apparel → other wearables you support ───────────────────
    // Add more else-if blocks here as you build more try-on features, e.g.:
    //
    // if (category === "Fashion & Apparel" && subSubCategories === "Hats") {
    //   return <Link href={`/tryonvirtually/hattryOn/${_id}`} className={BTN}>🎩 Try Now</Link>;
    // }

    // ── 4. No try-on available for this product → render nothing ─────────────
    return null;
}

// ─── Simple modal wrapper ─────────────────────────────────────────────────────
function TryOnModal({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            {/* Prevent clicks inside from closing */}
            <div
                className="relative w-full  rounded-2xl bg-[#0a0a12] shadow-2xl overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-4 z-10 text-white/60 hover:text-white text-2xl leading-none"
                    aria-label="Close"
                >
                    ✕
                </button>

                {children}
            </div>
        </div>
    );
}