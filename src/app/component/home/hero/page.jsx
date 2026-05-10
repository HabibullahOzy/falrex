"use client";

import Image from "next/image";
import { Headphones, Smartphone } from "lucide-react";
import { Carousel } from "antd";

// ─── Product Card Component ───────────────────────────────────────────────────
function ProductCard({ badge, badgeColor, title, subtitle, price, oldPrice, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeColor}`}>
        {badge}
      </span>
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-lg font-extrabold text-gray-900">{price}</span>
          <span className="ml-2 text-sm text-gray-400 line-through">{oldPrice}</span>
        </div>
        <button className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-600 transition text-white text-xs font-semibold">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  // Replace these with your actual image paths / imports
  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
  ];

  const contentStyle = {
    objectFit: "cover",
    objectPosition: "center",
  };

  return (
    <section className="px-4 py-6 max-w-screen-xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-2">

        {/* ── LEFT: Mega Sale Hero ─────────────────────────────────────────── */}
        <div className="col-span-1 bg-white rounded-3xl border border-gray-200 shadow-sm p-10">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-lime-100 text-lime-700 text-sm font-semibold">
            ● Mega Sale — Up to 70% OFF
          </span>
          <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight text-gray-900">
            Shop the <br />
            Future of{" "}
            <span className="text-lime-500">Commerce.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-xl">
            Millions of products. Thousands of verified sellers. One seamless
            shopping experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="px-7 py-4 rounded-xl bg-lime-500 hover:bg-lime-600 transition text-white font-semibold shadow-md">
              Explore Deals →
            </button>
            <button className="px-7 py-4 rounded-xl border border-gray-300 hover:border-lime-400 hover:text-lime-600 transition font-semibold">
              Sell on Nextmart
            </button>
          </div>
          <div className="border-t border-gray-200 mt-10 pt-8 grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-3xl font-bold text-lime-500">2.4M+</h3>
              <p className="text-gray-500">Products Listed</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-sky-500">180K</h3>
              <p className="text-gray-500">Active Sellers</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-violet-500">98.6%</h3>
              <p className="text-gray-500">Satisfaction Rate</p>
            </div>
          </div>
        </div>
        {/* end mega sale */}

        {/* ── MIDDLE: Carousel ─────────────────────────────────────────────── */}
        <Carousel
          autoplay
          autoplaySpeed={5000}
          arrows
          infinite
          dots={{ className: "custom-dots" }}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative w-full h-[220px] sm:h-[320px] md:h-[460px] lg:h-[560px]"
            >
              <Image
                src={item}
                alt={`Slide ${idx + 1}`}
                fill
                priority={idx === 0}
                style={contentStyle}
                className="rounded-2xl"
              />
            </div>
          ))}
        </Carousel>

        {/* ── RIGHT: Product Cards ─────────────────────────────────────────── */}
        <div className="w-full space-y-6">
          <ProductCard
            badge="HOT DEAL"
            badgeColor="bg-red-100 text-red-600"
            title="AirPods Pro 3"
            subtitle="Active Noise Cancellation · USB-C"
            price="$189"
            oldPrice="$329"
            icon={<Headphones size={28} />}
          />

          <ProductCard
            badge="NEW ARRIVAL"
            badgeColor="bg-cyan-100 text-cyan-600"
            title="Sony Xperia 10 VI"
            subtitle="OLED · 5G · 48MP Triple Cam"
            price="$549"
            oldPrice="$699"
            icon={<Smartphone size={28} />}
          />
        </div>

      </div>
    </section>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   ShoppingBag,
//   Headphones,
//   Smartphone,
//   Laptop,
//   Monitor,
//   Keyboard,
//   Camera,
//   Gamepad2,
//   Zap,
// } from "lucide-react";

// export default function EcommerceHero() {
//   const [timeLeft, setTimeLeft] = useState({
//     hours: 2,
//     minutes: 44,
//     seconds: 0,
//   });

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         let { hours, minutes, seconds } = prev;

//         if (seconds > 0) {
//           seconds--;
//         } else if (minutes > 0) {
//           minutes--;
//           seconds = 59;
//         } else if (hours > 0) {
//           hours--;
//           minutes = 59;
//           seconds = 59;
//         }

//         return { hours, minutes, seconds };
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const flashProducts = [
//     {
//       title: "MacBook Air M3",
//       discount: "-22% TODAY",
//       icon: Laptop,
//     },
//     {
//       title: '4K Monitor 27"',
//       discount: "-35% TODAY",
//       icon: Monitor,
//     },
//     {
//       title: "Mech Keyboard",
//       discount: "-40% TODAY",
//       icon: Keyboard,
//     },
//     {
//       title: "Sony A7C II",
//       discount: "-18% TODAY",
//       icon: Camera,
//     },
//     {
//       title: "PS5 Controller",
//       discount: "-28% TODAY",
//       icon: Gamepad2,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 md:px-14 py-10">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* HERO SECTION */}
//         <div className="grid lg:grid-cols-4 gap-6">
//           {/* LEFT */}
//           <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-10">
//             <span className="inline-flex items-center px-4 py-2 rounded-full bg-lime-100 text-lime-700 text-sm font-semibold">
//               ● Mega Sale — Up to 70% OFF
//             </span>

//             <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight text-gray-900">
//               Shop the <br />
//               Future of{" "}
//               <span className="text-lime-500">Commerce.</span>
//             </h1>

//             <p className="mt-6 text-lg text-gray-500 max-w-xl">
//               Millions of products. Thousands of verified sellers. One seamless
//               shopping experience.
//             </p>

//             <div className="mt-8 flex flex-wrap gap-4">
//               <button className="px-7 py-4 rounded-xl bg-lime-500 hover:bg-lime-600 transition text-white font-semibold shadow-md">
//                 Explore Deals →
//               </button>

//               <button className="px-7 py-4 rounded-xl border border-gray-300 hover:border-lime-400 hover:text-lime-600 transition font-semibold">
//                 Sell on Nextmart
//               </button>
//             </div>

//             <div className="border-t border-gray-200 mt-10 pt-8 grid grid-cols-3 gap-6">
//               <div>
//                 <h3 className="text-3xl font-bold text-lime-500">2.4M+</h3>
//                 <p className="text-gray-500">Products Listed</p>
//               </div>
//               <div>
//                 <h3 className="text-3xl font-bold text-sky-500">180K</h3>
//                 <p className="text-gray-500">Active Sellers</p>
//               </div>
//               <div>
//                 <h3 className="text-3xl font-bold text-violet-500">98.6%</h3>
//                 <p className="text-gray-500">Satisfaction Rate</p>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT CARDS */}
//           <div className="space-y-6">
//             <ProductCard
//               badge="HOT DEAL"
//               badgeColor="bg-red-100 text-red-600"
//               title="AirPods Pro 3"
//               subtitle="Active Noise Cancellation · USB-C"
//               price="$189"
//               oldPrice="$329"
//               icon={<Headphones size={28} />}
//             />

//             <ProductCard
//               badge="NEW ARRIVAL"
//               badgeColor="bg-cyan-100 text-cyan-600"
//               title="Sony Xperia 10 VI"
//               subtitle="OLED · 5G · 48MP Triple Cam"
//               price="$549"
//               oldPrice="$699"
//               icon={<Smartphone size={28} />}
//             />
//           </div>
//         </div>

//         {/* FLASH SALE */}
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
//           <div className="flex flex-col lg:flex-row lg:items-center gap-5">
//             <div className="flex items-center gap-3 min-w-fit">
//               <Zap className="text-orange-500" />
//               <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
//             </div>

//             {/* Timer */}
//             <div className="flex items-center gap-2">
//               <TimeBox value={timeLeft.hours} />
//               <span className="font-bold">:</span>
//               <TimeBox value={timeLeft.minutes} />
//               <span className="font-bold">:</span>
//               <TimeBox value={timeLeft.seconds} />
//             </div>

//             {/* Products */}
//             <div className="flex flex-wrap gap-3 lg:ml-auto">
//               {flashProducts.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer bg-gray-50"
//                 >
//                   <item.icon className="text-gray-700" size={22} />
//                   <div>
//                     <h4 className="font-semibold text-sm">{item.title}</h4>
//                     <p className="text-xs text-red-500 font-semibold">
//                       {item.discount}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ProductCard({
//   badge,
//   badgeColor,
//   title,
//   subtitle,
//   price,
//   oldPrice,
//   icon,
// }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 hover:shadow-lg transition">
//       <span
//         className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}
//       >
//         {badge}
//       </span>

//       <div className="flex justify-between items-start mt-4">
//         <div>
//           <h3 className="text-xl font-bold text-gray-900">{title}</h3>
//           <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
//         </div>
//         <div className="text-gray-700">{icon}</div>
//       </div>

//       <div className="mt-8">
//         <h4 className="text-3xl font-bold text-gray-900">{price}</h4>
//         <p className="text-sm text-gray-400 line-through">{oldPrice}</p>
//       </div>
//     </div>
//   );
// }

// function TimeBox({ value }) {
//   return (
//     <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg">
//       {String(value).padStart(2, "0")}
//     </div>
//   );
// }