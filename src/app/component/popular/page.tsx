"use client";
import { useState } from "react";
import { motion } from "framer-motion";
// import { Button } from "antd";
import Image, { type StaticImageData } from "next/image";

import imgew from "../../assets/p&e.jpg";
import img2 from "../../assets/eae&e.jpg";
import img3 from "../../assets/p&e2.jpg";
// import { img } from "framer-motion/client";
// import img4 from "../../assets/p&e1.jpg";
// import { Button } from "@/components/ui/button";




// const cards = [
//   {
//     id: 1,
//     title: "Mountain Adventure",
//     description: "Explore the beauty of the mountains with guided tours and activities.",
//     image: "https://www.freepik.com/free-photo/closeup-shot-beautiful-butterfly-orange-petaled-flower_10186169.htm#fromView=keyword&page=1&position=0&uuid=be2f7f88-e5ff-4151-ae09-19159e1c5df9&query=Jpg",
//   },
//   {
//     id: 2,
//     title: "City Lights",
//     description: "Experience the vibrant nightlife and culture of the modern city.",
//     image: "https://www.freepik.com/free-photo/closeup-shot-beautiful-butterfly-orange-petaled-flower_10186169.htm#fromView=keyword&page=1&position=0&uuid=be2f7f88-e5ff-4151-ae09-19159e1c5df9&query=Jpg",
//   },
//   {
//     id: 3,
//     title: "Beach Paradise",
//     description: "Relax at the seaside with golden sands and crystal clear waters.",
//     image: "https://www.freepik.com/free-photo/closeup-shot-beautiful-butterfly-orange-petaled-flower_10186169.htm#fromView=keyword&page=1&position=0&uuid=be2f7f88-e5ff-4151-ae09-19159e1c5df9&query=Jpg",
//   },
// ];

// function FlipCard({ card }: { card: any }) {
//   const [flipped, setFlipped] = useState(false);

//   return (
//     <motion.div
//       className="relative w-80 h-96 cursor-pointer [perspective:1000px]"
//       onClick={() => setFlipped(!flipped)}
//     >
//       <motion.div
//         className="relative w-full h-full rounded-2xl shadow-2xl [transform-style:preserve-3d]"
//         animate={{ rotateY: flipped ? 180 : 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         {/* Front Side */}
//         <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden [backface-visibility:hidden]">
//           <Image
//             src={""}
//             alt={card.title}
//             width={400}
//             height={400}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
//             <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700">
//               Like
//             </button>
//             <button className="px-4 py-2 rounded-xl bg-pink-600 text-white font-medium shadow-md hover:bg-pink-700">
//               Share
//             </button>
//           </div>
//         </div>

//         {/* Back Side */}
//         <div className="absolute inset-0 w-full h-full rounded-2xl bg-white p-6 text-center flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
//           <h2 className="text-2xl font-bold mb-4 text-indigo-700">
//             {card.title}
//           </h2>
//           <p className="text-gray-600 mb-6">{card.description}</p>
//           <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg hover:opacity-90">
//             Learn More
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }




// Flip Card Component
// Define product type instead of `any`
interface Product {
  title: string;
  price: number;
  offerPrice?: number | null;
  image: StaticImageData;
  description: string;
}

