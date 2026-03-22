"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const AUTH_KEY = "wwa_admin_token";
const POSTS_KEY = "wwa_admin_posts";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function NewPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; excerpt?: string; content?: string }>({});
  const isEditing = Boolean(editSlug);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") {
      router.replace("/admin");
      return;
    }

    if (editSlug) {
      const stored = localStorage.getItem(POSTS_KEY);
      if (stored) {
        const posts: Post[] = JSON.parse(stored);
        const post = posts.find((p) => p.slug === editSlug);
        if (post) {
          setTitle(post.title);
          setExcerpt(post.excerpt);
          setContent(post.content);
        }
      }
    }
  }, [router, editSlug]);

  function validate() {
    const errs: { title?: string; excerpt?: string; content?: string } = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!excerpt.trim()) errs.excerpt = "A short excerpt is required.";
    if (!content.trim()) errs.content = "Post content is required.";
    return errs;
  }

  function handlePublish() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    const stored = localStorage.getItem(POSTS_KEY);
    const posts: Post[] = stored ? JSON.parse(stored) : [];

    const today = new Date().toISOString().split("T")[0];
    const slug = editSlug || slugify(title) || `post-${Date.now()}`;

    if (editSlug) {
      const idx = posts.findIndex((p) => p.slug === editSlug);
      if (idx !== -1) {
        posts[idx] = { ...posts[idx], title, excerpt, content };
      }
    } else {
      posts.unshift({ slug, title, date: today, excerpt, content });
    }

    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    }, 600);
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
            <Link
              href="/admin/dashboard"
              className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[var(--color-farm-brown)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {isEditing ? "Edit Post" : "New Blog Post"}
          </h1>
          <p
            className="text-[var(--color-farm-brown-dark)] text-sm mt-1"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            {isEditing
              ? "Make your changes and click Publish to save."
              : "Write your post below, then click Publish to add it to the blog."}
          </p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded mb-6 flex items-center gap-2">
            <span>✅</span>
            <span>
              Post {isEditing ? "updated" : "published"} successfully! Redirecting to dashboard…
            </span>
          </div>
        )}

        <div className="card-rustic overflow-hidden">
          <div className="h-1.5 bg-[var(--color-farm-brown)]" />
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Post Title <span className="text-[var(--color-farm-rust)]">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="e.g. Lambing Season Has Begun"
                className="input-rustic text-lg"
              />
              {errors.title && (
                <p className="text-[var(--color-farm-rust)] text-xs mt-1">{errors.title}</p>
              )}
              {!isEditing && title && (
                <p
                  className="text-[var(--color-farm-tan)] text-xs mt-1"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  URL: /blog/{slugify(title)}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Excerpt <span className="text-[var(--color-farm-rust)]">*</span>
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  if (errors.excerpt) setErrors((p) => ({ ...p, excerpt: undefined }));
                }}
                rows={2}
                placeholder="A short summary shown on the blog listing page…"
                className="input-rustic resize-none"
              />
              {errors.excerpt && (
                <p className="text-[var(--color-farm-rust)] text-xs mt-1">{errors.excerpt}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Post Content <span className="text-[var(--color-farm-rust)]">*</span>
              </label>
              <p
                className="text-[var(--color-farm-tan)] text-xs mb-2"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Separate paragraphs with a blank line.
              </p>
              <textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
                }}
                rows={18}
                placeholder="Write your post here…

Each blank line starts a new paragraph."
                className="input-rustic resize-y font-mono text-sm"
              />
              {errors.content && (
                <p className="text-[var(--color-farm-rust)] text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/admin/dashboard"
                className="text-[var(--color-farm-tan)] hover:text-[var(--color-farm-brown)] text-sm transition-colors"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Cancel
              </Link>
              <button
                onClick={handlePublish}
                disabled={saving || saved}
                className="btn-rustic disabled:opacity-60"
              >
                {saving ? "Publishing…" : saved ? "Published!" : isEditing ? "Save Changes" : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
          <p style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>Loading…</p>
        </div>
      }
    >
      <NewPostForm />
    </Suspense>
  );
}
