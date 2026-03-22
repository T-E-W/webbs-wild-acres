import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 20px
              )`,
            }}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <div
            className="inline-flex items-center gap-2 text-[var(--color-farm-cream)] text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6 border border-[rgba(255,255,255,0.2)]"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <span>🌿</span>
            <span>Arkansas Ozark Foothills</span>
            <span>🌿</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-farm-cream)] leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Rooted in Nature,<br />
            <em className="text-[var(--color-farm-gold)]">Wild at Heart</em>
          </h1>

          <p
            className="text-[var(--color-farm-tan-light)] text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            A small family farm tucked into ten acres of Arkansas hill country —
            where the grass grows long, the animals roam free, and every season
            brings something new to learn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/about" className="btn-rustic">
              Our Story
            </Link>
            <Link href="/blog" className="btn-rustic-outline">
              Read the Blog
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-12"
          >
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f5f0e8" />
          </svg>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="bg-[var(--color-farm-cream)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="text-[var(--color-farm-green)] text-sm tracking-widest uppercase font-semibold mb-3"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Welcome to the farm
              </p>
              <h2
                className="text-4xl font-bold text-[var(--color-farm-brown)] mb-6 leading-snug"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Ten Acres of Pasture &amp; Possibility
              </h2>
              <hr className="section-divider" />
              <p
                className="text-[var(--color-farm-brown-dark)] text-lg leading-relaxed mb-5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Webb&apos;s Wild Acres is a small family homestead in the foothills of
                the Arkansas Ozarks. We raise sheep, tend a kitchen garden, and do our
                best to work with the land instead of against it.
              </p>
              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                This isn&apos;t a picture-perfect operation — it&apos;s a real farm, with
                real mud, real learning curves, and the real satisfaction of building
                something from the ground up. We&apos;re glad you&apos;re here.
              </p>
              <Link href="/about" className="btn-rustic">
                Learn Our Story
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "🐑",
                  title: "Pasture-Raised Sheep",
                  desc: "Heritage breeds roaming ten acres of Arkansas hill country",
                },
                {
                  icon: "🥬",
                  title: "Kitchen Garden",
                  desc: "Seasonal vegetables, herbs, and whatever the deer don't get to first",
                },
                {
                  icon: "🌲",
                  title: "Woodland Stewardship",
                  desc: "Managing our woodlot for wildlife, timber, and beauty",
                },
                {
                  icon: "🏡",
                  title: "Simple Living",
                  desc: "Learning to work with the rhythms of the land and the seasons",
                },
              ].map((item) => (
                <div key={item.title} className="card-rustic p-5">
                  <span className="text-3xl block mb-3">{item.icon}</span>
                  <h3
                    className="font-bold text-[var(--color-farm-brown)] mb-2 text-sm"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[var(--color-farm-brown-dark)] text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Banner */}
      <section className="bg-[var(--color-farm-green)] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-4xl block mb-4">🌱</span>
          <h2
            className="text-3xl font-bold text-[var(--color-farm-cream)] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Spring Has Arrived on the Acres
          </h2>
          <p
            className="text-[var(--color-farm-tan-light)] text-lg leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            The frost is done, the pasture is greening up, and the garden beds
            are ready. Follow along on the blog as we document this year&apos;s
            growing season.
          </p>
          <Link href="/blog" className="btn-rustic-outline">
            Read the Latest
          </Link>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="bg-[var(--color-farm-cream-dark)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-[var(--color-farm-green)] text-sm tracking-widest uppercase font-semibold mb-3"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              On the horizon
            </p>
            <h2
              className="text-4xl font-bold text-[var(--color-farm-brown)] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              What&apos;s Coming to Webb&apos;s Wild Acres
            </h2>
            <p
              className="text-[var(--color-farm-brown-dark)] max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              We&apos;re always growing. Here&apos;s a look at what we&apos;re
              building toward over the next year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🛒",
                tag: "Coming Spring 2026",
                title: "Farm Stand",
                desc: "Fresh eggs, seasonal produce, and handmade goods — available for local pickup in the Ozarks.",
              },
              {
                icon: "📰",
                tag: "Coming Summer 2026",
                title: "Monthly Newsletter",
                desc: "Seasonal updates, homestead how-tos, and honest stories from the farm delivered to your inbox.",
              },
              {
                icon: "📸",
                tag: "Coming Fall 2026",
                title: "Photo Journal",
                desc: "A visual diary of life on the acres — the good harvests, the hard days, and everything in between.",
              },
            ].map((feature) => (
              <div key={feature.title} className="card-rustic p-7">
                <span className="text-4xl block mb-4">{feature.icon}</span>
                <span
                  className="inline-block bg-[var(--color-farm-green)] text-[var(--color-farm-cream)] text-xs px-2 py-1 rounded uppercase tracking-wider mb-3"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  {feature.tag}
                </span>
                <h3
                  className="text-xl font-bold text-[var(--color-farm-brown)] mb-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[var(--color-farm-brown-dark)] text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="wood-texture py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold text-[var(--color-farm-cream)] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Have a Question or Want to Say Hello?
          </h2>
          <p
            className="text-[var(--color-farm-tan-light)] mb-8 text-lg"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            We love hearing from folks who share a passion for the land.
          </p>
          <Link href="/contact" className="btn-rustic-outline">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
