"use client"

import { useState, type ReactNode } from 'react'
import DashboardNav from './dashboardbody/dashboardNav/DashboardNav'

export default function Dashlayout({ children }: { children: ReactNode }) {
    const [navOpen, setNavOpen]             = useState(true);
     const handleRate = 68.4;
    return (
        <div>
            <DashboardNav
                    isOpen={navOpen}
                    onToggle={() => setNavOpen((p) => !p)}
                    handleRate={handleRate}
                  />
            {children}
            </div>
    )
}


// app/dashboard/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop this file at:  src/app/dashboard/layout.tsx
//
// Sub-layouts per role live at:
//   src/app/dashboard/admin/layout.tsx    → wraps with requireRole("admin","super_admin")
//   src/app/dashboard/seller/layout.tsx   → wraps with requireRole("seller")
//   src/app/dashboard/user/layout.tsx     → wraps with requireRole("user")
//
// The top-level layout just checks "are you logged in?".
// ─────────────────────────────────────────────────────────────────────────────

// "use client";

// import { useState, useEffect, useRef, type ReactNode } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";   // adjust path if needed
// import {
//   LayoutDashboard, Package, Tag, Users, ShoppingCart,
//   BarChart2, Settings, LogOut, Menu, X, Bell,
//   Search, Shield, Star, User, TrendingUp, Boxes,
//   FileText, MessageSquare, Store, ChevronDown,
//   Loader2, AlertCircle, Clock,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // Nav config
// // ─────────────────────────────────────────────────────────────────────────────
// type NavItem = { href: string; icon: React.ElementType; label: string; badge?: number };
// type NavGroup = { group: string; items: NavItem[] };

// const NAV: Record<string, NavGroup[]> = {
//   super_admin: [
//     {
//       group: "Overview",
//       items: [
//         { href: "/dashboard/admin",           icon: LayoutDashboard, label: "Dashboard" },
//         { href: "/dashboard/admin/analytics", icon: BarChart2,       label: "Analytics" },
//       ],
//     },
//     {
//       group: "Catalogue",
//       items: [
//         { href: "/dashboard/admin/products",       icon: Package, label: "All Products" },
//         { href: "/dashboard/admin/create-product", icon: Boxes,   label: "Add Product" },
//         { href: "/dashboard/admin/categories",     icon: Tag,     label: "Categories" },
//       ],
//     },
//     {
//       group: "Commerce",
//       items: [
//         { href: "/dashboard/admin/orders",  icon: ShoppingCart, label: "Orders" },
//         { href: "/dashboard/admin/users",   icon: Users,        label: "Users" },
//         { href: "/dashboard/admin/sellers", icon: Store,        label: "Sellers" },
//       ],
//     },
//     {
//       group: "System",
//       items: [
//         { href: "/dashboard/admin/reports",  icon: FileText,  label: "Reports" },
//         { href: "/dashboard/admin/settings", icon: Settings,  label: "Settings" },
//       ],
//     },
//   ],

//   admin: [
//     {
//       group: "Overview",
//       items: [
//         { href: "/dashboard/admin",           icon: LayoutDashboard, label: "Dashboard" },
//         { href: "/dashboard/admin/analytics", icon: BarChart2,       label: "Analytics" },
//       ],
//     },
//     {
//       group: "Catalogue",
//       items: [
//         { href: "/dashboard/admin/products",       icon: Package, label: "All Products" },
//         { href: "/dashboard/admin/create-product", icon: Boxes,   label: "Add Product" },
//         { href: "/dashboard/admin/categories",     icon: Tag,     label: "Categories" },
//       ],
//     },
//     {
//       group: "Commerce",
//       items: [
//         { href: "/dashboard/admin/orders",  icon: ShoppingCart, label: "Orders" },
//         { href: "/dashboard/admin/users",   icon: Users,        label: "Users" },
//         { href: "/dashboard/admin/sellers", icon: Store,        label: "Sellers" },
//       ],
//     },
//   ],

