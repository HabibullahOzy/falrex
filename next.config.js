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

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key:   "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key:   "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },

images: {

   domains: [
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
    ],
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