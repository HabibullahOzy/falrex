"use client";
import {
  createContext, useContext, useState,
  useCallback, ReactNode,
} from "react";

interface CompareProduct {
  _id:            string;
  nameEng:        string;
  brand:          string;
  price:          number;
  currency:       string;
  discount:       number;
  category:       string;
  subcategory:    string;
  images:         { url: string }[];
  specifications: Record<string, Record<string, string>>;
  moq:            string;
  stock:          number;
  avgRating:      number;
  totalReviews:   number;
  supplierName:   string;
  countryOfOrigin:string;
  certifications: string;
  leadTime:       string;
  incoterms:      string;
  shippingMethod: string;
  sampleAvailable:string;
}

interface CompareContextType {
  compareList:   CompareProduct[];
  addToCompare:  (product: CompareProduct) => void;
  removeFromCompare: (id: string) => void;
  isInCompare:   (id: string) => boolean;
  clearCompare:  () => void;
  canAdd:        boolean;
}

const CompareCtx = createContext<CompareContextType | null>(null);
const MAX = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);

  const addToCompare = useCallback((product: CompareProduct) => {
    setCompareList((prev) => {
      if (prev.find((p) => p._id === product._id)) return prev;
      if (prev.length >= MAX) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const isInCompare = useCallback((id: string) => {
    return compareList.some((p) => p._id === id);
  }, [compareList]);

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareCtx.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      canAdd: compareList.length < MAX,
    }}>
      {children}
    </CompareCtx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("useCompare must be inside CompareProvider");
  return ctx;
}