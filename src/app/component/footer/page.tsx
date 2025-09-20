"use client";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import img1 from "../../assets/falrexm.jpg";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-gray-300 relative z-10">
      <div className="w-11/12 mx-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={img1}
              alt="Falrex Logo"
              width={380}
              height={380}
              className="rounded-2xl shadow-lg"
            />
            
          </div>
          {/* <h2 className="text-2xl font-extrabold text-white">
              <span className="text-green-400">F</span>al
              <span className="text-yellow-400">R</span>ex
            </h2> */}
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Bringing you premium quality products with modern design and top
            performance. We believe in innovation and trust.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { name: "Home", href: "/" },
              { name: "About", href: "/about" },
              { name: "Shop", href: "/shop" },
              { name: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-yellow-400 transition duration-200"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="">
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <p className="text-sm">📧 support@falrex.com</p>
          <p className="text-sm">📞 +880 1609111813</p>
          <p className="text-sm">📍 Dhaka, Bangladesh</p>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <Link
              href="https://www.facebook.com/profile.php?id=61579781729132"
              className="p-2 bg-gray-800 rounded-full hover:bg-green-400 hover:text-black transition duration-300"
            >
              <Facebook className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61579781729132"
              className="p-2 bg-gray-800 rounded-full hover:bg-green-400 hover:text-black transition duration-300"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61579781729132"
              className="p-2 bg-gray-800 rounded-full hover:bg-green-400 hover:text-black transition duration-300"
            >
              <Instagram className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61579781729132"
              className="p-2 bg-gray-800 rounded-full hover:bg-yellow-400 hover:text-black transition duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-6 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-white font-semibold">Falrex</span>. All rights
        reserved.
      </div>
    </footer>
  );
}
