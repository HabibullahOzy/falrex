"use client";
import { useEffect, useState } from "react";

import { Carousel } from "antd";
import Image from "next/image";
import img from "../app/assets/eae&e.jpg";
import img1 from "../app/assets/b&e.jpg";
import img2 from "../app/assets/p&e.jpg";
import img3 from "../app/assets/p&e1.jpg";
import Popular from "./products/popular/page";
import Marque from "./component/category/page";
import Allproducts from "../app/products/allproducts/page"
import {
  ShoppingBag,
  Headphones,
  Smartphone,
  Laptop,
  Monitor,
  Keyboard,
  Camera,
  Gamepad2,
  Zap,
} from "lucide-react";




const contentStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  // objectFit: "cover",
};

export default function Home() {
  const images = [img, img1, img2, img3];


  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 44,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashProducts = [
    {
      title: "MacBook Air M3",
      discount: "-22% TODAY",
      icon: Laptop,
    },
    {
      title: '4K Monitor 27"',
      discount: "-35% TODAY",
      icon: Monitor,
    },
    {
      title: "Mech Keyboard",
      discount: "-40% TODAY",
      icon: Keyboard,
    },
    {
      title: "Sony A7C II",
      discount: "-18% TODAY",
      icon: Camera,
    },
    {
      title: "PS5 Controller",
      discount: "-28% TODAY",
      icon: Gamepad2,
    },
  ];




  const ProductCard = ({ badge, badgeColor, title, subtitle, price, oldPrice, icon }) => {
  return (
    <div className="relative w-80 overflow-hidden rounded-3xl p-6 shadow-2xl transition-transform hover:scale-[1.02]">
      {/* Background Layer with Gradient */}
      <div 
        className="absolute inset-0 -z-20" 
        style={{ background: 'linear-gradient(135deg, #5409DA 0%, #4E71FF 100%)' }} 
      />

      {/* Decorative Bubbles */}
      <div 
        className="absolute -right-4 -top-4 h-32 w-32 rounded-full opacity-40 blur-2xl" 
        style={{ backgroundColor: '#8DD8FF' }} 
      />
      <div 
        className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full opacity-30 blur-3xl" 
        style={{ backgroundColor: '#BBFBFF' }} 
      />
      <div 
        className="absolute right-10 top-20 h-12 w-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md" 
      />

      {/* Card Content */}
      <div className="flex flex-col h-full justify-between text-white">
        <div className="flex justify-between items-start">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
            {badge}
          </span>
          <div className="p-3 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30">
            {icon}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          <p className="text-white/80 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-black text-[#BBFBFF]">{price}</span>
          {oldPrice && (
            <span className="text-lg text-white/50 line-through decoration-white/40">
              {oldPrice}
            </span>
          )}
        </div>
        
        <button className="mt-6 w-full py-3 bg-white text-[#5409DA] font-bold rounded-xl hover:bg-[#BBFBFF] transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
  );
};


  return (
    <div className="w-full  mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-1 items-start">
        {/* left container */}
        <div className="relative overflow-hidden lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          {/* Background Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#BBFBFF] rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute top-20 -left-10 w-32 h-32 bg-[#8DD8FF] rounded-full blur-2xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-24 h-24 bg-[#4E71FF] rounded-full blur-2xl opacity-20 pointer-events-none" />

          {/* Content Wrapper (Relative to sit above blobs) */}
          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#5409DA]/10 text-[#5409DA] text-xs font-semibold">
              <span className="mr-1.5 text-[8px]">●</span> Mega Sale — Up to 70% OFF
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight text-gray-900">
              Shop the Future of <span className="text-[#5409DA]">Commerce.</span>
            </h1>

            <p className="mt-4 text-sm text-gray-500">
              Millions of products. Thousands of verified sellers. One seamless shopping
              experience.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button className="w-full px-5 py-3 rounded-xl bg-[#5409DA] hover:bg-[#4E71FF] transition-colors text-white font-semibold shadow-lg shadow-[#5409DA]/20">
                Explore Deals →
              </button>

              <button className="w-full px-5 py-3 rounded-xl border border-[#8DD8FF] hover:bg-[#BBFBFF]/30 text-[#4E71FF] transition font-semibold">
                Sell on FalRex
              </button>
            </div>

            <div className="border-t border-gray-100 mt-6 pt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <h3 className="text-xl font-bold text-[#5409DA]">240+</h3>
                <p className="text-xs text-gray-500">Products</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#4E71FF]">18</h3>
                <p className="text-xs text-gray-500">Sellers</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#8DD8FF]">98.6%</h3>
                <p className="text-xs text-gray-500">Happy</p>
              </div>
            </div>
          </div>
        </div>

        {/* middle big carousel */}
        <div className="lg:col-span-6">
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
        </div>

        {/* right container */}
        <div className="lg:col-span-2 space-y-4">
         
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




      <div className="max-w-10/12 mx-auto my-5">

        <div >
          <div className="font-bold text-xl">Browse Categories</div>
          <Marque />
        </div>

        {/* <Hero></Hero> */}

        <div>
          <Popular></Popular>
        </div>


      </div>


      <div>
        {/* FLASH SALE */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="flex items-center gap-3 min-w-fit">
              <Zap className="text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <TimeBox value={timeLeft.hours} />
              <span className="font-bold">:</span>
              <TimeBox value={timeLeft.minutes} />
              <span className="font-bold">:</span>
              <TimeBox value={timeLeft.seconds} />
            </div>

            {/* Products */}
            <div className="flex flex-wrap gap-3 lg:ml-auto">
              {flashProducts.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer bg-gray-50"
                >
                  <item.icon className="text-gray-700" size={22} />
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-red-500 font-semibold">
                      {item.discount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* all products show */}

      <div className="max-w-10/12 mx-auto my-5">
        <Allproducts></Allproducts>
      </div>
    </div>

  );
}






function TimeBox({ value }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg">
      {String(value).padStart(2, "0")}
    </div>
  );
}