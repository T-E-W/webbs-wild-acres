"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts";

// Recharts tooltip payload entry shape
interface TooltipPayloadEntry {
  dataKey?: string | number;
  value?: number | string | readonly (number | string)[];
  payload?: Record<string, unknown>;
  name?: string | number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipPayloadEntry[];
  label?: string | number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_KEY = "wwa_admin_token";
const HERD_KEY = "wwa_herd";
const EXPENSES_KEY = "wwa_expenses";
const INCOME_KEY = "wwa_income";
const MARKET_KEY = "wwa_lamb_market";

const PALETTE = {
  green: "#4a7c3f",
  amber: "#c8922a",
  brown: "#3d2b1f",
  red: "#c0392b",
  lightGreen: "#6aab5e",
  darkGreen: "#3a6230",
  tanLight: "#e8c99a",
  sectionAlt: "#f7f5f0",
};

const CATEGORY_COLORS = [
  "#4a7c3f",
  "#c8922a",
  "#c0392b",
  "#2980b9",
  "#8e44ad",
  "#16a085",
  "#e67e22",
  "#27ae60",
  "#d35400",
  "#2c3e50",
  "#f39c12",
  "#1abc9c",
  "#e74c3c",
];

const INCOME_TYPE_COLORS: Record<string, string> = {
  "Lamb Sale (Meat)": "#4a7c3f",
  "Wool Sale": "#c8922a",
  "Breeding Stock Sale": "#3d2b1f",
  "Lamb Sale (Feeder)": "#6aab5e",
  Other: "#8e44ad",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface HerdData {
  headCount: number;
  breed: string;
  avgWeight: number;
  targetWeight: number;
  expectedSaleDate: string;
  notes: string;
}

interface ExpenseEntry {
  id: number;
  date: string;
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  entryType: "actual" | "projected" | "budgeted";
  fullHerd: boolean;
  headsAffected: number;
  vendor: string;
  invoiceRef: string;
  paymentMethod: string;
  notes: string;
}

interface IncomeEntry {
  id: number;
  date: string;
  incomeType: string;
  entryType: "actual" | "projected";
  numberOfHead: number;
  saleMethod: "per_head" | "per_lb_live" | "per_lb_hanging";
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
  priceCwt?: number | null;
  high?: number | null;
  low?: number | null;
}

type TimeRange = "all" | "year" | "6mo" | "3mo" | "1mo" | "custom";

interface MonthlyRollup {
  month: string; // "YYYY-MM"
  label: string; // "Jan 2025"
  actualExpenses: number;
  projectedExpenses: number;
  actualIncome: number;
  projectedIncome: number;
}

interface CumulativePoint {
  date: string;
  label: string;
  cumulativePL: number;
  perHeadPL: number;
  type: "expense" | "income";
  amount: number;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtShort(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getRangeStart(range: TimeRange, customStart: string): Date | null {
  const now = new Date();
  switch (range) {
    case "all":
      return null;
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "6mo": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return d;
    }
    case "3mo": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case "1mo": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "custom":
      return customStart ? new Date(customStart + "T00:00:00") : null;
    default:
      return null;
  }
}

function inRange(
  dateStr: string,
  start: Date | null,
  end: Date | null
): boolean {
  const d = new Date(dateStr + "T00:00:00");
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-1 min-w-0">
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: PALETTE.amber }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold leading-tight truncate"
        style={{ color: color ?? PALETTE.brown, fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs text-gray-400 truncate">{sub}</span>
      )}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 ${className}`}
    >
      <div>
        <h3
          className="text-base font-bold leading-tight"
          style={{ color: PALETTE.brown, fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{ backgroundColor: PALETTE.sectionAlt }}
      >
        🐑
      </div>
      <div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: PALETTE.brown, fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          No data yet
        </h2>
        <p className="text-gray-500 max-w-sm">
          Start by setting up your herd and logging expenses in the Sheep
          Tracker.
        </p>
      </div>
      <Link
        href="/admin/business/sheep"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
        style={{ backgroundColor: PALETTE.green }}
      >
        Go to Sheep Tracker
      </Link>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function SheepDashboardPage() {
  const [herd, setHerd] = useState<HerdData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [marketData, setMarketData] = useState<LambPriceData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activitySort, setActivitySort] = useState<"asc" | "desc">("desc");
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage
  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem(HERD_KEY);
      setHerd(raw ? JSON.parse(raw) : null);
    } catch { setHerd(null); }

    try {
      const raw = localStorage.getItem(EXPENSES_KEY);
      setExpenses(raw ? JSON.parse(raw) : []);
    } catch { setExpenses([]); }

    try {
      const raw = localStorage.getItem(INCOME_KEY);
      setIncome(raw ? JSON.parse(raw) : []);
    } catch { setIncome([]); }

    try {
      const raw = localStorage.getItem(MARKET_KEY);
      setMarketData(raw ? JSON.parse(raw) : null);
    } catch { setMarketData(null); }

    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadData();

    const handler = (e: StorageEvent) => {
      if (
        e.key === HERD_KEY ||
        e.key === EXPENSES_KEY ||
        e.key === INCOME_KEY ||
        e.key === MARKET_KEY
      ) {
        loadData();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [loadData]);

  // ── Range filter ─────────────────────────────────────────────────────────────

  const rangeStart = useMemo(
    () => getRangeStart(timeRange, customStart),
    [timeRange, customStart]
  );
  const rangeEnd = useMemo(
    () => (timeRange === "custom" && customEnd ? new Date(customEnd + "T23:59:59") : null),
    [timeRange, customEnd]
  );

  // ── Filtered data ────────────────────────────────────────────────────────────

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => inRange(e.date, rangeStart, rangeEnd)),
    [expenses, rangeStart, rangeEnd]
  );

  const filteredIncome = useMemo(
    () => income.filter((i) => inRange(i.date, rangeStart, rangeEnd)),
    [income, rangeStart, rangeEnd]
  );

  // ── KPIs ─────────────────────────────────────────────────────────────────────

  const headCount = herd?.headCount ?? 0;

  const totalActualExpenses = useMemo(
    () => filteredExpenses.filter((e) => e.entryType === "actual").reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const totalActualIncome = useMemo(
    () => filteredIncome.filter((i) => i.entryType === "actual").reduce((s, i) => s + i.totalAmount, 0),
    [filteredIncome]
  );

  const perHeadCost = headCount > 0 ? totalActualExpenses / headCount : 0;

  const netPL = totalActualIncome - totalActualExpenses;

  // Break-even: we need income to cover expenses — per-head break-even price
  const breakEvenPrice = headCount > 0 ? totalActualExpenses / headCount : 0;

  // ── Monthly rollups ───────────────────────────────────────────────────────────

  const monthlyData = useMemo((): MonthlyRollup[] => {
    const map = new Map<string, MonthlyRollup>();

    const ensureMonth = (ym: string) => {
      if (!map.has(ym)) {
        map.set(ym, {
          month: ym,
          label: getMonthLabel(ym),
          actualExpenses: 0,
          projectedExpenses: 0,
          actualIncome: 0,
          projectedIncome: 0,
        });
      }
      return map.get(ym)!;
    };

    for (const e of filteredExpenses) {
      const ym = e.date.slice(0, 7);
      const row = ensureMonth(ym);
      if (e.entryType === "actual") row.actualExpenses += e.amount;
      else row.projectedExpenses += e.amount;
    }

    for (const i of filteredIncome) {
      const ym = i.date.slice(0, 7);
      const row = ensureMonth(ym);
      if (i.entryType === "actual") row.actualIncome += i.totalAmount;
      else row.projectedIncome += i.totalAmount;
    }

    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [filteredExpenses, filteredIncome]);

  // ── Expense category breakdown ────────────────────────────────────────────────

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredExpenses.filter((e) => e.entryType === "actual")) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const categoryTotal = useMemo(
    () => categoryBreakdown.reduce((s, c) => s + c.value, 0),
    [categoryBreakdown]
  );

  // ── Cumulative P&L ────────────────────────────────────────────────────────────

  const cumulativePLData = useMemo((): CumulativePoint[] => {
    type RawEntry = {
      date: string;
      type: "expense" | "income";
      amount: number;
      description: string;
    };

    const entries: RawEntry[] = [
      ...filteredExpenses
        .filter((e) => e.entryType === "actual")
        .map((e): RawEntry => ({
          date: e.date,
          type: "expense",
          amount: -e.amount,
          description: e.category + (e.description ? ` – ${e.description}` : ""),
        })),
      ...filteredIncome
        .filter((i) => i.entryType === "actual")
        .map((i): RawEntry => ({
          date: i.date,
          type: "income",
          amount: i.totalAmount,
          description: i.incomeType,
        })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    let running = 0;
    return entries.map((e) => {
      running += e.amount;
      return {
        date: e.date,
        label: new Date(e.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        cumulativePL: running,
        perHeadPL: headCount > 0 ? running / headCount : 0,
        type: e.type,
        amount: e.amount,
        description: e.description,
      };
    });
  }, [filteredExpenses, filteredIncome, headCount]);

  // ── Per-head cost trend ────────────────────────────────────────────────────────

  const perHeadTrendData = useMemo(() => {
    if (headCount === 0) return monthlyData.map((m) => ({ ...m, actualPerHead: 0, projectedPerHead: 0 }));
    return monthlyData.map((m) => ({
      ...m,
      actualPerHead: m.actualExpenses / headCount,
      projectedPerHead: m.projectedExpenses > 0 ? m.projectedExpenses / headCount : 0,
    }));
  }, [monthlyData, headCount]);

  // ── Income by type ────────────────────────────────────────────────────────────

  const incomeByType = useMemo(() => {
    const map = new Map<string, { actual: number; projected: number }>();
    for (const i of filteredIncome) {
      const key = i.incomeType || "Other";
      if (!map.has(key)) map.set(key, { actual: 0, projected: 0 });
      const row = map.get(key)!;
      if (i.entryType === "actual") row.actual += i.totalAmount;
      else row.projected += i.totalAmount;
    }
    return Array.from(map.entries())
      .map(([type, vals]) => ({ type, ...vals }))
      .sort((a, b) => b.actual + b.projected - (a.actual + a.projected));
  }, [filteredIncome]);

  // ── Activity feed ─────────────────────────────────────────────────────────────

  const activityFeed = useMemo(() => {
    type FeedItem = {
      id: string;
      date: string;
      kind: "expense" | "income";
      category: string;
      amount: number;
      description: string;
      entryType: string;
    };

    const items: FeedItem[] = [
      ...expenses.slice(-50).map((e): FeedItem => ({
        id: `exp-${e.id}`,
        date: e.date,
        kind: "expense",
        category: e.category,
        amount: e.amount,
        description: e.description || e.subcategory || "",
        entryType: e.entryType,
      })),
      ...income.slice(-50).map((i): FeedItem => ({
        id: `inc-${i.id}`,
        date: i.date,
        kind: "income",
        category: i.incomeType,
        amount: i.totalAmount,
        description: i.notes || "",
        entryType: i.entryType,
      })),
    ];

    const sorted = items.sort((a, b) =>
      activitySort === "desc"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    );

    return sorted.slice(0, 20);
  }, [expenses, income, activitySort]);

  // ── USDA market price per head estimate ───────────────────────────────────────
  // priceCwt is $/cwt (per 100 lbs), convert to $/head using avgWeight
  const marketPricePerHead = useMemo(() => {
    if (!marketData || marketData.error || !marketData.priceCwt || !herd?.avgWeight) return null;
    return (marketData.priceCwt / 100) * herd.avgWeight;
  }, [marketData, herd]);

  // ── Checks ────────────────────────────────────────────────────────────────────

  const hasAnyData =
    (herd && herd.headCount > 0) ||
    expenses.length > 0 ||
    income.length > 0;

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PALETTE.sectionAlt }}>
        <div className="text-gray-400 text-sm">Loading dashboard…</div>
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: PALETTE.sectionAlt }}>
        <TopBar
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
          lastUpdated={lastUpdated}
          onRefresh={loadData}
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: PALETTE.sectionAlt }}>
      <TopBar
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
        lastUpdated={lastUpdated}
        onRefresh={loadData}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            label="Head Count"
            value={headCount > 0 ? headCount.toString() : "—"}
            sub={herd?.breed || undefined}
          />
          <KpiCard
            label="Total Expenses"
            value={totalActualExpenses > 0 ? fmtShort(totalActualExpenses) : "—"}
            sub="Actual only"
          />
          <KpiCard
            label="Per-Head Cost"
            value={perHeadCost > 0 ? fmt(perHeadCost) : "—"}
            sub={headCount > 0 ? `across ${headCount} head` : undefined}
          />
          <KpiCard
            label="Break-Even Price"
            value={breakEvenPrice > 0 ? fmt(breakEvenPrice) : "—"}
            sub="per head to break even"
          />
          <KpiCard
            label="Actual Income"
            value={totalActualIncome > 0 ? fmtShort(totalActualIncome) : "—"}
            sub="Actual only"
          />
          <KpiCard
            label="Net P&L"
            value={totalActualExpenses > 0 || totalActualIncome > 0 ? fmtShort(netPL) : "—"}
            color={netPL >= 0 ? PALETTE.green : PALETTE.red}
            sub={netPL >= 0 ? "Profitable" : "Operating at a loss"}
          />
        </div>

        {/* Chart grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Chart 1: Expenses Over Time */}
          <ChartCard
            title="Expenses Over Time"
            subtitle="Actual vs projected monthly expenses"
          >
            {monthlyData.length === 0 ? (
              <PartialEmptyState message="No expense data in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 11 }} width={72} />
                  { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                  <Tooltip content={ExpensesOverTimeTooltip as any} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actualExpenses"
                    name="Actual Expenses"
                    stroke={PALETTE.green}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedExpenses"
                    name="Projected/Budgeted"
                    stroke={PALETTE.amber}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 2: Income vs Expenses grouped bar */}
          <ChartCard
            title="Income vs Expenses"
            subtitle="Monthly comparison — actual and projected"
          >
            {monthlyData.length === 0 ? (
              <PartialEmptyState message="No data in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 11 }} width={72} />
                  { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                  <Tooltip content={IncomeVsExpensesTooltip as any} />
                  <Legend />
                  <Bar dataKey="actualIncome" name="Actual Income" fill={PALETTE.green} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actualExpenses" name="Actual Expenses" fill={PALETTE.brown} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="projectedIncome" name="Projected Income" fill={PALETTE.lightGreen} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="projectedExpenses" name="Projected Expenses" fill={PALETTE.amber} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 3: Expense category donut */}
          <ChartCard
            title="Expense Breakdown by Category"
            subtitle="Actual expenses by category"
          >
            {categoryBreakdown.length === 0 ? (
              <PartialEmptyState message="No actual expense data in this time range." />
            ) : (
              <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                    <Tooltip content={CategoryTooltip as any} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label is rendered via SVG trick below — use legend instead */}
                <div className="text-center -mt-2">
                  <span className="text-xs text-gray-400">Total: </span>
                  <span className="text-sm font-bold" style={{ color: PALETTE.brown }}>{fmt(categoryTotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                  {categoryBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      <span className="truncate text-gray-600">{entry.name}</span>
                      <span className="ml-auto font-semibold text-gray-800 flex-shrink-0">{entry.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          {/* Chart 4: Cumulative P&L area chart */}
          <ChartCard
            title="Cumulative P&L Over Time"
            subtitle="Running net profit/loss — actual entries only"
          >
            {cumulativePLData.length === 0 ? (
              <PartialEmptyState message="No actual income or expense entries in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cumulativePLData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="plGradientPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.green} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PALETTE.green} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="plGradientNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.red} stopOpacity={0.02} />
                      <stop offset="95%" stopColor={PALETTE.red} stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece7" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 11 }} width={72} />
                  { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                  <Tooltip content={CumulativePLTooltip as any} />
                  <ReferenceLine y={0} stroke={PALETTE.red} strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "$0", position: "insideLeft", fontSize: 10, fill: PALETTE.red }} />
                  <Area
                    type="monotone"
                    dataKey="cumulativePL"
                    name="Cumulative P&L"
                    stroke={PALETTE.green}
                    strokeWidth={2}
                    fill="url(#plGradientPos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 5: Per-head cost trend */}
          <ChartCard
            title="Per-Head Cost Trend"
            subtitle="Monthly cost per animal"
          >
            {perHeadTrendData.length === 0 || headCount === 0 ? (
              <PartialEmptyState message={headCount === 0 ? "Set up your herd to see per-head costs." : "No data in this time range."} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={perHeadTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 11 }} width={72} />
                  { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                  <Tooltip content={PerHeadTooltip as any} />
                  <Legend />
                  {breakEvenPrice > 0 && (
                    <ReferenceLine
                      y={breakEvenPrice}
                      stroke={PALETTE.amber}
                      strokeDasharray="6 3"
                      label={{ value: `Break-Even ${fmt(breakEvenPrice)}`, position: "insideTopLeft", fontSize: 9, fill: PALETTE.amber }}
                    />
                  )}
                  {marketPricePerHead != null && (
                    <ReferenceLine
                      y={marketPricePerHead}
                      stroke={PALETTE.red}
                      strokeDasharray="4 2"
                      label={{ value: `Market ~${fmtShort(marketPricePerHead)}/hd`, position: "insideTopRight", fontSize: 9, fill: PALETTE.red }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="actualPerHead"
                    name="Actual $/Head"
                    stroke={PALETTE.green}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedPerHead"
                    name="Projected $/Head"
                    stroke={PALETTE.amber}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 6: Income by type horizontal bar */}
          <ChartCard
            title="Income by Type"
            subtitle="Actual vs projected per income category"
          >
            {incomeByType.length === 0 ? (
              <PartialEmptyState message="No income recorded in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, incomeByType.length * 60 + 40)}>
                <BarChart
                  data={incomeByType}
                  layout="vertical"
                  margin={{ top: 5, right: 80, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece7" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={130} />
                  { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                  <Tooltip content={IncomeByTypeTooltip as any} />
                  <Legend />
                  <Bar dataKey="actual" name="Actual" fill={PALETTE.green} radius={[0, 3, 3, 0]}>
                    <LabelList
                      dataKey="actual"
                      position="right"
                      formatter={(v: unknown) => typeof v === "number" && v > 0 ? fmtShort(v) : ""}
                      style={{ fontSize: 11, fill: PALETTE.brown }}
                    />
                  </Bar>
                  <Bar dataKey="projected" name="Projected" fill={PALETTE.lightGreen} radius={[0, 3, 3, 0]}>
                    <LabelList
                      dataKey="projected"
                      position="right"
                      formatter={(v: unknown) => typeof v === "number" && v > 0 ? fmtShort(v) : ""}
                      style={{ fontSize: 11, fill: PALETTE.amber }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <h3
                className="text-base font-bold"
                style={{ color: PALETTE.brown, fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Recent Activity
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 20 entries across expenses and income</p>
            </div>
            <button
              onClick={() => setActivitySort((s) => (s === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              style={{ color: PALETTE.brown }}
            >
              Date {activitySort === "desc" ? "↓ Newest first" : "↑ Oldest first"}
            </button>
          </div>

          {activityFeed.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Per Head</th>
                  </tr>
                </thead>
                <tbody>
                  {activityFeed.map((item) => {
                    const perHead = headCount > 0 ? item.amount / headCount : null;
                    const isIncome = item.kind === "income";
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">
                          {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{
                              backgroundColor: isIncome ? "#dcfce7" : "#fee2e2",
                              color: isIncome ? PALETTE.green : PALETTE.red,
                            }}
                          >
                            {item.kind}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-700">{item.category || "—"}</td>
                        <td className="py-2.5 px-2 text-gray-400 text-xs max-w-[200px] truncate">{item.description || "—"}</td>
                        <td
                          className="py-2.5 px-2 text-right font-semibold tabular-nums"
                          style={{ color: isIncome ? PALETTE.green : PALETTE.red }}
                        >
                          {isIncome ? "+" : "-"}{fmt(Math.abs(item.amount))}
                        </td>
                        <td className="py-2.5 px-2 text-right text-xs text-gray-400 tabular-nums">
                          {perHead != null ? fmt(Math.abs(perHead)) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({
  timeRange,
  setTimeRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  lastUpdated,
  onRefresh,
}: {
  timeRange: TimeRange;
  setTimeRange: (r: TimeRange) => void;
  customStart: string;
  setCustomStart: (s: string) => void;
  customEnd: string;
  setCustomEnd: (s: string) => void;
  lastUpdated: Date;
  onRefresh: () => void;
}) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "year", label: "This Year" },
    { value: "6mo", label: "Last 6 Months" },
    { value: "3mo", label: "Last 3 Months" },
    { value: "1mo", label: "Last Month" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div
      className="sticky top-0 z-40 border-b border-gray-200 shadow-sm"
      style={{ backgroundColor: PALETTE.brown }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
        {/* Back + title */}
        <div className="flex items-center gap-3 mr-auto min-w-0">
          <Link
            href="/admin/business/sheep"
            className="text-white/60 hover:text-white text-xs transition-colors flex-shrink-0"
          >
            ← Sheep Tracker
          </Link>
          <h1
            className="text-white font-bold text-lg leading-tight truncate"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Sheep Dashboard
          </h1>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                timeRange === r.value
                  ? "bg-white text-[#3d2b1f]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Custom date pickers */}
        {timeRange === "custom" && (
          <div className="flex items-center gap-2 text-xs text-white/80">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
            />
          </div>
        )}

        {/* Refresh + timestamp */}
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.13-3.87M20 15a9 9 0 01-14.13 3.87" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Partial empty state ──────────────────────────────────────────────────────

function PartialEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      {message}
    </div>
  );
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function ExpensesOverTimeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const actual = payload.find((p) => p.dataKey === "actualExpenses")?.value ?? 0;
  const projected = payload.find((p) => p.dataKey === "projectedExpenses")?.value ?? 0;
  const diff = (actual as number) - (projected as number);
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: PALETTE.green }}>Actual: {fmt(actual as number)}</p>
      <p style={{ color: PALETTE.amber }}>Projected: {fmt(projected as number)}</p>
      {(projected as number) > 0 && (
        <p className="mt-1 border-t border-gray-100 pt-1" style={{ color: diff > 0 ? PALETTE.red : PALETTE.green }}>
          Diff: {diff > 0 ? "+" : ""}{fmt(diff)}
        </p>
      )}
    </CustomTooltipBox>
  );
}

function IncomeVsExpensesTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const get = (key: string) => (payload.find((p) => p.dataKey === key)?.value as number) ?? 0;
  const ai = get("actualIncome");
  const ae = get("actualExpenses");
  const pi = get("projectedIncome");
  const pe = get("projectedExpenses");
  const net = ai - ae;
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: PALETTE.green }}>Actual Income: {fmt(ai)}</p>
      <p style={{ color: PALETTE.brown }}>Actual Expenses: {fmt(ae)}</p>
      {pi > 0 && <p style={{ color: PALETTE.lightGreen }}>Proj. Income: {fmt(pi)}</p>}
      {pe > 0 && <p style={{ color: PALETTE.amber }}>Proj. Expenses: {fmt(pe)}</p>}
      <p className="mt-1 border-t border-gray-100 pt-1 font-semibold" style={{ color: net >= 0 ? PALETTE.green : PALETTE.red }}>
        Net: {net >= 0 ? "+" : ""}{fmt(net)}
      </p>
    </CustomTooltipBox>
  );
}

function CategoryTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as { name: string; value: number; pct: number };
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{d.name}</p>
      <p style={{ color: PALETTE.brown }}>{fmt(d.value)}</p>
      <p className="text-gray-400">{d.pct.toFixed(1)}% of total</p>
    </CustomTooltipBox>
  );
}

function CumulativePLTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as { cumulativePL: number; perHeadPL: number };
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: d.cumulativePL >= 0 ? PALETTE.green : PALETTE.red }}>
        Cumulative P&L: {fmt(d.cumulativePL)}
      </p>
      <p className="text-gray-500">Per Head: {fmt(d.perHeadPL)}</p>
    </CustomTooltipBox>
  );
}

function PerHeadTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const get = (key: string) => (payload.find((p) => p.dataKey === key)?.value as number) ?? 0;
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: PALETTE.green }}>Actual $/Head: {fmt(get("actualPerHead"))}</p>
      {get("projectedPerHead") > 0 && (
        <p style={{ color: PALETTE.amber }}>Projected $/Head: {fmt(get("projectedPerHead"))}</p>
      )}
    </CustomTooltipBox>
  );
}

function IncomeByTypeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const get = (key: string) => (payload.find((p) => p.dataKey === key)?.value as number) ?? 0;
  return (
    <CustomTooltipBox>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: PALETTE.green }}>Actual: {fmt(get("actual"))}</p>
      <p style={{ color: PALETTE.lightGreen }}>Projected: {fmt(get("projected"))}</p>
    </CustomTooltipBox>
  );
}
