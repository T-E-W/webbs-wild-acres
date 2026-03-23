"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUTH_KEY = "wwa_admin_token";
const EXPENSES_KEY = "wwa_expenses";
const INCOME_KEY = "wwa_income";
const HERD_KEY = "wwa_herd";

interface ExpenseEntry {
  id: number;
  date: string;
  category: string;
  amount: number;
  entryType: "actual" | "projected" | "budgeted";
}

interface IncomeEntry {
  id: number;
  date: string;
  incomeType: string;
  totalAmount: number;
  numberOfHead?: number;
  entryType: "actual" | "projected";
}

interface HerdData {
  headCount: number;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export default function BusinessCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Summary metrics
  const [totalActualExpenses, setTotalActualExpenses] = useState(0);
  const [totalProjExpenses, setTotalProjExpenses] = useState(0);
  const [totalActualIncome, setTotalActualIncome] = useState(0);
  const [totalProjIncome, setTotalProjIncome] = useState(0);
  const [headCount, setHeadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") {
      router.replace("/admin");
      return;
    }

    // Load expenses
    try {
      const raw = localStorage.getItem(EXPENSES_KEY);
      if (raw) {
        const expenses: ExpenseEntry[] = JSON.parse(raw);
        const actual = expenses
          .filter((e) => e.entryType === "actual")
          .reduce((s, e) => s + e.amount, 0);
        const proj = expenses
          .filter((e) => e.entryType !== "actual")
          .reduce((s, e) => s + e.amount, 0);
        setTotalActualExpenses(actual);
        setTotalProjExpenses(proj);
      }
    } catch { /* ignore */ }

    // Load income
    try {
      const raw = localStorage.getItem(INCOME_KEY);
      if (raw) {
        const income: IncomeEntry[] = JSON.parse(raw);
        const actual = income
          .filter((i) => i.entryType === "actual")
          .reduce((s, i) => s + i.totalAmount, 0);
        const proj = income
          .filter((i) => i.entryType === "projected")
          .reduce((s, i) => s + i.totalAmount, 0);
        setTotalActualIncome(actual);
        setTotalProjIncome(proj);
      }
    } catch { /* ignore */ }

