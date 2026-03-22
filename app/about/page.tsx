import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-section-alt)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label">Our Story</div>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
          >
            About the Farm
          </h1>
          <p
            className="mt-4 max-w-xl mx-auto text-lg"
            style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
          >
            How a dream of land turned into ten real acres in the Arkansas Ozarks.
          </p>
        </div>
      </section>

      {/* ── Main Story ── */}
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label">Origin</div>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
            >
              How Webb&apos;s Wild Acres Came to Be
            </h2>
            <div
              className="mx-auto mt-5 w-16 h-0.5"
              style={{ backgroundColor: "var(--color-amber)" }}
            />
          </div>

          <div
            className="space-y-6 text-lg leading-[1.9]"
            style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
          >
            <p>
              The dream of a farm started on a three-acre suburban lot in Nashville, where
              a raised bed, two potted tomatoes, and a persistent itch to do more with our
              hands slowly grew into something we couldn&apos;t ignore. We spent three years
              reading, planning, and dreaming before we made the leap.
            </p>

            <p>
              When we found our place in the Arkansas Ozark foothills, it felt like the land
              had been waiting for us. Ten acres of rolling pasture, a small woodlot of cedar
              and oak, a spring-fed creek along the southern edge, and a modest farmhouse
              that needed more love than money could easily fix. We signed the papers in
              August and spent the next two months getting the fencing right before the first
              frost.
            </p>

            <p>
              The farm is named for what it is, not what we wish it were. &ldquo;Wild Acres&rdquo;
              because the land has its own character — the blackberries that grow without asking,
              the deer that come through at dusk, the way the fog settles in the low ground on
              cold mornings. We&apos;re stewards here more than owners.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Land — stat cards ── */}
      <section className="py-20" style={{ backgroundColor: "var(--color-section-alt)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="section-label" style={{ justifyContent: "flex-start" }}>The Land</div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
              >
                Ten Acres in the Ozark Foothills
              </h2>
              <div
                className="space-y-5 leading-relaxed"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                <p>
                  Our ten acres sit at about 900 feet elevation in the Ozark foothills of
                  northwest Arkansas. The soil is a clay loam — heavy and slow to warm in
                  spring, but rich and moisture-retentive once the season gets going.
                  We&apos;ve been building organic matter with cover crops and compost since
                  we arrived.
                </p>
                <p>
                  The pasture is divided into four paddocks for rotational grazing. The
                  woodlot — about two acres of mixed cedar, white oak, and hickory — borders
                  the east side of the property and serves as windbreak, wildlife habitat,
                  and future firewood.
                </p>
                <p>
                  Arkansas gets 45 to 50 inches of rainfall in a typical year, with hot
                  summers and mild winters. The growing season runs roughly 180 days —
                  long enough for two rounds of cool-weather greens and a full summer
                  garden in between.
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Acreage", value: "10 acres" },
                { label: "Pasture", value: "7 acres" },
                { label: "Woodlot", value: "2 acres" },
                { label: "Kitchen Garden", value: "1,200 sq ft" },
                { label: "Elevation", value: "~900 ft" },
                { label: "Annual Rainfall", value: "45–50 in" },
                { label: "Growing Season", value: "~180 days" },
                { label: "Region", value: "Ozark Foothills" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card-eco p-5 text-center"
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-green-primary)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Animals ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-label">Our Animals</div>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
            >
              The Critters of Webb&apos;s Wild Acres
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                name: "Sheep",
                desc: "We started with two Katahdin ewes — Clover and Biscuit — and plan to expand to a small flock for both meat and land management. Katahdins are hair sheep that don't need shearing, which suits our skill level and available time.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9.5 13a4 4 0 0 0 5 0" />
                  </svg>
                ),
              },
              {
                name: "Laying Hens",
                desc: "A mixed flock of eight hens — Buff Orpingtons, Black Australorps, and a couple of Barred Rocks — live in a movable coop on the pasture edges. Fresh eggs every day are one of the simple joys of farm life.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                name: "Farm Dogs",
                desc: "Duke, a five-year-old Great Pyrenees mix, takes his job as livestock guardian seriously. Pepper, our three-year-old Border Collie, is still learning the difference between herding the sheep and herding the kids.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                  </svg>
                ),
              },
            ].map((animal) => (
              <div key={animal.name} className="card-eco p-7">
                <div className="mb-4" style={{ color: "var(--color-green-primary)" }}>
                  {animal.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
                >
                  {animal.name}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                >
                  {animal.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The People ── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-tan-banner)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-5 opacity-70"
            style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
          >
            — The People —
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
          >
            The People Behind the Farm
          </h2>
          <p
            className="text-lg leading-[1.85] mb-8"
            style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif", opacity: 0.85 }}
          >
            Webb&apos;s Wild Acres is a family project in every sense. We&apos;re learning
            as we go, making mistakes and celebrating small victories, and sharing all of
            it on this blog. If you&apos;re on your own homesteading journey — or just
            curious about what it looks like — we hope you&apos;ll pull up a chair and
            stay a while.
          </p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{ backgroundColor: "var(--color-brown-heading)", borderColor: "var(--color-brown-heading)" }}
          >
            Say Hello
          </Link>
        </div>
      </section>
    </>
  );
}
