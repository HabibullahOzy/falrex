"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsBrowserSafari } from "react-icons/bs";
import { FaFilterCircleDollar } from "react-icons/fa6";
import React from "react";


export default function Navebar() {
    const pathName = usePathname()
    console.log(pathName)
    if (!pathName.includes('dashboard') && !pathName.includes('blog') && !pathName.includes('tryonvertually') && !pathName.includes('socialCommunication')) {
        return (
            <nav className="w-full h-16 flex items-center px-4 navbg">
                <div className="navbar">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                                <li><Link href={'/dashboard/dashboardbody/'}>try on</Link></li>
                                {/* <li>
                                    <a>Parent</a>
                                    <ul className="p-2">
                                        <li><a>Submenu 1</a></li>
                                        <li><a>Submenu 2</a></li>
                                    </ul>
                                </li> */}
                                <li><Link href={'/dashboard/admindashboard/creatproduct'}>Add product</Link></li>
                            </ul>
                        </div>

                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal z-10 px-1">
                            <li><Link href={'/dashboard/dashboardbody/'}>try on</Link></li>
                            {/* <li>
                                <details>
                                    <summary>Parent</summary>
                                    <ul className="p-2">
                                        <li><Link href={'/component/blog'}>Blog</Link></li>
                                        <li><a>Submenu 2</a></li>
                                    </ul>
                                </details>
                            </li> */}
                            {/* <li><Link href={'/dashboard/admindashboard/creatproduct'}>Add product</Link></li> */}
                        </ul>
                    </div>
                    <div className="navbar-end mr-15 gap-5">
                        <Link
                            href="/products/filterproducts"
                            className="rounded-full buttonbg bg-blue-600 px-5 py-2 text-xl font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <FaFilterCircleDollar />
                        </Link>
                        <Link
                            href="/component/socialCommunication/social"
                            className="rounded-full buttonbg bg-blue-600 px-5 py-2 text-xl font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <BsBrowserSafari />
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }
    else {
        <></>
    }

}