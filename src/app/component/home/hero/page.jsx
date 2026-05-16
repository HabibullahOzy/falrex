// "use client";

// import { useState, useEffect, useRef } from "react";

// const products = [
//   {
//     id: 1,
//     badge: "HOT DEAL",
//     badgeStyle: { background: "#FFE5E5", color: "#CC2200" },
//     title: "AirPods Pro 3",
//     subtitle: "Active Noise Cancellation · USB-C",
//     price: "$189",
//     oldPrice: "$329",
//     discount: "43% OFF",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26}>
//         <path d="M3 9v6a9 9 0 0 0 18 0V9A9 9 0 0 0 3 9z" />
//         <path d="M8 9h.01M16 9h.01" />
//         <path d="M9 15v2M15 15v2" />
//       </svg>
//     ),
//     accent: "#FF4D4D",
//     accentLight: "#FFF0F0",
//   },
//   {
//     id: 2,
//     badge: "NEW ARRIVAL",
//     badgeStyle: { background: "#E0F7FA", color: "#006064" },
//     title: "Sony Xperia 10 VI",
//     subtitle: "OLED · 5G · 48MP Triple Cam",
//     price: "$549",
//     oldPrice: "$699",
//     discount: "21% OFF",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26}>
//         <rect x="5" y="2" width="14" height="20" rx="3" />
//         <circle cx="12" cy="17" r="1" />
//       </svg>
//     ),
//     accent: "#00BCD4",
//     accentLight: "#E0F7FA",
//   },
//   {
//     id: 3,
//     badge: "BEST SELLER",
//     badgeStyle: { background: "#FFF8E1", color: "#E65100" },
//     title: 'MacBook Air 15"',
//     subtitle: "M3 Chip · 16GB · 512GB SSD",
//     price: "$1,099",
//     oldPrice: "$1,299",
//     discount: "15% OFF",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26}>
//         <rect x="2" y="4" width="20" height="14" rx="2" />
//         <path d="M2 18h20" />
//       </svg>
//     ),
//     accent: "#FF9800",
//     accentLight: "#FFF8E1",
//   },
// ];

// const slides = [
//   {
//     id: 1,
//     tag: "MEGA SALE",
//     headline: "Next-Gen Gadgets at",
//     highlight: "Unreal Prices",
//     sub: "Shop curated tech from the world's top brands — delivered to your door.",
//     cta: "Shop Now",
//     bg: "linear-gradient(135deg, #1a0533 0%, #2d0a6e 40%, #0d1b6e 100%)",
//     accent: "#A78BFA",
//     blob1: "#7C3AED",
//     blob2: "#2563EB",
//     emoji: "🎧",
//     tag2: "Free shipping over $99",
//   },
//   {
//     id: 2,
//     tag: "NEW IN",
//     headline: "Capture Every",
//     highlight: "Moment in 8K",
//     sub: "The latest camera tech — professional results for everyday creators.",
//     cta: "Explore Cameras",
//     bg: "linear-gradient(135deg, #001a33 0%, #003366 40%, #004d66 100%)",
//     accent: "#38BDF8",
//     blob1: "#0284C7",
//     blob2: "#06B6D4",
//     emoji: "📸",
//     tag2: "30-day returns",
//   },
//   {
//     id: 3,
//     tag: "LIMITED OFFER",
//     headline: "Power Through the",
//     highlight: "Whole Day",
//     sub: "Premium laptops, tablets & accessories with all-day battery life.",
//     cta: "See Laptops",
//     bg: "linear-gradient(135deg, #0a2e00 0%, #155201 40%, #1a3a00 100%)",
//     accent: "#86EFAC",
//     blob1: "#16A34A",
//     blob2: "#15803D",
//     emoji: "💻",
//     tag2: "Up to 70% off",
//   },
// ];

// const stats = [
//   { value: "240+", label: "Products" },
//   { value: "18K", label: "Sellers" },
//   { value: "98.6%", label: "Satisfaction" },
// ];

