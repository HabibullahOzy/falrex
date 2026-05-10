"use client";

import { useMemo, useState } from "react";
import styles from "./dash.module.css";
import Link from "next/link";

type Period = "7d" | "30d" | "90d";
type Channel = "All" | "Organic" | "Ads" | "Social" | "Email";
type OrderStatus = "New" | "Processing" | "Shipped" | "Delivered" | "Returned";

type DailyPerformance = {
  label: string;
  orders: number;
  handled: number;
  visitors: number;
  revenue: number;
};

type Order = {
  id: string;
  customer: string;
  channel: Exclude<Channel, "All">;
  status: OrderStatus;
  total: number;
  items: number;
  handler: string;
  eta: string;
};

const periodLabels: Record<Period, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days"
};

const dailyData: Record<Period, DailyPerformance[]> = {
  "7d": [
    { label: "Thu", orders: 48, handled: 32, visitors: 100, revenue: 800 },
    { label: "Fri", orders: 76, handled: 64, visitors: 60, revenue: 400 },
    { label: "Sat", orders: 12, handled: 89, visitors: 20, revenue: 100 },
    { label: "Sun", orders: 98, handled: 78, visitors: 40, revenue: 400 },
    { label: "Mon", orders: 24, handled: 57, visitors: 80, revenue: 200 },
    { label: "Tue", orders: 38, handled: 19, visitors: 20, revenue: 800 },
    { label: "Wed", orders: 51, handled: 32, visitors: 60, revenue: 600 }
  ],
  "30d": [
    { label: "W1", orders: 60, handled: 92, visitors: 800, revenue: 4200 },
    { label: "W2", orders: 128, handled: 244, visitors: 200, revenue: 4400 },
    { label: "W3", orders: 216, handled: 138, visitors: 100, revenue: 7600 },
    { label: "W4", orders: 334, handled: 242, visitors: 300, revenue: 9100 }
  ],
  "90d": [
    { label: "Jan", orders: 820, handled: 540, visitors: 6000, revenue: 8000 },
    { label: "Feb", orders: 210, handled: 958, visitors: 8000, revenue: 4000 },
    { label: "Mar", orders: 680, handled: 384, visitors: 1500, revenue: 9000 },
    { label: "Apr", orders: 120, handled: 826, visitors: 4200, revenue: 8000 }
  ]
};

const orders: Order[] = [
  {
    id: "#ORD-9042",
    customer: "Northstar Office",
    channel: "Organic",
    status: "Processing",
    total: 280,
    items: 18,
    handler: "A. Rahman",
    eta: "Today"
  },
  {
    id: "#ORD-9041",
    customer: "Kite Retail Group",
    channel: "Ads",
    status: "New",
    total: 860,
    items: 7,
    handler: "M. Chen",
    eta: "Today"
  },
  {
    id: "#ORD-9038",
    customer: "OrbitPay",
    channel: "Email",
    status: "Shipped",
    total: 560,
    items: 13,
    handler: "S. Karim",
    eta: "Tomorrow"
  },
  {
    id: "#ORD-9036",
    customer: "Luma Clinics",
    channel: "Social",
    status: "Delivered",
    total: 40,
    items: 3,
    handler: "N. Patel",
    eta: "Closed"
  },
  {
    id: "#ORD-9032",
    customer: "Meridian Foods",
    channel: "Organic",
    status: "Returned",
    total: 120,
    items: 5,
    handler: "J. Walker",
    eta: "Review"
  },
  {
    id: "#ORD-9028",
    customer: "Atlas Supply",
    channel: "Ads",
    status: "Processing",
    total: 280,
    items: 9,
    handler: "A. Rahman",
    eta: "Tomorrow"
  }
];

const statusSummary = [
  { label: "New", value: 84, color: "#2563eb" },
  { label: "Processing", value: 26, color: "#0f766e" },
  { label: "Shipped", value: 18, color: "#7c3aed" },
  { label: "Delivered", value: 186, color: "#16a34a" },
  { label: "Returned", value: 4, color: "#dc2626" }
];

