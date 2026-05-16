"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, Loader2 } from "lucide-react";

interface CartButtonsProps {
  productId: string;
  variation?: { color?: string; size?: string; sku?: string };
  quantity?: number;
  disabled?: boolean;
}

export default function CartButtons({
  productId, variation = {}, quantity = 1, disabled = false,
}: CartButtonsProps) {
  const { addToCart } = useCart();
  const router        = useRouter();
  const [addLoading,  setAddLoading]  = useState(false);
  const [buyLoading,  setBuyLoading]  = useState(false);
  const [added,       setAdded]       = useState(false);
  const [error,       setError]       = useState("");

  const handleAddToCart = async () => {
    setAddLoading(true); setError("");
    try {
      const res = await addToCart(productId, quantity, variation);
      if (res.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        setError(res.message || "Failed to add");
      }
    } catch { setError("Failed to add to cart"); }
    finally   { setAddLoading(false); }
  };

  const handleBuyNow = async () => {
    setBuyLoading(true); setError("");
    try {
      // Add to cart first, then redirect to checkout
      await addToCart(productId, quantity, variation);
      // Pass product for direct buy now checkout
      router.push(`/products/orderprocess/checkout?buyNow=${productId}&qty=${quantity}`);
    } catch { setError("Something went wrong"); }
    finally   { setBuyLoading(false); }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      <div className="flex flex-col justify-between gap-2 min-w-[100%] sm:flex-row">

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={addLoading || disabled}
          className={`flex-1 flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-bold transition ${
            added
              ? "bg-green-600 text-white"
              : "border border-black bg-white hover:bg-slate-50"
          } disabled:opacity-50`}
        >
          {addLoading ? (
            <Loader2 className=" animate-spin" />
          ) : added ? (
            <><Check className="" /> Added!</>
          ) : (
            <><ShoppingCart className="w-3" /> Add to Cart</>
          )}
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={buyLoading || disabled}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#7149f5] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#8e6bff] disabled:opacity-50 transition"
        >
          {buyLoading
            ? <Loader2 className=" animate-spin" />
            : <><Zap className="w-3" /> Buy Now</>
          }
        </button>
      </div>
    </div>
  );
}