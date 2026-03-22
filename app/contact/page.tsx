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
      {/* Page Header */}
      <section className="bg-[var(--color-farm-green)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-[var(--color-farm-tan-light)] text-sm tracking-widest uppercase font-semibold mb-3"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Reach Out
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--color-farm-cream)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Contact Us
          </h1>
          <p
            className="text-[var(--color-farm-tan-light)] mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Whether you have a question about the farm, want to connect with a fellow
            homesteader, or just want to say hello — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[var(--color-farm-cream)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2
                className="text-3xl font-bold text-[var(--color-farm-brown)] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                We&apos;d Love to Hear from You
              </h2>
              <hr className="section-divider mb-8" />

              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                We&apos;re a real family on a real farm, and we read every message that
                comes through. If you&apos;re asking about our animals, our practices, or
                life in the Arkansas Ozarks, we&apos;ll do our best to reply thoughtfully.
              </p>

              <p
                className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-10"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Please allow a few days for a reply — the farm keeps us busy.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: "📍",
                    label: "Location",
                    value: "Arkansas Ozark Foothills",
                  },
                  {
                    icon: "🌐",
                    label: "On the Web",
                    value: "webbswildacres.com",
                  },
                  {
                    icon: "📬",
                    label: "Response Time",
                    value: "Usually within 2–3 days",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p
                        className="font-semibold text-[var(--color-farm-brown)] text-sm"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-[var(--color-farm-brown-dark)] text-sm"
                        style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="card-rustic p-10 text-center">
                  <span className="text-5xl block mb-5">🌻</span>
                  <h2
                    className="text-2xl font-bold text-[var(--color-farm-brown)] mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Thanks for Reaching Out!
                  </h2>
                  <p
                    className="text-[var(--color-farm-brown-dark)] leading-relaxed mb-6"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    We got your message, {formState.name}. We&apos;ll be in touch soon —
                    probably once we&apos;ve finished the morning chores.
                  </p>
                  <button
                    onClick={() => {
                      setFormState({ name: "", email: "", message: "" });
                      setSubmitted(false);
                    }}
                    className="btn-rustic"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-rustic p-8 space-y-6" noValidate>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                      style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                    >
                      Your Name <span className="text-[var(--color-farm-rust)]">*</span>
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
                      <p id="name-error" className="text-[var(--color-farm-rust)] text-xs mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                      style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                    >
                      Email Address <span className="text-[var(--color-farm-rust)]">*</span>
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
                      <p id="email-error" className="text-[var(--color-farm-rust)] text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-[var(--color-farm-brown)] mb-1.5"
                      style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                    >
                      Message <span className="text-[var(--color-farm-rust)]">*</span>
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
                      <p id="message-error" className="text-[var(--color-farm-rust)] text-xs mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-rustic w-full text-center">
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
