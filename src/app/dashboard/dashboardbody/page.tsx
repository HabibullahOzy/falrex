"use client";

import { useMemo, useState } from "react";
import styles from "../dashboardbody/DashboardBody.module.css";

/* ── Types ── */
type Period  = "7d" | "30d" | "90d";
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

/* ── Static data ── */
const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

const DAILY_DATA: Record<Period, DailyPerformance[]> = {
  "7d": [
    { label: "Thu", orders: 48,  handled: 32,  visitors: 100,  revenue: 800  },
    { label: "Fri", orders: 76,  handled: 64,  visitors: 60,   revenue: 400  },
    { label: "Sat", orders: 12,  handled: 89,  visitors: 20,   revenue: 100  },
    { label: "Sun", orders: 98,  handled: 78,  visitors: 40,   revenue: 400  },
    { label: "Mon", orders: 24,  handled: 57,  visitors: 80,   revenue: 200  },
    { label: "Tue", orders: 38,  handled: 19,  visitors: 20,   revenue: 800  },
    { label: "Wed", orders: 51,  handled: 32,  visitors: 60,   revenue: 600  },
  ],
  "30d": [
    { label: "W1", orders: 60,  handled: 92,  visitors: 800,  revenue: 4200 },
    { label: "W2", orders: 128, handled: 244, visitors: 200,  revenue: 4400 },
    { label: "W3", orders: 216, handled: 138, visitors: 100,  revenue: 7600 },
    { label: "W4", orders: 334, handled: 242, visitors: 300,  revenue: 9100 },
  ],
  "90d": [
    { label: "Jan", orders: 820, handled: 540, visitors: 6000, revenue: 8000 },
    { label: "Feb", orders: 210, handled: 958, visitors: 8000, revenue: 4000 },
    { label: "Mar", orders: 680, handled: 384, visitors: 1500, revenue: 9000 },
    { label: "Apr", orders: 120, handled: 826, visitors: 4200, revenue: 8000 },
  ],
};

const ORDERS: Order[] = [
  { id: "#ORD-9042", customer: "Northstar Office",   channel: "Organic", status: "Processing", total: 280, items: 18, handler: "A. Rahman", eta: "Today"    },
  { id: "#ORD-9041", customer: "Kite Retail Group",  channel: "Ads",     status: "New",        total: 860, items: 7,  handler: "M. Chen",   eta: "Today"    },
  { id: "#ORD-9038", customer: "OrbitPay",            channel: "Email",   status: "Shipped",    total: 560, items: 13, handler: "S. Karim",  eta: "Tomorrow" },
  { id: "#ORD-9036", customer: "Luma Clinics",        channel: "Social",  status: "Delivered",  total: 40,  items: 3,  handler: "N. Patel",  eta: "Closed"   },
  { id: "#ORD-9032", customer: "Meridian Foods",      channel: "Organic", status: "Returned",   total: 120, items: 5,  handler: "J. Walker", eta: "Review"   },
  { id: "#ORD-9028", customer: "Atlas Supply",        channel: "Ads",     status: "Processing", total: 280, items: 9,  handler: "A. Rahman", eta: "Tomorrow" },
];

const STATUS_SUMMARY = [
  { label: "Delivered",   value: 186, color: "#22c55e" },
  { label: "New",         value: 84,  color: "#4f8ef7" },
  { label: "Processing",  value: 26,  color: "#f59e0b" },
  { label: "Shipped",     value: 18,  color: "#a78bfa" },
  { label: "Returned",    value: 4,   color: "#f87171" },
];

const VISITOR_SOURCES = [
  { label: "Organic", visitors: 200,  conversion: 4.8 },
  { label: "Ads",     visitors: 3200, conversion: 5.4 },
  { label: "Social",  visitors: 2900, conversion: 3.2 },
  { label: "Email",   visitors: 1600, conversion: 7.1 },
];

/* ── Helpers ── */
function currency(v: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "BDT",
    notation: "compact", maximumFractionDigits: 1,
  }).format(v);
}
function numFmt(v: number) { return new Intl.NumberFormat("en-US").format(v); }

function linePath(values: number[], w = 540, h = 160) {
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  return values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w;
    const y = h - ((v - min) / range) * (h - 24) - 12;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}
