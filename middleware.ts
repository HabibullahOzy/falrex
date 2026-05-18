// // import { NextRequest, NextResponse } from "next/server";
// // import * as jose from "jose";

// // const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// // // Route access rules
// // const ROUTE_RULES = [
// //   { path: "/dashboard/admin",  roles: ["admin", "super_admin"] },
// //   { path: "/dashboard/seller", roles: ["seller", "admin", "super_admin"] },
// //   { path: "/dashboard",        roles: ["user", "seller", "admin", "super_admin"] },
// // ];

// // export async function middleware(req: NextRequest) {
// //   const { pathname } = req.nextUrl;
// //   const token = req.cookies.get("auth_token")?.value;

// //   let payload: any = null;
// //   if (token) {
// //     try {
// //       const { payload: p } = await jose.jwtVerify(token, JWT_SECRET);
// //       payload = p;
// //     } catch {}
// //   }

// //   // Not logged in → redirect to login
// //   if (pathname.startsWith("/dashboard") && !payload) {
// //     const url = new URL("/login", req.url);
// //     url.searchParams.set("from", pathname);
// //     return NextResponse.redirect(url);
// //   }

// //   // Check role-based access
// //   for (const rule of ROUTE_RULES) {
// //     if (pathname.startsWith(rule.path)) {
// //       if (!rule.roles.includes(payload?.role)) {
// //         // Redirect to their correct dashboard
// //         const role = payload?.role;
// //         const dest = role === "seller" ? "/dashboard/seller"
// //           : role === "user" ? "/dashboard/user"
// //           : "/login";
// //         return NextResponse.redirect(new URL(dest, req.url));
// //       }
// //       break;
// //     }
// //   }

// //   return NextResponse.next();
// // }

// // export const config = {
// //   matcher: ["/dashboard/:path*", "/login", "/signup"],
// // };


// import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify }                 from "jose";

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// // Role-based route map
// const ROLE_ROUTES: Record<string, string[]> = {
//   super_admin: ["/dashboard/admin", "/dashboard/seller", "/dashboard/user", "/dashboard"],
//   admin:       ["/dashboard/admin", "/dashboard/seller", "/dashboard/user", "/dashboard"],
//   seller:      ["/dashboard/seller", "/dashboard/user", "/dashboard"],
//   user:        ["/dashboard/user", "/dashboard"],
// };

// const PROTECTED = ["/dashboard", "/profile", "/chat", "/checkout", "/orders"];
// const AUTH_ONLY = ["/login", "/signup"];    // redirect logged-in users away

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const token        = req.cookies.get("auth_token")?.value;

//   const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
//   const isAuthPage  = AUTH_ONLY.some((p)  => pathname.startsWith(p));

//   // ── Not a protected or auth route — skip ──────────────────────────────
//   if (!isProtected && !isAuthPage) return NextResponse.next();

//   // ── No token ──────────────────────────────────────────────────────────
//   if (!token) {
//     if (isProtected) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/login";
//       url.searchParams.set("redirect", pathname);
//       return NextResponse.redirect(url);
//     }
//     return NextResponse.next();
//   }

//   // ── Verify JWT ────────────────────────────────────────────────────────
//   try {
//     const { payload } = await jwtVerify(token, JWT_SECRET);
//     const role        = payload.role as string;

//     // Redirect logged-in users away from login/signup
//     if (isAuthPage) {
//       const url      = req.nextUrl.clone();
//       const allowed  = ROLE_ROUTES[role] || ["/"];
//       url.pathname   = allowed[0];
//       return NextResponse.redirect(url);
//     }

//     // ── Dashboard role guard ──────────────────────────────────────────
//     if (pathname.startsWith("/dashboard")) {

//       // /dashboard/admin — only admin & super_admin
//       if (pathname.startsWith("/dashboard/admin") &&
//           !["admin", "super_admin"].includes(role)) {
//         const url = req.nextUrl.clone();
//         url.pathname = ROLE_ROUTES[role]?.[0] || "/";
//         return NextResponse.redirect(url);
//       }

//       // /dashboard/seller — only seller/admin/super_admin
//       if (pathname.startsWith("/dashboard/seller") &&
//           !["seller", "admin", "super_admin"].includes(role)) {
//         const url = req.nextUrl.clone();
//         url.pathname = "/dashboard/user";
//         return NextResponse.redirect(url);
//       }

//       // /dashboard with no sub-path → redirect to role dashboard
//       if (pathname === "/dashboard") {
//         const url    = req.nextUrl.clone();
//         const routes = ROLE_ROUTES[role];
//         url.pathname = routes?.[0] || "/";
//         return NextResponse.redirect(url);
//       }
//     }

//     return NextResponse.next();

//   } catch {
//     // Token invalid/expired → clear and redirect to login
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     const res = NextResponse.redirect(url);
//     res.cookies.delete("auth_token");
//     return res;
//   }
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/profile/:path*",
//     "/chat/:path*",
//     "/checkout/:path*",
//     "/orders/:path*",
//     "/login",
//     "/signup",
//   ],
// };


import { NextRequest, NextResponse } from "next/server";
import { jwtVerify }                 from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Where each role lands after login / when they hit a forbidden route
const ROLE_HOME: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin:       "/dashboard/admin",
  seller:      "/dashboard/seller",
  user:        "/dashboard/user",
};

// Routes that require a valid JWT
const PROTECTED = [
  "/dashboard",
  "/profile",
  "/chat",
  "/checkout",
  "/orders",
];

// Routes that logged-in users should be bounced away from
const AUTH_ONLY = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_ONLY.some((p)  => pathname.startsWith(p));

  if (!isProtected && !isAuthPage) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;

  // ── No token ─────────────────────────────────────────────────────────────
  if (!token) {
    if (isProtected) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      // IMPORTANT: always use "redirect" (not "from") — matches login page
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Verify JWT ────────────────────────────────────────────────────────────
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role        = (payload.role as string) || "user";
    const home        = ROLE_HOME[role] || "/dashboard/user";

    // Logged-in users hitting /login or /signup → send to their dashboard
    if (isAuthPage) {
      // Honor an explicit redirect param so they land where they intended
      const intended = req.nextUrl.searchParams.get("redirect");
      const dest     = intended && intended.startsWith("/") ? intended : home;
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // ── Dashboard role guards ─────────────────────────────────────────────
    if (pathname.startsWith("/dashboard")) {

      // /dashboard (bare) → redirect to role home
      if (pathname === "/dashboard") {
        return NextResponse.redirect(new URL(home, req.url));
      }

      // /dashboard/admin → admin / super_admin only
      if (
        pathname.startsWith("/dashboard/admin") &&
        !["admin", "super_admin"].includes(role)
      ) {
        return NextResponse.redirect(new URL(home, req.url));
      }

      // /dashboard/seller → seller / admin / super_admin only
      if (
        pathname.startsWith("/dashboard/seller") &&
        !["seller", "admin", "super_admin"].includes(role)
      ) {
        return NextResponse.redirect(new URL(home, req.url));
      }

      // /dashboard/user is accessible to all authenticated roles
    }

    return NextResponse.next();

  } catch {
    // Token invalid / expired → clear cookie and redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete("auth_token");
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/login",
    "/signup",
  ],
};