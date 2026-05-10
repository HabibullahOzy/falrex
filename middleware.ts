import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Route access rules
const ROUTE_RULES = [
  { path: "/dashboard/admin",  roles: ["admin", "super_admin"] },
  { path: "/dashboard/seller", roles: ["seller", "admin", "super_admin"] },
  { path: "/dashboard",        roles: ["user", "seller", "admin", "super_admin"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  let payload: any = null;
  if (token) {
    try {
      const { payload: p } = await jose.jwtVerify(token, JWT_SECRET);
      payload = p;
    } catch {}
  }

  // Not logged in → redirect to login
  if (pathname.startsWith("/dashboard") && !payload) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access
  for (const rule of ROUTE_RULES) {
    if (pathname.startsWith(rule.path)) {
      if (!rule.roles.includes(payload?.role)) {
        // Redirect to their correct dashboard
        const role = payload?.role;
        const dest = role === "seller" ? "/dashboard/seller"
          : role === "user" ? "/dashboard/user"
          : "/login";
        return NextResponse.redirect(new URL(dest, req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};