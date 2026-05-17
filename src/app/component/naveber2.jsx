"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoe from "../assets/falrex2.png";
import imge2 from "../assets/avatar.png";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IoNotifications } from "react-icons/io5";
import { FaCartArrowDown } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";
import CartDrawer from "../products/orderprocess/cart/page";
import { useAuth } from "../../../lib/useAuth";

// ✅ Product data
const productData = [
  {
    _id: "682a",
    namebn: "আল হুরুফুল আরাবিয়্যাহ - ০১",
    namearb: "الحروف العربية - 01",
    nameeng: "Al Huruful Arabiyah - 01",
    productPrice: "350",
    ProductCode: "ZP001",
    category: "Play",
    image:
      "https://res.cloudinary.com/dimbdv51r/image/upload/v1747802529/product_images/1747802528822-Nursery.jpg.jpg",
  },
  {
    _id: "682d",
    namebn: "আল হুরুফুল আরাবিয়্যাহ - ০২",
    namearb: "الحروف العربية - 02",
    nameeng: "Al Huruful Arabiyah - 02",
    productPrice: "350",
    ProductCode: "ZP002",
    category: "Nursary",
    image:
      "https://res.cloudinary.com/dimbdv51r/image/upload/v1747802529/product_02.png",
  },
  {
    _id: "682",
    namebn: "আল কালিমাতুল আরাবিয়্যাহ",
    namearb: "الكلمات العربية",
    nameeng: "Al Kalimatul Arabiyah",
    productPrice: "450",
    ProductCode: "ZP003",
    category: "KG",
    image:
      "https://res.cloudinary.com/dimbdv51r/image/upload/v1747802953/product_03.png",
  },
];

// ✅ Utility: Convert image to perceptual hash
const getImageHash = (src) => {
  return new Promise((resolve) => {
    const img = new window.Image(); // ✅ FIX HERE
    img.crossOrigin = "Anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 8;
      canvas.height = 8;
      ctx.drawImage(img, 0, 0, 8, 8);

      const data = ctx.getImageData(0, 0, 8, 8).data;
      let grayValues = [];

      for (let i = 0; i < data.length; i += 4) {
        let gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        grayValues.push(gray);
      }

      const avg =
        grayValues.reduce((a, b) => a + b, 0) / grayValues.length;

      const hash = grayValues
        .map((val) => (val > avg ? "1" : "0"))
        .join("");

      resolve(hash);
    };
  });
};



// ✅ Hamming distance between 2 hashes
const hammingDistance = (h1, h2) => {
  if (!h1 || !h2) return 64;
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++;
  }
  return dist;
};

export default function Navebar2() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [productHashes, setProductHashes] = useState({});
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
   const { cart } = useCart();

   const {user} =useAuth()
console.log(user)

  // ✅ Precompute product image hashes
  useEffect(() => {
    const loadHashes = async () => {
      let hashes = {};
      for (const product of productData) {
        hashes[product._id] = await getImageHash(product.image);
      }
      setProductHashes(hashes);
    };
    loadHashes();
  }, []);

  // ✅ Text Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsFetching(true);

    setTimeout(() => {
      const filtered = productData.filter(
        (item) =>
          item.namebn.toLowerCase().includes(value.toLowerCase()) ||
          item.nameeng.toLowerCase().includes(value.toLowerCase()) ||
          item.namearb.toLowerCase().includes(value.toLowerCase()) ||
          item.ProductCode.toLowerCase().includes(value.toLowerCase()) ||
          item.category.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setIsFetching(false);
    }, 400);
  };

  // ✅ Image Upload Search with fuzzy hash
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreviewImage(reader.result);
      setIsFetching(true);

      const uploadHash = await getImageHash(reader.result);

      let matches = [];
      for (const product of productData) {
        const dist = hammingDistance(uploadHash, productHashes[product._id]);
        if (dist <= 10) {
          matches.push(product);
        }
      }

      setSearchResults(matches);
      setIsFetching(false);
    };
    reader.readAsDataURL(file);
  };


  const pathName = usePathname()
      console.log(pathName)
      if (!pathName.includes('dashboard') && !pathName.includes('blog') && !pathName.includes('socialCommunication')) {

        return (
    <div className="z-50 navbg">
      <div className="navbar w-11/12 mx-auto">
        {/* Logo */}
        <div className="navbar-start flex items-center">
          <Link href={'/'} className="flex gap-2 items-center text-black font-extrabold text-2xl">
            <Image src={logoe} alt="logo" className="w-36" />
            <p>
              <span className="text-[#7149f5]">F</span>al
              <span className="text-yellow-500">R</span>ex
            </p>
          </Link>
        </div>

        {/* Search */}
        <div className="navbar-center hidden lg:flex relative w-[55%]">
          <div className="flex items-center bg-gray-50 border border-[#7149f5] rounded-full px-3 py-2 w-full shadow-sm">
            <input
              type="text"
              placeholder="Search by name, category, code..."
              className="flex-grow ml-4 bg-transparent outline-none placeholder-gray-400 text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />

            {/* Image Upload */}
            <label className="cursor-pointer ml-2 flex items-center text-green-500 hover:text-green-700">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <circle cx="16" cy="16" r="16" fill="#7149f5" />
                <path
                  fill="#ffff"
                  d="M12 10h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2zm4 2a3 3 0 100 6 3 3 0 000-6z"
                />
              </svg>
            </label>
          </div>

          {/* Results */}
          {(searchTerm.length > 0 || previewImage) && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {isFetching ? (
                <p className="p-4 text-gray-500">Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer transition"
                  >
                    <Image
                      src={item.image}
                      alt={item.nameeng}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.nameeng}</p>
                      <p className="text-sm text-gray-500">
                        {item.category} · Code: {item.ProductCode}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500">No results found</p>
              )}
            </div>
          )}
        </div>


        {/* Profile */}
        <div className="navbar-end flex items-center gap-4">


