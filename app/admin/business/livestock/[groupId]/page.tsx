"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_KEY = "wwa_admin_token";
const LIVESTOCK_KEY = "wwa_livestock_groups";
const ANIMALS_KEY = "wwa_animals";
const WEIGHT_KEY = "wwa_weight_records";
const HEALTH_KEY = "wwa_health_records";
const EXPENSES_KEY = "wwa_group_expenses";
const SALES_KEY = "wwa_sale_records";
const POULTRY_KEY = "wwa_poultry_records";
const BREEDING_KEY = "wwa_breeding_records";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceLine {
  label: string;
  quantity: number;
  pricePerHead?: number;
  pricePerLb?: number;
  avgWeightLbs?: number;
  yieldPct?: number;
  subtotal: number;
}

interface LivestockGroup {
  id: string;
  name: string;
  category: string;
  categoryEmoji: string;
  subcategories: string[];
  purpose: string[];
  acquisitionDate: string;
  acquisitionSource: string;
  notes: string;
  pricingMode: string;
  priceLines: PriceLine[];
  totalHeadCount: number;
  totalValue: number;
  avgPricePerHead: number;
  status?: "active" | "sold" | "partial" | "closed";
  trackingMode?: "individual" | "flock";
  createdAt: string;
  updatedAt: string;
}

interface Animal {
  id: string;
  groupId: string;
  tagNumber: string;
  name?: string;
  subcategory: string;
  sex: "male" | "female" | "castrated" | "unknown";
  birthDate?: string;
  damId?: string;
  sireId?: string;
  breed?: string;
  color?: string;
  markings?: string;
  registrationNumber?: string;
  currentWeightLbs?: number;
  status: "active" | "sold" | "deceased" | "culled" | "transferred";
  statusDate?: string;
  statusNotes?: string;
  notes?: string;
  bcs?: number;
  scrapieTagNumber?: string;
  dhiaEnrolled?: boolean;
}

interface WeightRecord {
  id: string;
  groupId: string;
  animalId?: string;
  date: string;
  weightLbs: number;
  notes?: string;
}

interface HealthRecord {
  id: string;
  groupId: string;
  animalIds: string[];
  date: string;
  type: "vaccination" | "deworming" | "treatment" | "checkup" | "injury" | "illness" | "death" | "surgery" | "other";
  diagnosis?: string;
  product?: string;
  lotNumber?: string;
  dosage?: string;
  route?: string;
  administeredBy?: string;
  withdrawalDateMeat?: string;
  withdrawalDateMilk?: string;
  vetName?: string;
  cost?: number;
  nextDueDate?: string;
  notes?: string;
}

interface GroupExpense {
  id: string;
  groupId: string;
  animalIds: string[];
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  isActual: boolean;
  vendor?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  notes?: string;
}

interface SaleRecord {
  id: string;
  groupId: string;
  animalIds: string[];
  date: string;
  saleType: string;
  buyer?: string;
  buyerContact?: string;
  marketLocation?: string;
  headCount: number;
  pricingMode: string;
  priceAmount: number;
  avgWeightLbs?: number;
  yieldPct?: number;
  totalAmount: number;
  isActual: boolean;
  notes?: string;
}

interface PoultryFlockRecord {
  id: string;
  groupId: string;
  weekStartDate: string;
  eggsCollected?: number;
  mortalityCount?: number;
  feedDeliveredLbs?: number;
  avgBodyWeightLbs?: number;
  notes?: string;
}