// function ProductCard({ product }) {
//   return (
//     <div
//       style={{
//         background: "#fff",
//         border: "1.5px solid #f0f0f4",
//         borderRadius: 20,
//         padding: "16px 18px",
//         boxShadow: "0 2px 16px 0 rgba(84,9,218,0.06)",
//         transition: "transform 0.18s, box-shadow 0.18s",
//         cursor: "pointer",
//         position: "relative",
//         overflow: "hidden",
//       }}
//       onMouseEnter={e => {
//         e.currentTarget.style.transform = "translateY(-3px)";
//         e.currentTarget.style.boxShadow = "0 8px 28px 0 rgba(84,9,218,0.13)";
//       }}
//       onMouseLeave={e => {
//         e.currentTarget.style.transform = "translateY(0)";
//         e.currentTarget.style.boxShadow = "0 2px 16px 0 rgba(84,9,218,0.06)";
//       }}
//     >
//       <div
//         style={{
//           position: "absolute",
//           top: -18,
//           right: -18,
//           width: 60,
//           height: 60,
//           borderRadius: "50%",
//           background: product.accentLight,
//           opacity: 0.7,
//         }}
//       />
//       <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
//         <div
//           style={{
//             width: 46,
//             height: 46,
//             borderRadius: 14,
//             background: product.accentLight,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             color: product.accent,
//             flexShrink: 0,
//           }}
//         >
//           {product.icon}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
//             <span
//               style={{
//                 fontSize: 9,
//                 fontWeight: 700,
//                 letterSpacing: "0.08em",
//                 padding: "2px 8px",
//                 borderRadius: 999,
//                 ...product.badgeStyle,
//               }}
//             >
//               {product.badge}
//             </span>
//           </div>
//           <div
//             style={{
//               fontWeight: 700,
//               fontSize: 14,
//               color: "#0f0a1e",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//             }}
//           >
//             {product.title}
//           </div>
//           <div
//             style={{
//               fontSize: 11,
//               color: "#888",
//               marginTop: 1,
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//             }}
//           >
//             {product.subtitle}
//           </div>
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginTop: 12,
//         }}
//       >
//         <div>
//           <span style={{ fontWeight: 800, fontSize: 18, color: "#0f0a1e" }}>{product.price}</span>
//           <span
//             style={{
//               fontSize: 12,
//               color: "#aaa",
//               textDecoration: "line-through",
//               marginLeft: 6,
//             }}
//           >
//             {product.oldPrice}
//           </span>
//         </div>
//         <span
//           style={{
//             fontSize: 11,
//             fontWeight: 700,
//             color: product.accent,
//             background: product.accentLight,
//             padding: "3px 9px",
//             borderRadius: 999,
//           }}
//         >
//           {product.discount}
//         </span>
//       </div>
//       <button
//         style={{
//           marginTop: 11,
//           width: "100%",
//           padding: "9px 0",
//           borderRadius: 12,
//           border: "none",
//           background: "#5409DA",
//           color: "#fff",
//           fontWeight: 700,
//           fontSize: 13,
//           cursor: "pointer",
//           letterSpacing: "0.02em",
//           transition: "background 0.15s",
//         }}
//         onMouseEnter={e => (e.currentTarget.style.background = "#4E71FF")}
//         onMouseLeave={e => (e.currentTarget.style.background = "#5409DA")}
//       >
//         Add to Cart
//       </button>
//     </div>
//   );
// }