<div className="flex items-center gap-4">
  {/* <a
    href="/products/filterproducts"
    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-blue-600 hover:text-white"
  >
    <FaCartArrowDown className="text-xl" />
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
      3
    </span>
  </a> */}

 <>
  <button
    onClick={() => setCartOpen(true)}
    className="relative p-2 rounded-xl hover:bg-gray-100 transition"
  >
    <ShoppingCart className="w-5 h-5 text-gray-700" />
    {cart.itemCount > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {cart.itemCount}
      </span>
    )}
  </button>

  <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
</>

  <Link
    href="/products/filterproducts"
    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-blue-600 hover:text-white"
  >
    <IoNotifications className="text-xl" />
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-semibold text-white">
      5
    </span>
  </Link>

 
</div>

      <div className="dropdown dropdown-end">
        {/* Button */}
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full ring ring-green-400 overflow-hidden">
            <Image src={imge2} alt="User avatar" />
          </div>
        </label>

        {/* Dropdown Menu */}
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-white rounded-box z-10 mt-3 w-52 p-2 shadow-lg"
        >
          <li>
            <Link href="/dashboard">Dash Board</Link>
          </li>
          
          <li>
            <Link href="/signup">Sign UP</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/login">Profile</Link>
          </li>
        </ul>
      </div>
    </div>
      </div>
    </div>
  );
      }
      else{
        <></>
      }
}



// 2
// "use client";
// import React, { useState } from "react";
// import Image from "next/image";
// import logoe from "../assets/falrex2.png";
// import imge2 from "../assets/avatar.png";

// // ✅ Replace mockResults with your actual product data
// const productData = [
//   {
//     _id: "682a",
//     namebn: "আল হুরুফুল আরাবিয়্যাহ - ০১",
//     namearb: "الحروف العربية - 01",
//     nameeng: "Al Huruful Arabiyah - 01",
//     productPrice: "350",
//     ProductCode: "ZP001",
//     category: "Play",
//     image: "https://res.cloudinary.com/dimbdv51r/image/upload/v1747801949/product_…",
//   },
//   {
//     _id: "682d",
//     namebn: "আল হুরুফুল আরাবিয়্যাহ - ০২",
//     namearb: "الحروف العربية - 02",
//     nameeng: "Al Huruful Arabiyah - 02",
//     productPrice: "350",
//     ProductCode: "ZP002",
//     category: "Nursary",
//     image: "https://res.cloudinary.com/dimbdv51r/image/upload/v1747802529/product_…",
//   },
//   {
//     _id: "682",
//     namebn: "আল কালিমাতুল আরাবিয়্যাহ",
//     namearb: "الكلمات العربية",
//     nameeng: "Al Kalimatul Arabiyah",
//     productPrice: "450",
//     ProductCode: "ZP003",
//     category: "KG",
//     image: "https://res.cloudinary.com/dimbdv51r/image/upload/v1747802953/product_…",
//   },
// ];

