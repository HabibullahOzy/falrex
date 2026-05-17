"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Bell, GitCompare, LogOut,
  User, LayoutDashboard, Settings, ChevronDown,
  Menu, X, MessageSquare,
} from "lucide-react";
import { useCart }    from "../../context/CartContext";
import { useCompare } from "../../context/CompareContext";
import { useAuth }    from "../../../../lib/useAuth";
import SearchBar      from "./SearchBar";
import CartDrawer     from "@/app/products/orderprocess/cart/page";
import logoe          from "../../assets/positiveshop.png";
import avatar         from "@/assets/avatar.png";

const ROLE_COLOR: Record<string, string> = {
  super_admin: "bg-purple-600",
  admin:       "bg-blue-600",
  seller:      "bg-green-600",
  user:        "bg-gray-500",
};

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin:       "/dashboard/admin",
  seller:      "/dashboard/seller",
  user:        "/dashboard/user",
};

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { cart }          = useCart();
  const { compareList }   = useCompare();
  const { user, loading } = useAuth();

  const [cartOpen,    setCartOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
// console.log(user)
  // ✅ useEffect is BEFORE the early return — fixes the hooks violation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Early return is AFTER all hooks
  const hidden = ["/dashboard", "/blog", "/socialCommunication"]
    .some((p) => pathname.startsWith(p));
  if (hidden) return null;

  const handleLogout = async () => {
    setProfileOpen(false);
    // await logout();
    // router.push("/");
  };

  const dashboardPath = ROLE_DASHBOARD[user?.role || "user"] || "/dashboard";

  const pathName = usePathname()

  if (!pathName.includes('dashboard') && !pathName.includes('blog') && !pathName.includes('tryonvertually') && !pathName.includes('socialCommunication')) {

  return (
    <>
      <nav className="sticky top-0 z-30 navbg">
        <div className="mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center gap-4 h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src={logoe} alt="Falrex" className="w-28 h-auto" />
              <span className="font-extrabold text-xl hidden sm:block">
                <span className="text-purple-600">P</span>ositive
                <span className="text-amber-500">S</span>hope
              </span>
            </Link>

            {/* ── Search bar (desktop) ── */}
            <div className="flex-1 hidden md:block max-w-2xl">
              <SearchBar />
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">

              {/* Compare */}
              {compareList.length > 0 && (
                <Link href="/compare"
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center
                             bg-gray-100 hover:bg-purple-100 transition">
                  <GitCompare className="w-4 h-4 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white
                                   text-[9px] font-bold rounded-full flex items-center justify-center">
                    {compareList.length}
                  </span>
                </Link>
              )}

              {/* Notifications */}
              <Link href="/notifications"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center
                           bg-gray-100 hover:bg-yellow-100 transition">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white
                                 text-[9px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Chat */}
              <Link href="/chat"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center
                           bg-gray-100 hover:bg-blue-100 transition">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center
                           bg-gray-100 hover:bg-purple-100 transition"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                {(cart.itemCount || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white
                                   text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </button>

              {/* ── Profile / Auth ── */}
              {loading ? (
                <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
              ) : user ? (
                // Logged in — profile dropdown
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                               hover:bg-gray-100 transition"
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full ${ROLE_COLOR[user.role] || "bg-gray-400"}
                                     flex items-center justify-center text-white text-xs font-bold`}>
                      {user.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {user.firstName}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl
                                    border border-gray-200 shadow-xl z-50 overflow-hidden">

                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-bold text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${ROLE_COLOR[user.role]}`} />
                          <span className="text-[10px] font-bold text-gray-500 capitalize">
                            {user.role}
                            {user.role === "seller" && user.sellerStatus === "pending"
                              && " · Pending Approval"}
                            {user.role === "seller" && user.sellerStatus === "approved"
                              && " · Approved"}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="py-2">
                        <ProfileLink
                          href={dashboardPath}
                          icon={<LayoutDashboard className="w-4 h-4" />}
                          label="Dashboard"
                          onClick={() => setProfileOpen(false)}
                        />
                        <ProfileLink
                          href="/profile"
                          icon={<User className="w-4 h-4" />}
                          label="My Profile"
                          onClick={() => setProfileOpen(false)}
                        />
                        <ProfileLink
                          href="/orders"
                          icon={<ShoppingCart className="w-4 h-4" />}
                          label="My Orders"
                          onClick={() => setProfileOpen(false)}
                        />
                        <ProfileLink
                          href="/chat"
                          icon={<MessageSquare className="w-4 h-4" />}
                          label="Messages"
                          onClick={() => setProfileOpen(false)}
                        />
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                     font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Not logged in
                <div className="flex items-center gap-2">
                  <Link href="/login"
                    className="px-1 py-1 text-sm font-semibold text-gray-700
                               hover:text-purple-600 transition hidden sm:block">
                    Login
                  </Link>
                  <Link href="/signup"
                    className="px-1 py-1 bg-purple-600 text-white text-sm font-bold
                               rounded-xl hover:bg-purple-700 transition">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
                           bg-gray-100 hover:bg-gray-200 transition"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className={`md:hidden pb-3 ${mobileOpen ? "block" : "hidden"}`}>
            <SearchBar />
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
}

function ProfileLink({
  href, icon, label, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700
                 hover:bg-gray-50 hover:text-purple-700 transition">
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
} 



// "use client";
// import { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   ShoppingCart, Bell, GitCompare, LogOut,
//   User, LayoutDashboard, Settings, ChevronDown,
//   Menu, X, MessageSquare,
// } from "lucide-react";
// import { useCart }    from "../../context/CartContext";
// import { useCompare } from "../../context/CompareContext";
// import { useAuth }    from "../../../../lib/useAuth";
// import SearchBar      from "./SearchBar";
// import CartDrawer     from "@/app/products/orderprocess/cart/page";
// import logoe          from "../../assets/positiveshop.png";
// import avatar         from "@/assets/avatar.png";

// const ROLE_COLOR: Record<string, string> = {
//   super_admin: "bg-purple-600",
//   admin:       "bg-blue-600",
//   seller:      "bg-green-600",
//   user:        "bg-gray-500",
// };

// const ROLE_DASHBOARD: Record<string, string> = {
//   super_admin: "/dashboard/admin",
//   admin:       "/dashboard/admin",
//   seller:      "/dashboard/seller",
//   user:        "/dashboard/user",
// };

// export default function Navbar() {
//   const pathname = usePathname();
//   const router   = useRouter();
//   const { cart }        = useCart();
//   const { compareList } = useCompare();
//   const { user, loading } = useAuth();

//   const [cartOpen,    setCartOpen]    = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [mobileOpen,  setMobileOpen]  = useState(false);
//   const profileRef = useRef<HTMLDivElement>(null);

//   // Hide on dashboard/blog/socialCommunication routes
//   const hidden = ["/dashboard", "/blog", "/socialCommunication"]
//     .some((p) => pathname.startsWith(p));
//   if (hidden) return null;

//   // Close profile dropdown on outside click
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
//         setProfileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const handleLogout = async () => {
//     setProfileOpen(false);
//     // await logout();
//     // router.push("/");
//   };

//   const dashboardPath = ROLE_DASHBOARD[user?.role || "user"] || "/dashboard";

//   return (
//     <>
//       <nav className="sticky top-0 z-30 navbg">
//         <div className=" mx-auto px-4 md:px-6">
//           <div className="flex justify-between items-center gap-4 h-16">

//             {/* ── Logo ── */}
//             <Link href="/" className="flex items-center gap-2 flex-shrink-0">
//               <Image src={logoe} alt="Falrex" className="w-28 h-auto" />
//               <span className="font-extrabold text-xl hidden sm:block">
//                 <span className="text-purple-600">P</span>ositive
//                 <span className="text-amber-500">S</span>hope
//               </span>
//               {/* <span className="font-extrabold text-xl hidden sm:block">
//                 <span className="text-purple-600">F</span>al
//                 <span className="text-amber-500">R</span>ex
//               </span> */}
//             </Link>

//             {/* ── Search bar (desktop) ── */}
//             <div className="flex-1 hidden md:block max-w-2xl">
//               <SearchBar />
//             </div>

//             {/* ── Right actions ── */}
//             <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">

//               {/* Compare */}
//               {compareList.length > 0 && (
//                 <Link href="/compare"
//                   className="relative w-9 h-9 rounded-xl flex items-center justify-center
//                              bg-gray-100 hover:bg-purple-100 transition">
//                   <GitCompare className="w-4 h-4 text-gray-600" />
//                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white
//                                    text-[9px] font-bold rounded-full flex items-center justify-center">
//                     {compareList.length}
//                   </span>
//                 </Link>
//               )}

//               {/* Notifications */}
//               {/* {isLoggedIn && ( */}
//                 <Link href="/notifications"
//                   className="relative w-9 h-9 rounded-xl flex items-center justify-center
//                              bg-gray-100 hover:bg-yellow-100 transition">
//                   <Bell className="w-4 h-4 text-gray-600" />
//                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white
//                                    text-[9px] font-bold rounded-full flex items-center justify-center">
//                     3
//                   </span>
//                 </Link>
//               {/* )} */}

//               {/* Chat */}
//               {/* {isLoggedIn && ( */}
//                 <Link href="/chat"
//                   className="relative w-9 h-9 rounded-xl flex items-center justify-center
//                              bg-gray-100 hover:bg-blue-100 transition">
//                   <MessageSquare className="w-4 h-4 text-gray-600" />
//                 </Link>
//               {/* )} */}

//               {/* Cart */}
//               <button
//                 onClick={() => setCartOpen(true)}
//                 className="relative w-9 h-9 rounded-xl flex items-center justify-center
//                            bg-gray-100 hover:bg-purple-100 transition"
//               >
//                 <ShoppingCart className="w-4 h-4 text-gray-600" />
//                 {(cart.itemCount || 0) > 0 && (
//                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white
//                                    text-[9px] font-bold rounded-full flex items-center justify-center">
//                     {cart.itemCount}
//                   </span>
//                 )}
//               </button>

//               {/* ── Profile / Auth ── */}
//               {loading ? (
//                 <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
//               // ) : isLoggedIn && user ? (
//               ) : user ? (
//                 // Logged in — profile dropdown
//                 <div ref={profileRef} className="relative">
//                   <button
//                     onClick={() => setProfileOpen(!profileOpen)}
//                     className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
//                                hover:bg-gray-100 transition"
//                   >
//                     {/* Avatar */}
//                     <div className={`w-7 h-7 rounded-full ${ROLE_COLOR[user.role] || "bg-gray-400"}
//                                      flex items-center justify-center text-white text-xs font-bold`}>
//                       {user.firstName?.[0]?.toUpperCase() || "U"}
//                     </div>
//                     <div className="hidden sm:block text-left">
//                       <p className="text-xs font-semibold text-gray-800 leading-tight">
//                         {user.firstName}
//                       </p>
//                       <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
//                     </div>
//                     <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
//                       profileOpen ? "rotate-180" : ""
//                     }`} />
//                   </button>

//                   {/* Dropdown */}
//                   {profileOpen && (
//                     <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl
//                                     border border-gray-200 shadow-xl z-50 overflow-hidden">

//                       {/* User info */}
//                       <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
//                         <p className="text-sm font-bold text-gray-800">
//                           {user.firstName} {user.lastName}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                         <div className="mt-1.5 flex items-center gap-1.5">
//                           <span className={`w-2 h-2 rounded-full ${ROLE_COLOR[user.role]}`} />
//                           <span className="text-[10px] font-bold text-gray-500 capitalize">
//                             {user.role}
//                             {user.role === "seller" && user.sellerStatus === "pending"
//                               && " · Pending Approval"}
//                             {user.role === "seller" && user.sellerStatus === "approved"
//                               && " · Approved"}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Links */}
//                       <div className="py-2">
//                         <ProfileLink
//                           href={dashboardPath}
//                           icon={<LayoutDashboard className="w-4 h-4" />}
//                           label="Dashboard"
//                           onClick={() => setProfileOpen(false)}
//                         />
//                         <ProfileLink
//                           href="/profile"
//                           icon={<User className="w-4 h-4" />}
//                           label="My Profile"
//                           onClick={() => setProfileOpen(false)}
//                         />
//                         <ProfileLink
//                           href="/orders"
//                           icon={<ShoppingCart className="w-4 h-4" />}
//                           label="My Orders"
//                           onClick={() => setProfileOpen(false)}
//                         />
//                         <ProfileLink
//                           href="/chat"
//                           icon={<MessageSquare className="w-4 h-4" />}
//                           label="Messages"
//                           onClick={() => setProfileOpen(false)}
//                         />
//                       </div>

//                       {/* Logout */}
//                       <div className="border-t border-gray-100 py-2">
//                         <button
//                           onClick={handleLogout}
//                           className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
//                                      font-medium text-red-600 hover:bg-red-50 transition"
//                         >
//                           <LogOut className="w-4 h-4" /> Sign Out
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 // Not logged in
//                 <div className="flex items-center gap-2">
//                   <Link href="/login"
//                     className="px-4 py-2 text-sm font-semibold text-gray-700
//                                hover:text-purple-600 transition hidden sm:block">
//                     Login
//                   </Link>
//                   <Link href="/signup"
//                     className="px-4 py-2 bg-purple-600 text-white text-sm font-bold
//                                rounded-xl hover:bg-purple-700 transition">
//                     Sign Up
//                   </Link>
//                 </div>
//               )}

//               {/* Mobile menu toggle */}
//               <button
//                 onClick={() => setMobileOpen(!mobileOpen)}
//                 className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
//                            bg-gray-100 hover:bg-gray-200 transition"
//               >
//                 {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           {/* Mobile search */}
//           <div className={`md:hidden pb-3 ${mobileOpen ? "block" : "hidden"}`}>
//             <SearchBar />
//           </div>
//         </div>
//       </nav>

//       {/* Cart Drawer */}
//       <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
//     </>
//   );
// }

// function ProfileLink({
//   href, icon, label, onClick,
// }: {
//   href: string; icon: React.ReactNode; label: string; onClick: () => void;
// }) {
//   return (
//     <Link href={href} onClick={onClick}
//       className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700
//                  hover:bg-gray-50 hover:text-purple-700 transition">
//       <span className="text-gray-400">{icon}</span>
//       {label}
//     </Link>
//   );
// }