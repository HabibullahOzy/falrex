// "use client";
// import { useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { useAuth } from "../../context/AuthContext";
// import { Loader2 } from "lucide-react";

// interface Props {
//   children:      React.ReactNode;
//   roles?:        string[];
//   requireSeller?:boolean;
//   fallback?:     string;
// }

// export default function AuthGuard({
//   children, roles, requireSeller = false, fallback,
// }: Props) {
//   const { user, loading, isLoggedIn } = useAuth();
//   const router  = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (loading) return;

//     // Not logged in
//     if (!isLoggedIn) {
//       router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
//       return;
//     }

//     // Role check
//     if (roles && user && !roles.includes(user.role)) {
//       router.replace(fallback 
//         || 
//         // user.dashboardPath
//         ""
//       );
//       return;
//     }

//     // Seller approval check
//     if (requireSeller && user?.role === "seller" && !user.isApprovedSeller) {
//       router.replace("/dashboard/seller/pending");
//       return;
//     }
//   }, [loading, isLoggedIn, user, roles, requireSeller, pathname, router, fallback]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
//       </div>
//     );
//   }

//   if (!isLoggedIn) return null;
//   if (roles && user && !roles.includes(user.role)) return null;
//   if (requireSeller && user?.role === "seller" && !user?.isApprovedSeller) return null;

//   return <>{children}</>;
// }



"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children:       React.ReactNode;
  roles?:         string[];          // e.g. ["admin", "super_admin"]
  requireSeller?: boolean;           // seller must be approved
  fallback?:      string;            // custom redirect when role denied
}

// Role → home page (mirrors middleware.ts and login page)
const ROLE_HOME: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin:       "/dashboard/admin",
  seller:      "/dashboard/seller",
  user:        "/dashboard/user",
};

export default function AuthGuard({
  children, roles, requireSeller = false, fallback,
}: Props) {
  const { user, loading, isLoggedIn } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login, preserving intended destination
    if (!isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role check
    if (roles && user && !roles.includes(user.role)) {
      router.replace(fallback || ROLE_HOME[user.role] || "/");
      return;
    }

    // Seller approval check
    if (requireSeller && user?.role === "seller" && !user.isApprovedSeller) {
      router.replace("/dashboard/seller/pending");
      return;
    }
  }, [loading, isLoggedIn, user, roles, requireSeller, pathname, router, fallback]);

  // While loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Not passing guard conditions — render nothing (redirect is in flight)
  if (!isLoggedIn) return null;
  if (roles && user && !roles.includes(user.role)) return null;
  if (requireSeller && user?.role === "seller" && !user?.isApprovedSeller) return null;

  return <>{children}</>;
}