// export default function Navebar2() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [category, setCategory] = useState("");
//   const [isFetching, setIsFetching] = useState(false);
//   const [searchResults, setSearchResults] = useState([]);
//   const [previewImage, setPreviewImage] = useState(null);

//   // ✅ Text Search
//   const handleSearch = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     setIsFetching(true);

//     setTimeout(() => {
//       const filtered = productData.filter((item) =>
//         item.namebn.toLowerCase().includes(value.toLowerCase()) ||
//         item.nameeng.toLowerCase().includes(value.toLowerCase()) ||
//         item.namearb.toLowerCase().includes(value.toLowerCase()) ||
//         item.ProductCode.toLowerCase().includes(value.toLowerCase()) ||
//         item.category.toLowerCase().includes(value.toLowerCase())
//       );

//       setSearchResults(filtered);
//       setIsFetching(false);
//     }, 500);
//   };

//   // ✅ Image Upload Search (unique check)
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewImage(reader.result);
//       setIsFetching(true);

//       setTimeout(() => {
//         // Compare uploaded image (base64 preview) with product image URLs (unique check)
//         const filtered = productData.filter((item) =>
//           item.image && reader.result.includes(item.image.split("/").pop())
//         );

//         setSearchResults(filtered.length > 0 ? filtered : []);
//         setIsFetching(false);
//       }, 1000);
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className="z-50 bg-gradient-to-l from-[#f09019] to-gray-600 shadow-md">
//       <div className="navbar w-11/12 mx-auto py-3">
//         {/* Logo */}
//         <div className="navbar-start flex items-center">
//           <a href="" className="flex gap-2 items-center text-black font-extrabold text-2xl">
//             <Image src={logoe} alt="logo" className="w-36" />
//             <p>
//               <span className="text-green-600">F</span>al
//               <span className="text-yellow-500">R</span>ex
//             </p>
//           </a>
//         </div>

//         {/* Search */}
//         <div className="navbar-center hidden lg:flex relative w-[55%]">
//           <div className="flex items-center bg-gray-50 border border-green-400 rounded-full px-3 py-2 w-full shadow-sm transition focus-within:ring-2 focus-within:ring-green-300">
            
//             {/* Input */}
//             <input
//               type="text"
//               placeholder="Search by name, category, code..."
//               className="flex-grow ml-4 bg-transparent outline-none placeholder-gray-400 text-sm"
//               value={searchTerm}
//               onChange={handleSearch}
//             />

//             {/* Image Upload */}
//             <label className="cursor-pointer ml-2 flex items-center text-green-500 hover:text-green-700">
//               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
//               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" id="camera">
//                 <circle cx="16" cy="16" r="16" fill="#5dc560" />
//                 <path
//                   fill="#fff"
//                   d="M12 10h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2zm4 2a3 3 0 100 6 3 3 0 000-6z"
//                 />
//               </svg>
//             </label>

//             {/* Search Icon */}
//             <div className="ml-2 text-green-500">
//               {isFetching ? (
//                 <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z" />
//                 </svg>
//               )}
//             </div>
//           </div>

//           {/* Dropdown Results */}
//           {searchTerm.length > 0 || previewImage ? (
//             <div className="absolute top-full mt-2 left-0 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
//               {isFetching ? (
//                 <p className="p-4 text-gray-500">Searching...</p>
//               ) : searchResults.length > 0 ? (
//                 searchResults.map((item) => (
//                   <div
//                     key={item._id}
//                     className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer transition"
//                   >
//                     <Image src={item.image} alt={item.nameeng} width={50} height={50} className="rounded-md" />
//                     <div>
//                       <p className="font-medium text-gray-800">{item.nameeng}</p>
//                       <p className="text-sm text-gray-500">{item.category} · Code: {item.ProductCode}</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="p-4 text-gray-500">No results found</p>
//               )}
//             </div>
//           ) : null}
//         </div>

