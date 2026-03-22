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
      <body className="min-h-screen flex flex-col">
        <header className="wood-texture shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl" aria-hidden="true">🐑</span>
                <div>
                  <span
                    className="text-[var(--color-farm-cream)] font-bold text-lg leading-tight block"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Webb&apos;s Wild Acres
                  </span>
                  <span
                    className="text-[var(--color-farm-tan-light)] text-xs tracking-widest uppercase block"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    Farm &amp; Homestead
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/blog" className="nav-link">Blog</Link>
                <Link href="/contact" className="nav-link">Contact</Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="wood-texture text-[var(--color-farm-cream)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🐑</span>
                  <span
                    className="font-bold text-lg"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Webb&apos;s Wild Acres
                  </span>
                </div>
                <p className="text-[var(--color-farm-tan-light)] text-sm leading-relaxed">
                  A small family farm nestled in the Arkansas Ozark foothills.
                  Ten acres of pasture, woodland, and garden.
                </p>
              </div>

              <div>
                <h3
                  className="font-semibold text-[var(--color-farm-gold)] mb-3 text-sm tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About the Farm" },
                    { href: "/blog", label: "Farm Blog" },
                    { href: "/contact", label: "Contact Us" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[var(--color-farm-tan-light)] hover:text-[var(--color-farm-gold)] text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3
                  className="font-semibold text-[var(--color-farm-gold)] mb-3 text-sm tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  Find Us
                </h3>
                <p className="text-[var(--color-farm-tan-light)] text-sm leading-relaxed">
                  Arkansas Ozark Foothills<br />
                  <Link
                    href="/contact"
                    className="text-[var(--color-farm-gold)] hover:underline"
                  >
                    Send us a message
                  </Link>
                </p>
              </div>
            </div>

            <div className="border-t border-[var(--color-farm-bark)] pt-6 text-center">
              <p className="text-[var(--color-farm-tan)] text-sm">
                &copy; {new Date().getFullYear()} Webb&apos;s Wild Acres. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
