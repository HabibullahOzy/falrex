const ROLE_HOME: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin:       "/dashboard/admin",
  seller:      "/dashboard/seller",
  user:        "/dashboard/user",
};
 
export function getLoginRedirect(
  searchParams: URLSearchParams | { get(key: string): string | null },
  userRole?: string,
): string {
  const redirectParam = searchParams.get("redirect");
 
  // Only honor the redirect param if it's a relative path (security: no open redirect)
  if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    return redirectParam;
  }
 
  return ROLE_HOME[userRole || "user"] || "/dashboard/user";
}