    // Load herd
    try {
      const raw = localStorage.getItem(HERD_KEY);
      if (raw) {
        const herd: HerdData = JSON.parse(raw);
        setHeadCount(herd.headCount ?? 0);
      }
    } catch { /* ignore */ }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
        <p className="text-[var(--color-farm-brown)]" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>
          Loading…
        </p>
      </div>
    );
  }

  const netActual = totalActualIncome - totalActualExpenses;
  const netProjected = (totalActualIncome + totalProjIncome) - (totalActualExpenses + totalProjExpenses);
  const perHeadCost = headCount > 0 ? totalActualExpenses / headCount : 0;
  const breakEven = headCount > 0 ? (totalActualExpenses + totalProjExpenses) / headCount : 0;

  const summaryCards = [
    {
      label: "Total Expenses (Actual)",
      value: fmt(totalActualExpenses),
      color: "text-red-600",
      icon: "💸",
    },
    {
      label: "Total Projected Expenses",
      value: fmt(totalActualExpenses + totalProjExpenses),
      color: "text-amber-600",
      icon: "📋",
    },
    {
      label: "Total Income (Actual)",
      value: fmt(totalActualIncome),
      color: "text-[#4a7c3f]",
      icon: "💰",
    },
    {
      label: "Total Projected Income",
      value: fmt(totalActualIncome + totalProjIncome),
      color: "text-[#4a7c3f]",
      icon: "📈",
    },
    {
      label: "Net Profit / Loss",
      value: fmt(netActual),
      color: netActual >= 0 ? "text-[#4a7c3f]" : "text-red-600",
      icon: netActual >= 0 ? "✅" : "⚠️",
    },
    {
      label: "Per-Head Cost (Actual)",
      value: headCount > 0 ? fmt(perHeadCost) : "—",
      color: "text-[var(--color-farm-brown)]",
      icon: "🐑",
    },
    {
      label: "Break-Even Price / Head",
      value: headCount > 0 ? fmt(breakEven) : "—",
      color: "text-amber-600",
      icon: "⚖️",
    },
    {
      label: "Net P&L (Projected)",
      value: fmt(netProjected),
      color: netProjected >= 0 ? "text-[#4a7c3f]" : "text-red-600",
      icon: "🔮",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)]">
      {/* Admin Nav */}
      <header className="wood-texture shadow" style={{ backgroundColor: "var(--color-farm-brown)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐑</span>
              <span
                className="text-[var(--color-farm-cream)] font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Webb&apos;s Wild Acres — Business Center
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Dashboard
              </Link>
              <Link
                href="/"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                target="_blank"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[var(--color-farm-brown)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Business Center
          </h1>
          <p
            className="text-[var(--color-farm-brown-dark)] text-sm mt-1"
            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
          >
            Financial overview and management tools for Webb&apos;s Wild Acres sheep operation.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {summaryCards.map((card) => (
            <div key={card.label} className="card-rustic p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <p
                    className={`text-xl font-bold ${card.color}`}
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {card.value}
                  </p>
                  <p
                    className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                  >
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modules */}
        <h2
          className="text-xl font-bold text-[var(--color-farm-brown)] mb-4"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Sheep Tracker — active */}
          <Link href="/admin/business/sheep" className="card-rustic p-6 block hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🐑</span>
              <h3
                className="text-lg font-bold text-[var(--color-farm-brown)] group-hover:text-[#4a7c3f] transition-colors"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Sheep Tracker
              </h3>
            </div>
            <p
              className="text-sm text-[var(--color-farm-brown-dark)]"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Track your herd, log expenses and income, and view profit/loss analysis.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-[#4a7c3f] text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                Open
              </span>
            </div>
          </Link>

          {/* Livestock Manager — active */}
          <Link href="/admin/business/livestock" className="card-rustic p-6 block hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🐾</span>
              <h3
                className="text-lg font-bold text-[var(--color-farm-brown)] group-hover:text-[#4a7c3f] transition-colors"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Livestock Manager
              </h3>
            </div>
            <p
              className="text-sm text-[var(--color-farm-brown-dark)]"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Manage multi-species livestock groups with flexible pricing — per head, by class, live weight, or hanging weight.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-[#4a7c3f] text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                Open
              </span>
            </div>
          </Link>

          {/* Orders — coming soon */}
          <div className="card-rustic p-6 opacity-70 relative">
            <div className="absolute top-3 right-3">
              <span className="inline-block bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Coming Soon
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📦</span>
              <h3
                className="text-lg font-bold text-[var(--color-farm-brown)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Orders
              </h3>
            </div>
            <p
              className="text-sm text-[var(--color-farm-brown-dark)]"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Manage customer orders, deposits, and fulfillment tracking for meat shares and livestock sales.
            </p>
          </div>

          {/* Social Analytics — coming soon */}
          <div className="card-rustic p-6 opacity-70 relative">
            <div className="absolute top-3 right-3">
              <span className="inline-block bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Coming Soon
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📊</span>
              <h3
                className="text-lg font-bold text-[var(--color-farm-brown)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Social Analytics
              </h3>
            </div>
            <p
              className="text-sm text-[var(--color-farm-brown-dark)]"
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              Track engagement, reach, and audience growth across social media platforms.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="card-rustic p-6">
          <h2
            className="text-lg font-bold text-[var(--color-farm-brown)] mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Quick Links
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/business/sheep" className="btn-rustic text-sm py-2 px-4">
              🐑 Sheep Tracker
            </Link>
            <Link href="/admin/business/livestock" className="btn-rustic text-sm py-2 px-4">
              🐾 Livestock Manager
            </Link>
            <Link href="/admin/business/sheep#expenses" className="btn-rustic text-sm py-2 px-4">
              💸 Log Expense
            </Link>
            <Link href="/admin/business/sheep#income" className="btn-rustic text-sm py-2 px-4">
              💰 Log Income
            </Link>
            <Link
              href="/admin/dashboard"
              className="btn-rustic-outline text-sm py-2 px-4"
              style={{ color: "var(--color-farm-brown)", borderColor: "var(--color-farm-brown)" }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
