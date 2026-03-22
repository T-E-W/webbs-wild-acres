import Link from "next/link";
import Image from "next/image";

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
            15.25 acres of pasture, wildlife, and wide-open sky in Vilonia, Arkansas.
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
              There&apos;s something about a piece of land that gets under your skin. For us,
              it started as a quiet wish — a little room to breathe, a garden worth digging
              into, a place where the kids could run and the evenings could slow down. That
              wish led us to Vilonia, Arkansas, and to 15.25 acres that felt, the moment we
              walked it, like it had always been ours to steward.
            </p>

            <p>
              The name came easy. &ldquo;Wild Acres&rdquo; because the land had a life of its own long
              before we arrived — deer trails worn into the pasture edges, a food plot thick
              with browse, and more wildlife moving through than we expected. We didn&apos;t come
              here to tame it. We came to be part of it.
            </p>

            <p>
              The farm has a good-bones feel to it. A solid barn with a loft. Two chicken
              coops already in place. Pasture that&apos;s fenced and cross-fenced for rotation.
              And a wrap-around porch that earns its keep every single evening. This is a
              working farm, but it&apos;s also home — and we&apos;re building both at the same time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Photo Grid ── */}
      <section className="bg-white pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Barn photo */}
            <div className="flex flex-col gap-3">
              <div className="w-full rounded-xl overflow-hidden" style={{ height: "220px", position: "relative" }}>
                <Image src="/images/barn_and_loft.webp" alt="Barn & Loft" fill style={{ objectFit: "cover" }} />
              </div>
              <p className="text-sm text-center font-medium" style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}>Barn & Loft</p>
            </div>
            {/* Placeholder - Pasture */}
            <div className="flex flex-col gap-3">
              <div className="w-full rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e8e4dc", border: "1px dashed #c5bfb2", height: "220px" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--color-brown-body)", opacity: 0.6 }}>Photo coming soon</p>
              </div>
              <p className="text-sm text-center font-medium" style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}>Pasture & Fencing</p>
            </div>
            {/* Placeholder - Porch */}
            <div className="flex flex-col gap-3">
              <div className="w-full rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e8e4dc", border: "1px dashed #c5bfb2", height: "220px" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--color-brown-body)", opacity: 0.6 }}>Photo coming soon</p>
              </div>
              <p className="text-sm text-center font-medium" style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}>The Wrap-Around Porch</p>
            </div>
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
                15.25 Acres in Vilonia, Arkansas
              </h2>
              <div
                className="space-y-5 leading-relaxed"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                <p>
                  The pasture is fenced and cross-fenced — laid out for rotational grazing
                  and real flexibility as the farm evolves. It&apos;s practical land, put together
                  by someone who understood how livestock and ground interact.
                </p>
                <p>
                  One corner of the property holds a dedicated food plot that draws deer
                  consistently through the seasons. Turkeys, songbirds, and the occasional
                  fox round out the wildlife calendar. It&apos;s a quiet reminder that we share
                  this place with a lot more than our chickens.
                </p>
                <p>
                  The barn is the heart of the working side of the farm — solid structure,
                  loft overhead for hay storage, and enough room to grow into. The two
                  chicken coops are positioned to take advantage of the pasture rotation,
                  and the wrap-around porch is where most of the planning and all of the
                  unwinding happens.
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Acreage", value: "15.25 acres" },
                { label: "Location", value: "Vilonia, AR" },
                { label: "Barn", value: "With Loft" },
                { label: "Chicken Coops", value: "2" },
                { label: "Pasture", value: "Fenced & Cross-Fenced" },
                { label: "Food Plot", value: "Deer & Wildlife" },
                { label: "Porch", value: "Wrap-Around" },
                { label: "Region", value: "Central Arkansas" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card-eco p-5 text-center"
                >
                  <p
                    className="text-xl font-bold mb-1"
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

      {/* ── The Wildlife ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-label">Wildlife & Land</div>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
            >
              What Shares the Acres with Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                name: "Deer & Food Plot",
                desc: "The food plot was here when we arrived, and the deer found it long before we did. We manage it to keep drawing them in — it&apos;s one of the quiet joys of the property, watching them move through at dusk from the porch.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1 2-3 3-3 5s1 3 3 3 3-1 3-3-2-3-3-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v10M9 14l3-3 3 3" />
                  </svg>
                ),
              },
              {
                name: "Laying Hens",
                desc: "Two chicken coops, two flocks — fresh eggs are one of the daily rhythms of farm life here. The coops are set up to integrate with the pasture rotation, letting the hens work the ground between grazing cycles.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                name: "Abundant Wildlife",
                desc: "Beyond the deer, the property draws turkeys, songbirds, hawks, and more than a few creatures we&apos;re still getting to know. The cross-fenced pasture and the food plot together create a patchwork of habitat that keeps things interesting year-round.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.name} className="card-eco p-7">
                <div className="mb-4" style={{ color: "var(--color-green-primary)" }}>
                  {item.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
                >
                  {item.name}
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
            The Family Behind the Farm
          </h2>
          <p
            className="text-lg leading-[1.85] mb-8"
            style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif", opacity: 0.85 }}
          >
            Webb&apos;s Wild Acres is a family project — built on a piece of Arkansas land
            we&apos;re still learning, with plans that grow alongside the seasons. We share
            what we figure out here, honestly and without pretense. If you&apos;re working
            your own land, thinking about it, or just love the idea of it, we&apos;re glad
            you found us. Pull up a chair on the porch.
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
