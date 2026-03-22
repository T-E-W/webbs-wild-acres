"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  function validate() {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formState.name.trim()) newErrors.name = "Please enter your name.";
    if (!formState.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formState.message.trim()) newErrors.message = "Please enter a message.";
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  }

  return (
    <>
      {/* ── Page Header ── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-section-alt)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label">Reach Out</div>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
          >
            Contact Us
          </h1>
          <p
            className="mt-4 max-w-xl mx-auto text-lg"
            style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
          >
            Whether you have a question about the farm, want to connect with a fellow
            homesteader, or just want to say hello — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Two-column layout ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

            {/* ── Left: Contact Info ── */}
            <div className="lg:col-span-2">
              <div className="section-label" style={{ justifyContent: "flex-start" }}>
                Contact Info
              </div>
              <h2
                className="text-2xl font-bold mb-5"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
              >
                We&apos;d Love to Hear from You
              </h2>
              <div
                className="w-10 h-0.5 mb-7"
                style={{ backgroundColor: "var(--color-amber)" }}
              />

              <p
                className="leading-relaxed mb-5"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                We&apos;re a real family on a real farm, and we read every message that
                comes through. If you&apos;re asking about our animals, our practices, or
                life in the Arkansas Ozarks, we&apos;ll do our best to reply thoughtfully.
              </p>
              <p
                className="leading-relaxed mb-10"
                style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
              >
                Please allow a few days for a reply — the farm keeps us busy.
              </p>

              <div className="space-y-7">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(74,124,63,0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: "var(--color-green-primary)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Location
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Arkansas Ozark Foothills
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(74,124,63,0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: "var(--color-green-primary)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Email
                    </p>
                    <a
                      href="mailto:hello@webbswildacres.com"
                      className="text-sm hover:underline transition-colors"
                      style={{ color: "var(--color-green-primary)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      hello@webbswildacres.com
                    </a>
                  </div>
                </div>

                {/* Response time */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(74,124,63,0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: "var(--color-green-primary)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Response Time
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Usually within 2–3 days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div
                  className="card-eco p-12 text-center"
                  style={{ borderTop: "4px solid var(--color-green-primary)" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: "rgba(74,124,63,0.1)" }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: "var(--color-green-primary)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--color-brown-heading)" }}
                  >
                    Thanks for Reaching Out!
                  </h2>
                  <p
                    className="leading-relaxed mb-8"
                    style={{ color: "var(--color-brown-body)", fontFamily: "var(--font-lato), sans-serif" }}
                  >
                    We got your message, {formState.name}. We&apos;ll be in touch soon —
                    probably once we&apos;ve finished the morning chores.
                  </p>
                  <button
                    onClick={() => {
                      setFormState({ name: "", email: "", message: "" });
                      setSubmitted(false);
                    }}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="card-eco p-10 space-y-6"
                  style={{ borderTop: "4px solid var(--color-green-primary)" }}
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold mb-2"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Your Name <span style={{ color: "var(--color-amber)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="e.g. Jane Smith"
                      className="input-rustic"
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p
                        id="name-error"
                        className="text-xs mt-1.5"
                        style={{ color: "var(--color-amber)" }}
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold mb-2"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Email Address <span style={{ color: "var(--color-amber)" }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="input-rustic"
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-xs mt-1.5"
                        style={{ color: "var(--color-amber)" }}
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold mb-2"
                      style={{ color: "var(--color-brown-heading)", fontFamily: "var(--font-lato), sans-serif" }}
                    >
                      Message <span style={{ color: "var(--color-amber)" }}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="What's on your mind?"
                      className="input-rustic resize-none"
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p
                        id="message-error"
                        className="text-xs mt-1.5"
                        style={{ color: "var(--color-amber)" }}
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary w-full text-center">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