// function CarouselSlide({ slide }) {
//   return (
//     <div
//       style={{
//         background: slide.bg,
//         borderRadius: 24,
//         padding: "48px 52px",
//         minHeight: 420,
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         position: "relative",
//         overflow: "hidden",
//         height: "100%",
//       }}
//     >
//       {/* Decorative blobs */}
//       <div
//         style={{
//           position: "absolute",
//           top: -60,
//           right: -40,
//           width: 220,
//           height: 220,
//           borderRadius: "50%",
//           background: slide.blob1,
//           opacity: 0.18,
//           filter: "blur(48px)",
//           pointerEvents: "none",
//         }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           bottom: -40,
//           left: 60,
//           width: 160,
//           height: 160,
//           borderRadius: "50%",
//           background: slide.blob2,
//           opacity: 0.15,
//           filter: "blur(36px)",
//           pointerEvents: "none",
//         }}
//       />
//       {/* Big emoji */}
//       <div
//         style={{
//           position: "absolute",
//           right: 48,
//           bottom: 36,
//           fontSize: 110,
//           opacity: 0.13,
//           userSelect: "none",
//           lineHeight: 1,
//           pointerEvents: "none",
//         }}
//       >
//         {slide.emoji}
//       </div>
//       {/* Content */}
//       <div style={{ position: "relative", zIndex: 2 }}>
//         <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
//           <span
//             style={{
//               display: "inline-block",
//               background: slide.accent + "28",
//               color: slide.accent,
//               fontSize: 11,
//               fontWeight: 700,
//               letterSpacing: "0.12em",
//               padding: "5px 14px",
//               borderRadius: 999,
//               border: `1px solid ${slide.accent}55`,
//             }}
//           >
//             ● {slide.tag}
//           </span>
//           <span
//             style={{
//               display: "inline-block",
//               background: "rgba(255,255,255,0.08)",
//               color: "rgba(255,255,255,0.7)",
//               fontSize: 11,
//               fontWeight: 500,
//               letterSpacing: "0.05em",
//               padding: "5px 14px",
//               borderRadius: 999,
//               border: "1px solid rgba(255,255,255,0.15)",
//             }}
//           >
//             {slide.tag2}
//           </span>
//         </div>
//         <h1
//           style={{
//             fontSize: "clamp(28px, 4vw, 52px)",
//             fontWeight: 900,
//             color: "#fff",
//             lineHeight: 1.1,
//             margin: 0,
//             letterSpacing: "-0.02em",
//           }}
//         >
//           {slide.headline}
//           <br />
//           <span style={{ color: slide.accent }}>{slide.highlight}</span>
//         </h1>
//         <p
//           style={{
//             marginTop: 16,
//             fontSize: 15,
//             color: "rgba(255,255,255,0.62)",
//             maxWidth: 420,
//             lineHeight: 1.6,
//           }}
//         >
//           {slide.sub}
//         </p>
//         <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
//           <button
//             style={{
//               padding: "13px 30px",
//               borderRadius: 14,
//               border: "none",
//               background: slide.accent,
//               color: "#0f0a1e",
//               fontWeight: 800,
//               fontSize: 14,
//               cursor: "pointer",
//               letterSpacing: "0.01em",
//               transition: "opacity 0.15s",
//             }}
//             onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
//             onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
//           >
//             {slide.cta} →
//           </button>
//           <button
//             style={{
//               padding: "13px 24px",
//               borderRadius: 14,
//               border: "1.5px solid rgba(255,255,255,0.22)",
//               background: "rgba(255,255,255,0.07)",
//               color: "#fff",
//               fontWeight: 600,
//               fontSize: 14,
//               cursor: "pointer",
//               transition: "background 0.15s",
//             }}
//             onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
//             onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
//           >
//             Learn More
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function HeroSection() {
//   const [activeSlide, setActiveSlide] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const timerRef = useRef(null);

//   const goTo = idx => {
//     if (isAnimating) return;
//     setIsAnimating(true);
//     setActiveSlide(idx);
//     setTimeout(() => setIsAnimating(false), 400);
//   };

//   const next = () => goTo((activeSlide + 1) % slides.length);
//   const prev = () => goTo((activeSlide - 1 + slides.length) % slides.length);

//   useEffect(() => {
//     timerRef.current = setInterval(next, 5000);
//     return () => clearInterval(timerRef.current);
//   }, [activeSlide]);

//   return (
//     <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "20px 16px", maxWidth: 1400, margin: "0 auto" }}>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "minmax(0,1fr)",
//           gap: 14,
//           alignItems: "stretch",
//         }}
//         className="hero-grid"
//       >
//         {/* LEFT PANEL */}
//         <div
//           style={{
//             background: "#fff",
//             borderRadius: 24,
//             border: "1.5px solid #ede8ff",
//             padding: "28px 24px",
//             boxShadow: "0 2px 20px rgba(84,9,218,0.07)",
//             position: "relative",
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "space-between",
//             minHeight: 280,
//           }}
//           className="left-panel"
//         >
//           {/* Background blobs */}
//           <div style={{ position: "absolute", top: -36, right: -24, width: 130, height: 130, borderRadius: "50%", background: "#BBFBFF", opacity: 0.45, filter: "blur(40px)", pointerEvents: "none" }} />
//           <div style={{ position: "absolute", top: 70, left: -28, width: 100, height: 100, borderRadius: "50%", background: "#8DD8FF", opacity: 0.3, filter: "blur(30px)", pointerEvents: "none" }} />
//           <div style={{ position: "absolute", bottom: -20, right: 50, width: 80, height: 80, borderRadius: "50%", background: "#4E71FF", opacity: 0.18, filter: "blur(28px)", pointerEvents: "none" }} />

//           <div style={{ position: "relative", zIndex: 1 }}>
//             <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 999, background: "#5409DA18", color: "#5409DA", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
//               <span style={{ fontSize: 7 }}>●</span> Mega Sale — Up to 70% OFF
//             </span>

//             <h1 style={{ marginTop: 18, fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 900, lineHeight: 1.15, color: "#0f0a1e", letterSpacing: "-0.02em" }}>
//               Shop the Future of{" "}
//               <span style={{ color: "#5409DA" }}>Commerce.</span>
//             </h1>

//             <p style={{ marginTop: 12, fontSize: 13, color: "#777", lineHeight: 1.6 }}>
//               Millions of products. Thousands of verified sellers. One seamless shopping experience.
//             </p>

//             <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
//               <button
//                 style={{ padding: "11px 0", borderRadius: 14, border: "none", background: "#5409DA", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(84,9,218,0.3)", transition: "background 0.15s" }}
//                 onMouseEnter={e => (e.currentTarget.style.background = "#4E71FF")}
//                 onMouseLeave={e => (e.currentTarget.style.background = "#5409DA")}
//               >
//                 Explore Deals →
//               </button>
//               <button
//                 style={{ padding: "11px 0", borderRadius: 14, border: "1.5px solid #8DD8FF", background: "transparent", color: "#4E71FF", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "background 0.15s" }}
//                 onMouseEnter={e => (e.currentTarget.style.background = "#BBFBFF33")}
//                 onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
//               >
//                 Sell on FalRex
//               </button>
//             </div>
//           </div>

//           <div style={{ position: "relative", zIndex: 1, borderTop: "1.5px solid #f0ecff", marginTop: 22, paddingTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
//             {stats.map((s, i) => (
//               <div key={i}>
//                 <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#5409DA" : i === 1 ? "#4E71FF" : "#8DD8FF" }}>{s.value}</div>
//                 <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* MIDDLE CAROUSEL */}
//         <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }} className="carousel-panel">
//           <div
//             style={{
//               transition: "opacity 0.4s ease",
//               opacity: isAnimating ? 0 : 1,
//               height: "100%",
//               minHeight: 420,
//             }}
//           >
//             <CarouselSlide slide={slides[activeSlide]} />
//           </div>

//           {/* Arrows */}
//           <button
//             onClick={prev}
//             style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.3)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, backdropFilter: "blur(4px)", transition: "background 0.15s", zIndex: 5 }}
//             onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
//             onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.3)")}
//           >
//             ‹
//           </button>
//           <button
//             onClick={next}
//             style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.3)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, backdropFilter: "blur(4px)", transition: "background 0.15s", zIndex: 5 }}
//             onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
//             onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.3)")}
//           >
//             ›
//           </button>

//           {/* Dots */}
//           <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 5 }}>
//             {slides.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => goTo(i)}
//                 style={{
//                   width: i === activeSlide ? 24 : 8,
//                   height: 8,
//                   borderRadius: 99,
//                   border: "none",
//                   background: i === activeSlide ? slides[activeSlide].accent : "rgba(255,255,255,0.4)",
//                   cursor: "pointer",
//                   padding: 0,
//                   transition: "width 0.3s, background 0.3s",
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* RIGHT PRODUCT CARDS */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="right-panel">
//           {products.map(p => (
//             <ProductCard key={p.id} product={p} />
//           ))}
//         </div>
//       </div>

//       <style>{`
//         .hero-grid {
//           grid-template-columns: 1fr;
//         }

//         @media (min-width: 900px) {
//           .hero-grid {
//             grid-template-columns: 230px 1fr 220px;
//             align-items: stretch;
//           }
//           .carousel-panel {
//             min-height: 480px !important;
//           }
//         }

//         @media (min-width: 1100px) {
//           .hero-grid {
//             grid-template-columns: 260px 1fr 240px;
//           }
//         }

//         @media (min-width: 1300px) {
//           .hero-grid {
//             grid-template-columns: 280px 1fr 260px;
//           }
//         }

//         @media (max-width: 899px) {
//           .left-panel {
//             order: 1;
//           }
//           .carousel-panel {
//             order: 2;
//             min-height: 320px !important;
//           }
//           .right-panel {
//             order: 3;
//             display: grid !important;
//             grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
//           }
//         }

//         @media (max-width: 599px) {
//           .right-panel {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    eyebrow: "MEGA SALE",
    pill2: "Free shipping over $99",
    headline: ["Next-Gen Gadgets", "at Unreal Prices"],
    sub: "Shop curated tech from the world's top brands — delivered fast.",
    cta: "Shop Now",
    ctaSecondary: "Browse All",
    bg: ["#12003E", "#1e0a6b", "#0a1560"],
    accent: "#C4B5FD",
    accentDark: "#7C3AED",
    glyph: "◎",
  },
  {
    id: 2,
    eyebrow: "NEW IN",
    pill2: "30-day returns",
    headline: ["Capture Every", "Moment in 8K"],
    sub: "Professional camera results for everyday creators and storytellers.",
    cta: "Explore Cameras",
    ctaSecondary: "See Deals",
    bg: ["#001528", "#002a50", "#003c5e"],
    accent: "#67E8F9",
    accentDark: "#0891B2",
    glyph: "◉",
  },
  {
    id: 3,
    eyebrow: "LIMITED OFFER",
    pill2: "Up to 70% off",
    headline: ["Power Through", "the Whole Day"],
    sub: "Premium laptops & tablets with all-day battery. Work anywhere.",
    cta: "See Laptops",
    ctaSecondary: "Compare",
    bg: ["#071a00", "#0e3300", "#102800"],
    accent: "#86EFAC",
    accentDark: "#16A34A",
    glyph: "◈",
  },
];