//   seller: [
//     {
//       group: "My Store",
//       items: [
//         { href: "/dashboard/seller",                icon: LayoutDashboard, label: "Dashboard" },
//         { href: "/dashboard/seller/products",       icon: Package,         label: "My Products" },
//         { href: "/dashboard/seller/create-product", icon: Boxes,           label: "Add Product" },
//         { href: "/dashboard/seller/orders",         icon: ShoppingCart,    label: "Orders" },
//       ],
//     },
//     {
//       group: "Analytics",
//       items: [
//         { href: "/dashboard/seller/analytics", icon: TrendingUp,    label: "Performance" },
//         { href: "/dashboard/seller/reviews",   icon: MessageSquare, label: "Reviews" },
//       ],
//     },
//     {
//       group: "Account",
//       items: [
//         { href: "/dashboard/seller/profile",  icon: User,     label: "Profile" },
//         { href: "/dashboard/seller/settings", icon: Settings, label: "Settings" },
//       ],
//     },
//   ],

//   user: [
//     {
//       group: "My Account",
//       items: [
//         { href: "/dashboard/user",          icon: LayoutDashboard, label: "Overview" },
//         { href: "/dashboard/user/orders",   icon: ShoppingCart,    label: "My Orders" },
//         { href: "/dashboard/user/wishlist", icon: Star,            label: "Wishlist" },
//         { href: "/dashboard/user/profile",  icon: User,            label: "Profile" },
//         { href: "/dashboard/user/settings", icon: Settings,        label: "Settings" },
//       ],
//     },
//   ],
// };

// const ROLE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
//   super_admin: { label: "Super Admin", bg: "#fef2f2", text: "#b91c1c" },
//   admin:       { label: "Admin",       bg: "#f5f3ff", text: "#6d28d9" },
//   seller:      { label: "Seller",      bg: "#eff6ff", text: "#1d4ed8" },
//   user:        { label: "User",        bg: "#f0fdf4", text: "#15803d" },
// };

// // Role home — matches middleware.ts
// const ROLE_HOME: Record<string, string> = {
//   super_admin: "/dashboard/admin",
//   admin:       "/dashboard/admin",
//   seller:      "/dashboard/seller",
//   user:        "/dashboard/user",
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Full-screen states
// // ─────────────────────────────────────────────────────────────────────────────
// function LoadingScreen() {
//   return (
//     <div style={{
//       minHeight: "100vh", display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center",
//       background: "#f8fafc", gap: 16,
//     }}>
//       <div style={{
//         width: 48, height: 48, borderRadius: 14,
//         background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         boxShadow: "0 8px 24px rgba(99,102,241,.35)",
//       }}>
//         <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>F</span>
//       </div>
//       <Loader2 size={22} style={{ color: "#6366f1", animation: "spin 1s linear infinite" }} />
//       <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Loading your dashboard…</p>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// }

// function SellerPendingScreen() {
//   return (
//     <div style={{
//       minHeight: "100vh", display: "flex", alignItems: "center",
//       justifyContent: "center", background: "#f8fafc", padding: 24,
//     }}>
//       <div style={{
//         maxWidth: 440, width: "100%", background: "#fff",
//         borderRadius: 20, padding: "40px 36px",
//         boxShadow: "0 4px 32px rgba(0,0,0,.08)",
//         textAlign: "center",
//       }}>
//         <div style={{
//           width: 64, height: 64, borderRadius: "50%",
//           background: "linear-gradient(135deg,#fef3c7,#fde68a)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           margin: "0 auto 20px",
//         }}>
//           <Clock size={28} style={{ color: "#d97706" }} />
//         </div>
//         <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
//           Pending Verification
//         </h2>
//         <p style={{ margin: "0 0 24px", fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
//           Your seller account is under review. Our team will verify your
//           business details within <strong>24–48 hours</strong>. You'll
//           receive an email once approved.
//         </p>
//         <div style={{
//           background: "#fffbeb", border: "1px solid #fde68a",
//           borderRadius: 12, padding: "14px 18px",
//           display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left",
//         }}>
//           <AlertCircle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
//           <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
//             While waiting, you can browse the platform as a buyer.
//           </p>
//         </div>
//         <Link href="/" style={{
//           display: "inline-block", marginTop: 24,
//           padding: "10px 24px", borderRadius: 10,
//           background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//           color: "#fff", fontWeight: 600, fontSize: 14,
//           textDecoration: "none",
//         }}>
//           Go to Homepage
//         </Link>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Sidebar
// // ─────────────────────────────────────────────────────────────────────────────
// interface SidebarProps {
//   collapsed: boolean;
//   onClose?: () => void;
//   isMobile?: boolean;
// }

