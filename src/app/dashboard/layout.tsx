

export default function Dashlayout({children}) {
    return (
        <div>{children}
        </div>
    );
}



// import { cookies } from "next/headers";
// import * as jose from "jose";
// import { redirect } from "next/navigation";
// import DashboardShell from "./DashboardShell";

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// async function getUser() {
//   const cookieStore = cookies();
//   const token = cookieStore.get("auth_token")?.value;
//   if (!token) return null;
//   try {
//     const { payload } = await jose.jwtVerify(token, JWT_SECRET);
//     return payload as any;
//   } catch { return null; }
// }

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const user = await getUser();
//   if (!user) redirect("/login");

//   return <DashboardShell user={user}>{children}</DashboardShell>;
// }