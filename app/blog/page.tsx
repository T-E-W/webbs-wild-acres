import Link from "next/link";
import postsData from "@/data/posts.json";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts: Post[] = postsData;

  return (
    <>
      {/* ── Page Header ── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-section-alt)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label">From the Farm</div>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
          >
            The Blog
          </h1>
          <p
            className="mt-4 max-w-xl mx-auto text-lg"
            style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
          >
            Stories, updates, and honest observations from life on ten acres in
            the Arkansas Ozarks.
          </p>
        </div>
      </section>

      {/* ── Post Grid ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--color-section-alt)" }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ color: "var(--color-green-primary)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
              >
                No Posts Yet
              </h2>
              <p style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}>
                Check back soon — we&apos;re just getting started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {posts.map((post) => (
                <article key={post.slug} className="card-eco flex flex-col">
                  {/* Color bar accent */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: "var(--color-green-primary)" }}
                  />

                  <div className="p-7 flex flex-col flex-1">
                    {/* Date + category */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-amber)", fontFamily: "var(--font-lato), sans-serif" }}
                      >
                        {formatDate(post.date)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-border)" }}
                      >
                        •
                      </span>
                      <span
                        className="text-xs uppercase tracking-wider"
                        style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                      >
                        Farm Life
                      </span>
                    </div>

                    <h2
                      className="text-xl font-bold mb-3 leading-snug"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline transition-colors"
                        style={{ textDecorationColor: "var(--color-green-primary)" }}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p
                      className="text-sm leading-relaxed mb-6 flex-1"
                      style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider transition-colors"
                      style={{
                        color: "var(--color-green-primary)",
                        fontFamily: "var(--font-lato), sans-serif",
                      }}
                    >
                      Read Full Post
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
