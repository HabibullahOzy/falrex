// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */

//   // output: "export",
  

// images: {
//    unoptimized: true
//   },

//    eslint: {
//     ignoreDuringBuilds: true,
//   },

//   // output: 'standalone'

// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
   unoptimized: true,
   remotePatterns: [
      {
        protocol: "https",
        hostname:  "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname:  "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname:  "*.railway.app",
      },
    ],
  },

   eslint: {
    ignoreDuringBuilds: true,
  },

  // output: 'standalone'
};



module.exports = nextConfig;