function trendPct(cur: number, prev: number) {
  return ((cur - prev) / prev) * 100;
}

/* ── Status pill color ── */
const STATUS_COLOR: Record<OrderStatus, string> = {
  New:        styles.statusNew,
  Processing: styles.statusProcessing,
  Shipped:    styles.statusShipped,
  Delivered:  styles.statusDelivered,
  Returned:   styles.statusReturned,
};

/* ── Sub-components ── */
function KpiCard({ label, value, detail, trend }: { label: string; value: string; detail: string; trend: "up" | "down" | "neutral" }) {
  return (
    <article className={styles.kpiCard}>
      <p className={styles.kpiLabel}>{label}</p>
      <strong className={styles.kpiValue}>{value}</strong>
      <span className={`${styles.kpiDetail} ${styles["trend_" + trend]}`}>{detail}</span>
    </article>
  );
}

/* ── Main export ── */
type Props = {
  channel: Channel;
  onChannelChange: (c: Channel) => void;
  minimumOrders: number;
  onMinimumOrdersChange: (v: number) => void;
};

export default function DashboardBody({
  channel, onChannelChange,
  minimumOrders, onMinimumOrdersChange,
}: Props) {
  const [period, setPeriod] = useState<Period>("7d");

  const data = DAILY_DATA[period];
  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.orders >= minimumOrders);
    return filtered.length > 0 ? filtered : data;
  }, [data, minimumOrders]);

  const filteredOrders = useMemo(
    () => ORDERS.filter((o) => channel === "All" || o.channel === channel),
    [channel],
  );

  const totals = useMemo(() => {
    const totalOrders  = chartData.reduce((s, d) => s + d.orders, 0);
    const handledOrders= chartData.reduce((s, d) => s + d.handled, 0);
    const visitors     = chartData.reduce((s, d) => s + d.visitors, 0);
    const revenue      = chartData.reduce((s, d) => s + d.revenue, 0);
    return {
      totalOrders, handledOrders, visitors, revenue,
      conversion:  (totalOrders / visitors) * 100,
      handleRate:  (handledOrders / totalOrders) * 100,
      orderTrend:  trendPct(chartData.at(-1)!.orders, chartData[0].orders),
    };
  }, [chartData]);

  const orderPath   = linePath(chartData.map((d) => d.orders));
  const handledPath = linePath(chartData.map((d) => d.handled));
  const maxStatus   = Math.max(...STATUS_SUMMARY.map((s) => s.value));

  return (
    <div className={styles.body}>
      {/* ── Top bar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <p className={styles.eyebrow}>Operations dashboard</p>
          <h1 className={styles.pageTitle}>Order &amp; Visitor Overview</h1>
        </div>

        <div className={styles.topbarControls}>
          {/* Channel filter */}
          <label className={styles.controlLabel}>
            <span>Channel</span>
            <select
              value={channel}
              onChange={(e) => onChannelChange(e.target.value as Channel)}
              className={styles.select}
            >
              {(["All","Organic","Ads","Social","Email"] as Channel[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Period filter */}
          <label className={styles.controlLabel}>
            <span>Period</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className={styles.select}
            >
              {Object.entries(PERIOD_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {/* ── KPIs ── */}
      <section className={styles.kpiGrid} aria-label="Key performance indicators">
        <KpiCard
          label="Total orders"
          value={numFmt(totals.totalOrders)}
          detail={`${totals.orderTrend > 0 ? "↑" : "↓"} ${Math.abs(totals.orderTrend).toFixed(1)}% trend`}
          trend={totals.orderTrend >= 0 ? "up" : "down"}
        />
        <KpiCard
          label="Handled"
          value={numFmt(totals.handledOrders)}
          detail={`${totals.handleRate.toFixed(1)}% handle rate`}
          trend="up"
        />
        <KpiCard
          label="Visitors"
          value={numFmt(totals.visitors)}
          detail={`${totals.conversion.toFixed(2)}% conversion`}
          trend="neutral"
        />
        <KpiCard
          label="Revenue"
          value={currency(totals.revenue)}
          detail={`${filteredOrders.length} live orders`}
          trend="up"
        />
      </section>

      {/* ── Analysis row ── */}
      <section className={styles.analysisGrid}>
        {/* Line chart */}
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>Daily analysis</p>
              <h2>Orders vs handled</h2>
            </div>
            <div className={styles.legend}>
              <span><i className={styles.dotBlue} />Orders</span>
              <span><i className={styles.dotPurple} />Handled</span>
            </div>
          </div>

          <svg className={styles.chart} viewBox="0 0 540 190" role="img" aria-label="Orders vs handled chart">
            <title>Daily orders vs handled chart</title>
            <path className={styles.gridLine} d="M0 38 H540" />
            <path className={styles.gridLine} d="M0 95 H540" />
            <path className={styles.gridLine} d="M0 152 H540" />
            <path className={styles.handledLine} d={handledPath} />
            <path className={styles.ordersLine}  d={orderPath}  />
            {chartData.map((pt, i) => {
              const x = (i / Math.max(chartData.length - 1, 1)) * 540;
              return (
                <text key={pt.label} x={x} y="185" textAnchor="middle" className={styles.chartLabel}>
                  {pt.label}
                </text>
              );
            })}
          </svg>
        </article>

        {/* Status distribution */}
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>Order summary</p>
              <h2>Status distribution</h2>
            </div>
          </div>

          <div className={styles.segments}>
            {STATUS_SUMMARY.map((s) => (
              <div key={s.label} className={styles.segRow}>
                <div className={styles.segMeta}>
                  <strong>{s.label}</strong>
                  <span>{numFmt(s.value)}</span>
                </div>
                <div className={styles.segTrack}>
                  <span
                    className={styles.segFill}
                    style={{ width: `${(s.value / maxStatus) * 100}%`, background: s.color }}
                  />
                </div>
                <em className={styles.segPct}>{Math.round((s.value / maxStatus) * 100)}%</em>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ── Lower row ── */}
      <section className={styles.lowerGrid}>
        {/* Visitor funnel */}
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>Web visitors</p>
              <h2>Source performance</h2>
            </div>
          </div>

          <div className={styles.funnel}>
            {VISITOR_SOURCES.map((src) => (
              <div key={src.label} className={styles.funnelRow}>
                <span className={styles.funnelLabel}>{src.label}</span>
                <div className={styles.funnelTrack}>
                  <span className={styles.funnelFill} style={{ width: `${src.conversion * 12}%` }} />
                </div>
                <span className={styles.funnelNum}>{numFmt(src.visitors)}</span>
                <span className={styles.funnelRate}>{src.conversion}%</span>
              </div>
            ))}
          </div>
        </article>

        {/* Order queue */}
        <article className={`${styles.panel} ${styles.panelWide}`}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>Order handle</p>
              <h2>Recent order queue</h2>
            </div>
            <span className={styles.badge}>
              {channel === "All" ? "All channels" : channel}
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Handler</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong className={styles.orderId}>{o.id}</strong>
                      <span className={styles.orderSub}>{o.customer} · {o.channel}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className={styles.num}>{o.items}</td>
                    <td className={styles.handler}>{o.handler}</td>
                    <td className={styles.eta}>{o.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* ── Min-orders slider ── */}
      <div className={styles.sliderBar}>
        <label className={styles.sliderLabel}>
          <span>Show days with ≥ <strong>{minimumOrders}</strong> orders</span>
          <input
            type="range" min={0} max={500} step={10}
            value={minimumOrders}
            onChange={(e) => onMinimumOrdersChange(Number(e.target.value))}
            className={styles.slider}
          />
        </label>
      </div>
    </div>
  );
}



// import Link from "next/link";

// export default function Dashbody() {
//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Example Card */}
//             <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 gap-4">
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/shirt'}>Shirt</Link>
//                 {/* <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/pant'}>Pant</Link> */}
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/captryon'}>Cap</Link>
            
            
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/sunglasstryon'}>sunglass</Link>
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/neclesstryon'}>Necless</Link>
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/noseringtryon'}>NoseRing</Link>
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/earRingtry'}>EarRing</Link>
//                 <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/crowntryon'}>Crown</Link>
//             </div>

//             {/* Add more cards as needed */}
//         </div>
//     </div>
//     );
// }