function FlipCard({ product, index }: { product: Product; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-full max-w-xs sm:max-w-sm h-[440px] cursor-pointer [perspective:1000px]"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl shadow-2xl [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-white [backface-visibility:hidden] flex flex-col">
          <div className="relative w-full h-56 sm:h-64">
            <Image
              src={product.image}
              alt={product.title}
              width={400}
              height={600}
              className="w-full h-full"
            />

            {/* Animated Offer Badge */}
            {product.offerPrice && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md"
              >
                {Math.round(
                  ((product.price - product.offerPrice) / product.price) * 100
                )}
                % OFF
              </motion.div>
            )}
          </div>

          <div className="p-4 flex flex-col items-center text-center flex-grow">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">
              {product.title}
            </h2>

            {/* Price + Offer */}
            <div className="mt-1">
              {product.offerPrice ? (
                <div className="flex flex-col items-center">
                  <span className="text-red-600 font-bold text-lg sm:text-xl">
                    ${product.offerPrice}
                  </span>
                  <span className="text-gray-400 line-through text-sm sm:text-base">
                    ${product.price}
                  </span>
                </div>
              ) : (
                <span className="text-gray-600 font-bold text-lg sm:text-xl">
                  ${product.price}
                </span>
              )}
            </div>

            {/* Single Styled Button */}
            <button className="mt-3 px-4 py-2 rounded-xl bg-green-600 text-white text-sm sm:text-base font-medium shadow-md hover:bg-green-700 transition w-full">
              Buy Now
            </button>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-white p-4 sm:p-6 text-center flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-indigo-700">
            {product.title}
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-4">
            {product.description}
          </p>

          {/* Buttons */}
          <a href="https://www.facebook.com/share/1H8E47x2oE/" className="flex flex-col gap-2 w-full">
            <button className="w-full px-4 py-2 rounded-xl bg-green-600 text-white text-sm sm:text-base font-medium shadow-md hover:bg-green-700">
              Learn More
            </button>
            <button className="w-full px-4 py-2 rounded-xl bg-green-600 text-white text-sm sm:text-base font-medium shadow-md hover:bg-green-700">
              Buy Now
            </button>
            <button className="w-full px-4 py-2 rounded-xl bg-green-600 text-white text-sm sm:text-base font-medium shadow-md hover:bg-green-700">
              Add to Cart
            </button>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Popular() {
  const products: Product[] = [
    {
      title: "Premium Headphones",
      price: 120,
      offerPrice: 90,
      image: imgew,
      description: "Crystal-clear sound with comfort design for audiophiles.",
    },
    {
      title: "Smart Watch",
      price: 250,
      offerPrice: 199,
      image:img2,
      description:
        "Stay connected and track fitness with our stylish smartwatch.",
    },
    {
      title: "Gaming Mouse",
      price: 80,
      image: img3,
      description:
        "High precision, RGB lighting, and ergonomic design for gamers.",
    },
    {
      title: "Wireless Speaker",
      price: 150,
      offerPrice: 120,
      image:img2,
      description:
        "Portable speaker with deep bass and long battery life for parties.",
    },
  ];

  return (
    <section className="flex items-center justify-center px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-6 w-full">
        {products.map((p, i) => (
          <FlipCard key={i} product={p} index={i} />
        ))}
      </div>
    </section>


  );
}




    // <div className="mt-10">

    //     <div className="min-h-screen flex items-center justify-center">
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
    //     {cards.map((card) => (
    //       <FlipCard key={card.id} card={card} />
    //     ))}
    //   </div>
    // </div>




// 3rd option

    //   {/* <motion.div
    //     className="relative w-80 h-96 cursor-pointer [perspective:1000px]"
    //     onClick={() => setFlipped(!flipped)}
    //   >

    //     <motion.div
    //       className="relative w-full h-full rounded-2xl shadow-2xl [transform-style:preserve-3d]"
    //       animate={{ rotateY: flipped ? 180 : 0 }}
    //       transition={{ duration: 0.8 }}
    //     >

    //       <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden [backface-visibility:hidden]">
    //         <Image
    //           src=""
    //           alt="Card Image"
    //           width={400}
    //           height={400}
    //           className="w-full h-full object-cover"
    //         />
    //         <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
    //           <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700">
    //             Like
    //           </button>
    //           <button className="px-4 py-2 rounded-xl bg-pink-600 text-white font-medium shadow-md hover:bg-pink-700">
    //             Share
    //           </button>
    //         </div>
    //       </div>

        
    //       <div className="absolute inset-0 w-full h-full rounded-2xl bg-white p-6 text-center flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
    //         <h2 className="text-2xl font-bold mb-4 text-indigo-700">
    //           Card Description
    //         </h2>
    //         <p className="text-gray-600 mb-6">
    //           This is a beautiful flip card built with Next.js, TailwindCSS and
    //           Framer Motion. Click again to flip back!
    //         </p>
    //         <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg hover:opacity-90">
    //           Learn More
    //         </button>
    //       </div>
    //     </motion.div>
    //   </motion.div> */}
    // </div>