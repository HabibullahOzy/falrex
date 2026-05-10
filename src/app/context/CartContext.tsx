"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchCart, addToCart as addItem, updateCartItem, removeCartItem, clearCart as clearCartApi } from "../../../lib/cartHelpers";

interface CartItem {
  _id: string;
  productId: string;
  nameEng: string;
  image: string;
  price: number;
  finalPrice: number;
  currency: string;
  quantity: number;
  discount: number;
  supplierName: string;
  variation: { color: string; size: string; sku: string };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface CartContextType {
  cart: CartState;
  loading: boolean;
  addToCart: (productId: string, qty?: number, variation?: any) => Promise<{ success: boolean; message?: string }>;
  updateItem: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart,    setCart]    = useState<CartState>({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const data = await fetchCart();
      if (data) setCart(data);
    } catch {}
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (productId: string, qty = 1, variation = {}) => {
    setLoading(true);
    try {
      const res = await addItem(productId, qty, variation);
      if (res.success) setCart(res.data);
      return res;
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId: string, qty: number) => {
    const res = await updateCartItem(itemId, qty);
    if (res.success) setCart(res.data);
  };

  const removeItem = async (itemId: string) => {
    const res = await removeCartItem(itemId);
    if (res.success) setCart(res.data);
  };

  const clearCart = async () => {
    await clearCartApi();
    setCart({ items: [], subtotal: 0, itemCount: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}