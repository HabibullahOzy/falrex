"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Package, Users, ShoppingCart, TrendingUp,
  DollarSign, ArrowUpRight, ArrowDownRight,
  RefreshCw, Store, Tag, Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Period = "7d" | "30d" | "90d";

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalSellers: number;
  totalCategories: number;
  pendingSellers: number;
  recentProducts: any[];
  recentUsers: any[];
  userStats: { _id: string; count: number }[];
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color, trend, trendUp,
}: {
  icon: React.ReactNode; label: string;
  value: string | number; sub?: string;
  color: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Mini bar chart ─────────────────────────────────────────────────────────
function MiniBar({ data, color = "#7c3aed" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
      ))}
    </div>
  );
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────
function LineChart({
  datasets, labels, colors,
}: {
  datasets: { values: number[]; label: string }[];
  labels: string[];
  colors: string[];
}) {
  const W = 560; const H = 180;
  const allVals = datasets.flatMap((d) => d.values);
  const max = Math.max(...allVals, 1);
  const min = Math.min(...allVals, 0);
  const range = max - min || 1;

  const makePath = (values: number[]) =>
    values.map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * W;
      const y = H - ((v - min) / range) * (H - 24) - 12;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="0" x2={W} y1={H * (1 - t) + 12} y2={H * (1 - t) + 12}
            stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {datasets.map((ds, di) => (
          <path key={di} d={makePath(ds.values)} fill="none"
            stroke={colors[di]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {labels.map((l, i) => (
          <text key={i}
            x={(i / Math.max(labels.length - 1, 1)) * W}
            y={H + 24} textAnchor="middle"
            fontSize="11" fill="#94a3b8">
            {l}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        {datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
            <span className="text-xs text-gray-500">{ds.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ADMIN DASHBOARD ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState<Period>("7d");
  const [error,   setError]   = useState<string | null>(null);

  // Fetch all dashboard data in parallel
  const fetchStats = async () => {
    setLoading(true); setError(null);
    try {
      const [productsRes, usersRes, catsRes] = await Promise.all([
        fetch(`${API}/product?limit=5`, { credentials: "include" }),
        fetch(`${API}/users?limit=5`,   { credentials: "include" }),
        fetch(`${API}/category`,         { credentials: "include" }),
      ]);

      const [productsJson, usersJson, catsJson] = await Promise.all([
        productsRes.json(), usersRes.json(), catsRes.json(),
      ]);

      const userStats: { _id: string; count: number }[] = usersJson.stats || [];
      const sellerCount  = userStats.find((s) => s._id === "seller")?.count  || 0;
      const pendingUsers = (usersJson.data || []).filter(
        (u: any) => u.sellerStatus === "pending"
      ).length;

      setStats({
        totalProducts:  productsJson.total  || 0,
        totalUsers:     usersJson.total     || 0,
        totalSellers:   sellerCount,
        totalCategories:catsJson.total      || 0,
        pendingSellers: pendingUsers,
        recentProducts: (productsJson.data  || []).slice(0, 5),
        recentUsers:    (usersJson.data     || []).slice(0, 5),
        userStats,
      });
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  // Simulated chart data based on period
  const chartConfig = useMemo(() => {
    const base = {
      "7d":  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], mul: 1 },
      "30d": { labels: ["W1","W2","W3","W4"], mul: 4 },
      "90d": { labels: ["Jan","Feb","Mar"], mul: 12 },
    }[period];

    const n = base.labels.length;
    return {
      labels: base.labels,
      products: Array.from({ length: n }, () => Math.floor(Math.random() * 20 * base.mul + 5)),
      users:    Array.from({ length: n }, () => Math.floor(Math.random() * 15 * base.mul + 3)),
      orders:   Array.from({ length: n }, () => Math.floor(Math.random() * 30 * base.mul + 10)),
    };
  }, [period]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
        ❌ {error}
        <button onClick={fetchStats} className="ml-3 underline">Retry</button>
      </div>
    </div>
  );

  const userStatMap = Object.fromEntries((stats?.userStats || []).map((s) => [s._id, s.count]));

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mt-0.5">
            Business Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-purple-600" />}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="bg-purple-50"
          trend="+12%"
          trendUp
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          sub={`${userStatMap.seller || 0} sellers`}
          color="bg-blue-50"
          trend="+8%"
          trendUp
        />
        <StatCard
          icon={<Store className="w-5 h-5 text-green-600" />}
          label="Active Sellers"
          value={stats?.totalSellers ?? 0}
          sub={stats?.pendingSellers ? `${stats.pendingSellers} pending` : undefined}
          color="bg-green-50"
          trend="+3%"
          trendUp
        />
        <StatCard
          icon={<Tag className="w-5 h-5 text-amber-600" />}
          label="Categories"
          value={stats?.totalCategories ?? 0}
          color="bg-amber-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                Activity Trend
              </p>
              <h2 className="text-base font-bold text-gray-800 mt-0.5">
                Products · Users · Orders
              </h2>
            </div>
          </div>
          <LineChart
            datasets={[
              { values: chartConfig.products, label: "Products" },
              { values: chartConfig.users,    label: "Users" },
              { values: chartConfig.orders,   label: "Orders" },
            ]}
            labels={chartConfig.labels}
            colors={["#7c3aed", "#2563eb", "#059669"]}
          />
        </div>

        {/* User distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
            User Breakdown
          </p>
          <h2 className="text-base font-bold text-gray-800 mb-5">By Role</h2>

          <div className="space-y-4">
            {[
              { label: "Regular Users", key: "user",        color: "bg-blue-500" },
              { label: "Sellers",       key: "seller",      color: "bg-purple-500" },
              { label: "Admins",        key: "admin",       color: "bg-red-500" },
            ].map(({ label, key, color }) => {
              const count = userStatMap[key] || 0;
              const pct   = stats?.totalUsers
                ? Math.round((count / stats.totalUsers) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <span className="text-xs font-bold text-gray-800">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini bar */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-2 font-medium">Weekly activity</p>
            <MiniBar
              data={chartConfig.users}
              color="#7c3aed"
            />
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Catalogue</p>
              <h2 className="text-sm font-bold text-gray-800">Recent Products</h2>
            </div>
            <Link href="/dashboard/admin/products"
              className="text-xs text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1">
              View all <Eye className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentProducts || []).length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No products yet</div>
            ) : (
              stats?.recentProducts.map((p) => {
                const sym = p.currency?.includes("৳") ? "৳" : "$";
                const img = p.images?.[0]?.url;
                return (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {img ? (
                        <Image width={10} height={10} src={img} alt={p.nameEng} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.nameEng}</p>
                      <p className="text-[10px] text-gray-400">{p.category || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">
                        {p.price ? `${sym} ${p.price.toLocaleString()}` : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400">Stock: {p.stock ?? 0}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Community</p>
              <h2 className="text-sm font-bold text-gray-800">Recent Users</h2>
            </div>
            <Link href="/dashboard/admin/users"
              className="text-xs text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1">
              View all <Eye className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentUsers || []).length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No users yet</div>
            ) : (
              stats?.recentUsers.map((u) => {
                const initials = (u.firstName?.[0] || "") + (u.lastName?.[0] || "");
                const roleColor: Record<string, string> = {
                  admin: "bg-purple-400", seller: "bg-blue-400", user: "bg-gray-400",
                };
                return (
                  <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${roleColor[u.role] || "bg-gray-400"}`}>
                      {initials || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === "admin"  ? "bg-purple-100 text-purple-700" :
                        u.role === "seller" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                      {u.sellerStatus === "pending" && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pending sellers alert */}
      {stats?.pendingSellers ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {stats.pendingSellers} seller{stats.pendingSellers > 1 ? "s" : ""} awaiting verification
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review and approve seller applications to activate their accounts.
            </p>
          </div>
          <Link href="/dashboard/admin/sellers"
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition flex-shrink-0">
            Review Now
          </Link>
        </div>
      ) : null}
    </div>
  );
}