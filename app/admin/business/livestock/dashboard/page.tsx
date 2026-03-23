"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_KEY = "wwa_admin_token";
const LIVESTOCK_KEY = "wwa_livestock_groups";
const EXPENSES_KEY = "wwa_group_expenses";
const SALES_KEY = "wwa_sale_records";
const HEALTH_KEY = "wwa_health_records";
const BREEDING_KEY = "wwa_breeding_records";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LivestockGroup {
  id: string;
  name: string;
  category: string;
  categoryEmoji: string;
  totalHeadCount: number;
  totalValue: number;
  status?: "active" | "sold" | "partial" | "closed";
}

interface GroupExpense {
  id: string;
  groupId: string;
  amount: number;
  isActual: boolean;
  date: string;
}

interface SaleRecord {
  id: string;
  groupId: string;
  totalAmount: number;
  isActual: boolean;
  date: string;
}

interface HealthRecord {
  id: string;
  groupId: string;
  withdrawalDateMeat?: string;
  withdrawalDateMilk?: string;
  product?: string;
  type: string;
  nextDueDate?: string;
}

interface BreedingRecord {
  id: string;
  groupId: string;
  expectedBirthDate?: string;
  actualBirthDate?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LivestockDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<LivestockGroup[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") { router.replace("/admin"); return; }

    try { setGroups(JSON.parse(localStorage.getItem(LIVESTOCK_KEY) || "[]")); } catch { /* ignore */ }
    try { setExpenses(JSON.parse(localStorage.getItem(EXPENSES_KEY) || "[]")); } catch { /* ignore */ }
    try { setSales(JSON.parse(localStorage.getItem(SALES_KEY) || "[]")); } catch { /* ignore */ }
    try { setHealthRecords(JSON.parse(localStorage.getItem(HEALTH_KEY) || "[]")); } catch { /* ignore */ }
    try { setBreedingRecords(JSON.parse(localStorage.getItem(BREEDING_KEY) || "[]")); } catch { /* ignore */ }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
        <p className="text-[var(--color-farm-brown)]" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>Loading…</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Farm totals
  const totalAcquisitionValue = groups.reduce((s, g) => s + g.totalValue, 0);
  const totalActualExpenses = expenses.filter((e) => e.isActual).reduce((s, e) => s + e.amount, 0);
  const totalActualIncome = sales.filter((s) => s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const totalInvested = totalAcquisitionValue + totalActualExpenses;
  const netPnL = totalActualIncome - totalInvested;
  const totalHead = groups.reduce((s, g) => s + g.totalHeadCount, 0);

  // Per-group P&L for bar chart
  const groupPnLData = groups.map((g) => {
    const gExpenses = expenses.filter((e) => e.groupId === g.id && e.isActual).reduce((s, e) => s + e.amount, 0);
    const gIncome = sales.filter((s) => s.groupId === g.id && s.isActual).reduce((s, r) => s + r.totalAmount, 0);
    const invested = g.totalValue + gExpenses;
    return {
      name: `${g.categoryEmoji} ${g.name.length > 20 ? g.name.slice(0, 18) + "…" : g.name}`,
      income: Math.round(gIncome),
      expenses: Math.round(invested),
      net: Math.round(gIncome - invested),
    };
  });

  // Species breakdown for donut
  const speciesCounts: Record<string, number> = {};
  groups.forEach((g) => {
    speciesCounts[g.category] = (speciesCounts[g.category] || 0) + g.totalHeadCount;
  });
  const donutData = Object.entries(speciesCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#4a7c3f", "#c8922a", "#c0392b", "#3d2b1f", "#7c5c3e", "#5f9652", "#d4a76a", "#a0c878"];

  // Upcoming events
  const activeWithdrawals = healthRecords.filter(
    (r) => (r.withdrawalDateMeat && r.withdrawalDateMeat >= today) || (r.withdrawalDateMilk && r.withdrawalDateMilk >= today)
  );

  const upcomingDueDates = healthRecords
    .filter((r) => r.nextDueDate && r.nextDueDate >= today && r.nextDueDate <= new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0])
    .sort((a, b) => (a.nextDueDate || "").localeCompare(b.nextDueDate || ""));

  const expectedBirths = breedingRecords
    .filter((r) => r.expectedBirthDate && r.expectedBirthDate >= today && !r.actualBirthDate)
    .sort((a, b) => (a.expectedBirthDate || "").localeCompare(b.expectedBirthDate || ""));

  const projectedSales = sales
    .filter((s) => !s.isActual && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)]">
      {/* Header */}
      <header className="wood-texture shadow" style={{ backgroundColor: "var(--color-farm-brown)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span className="text-[var(--color-farm-cream)] font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Webb&apos;s Wild Acres — Livestock Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/business/livestock" className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest">Livestock Manager</Link>
              <Link href="/admin/business" className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest">Business Center</Link>
              <Link href="/admin/dashboard" className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest">Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Livestock Dashboard</h1>
          <p className="text-sm text-gray-600 mt-0.5">Cross-species farm financial summary</p>
        </div>

        {/* Withdrawal Alert Banner */}
        {activeWithdrawals.length > 0 && (
          <div className="bg-[#c0392b] text-white rounded-xl p-4 mb-6 border-2 border-red-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <div className="font-bold text-base mb-1">Active Withdrawal Periods ({activeWithdrawals.length})</div>
                <div className="space-y-1">
                  {activeWithdrawals.slice(0, 5).map((r) => {
                    const g = groups.find((x) => x.id === r.groupId);
                    return (
                      <div key={r.id} className="text-sm bg-white/10 rounded px-3 py-1">
                        <span className="font-semibold">{g?.name || "Unknown Group"}</span>
                        {" — "}
                        <span>{r.product || r.type}</span>
                        {r.withdrawalDateMeat && r.withdrawalDateMeat >= today && (
                          <span className="ml-2 text-xs bg-red-900/50 px-2 py-0.5 rounded">🥩 Meat clears {r.withdrawalDateMeat}</span>
                        )}
                        {r.withdrawalDateMilk && r.withdrawalDateMilk >= today && (
                          <span className="ml-2 text-xs bg-red-900/50 px-2 py-0.5 rounded">🥛 Milk clears {r.withdrawalDateMilk}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Head", value: totalHead.toString(), color: "text-[#3d2b1f]" },
            { label: "Active Groups", value: groups.filter((g) => g.status !== "sold" && g.status !== "closed").length.toString(), color: "text-[#3d2b1f]" },
            { label: "Total Invested", value: fmt(totalInvested), color: "text-[#c0392b]" },
            { label: "Total Income", value: fmt(totalActualIncome), color: "text-[#4a7c3f]" },
            { label: "Net P&L", value: fmt(netPnL), color: netPnL >= 0 ? "text-[#4a7c3f]" : "text-[#c0392b]" },
          ].map((card) => (
            <div key={card.label} className="card-rustic p-4">
              <div className={`text-xl font-bold ${card.color}`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{card.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Per-Group P&L Bar Chart */}
          <div className="lg:col-span-2 card-rustic p-5">
            <h2 className="font-bold text-[#3d2b1f] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Per-Group P&L Comparison</h2>
            {groupPnLData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No groups yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={groupPnLData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c8922a20" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(value) => fmt(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4a7c3f" />
                  <Bar dataKey="expenses" name="Invested" fill="#c0392b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Species Donut */}
          <div className="card-rustic p-5">
            <h2 className="font-bold text-[#3d2b1f] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Head by Species</h2>
            {donutData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No groups yet.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {donutData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} head`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[#3d2b1f]">{d.name}: <span className="font-semibold">{d.value} head</span></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group Table */}
        <div className="card-rustic p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>All Groups</h2>
            <Link href="/admin/business/livestock" className="text-sm text-[#4a7c3f] hover:underline font-medium">Manage →</Link>
          </div>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No livestock groups yet.{" "}
              <Link href="/admin/business/livestock" className="text-[#4a7c3f] hover:underline">Add your first group →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left pb-2">Group</th>
                    <th className="text-left pb-2">Species</th>
                    <th className="text-right pb-2">Head</th>
                    <th className="text-right pb-2">Invested</th>
                    <th className="text-right pb-2">Income</th>
                    <th className="text-right pb-2">Net P&amp;L</th>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-right pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    const gExpenses = expenses.filter((e) => e.groupId === g.id && e.isActual).reduce((s, e) => s + e.amount, 0);
                    const gIncome = sales.filter((s) => s.groupId === g.id && s.isActual).reduce((s, r) => s + r.totalAmount, 0);
                    const invested = g.totalValue + gExpenses;
                    const net = gIncome - invested;
                    const statusLabel = g.status === "sold" ? "Sold Out" : g.status === "partial" ? "Partial" : "Active";
                    const statusColor = g.status === "sold" ? "bg-gray-200 text-gray-600" : g.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-[#4a7c3f]";
                    return (
                      <tr key={g.id} className="border-b border-[#c8922a]/10 hover:bg-amber-50/50">
                        <td className="py-2 font-medium text-[#3d2b1f]">{g.categoryEmoji} {g.name}</td>
                        <td className="py-2 text-gray-500">{g.category}</td>
                        <td className="py-2 text-right">{g.totalHeadCount}</td>
                        <td className="py-2 text-right text-[#c0392b]">{fmt(invested)}</td>
                        <td className="py-2 text-right text-[#4a7c3f]">{fmt(gIncome)}</td>
                        <td className={`py-2 text-right font-semibold ${net >= 0 ? "text-[#4a7c3f]" : "text-[#c0392b]"}`}>{fmt(net)}</td>
                        <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span></td>
                        <td className="py-2 text-right"><Link href={`/admin/business/livestock/${g.id}`} className="text-xs text-[#4a7c3f] hover:underline font-medium">View →</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Due Treatments */}
          <div className="card-rustic p-5">
            <h3 className="font-bold text-[#3d2b1f] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Due Treatments (30 days)</h3>
            {upcomingDueDates.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No upcoming treatments.</p>
            ) : (
              <div className="space-y-2">
                {upcomingDueDates.slice(0, 5).map((r) => {
                  const g = groups.find((x) => x.id === r.groupId);
                  return (
                    <div key={r.id} className="text-sm border-b border-[#c8922a]/10 pb-2 last:border-0">
                      <div className="font-medium text-[#3d2b1f]">{r.product || r.type}</div>
                      <div className="text-xs text-gray-500">{g?.name} · Due {r.nextDueDate}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expected Births */}
          <div className="card-rustic p-5">
            <h3 className="font-bold text-[#3d2b1f] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Expected Births</h3>
            {expectedBirths.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No births expected.</p>
            ) : (
              <div className="space-y-2">
                {expectedBirths.slice(0, 5).map((r) => {
                  const g = groups.find((x) => x.id === r.groupId);
                  return (
                    <div key={r.id} className="text-sm border-b border-[#c8922a]/10 pb-2 last:border-0">
                      <div className="font-medium text-[#3d2b1f]">{g?.name || "Unknown Group"}</div>
                      <div className="text-xs text-gray-500">Expected {r.expectedBirthDate}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Projected Sales */}
          <div className="card-rustic p-5">
            <h3 className="font-bold text-[#3d2b1f] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Projected Sales</h3>
            {projectedSales.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No projected sales.</p>
            ) : (
              <div className="space-y-2">
                {projectedSales.map((s) => {
                  const g = groups.find((x) => x.id === s.groupId);
                  return (
                    <div key={s.id} className="text-sm border-b border-[#c8922a]/10 pb-2 last:border-0">
                      <div className="font-medium text-[#4a7c3f]">{fmt(s.totalAmount)}</div>
                      <div className="text-xs text-gray-500">{g?.name} · {s.date}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