//         {/* Profile */}
//         <div className="navbar-end flex items-center gap-4">
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//               <div className="w-10 rounded-full ring ring-green-400">
//                 <Image alt="User avatar" src={imge2} />
//               </div>
//             </div>
//             <ul tabIndex={0} className="menu menu-sm dropdown-content bg-white rounded-lg mt-3 w-52 p-2 shadow-md">
//               <li><a className="justify-between">Profile</a></li>
//               <li><a>Settings</a></li>
//               <li><a>Logout</a></li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// 'use client'
// import React, { useState } from "react";
// import imge from "../assets/falrex.png"
// import imge2 from "../assets/avatar.png"
// import imge3 from "../assets/p&e1.jpg"
// import Image from "next/image";
// import logoe from "../assets/falrex2.png"


// export default function Navebar2() {

//     const [searchTerm, setSearchTerm] = useState("");
//     const [category, setCategory] = useState("");
//     const [isFetching, setIsFetching] = useState(false);
//     const [searchResults, setSearchResults] = useState([]);
//     const [previewImage, setPreviewImage] = useState(null);

//     // Mock search results (replace with API response)
//     const mockResults = [
//         { id: 1, name: "The Great Book", description: "Bestselling novel", image: imge },
//         { id: 2, name: "Superstore Gadget", description: "Top rated gadget", image: imge2 },
//         { id: 3, name: "Wireless Headphones", description: "Noise cancelling", image: imge3 },
//     ];

//     const handleSearch = (e) => {
//         const value = e.target.value;
//         setSearchTerm(value);
//         setIsFetching(true);

