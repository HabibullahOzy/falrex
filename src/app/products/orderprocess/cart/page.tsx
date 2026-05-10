"use client";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { useEffect } from "react";

function getCurrencySymbol(currency?: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  return "৳";
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const sym = getCurrencySymbol(cart.items[0]?.currency);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 flex flex-col
          shadow-2xl transition-transform duration-350 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800">Your Cart</h2>
            <span className="bg-purple-100 text-purple-700 text-md font-medium px-2 py-0.5 rounded-full">
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-md text-red-400 hover:text-red-600 font-medium transition"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-purple-600 text-white text-sm rounded-full font-medium hover:bg-purple-700 transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item._id} className="flex gap-3 p-3 rounded-2xl border border-gray-100 bg-white">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.nameEng} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                    {item.nameEng}
                  </p>
                  {item.supplierName && (
                    <p className="text-[10px] text-orange-500 font-medium mt-0.5">{item.supplierName}</p>
                  )}

                  {(item.variation.color || item.variation.size) && (
                    <div className="flex gap-1 mt-1">
                      {item.variation.color && (
                        <span className="text-[15px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                          {item.variation.color}
                        </span>
                      )}
                      {item.variation.size && (
                        <span className="text-[15px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                          {item.variation.size}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {/* Price */}
                    <div>
                      <span className="text-xs font-bold text-gray-800">
                        {sym} {item.finalPrice.toLocaleString()}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through ml-1">
                          {sym} {item.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Qty + Remove */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[15px] text-purple-600 font-semibold mt-1">
                    Subtotal: {sym} {(item.finalPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{sym} {cart.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">To be confirmed</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-sm pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{sym} {cart.subtotal.toLocaleString()}</span>
            </div>
            <Link
              href="/products/orderprocess/checkout"
              onClick={onClose}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}