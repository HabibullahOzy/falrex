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



// import { cookies } from "next/headers";
// import * as jose from "jose";
// import { redirect } from "next/navigation";
// import DashboardShell from "./DashboardShell";
// // Add this line forces dynamic rendering for the whole dashboard
// export const dynamic = "force-dynamic";

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
// console.log(JWT_SECRET)

// async function getUser() {
//   const cookieStore = await cookies();
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


// app/dashboard/layout.tsx  (Server Component)
// import { cookies } from "next/headers";
// import { jwtVerify } from "jose";
// import { redirect } from "next/navigation";
// import DashboardShell from "./DashboardShell";

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// export default async function Dashlayout({ children }: { children: React.ReactNode }) {
//   const token = cookies().get("auth_token")?.value;

//   if (!token) redirect("/login");

//   try {
//     const { payload } = await jwtVerify(token, JWT_SECRET);
//     const role = payload.role as string;

//     return (
//       <div>
//         <DashboardShell role={role} uid={payload.uid as string}>
//           {children}
//         </DashboardShell>
//       </div>
//     );
//   } catch {
//     redirect("/login");
//   }
// }