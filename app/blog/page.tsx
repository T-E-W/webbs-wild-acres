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
      {/* Page Header */}
      <section className="bg-[var(--color-farm-green)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-[var(--color-farm-tan-light)] text-sm tracking-widest uppercase font-semibold mb-3"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            From the Farm
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--color-farm-cream)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            The Blog
          </h1>
          <p
            className="text-[var(--color-farm-tan-light)] mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Stories, updates, and honest observations from life on ten acres in
            the Arkansas Ozarks.
          </p>
        </div>
      </section>

      {/* Post List */}
      <section className="bg-[var(--color-farm-cream)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">📝</span>
              <h2
                className="text-2xl font-bold text-[var(--color-farm-brown)] mb-3"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                No Posts Yet
              </h2>
              <p
                className="text-[var(--color-farm-brown-dark)]"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Check back soon — we&apos;re just getting started.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {posts.map((post, index) => (
                <article key={post.slug}>
                  <div className="card-rustic overflow-hidden">
                    {/* Decorative top bar */}
                    <div className="h-1.5 bg-[var(--color-farm-green)]" />

                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="text-[var(--color-farm-green)] text-xs font-semibold uppercase tracking-widest"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          {formatDate(post.date)}
                        </span>
                        <span className="text-[var(--color-farm-tan)] text-xs">•</span>
                        <span
                          className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          Farm Life
                        </span>
                      </div>

                      <h2
                        className="text-2xl sm:text-3xl font-bold text-[var(--color-farm-brown)] mb-4 leading-snug"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-[var(--color-farm-rust)] transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p
                        className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-6 text-base"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        {post.excerpt}
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-[var(--color-farm-green)] font-semibold text-sm hover:text-[var(--color-farm-green-dark)] transition-colors"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        Read Full Post
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>

                  {index < posts.length - 1 && (
                    <hr className="section-divider mt-10" />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
