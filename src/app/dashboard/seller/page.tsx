"use client";
import { useState, useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, Star, RefreshCw, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch(`${API}/product?limit=6`, { credentials: "include" });
        const json = await res.json();
        setProducts(json.data || []);
        setTotal(json.total || 0);
      } catch {}
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const totalValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const sym = "৳";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Seller Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-0.5">My Store Overview</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Package className="w-5 h-5 text-purple-600" />, label: "My Products", value: total,    color: "bg-purple-50" },
          { icon: <TrendingUp className="w-5 h-5 text-green-600" />, label: "Inventory Value", value: `${sym} ${totalValue.toLocaleString()}`, color: "bg-green-50" },
          { icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, label: "Orders",     value: "—",    color: "bg-blue-50" },
          { icon: <Star className="w-5 h-5 text-amber-600" />,        label: "Reviews",    value: "—",    color: "bg-amber-50" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{loading ? "…" : value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-800">My Latest Products</h2>
          <Link href="/dashboard/seller/products"
            className="text-xs text-blue-600 font-semibold flex items-center gap-1">
            View all <Eye className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No products yet.
            <Link href="/dashboard/seller/create-product" className="block mt-2 text-blue-600 font-semibold text-xs">
              + Add your first product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.images?.[0]?.url
                    ? <Image width={10} height={10} src={p.images[0].url} alt={p.nameEng} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.nameEng}</p>
                  <p className="text-[10px] text-gray-400">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">{sym} {(p.price || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Stock: {p.stock ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}