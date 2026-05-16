"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ✅ Updated type matching real API shape
type Product = {
  _id: string;
  nameEng: string;
  price: number;
  currency?: string;
  discount?: number;
  images: { url: string; public_id: string; _id: string }[];
  subSubcategory?: string;
  brand?: string;
  stock?: number;
  moq?: string;
  sellingUnit?: string;
  slug?: string;
};

function currencySymbol(currency?: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  if (currency.includes("৳") || currency.includes("BDT")) return "৳";
  return currency;
}

function ProductCard({ product }: { product: Product }) {
  const symbol = currencySymbol(product.currency);
  const mainImage = product.images?.[0]?.url ?? "https://placehold.co/400x300?text=No+Image";

  const discountedPrice =
    product.price && product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : null;

  const handleAddToCart = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      alert("Added to cart!");
    } catch {
      alert("Could not add to cart.");
    }
  };

  const handleBuyNow = () => {
    window.location.href = `/checkout?productId=${product._id}&quantity=1`;
  };

  return (
    <div className="flex min-w-[220px] max-w-[260px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

      {/* Image */}
      <Link href={`/products/${product._id}`} className="relative block h-44 w-full overflow-hidden rounded-t-xl bg-slate-100">
        <Image
          src={mainImage}
          alt={product.nameEng}
          fill
          className="object-cover transition duration-300 hover:scale-105"
        />

        {/* Discount badge */}
        {product.discount ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        ) : null}

        {/* Stock badge */}
        {product.stock !== undefined && product.stock <= 10 && (
          <span className="absolute right-2 top-2 rounded-full bg-orange-400 px-2 py-0.5 text-xs font-bold text-white">
            Low Stock
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-slate-400">{product.brand}</p>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
          {product.nameEng}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          {discountedPrice ? (
            <>
              <span className="text-sm font-bold text-green-600">
                {symbol} {discountedPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {symbol} {product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-green-600">
              {symbol} {product.price?.toLocaleString() ?? "—"}
            </span>
          )}
        </div>

        {/* MOQ */}
        {product.moq && (
          <p className="text-xs text-slate-400">
            MOQ: <b className="text-slate-600">{product.moq} {product.sellingUnit ?? "pcs"}</b>
          </p>
        )}

        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-2 pt-3">

          {/* Learn More */}
          <Link
            href={`/products/${product._id}`}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Learn More
          </Link>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border border-[#7149f5] bg-white px-4 py-2 text-xs font-semibold text-[#7149f5] transition hover:bg-[#7149f5] hover:text-white"
          >
            Add to Cart
          </button>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            className="w-full rounded-full bg-[#7149f5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#8e6bff]"
          >
            Buy Now
          </button>

        </div>
      </div>
    </div>
  );
}

export default function RelatedProducts({
  subSubcategory,
}: {
  subSubcategory: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!subSubcategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      setActiveIndex(0);

      try {
        const encoded = encodeURIComponent(subSubcategory);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product/subsubcategory/${encoded}`
        );
        if (!res.ok) throw new Error("Failed to fetch related products");

        const data = await res.json();
        console.log("API response:", data); // ✅ debug — remove after confirming

        // ✅ Handle all common response shapes
        const productList: Product[] = Array.isArray(data)
          ? data
          : data.products ?? data.data ?? data.result ?? [];

        setProducts(productList);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subSubcategory]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // ✅ filteredProducts defined before auto-slide useEffect
  const filteredProducts = products.filter((p) =>
    p.nameEng.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (filteredProducts.length <= 1) return;
    const slider = setInterval(() => {
      setActiveIndex((prev) =>
        prev === filteredProducts.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(slider);
  }, [filteredProducts.length]);

  const visibleProducts = [
    ...filteredProducts.slice(activeIndex),
    ...filteredProducts.slice(0, activeIndex),
  ].slice(0, 4);

  const handlePrev = () => {
    if (!filteredProducts.length) return;
    setActiveIndex((prev) =>
      prev === 0 ? filteredProducts.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!filteredProducts.length) return;
    setActiveIndex((prev) =>
      prev === filteredProducts.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-full px-4">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            {subSubcategory && (
              <p className="mt-1 text-sm text-slate-400">
                More in <span className="font-semibold text-slate-600">{subSubcategory}</span>
              </p>
            )}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search related products..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#7149f5] sm:w-72"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7149f5] border-t-transparent" />
            <p className="text-sm text-gray-400">Loading related products...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="py-10 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Slider */}
        {!loading && !error && (
          <div className="relative">
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
              aria-label="Previous"
            >
              ←
            </button>

            <div className="mx-12 overflow-hidden">
              {visibleProducts.length > 0 ? (
                <div className="flex gap-5 transition-all duration-500">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm font-medium text-gray-500">
                  No related products found in <b>{subSubcategory}</b>
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
              aria-label="Next"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}