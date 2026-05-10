"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../../../lib/authHelpers";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  BarChart2, Settings, LogOut, Menu, X, ChevronDown,
  Store, Bell, Search, Shield, Star, User,
  TrendingUp, Boxes, FileText, MessageSquare,
} from "lucide-react";

// ── Nav config per role ────────────────────────────────────────────────────
const NAV_CONFIG = {
  super_admin: [
    {
      group: "Overview",
      items: [
        { href: "/dashboard/admin",          icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/admin/analytics",icon: BarChart2,       label: "Analytics" },
      ],
    },
    {
      group: "Catalogue",
      items: [
        { href: "/dashboard/admin/products",  icon: Package,  label: "All Products" },
        { href: "/dashboard/admin/create-product", icon: Boxes, label: "Add Product" },
        { href: "/dashboard/admin/categories",icon: Tag,      label: "Categories" },
      ],
    },
    {
      group: "Commerce",
      items: [
        { href: "/dashboard/admin/orders",   icon: ShoppingCart, label: "Orders" },
        { href: "/dashboard/admin/users",    icon: Users,        label: "All Users" },
        { href: "/dashboard/admin/sellers",  icon: Store,        label: "Sellers" },
      ],
    },
    {
      group: "System",
      items: [
        { href: "/dashboard/admin/reports",  icon: FileText,  label: "Reports" },
        { href: "/dashboard/admin/settings", icon: Settings,  label: "Settings" },
      ],
    },
  ],

  admin: [
    {
      group: "Overview",
      items: [
        { href: "/dashboard/admin",           icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/admin/analytics", icon: BarChart2,       label: "Analytics" },
      ],
    },
    {
      group: "Catalogue",
      items: [
        { href: "/dashboard/admin/products",       icon: Package, label: "All Products" },
        { href: "/dashboard/admin/create-product", icon: Boxes,   label: "Add Product" },
        { href: "/dashboard/admin/categories",     icon: Tag,     label: "Categories" },
      ],
    },
    {
      group: "Commerce",
      items: [
        { href: "/dashboard/admin/orders",  icon: ShoppingCart, label: "Orders" },
        { href: "/dashboard/admin/users",   icon: Users,        label: "All Users" },
      ],
    },
  ],

  seller: [
    {
      group: "My Store",
      items: [
        { href: "/dashboard/seller",                 icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/seller/products",        icon: Package,         label: "My Products" },
        { href: "/dashboard/seller/create-product",  icon: Boxes,           label: "Add Product" },
        { href: "/dashboard/seller/orders",          icon: ShoppingCart,    label: "My Orders" },
      ],
    },
    {
      group: "Analytics",
      items: [
        { href: "/dashboard/seller/analytics", icon: TrendingUp,    label: "Performance" },
        { href: "/dashboard/seller/reviews",   icon: MessageSquare, label: "Reviews" },
      ],
    },
    {
      group: "Account",
      items: [
        { href: "/dashboard/seller/profile",  icon: User,     label: "Profile" },
        { href: "/dashboard/seller/settings", icon: Settings, label: "Settings" },
      ],
    },
  ],

  user: [
    {
      group: "My Account",
      items: [
        { href: "/dashboard/user",          icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/user/orders",   icon: ShoppingCart,    label: "My Orders" },
        { href: "/dashboard/user/wishlist", icon: Star,            label: "Wishlist" },
        { href: "/dashboard/user/profile",  icon: User,            label: "Profile" },
        { href: "/dashboard/user/settings", icon: Settings,        label: "Settings" },
      ],
    },
  ],
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700" },
  admin:       { label: "Admin",       color: "bg-purple-100 text-purple-700" },
  seller:      { label: "Seller",      color: "bg-blue-100 text-blue-700" },
  user:        { label: "User",        color: "bg-gray-100 text-gray-600" },
};

interface Props {
  user: { uid: string; email: string; firstName: string; lastName: string; role: string; sellerStatus: string };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [mobileSidebar,  setMobileSidebar]  = useState(false);
  const [notifCount,     setNotifCount]     = useState(3);
  const [collapsedGroups,setCollapsedGroups]= useState<Record<string, boolean>>({});

  const role    = (user.role as keyof typeof NAV_CONFIG) || "user";
  const navGroups = NAV_CONFIG[role] || NAV_CONFIG.user;
  const badge   = ROLE_BADGE[role] || ROLE_BADGE.user;
  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleGroup = (g: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  };

  // Close mobile sidebar on route change
  useEffect(() => { setMobileSidebar(false); }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-none">Falrex B2B</p>
            <p className="text-[10px] text-gray-400 mt-0.5">International Trade Platform</p>
          </div>
        )}
      </div>

      {/* User info */}
      {sidebarOpen && (
        <div className="mx-3 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials || "?"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
            {role === "seller" && user.sellerStatus === "pending" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-1">
                Pending Verification
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navGroups.map((group) => (
          <div key={group.group} className="mb-2">

            {/* Group header */}
            {sidebarOpen && (
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center justify-between px-2 py-1 mb-1"
              >
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {group.group}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform ${
                  collapsedGroups[group.group] ? "-rotate-90" : ""
                }`} />
              </button>
            )}

            {/* Nav items */}
            {!collapsedGroups[group.group] && group.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}>
                    <item.icon className={`flex-shrink-0 ${sidebarOpen ? "w-4 h-4" : "w-5 h-5"} ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                    }`} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    {isActive && sidebarOpen && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link href="/dashboard/settings">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition ${!sidebarOpen ? "justify-center" : ""}`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition ${!sidebarOpen ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Backdrop ── */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-gray-100 shadow-xl transition-transform duration-300 lg:hidden ${
        mobileSidebar ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Navbar ── */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-4 flex-shrink-0 z-30">

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebar(!mobileSidebar)}
            className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <Menu className="w-4 h-4 text-gray-600" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-9 h-9 rounded-xl border border-gray-200 items-center justify-center hover:bg-gray-50 transition"
          >
            {sidebarOpen ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, orders, users..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
              <Bell className="w-4 h-4 text-gray-600" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Role badge */}
            <span className={`hidden md:flex text-[10px] font-bold px-3 py-1.5 rounded-full items-center gap-1.5 ${badge.color}`}>
              <Shield className="w-3 h-3" />
              {badge.label}
            </span>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-bold">{initials || "?"}</span>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}