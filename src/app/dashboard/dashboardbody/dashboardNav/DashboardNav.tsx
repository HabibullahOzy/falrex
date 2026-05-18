"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DashboardNav.module.css";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  group: "main" | "store" | "admin";
};

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "▦", group: "main" },
  { label: "Add Product", href: "/dashboard/admindashboard/creatproduct", icon: "＋", group: "store" },
  { label: "All Products", href: "/dashboard/admindashboard/adminactionproduct", icon: "☰", group: "store" },
  { label: "Create Category", href: "/dashboard/admindashboard/categorycreat/create", icon: "⊕", group: "store" },
  { label: "All Category", href: "/dashboard/admindashboard/categorycreat/categorylist", icon: "⊞", group: "store" },
  { label: "All Users", href: "/dashboard/admindashboard/allusers", icon: "◉", badge: 3, group: "admin" },
  { label: "Admin", href: "/dashboard/admin", icon: "⬡", group: "admin" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Dashboard",
  store: "Store",
  admin: "Admin",
};

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  handleRate: number;
};

export default function DashboardNav({ isOpen, onToggle, handleRate }: Props) {
  const pathname = usePathname();
  const groups = ["main", "store", "admin"] as const;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onToggle} aria-hidden="true" />
      )}

      <aside
        id="dashboard-sidebar"
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link href={'/'}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>PS</span>
            <div className={styles.brandText}>
              <strong>PositiveDesk</strong>
              <small>Operations</small>
            </div>
          </div>
        </Link>

        {/* Nav groups */}
        <nav className={styles.nav} aria-label="Primary navigation">
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
            return (
              <div key={group} className={styles.group}>
                <span className={styles.groupLabel}>{GROUP_LABELS[group]}</span>
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${active ? styles.active : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Handle rate meter */}
        <div className={styles.meter}>
          <div className={styles.meterHeader}>
            <span>Handle rate</span>
            <strong>{handleRate.toFixed(1)}%</strong>
          </div>
          <div className={styles.meterTrack} role="progressbar" aria-valuenow={handleRate} aria-valuemin={0} aria-valuemax={100} aria-label="Order handle rate">
            <div className={styles.meterFill} style={{ width: `${handleRate}%` }} />
          </div>
        </div>

        {/* Profile stub */}
        <div className={styles.profile}>
          <div className={styles.avatar}>AR</div>
          <div className={styles.profileInfo}>
            <strong>A. Rahman</strong>
            <small>Admin</small>
          </div>
          <span className={styles.onlineDot} aria-label="Online" />
        </div>

        {/* Collapse button (desktop) */}
        <button
          className={styles.collapseBtn}
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
          aria-controls="dashboard-sidebar"
        >
          <span className={`${styles.chevron} ${isOpen ? styles.chevronLeft : styles.chevronRight}`}>‹</span>
        </button>
      </aside>
    </>
  );
}
