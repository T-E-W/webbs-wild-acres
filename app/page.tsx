import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600"
          alt="Golden farm field at sunset"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="100vw"
          unoptimized
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,30,15,0.45) 0%, rgba(20,30,15,0.65) 60%, rgba(20,30,15,0.8) 100%)",
          }}
        />

        {/* Content */}
        <div
          className="relative flex flex-col items-center justify-center text-center h-full px-4 sm:px-8"
          style={{ minHeight: "92vh" }}
        >
          {/* Eyebrow label */}
          <p
            className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6 opacity-90"
            style={{ fontFamily: "var(--font-lato), sans-serif" }}
          >
            — Arkansas Ozark Foothills —
          </p>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            Rooted in Nature,{" "}
            <em style={{ color: "var(--color-tan-banner)" }}>Wild at Heart</em>
          </h1>

          <p
            className="text-white text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-90"
            style={{ fontFamily: "var(--font-lato), sans-serif", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
          >
            A small family farm tucked into ten acres of Arkansas hill country —
            where the grass grows long, the animals roam free, and every season
            brings something new to learn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/about" className="btn-primary">
              Our Story
            </Link>
            <Link href="/blog" className="btn-outline-white">
              Read the Blog
            </Link>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #ffffff)" }}
        />
      </section>

      {/* ── Welcome Section ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label">Welcome to the Farm</div>
              <h2
                className="text-4xl sm:text-5xl font-bold mb-6 leading-snug"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  color: "var(--color-brown-heading)",
                }}
              >
                Ten Acres of Pasture &amp; Possibility
              </h2>
              <p
                className="text-lg leading-relaxed mb-5"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                Webb&apos;s Wild Acres is a small family homestead in the foothills of
                the Arkansas Ozarks. We raise sheep, tend a kitchen garden, and do our
                best to work with the land instead of against it.
              </p>
              <p
                className="leading-relaxed mb-10"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                This isn&apos;t a picture-perfect operation — it&apos;s a real farm, with
                real mud, real learning curves, and the real satisfaction of building
                something from the ground up. We&apos;re glad you&apos;re here.
              </p>
              <Link href="/about" className="btn-primary">
                Learn Our Story
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-5">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  ),
                  title: "Pasture-Raised Sheep",
                  desc: "Heritage breeds roaming ten acres of Arkansas hill country",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  ),
                  title: "Kitchen Garden",
                  desc: "Seasonal vegetables, herbs, and whatever the deer don&apos;t get to first",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  ),
                  title: "Woodland Stewardship",
                  desc: "Managing our woodlot for wildlife, timber, and beauty",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  ),
                  title: "Simple Living",
                  desc: "Learning to work with the rhythms of the land and the seasons",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="card-eco p-6"
                >
                  <div className="mb-4" style={{ color: "var(--color-green-primary)" }}>
                    {item.icon}
                  </div>
                  <h3
                    className="font-bold mb-2 text-sm"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      color: "var(--color-brown-heading)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Amber promo strip ── */}
      <section style={{ backgroundColor: "var(--color-tan-banner)" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
            style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif", opacity: 0.7 }}
          >
            — Seasonal Update —
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-5 leading-snug"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
          >
            Spring Has Arrived on the Acres
          </h2>
          <p
            className="text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
            style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif", opacity: 0.85 }}
          >
            The frost is done, the pasture is greening up, and the garden beds
            are ready. Follow along on the blog as we document this year&apos;s
            growing season.
          </p>
          <Link
            href="/blog"
            className="btn-primary"
            style={{ backgroundColor: "var(--color-brown-heading)", borderColor: "var(--color-brown-heading)" }}
          >
            Read the Latest
          </Link>
        </div>
      </section>

      {/* ── Services / Coming Soon ── */}
      <section className="py-24" style={{ backgroundColor: "var(--color-section-alt)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label">On the Horizon</div>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
            >
              What&apos;s Coming to Webb&apos;s Wild Acres
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
            >
              We&apos;re always growing. Here&apos;s a look at what we&apos;re
              building toward over the next year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                tag: "Coming Spring 2026",
                title: "Farm Stand",
                desc: "Fresh eggs, seasonal produce, and handmade goods — available for local pickup in the Ozarks.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                ),
              },
              {
                tag: "Coming Summer 2026",
                title: "Monthly Newsletter",
                desc: "Seasonal updates, homestead how-tos, and honest stories from the farm delivered to your inbox.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                ),
              },
              {
                tag: "Coming Fall 2026",
                title: "Photo Journal",
                desc: "A visual diary of life on the acres — the good harvests, the hard days, and everything in between.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="card-eco p-8 flex flex-col">
                <div className="mb-5" style={{ color: "var(--color-green-primary)" }}>
                  {feature.icon}
                </div>
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider w-fit"
                  style={{
                    backgroundColor: "rgba(74,124,63,0.1)",
                    color: "var(--color-green-primary)",
                    fontFamily: "var(--font-lato), sans-serif",
                  }}
                >
                  {feature.tag}
                </span>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section
        className="py-20"
        style={{ backgroundColor: "var(--color-green-primary)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4 opacity-70 text-white"
            style={{ fontFamily: "var(--font-lato), sans-serif" }}
          >
            — Get in Touch —
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Have a Question or Want to Say Hello?
          </h2>
          <p
            className="text-lg mb-9 max-w-xl mx-auto opacity-85 text-white"
            style={{ fontFamily: "var(--font-lato), sans-serif" }}
          >
            We love hearing from folks who share a passion for the land.
          </p>
          <Link href="/contact" className="btn-outline-white">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
