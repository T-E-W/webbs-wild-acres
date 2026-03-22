import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-[var(--color-farm-green)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-[var(--color-farm-tan-light)] text-sm tracking-widest uppercase font-semibold mb-3"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Our Story
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--color-farm-cream)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            About the Farm
          </h1>
        </div>
      </section>

      {/* Main Story */}
      <section className="bg-[var(--color-farm-cream)] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose-rustic">
            <div className="text-center mb-12">
              <span className="text-5xl block mb-4">🐑</span>
              <h2
                className="text-3xl font-bold text-[var(--color-farm-brown)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                How Webb&apos;s Wild Acres Came to Be
              </h2>
              <hr className="section-divider mx-auto max-w-xs mt-4" />
            </div>

            <p
              className="text-[var(--color-farm-brown-dark)] text-lg leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              The dream of a farm started on a three-acre suburban lot in Nashville, where
              a raised bed, two potted tomatoes, and a persistent itch to do more with our
              hands slowly grew into something we couldn&apos;t ignore. We spent three years
              reading, planning, and dreaming before we made the leap.
            </p>

            <p
              className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              When we found our place in the Arkansas Ozark foothills, it felt like the land
              had been waiting for us. Ten acres of rolling pasture, a small woodlot of cedar
              and oak, a spring-fed creek along the southern edge, and a modest farmhouse
              that needed more love than money could easily fix. We signed the papers in
              August and spent the next two months getting the fencing right before the first
              frost.
            </p>

            <p
              className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              The farm is named for what it is, not what we wish it were. &ldquo;Wild Acres&rdquo;
              because the land has its own character — the blackberries that grow without asking,
              the deer that come through at dusk, the way the fog settles in the low ground on
              cold mornings. We&apos;re stewards here more than owners.
            </p>
          </div>
        </div>
      </section>

      {/* The Land */}
      <section className="bg-[var(--color-farm-cream-dark)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="text-3xl font-bold text-[var(--color-farm-brown)] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                The Land
              </h2>
              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Our ten acres sit at about 900 feet elevation in the Ozark foothills of
                northwest Arkansas. The soil is a clay loam — heavy and slow to warm in
                spring, but rich and moisture-retentive once the season gets going.
                We&apos;ve been building organic matter with cover crops and compost since
                we arrived.
              </p>
              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                The pasture is divided into four paddocks for rotational grazing. The
                woodlot — about two acres of mixed cedar, white oak, and hickory — borders
                the east side of the property and serves as windbreak, wildlife habitat,
                and future firewood.
              </p>
              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Arkansas gets 45 to 50 inches of rainfall in a typical year, with hot
                summers and mild winters. The growing season runs roughly 180 days —
                long enough for two rounds of cool-weather greens and a full summer
                garden in between.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Total Acreage", value: "10 acres" },
                { label: "Pasture", value: "7 acres (4 paddocks)" },
                { label: "Woodlot", value: "2 acres mixed hardwood" },
                { label: "Kitchen Garden", value: "~1,200 sq ft" },
                { label: "Elevation", value: "~900 ft" },
                { label: "Annual Rainfall", value: "45–50 inches" },
                { label: "Growing Season", value: "~180 days" },
                { label: "Region", value: "Arkansas Ozark Foothills" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between items-center py-3 border-b border-[var(--color-farm-tan-light)]"
                >
                  <span
                    className="text-[var(--color-farm-brown)] font-semibold text-sm"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className="text-[var(--color-farm-brown-dark)] text-sm"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Animals */}
      <section className="bg-[var(--color-farm-cream)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-[var(--color-farm-brown)] mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            The Animals
          </h2>
          <hr className="section-divider mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🐑",
                name: "Sheep",
                desc: "We started with two Katahdin ewes — Clover and Biscuit — and plan to expand to a small flock for both meat and land management. Katahdins are hair sheep that don't need shearing, which suits our skill level and available time.",
              },
              {
                icon: "🐔",
                name: "Laying Hens",
                desc: "A mixed flock of eight hens — Buff Orpingtons, Black Australorps, and a couple of Barred Rocks — live in a movable coop on the pasture edges. Fresh eggs every day are one of the simple joys of farm life.",
              },
              {
                icon: "🐕",
                name: "Farm Dogs",
                desc: "Duke, a five-year-old Great Pyrenees mix, takes his job as livestock guardian seriously. Pepper, our three-year-old Border Collie, is still learning the difference between herding the sheep and herding the kids.",
              },
            ].map((animal) => (
              <div key={animal.name} className="card-rustic p-6">
                <span className="text-4xl block mb-4">{animal.icon}</span>
                <h3
                  className="text-xl font-bold text-[var(--color-farm-brown)] mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {animal.name}
                </h3>
                <p
                  className="text-[var(--color-farm-brown-dark)] text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  {animal.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The People */}
      <section className="bg-[var(--color-farm-green)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold text-[var(--color-farm-cream)] mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            The People Behind the Farm
          </h2>
          <p
            className="text-[var(--color-farm-tan-light)] text-lg leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Webb&apos;s Wild Acres is a family project in every sense. We&apos;re learning
            as we go, making mistakes and celebrating small victories, and sharing all of
            it on this blog. If you&apos;re on your own homesteading journey — or just
            curious about what it looks like — we hope you&apos;ll pull up a chair and
            stay a while.
          </p>
          <Link href="/contact" className="btn-rustic-outline">
            Say Hello
          </Link>
        </div>
      </section>
    </>
  );
}
