"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUTH_KEY = "wwa_admin_token";
const HERD_KEY = "wwa_herd";
const EXPENSES_KEY = "wwa_expenses";
const INCOME_KEY = "wwa_income";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HerdData {
  headCount: number;
  breed: string;
  avgWeight: number;
  targetWeight: number;
  expectedSaleDate: string;
  notes: string;
}

type EntryType = "actual" | "projected" | "budgeted";

interface ExpenseEntry {
  id: number;
  date: string;
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  entryType: EntryType;
  fullHerd: boolean;
  headsAffected: number;
  vendor: string;
  invoiceRef: string;
  paymentMethod: string;
  notes: string;
}

type SaleMethod = "per_head" | "per_lb_live" | "per_lb_hanging";
type IncomeEntryType = "actual" | "projected";

interface IncomeEntry {
  id: number;
  date: string;
  incomeType: string;
  entryType: IncomeEntryType;
  numberOfHead: number;
  saleMethod: SaleMethod;
  pricePerHead: number;
  pricePerLb: number;
  avgWeightPerAnimal: number;
  totalAmount: number;
  buyerName: string;
  buyerContact: string;
  saleLocation: string;
  gradeNotes: string;
  notes: string;
}

interface LambPriceData {
  error: boolean;
  message?: string;
  reportTitle?: string;
  reportDate?: string;
  priceCwt?: number | null;
  high?: number | null;
  low?: number | null;
  mostlyHigh?: number | null;
  mostlyLow?: number | null;
  commodity?: string | null;
  grade?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  "Feed & Hay",
  "Veterinary Care",
  "Medications & Dewormers",
  "Minerals & Supplements",
  "Shearing",
  "Tags & Registration",
  "Infrastructure & Fencing",
  "Pasture & Land Management",
  "Labor",
  "Equipment & Tools",
  "Breeding Fees",
  "Transport",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Check", "Card", "Other"];

const INCOME_TYPES = [
  "Lamb Sale (Meat)",
  "Wool Sale",
  "Breeding Stock Sale",
  "Lamb Sale (Feeder)",
  "Other",
];

const SALE_METHOD_LABELS: Record<SaleMethod, string> = {
  per_head: "Per Head",
  per_lb_live: "Per Pound (Live Weight)",
  per_lb_hanging: "Per Pound (Hanging Weight)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(d: string): string {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntryTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    actual: "bg-[#4a7c3f] text-white",
    projected: "bg-amber-500 text-white",
    budgeted: "bg-blue-500 text-white",
  };
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full uppercase font-semibold ${map[type] ?? "bg-gray-200 text-gray-700"}`}
    >
      {type}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SheepTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "income">("overview");

  // Herd
  const [herd, setHerd] = useState<HerdData>({
    headCount: 0,
    breed: "",
    avgWeight: 0,
    targetWeight: 0,
    expectedSaleDate: "",
    notes: "",
  });
  const [herdSaved, setHerdSaved] = useState(false);

  // Market price
  const [marketData, setMarketData] = useState<LambPriceData | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [expCatFilter, setExpCatFilter] = useState("");
  const [expTypeFilter, setExpTypeFilter] = useState("");

  // Expense form
  const blankExpense = (): Omit<ExpenseEntry, "id"> => ({
    date: today(),
    category: "",
    subcategory: "",
    description: "",
    amount: 0,
    entryType: "actual",
    fullHerd: true,
    headsAffected: 0,
    vendor: "",
    invoiceRef: "",
    paymentMethod: "Cash",
    notes: "",
  });
  const [expForm, setExpForm] = useState<Omit<ExpenseEntry, "id">>(blankExpense());
  const [expEditId, setExpEditId] = useState<number | null>(null);

  // Income
  const [incomeList, setIncomeList] = useState<IncomeEntry[]>([]);
  const [incTypeFilter, setIncTypeFilter] = useState("");

  // Income form
  const blankIncome = (): Omit<IncomeEntry, "id"> => ({
    date: today(),
    incomeType: "",
    entryType: "actual",
    numberOfHead: 0,
    saleMethod: "per_head",
    pricePerHead: 0,
    pricePerLb: 0,
    avgWeightPerAnimal: 0,
    totalAmount: 0,
    buyerName: "",
    buyerContact: "",
    saleLocation: "",
    gradeNotes: "",
    notes: "",
  });
  const [incForm, setIncForm] = useState<Omit<IncomeEntry, "id">>(blankIncome());
  const [incEditId, setIncEditId] = useState<number | null>(null);

  // ── Auth + Load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") {
      router.replace("/admin");
      return;
    }

    try {
      const raw = localStorage.getItem(HERD_KEY);
      if (raw) setHerd(JSON.parse(raw));
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(EXPENSES_KEY);
      if (raw) setExpenses(JSON.parse(raw));
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(INCOME_KEY);
      if (raw) setIncomeList(JSON.parse(raw));
    } catch { /* ignore */ }

    setLoading(false);
  }, [router]);

  // ── Market price fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    setMarketLoading(true);
    fetch("/api/lamb-prices")
      .then((r) => r.json())
      .then((d: LambPriceData) => setMarketData(d))
      .catch(() => setMarketData({ error: true, message: "Network error fetching market data." }))
      .finally(() => setMarketLoading(false));
  }, []);

  // ── Hash navigation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#expenses") setActiveTab("expenses");
    else if (hash === "#income") setActiveTab("income");
  }, []);

  // ── Herd save ───────────────────────────────────────────────────────────────
  function saveHerd() {
    localStorage.setItem(HERD_KEY, JSON.stringify(herd));
    setHerdSaved(true);
    setTimeout(() => setHerdSaved(false), 2500);
  }

  // ── Expense helpers ──────────────────────────────────────────────────────────
  const saveExpenses = useCallback((list: ExpenseEntry[]) => {
    setExpenses(list);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(list));
  }, []);

  function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!expForm.date || !expForm.category || expForm.amount <= 0) return;
    if (expEditId !== null) {
      const updated = expenses.map((x) =>
        x.id === expEditId ? { ...expForm, id: expEditId } : x
      );
      saveExpenses(updated);
      setExpEditId(null);
    } else {
      saveExpenses([{ ...expForm, id: Date.now() }, ...expenses]);
    }
    setExpForm(blankExpense());
  }

  function startEditExpense(entry: ExpenseEntry) {
    const { id, ...rest } = entry;
    setExpEditId(id);
    setExpForm(rest);
    setActiveTab("expenses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteExpense(id: number) {
    if (!confirm("Delete this expense entry?")) return;
    saveExpenses(expenses.filter((x) => x.id !== id));
  }

  // ── Income helpers ───────────────────────────────────────────────────────────
  const saveIncomeList = useCallback((list: IncomeEntry[]) => {
    setIncomeList(list);
    localStorage.setItem(INCOME_KEY, JSON.stringify(list));
  }, []);

  function calcIncomeTotal(form: Omit<IncomeEntry, "id">): number {
    if (form.saleMethod === "per_head") {
      return form.pricePerHead * form.numberOfHead;
    }
    return form.pricePerLb * form.avgWeightPerAnimal * form.numberOfHead;
  }

  function submitIncome(e: React.FormEvent) {
    e.preventDefault();
    if (!incForm.date || !incForm.incomeType) return;
    const total =
      incForm.totalAmount > 0 ? incForm.totalAmount : calcIncomeTotal(incForm);
    const entry: IncomeEntry = { ...incForm, totalAmount: total, id: Date.now() };
    if (incEditId !== null) {
      const updated = incomeList.map((x) =>
        x.id === incEditId ? { ...entry, id: incEditId } : x
      );
      saveIncomeList(updated);
      setIncEditId(null);
    } else {
      saveIncomeList([entry, ...incomeList]);
    }
    setIncForm(blankIncome());
  }

  function startEditIncome(entry: IncomeEntry) {
    const { id, ...rest } = entry;
    setIncEditId(id);
    setIncForm(rest);
    setActiveTab("income");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteIncome(id: number) {
    if (!confirm("Delete this income entry?")) return;
    saveIncomeList(incomeList.filter((x) => x.id !== id));
  }

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalActualExp = expenses
    .filter((e) => e.entryType === "actual")
    .reduce((s, e) => s + e.amount, 0);
  const totalProjExp = expenses
    .filter((e) => e.entryType !== "actual")
    .reduce((s, e) => s + e.amount, 0);
  const totalAllExp = totalActualExp + totalProjExp;

  const totalActualInc = incomeList
    .filter((i) => i.entryType === "actual")
    .reduce((s, i) => s + i.totalAmount, 0);
  const totalProjInc = incomeList
    .filter((i) => i.entryType === "projected")
    .reduce((s, i) => s + i.totalAmount, 0);

  const hc = herd.headCount || 0;
  const perHeadActual = hc > 0 ? totalActualExp / hc : 0;
  const perHeadProj = hc > 0 ? totalAllExp / hc : 0;
  const netActual = totalActualInc - totalActualExp;
  const netProj = totalActualInc + totalProjInc - totalAllExp;

  // Market-based break even comparison
  const breakEven = hc > 0 ? totalAllExp / hc : 0;
  const marketPriceCwt = marketData?.priceCwt ?? null;
  const targetWeightLbs = herd.targetWeight || 0;
  const marketPricePerHead =
    marketPriceCwt && targetWeightLbs > 0
      ? (marketPriceCwt / 100) * targetWeightLbs
      : null;

  // Expense breakdown by category
  const expByCat: Record<string, number> = {};
  for (const e of expenses) {
    expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount;
  }

  // Filtered expense log
  const filteredExpenses = expenses
    .filter((e) => (expCatFilter ? e.category === expCatFilter : true))
    .filter((e) => (expTypeFilter ? e.entryType === expTypeFilter : true))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Filtered income log
  const filteredIncome = incomeList
    .filter((i) => (incTypeFilter ? i.incomeType === incTypeFilter : true))
    .sort((a, b) => b.date.localeCompare(a.date));

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
        <p className="text-[var(--color-farm-brown)]" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)]">
      {/* Nav */}
      <header style={{ backgroundColor: "var(--color-farm-brown)" }} className="shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐑</span>
              <span
                className="text-[var(--color-farm-cream)] font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Sheep Tracker
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/business"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                ← Business Center
              </Link>
              <Link
                href="/admin/business/sheep/dashboard"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold uppercase tracking-widest transition-colors"
                style={{
                  backgroundColor: "var(--color-farm-green)",
                  color: "#fff",
                  fontFamily: "var(--font-lato), Georgia, serif",
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Herd Setup ──────────────────────────────────────────────────────── */}
        <div className="card-rustic overflow-visible">
          <div className="h-1 bg-[var(--color-farm-brown)]" />
          <div className="p-6">
            <h2
              className="text-xl font-bold text-[var(--color-farm-brown)] mb-5"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Herd Setup
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Head Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={herd.headCount || ""}
                  onChange={(e) => setHerd({ ...herd, headCount: Number(e.target.value) })}
                  className="input-rustic"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Breed
                </label>
                <input
                  type="text"
                  value={herd.breed}
                  onChange={(e) => setHerd({ ...herd, breed: e.target.value })}
                  className="input-rustic"
                  placeholder="e.g. Katahdin, Dorper"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Avg Current Weight (lbs)
                </label>
                <input
                  type="number"
                  min={0}
                  value={herd.avgWeight || ""}
                  onChange={(e) => setHerd({ ...herd, avgWeight: Number(e.target.value) })}
                  className="input-rustic"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Target Sale Weight (lbs)
                </label>
                <input
                  type="number"
                  min={0}
                  value={herd.targetWeight || ""}
                  onChange={(e) => setHerd({ ...herd, targetWeight: Number(e.target.value) })}
                  className="input-rustic"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Expected Sale Date
                </label>
                <input
                  type="date"
                  value={herd.expectedSaleDate}
                  onChange={(e) => setHerd({ ...herd, expectedSaleDate: e.target.value })}
                  className="input-rustic"
                />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  value={herd.notes}
                  onChange={(e) => setHerd({ ...herd, notes: e.target.value })}
                  className="input-rustic resize-y"
                  rows={2}
                  placeholder="Any notes about the herd…"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveHerd} className="btn-rustic py-2 px-6">
                Save Herd
              </button>
              {herdSaved && (
                <span className="text-[#4a7c3f] text-sm font-semibold">
                  Saved!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Live Market Prices ───────────────────────────────────────────────── */}
        <div className="card-rustic">
          <div className="h-1 bg-amber-500" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📡</span>
              <h2
                className="text-lg font-bold text-[var(--color-farm-brown)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                USDA Market Price
              </h2>
              {marketLoading && (
                <span className="text-xs text-[var(--color-farm-tan)] ml-2">Loading…</span>
              )}
            </div>

            {!marketLoading && marketData && (
              <>
                {marketData.error ? (
                  <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded px-4 py-3">
                    Market data temporarily unavailable: {marketData.message}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-6 items-start">
                      <div>
                        <p className="text-xs text-[var(--color-farm-tan)] uppercase tracking-wider">
                          Price / Cwt (100 lbs)
                        </p>
                        <p
                          className="text-2xl font-bold text-[var(--color-farm-brown)]"
                          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                        >
                          {marketData.priceCwt ? fmt(marketData.priceCwt) : "—"}
                        </p>
                      </div>
                      {targetWeightLbs > 0 && marketPricePerHead !== null && (
                        <div>
                          <p className="text-xs text-[var(--color-farm-tan)] uppercase tracking-wider">
                            Est. Price / Head ({targetWeightLbs} lbs)
                          </p>
                          <p
                            className="text-2xl font-bold text-[#4a7c3f]"
                            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                          >
                            {fmt(marketPricePerHead)}
                          </p>
                        </div>
                      )}
                      {(marketData.high || marketData.low) && (
                        <div>
                          <p className="text-xs text-[var(--color-farm-tan)] uppercase tracking-wider">
                            Range
                          </p>
                          <p className="text-sm font-semibold text-[var(--color-farm-brown)]">
                            {marketData.low ? fmt(marketData.low) : "—"} –{" "}
                            {marketData.high ? fmt(marketData.high) : "—"}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[var(--color-farm-tan)]">
                      Source: {marketData.reportTitle ?? "USDA AMS"}{" "}
                      {marketData.reportDate ? `· ${fmtDate(marketData.reportDate)}` : ""}
                    </p>

                    {/* Break-even comparison */}
                    {breakEven > 0 && (
                      <div
                        className={`rounded px-4 py-3 text-sm font-semibold border ${
                          marketPricePerHead !== null && marketPricePerHead >= breakEven
                            ? "bg-green-50 border-green-200 text-green-800"
                            : marketPricePerHead !== null
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        {marketPricePerHead !== null ? (
                          <>
                            Your break-even is {fmt(breakEven)}/head.{" "}
                            {marketPricePerHead >= breakEven
                              ? `Market is ${fmt(marketPricePerHead - breakEven)}/head above break-even. ✓`
                              : `Market is ${fmt(breakEven - marketPricePerHead)}/head BELOW break-even. ⚠`}
                          </>
                        ) : (
                          <>Set target weight above to compare market price to break-even ({fmt(breakEven)}/head).</>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex gap-1 border-b border-[var(--color-border)] mb-6">
            {(["overview", "expenses", "income"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#4a7c3f] text-[#4a7c3f]"
                    : "border-transparent text-[var(--color-farm-tan)] hover:text-[var(--color-farm-brown)]"
                }`}
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                {tab === "overview" ? "Overview" : tab === "expenses" ? "Expenses" : "Income"}
              </button>
            ))}
          </div>

          {/* ════════ TAB: OVERVIEW ════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Big metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Head Count", value: hc.toString(), color: "text-[var(--color-farm-brown)]" },
                  { label: "Actual Expenses", value: fmt(totalActualExp), color: "text-red-600" },
                  { label: "Per-Head Cost (Actual)", value: hc > 0 ? fmt(perHeadActual) : "—", color: "text-red-600" },
                  { label: "Proj. Per-Head Cost", value: hc > 0 ? fmt(perHeadProj) : "—", color: "text-amber-600" },
                  { label: "Actual Income", value: fmt(totalActualInc), color: "text-[#4a7c3f]" },
                  { label: "Projected Income", value: fmt(totalActualInc + totalProjInc), color: "text-[#4a7c3f]" },
                  {
                    label: "Net P&L (Actual)",
                    value: fmt(netActual),
                    color: netActual >= 0 ? "text-[#4a7c3f]" : "text-red-600",
                  },
                  {
                    label: "Net P&L (Projected)",
                    value: fmt(netProj),
                    color: netProj >= 0 ? "text-[#4a7c3f]" : "text-red-600",
                  },
                ].map((m) => (
                  <div key={m.label} className="card-rustic p-4">
                    <p
                      className={`text-xl font-bold ${m.color}`}
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {m.value}
                    </p>
                    <p
                      className="text-[var(--color-farm-tan)] text-xs uppercase tracking-wider mt-0.5"
                      style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                    >
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Expense breakdown by category */}
              {Object.keys(expByCat).length > 0 && (
                <div className="card-rustic p-5">
                  <h3
                    className="text-base font-bold text-[var(--color-farm-brown)] mb-3"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Expense Breakdown by Category
                  </h3>
                  <div className="divide-y divide-[var(--color-border)]">
                    {Object.entries(expByCat)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amt]) => (
                        <div key={cat} className="flex justify-between py-2 text-sm">
                          <span
                            className="text-[var(--color-farm-brown-dark)]"
                            style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                          >
                            {cat}
                          </span>
                          <span className="font-semibold text-red-600">{fmt(amt)}</span>
                        </div>
                      ))}
                    <div className="flex justify-between py-2 text-sm font-bold">
                      <span className="text-[var(--color-farm-brown)]">Total</span>
                      <span className="text-red-700">{fmt(totalActualExp + totalProjExp)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Recent expenses */}
                <div className="card-rustic p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-base font-bold text-[var(--color-farm-brown)]"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      Recent Expenses
                    </h3>
                    <button
                      onClick={() => setActiveTab("expenses")}
                      className="text-xs text-[#4a7c3f] font-semibold uppercase tracking-wider hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-[var(--color-farm-tan)]">No expenses logged yet.</p>
                  ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                      {[...expenses]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .slice(0, 5)
                        .map((e) => (
                          <div key={e.id} className="py-2 flex justify-between items-start">
                            <div>
                              <p
                                className="text-sm font-semibold text-[var(--color-farm-brown)]"
                                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                              >
                                {e.category}
                                {e.subcategory ? ` — ${e.subcategory}` : ""}
                              </p>
                              <p className="text-xs text-[var(--color-farm-tan)]">
                                {fmtDate(e.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-600">{fmt(e.amount)}</p>
                              <EntryTypeBadge type={e.entryType} />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Recent income */}
                <div className="card-rustic p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-base font-bold text-[var(--color-farm-brown)]"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      Recent Income
                    </h3>
                    <button
                      onClick={() => setActiveTab("income")}
                      className="text-xs text-[#4a7c3f] font-semibold uppercase tracking-wider hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {incomeList.length === 0 ? (
                    <p className="text-sm text-[var(--color-farm-tan)]">No income logged yet.</p>
                  ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                      {[...incomeList]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .slice(0, 5)
                        .map((i) => (
                          <div key={i.id} className="py-2 flex justify-between items-start">
                            <div>
                              <p
                                className="text-sm font-semibold text-[var(--color-farm-brown)]"
                                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
                              >
                                {i.incomeType}
                              </p>
                              <p className="text-xs text-[var(--color-farm-tan)]">
                                {fmtDate(i.date)} · {i.numberOfHead} head
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#4a7c3f]">
                                {fmt(i.totalAmount)}
                              </p>
                              <EntryTypeBadge type={i.entryType} />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB: EXPENSES ════════ */}
          {activeTab === "expenses" && (
            <div className="space-y-6" id="expenses">
              <div className="card-rustic">
                <div className="h-1 bg-red-500" />
                <div className="p-6">
                  <h3
                    className="text-lg font-bold text-[var(--color-farm-brown)] mb-5"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {expEditId !== null ? "Edit Expense" : "Log Expense"}
                  </h3>
                  <form onSubmit={submitExpense} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={expForm.date}
                          onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                          className="input-rustic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Category *
                        </label>
                        <select
                          required
                          value={expForm.category}
                          onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                          className="input-rustic"
                        >
                          <option value="">Select…</option>
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Subcategory
                        </label>
                        <input
                          type="text"
                          value={expForm.subcategory}
                          onChange={(e) => setExpForm({ ...expForm, subcategory: e.target.value })}
                          className="input-rustic"
                          placeholder="e.g. Alfalfa hay"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Description
                        </label>
                        <textarea
                          value={expForm.description}
                          onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                          className="input-rustic resize-y"
                          rows={2}
                          placeholder="What was purchased or paid for?"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Amount ($) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step="0.01"
                          value={expForm.amount || ""}
                          onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                          className="input-rustic"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Type
                        </label>
                        <div className="flex gap-2 mt-1">
                          {(["actual", "projected", "budgeted"] as EntryType[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setExpForm({ ...expForm, entryType: t })}
                              className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-colors ${
                                expForm.entryType === t
                                  ? t === "actual"
                                    ? "bg-[#4a7c3f] border-[#4a7c3f] text-white"
                                    : t === "projected"
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "bg-blue-500 border-blue-500 text-white"
                                  : "bg-white border-[var(--color-border)] text-[var(--color-farm-tan)]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Applies To
                        </label>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setExpForm({ ...expForm, fullHerd: true })}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-colors ${
                              expForm.fullHerd
                                ? "bg-[#4a7c3f] border-[#4a7c3f] text-white"
                                : "bg-white border-[var(--color-border)] text-[var(--color-farm-tan)]"
                            }`}
                          >
                            Full Herd
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpForm({ ...expForm, fullHerd: false })}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-colors ${
                              !expForm.fullHerd
                                ? "bg-[#4a7c3f] border-[#4a7c3f] text-white"
                                : "bg-white border-[var(--color-border)] text-[var(--color-farm-tan)]"
                            }`}
                          >
                            Partial
                          </button>
                        </div>
                      </div>
                      {!expForm.fullHerd && (
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                            Heads Affected
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={expForm.headsAffected || ""}
                            onChange={(e) =>
                              setExpForm({ ...expForm, headsAffected: Number(e.target.value) })
                            }
                            className="input-rustic"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Vendor / Supplier
                        </label>
                        <input
                          type="text"
                          value={expForm.vendor}
                          onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })}
                          className="input-rustic"
                          placeholder="Store or person name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Invoice / Receipt #
                        </label>
                        <input
                          type="text"
                          value={expForm.invoiceRef}
                          onChange={(e) => setExpForm({ ...expForm, invoiceRef: e.target.value })}
                          className="input-rustic"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Payment Method
                        </label>
                        <select
                          value={expForm.paymentMethod}
                          onChange={(e) => setExpForm({ ...expForm, paymentMethod: e.target.value })}
                          className="input-rustic"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Notes
                        </label>
                        <textarea
                          value={expForm.notes}
                          onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                          className="input-rustic resize-y"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" className="btn-rustic py-2 px-6">
                        {expEditId !== null ? "Update Expense" : "Save Expense"}
                      </button>
                      {expEditId !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpEditId(null);
                            setExpForm(blankExpense());
                          }}
                          className="btn-rustic-outline py-2 px-6"
                          style={{ color: "var(--color-farm-brown)", borderColor: "var(--color-farm-tan)" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Expense Log */}
              <div className="card-rustic overflow-hidden">
                <div className="p-5 border-b border-[var(--color-border)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3
                      className="text-base font-bold text-[var(--color-farm-brown)] mr-auto"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      Expense Log
                    </h3>
                    <select
                      value={expCatFilter}
                      onChange={(e) => setExpCatFilter(e.target.value)}
                      className="input-rustic text-sm py-1.5 w-auto"
                      style={{ width: "auto", minWidth: "160px" }}
                    >
                      <option value="">All Categories</option>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={expTypeFilter}
                      onChange={(e) => setExpTypeFilter(e.target.value)}
                      className="input-rustic text-sm py-1.5"
                      style={{ width: "auto", minWidth: "130px" }}
                    >
                      <option value="">All Types</option>
                      <option value="actual">Actual</option>
                      <option value="projected">Projected</option>
                      <option value="budgeted">Budgeted</option>
                    </select>
                  </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[var(--color-farm-tan)] text-sm">No expense entries yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--color-farm-cream-dark)] border-b border-[var(--color-border)]">
                          {["Date", "Category", "Subcategory", "Amount", "Per-Head", "Type", "Vendor", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-farm-brown)] uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredExpenses.map((e) => {
                          const ha = e.fullHerd ? hc : e.headsAffected;
                          return (
                            <tr key={e.id} className="hover:bg-[var(--color-farm-cream)] transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-[var(--color-farm-brown-dark)]">
                                {fmtDate(e.date)}
                              </td>
                              <td className="px-4 py-3 text-[var(--color-farm-brown)]">{e.category}</td>
                              <td className="px-4 py-3 text-[var(--color-farm-tan)]">{e.subcategory || "—"}</td>
                              <td className="px-4 py-3 font-semibold text-red-600 whitespace-nowrap">
                                {fmt(e.amount)}
                              </td>
                              <td className="px-4 py-3 text-[var(--color-farm-tan)] whitespace-nowrap">
                                {ha > 0 ? fmt(e.amount / ha) : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <EntryTypeBadge type={e.entryType} />
                              </td>
                              <td className="px-4 py-3 text-[var(--color-farm-tan)]">{e.vendor || "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => startEditExpense(e)}
                                    className="text-[var(--color-farm-brown)] text-xs font-semibold uppercase tracking-wider hover:text-[#4a7c3f] transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteExpense(e.id)}
                                    className="text-[var(--color-farm-rust)] text-xs font-semibold uppercase tracking-wider hover:text-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--color-farm-cream-dark)] font-bold border-t-2 border-[var(--color-border)]">
                          <td className="px-4 py-3 text-sm text-[var(--color-farm-brown)] uppercase tracking-wider" colSpan={3}>
                            Totals ({filteredExpenses.length} entries)
                          </td>
                          <td className="px-4 py-3 text-red-700 whitespace-nowrap">
                            {fmt(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
                          </td>
                          <td colSpan={4} className="px-4 py-3" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ TAB: INCOME ════════ */}
          {activeTab === "income" && (
            <div className="space-y-6" id="income">
              <div className="card-rustic">
                <div className="h-1 bg-[#4a7c3f]" />
                <div className="p-6">
                  <h3
                    className="text-lg font-bold text-[var(--color-farm-brown)] mb-5"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {incEditId !== null ? "Edit Income Entry" : "Log Income"}
                  </h3>
                  <form onSubmit={submitIncome} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={incForm.date}
                          onChange={(e) => setIncForm({ ...incForm, date: e.target.value })}
                          className="input-rustic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Income Type *
                        </label>
                        <select
                          required
                          value={incForm.incomeType}
                          onChange={(e) => setIncForm({ ...incForm, incomeType: e.target.value })}
                          className="input-rustic"
                        >
                          <option value="">Select…</option>
                          {INCOME_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Actual or Projected?
                        </label>
                        <div className="flex gap-2 mt-1">
                          {(["actual", "projected"] as IncomeEntryType[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setIncForm({ ...incForm, entryType: t })}
                              className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-colors ${
                                incForm.entryType === t
                                  ? t === "actual"
                                    ? "bg-[#4a7c3f] border-[#4a7c3f] text-white"
                                    : "bg-amber-500 border-amber-500 text-white"
                                  : "bg-white border-[var(--color-border)] text-[var(--color-farm-tan)]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Number of Head
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={incForm.numberOfHead || ""}
                          onChange={(e) => setIncForm({ ...incForm, numberOfHead: Number(e.target.value) })}
                          className="input-rustic"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Sale Method
                        </label>
                        <select
                          value={incForm.saleMethod}
                          onChange={(e) =>
                            setIncForm({ ...incForm, saleMethod: e.target.value as SaleMethod })
                          }
                          className="input-rustic"
                        >
                          {(Object.keys(SALE_METHOD_LABELS) as SaleMethod[]).map((k) => (
                            <option key={k} value={k}>
                              {SALE_METHOD_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                      {incForm.saleMethod === "per_head" ? (
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                            Price Per Head ($)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={incForm.pricePerHead || ""}
                            onChange={(e) =>
                              setIncForm({ ...incForm, pricePerHead: Number(e.target.value) })
                            }
                            className="input-rustic"
                            placeholder="0.00"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                              Price Per Pound ($)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={incForm.pricePerLb || ""}
                              onChange={(e) =>
                                setIncForm({ ...incForm, pricePerLb: Number(e.target.value) })
                              }
                              className="input-rustic"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                              Avg Weight / Animal (lbs)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.1"
                              value={incForm.avgWeightPerAnimal || ""}
                              onChange={(e) =>
                                setIncForm({ ...incForm, avgWeightPerAnimal: Number(e.target.value) })
                              }
                              className="input-rustic"
                              placeholder="0.0"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Total Amount ($)
                          <span className="text-[var(--color-farm-tan)] ml-1 normal-case font-normal">
                            (auto-calc or override)
                          </span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={incForm.totalAmount || ""}
                          onChange={(e) =>
                            setIncForm({ ...incForm, totalAmount: Number(e.target.value) })
                          }
                          className="input-rustic"
                          placeholder={String(
                            calcIncomeTotal(incForm) > 0 ? calcIncomeTotal(incForm).toFixed(2) : "0.00"
                          )}
                        />
                        {calcIncomeTotal(incForm) > 0 && incForm.totalAmount === 0 && (
                          <p className="text-xs text-[var(--color-farm-tan)] mt-1">
                            Calculated: {fmt(calcIncomeTotal(incForm))}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Buyer Name
                        </label>
                        <input
                          type="text"
                          value={incForm.buyerName}
                          onChange={(e) => setIncForm({ ...incForm, buyerName: e.target.value })}
                          className="input-rustic"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Buyer Contact
                        </label>
                        <input
                          type="text"
                          value={incForm.buyerContact}
                          onChange={(e) => setIncForm({ ...incForm, buyerContact: e.target.value })}
                          className="input-rustic"
                          placeholder="Phone or email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Sale Location / Market
                        </label>
                        <input
                          type="text"
                          value={incForm.saleLocation}
                          onChange={(e) => setIncForm({ ...incForm, saleLocation: e.target.value })}
                          className="input-rustic"
                          placeholder="e.g. Local sale barn"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Grade / Quality Notes
                        </label>
                        <input
                          type="text"
                          value={incForm.gradeNotes}
                          onChange={(e) => setIncForm({ ...incForm, gradeNotes: e.target.value })}
                          className="input-rustic"
                          placeholder="Choice, Select, etc."
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-xs font-semibold text-[var(--color-farm-brown)] mb-1 uppercase tracking-wider">
                          Notes
                        </label>
                        <textarea
                          value={incForm.notes}
                          onChange={(e) => setIncForm({ ...incForm, notes: e.target.value })}
                          className="input-rustic resize-y"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" className="btn-rustic py-2 px-6">
                        {incEditId !== null ? "Update Income" : "Save Income"}
                      </button>
                      {incEditId !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setIncEditId(null);
                            setIncForm(blankIncome());
                          }}
                          className="btn-rustic-outline py-2 px-6"
                          style={{ color: "var(--color-farm-brown)", borderColor: "var(--color-farm-tan)" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Income Log */}
              <div className="card-rustic overflow-hidden">
                <div className="p-5 border-b border-[var(--color-border)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3
                      className="text-base font-bold text-[var(--color-farm-brown)] mr-auto"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      Income Log
                    </h3>
                    <select
                      value={incTypeFilter}
                      onChange={(e) => setIncTypeFilter(e.target.value)}
                      className="input-rustic text-sm py-1.5"
                      style={{ width: "auto", minWidth: "160px" }}
                    >
                      <option value="">All Types</option>
                      {INCOME_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredIncome.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[var(--color-farm-tan)] text-sm">No income entries yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[var(--color-farm-cream-dark)] border-b border-[var(--color-border)]">
                          {["Date", "Type", "Head", "Price/Head", "Total", "Status", "Buyer", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-farm-brown)] uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredIncome.map((i) => {
                          const pricePerHead =
                            i.saleMethod === "per_head"
                              ? i.pricePerHead
                              : i.numberOfHead > 0
                              ? i.totalAmount / i.numberOfHead
                              : 0;
                          return (
                            <tr key={i.id} className="hover:bg-[var(--color-farm-cream)] transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-[var(--color-farm-brown-dark)]">
                                {fmtDate(i.date)}
                              </td>
                              <td className="px-4 py-3 text-[var(--color-farm-brown)]">{i.incomeType}</td>
                              <td className="px-4 py-3 text-[var(--color-farm-tan)]">{i.numberOfHead}</td>
                              <td className="px-4 py-3 text-[var(--color-farm-brown-dark)] whitespace-nowrap">
                                {pricePerHead > 0 ? fmt(pricePerHead) : "—"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#4a7c3f] whitespace-nowrap">
                                {fmt(i.totalAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <EntryTypeBadge type={i.entryType} />
                              </td>
                              <td className="px-4 py-3 text-[var(--color-farm-tan)]">{i.buyerName || "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => startEditIncome(i)}
                                    className="text-[var(--color-farm-brown)] text-xs font-semibold uppercase tracking-wider hover:text-[#4a7c3f] transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteIncome(i.id)}
                                    className="text-[var(--color-farm-rust)] text-xs font-semibold uppercase tracking-wider hover:text-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--color-farm-cream-dark)] font-bold border-t-2 border-[var(--color-border)]">
                          <td className="px-4 py-3 text-sm text-[var(--color-farm-brown)] uppercase tracking-wider" colSpan={4}>
                            Totals ({filteredIncome.length} entries)
                          </td>
                          <td className="px-4 py-3 text-[#4a7c3f] whitespace-nowrap">
                            {fmt(filteredIncome.reduce((s, i) => s + i.totalAmount, 0))}
                          </td>
                          <td colSpan={3} className="px-4 py-3" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