// function Sidebar({ collapsed, onClose, isMobile }: SidebarProps) {
//   const pathname   = usePathname();
//   const { user, logout } = useAuth();
//   const router     = useRouter();
//   const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

//   const role      = (user?.role as string) || "user";
//   const navGroups = NAV[role] || NAV.user;
//   const badge     = ROLE_BADGE[role] || ROLE_BADGE.user;
//   const initials  = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

//   const handleLogout = async () => {
//     await logout();
//     router.push("/login");
//   };

//   const isActive = (href: string) =>
//     pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", height: "100%",
//       background: "#fff", overflowY: "auto",
//     }}>
//       {/* Brand */}
//       <div style={{
//         display: "flex", alignItems: "center", gap: 10,
//         padding: collapsed && !isMobile ? "18px 0" : "18px 20px",
//         justifyContent: collapsed && !isMobile ? "center" : "flex-start",
//         borderBottom: "1px solid #f1f5f9",
//         flexShrink: 0,
//       }}>
//         <div style={{
//           width: 36, height: 36, borderRadius: 10, flexShrink: 0,
//           background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           boxShadow: "0 4px 12px rgba(99,102,241,.3)",
//         }}>
//           <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>F</span>
//         </div>
//         {(!collapsed || isMobile) && (
//           <div style={{ minWidth: 0 }}>
//             <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1e293b", lineHeight: 1.2 }}>
//               Falrex B2B
//             </p>
//             <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
//               International Trade
//             </p>
//           </div>
//         )}
//         {isMobile && (
//           <button onClick={onClose} style={{
//             marginLeft: "auto", background: "none", border: "none",
//             cursor: "pointer", padding: 4, color: "#94a3b8",
//           }}>
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       {/* User card */}
//       {(!collapsed || isMobile) && (
//         <div style={{
//           margin: "12px 12px 0",
//           background: "#f8fafc", borderRadius: 12,
//           padding: "12px 14px", border: "1px solid #f1f5f9",
//           flexShrink: 0,
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{
//               width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
//               background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//             }}>
//               <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
//                 {initials || "?"}
//               </span>
//             </div>
//             <div style={{ minWidth: 0, flex: 1 }}>
//               <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b",
//                 whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                 {user?.firstName} {user?.lastName}
//               </p>
//               <p style={{ margin: 0, fontSize: 11, color: "#94a3b8",
//                 whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                 {user?.email}
//               </p>
//             </div>
//           </div>
//           <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
//             <span style={{
//               fontSize: 10, fontWeight: 700, padding: "3px 8px",
//               borderRadius: 20, background: badge.bg, color: badge.text,
//             }}>
//               {badge.label}
//             </span>
//             {role === "seller" && user?.sellerStatus === "pending" && (
//               <span style={{
//                 fontSize: 10, fontWeight: 700, padding: "3px 8px",
//                 borderRadius: 20, background: "#fffbeb", color: "#d97706",
//               }}>
//                 Pending
//               </span>
//             )}
//             {role === "seller" && user?.sellerStatus === "approved" && (
//               <span style={{
//                 fontSize: 10, fontWeight: 700, padding: "3px 8px",
//                 borderRadius: 20, background: "#f0fdf4", color: "#16a34a",
//               }}>
//                 ✓ Verified
//               </span>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Collapsed avatar */}
//       {collapsed && !isMobile && (
//         <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", flexShrink: 0 }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             display: "flex", alignItems: "center", justifyContent: "center",
//           }}>
//             <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials || "?"}</span>
//           </div>
//         </div>
//       )}

//       {/* Nav */}
//       <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>
//         {navGroups.map((group) => (
//           <div key={group.group} style={{ marginBottom: 4 }}>
//             {(!collapsed || isMobile) && (
//               <button
//                 onClick={() => setCollapsedGroups(p => ({ ...p, [group.group]: !p[group.group] }))}
//                 style={{
//                   width: "100%", display: "flex", alignItems: "center",
//                   justifyContent: "space-between", padding: "6px 8px",
//                   background: "none", border: "none", cursor: "pointer",
//                 }}
//               >
//                 <span style={{ fontSize: 9, fontWeight: 700, color: "#cbd5e1",
//                   letterSpacing: "0.1em", textTransform: "uppercase" }}>
//                   {group.group}
//                 </span>
//                 <ChevronDown size={12} style={{
//                   color: "#cbd5e1",
//                   transform: collapsedGroups[group.group] ? "rotate(-90deg)" : "none",
//                   transition: "transform .2s",
//                 }} />
//               </button>
//             )}

//             {!collapsedGroups[group.group] && group.items.map((item) => {
//               const active = isActive(item.href);
//               return (
//                 <Link key={item.href} href={item.href} onClick={isMobile ? onClose : undefined}>
//                   <div style={{
//                     display: "flex", alignItems: "center",
//                     gap: collapsed && !isMobile ? 0 : 10,
//                     padding: collapsed && !isMobile ? "10px 0" : "9px 10px",
//                     justifyContent: collapsed && !isMobile ? "center" : "flex-start",
//                     borderRadius: 10, marginBottom: 2,
//                     background: active
//                       ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
//                       : "transparent",
//                     transition: "background .15s",
//                     cursor: "pointer",
//                     textDecoration: "none",
//                   }}
//                   onMouseEnter={e => {
//                     if (!active) (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
//                   }}
//                   onMouseLeave={e => {
//                     if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
//                   }}
//                   >
//                     <item.icon size={16} style={{
//                       color: active ? "#fff" : "#94a3b8", flexShrink: 0,
//                     }} />
//                     {(!collapsed || isMobile) && (
//                       <span style={{
//                         fontSize: 13, fontWeight: active ? 600 : 500,
//                         color: active ? "#fff" : "#475569",
//                         whiteSpace: "nowrap",
//                       }}>
//                         {item.label}
//                       </span>
//                     )}
//                     {active && (!collapsed || isMobile) && (
//                       <div style={{
//                         marginLeft: "auto", width: 6, height: 6,
//                         borderRadius: "50%", background: "rgba(255,255,255,.6)",
//                       }} />
//                     )}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         ))}
//       </nav>

//       {/* Bottom */}
//       <div style={{
//         padding: "8px 8px 16px", borderTop: "1px solid #f1f5f9",
//         flexShrink: 0,
//       }}>
//         <button
//           onClick={handleLogout}
//           title="Sign out"
//           style={{
//             width: "100%", display: "flex", alignItems: "center",
//             gap: collapsed && !isMobile ? 0 : 10,
//             justifyContent: collapsed && !isMobile ? "center" : "flex-start",
//             padding: collapsed && !isMobile ? "10px 0" : "9px 10px",
//             borderRadius: 10, border: "none", background: "none",
//             cursor: "pointer", color: "#ef4444",
//             transition: "background .15s",
//           }}
//           onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
//           onMouseLeave={e => (e.currentTarget.style.background = "none")}
//         >
//           <LogOut size={16} style={{ flexShrink: 0 }} />
//           {(!collapsed || isMobile) && (
//             <span style={{ fontSize: 13, fontWeight: 500 }}>Sign Out</span>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Topbar
// // ─────────────────────────────────────────────────────────────────────────────
// interface TopbarProps {
//   onMenuClick: () => void;
//   onCollapseClick: () => void;
//   sidebarCollapsed: boolean;
// }

// function Topbar({ onMenuClick, onCollapseClick, sidebarCollapsed }: TopbarProps) {
//   const { user } = useAuth();
//   const pathname  = usePathname();
//   const [notifs]  = useState(3);

//   // Build breadcrumb from pathname
//   const crumbs = pathname
//     .split("/")
//     .filter(Boolean)
//     .map((seg, i, arr) => ({
//       label: seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
//       href:  "/" + arr.slice(0, i + 1).join("/"),
//     }));

//   const badge    = ROLE_BADGE[user?.role || "user"] || ROLE_BADGE.user;
//   const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

//   return (
//     <header style={{
//       height: 60, background: "#fff",
//       borderBottom: "1px solid #f1f5f9",
//       display: "flex", alignItems: "center",
//       padding: "0 20px", gap: 12, flexShrink: 0, zIndex: 10,
//     }}>
//       {/* Mobile menu */}
//       <button
//         onClick={onMenuClick}
//         style={{
//           display: "flex", alignItems: "center", justifyContent: "center",
//           width: 36, height: 36, borderRadius: 8,
//           border: "1px solid #e2e8f0", background: "none", cursor: "pointer",
//         }}
//         className="lg-hide"
//       >
//         <Menu size={16} style={{ color: "#64748b" }} />
//       </button>

//       {/* Desktop collapse */}
//       <button
//         onClick={onCollapseClick}
//         style={{
//           display: "flex", alignItems: "center", justifyContent: "center",
//           width: 36, height: 36, borderRadius: 8,
//           border: "1px solid #e2e8f0", background: "none", cursor: "pointer",
//         }}
//         className="mobile-hide"
//       >
//         {sidebarCollapsed
//           ? <Menu size={16} style={{ color: "#64748b" }} />
//           : <X size={16} style={{ color: "#64748b" }} />
//         }
//       </button>

//       {/* Breadcrumb */}
//       <nav style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
//         {crumbs.map((c, i) => (
//           <span key={c.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
//             {i > 0 && <span style={{ color: "#cbd5e1", fontSize: 13 }}>/</span>}
//             <Link href={c.href} style={{
//               fontSize: 13, fontWeight: i === crumbs.length - 1 ? 600 : 400,
//               color: i === crumbs.length - 1 ? "#1e293b" : "#94a3b8",
//               textDecoration: "none", whiteSpace: "nowrap",
//             }}>
//               {c.label}
//             </Link>
//           </span>
//         ))}
//       </nav>

//       {/* Right side */}
//       <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//         {/* Role badge — hidden on small screens */}
//         <span
//           className="mobile-hide"
//           style={{
//             fontSize: 11, fontWeight: 700, padding: "4px 10px",
//             borderRadius: 20, background: badge.bg, color: badge.text,
//             display: "flex", alignItems: "center", gap: 5,
//           }}
//         >
//           <Shield size={11} />
//           {badge.label}
//         </span>

//         {/* Notifications */}
//         <button style={{
//           position: "relative", width: 36, height: 36,
//           borderRadius: 8, border: "1px solid #e2e8f0",
//           background: "none", cursor: "pointer",
//           display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//           <Bell size={16} style={{ color: "#64748b" }} />
//           {notifs > 0 && (
//             <span style={{
//               position: "absolute", top: -4, right: -4,
//               width: 16, height: 16, borderRadius: "50%",
//               background: "#ef4444", color: "#fff",
//               fontSize: 9, fontWeight: 700,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               border: "2px solid #fff",
//             }}>
//               {notifs}
//             </span>
//           )}
//         </button>

//         {/* Avatar */}
//         <Link href={ROLE_HOME[user?.role || "user"] + "/profile"}>
//           <div style={{
//             width: 36, height: 36, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             cursor: "pointer",
//             boxShadow: "0 2px 8px rgba(99,102,241,.3)",
//           }}>
//             <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
//               {initials || "?"}
//             </span>
//           </div>
//         </Link>
//       </div>
//     </header>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Root protected layout
// // ─────────────────────────────────────────────────────────────────────────────
// export default function DashboardLayout({ children }: { children: ReactNode }) {
//   const { user, loading, isLoggedIn } = useAuth();
//   const router   = useRouter();
//   const pathname = usePathname();

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileOpen,       setMobileOpen]       = useState(false);

