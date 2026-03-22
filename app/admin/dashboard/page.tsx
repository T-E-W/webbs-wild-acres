"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUTH_KEY = "wwa_admin_token";
const POSTS_KEY = "wwa_admin_posts";

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
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") {
      router.replace("/admin");
      return;
    }

    // Load posts: merge stored posts with data/posts.json seeds
    const stored = localStorage.getItem(POSTS_KEY);
    if (stored) {
      setPosts(JSON.parse(stored));
    } else {
      // Load seed data
      import("@/data/posts.json").then((mod) => {
        const seedPosts = mod.default as Post[];
        setPosts(seedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
      });
    }
    setLoading(false);
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem(AUTH_KEY);
    router.push("/admin");
  }

  function handleDeletePost(slug: string) {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    const updated = posts.filter((p) => p.slug !== slug);
    setPosts(updated);
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
        <p
          className="text-[var(--color-farm-brown)]"
          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)]">
      {/* Admin Nav */}
      <header className="wood-texture shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐑</span>
              <span
                className="text-[var(--color-farm-cream)] font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Webb&apos;s Wild Acres — Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                target="_blank"
              >
                View Site
              </Link>
              <button
                onClick={handleSignOut}
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-[var(--color-farm-brown)]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Blog Posts
            </h1>
            <p
              className="text-[var(--color-farm-brown-dark)] text-sm mt-1"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              {posts.length} post{posts.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link href="/admin/posts/new" className="btn-rustic">
            + New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Posts", value: posts.length, icon: "📝" },
            { label: "Published", value: posts.length, icon: "✅" },
            { label: "Drafts", value: 0, icon: "📋" },
          ].map((stat) => (
            <div key={stat.label} className="card-rustic p-5 flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p
                  className="text-2xl font-bold text-[var(--color-farm-brown)]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Posts Table */}
        {posts.length === 0 ? (
          <div className="card-rustic p-16 text-center">
            <span className="text-5xl block mb-4">📝</span>
            <h2
              className="text-xl font-bold text-[var(--color-farm-brown)] mb-2"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              No Posts Yet
            </h2>
            <p
              className="text-[var(--color-farm-brown-dark)] mb-6"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Create your first blog post to get started.
            </p>
            <Link href="/admin/posts/new" className="btn-rustic">
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="card-rustic overflow-hidden">
            <div className="h-1 bg-[var(--color-farm-brown)]" />
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-farm-cream-dark)] border-b border-[var(--color-farm-tan-light)]">
                  <th
                    className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-farm-brown)] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    Title
                  </th>
                  <th
                    className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-farm-brown)] uppercase tracking-wider hidden sm:table-cell"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    Date
                  </th>
                  <th
                    className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-farm-brown)] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-farm-tan-light)]">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-[var(--color-farm-cream)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className="font-semibold text-[var(--color-farm-brown)] text-sm"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          {post.title}
                        </p>
                        <p
                          className="text-[var(--color-farm-tan)] text-xs mt-0.5 truncate max-w-xs"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          /{post.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span
                        className="text-[var(--color-farm-brown-dark)] text-sm"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        {formatDate(post.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block bg-[var(--color-farm-green)] text-[var(--color-farm-cream)] text-xs px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-[var(--color-farm-green)] hover:text-[var(--color-farm-green-dark)] text-xs font-semibold uppercase tracking-wider transition-colors"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/posts/new?edit=${post.slug}`}
                          className="text-[var(--color-farm-brown)] hover:text-[var(--color-farm-brown-dark)] text-xs font-semibold uppercase tracking-wider transition-colors"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.slug)}
                          className="text-[var(--color-farm-rust)] hover:text-red-700 text-xs font-semibold uppercase tracking-wider transition-colors"
                          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