const PRODUCTS = [
  {
    id: 1,
    badge: "HOT DEAL",
    badgeBg: "#FF2D2D18",
    badgeColor: "#CC0000",
    name: "AirPods Pro 3",
    sub: "ANC · Transparency · USB-C",
    price: "$189",
    was: "$329",
    off: "43%",
    offBg: "#FF2D2D12",
    offColor: "#CC0000",
    iconBg: "#FFF0F0",
    iconColor: "#FF4444",
    rating: 4.9,
    reviews: "2.4k",
  },
  {
    id: 2,
    badge: "NEW ARRIVAL",
    badgeBg: "#0891B218",
    badgeColor: "#006064",
    name: "Sony Xperia 10 VI",
    sub: "OLED · 5G · 48MP Triple Cam",
    price: "$549",
    was: "$699",
    off: "21%",
    offBg: "#0891B212",
    offColor: "#006064",
    iconBg: "#E0F7FA",
    iconColor: "#0891B2",
    rating: 4.7,
    reviews: "891",
  },
  {
    id: 3,
    badge: "BEST SELLER",
    badgeBg: "#D9770618",
    badgeColor: "#92400E",
    name: 'MacBook Air 15"',
    sub: "M3 · 16GB RAM · 512GB SSD",
    price: "$1,099",
    was: "$1,299",
    off: "15%",
    offBg: "#D9770612",
    offColor: "#92400E",
    iconBg: "#FFF7ED",
    iconColor: "#D97706",
    rating: 4.8,
    reviews: "5.1k",
  },
];