//         // Simulate API search
//         setTimeout(() => {
//             const filtered = mockResults.filter((item) =>
//                 item.name.toLowerCase().includes(value.toLowerCase())
//             );
//             setSearchResults(filtered);
//             setIsFetching(false);
//         }, 500);
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onloadend = () => {
//             setPreviewImage(reader.result);
//             setIsFetching(true);

//             // Simulate image-based API search
//             setTimeout(() => {
//                 setSearchResults(mockResults); // Replace with real image search response
//                 setIsFetching(false);
//             }, 1000);
//         };
//         reader.readAsDataURL(file);
//     };

//     return (
//         <div className="z-50 bg-gradient-to-l from-[#f09019] to-gray-600 shadow-md">
//             <div className="navbar w-11/12 mx-auto py-3">
//                 {/* Logo */}
//                 <div className="navbar-start flex items-center">
//                     <a href="" className="flex gap-2 items-center text-black font-extrabold text-2xl">
//                         <Image src={logoe} alt="logo" className="w-36" />
//                         <p><span className="text-green-600">F</span>al<span className="text-yellow-500">R</span>ex</p>
//                     </a>
//                 </div>

//                 {/* Search */}
//                 <div className="navbar-center hidden lg:flex relative w-[55%]">
//                     <div className="flex items-center bg-gray-50 border border-green-400 rounded-full px-3 py-2 w-full shadow-sm transition focus-within:ring-2 focus-within:ring-green-300">
//                         {/* Category */}
//                         <div className="flex items-center space-x-2">
//                             <button
//                                 onClick={() => setCategory("books")}
//                                 className={`px-4 py-1 rounded-full text-sm font-medium transition ${category === "books"
//                                         ? "bg-green-500 text-white shadow"
//                                         : "text-gray-600 hover:bg-green-100"
//                                     }`}
//                             >
//                                 Books
//                             </button>
//                             <button
//                                 onClick={() => setCategory("superstore")}
//                                 className={`px-4 py-1 rounded-full text-sm font-medium transition ${category === "superstore"
//                                         ? "bg-green-500 text-white shadow"
//                                         : "text-gray-600 hover:bg-green-100"
//                                     }`}
//                             >
//                                 Superstore
//                             </button>
//                         </div>

//                         {/* Input */}
//                         <input
//                             type="text"
//                             placeholder="Search by name, category..."
//                             className="flex-grow ml-4 bg-transparent outline-none placeholder-gray-400 text-sm"
//                             value={searchTerm}
//                             onChange={handleSearch}
//                         />

//                         {/* Image Upload */}
//                         <label className="cursor-pointer ml-2 flex items-center text-green-500 hover:text-green-700">
//                             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
//                             {/* <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//               </svg> */}
//                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" version="1" id="camera">
//                                 <path fill="#5dc560" fillRule="evenodd" d="M32 16c0 8.824-7.176 16-16.053 16S0 24.824 0 16 7.123 0 16 0c8.877 0 16 7.176 16 16z" clipRule="evenodd"></path>
//                                 <path fill="#43ab27" d="M16.795 31.914c.808-.043 1.619-.083 2.39-.24a16.04 16.04 0 0 0 8.117-4.365 16.1 16.1 0 0 0 3.438-5.086c.406-.957.72-1.962.934-3.002.054-.263.041-.547.082-.815l-7.578-7.578a1.463 1.463 0 0 0-.987-.422L21.514 8.73c-.003-.003-.006-.002-.008-.004a.313.313 0 0 0-.201-.092H17.65c-.117.059-.236.177-.177.295V10.4H8.867c-.825 0-1.472.648-1.472 1.473v10.022c0 .412.162.781.427 1.046l8.973 8.973z"></path>
//                                 <path fill="#fff" d="M17.65 8.632c-.117.06-.235.177-.176.295V10.4H8.868a1.46 1.46 0 0 0-1.474 1.474v10.02a1.46 1.46 0 0 0 1.474 1.474h14.264a1.46 1.46 0 0 0 1.474-1.474v-10.02a1.46 1.46 0 0 0-1.474-1.474H21.6V8.927c0-.177-.177-.295-.295-.295H17.65zm-7.662 4.126H12.404c.177 0 .295.118.295.295v1.768c0 .177-.177.295-.295.295h-2.357c-.177 0-.295-.177-.295-.295v-1.768c0-.118.059-.295.236-.295zm9.254.354a3.824 3.824 0 0 1 3.831 3.831 3.824 3.824 0 0 1-3.831 3.831 3.824 3.824 0 0 1-3.831-3.83c.059-2.182 1.768-3.832 3.83-3.832zm-8.9.236v1.178h1.768v-1.178H10.34zm8.9 1.473c-1.12 0-2.063.943-2.063 2.063s.943 2.063 2.063 2.063 2.063-.943 2.063-2.063a2.05 2.05 0 0 0-2.063-2.063z"></path>
//                             </svg>


//                         </label>

//                         {/* Search Icon */}
//                         <div className="ml-2 text-green-500">
//                             {isFetching ? (
//                                 <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                                 </svg>
//                             ) : (
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z" />
//                                 </svg>
//                             )}
//                         </div>
//                     </div>

//                     {/* Dropdown Results */}
//                     {searchTerm.length > 0 || previewImage ? (
//                         <div className="absolute top-full mt-2 left-0 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
//                             {isFetching ? (
//                                 <p className="p-4 text-gray-500">Searching...</p>
//                             ) : searchResults.length > 0 ? (
//                                 searchResults.map((item) => (
//                                     <div
//                                         key={item.id}
//                                         className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer transition"
//                                     >
//                                         <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" />
//                                         <div>
//                                             <p className="font-medium text-gray-800">{item.name}</p>
//                                             <p className="text-sm text-gray-500">{item.description}</p>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="p-4 text-gray-500">No results found</p>
//                             )}
//                         </div>
//                     ) : null}
//                 </div>

//                 {/* Cart + Profile */}
//                 <div className="navbar-end flex items-center gap-4">
//                     {/* Cart */}
//                     <div className="dropdown dropdown-end">
//                         <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
//                             <div className="indicator">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
//                                         d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 
//                     2.293c-.63.63-.184 1.707.707 
//                     1.707H17m0 0a2 2 0 100 
//                     4 2 2 0 000-4zm-8 
//                     2a2 2 0 11-4 0 2 2 0 014 0z" />
//                                 </svg>
//                                 <span className="badge badge-sm indicator-item bg-green-500 text-white">8</span>
//                             </div>
//                         </div>
//                         <div tabIndex={0} className="card card-compact dropdown-content bg-white mt-3 w-56 shadow-lg">
//                             <div className="card-body">
//                                 <span className="text-lg font-bold">8 Items</span>
//                                 <span className="text-info">Subtotal: $999</span>
//                                 <div className="card-actions">
//                                     <button className="btn btn-success btn-block">View cart</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Profile */}
//                     <div className="dropdown dropdown-end">
//                         <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//                             <div className="w-10 rounded-full ring ring-green-400">
//                                 <Image alt="User avatar" src={imge2} />
//                             </div>
//                         </div>
//                         <ul tabIndex={0} className="menu menu-sm dropdown-content bg-white rounded-lg mt-3 w-52 p-2 shadow-md">
//                             <li><a className="justify-between">Profile <span className="badge bg-green-200 text-green-700">New</span></a></li>
//                             <li><a>Settings</a></li>
//                             <li><a>Logout</a></li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     )
// }