const visitorSources = [
  { label: "Organic", visitors: 200, conversion: 4.8 },
  { label: "Ads", visitors: 3200, conversion: 5.4 },
  { label: "Social", visitors: 2900, conversion: 3.2 },
  { label: "Email", visitors: 1600, conversion: 7.1 }
];

function compactCurrency(value: number) {
  return new Intl.NumberFormat("bd", {
    style: "currency",
    currency: "BDT",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function createLinePath(values: number[], width = 560, height = 190) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 24) - 12;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function trend(current: number, previous: number) {
  return ((current - previous) / previous) * 100;
}

export default function BusinessDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [period, setPeriod] = useState<Period>("7d");
  const [channel, setChannel] = useState<Channel>("All");
  const [minimumOrders, setMinimumOrders] = useState(150);

  const data = dailyData[period];
  const visibleDays = useMemo(
    () => data.filter((day) => day.orders >= minimumOrders),
    [data, minimumOrders]
  );
  const chartData = visibleDays.length > 0 ? visibleDays : data;
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => channel === "All" || order.channel === channel),
    [channel]
  );

  const totals = useMemo(() => {
    const source = chartData;
    const totalOrders = source.reduce((sum, point) => sum + point.orders, 0);
    const handledOrders = source.reduce((sum, point) => sum + point.handled, 0);
    const visitors = source.reduce((sum, point) => sum + point.visitors, 0);
    const revenue = source.reduce((sum, point) => sum + point.revenue, 0);
    const conversion = (totalOrders / visitors) * 100;
    const handleRate = (handledOrders / totalOrders) * 100;

    return {
      totalOrders,
      handledOrders,
      visitors,
      revenue,
      conversion,
      handleRate,
      orderTrend: trend(source[source.length - 1].orders, source[0].orders)
    };
  }, [chartData]);

  const orderPath = createLinePath(chartData.map((point) => point.orders));
  const handledPath = createLinePath(chartData.map((point) => point.handled));
  const maxStatus = Math.max(...statusSummary.map((item) => item.value));

  return (
    <main className={`${styles.dashboardShell} w-10/12 mx-auto`}>
      <button
        className={styles.sidebarToggle}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="dashboard-sidebar"
      >
        {isOpen ? "Hide" : "Show"}
      </button>

      <aside
        id="dashboard-sidebar"
        className={`${styles.sidebar} ${isOpen ? styles.show : styles.hide}`}
        aria-label="Main navigation"
      >
        <div className={styles.brand}>
          <span className={styles.brandMark}>OA</span>
          <span>
            <strong>OrderDesk</strong>
            <small>Operations analysis</small>
          </span>
        </div>

        <nav className={`${styles.navList} text-xl`}>
          {/* {["Overview", "Orders", "Visitors", "Handling", "Reports"].map(
            (item, index) => (
              <a
                className={index === 0 ? styles.active : ""}
                href="#"
                key={item}
              >
                <span aria-hidden="true">
                  {["OV", "OR", "VI", "HD", "RP"][index]}
                </span>
                {item}
              </a>
            )
          )} */}
          <Link href={'/dashboard/admindashboard/creatproduct'} className="text-lg">Add Product</Link>
          <Link href={'/dashboard/admindashboard/adminactionproduct'} className="text-lg">All Products</Link>
          <Link href={'/dashboard/admindashboard/categorycreat'} className="text-lg">Create Category</Link>
          <Link href={'/dashboard/admindashboard/allusers'} className="text-lg">All Users</Link>
        </nav>

        <div className={`${styles.sidebarControls} w-full`}>
          <label>
            <span>Show channel</span>
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as Channel)}
            >
              {["All", "Organic", "Ads", "Social", "Email"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Show days above</span>
            <strong>{minimumOrders} orders</strong>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={minimumOrders}
              onChange={(event) => setMinimumOrders(Number(event.target.value))}
            />
          </label>
        </div>

        <div className={styles.sidebarNote}>
          <span>Order handle rate</span>
          <strong>{totals.handleRate.toFixed(1)}%</strong>
          <div className={styles.miniMeter}>
            <span style={{ width: `${totals.handleRate}%` }} />
          </div>
        </div>
      </aside>

      <section
        className={`${styles.dashboardBody} ${
          isOpen ? styles.bodyWithSidebar : styles.bodyFull
        }`}
      >
        <header className={styles.dashboardHeader}>
          <div>
            <p className={styles.eyebrow}>Operations dashboard</p>
            <h1>Order handling and visitor analysis</h1>
            <p className={styles.headerCopy}>
              Track daily orders, fulfillment handling, web visitors, and order
              summary status from one professional dashboard body.
            </p>
          </div>

          <div className={styles.toolbar} aria-label="Dashboard filters">
            <label>
              <span>Period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
              >
                {Object.entries(periodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section
          className={styles.kpiGrid}
          aria-label="Key performance indicators"
        >
          <MetricCard
            label="Total orders"
            value={numberFormat(totals.totalOrders)}
            detail={`${totals.orderTrend.toFixed(1)}% order trend`}
            status="positive"
          />
          <MetricCard
            label="Order handled"
            value={numberFormat(totals.handledOrders)}
            detail={`${totals.handleRate.toFixed(1)}% handled rate`}
            status="positive"
          />
          <MetricCard
            label="Web visitors"
            value={numberFormat(totals.visitors)}
            detail={`${totals.conversion.toFixed(2)}% order conversion`}
            status="neutral"
          />
          <MetricCard
            label="Order revenue"
            value={compactCurrency(totals.revenue)}
            detail={`${filteredOrders.length} live order records`}
            status="positive"
          />
        </section>

        <section className={styles.analysisGrid}>
          <article className={`${styles.panel} ${styles.revenuePanel}`}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Analysis per day</p>
                <h2>Orders vs handled</h2>
              </div>
              <div className={styles.legend}>
                <span>
                  <i className={styles.actual} /> Orders
                </span>
                <span>
                  <i className={styles.target} /> Handled
                </span>
              </div>
            </div>

            <svg className={styles.lineChart} viewBox="0 0 560 230" role="img">
              <title>Daily order analysis chart</title>
              <path className={styles.gridLine} d="M0 40 H560" />
              <path className={styles.gridLine} d="M0 100 H560" />
              <path className={styles.gridLine} d="M0 160 H560" />
              <path className={styles.targetLine} d={handledPath} />
              <path className={styles.actualLine} d={orderPath} />
              {chartData.map((point, index) => {
                const x = (index / Math.max(chartData.length - 1, 1)) * 560;
                return (
                  <text key={point.label} x={x} y="224" textAnchor="middle">
                    {point.label}
                  </text>
                );
              })}
            </svg>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Order summary</p>
                <h2>Status distribution</h2>
              </div>
            </div>

            <div className={styles.segmentList}>
              {statusSummary.map((item) => (
                <div className={styles.segmentRow} key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{numberFormat(item.value)} orders</span>
                  </div>
                  <div className={styles.segmentTrack}>
                    <span
                      style={{
                        width: `${(item.value / maxStatus) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                  <em>{Math.round((item.value / maxStatus) * 100)}%</em>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.lowerGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Web visitor</p>
                <h2>Source performance</h2>
              </div>
            </div>

            <div className={styles.funnel}>
              {visitorSources.map((item) => (
                <div className={styles.funnelRow} key={item.label}>
                  <span>{item.label}</span>
                  <div>
                    <b style={{ width: `${item.conversion * 12}%` }} />
                  </div>
                  <strong>{numberFormat(item.visitors)}</strong>
                  <em>{item.conversion}%</em>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.panel} ${styles.opportunitiesPanel}`}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Order handle</p>
                <h2>Recent order queue</h2>
              </div>
              <span className={styles.panelBadge}>
                {channel === "All" ? "All channels" : channel}
              </span>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Handler</th>
                    <th>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                        <span>
                          {order.customer} - {order.channel}
                        </span>
                      </td>
                      <td>
                        <span className={styles.probability}>{order.status}</span>
                      </td>
                      <td>{compactCurrency(order.total)}</td>
                      <td>{order.items}</td>
                      <td>{order.handler}</td>
                      <td>{order.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  status
}: {
  label: string;
  value: string;
  detail: string;
  status: "positive" | "neutral";
}) {
  return (
    <article className={styles.metricCard}>
      <span className={`${styles.metricDot} ${styles[status]}`} />
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
