import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Webb's Wild Acres",
  description: "Rooted in Nature, Wild at Heart — a small family farm in the Arkansas Ozark foothills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col bg-white">

        {/* Top bar */}
        <div className="top-bar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <a
              href="mailto:hello@webbswildacres.com"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5 inline-block"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              hello@webbswildacres.com
            </a>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs opacity-60 tracking-widest uppercase">
                Arkansas Ozark Foothills
              </span>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Follow us on Facebook"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Follow us on Instagram"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <header className="bg-white border-b border-[#e2d9cc] sticky top-0 z-50 shadow-sm">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 py-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold"
                  style={{ backgroundColor: "var(--color-green-primary)" }}
                  aria-hidden="true"
                >
                  W
                </div>
                <div>
                  <span
                    className="text-[var(--color-brown-heading)] font-bold text-base leading-tight block group-hover:text-[var(--color-green-primary)] transition-colors"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Webb&apos;s Wild Acres
                  </span>
                  <span
                    className="text-[var(--color-amber)] text-[10px] tracking-widest uppercase block"
                    style={{ fontFamily: "var(--font-lato), sans-serif" }}
                  >
                    Farm &amp; Homestead
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-8">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/blog" className="nav-link">Blog</Link>
                <Link href="/contact" className="nav-link btn-primary !py-2 !px-5 !border-none">
                  Contact
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: "var(--color-brown-heading)" }} className="text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

              {/* Brand column */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: "var(--color-green-primary)" }}
                    aria-hidden="true"
                  >
                    W
                  </div>
                  <span
                    className="font-bold text-lg text-white"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Webb&apos;s Wild Acres
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed mb-5 max-w-xs"
                  style={{ color: "var(--color-tan-light)" }}
                >
                  A small family farm nestled in the Arkansas Ozark foothills.
                  Ten acres of pasture, woodland, and garden where we work
                  with the land, not against it.
                </p>
                <a
                  href="mailto:hello@webbswildacres.com"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: "var(--color-amber-light)" }}
                >
                  hello@webbswildacres.com
                </a>
              </div>

              {/* Quick links */}
              <div>
                <h3
                  className="text-xs font-bold tracking-widest uppercase mb-5"
                  style={{ color: "var(--color-amber)", fontFamily: "var(--font-lato), sans-serif" }}
                >
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About the Farm" },
                    { href: "/blog", label: "Farm Blog" },
                    { href: "/contact", label: "Contact Us" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-white transition-colors"
                        style={{ color: "var(--color-tan-light)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Location */}
              <div>
                <h3
                  className="text-xs font-bold tracking-widest uppercase mb-5"
                  style={{ color: "var(--color-amber)", fontFamily: "var(--font-lato), sans-serif" }}
                >
                  Find Us
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-tan-light)" }}
                >
                  Arkansas Ozark Foothills
                </p>
                <Link
                  href="/contact"
                  className="text-sm hover:text-white transition-colors mt-2 block"
                  style={{ color: "var(--color-amber-light)" }}
                >
                  Send us a message &rarr;
                </Link>
              </div>
            </div>

            <div
              className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-xs" style={{ color: "rgba(232,201,154,0.6)" }}>
                &copy; {new Date().getFullYear()} Webb&apos;s Wild Acres. All rights reserved.
              </p>
              <p className="text-xs" style={{ color: "rgba(232,201,154,0.4)" }}>
                Rooted in Nature, Wild at Heart
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
