import Link from "next/link";
import { notFound } from "next/navigation";
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

export function generateStaticParams() {
  return postsData.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const posts: Post[] = postsData;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split("\n\n").filter(Boolean);
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <>
      {/* Post Header */}
      <section className="bg-[var(--color-farm-green)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span
              className="text-[var(--color-farm-tan-light)] text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              {formatDate(post.date)}
            </span>
            <span className="text-[var(--color-farm-tan)] text-xs">•</span>
            <span
              className="text-[var(--color-farm-tan-light)] text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Farm Life
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-bold text-[var(--color-farm-cream)] leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {post.title}
          </h1>

          <p
            className="text-[var(--color-farm-tan-light)] text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Post Content */}
      <section className="bg-[var(--color-farm-cream)] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-10">
            <Link
              href="/blog"
              className="text-[var(--color-farm-green)] hover:text-[var(--color-farm-green-dark)] transition-colors"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              ← Back to Blog
            </Link>
          </nav>

          <article>
            <div className="prose-rustic">
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[var(--color-farm-brown-dark)] text-lg leading-relaxed mb-6"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <hr className="section-divider mt-12 mb-10" />

          {/* Post Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {prevPost && (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="card-rustic p-5 hover:shadow-md transition-shadow group"
              >
                <span
                  className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider block mb-2"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  ← Previous Post
                </span>
                <span
                  className="font-bold text-[var(--color-farm-brown)] group-hover:text-[var(--color-farm-rust)] transition-colors"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {prevPost.title}
                </span>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="card-rustic p-5 hover:shadow-md transition-shadow group sm:text-right sm:ml-auto w-full"
              >
                <span
                  className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider block mb-2"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  Next Post →
                </span>
                <span
                  className="font-bold text-[var(--color-farm-brown)] group-hover:text-[var(--color-farm-rust)] transition-colors"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