//   // Close mobile sidebar on route change
//   useEffect(() => { setMobileOpen(false); }, [pathname]);

//   // ── Auth guard ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (loading) return;

//     if (!isLoggedIn) {
//       router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
//       return;
//     }

//     // Seller pending: only allow /dashboard/seller/pending
//     if (
//       user?.role === "seller" &&
//       user?.sellerStatus === "pending" &&
//       !pathname.startsWith("/dashboard/seller/pending")
//     ) {
//       router.replace("/dashboard/seller/pending");
//       return;
//     }

//     // Admin-only routes
//     if (
//       pathname.startsWith("/dashboard/admin") &&
//       !["admin", "super_admin"].includes(user?.role || "")
//     ) {
//       router.replace(ROLE_HOME[user?.role || "user"] || "/");
//       return;
//     }

//     // Seller-only routes
//     if (
//       pathname.startsWith("/dashboard/seller") &&
//       !["seller", "admin", "super_admin"].includes(user?.role || "")
//     ) {
//       router.replace("/dashboard/user");
//       return;
//     }
//   }, [loading, isLoggedIn, user, pathname, router]);

//   // ── Render states ───────────────────────────────────────────────────────
//   if (loading) return <LoadingScreen />;
//   if (!isLoggedIn) return null;  // redirect in flight