/* ─── ICONS ─────────────────────────────────────────── */
const IconHeadphone = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
    <path d="M3 11V9a9 9 0 0 1 18 0v2" />
    <rect x="2" y="11" width="4" height="7" rx="2" />
    <rect x="18" y="11" width="4" height="7" rx="2" />
  </svg>
);
const IconPhone = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <circle cx="12" cy="17.5" r="0.8" fill={color} />
  </svg>
);
const IconLaptop = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M2 17h20l-1.5 3H3.5z" />
  </svg>
);
const PRODUCT_ICONS = [IconHeadphone, IconPhone, IconLaptop];

const IconChevronLeft = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
);
const IconChevronRight = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
);

/* ─── PRODUCT CARD ───────────────────────────────────── */
function ProductCard({ p, index }) {
  const Icon = PRODUCT_ICONS[index % PRODUCT_ICONS.length];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: hovered ? "1.5px solid #c4b5fd" : "1.5px solid #ede8ff",
        borderRadius: 18,
        padding: "14px 14px 12px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 10px 28px rgba(84,9,218,0.12)" : "0 1px 8px rgba(84,9,218,0.05)",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        flex: "1 1 auto",
      }}
    >
      <div style={{ position: "absolute", top: -16, right: -16, width: 58, height: 58, borderRadius: "50%", background: p.iconBg, opacity: 0.55, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 999, background: p.badgeBg, color: p.badgeColor }}>{p.badge}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: p.offColor, background: p.offBg, padding: "3px 7px", borderRadius: 999 }}>−{p.off}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={p.iconColor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0d0620", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
          <div style={{ fontSize: 10.5, color: "#9590aa", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.sub}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 9 }}>
        {[1,2,3,4,5].map(i => (
          <svg key={i} width={10} height={10} viewBox="0 0 24 24" fill="#FBBF24" stroke="none">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5409DA", marginLeft: 2 }}>{p.rating}</span>
        <span style={{ fontSize: 10.5, color: "#ccc" }}>({p.reviews})</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 11 }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#0d0620", letterSpacing: "-0.02em" }}>{p.price}</span>
        <span style={{ fontSize: 11.5, color: "#c0bcd0", textDecoration: "line-through" }}>{p.was}</span>
      </div>

      <button
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: 11,
          border: "none",
          background: hovered ? "linear-gradient(135deg,#6d28d9,#4E71FF)" : "#5409DA",
          color: "#fff",
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "background 0.2s",
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

/* ─── CAROUSEL SLIDE ─────────────────────────────────── */
function Slide({ s, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 70% 20%, ${s.bg[1]} 0%, ${s.bg[0]} 65%, ${s.bg[2]} 100%)`,
        borderRadius: 22,
        padding: "clamp(24px,3.5vw,48px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(1.02)",
        transition: "opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)",
        pointerEvents: visible ? "auto" : "none",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", border: `1px solid ${s.accent}20`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 170, height: 170, borderRadius: "50%", border: `1px solid ${s.accent}16`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 10, right: 20, width: 90, height: 90, borderRadius: "50%", background: s.accentDark, opacity: 0.15, filter: "blur(30px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "clamp(12px,4vw,44px)", top: "50%", transform: "translateY(-55%)", fontSize: "clamp(70px,10vw,140px)", color: s.accent, opacity: 0.055, fontWeight: 900, pointerEvents: "none", lineHeight: 1, userSelect: "none" }}>
        {s.glyph}
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", padding: "4px 13px", borderRadius: 999, background: `${s.accent}22`, color: s.accent, border: `1px solid ${s.accent}40` }}>● {s.eyebrow}</span>
          <span style={{ fontSize: 10, fontWeight: 500, padding: "4px 13px", borderRadius: 999, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}>{s.pill2}</span>
        </div>
        <h1 style={{ fontSize: "clamp(22px,3.2vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em", margin: 0 }}>
          {s.headline[0]}<br /><span style={{ color: s.accent }}>{s.headline[1]}</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: "clamp(11.5px,1.3vw,14px)", color: "rgba(255,255,255,0.52)", maxWidth: 360, lineHeight: 1.65 }}>{s.sub}</p>
        <div style={{ marginTop: 22, display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button
            style={{ padding: "11px clamp(16px,2vw,26px)", borderRadius: 12, border: "none", background: s.accent, color: "#0d0620", fontWeight: 900, fontSize: "clamp(11.5px,1.2vw,13.5px)", cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {s.cta} →
          </button>
          <button
            style={{ padding: "11px clamp(12px,1.6vw,20px)", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.78)", fontWeight: 600, fontSize: "clamp(11.5px,1.2vw,13.5px)", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            {s.ctaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────── */
export default function HeroSection() {
  const [cur, setCur] = useState(0);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (busy) return;
    setBusy(true);
    setCur(idx);
    setTimeout(() => setBusy(false), 520);
  }, [busy]);

  const next = useCallback(() => goTo((cur + 1) % SLIDES.length), [cur, goTo]);
  const prev = useCallback(() => goTo((cur - 1 + SLIDES.length) % SLIDES.length), [cur, goTo]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5500);
  }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [next]);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "clamp(10px,1.8vw,20px)" }}>
      <div className="hero-row" style={{ display: "flex", flexDirection: "row", gap: "clamp(8px,1.2vw,14px)", alignItems: "stretch", width: "100%" }}>

        {/* LEFT */}
        <div
          className="left-panel"
          style={{ width: "clamp(190px,19%,252px)", flexShrink: 0, background: "#fff", borderRadius: 22, border: "1.5px solid #ede8ff", padding: "clamp(16px,1.8vw,26px) clamp(14px,1.6vw,20px)", boxShadow: "0 2px 20px rgba(84,9,218,0.07)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div style={{ position: "absolute", top: -44, right: -28, width: 150, height: 150, borderRadius: "50%", background: "#c4b5fd", opacity: 0.22, filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 10, left: -28, width: 120, height: 120, borderRadius: "50%", background: "#818cf8", opacity: 0.15, filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
              <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5409DA", letterSpacing: "0.08em" }}>MEGA SALE · 70% OFF</span>
            </div>

            <h1 style={{ fontSize: "clamp(17px,1.7vw,24px)", fontWeight: 900, lineHeight: 1.2, color: "#0d0620", letterSpacing: "-0.025em", margin: "0 0 8px" }}>
              Shop the Future of{" "}
              <span style={{ background: "linear-gradient(135deg,#5409DA,#4E71FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Commerce.
              </span>
            </h1>

            <p style={{ fontSize: 12, color: "#9590aa", lineHeight: 1.65, margin: 0 }}>
              Millions of products. Thousands of verified sellers. One seamless experience.
            </p>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                style={{ width: "100%", padding: "10px 0", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#5409DA,#4E71FF)", color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(84,9,218,0.28)", transition: "opacity 0.15s, transform 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Explore Deals →
              </button>
              <button
                style={{ width: "100%", padding: "9px 0", borderRadius: 13, border: "1.5px solid #c4b5fd", background: "transparent", color: "#5409DA", fontWeight: 700, fontSize: 12.5, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#ede9fe")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Sell on FalRex
              </button>
            </div>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {["✓ Free returns within 30 days", "✓ Verified seller guarantee", "✓ 24/7 buyer protection"].map((t, i) => (
                <div key={i} style={{ fontSize: 11, color: "#7c6fa0" }}>{t}</div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, borderTop: "1.5px solid #f0ecff", marginTop: 18, paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { val: "240+", label: "Products", color: "#5409DA" },
              { val: "18K", label: "Sellers", color: "#4E71FF" },
              { val: "98.6%", label: "Satisfied", color: "#7C3AED" },
              { val: "4.9★", label: "Rating", color: "#6D28D9" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f7f5ff", borderRadius: 11, padding: "7px 9px" }}>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "#9590aa", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE — CAROUSEL */}
        <div
          className="carousel-panel"
          style={{ flex: "1 1 0%", minWidth: 0, position: "relative", borderRadius: 22, overflow: "hidden", minHeight: "clamp(300px,40vw,560px)" }}
        >
          {SLIDES.map((s, i) => <Slide key={s.id} s={s} visible={i === cur} />)}

          <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.32)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "4px 11px", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.78)", zIndex: 10 }}>
            {String(cur + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </div>

          {[
            { side: "left", fn: () => { prev(); resetTimer(); }, icon: <IconChevronLeft /> },
            { side: "right", fn: () => { next(); resetTimer(); }, icon: <IconChevronRight /> },
          ].map(({ side, fn, icon }) => (
            <button key={side} onClick={fn}
              style={{ position: "absolute", [side]: 12, bottom: 16, width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.09)", backdropFilter: "blur(6px)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "background 0.15s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {icon}
            </button>
          ))}

          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => { goTo(i); resetTimer(); }}
                style={{ width: i === cur ? 24 : 7, height: 7, borderRadius: 99, border: "none", background: i === cur ? SLIDES[cur].accent : "rgba(255,255,255,0.32)", padding: 0, cursor: "pointer", transition: "width 0.32s cubic-bezier(.4,0,.2,1), background 0.32s" }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — PRODUCT CARDS */}
        <div
          className="right-panel"
          style={{ width: "clamp(185px,21%,240px)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "clamp(8px,0.9vw,11px)" }}
        >
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 1050px) {
          .hero-row { flex-wrap: wrap !important; }
          .left-panel { width: 100% !important; flex-direction: row !important; gap: 20px; }
          .carousel-panel { flex: 1 1 55% !important; min-width: 260px !important; min-height: 280px !important; }
          .right-panel { flex: 1 1 36% !important; width: unset !important; min-width: 175px !important; }
        }
        @media (max-width: 660px) {
          .hero-row { flex-direction: column !important; }
          .left-panel, .carousel-panel, .right-panel { width: 100% !important; flex: none !important; min-width: unset !important; }
          .left-panel { flex-direction: column !important; }
          .right-panel { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}