interface BreedingRecord {
  id: string;
  groupId: string;
  femaleAnimalId?: string;
  maleAnimalId?: string;
  maleDescription?: string;
  breedingDate: string;
  method: "natural" | "ai" | "embryo_transfer";
  expectedBirthDate?: string;
  actualBirthDate?: string;
  offspringCount?: number;
  offspringBornAlive?: number;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function generateId(): string {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isWithdrawalActive(withdrawalDate: string): boolean {
  if (!withdrawalDate) return false;
  return new Date(withdrawalDate) >= new Date(new Date().toISOString().split("T")[0]);
}

const EXPENSE_CATEGORIES: Record<string, string[]> = {
  Bovine: ["Feed & Hay", "Veterinary", "Medications/Vaccines", "AI & Breeding", "Ear Tags/RFID", "Pasture/Land", "Equipment", "Labor", "Transport", "Marketing", "Insurance", "Other"],
  Ovine: ["Feed & Hay", "Veterinary", "Medications/CD&T Vaccines", "Deworming", "Shearing", "Lambing/Kidding Supplies", "Scrapie Tags", "Predator Protection", "Pasture", "Equipment", "Labor", "Other"],
  Caprine: ["Feed & Hay", "Veterinary", "Medications/CD&T Vaccines", "Deworming", "Shearing", "Lambing/Kidding Supplies", "Scrapie Tags", "Predator Protection", "Pasture", "Equipment", "Labor", "Other"],
  Avian: ["Chick/Poult Purchase", "Feed", "Bedding", "Vaccines", "Medications", "Processing/Slaughter Fees", "Packaging", "Equipment", "Labor", "Other"],
  Porcine: ["Feeder Pig Purchase", "Feed", "Bedding", "Veterinary", "Vaccines", "Processing", "Equipment", "Labor", "Other"],
  Equine: ["Feed & Hay", "Veterinary", "Farrier", "Coggins/Health Certs", "Equipment", "Transport", "Other"],
};

const DEFAULT_EXPENSE_CATEGORIES = ["Feed & Hay", "Veterinary", "Medications", "Equipment", "Labor", "Transport", "Other"];

function getExpenseCategories(category: string): string[] {
  return EXPENSE_CATEGORIES[category] ?? DEFAULT_EXPENSE_CATEGORIES;
}

// ─── Withdrawal Banner ────────────────────────────────────────────────────────

function WithdrawalBanner({ healthRecords, animals }: { healthRecords: HealthRecord[]; animals: Animal[] }) {
  const today = new Date().toISOString().split("T")[0];
  const activeWithdrawals = healthRecords.filter(
    (r) => (r.withdrawalDateMeat && r.withdrawalDateMeat >= today) || (r.withdrawalDateMilk && r.withdrawalDateMilk >= today)
  );
  if (activeWithdrawals.length === 0) return null;

  return (
    <div className="bg-[#c0392b] text-white rounded-xl p-4 mb-6 border-2 border-red-800">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <div className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Active Withdrawal Periods
          </div>
          <div className="space-y-1">
            {activeWithdrawals.map((r) => {
              const animalNames = r.animalIds.length === 0
                ? "Whole Group"
                : r.animalIds.map((id) => {
                    const a = animals.find((x) => x.id === id);
                    return a ? (a.name || a.tagNumber) : id;
                  }).join(", ");
              return (
                <div key={r.id} className="text-sm bg-white/10 rounded px-3 py-1.5">
                  <span className="font-semibold">{r.product || r.type}</span>
                  {" — "}
                  <span>{animalNames}</span>
                  {r.withdrawalDateMeat && r.withdrawalDateMeat >= today && (
                    <span className="ml-2 bg-red-900/50 px-2 py-0.5 rounded text-xs">🥩 Meat clears {r.withdrawalDateMeat}</span>
                  )}
                  {r.withdrawalDateMilk && r.withdrawalDateMilk >= today && (
                    <span className="ml-2 bg-red-900/50 px-2 py-0.5 rounded text-xs">🥛 Milk clears {r.withdrawalDateMilk}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function TabOverview({
  group,
  animals,
  expenses,
  sales,
  healthRecords,
  weightRecords,
  poultryRecords,
  onLogExpense,
  onRecordSale,
  onAddHealth,
  onLogWeight,
}: {
  group: LivestockGroup;
  animals: Animal[];
  expenses: GroupExpense[];
  sales: SaleRecord[];
  healthRecords: HealthRecord[];
  weightRecords: WeightRecord[];
  poultryRecords: PoultryFlockRecord[];
  onLogExpense: () => void;
  onRecordSale: () => void;
  onAddHealth: () => void;
  onLogWeight: () => void;
}) {
  const totalExpenses = expenses.filter((e) => e.isActual).reduce((s, e) => s + e.amount, 0);
  const projExpenses = expenses.filter((e) => !e.isActual).reduce((s, e) => s + e.amount, 0);
  const totalIncome = sales.filter((s) => s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const projIncome = sales.filter((s) => !s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const netPnL = totalIncome - totalExpenses - group.totalValue;
  const projPnL = (totalIncome + projIncome) - (totalExpenses + projExpenses) - group.totalValue;
  const activeAnimals = animals.filter((a) => a.status === "active").length;
  const avgCostPerHead = group.totalHeadCount > 0 ? group.totalValue / group.totalHeadCount : 0;

  // Recent activity: last 10 events
  type ActivityItem = { date: string; label: string; color: string; icon: string };
  const activity: ActivityItem[] = [
    ...expenses.slice(-5).map((e) => ({ date: e.date, label: `Expense: ${e.description} — ${fmt(e.amount)}`, color: "text-[#c0392b]", icon: "💸" })),
    ...sales.slice(-5).map((s) => ({ date: s.date, label: `Sale: ${s.headCount} head — ${fmt(s.totalAmount)}`, color: "text-[#4a7c3f]", icon: "💰" })),
    ...healthRecords.slice(-5).map((h) => ({ date: h.date, label: `Health: ${h.type}${h.product ? ` — ${h.product}` : ""}`, color: "text-[#c8922a]", icon: "🩺" })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const latestPoultry = poultryRecords.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate))[0];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Head Count", value: group.trackingMode === "individual" ? `${activeAnimals} Active` : `${group.totalHeadCount}`, color: "text-[#3d2b1f]" },
          { label: "Avg Cost/Head", value: fmt(avgCostPerHead), color: "text-[#3d2b1f]" },
          { label: "Total Expenses", value: fmt(totalExpenses), color: "text-[#c0392b]" },
          { label: "Total Income", value: fmt(totalIncome), color: "text-[#4a7c3f]" },
          { label: "Net P&L", value: fmt(netPnL), color: netPnL >= 0 ? "text-[#4a7c3f]" : "text-[#c0392b]" },
          { label: "Projected P&L", value: fmt(projPnL), color: projPnL >= 0 ? "text-[#c8922a]" : "text-[#c0392b]" },
        ].map((card) => (
          <div key={card.label} className="card-rustic p-4">
            <div className={`text-lg font-bold ${card.color}`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{card.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Poultry latest week */}
      {group.category === "Avian" && latestPoultry && (
        <div className="card-rustic p-4">
          <h3 className="font-bold text-[#3d2b1f] mb-3">Latest Week ({latestPoultry.weekStartDate})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {latestPoultry.eggsCollected !== undefined && <div><span className="text-gray-500">Eggs</span><div className="font-bold text-[#3d2b1f]">{latestPoultry.eggsCollected}</div></div>}
            {latestPoultry.mortalityCount !== undefined && <div><span className="text-gray-500">Mortality</span><div className="font-bold text-[#c0392b]">{latestPoultry.mortalityCount}</div></div>}
            {latestPoultry.feedDeliveredLbs !== undefined && <div><span className="text-gray-500">Feed (lbs)</span><div className="font-bold text-[#3d2b1f]">{latestPoultry.feedDeliveredLbs}</div></div>}
            {latestPoultry.avgBodyWeightLbs !== undefined && <div><span className="text-gray-500">Avg Weight</span><div className="font-bold text-[#3d2b1f]">{latestPoultry.avgBodyWeightLbs} lbs</div></div>}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card-rustic p-5">
        <h3 className="font-bold text-[#3d2b1f] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No activity yet. Use the quick actions below to get started.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b border-[#c8922a]/10 pb-2 last:border-0 last:pb-0">
                <span className="text-base">{item.icon}</span>
                <div className="flex-1">
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onLogExpense} className="btn-rustic text-sm px-4 py-2">💸 Log Expense</button>
        <button onClick={onRecordSale} className="btn-rustic text-sm px-4 py-2">💰 Record Sale</button>
        <button onClick={onAddHealth} className="btn-rustic text-sm px-4 py-2">🩺 Add Health Event</button>
        <button onClick={onLogWeight} className="btn-rustic text-sm px-4 py-2">⚖️ Log Weight</button>
      </div>
    </div>
  );
}

// ─── Tab: Animals ─────────────────────────────────────────────────────────────

function TabAnimals({
  group,
  animals,
  weightRecords,
  healthRecords,
  poultryRecords,
  onSave,
}: {
  group: LivestockGroup;
  animals: Animal[];
  weightRecords: WeightRecord[];
  healthRecords: HealthRecord[];
  poultryRecords: PoultryFlockRecord[];
  onSave: (updated: Animal[]) => void;
}) {
  const [filter, setFilter] = useState<"All" | "active" | "sold" | "deceased" | "culled">("All");
  const [showForm, setShowForm] = useState(false);
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [tagNumber, setTagNumber] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [subcategory, setSubcategory] = useState(group.subcategories[0] || "");
  const [sex, setSex] = useState<Animal["sex"]>("female");
  const [birthDate, setBirthDate] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [scrapieTag, setScrapieTag] = useState("");
  const [bcs, setBcs] = useState("");
  const [animalNotes, setAnimalNotes] = useState("");

  const resetForm = () => {
    setTagNumber(""); setAnimalName(""); setSubcategory(group.subcategories[0] || "");
    setSex("female"); setBirthDate(""); setBreed(""); setColor("");
    setCurrentWeight(""); setScrapieTag(""); setBcs(""); setAnimalNotes("");
    setEditAnimal(null);
  };

  const openEdit = (a: Animal) => {
    setEditAnimal(a);
    setTagNumber(a.tagNumber); setAnimalName(a.name || ""); setSubcategory(a.subcategory);
    setSex(a.sex); setBirthDate(a.birthDate || ""); setBreed(a.breed || ""); setColor(a.color || "");
    setCurrentWeight(a.currentWeightLbs?.toString() || ""); setScrapieTag(a.scrapieTagNumber || "");
    setBcs(a.bcs?.toString() || ""); setAnimalNotes(a.notes || "");
    setShowForm(true);
  };

  const saveAnimal = () => {
    if (!tagNumber.trim()) return;
    const a: Animal = {
      id: editAnimal?.id || generateId(),
      groupId: group.id,
      tagNumber: tagNumber.trim(),
      name: animalName.trim() || undefined,
      subcategory,
      sex,
      birthDate: birthDate || undefined,
      breed: breed || undefined,
      color: color || undefined,
      currentWeightLbs: currentWeight ? Number(currentWeight) : undefined,
      scrapieTagNumber: scrapieTag || undefined,
      bcs: bcs ? Number(bcs) : undefined,
      notes: animalNotes || undefined,
      status: editAnimal?.status || "active",
      statusDate: editAnimal?.statusDate,
      statusNotes: editAnimal?.statusNotes,
    };
    if (editAnimal) {
      onSave(animals.map((x) => x.id === editAnimal.id ? a : x));
    } else {
      onSave([...animals, a]);
    }
    setShowForm(false);
    resetForm();
  };

  const markStatus = (id: string, status: Animal["status"]) => {
    const date = new Date().toISOString().split("T")[0];
    onSave(animals.map((a) => a.id === id ? { ...a, status, statusDate: date } : a));
  };

  const deleteAnimal = (id: string) => {
    if (!confirm("Delete this animal record?")) return;
    onSave(animals.filter((a) => a.id !== id));
  };

  const filtered = filter === "All" ? animals : animals.filter((a) => a.status === filter);

  // Flock mode for Avian
  if (group.trackingMode === "flock" || group.category === "Avian") {
    const [showPoultryForm, setShowPoultryForm] = useState(false);
    const [weekStart, setWeekStart] = useState("");
    const [eggs, setEggs] = useState("");
    const [mortality, setMortality] = useState("");
    const [feedLbs, setFeedLbs] = useState("");
    const [avgBW, setAvgBW] = useState("");
    const [pwNotes, setPwNotes] = useState("");

    const savePoultry = () => {
      const rec: PoultryFlockRecord = {
        id: generateId(),
        groupId: group.id,
        weekStartDate: weekStart,
        eggsCollected: eggs ? Number(eggs) : undefined,
        mortalityCount: mortality ? Number(mortality) : undefined,
        feedDeliveredLbs: feedLbs ? Number(feedLbs) : undefined,
        avgBodyWeightLbs: avgBW ? Number(avgBW) : undefined,
        notes: pwNotes || undefined,
      };
      const all: PoultryFlockRecord[] = JSON.parse(localStorage.getItem(POULTRY_KEY) || "[]");
      all.push(rec);
      localStorage.setItem(POULTRY_KEY, JSON.stringify(all));
      setShowPoultryForm(false);
      setWeekStart(""); setEggs(""); setMortality(""); setFeedLbs(""); setAvgBW(""); setPwNotes("");
    };

    const sorted = [...poultryRecords].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#3d2b1f]">Flock Summary</h3>
            <p className="text-sm text-gray-500">{group.totalHeadCount} head — flock tracking</p>
          </div>
          <button onClick={() => setShowPoultryForm(true)} className="btn-rustic text-sm px-4 py-2">+ Log Weekly Record</button>
        </div>

        {showPoultryForm && (
          <div className="card-rustic p-5 border-2 border-[#4a7c3f]/30 space-y-4">
            <h4 className="font-bold text-[#3d2b1f]">Weekly Flock Record</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Week Start Date</label><input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Eggs Collected</label><input type="number" min="0" value={eggs} onChange={(e) => setEggs(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Mortality Count</label><input type="number" min="0" value={mortality} onChange={(e) => setMortality(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Feed Delivered (lbs)</label><input type="number" min="0" step="0.1" value={feedLbs} onChange={(e) => setFeedLbs(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Avg Body Weight (lbs)</label><input type="number" min="0" step="0.1" value={avgBW} onChange={(e) => setAvgBW(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><input type="text" value={pwNotes} onChange={(e) => setPwNotes(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={savePoultry} className="btn-rustic text-sm px-4 py-2">Save Record</button>
              <button onClick={() => setShowPoultryForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="card-rustic p-8 text-center text-gray-500">No weekly records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left pb-2">Week</th><th className="text-right pb-2">Eggs</th><th className="text-right pb-2">Mortality</th><th className="text-right pb-2">Feed (lbs)</th><th className="text-right pb-2">Avg BW</th><th className="text-right pb-2">FCR</th>
              </tr></thead>
              <tbody>{sorted.map((r) => {
                const fcr = r.feedDeliveredLbs && r.avgBodyWeightLbs && r.avgBodyWeightLbs > 0 ? (r.feedDeliveredLbs / (r.avgBodyWeightLbs * group.totalHeadCount)).toFixed(2) : "—";
                return (
                  <tr key={r.id} className="border-b border-[#c8922a]/10">
                    <td className="py-2">{r.weekStartDate}</td>
                    <td className="text-right py-2">{r.eggsCollected ?? "—"}</td>
                    <td className="text-right py-2 text-[#c0392b]">{r.mortalityCount ?? "—"}</td>
                    <td className="text-right py-2">{r.feedDeliveredLbs ?? "—"}</td>
                    <td className="text-right py-2">{r.avgBodyWeightLbs ? `${r.avgBodyWeightLbs} lbs` : "—"}</td>
                    <td className="text-right py-2">{fcr}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["All", "active", "sold", "deceased", "culled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[#4a7c3f] text-white" : "text-[#3d2b1f] hover:bg-amber-50 border border-[#c8922a]/20"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-rustic text-sm px-4 py-2">+ Add Animal</button>
      </div>

      {showForm && (
        <div className="card-rustic p-5 border-2 border-[#4a7c3f]/30 space-y-4">
          <h4 className="font-bold text-[#3d2b1f]">{editAnimal ? "Edit Animal" : "Add Animal"}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Tag # / AIN *</label><input type="text" value={tagNumber} onChange={(e) => setTagNumber(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Name (optional)</label><input type="text" value={animalName} onChange={(e) => setAnimalName(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Subcategory</label><select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]">{group.subcategories.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Sex</label><select value={sex} onChange={(e) => setSex(e.target.value as Animal["sex"])} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="female">Female</option><option value="male">Male</option><option value="castrated">Castrated</option><option value="unknown">Unknown</option></select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Birth Date</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Breed</label><input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Color / Markings</label><input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Current Weight (lbs)</label><input type="number" min="0" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            {(group.category === "Ovine" || group.category === "Caprine") && (
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Scrapie Tag #</label><input type="text" value={scrapieTag} onChange={(e) => setScrapieTag(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            )}
            {group.category === "Bovine" && (
              <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">BCS (1–9)</label><input type="number" min="1" max="9" step="0.5" value={bcs} onChange={(e) => setBcs(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            )}
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><textarea value={animalNotes} onChange={(e) => setAnimalNotes(e.target.value)} rows={2} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f] resize-none" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveAnimal} className="btn-rustic text-sm px-4 py-2">Save Animal</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card-rustic p-8 text-center">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="text-gray-500 text-sm">No animals found. Add your first animal to begin individual tracking.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2">Tag #</th><th className="text-left pb-2">Name</th><th className="text-left pb-2">Type</th><th className="text-left pb-2">Sex</th><th className="text-left pb-2">DOB</th><th className="text-right pb-2">Weight</th><th className="text-left pb-2">Status</th><th className="text-right pb-2">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((a) => (
                <>
                  <tr key={a.id} className="border-b border-[#c8922a]/10 hover:bg-amber-50/50 cursor-pointer" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                    <td className="py-2 font-mono text-xs">{a.tagNumber}</td>
                    <td className="py-2">{a.name || "—"}</td>
                    <td className="py-2">{a.subcategory}</td>
                    <td className="py-2 capitalize">{a.sex}</td>
                    <td className="py-2">{a.birthDate || "—"}</td>
                    <td className="py-2 text-right">{a.currentWeightLbs ? `${a.currentWeightLbs} lbs` : "—"}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "active" ? "bg-green-100 text-[#4a7c3f]" : a.status === "sold" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-[#c0392b]"}`}>{a.status}</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEdit(a)} className="text-xs text-[#c8922a] hover:text-[#3d2b1f] px-1">✏️</button>
                        {a.status === "active" && <button onClick={() => markStatus(a.id, "sold")} className="text-xs text-blue-600 hover:text-blue-800 px-1">Sold</button>}
                        {a.status === "active" && <button onClick={() => markStatus(a.id, "deceased")} className="text-xs text-red-500 hover:text-red-700 px-1">Deceased</button>}
                        <button onClick={() => deleteAnimal(a.id)} className="text-xs text-red-400 hover:text-red-600 px-1">🗑️</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === a.id && (
                    <tr key={`${a.id}-expanded`} className="bg-amber-50/70">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {a.breed && <div><span className="text-gray-500">Breed:</span> <span className="font-medium">{a.breed}</span></div>}
                          {a.color && <div><span className="text-gray-500">Color:</span> <span className="font-medium">{a.color}</span></div>}
                          {a.scrapieTagNumber && <div><span className="text-gray-500">Scrapie Tag:</span> <span className="font-medium">{a.scrapieTagNumber}</span></div>}
                          {a.bcs && <div><span className="text-gray-500">BCS:</span> <span className="font-medium">{a.bcs}</span></div>}
                          {a.statusDate && <div><span className="text-gray-500">Status Date:</span> <span className="font-medium">{a.statusDate}</span></div>}
                          {a.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{a.notes}</span></div>}
                        </div>
                        {/* Weight history */}
                        {weightRecords.filter((w) => w.animalId === a.id).length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-gray-500">Weight History: </span>
                            <span className="text-xs">{weightRecords.filter((w) => w.animalId === a.id).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 5).map((w) => `${w.date}: ${w.weightLbs} lbs`).join(" · ")}</span>
                          </div>
                        )}
                        {/* Health history */}
                        {healthRecords.filter((h) => h.animalIds.includes(a.id)).length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs font-semibold text-gray-500">Health: </span>
                            <span className="text-xs">{healthRecords.filter((h) => h.animalIds.includes(a.id)).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 3).map((h) => `${h.date}: ${h.type}${h.product ? ` (${h.product})` : ""}`).join(" · ")}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Expenses ────────────────────────────────────────────────────────────

function TabExpenses({
  group,
  animals,
  expenses,
  onSave,
  defaultOpen,
}: {
  group: LivestockGroup;
  animals: Animal[];
  expenses: GroupExpense[];
  onSave: (updated: GroupExpense[]) => void;
  defaultOpen?: boolean;
}) {
  const [showForm, setShowForm] = useState(defaultOpen || false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isActual, setIsActual] = useState(true);
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [expNotes, setExpNotes] = useState("");

  const cats = getExpenseCategories(group.category);

  const saveExpense = () => {
    if (!description.trim() || !amount) return;
    const e: GroupExpense = {
      id: generateId(),
      groupId: group.id,
      animalIds: selectedAnimalIds,
      date,
      category: category || cats[0],
      subcategory: subcategory || undefined,
      description: description.trim(),
      amount: Number(amount),
      isActual,
      vendor: vendor || undefined,
      invoiceNumber: invoiceNumber || undefined,
      paymentMethod: paymentMethod || undefined,
      notes: expNotes || undefined,
    };
    onSave([...expenses, e]);
    setShowForm(false);
    setDescription(""); setAmount(""); setVendor(""); setInvoiceNumber(""); setPaymentMethod(""); setSelectedAnimalIds([]); setExpNotes(""); setSubcategory("");
  };

  const deleteExpense = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    onSave(expenses.filter((e) => e.id !== id));
  };

  const actualTotal = expenses.filter((e) => e.isActual).reduce((s, e) => s + e.amount, 0);
  const projTotal = expenses.filter((e) => !e.isActual).reduce((s, e) => s + e.amount, 0);
  const perHead = group.totalHeadCount > 0 ? actualTotal / group.totalHeadCount : 0;
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-[#c0392b] font-semibold">Actual: {fmt(actualTotal)}</span>
          <span className="text-[#c8922a]">Projected: {fmt(projTotal)}</span>
          <span className="text-gray-500">Per Head: {fmt(perHead)}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-rustic text-sm px-4 py-2">+ Log Expense</button>
      </div>

      {showForm && (
        <div className="card-rustic p-5 border-2 border-[#c8922a]/40 space-y-4">
          <h4 className="font-bold text-[#3d2b1f]">Log Expense</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="">Select…</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Description *</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Amount ($) *</label><input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Type</label><select value={isActual ? "actual" : "projected"} onChange={(e) => setIsActual(e.target.value === "actual")} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="actual">Actual</option><option value="projected">Projected/Budgeted</option></select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Vendor</label><input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Invoice #</label><input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Payment Method</label><input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Cash, Check, Card…" className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            {animals.filter((a) => a.status === "active").length > 0 && (
              <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Applies To (leave blank = whole group)</label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-[#c8922a]/30 rounded p-2">
                  {animals.filter((a) => a.status === "active").map((a) => (
                    <button key={a.id} type="button" onClick={() => setSelectedAnimalIds((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])} className={`text-xs px-2 py-1 rounded-full border ${selectedAnimalIds.includes(a.id) ? "bg-[#4a7c3f] text-white border-[#4a7c3f]" : "bg-white text-[#3d2b1f] border-[#c8922a]/40"}`}>{a.name || a.tagNumber}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><textarea value={expNotes} onChange={(e) => setExpNotes(e.target.value)} rows={2} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f] resize-none" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveExpense} className="btn-rustic text-sm px-4 py-2">Save Expense</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card-rustic p-8 text-center text-gray-500 text-sm">No expenses logged yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2">Date</th><th className="text-left pb-2">Category</th><th className="text-left pb-2">Description</th><th className="text-right pb-2">Amount</th><th className="text-left pb-2">Type</th><th className="text-right pb-2">Actions</th>
            </tr></thead>
            <tbody>{sorted.map((e) => (
              <tr key={e.id} className="border-b border-[#c8922a]/10 hover:bg-amber-50/50">
                <td className="py-2">{e.date}</td>
                <td className="py-2">{e.category}</td>
                <td className="py-2">{e.description}{e.vendor ? ` — ${e.vendor}` : ""}</td>
                <td className="py-2 text-right font-semibold text-[#c0392b]">{fmt(e.amount)}</td>
                <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${e.isActual ? "bg-green-100 text-[#4a7c3f]" : "bg-amber-100 text-amber-700"}`}>{e.isActual ? "Actual" : "Projected"}</span></td>
                <td className="py-2 text-right"><button onClick={() => deleteExpense(e.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Sales ───────────────────────────────────────────────────────────────

function TabSales({
  group,
  animals,
  sales,
  onSave,
  onAnimalsUpdate,
  defaultOpen,
}: {
  group: LivestockGroup;
  animals: Animal[];
  sales: SaleRecord[];
  onSave: (updated: SaleRecord[]) => void;
  onAnimalsUpdate: (updated: Animal[]) => void;
  defaultOpen?: boolean;
}) {
  const [showForm, setShowForm] = useState(defaultOpen || false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saleType, setSaleType] = useState("private");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [headCountManual, setHeadCountManual] = useState("");
  const [pricingMode, setPricingMode] = useState("perHead");
  const [priceAmount, setPriceAmount] = useState("");
  const [avgWeight, setAvgWeight] = useState("");
  const [yieldPct, setYieldPct] = useState(group.category === "Bovine" ? "60" : group.category === "Ovine" ? "50" : group.category === "Porcine" ? "72" : "55");
  const [buyer, setBuyer] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [isActual, setIsActual] = useState(true);
  const [saleNotes, setSaleNotes] = useState("");

  const SALE_TYPES = ["auction", "private", "direct", "processor", "ethnic_market", "freezer", "wholesale", "eggs", "wool", "fiber", "hatching_eggs", "other"];
  const PRICING_MODES = [
    { value: "perHead", label: "Per Head" },
    { value: "perCwt", label: "Per Cwt" },
    { value: "perLbLive", label: "Per Lb (Live)" },
    { value: "perLbHanging", label: "Per Lb (Hanging)" },
    { value: "perDozen", label: "Per Dozen" },
    { value: "perLbWool", label: "Per Lb (Fiber/Wool)" },
    { value: "flat", label: "Flat Total" },
  ];

  const calcTotal = (): number => {
    const price = Number(priceAmount);
    const hc = selectedAnimalIds.length > 0 ? selectedAnimalIds.length : (Number(headCountManual) || group.totalHeadCount);
    const weight = Number(avgWeight);
    if (pricingMode === "perHead") return price * hc;
    if (pricingMode === "perCwt") return (price / 100) * weight * hc;
    if (pricingMode === "perLbLive") return price * weight * hc;
    if (pricingMode === "perLbHanging") return price * (weight * (Number(yieldPct) / 100)) * hc;
    if (pricingMode === "perDozen") return price * Math.floor(hc / 12);
    if (pricingMode === "perLbWool") return price * weight * hc;
    if (pricingMode === "flat") return price;
    return 0;
  };

  const saveSale = () => {
    if (!priceAmount) return;
    const hc = selectedAnimalIds.length > 0 ? selectedAnimalIds.length : (Number(headCountManual) || group.totalHeadCount);
    const sale: SaleRecord = {
      id: generateId(),
      groupId: group.id,
      animalIds: selectedAnimalIds,
      date,
      saleType,
      buyer: buyer || undefined,
      buyerContact: buyerContact || undefined,
      marketLocation: marketLocation || undefined,
      headCount: hc,
      pricingMode,
      priceAmount: Number(priceAmount),
      avgWeightLbs: avgWeight ? Number(avgWeight) : undefined,
      yieldPct: yieldPct ? Number(yieldPct) : undefined,
      totalAmount: calcTotal(),
      isActual,
      notes: saleNotes || undefined,
    };
    onSave([...sales, sale]);

    // Mark selected animals as sold
    if (selectedAnimalIds.length > 0) {
      const statusDate = date;
      onAnimalsUpdate(animals.map((a) => selectedAnimalIds.includes(a.id) ? { ...a, status: "sold" as const, statusDate } : a));
    }

    setShowForm(false);
    setPriceAmount(""); setAvgWeight(""); setBuyer(""); setBuyerContact(""); setMarketLocation(""); setSelectedAnimalIds([]); setSaleNotes(""); setHeadCountManual("");
  };

  const deleteSale = (id: string) => {
    if (!confirm("Delete this sale record?")) return;
    onSave(sales.filter((s) => s.id !== id));
  };

  const actualTotal = sales.filter((s) => s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const projTotal = sales.filter((s) => !s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const sorted = [...sales].sort((a, b) => b.date.localeCompare(a.date));
  const needsWeight = ["perCwt", "perLbLive", "perLbHanging", "perLbWool"].includes(pricingMode);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-[#4a7c3f] font-semibold">Actual: {fmt(actualTotal)}</span>
          <span className="text-[#c8922a]">Projected: {fmt(projTotal)}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-rustic text-sm px-4 py-2">+ Record Sale</button>
      </div>

      {showForm && (
        <div className="card-rustic p-5 border-2 border-[#4a7c3f]/40 space-y-4">
          <h4 className="font-bold text-[#3d2b1f]">Record Sale</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Sale Type</label><select value={saleType} onChange={(e) => setSaleType(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]">{SALE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Pricing Mode</label><select value={pricingMode} onChange={(e) => setPricingMode(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]">{PRICING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Price Amount ($)</label><input type="number" min="0" step="0.01" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            {needsWeight && <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Avg Weight (lbs/head)</label><input type="number" min="0" step="0.1" value={avgWeight} onChange={(e) => setAvgWeight(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>}
            {pricingMode === "perLbHanging" && <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Yield %</label><input type="number" min="0" max="100" value={yieldPct} onChange={(e) => setYieldPct(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>}
            {selectedAnimalIds.length === 0 && <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Head Count (if not selecting individuals)</label><input type="number" min="1" value={headCountManual} onChange={(e) => setHeadCountManual(e.target.value)} placeholder={`Default: ${group.totalHeadCount}`} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>}
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Buyer</label><input type="text" value={buyer} onChange={(e) => setBuyer(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Buyer Contact</label><input type="text" value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Market / Location</label><input type="text" value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Type</label><select value={isActual ? "actual" : "projected"} onChange={(e) => setIsActual(e.target.value === "actual")} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="actual">Actual</option><option value="projected">Projected/Expected</option></select></div>
            {animals.filter((a) => a.status === "active").length > 0 && (
              <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Select Specific Animals (optional)</label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-[#c8922a]/30 rounded p-2">
                  {animals.filter((a) => a.status === "active").map((a) => (
                    <button key={a.id} type="button" onClick={() => setSelectedAnimalIds((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])} className={`text-xs px-2 py-1 rounded-full border ${selectedAnimalIds.includes(a.id) ? "bg-[#4a7c3f] text-white border-[#4a7c3f]" : "bg-white text-[#3d2b1f] border-[#c8922a]/40"}`}>{a.name || a.tagNumber}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} rows={2} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f] resize-none" /></div>
          </div>
          {priceAmount && (
            <div className="bg-[#4a7c3f]/10 border border-[#4a7c3f]/30 rounded-lg px-4 py-2 text-sm font-bold text-[#4a7c3f]">
              Calculated Total: {fmt(calcTotal())}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={saveSale} className="btn-rustic text-sm px-4 py-2">Save Sale</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card-rustic p-8 text-center text-gray-500 text-sm">No sales recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2">Date</th><th className="text-left pb-2">Type</th><th className="text-right pb-2">Head</th><th className="text-left pb-2">Pricing</th><th className="text-right pb-2">Total</th><th className="text-left pb-2">Buyer</th><th className="text-left pb-2">Status</th><th className="text-right pb-2">Actions</th>
            </tr></thead>
            <tbody>{sorted.map((s) => (
              <tr key={s.id} className="border-b border-[#c8922a]/10 hover:bg-amber-50/50">
                <td className="py-2">{s.date}</td>
                <td className="py-2 capitalize">{s.saleType.replace(/_/g, " ")}</td>
                <td className="py-2 text-right">{s.headCount}</td>
                <td className="py-2">{PRICING_MODES.find((m) => m.value === s.pricingMode)?.label || s.pricingMode} @ ${s.priceAmount}</td>
                <td className="py-2 text-right font-semibold text-[#4a7c3f]">{fmt(s.totalAmount)}</td>
                <td className="py-2">{s.buyer || "—"}</td>
                <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.isActual ? "bg-green-100 text-[#4a7c3f]" : "bg-amber-100 text-amber-700"}`}>{s.isActual ? "Actual" : "Projected"}</span></td>
                <td className="py-2 text-right"><button onClick={() => deleteSale(s.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Health ──────────────────────────────────────────────────────────────

function TabHealth({
  group,
  animals,
  healthRecords,
  expenses,
  onSave,
  onExpenseSave,
  defaultOpen,
}: {
  group: LivestockGroup;
  animals: Animal[];
  healthRecords: HealthRecord[];
  expenses: GroupExpense[];
  onSave: (updated: HealthRecord[]) => void;
  onExpenseSave: (updated: GroupExpense[]) => void;
  defaultOpen?: boolean;
}) {
  const [showForm, setShowForm] = useState(defaultOpen || false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<HealthRecord["type"]>("vaccination");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [product, setProduct] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [dosage, setDosage] = useState("");
  const [route, setRoute] = useState("");
  const [administeredBy, setAdministeredBy] = useState("");
  const [withdrawalMeatDays, setWithdrawalMeatDays] = useState("");
  const [withdrawalMilkDays, setWithdrawalMilkDays] = useState("");
  const [vetName, setVetName] = useState("");
  const [cost, setCost] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [healthNotes, setHealthNotes] = useState("");

  const DAIRY_SPECIES = ["Caprine", "Bovine"];
  const showMilk = DAIRY_SPECIES.includes(group.category);

  const saveHealth = () => {
    const wdMeat = withdrawalMeatDays ? addDays(date, Number(withdrawalMeatDays)) : undefined;
    const wdMilk = withdrawalMilkDays ? addDays(date, Number(withdrawalMilkDays)) : undefined;
    const rec: HealthRecord = {
      id: generateId(),
      groupId: group.id,
      animalIds: selectedAnimalIds,
      date,
      type,
      diagnosis: diagnosis || undefined,
      product: product || undefined,
      lotNumber: lotNumber || undefined,
      dosage: dosage || undefined,
      route: route || undefined,
      administeredBy: administeredBy || undefined,
      withdrawalDateMeat: wdMeat,
      withdrawalDateMilk: wdMilk,
      vetName: vetName || undefined,
      cost: cost ? Number(cost) : undefined,
      nextDueDate: nextDueDate || undefined,
      notes: healthNotes || undefined,
    };
    onSave([...healthRecords, rec]);

    // Auto-add expense if cost provided
    if (cost && Number(cost) > 0) {
      const e: GroupExpense = {
        id: generateId(),
        groupId: group.id,
        animalIds: selectedAnimalIds,
        date,
        category: "Veterinary",
        description: `${type}${product ? ` — ${product}` : ""}`,
        amount: Number(cost),
        isActual: true,
      };
      onExpenseSave([...expenses, e]);
    }

    setShowForm(false);
    setDiagnosis(""); setProduct(""); setLotNumber(""); setDosage(""); setRoute(""); setAdministeredBy(""); setWithdrawalMeatDays(""); setWithdrawalMilkDays(""); setVetName(""); setCost(""); setNextDueDate(""); setHealthNotes(""); setSelectedAnimalIds([]);
  };

  const deleteRecord = (id: string) => {
    if (!confirm("Delete this health record?")) return;
    onSave(healthRecords.filter((r) => r.id !== id));
  };

  const sorted = [...healthRecords].sort((a, b) => b.date.localeCompare(a.date));
  const HEALTH_TYPES: HealthRecord["type"][] = ["vaccination", "deworming", "treatment", "checkup", "injury", "illness", "death", "surgery", "other"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{sorted.length} health event{sorted.length !== 1 ? "s" : ""} recorded</div>
        <button onClick={() => setShowForm(true)} className="btn-rustic text-sm px-4 py-2">+ Add Health Event</button>
      </div>

      {showForm && (
        <div className="card-rustic p-5 border-2 border-[#c8922a]/40 space-y-4">
          <h4 className="font-bold text-[#3d2b1f]">Add Health Event</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Event Type</label><select value={type} onChange={(e) => setType(e.target.value as HealthRecord["type"])} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]">{HEALTH_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Diagnosis / Reason</label><input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Product / Drug Name</label><input type="text" value={product} onChange={(e) => setProduct(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Lot Number</label><input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Dosage</label><input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 2ml" className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Route</label><select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="">—</option><option value="SQ">SQ (Subcutaneous)</option><option value="IM">IM (Intramuscular)</option><option value="oral">Oral</option><option value="topical">Topical</option><option value="IV">IV</option></select></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Administered By</label><input type="text" value={administeredBy} onChange={(e) => setAdministeredBy(e.target.value)} placeholder="Self / Vet name" className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Withdrawal — Meat (days)</label><input type="number" min="0" value={withdrawalMeatDays} onChange={(e) => setWithdrawalMeatDays(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" />{withdrawalMeatDays && <p className="text-xs text-[#c0392b] mt-0.5">Clears: {addDays(date, Number(withdrawalMeatDays))}</p>}</div>
            {showMilk && <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Withdrawal — Milk (days)</label><input type="number" min="0" value={withdrawalMilkDays} onChange={(e) => setWithdrawalMilkDays(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" />{withdrawalMilkDays && <p className="text-xs text-[#c0392b] mt-0.5">Clears: {addDays(date, Number(withdrawalMilkDays))}</p>}</div>}
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Vet Name</label><input type="text" value={vetName} onChange={(e) => setVetName(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Cost ($) — auto-adds to expenses</label><input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Next Due Date</label><input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            {animals.filter((a) => a.status === "active").length > 0 && (
              <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Applies To (leave blank = whole group)</label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-[#c8922a]/30 rounded p-2">
                  {animals.filter((a) => a.status === "active").map((a) => (
                    <button key={a.id} type="button" onClick={() => setSelectedAnimalIds((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])} className={`text-xs px-2 py-1 rounded-full border ${selectedAnimalIds.includes(a.id) ? "bg-[#4a7c3f] text-white border-[#4a7c3f]" : "bg-white text-[#3d2b1f] border-[#c8922a]/40"}`}>{a.name || a.tagNumber}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><textarea value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} rows={2} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f] resize-none" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveHealth} className="btn-rustic text-sm px-4 py-2">Save Health Event</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card-rustic p-8 text-center text-gray-500 text-sm">No health records yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2">Date</th><th className="text-left pb-2">Type</th><th className="text-left pb-2">Product</th><th className="text-left pb-2">Animals</th><th className="text-left pb-2">Withdrawal</th><th className="text-right pb-2">Cost</th><th className="text-right pb-2">Actions</th>
            </tr></thead>
            <tbody>{sorted.map((r) => {
              const today = new Date().toISOString().split("T")[0];
              const hasActive = (r.withdrawalDateMeat && r.withdrawalDateMeat >= today) || (r.withdrawalDateMilk && r.withdrawalDateMilk >= today);
              return (
                <tr key={r.id} className={`border-b border-[#c8922a]/10 hover:bg-amber-50/50 ${hasActive ? "bg-red-50" : ""}`}>
                  <td className="py-2">{r.date}</td>
                  <td className="py-2 capitalize">{r.type}</td>
                  <td className="py-2">{r.product || "—"}{r.dosage ? ` ${r.dosage}` : ""}{r.route ? ` (${r.route})` : ""}</td>
                  <td className="py-2">{r.animalIds.length === 0 ? "Whole Group" : r.animalIds.map((id) => { const a = animals.find((x) => x.id === id); return a ? (a.name || a.tagNumber) : id; }).join(", ")}</td>
                  <td className="py-2">{hasActive ? <span className="text-[#c0392b] font-semibold text-xs">⚠️ Active</span> : r.withdrawalDateMeat ? <span className="text-gray-400 text-xs">Cleared {r.withdrawalDateMeat}</span> : "—"}</td>
                  <td className="py-2 text-right">{r.cost ? fmt(r.cost) : "—"}</td>
                  <td className="py-2 text-right"><button onClick={() => deleteRecord(r.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Performance ─────────────────────────────────────────────────────────

function TabPerformance({
  group,
  animals,
  weightRecords,
  poultryRecords,
  onWeightSave,
}: {
  group: LivestockGroup;
  animals: Animal[];
  weightRecords: WeightRecord[];
  poultryRecords: PoultryFlockRecord[];
  onWeightSave: (updated: WeightRecord[]) => void;
}) {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [wDate, setWDate] = useState(new Date().toISOString().split("T")[0]);
  const [wAnimalId, setWAnimalId] = useState("");
  const [wWeight, setWWeight] = useState("");
  const [wNotes, setWNotes] = useState("");

  const saveWeight = () => {
    if (!wWeight) return;
    const rec: WeightRecord = {
      id: generateId(),
      groupId: group.id,
      animalId: wAnimalId || undefined,
      date: wDate,
      weightLbs: Number(wWeight),
      notes: wNotes || undefined,
    };
    onWeightSave([...weightRecords, rec]);
    setShowWeightForm(false);
    setWWeight(""); setWNotes(""); setWAnimalId("");
  };

  const deleteWeight = (id: string) => {
    onWeightSave(weightRecords.filter((w) => w.id !== id));
  };

  // Build chart data
  const activeAnimals = animals.filter((a) => a.status === "active");
  const groupAvgData: { date: string; weight: number }[] = [];
  const byAnimalData: Record<string, { date: string; weight: number }[]> = {};

  weightRecords.sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => {
    if (!w.animalId) {
      groupAvgData.push({ date: w.date, weight: w.weightLbs });
    } else {
      if (!byAnimalData[w.animalId]) byAnimalData[w.animalId] = [];
      byAnimalData[w.animalId].push({ date: w.date, weight: w.weightLbs });
    }
  });

  // ADG
  const calcADG = (records: { date: string; weight: number }[]): string => {
    if (records.length < 2) return "—";
    const first = records[0];
    const last = records[records.length - 1];
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
    if (days === 0) return "—";
    return ((last.weight - first.weight) / days).toFixed(2);
  };

  // Poultry production chart
  const poultryChartData = [...poultryRecords]
    .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
    .map((r) => ({
      week: r.weekStartDate,
      eggs: r.eggsCollected ?? 0,
      mortality: r.mortalityCount ?? 0,
      feed: r.feedDeliveredLbs ?? 0,
    }));

  const colors = ["#4a7c3f", "#c8922a", "#c0392b", "#3d2b1f", "#7c5c3e", "#5f9652"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#3d2b1f]">Performance Tracking</h3>
        <button onClick={() => setShowWeightForm(true)} className="btn-rustic text-sm px-4 py-2">⚖️ Log Weight</button>
      </div>

      {showWeightForm && (
        <div className="card-rustic p-5 border-2 border-[#c8922a]/40 space-y-4">
          <h4 className="font-bold text-[#3d2b1f]">Log Weight</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Date</label><input type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            <div><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Weight (lbs)</label><input type="number" min="0" step="0.1" value={wWeight} onChange={(e) => setWWeight(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
            {activeAnimals.length > 0 && (
              <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Animal (blank = flock average)</label><select value={wAnimalId} onChange={(e) => setWAnimalId(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"><option value="">Flock Average</option>{activeAnimals.map((a) => <option key={a.id} value={a.id}>{a.name || a.tagNumber}</option>)}</select></div>
            )}
            <div className="col-span-2"><label className="block text-xs font-semibold text-[#3d2b1f] mb-1">Notes</label><input type="text" value={wNotes} onChange={(e) => setWNotes(e.target.value)} className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveWeight} className="btn-rustic text-sm px-4 py-2">Save</button>
            <button onClick={() => setShowWeightForm(false)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Weight Chart */}
      {weightRecords.length > 0 && (
        <div className="card-rustic p-5">
          <h4 className="font-bold text-[#3d2b1f] mb-3">Weight History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#c8922a20" />
              <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" lbs" />
              <Tooltip formatter={(v) => [`${v} lbs`, ""]} />
              <Legend />
              {groupAvgData.length > 0 && (
                <Line data={groupAvgData} dataKey="weight" name="Group Avg" stroke="#4a7c3f" strokeWidth={2} dot={{ r: 3 }} />
              )}
              {Object.entries(byAnimalData).map(([animalId, data], i) => {
                const a = animals.find((x) => x.id === animalId);
                return (
                  <Line key={animalId} data={data} dataKey="weight" name={a?.name || a?.tagNumber || animalId} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-sm text-gray-500">
            ADG (Group Avg): <span className="font-semibold text-[#3d2b1f]">{calcADG(groupAvgData)} lbs/day</span>
          </div>
        </div>
      )}

      {/* Poultry Chart */}
      {group.category === "Avian" && poultryChartData.length > 0 && (
        <div className="card-rustic p-5">
          <h4 className="font-bold text-[#3d2b1f] mb-3">Production Chart</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={poultryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c8922a20" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="eggs" name="Eggs" fill="#4a7c3f" />
              <Bar dataKey="mortality" name="Mortality" fill="#c0392b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight Records Table */}
      {weightRecords.length > 0 && (
        <div className="card-rustic p-5">
          <h4 className="font-bold text-[#3d2b1f] mb-3">Weight Log</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#c8922a]/20 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left pb-2">Date</th><th className="text-left pb-2">Animal</th><th className="text-right pb-2">Weight</th><th className="text-left pb-2">Notes</th><th className="text-right pb-2">Del</th>
            </tr></thead>
            <tbody>{[...weightRecords].sort((a, b) => b.date.localeCompare(a.date)).map((w) => {
              const a = w.animalId ? animals.find((x) => x.id === w.animalId) : null;
              return (
                <tr key={w.id} className="border-b border-[#c8922a]/10">
                  <td className="py-2">{w.date}</td>
                  <td className="py-2">{a ? (a.name || a.tagNumber) : "Flock Avg"}</td>
                  <td className="py-2 text-right font-semibold">{w.weightLbs} lbs</td>
                  <td className="py-2 text-gray-500">{w.notes || "—"}</td>
                  <td className="py-2 text-right"><button onClick={() => deleteWeight(w.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {weightRecords.length === 0 && poultryRecords.length === 0 && (
        <div className="card-rustic p-8 text-center text-gray-500 text-sm">No performance data yet. Log a weight to get started.</div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = "overview" | "animals" | "expenses" | "sales" | "health" | "performance";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.groupId as string;

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<LivestockGroup | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [poultryRecords, setPoultryRecords] = useState<PoultryFlockRecord[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);

  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "overview");

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") { router.replace("/admin"); return; }

    const groups: LivestockGroup[] = JSON.parse(localStorage.getItem(LIVESTOCK_KEY) || "[]");
    const found = groups.find((g) => g.id === groupId);
    if (!found) { router.replace("/admin/business/livestock"); return; }
    setGroup(found);

    const allAnimals: Animal[] = JSON.parse(localStorage.getItem(ANIMALS_KEY) || "[]");
    setAnimals(allAnimals.filter((a) => a.groupId === groupId));

    const allWeights: WeightRecord[] = JSON.parse(localStorage.getItem(WEIGHT_KEY) || "[]");
    setWeightRecords(allWeights.filter((w) => w.groupId === groupId));

    const allHealth: HealthRecord[] = JSON.parse(localStorage.getItem(HEALTH_KEY) || "[]");
    setHealthRecords(allHealth.filter((h) => h.groupId === groupId));

    const allExpenses: GroupExpense[] = JSON.parse(localStorage.getItem(EXPENSES_KEY) || "[]");
    setExpenses(allExpenses.filter((e) => e.groupId === groupId));

    const allSales: SaleRecord[] = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    setSales(allSales.filter((s) => s.groupId === groupId));

    const allPoultry: PoultryFlockRecord[] = JSON.parse(localStorage.getItem(POULTRY_KEY) || "[]");
    setPoultryRecords(allPoultry.filter((p) => p.groupId === groupId));

    const allBreeding: BreedingRecord[] = JSON.parse(localStorage.getItem(BREEDING_KEY) || "[]");
    setBreedingRecords(allBreeding.filter((b) => b.groupId === groupId));

    setLoading(false);
  }, [router, groupId]);

  const saveAnimals = useCallback((updated: Animal[]) => {
    setAnimals(updated);
    const all: Animal[] = JSON.parse(localStorage.getItem(ANIMALS_KEY) || "[]");
    const others = all.filter((a) => a.groupId !== groupId);
    localStorage.setItem(ANIMALS_KEY, JSON.stringify([...others, ...updated]));
  }, [groupId]);

  const saveWeights = useCallback((updated: WeightRecord[]) => {
    setWeightRecords(updated);
    const all: WeightRecord[] = JSON.parse(localStorage.getItem(WEIGHT_KEY) || "[]");
    const others = all.filter((w) => w.groupId !== groupId);
    localStorage.setItem(WEIGHT_KEY, JSON.stringify([...others, ...updated]));
  }, [groupId]);

  const saveHealth = useCallback((updated: HealthRecord[]) => {
    setHealthRecords(updated);
    const all: HealthRecord[] = JSON.parse(localStorage.getItem(HEALTH_KEY) || "[]");
    const others = all.filter((h) => h.groupId !== groupId);
    localStorage.setItem(HEALTH_KEY, JSON.stringify([...others, ...updated]));
  }, [groupId]);

  const saveExpenses = useCallback((updated: GroupExpense[]) => {
    setExpenses(updated);
    const all: GroupExpense[] = JSON.parse(localStorage.getItem(EXPENSES_KEY) || "[]");
    const others = all.filter((e) => e.groupId !== groupId);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify([...others, ...updated]));
  }, [groupId]);

  const saveSales = useCallback((updated: SaleRecord[]) => {
    setSales(updated);
    const all: SaleRecord[] = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    const others = all.filter((s) => s.groupId !== groupId);
    localStorage.setItem(SALES_KEY, JSON.stringify([...others, ...updated]));
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-farm-cream-dark)] flex items-center justify-center">
        <p className="text-[var(--color-farm-brown)]" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>Loading…</p>
      </div>
    );
  }

  if (!group) return null;

  const totalExpenses = expenses.filter((e) => e.isActual).reduce((s, e) => s + e.amount, 0);
  const totalIncome = sales.filter((s) => s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const netPnL = totalIncome - totalExpenses - group.totalValue;

  const activeCount = animals.filter((a) => a.status === "active").length;
  const soldCount = animals.filter((a) => a.status === "sold").length;
  const deceasedCount = animals.filter((a) => a.status === "deceased").length;
  const showIndividualHeadBreakdown = group.trackingMode === "individual" && animals.length > 0;

  const statusLabel = group.status === "sold" ? "Sold Out" : group.status === "partial" ? "Partially Sold" : "Active";
  const statusColor = group.status === "sold" ? "bg-gray-200 text-gray-600" : group.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-[#4a7c3f]";

  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    ...(group.trackingMode === "individual" || group.category !== "Avian" ? [{ id: "animals" as TabId, label: group.category === "Avian" ? "Flock Records" : "Animals" }] : [{ id: "animals" as TabId, label: "Flock Records" }]),
    { id: "expenses", label: "Expenses" },
    { id: "sales", label: "Sales & Income" },
    { id: "health", label: "Health Records" },
    { id: "performance", label: "Performance" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-farm-cream-dark)]">
      {/* Header */}
      <header className="wood-texture shadow" style={{ backgroundColor: "var(--color-farm-brown)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/admin/business/livestock" className="text-[var(--color-farm-tan-light)] hover:text-[var(--color-farm-gold)] text-sm transition-colors">← Back</Link>
              <span className="text-[var(--color-farm-tan-light)]/40">/</span>
              <span className="text-xl">{group.categoryEmoji}</span>
              <span className="text-[var(--color-farm-cream)] font-bold text-sm" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{group.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/business" className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest">Business</Link>
              <Link href="/admin/dashboard" className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest">Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Group Header */}
        <div className="card-rustic p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{group.categoryEmoji}</span>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{group.name}</h1>
                  <span className="bg-[#4a7c3f]/15 text-[#4a7c3f] text-xs font-semibold px-2 py-0.5 rounded-full">{group.category}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {showIndividualHeadBreakdown ? (
                    <span>
                      {activeCount} Active{soldCount > 0 ? ` · ${soldCount} Sold` : ""}{deceasedCount > 0 ? ` · ${deceasedCount} Deceased` : ""}
                    </span>
                  ) : (
                    <span>{group.totalHeadCount} head</span>
                  )}
                  {group.acquisitionDate && <span className="ml-2 text-gray-400">· Acquired {group.acquisitionDate}</span>}
                  {group.acquisitionSource && <span className="ml-2 text-gray-400">from {group.acquisitionSource}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-amber-50 rounded-lg px-3 py-2">
                <div className="text-sm font-bold text-[#c0392b]">{fmt(totalExpenses + group.totalValue)}</div>
                <div className="text-xs text-gray-500">Total Invested</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-3 py-2">
                <div className="text-sm font-bold text-[#4a7c3f]">{fmt(totalIncome)}</div>
                <div className="text-xs text-gray-500">Total Income</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-3 py-2">
                <div className={`text-sm font-bold ${netPnL >= 0 ? "text-[#4a7c3f]" : "text-[#c0392b]"}`}>{fmt(netPnL)}</div>
                <div className="text-xs text-gray-500">Net P&amp;L</div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Banner */}
        <WithdrawalBanner healthRecords={healthRecords} animals={animals} />

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-6 bg-white border border-[#c8922a]/20 rounded-xl p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[#4a7c3f] text-white shadow-sm" : "text-[#3d2b1f] hover:bg-amber-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <TabOverview
            group={group}
            animals={animals}
            expenses={expenses}
            sales={sales}
            healthRecords={healthRecords}
            weightRecords={weightRecords}
            poultryRecords={poultryRecords}
            onLogExpense={() => setActiveTab("expenses")}
            onRecordSale={() => setActiveTab("sales")}
            onAddHealth={() => setActiveTab("health")}
            onLogWeight={() => setActiveTab("performance")}
          />
        )}
        {activeTab === "animals" && (
          <TabAnimals
            group={group}
            animals={animals}
            weightRecords={weightRecords}
            healthRecords={healthRecords}
            poultryRecords={poultryRecords}
            onSave={saveAnimals}
          />
        )}
        {activeTab === "expenses" && (
          <TabExpenses
            group={group}
            animals={animals}
            expenses={expenses}
            onSave={saveExpenses}
            defaultOpen={tabParam === "expenses"}
          />
        )}
        {activeTab === "sales" && (
          <TabSales
            group={group}
            animals={animals}
            sales={sales}
            onSave={saveSales}
            onAnimalsUpdate={saveAnimals}
            defaultOpen={tabParam === "sales"}
          />
        )}
        {activeTab === "health" && (
          <TabHealth
            group={group}
            animals={animals}
            healthRecords={healthRecords}
            expenses={expenses}
            onSave={saveHealth}
            onExpenseSave={saveExpenses}
            defaultOpen={tabParam === "health"}
          />
        )}
        {activeTab === "performance" && (
          <TabPerformance
            group={group}
            animals={animals}
            weightRecords={weightRecords}
            poultryRecords={poultryRecords}
            onWeightSave={saveWeights}
          />
        )}
      </div>
    </div>
  );
}
