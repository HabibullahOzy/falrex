"use client";
import { useEffect, useState } from "react";
import Popular from "./products/popular/page";
import Allproducts from "../app/products/allproducts/page"
import {
  Laptop,
  Monitor,
  Keyboard,
  Camera,
  Gamepad2,
  Zap,
} from "lucide-react";
import CategoryMarquee from "./component/CategoryMarquee";
import HeroSection from "../app/component/home/hero/page"


export default function Home() {
  // const images = [img, img1, img2, img3];


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



  return (
    <div className="w-full  mx-auto">

      <>
        <HeroSection></HeroSection>
      </>



      <div className="lg:max-w-10/12 md:max-w-10/12 sm:w-full mx-auto my-5">
        <section className="px-4 md:px-8 py-6">
          <CategoryMarquee />
        </section>


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

      <div className="lg:max-w-10/12 md:max-w-10/12 sm:w-full mx-auto my-5">
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