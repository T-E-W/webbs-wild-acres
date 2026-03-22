"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "WebbsWildAcres2026!";
const AUTH_KEY = "wwa_admin_token";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token === "authenticated") {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem(AUTH_KEY, "authenticated");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🐑</span>
          <h1
            className="text-3xl font-bold text-[var(--color-farm-brown)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Webb&apos;s Wild Acres
          </h1>
          <p
            className="text-[var(--color-farm-brown-dark)] text-sm mt-1 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Admin Portal
          </p>
        </div>

        <div className="card-rustic">
          <div className="h-1.5 bg-[var(--color-farm-brown)]" />
          <div className="p-8">
            <h2
              className="text-xl font-bold text-[var(--color-farm-brown)] mb-6"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Sign In
            </h2>

            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-5"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-rustic"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                  style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-rustic"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-rustic w-full text-center disabled:opacity-60"
              >
                {loading ? "Signing In…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <p
          className="text-center text-[var(--color-farm-tan)] text-xs mt-6"
          style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
        >
          Admin area — authorized personnel only.
        </p>
      </div>
    </div>
  );
}