//   if (
//     user?.role === "seller" &&
//     user?.sellerStatus === "pending" &&
//     pathname === "/dashboard/seller/pending"
//   ) {
//     return <SellerPendingScreen />;
//   }

//   // ── Shell ───────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
//         a { text-decoration: none; }
//         @media (max-width: 1023px) { .mobile-hide { display: none !important; } }
//         @media (min-width: 1024px) { .lg-hide { display: none !important; } }
//       `}</style>

//       <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>

//         {/* ── Desktop sidebar ── */}
//         <aside
//           className="mobile-hide"
//           style={{
//             width: sidebarCollapsed ? 64 : 240,
//             flexShrink: 0,
//             borderRight: "1px solid #f1f5f9",
//             transition: "width .25s ease",
//             overflow: "hidden",
//             background: "#fff",
//           }}
//         >
//           <Sidebar collapsed={sidebarCollapsed} />
//         </aside>

//         {/* ── Mobile sidebar backdrop ── */}
//         {mobileOpen && (
//           <div
//             onClick={() => setMobileOpen(false)}
//             style={{
//               position: "fixed", inset: 0, zIndex: 40,
//               background: "rgba(15,23,42,.4)",
//             }}
//           />
//         )}

//         {/* ── Mobile sidebar drawer ── */}
//         <aside style={{
//           position: "fixed", top: 0, left: 0, height: "100%",
//           width: 260, zIndex: 50,
//           transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
//           transition: "transform .25s ease",
//           boxShadow: mobileOpen ? "4px 0 24px rgba(0,0,0,.12)" : "none",
//         }}>
//           <Sidebar collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
//         </aside>

//         {/* ── Main content ── */}
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
//           <Topbar
//             onMenuClick={() => setMobileOpen(true)}
//             onCollapseClick={() => setSidebarCollapsed(p => !p)}
//             sidebarCollapsed={sidebarCollapsed}
//           />
//           <main style={{ flex: 1, overflowY: "auto", padding: 0 }}>
//             {children}
//           </main>
//         </div>
//       </div>
//     </>
//   );
// }