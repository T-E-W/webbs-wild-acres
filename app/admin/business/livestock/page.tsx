"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_KEY = "wwa_admin_token";
const LIVESTOCK_KEY = "wwa_livestock_groups";
const EXPENSES_KEY = "wwa_group_expenses";
const SALES_KEY = "wwa_sale_records";

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
  pricingMode: "simple" | "byClass" | "liveWeight" | "hangingWeight" | "custom";
  priceLines: PriceLine[];
  totalHeadCount: number;
  totalValue: number;
  avgPricePerHead: number;
  status?: "active" | "sold" | "partial" | "closed";
  trackingMode?: "individual" | "flock";
  createdAt: string;
  updatedAt: string;
}

interface GroupExpense {
  id: string;
  groupId: string;
  amount: number;
  isActual: boolean;
}

interface SaleRecord {
  id: string;
  groupId: string;
  totalAmount: number;
  isActual: boolean;
}

type FilterTab = "All" | "Ovine" | "Bovine" | "Avian" | "Caprine" | "Porcine" | "Equine" | "Lagomorph";

// ─── Species Data ─────────────────────────────────────────────────────────────

const SPECIES = [
  { category: "Ovine", label: "Ovine (Sheep)", emoji: "🐑" },
  { category: "Bovine", label: "Bovine (Cattle)", emoji: "🐄" },
  { category: "Avian", label: "Avian (Poultry)", emoji: "🐔" },
  { category: "Caprine", label: "Caprine (Goats)", emoji: "🐐" },
  { category: "Porcine", label: "Porcine (Swine)", emoji: "🐖" },
  { category: "Equine", label: "Equine (Horses)", emoji: "🐎" },
  { category: "Lagomorph", label: "Lagomorph (Rabbits)", emoji: "🐇" },
  { category: "Cervid", label: "Cervid (Deer)", emoji: "🦌" },
  { category: "Other", label: "Other", emoji: "➕" },
];

const SUBCATEGORIES: Record<string, string[]> = {
  Ovine: ["Ewes", "Rams", "Lambs", "Wethers", "Yearlings"],
  Bovine: ["Cows", "Bulls", "Steers", "Heifers", "Calves", "Yearlings"],
  Avian: ["Laying Hens", "Broilers", "Meat Birds", "Turkeys", "Ducks", "Geese", "Guineas", "Roosters", "Pullets", "Chicks"],
  Caprine: ["Does", "Bucks", "Kids", "Wethers", "Yearlings"],
  Porcine: ["Sows", "Boars", "Gilts", "Weaners", "Feeder Pigs", "Shoats"],
  Equine: ["Mares", "Stallions", "Geldings", "Foals", "Yearlings", "Ponies"],
  Lagomorph: ["Does", "Bucks", "Kits", "Grow-outs"],
  Cervid: ["Does", "Bucks", "Fawns"],
  Other: [],
};

const PURPOSES = [
  "Meat",
  "Breeding",
  "Egg Production",
  "Dairy",
  "Fiber/Wool",
  "Show",
  "Pet/Companion",
  "Other",
];

const FILTER_TABS: FilterTab[] = ["All", "Ovine", "Bovine", "Avian", "Caprine", "Porcine", "Equine", "Lagomorph"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function generateId(): string {
  return `lg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function autoGroupName(category: string): string {
  const year = new Date().getFullYear();
  const season = (() => {
    const m = new Date().getMonth();
    if (m < 3) return "Winter";
    if (m < 6) return "Spring";
    if (m < 9) return "Summer";
    return "Fall";
  })();
  return `${season} ${category} ${year}`;
}

function calcSubtotal(line: PriceLine, mode: string): number {
  if (mode === "simple" || mode === "byClass") {
    return (line.pricePerHead ?? 0) * line.quantity;
  }
  if (mode === "liveWeight") {
    return (line.pricePerLb ?? 0) * (line.avgWeightLbs ?? 0) * line.quantity;
  }
  if (mode === "hangingWeight") {
    const hangingLbs = (line.avgWeightLbs ?? 0) * ((line.yieldPct ?? 60) / 100);
    return (line.pricePerLb ?? 0) * hangingLbs * line.quantity;
  }
  if (mode === "custom") {
    return (line.pricePerHead ?? 0) * line.quantity;
  }
  return 0;
}

// ─── Step Components ──────────────────────────────────────────────────────────

interface Step1Props {
  selectedCategory: string;
  selectedSubcategories: string[];
  customCategory: string;
  onSelectCategory: (cat: string) => void;
  onToggleSubcategory: (sub: string) => void;
  onCustomCategory: (val: string) => void;
}

function Step1SpeciesType({
  selectedCategory,
  selectedSubcategories,
  customCategory,
  onSelectCategory,
  onToggleSubcategory,
  onCustomCategory,
}: Step1Props) {
  const subs = selectedCategory === "Other" ? [] : (SUBCATEGORIES[selectedCategory] ?? []);

  return (
    <div>
      <h3 className="text-lg font-bold text-[#3d2b1f] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
        Select Species
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SPECIES.map((s) => (
          <button
            key={s.category}
            type="button"
            onClick={() => onSelectCategory(s.category)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedCategory === s.category
                ? "border-[#4a7c3f] bg-[#4a7c3f]/10 shadow-md"
                : "border-[#c8922a]/30 bg-white hover:border-[#c8922a] hover:bg-amber-50"
            }`}
          >
            <span className="text-3xl mb-1">{s.emoji}</span>
            <span
              className={`text-xs font-semibold text-center leading-tight ${
                selectedCategory === s.category ? "text-[#4a7c3f]" : "text-[#3d2b1f]"
              }`}
              style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {selectedCategory === "Other" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3d2b1f] mb-1" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>
            Custom Species Name
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => onCustomCategory(e.target.value)}
            placeholder="e.g. Bison, Llama, Alpaca..."
            className="w-full border border-[#c8922a]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
          />
        </div>
      )}

      {selectedCategory && selectedCategory !== "Other" && subs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#3d2b1f] mb-2" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>
            Subcategories (select all that apply)
          </h4>
          <div className="flex flex-wrap gap-2">
            {subs.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onToggleSubcategory(sub)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedSubcategories.includes(sub)
                    ? "bg-[#4a7c3f] text-white border-[#4a7c3f]"
                    : "bg-white text-[#3d2b1f] border-[#c8922a]/40 hover:border-[#c8922a]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
          {selectedSubcategories.length === 0 && (
            <p className="text-xs text-amber-600 mt-2">Select at least one subcategory.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface Step2Props {
  groupName: string;
  purpose: string[];
  acquisitionDate: string;
  acquisitionSource: string;
  notes: string;
  onChange: (field: string, value: string | string[]) => void;
}

function Step2GroupDetails({ groupName, purpose, acquisitionDate, acquisitionSource, notes, onChange }: Step2Props) {
  const togglePurpose = (p: string) => {
    if (purpose.includes(p)) {
      onChange("purpose", purpose.filter((x) => x !== p));
    } else {
      onChange("purpose", [...purpose, p]);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
        Group Details
      </h3>

      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => onChange("groupName", e.target.value)}
          placeholder="e.g. Spring Lambs 2026"
          className="w-full border border-[#c8922a]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-2">Purpose (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePurpose(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                purpose.includes(p)
                  ? "bg-[#c8922a] text-white border-[#c8922a]"
                  : "bg-white text-[#3d2b1f] border-[#c8922a]/40 hover:border-[#c8922a]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">Acquisition Date</label>
          <input
            type="date"
            value={acquisitionDate}
            onChange={(e) => onChange("acquisitionDate", e.target.value)}
            className="w-full border border-[#c8922a]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">Acquisition Source</label>
          <input
            type="text"
            value={acquisitionSource}
            onChange={(e) => onChange("acquisitionSource", e.target.value)}
            placeholder="Farm name, auction, private sale..."
            className="w-full border border-[#c8922a]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          placeholder="Any additional notes about this group..."
          className="w-full border border-[#c8922a]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f] resize-none"
        />
      </div>
    </div>
  );
}

interface Step3Props {
  subcategories: string[];
  pricingMode: "simple" | "byClass" | "liveWeight" | "hangingWeight" | "custom";
  priceLines: PriceLine[];
  onPricingModeChange: (mode: "simple" | "byClass" | "liveWeight" | "hangingWeight" | "custom") => void;
  onPriceLineChange: (index: number, field: keyof PriceLine, value: string | number) => void;
  onAddCustomLine: () => void;
  onRemoveCustomLine: (index: number) => void;
}

function Step3HeadCountPricing({
  subcategories,
  pricingMode,
  priceLines,
  onPricingModeChange,
  onPriceLineChange,
  onAddCustomLine,
  onRemoveCustomLine,
}: Step3Props) {
  const totalHeads = priceLines.reduce((s, l) => s + (l.quantity || 0), 0);
  const totalValue = priceLines.reduce((s, l) => s + calcSubtotal(l, pricingMode), 0);
  const avgPerHead = totalHeads > 0 ? totalValue / totalHeads : 0;

  const PRICING_MODES = [
    { value: "simple", label: "Simple", desc: "One price for all" },
    { value: "byClass", label: "By Class", desc: "Different price per subcategory" },
    { value: "liveWeight", label: "Live Weight", desc: "Price per pound (live)" },
    { value: "hangingWeight", label: "Hanging Weight", desc: "Price per pound (carcass)" },
    { value: "custom", label: "Custom", desc: "Free-form price lines" },
  ] as const;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
        Head Count &amp; Pricing
      </h3>

      {/* Pricing Mode */}
      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-2">Pricing Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRICING_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onPricingModeChange(m.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                pricingMode === m.value
                  ? "border-[#4a7c3f] bg-[#4a7c3f]/10"
                  : "border-[#c8922a]/30 bg-white hover:border-[#c8922a]"
              }`}
            >
              <div className={`text-xs font-bold ${pricingMode === m.value ? "text-[#4a7c3f]" : "text-[#3d2b1f]"}`}>
                {m.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-3">
        {pricingMode !== "custom" &&
          priceLines.map((line, idx) => (
            <PriceLineRow
              key={line.label}
              line={line}
              mode={pricingMode}
              onChange={(field, val) => onPriceLineChange(idx, field, val)}
            />
          ))}

        {pricingMode === "custom" && (
          <>
            {priceLines.map((line, idx) => (
              <div key={idx} className="bg-amber-50 border border-[#c8922a]/30 rounded-lg p-3 space-y-2">
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={line.label}
                    onChange={(e) => onPriceLineChange(idx, "label", e.target.value)}
                    placeholder="Label (e.g. Prime Ewes)"
                    className="flex-1 border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveCustomLine(idx)}
                    className="text-red-500 hover:text-red-700 text-lg leading-none mt-1"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={line.quantity || ""}
                      onChange={(e) => onPriceLineChange(idx, "quantity", Number(e.target.value))}
                      className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Price / Head ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.pricePerHead || ""}
                      onChange={(e) => onPriceLineChange(idx, "pricePerHead", Number(e.target.value))}
                      className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
                    />
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-[#4a7c3f]">
                  Subtotal: {fmt(calcSubtotal(line, pricingMode))}
                </div>
              </div>
            ))}
            {priceLines.length < 3 && (
              <button
                type="button"
                onClick={onAddCustomLine}
                className="w-full border-2 border-dashed border-[#c8922a]/40 rounded-lg py-2 text-sm text-[#c8922a] hover:border-[#c8922a] transition-colors"
              >
                + Add Price Line
              </button>
            )}
          </>
        )}
      </div>

      {/* Totals */}
      <div className="bg-[#4a7c3f]/10 border border-[#4a7c3f]/30 rounded-xl p-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-[#3d2b1f]">Total Head Count</span>
          <span className="font-bold text-[#3d2b1f]">{totalHeads}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#3d2b1f]">Avg Price / Head</span>
          <span className="font-bold text-[#3d2b1f]">{totalHeads > 0 ? fmt(avgPerHead) : "—"}</span>
        </div>
        <div className="flex justify-between text-base border-t border-[#4a7c3f]/30 pt-1.5 mt-1.5">
          <span className="font-bold text-[#3d2b1f]">Grand Total</span>
          <span className="font-bold text-[#4a7c3f] text-lg">{fmt(totalValue)}</span>
        </div>
      </div>
    </div>
  );
}

interface PriceLineRowProps {
  line: PriceLine;
  mode: "simple" | "byClass" | "liveWeight" | "hangingWeight";
  onChange: (field: keyof PriceLine, value: string | number) => void;
}

function PriceLineRow({ line, mode, onChange }: PriceLineRowProps) {
  const sub = calcSubtotal(line, mode);

  return (
    <div className="bg-amber-50 border border-[#c8922a]/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#3d2b1f]">{line.label}</span>
        <span className="text-xs font-bold text-[#4a7c3f]">{fmt(sub)}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-0.5 block">Head Count</label>
          <input
            type="number"
            min="0"
            value={line.quantity || ""}
            onChange={(e) => onChange("quantity", Number(e.target.value))}
            className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
          />
        </div>

        {(mode === "simple" || mode === "byClass") && (
          <div>
            <label className="text-xs text-gray-500 mb-0.5 block">Price / Head ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={line.pricePerHead || ""}
              onChange={(e) => onChange("pricePerHead", Number(e.target.value))}
              className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
            />
          </div>
        )}

        {(mode === "liveWeight" || mode === "hangingWeight") && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Avg Weight (lbs)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={line.avgWeightLbs || ""}
                onChange={(e) => onChange("avgWeightLbs", Number(e.target.value))}
                className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Price / lb ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.pricePerLb || ""}
                onChange={(e) => onChange("pricePerLb", Number(e.target.value))}
                className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
              />
            </div>
            {mode === "hangingWeight" && (
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Yield % (default 60)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={line.yieldPct || ""}
                  onChange={(e) => onChange("yieldPct", Number(e.target.value))}
                  className="w-full border border-[#c8922a]/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c3f]"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface Step4Props {
  group: Partial<LivestockGroup>;
  priceLines: PriceLine[];
  pricingMode: string;
}

function Step4Review({ group, priceLines, pricingMode }: Step4Props) {
  const totalHeads = priceLines.reduce((s, l) => s + (l.quantity || 0), 0);
  const totalValue = priceLines.reduce((s, l) => s + l.subtotal, 0);
  const avgPerHead = totalHeads > 0 ? totalValue / totalHeads : 0;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#3d2b1f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
        Review &amp; Save
      </h3>

      <div className="bg-[#4a7c3f]/10 border border-[#4a7c3f]/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{group.categoryEmoji}</span>
          <div>
            <div className="font-bold text-[#3d2b1f] text-base">{group.name}</div>
            <div className="text-sm text-gray-600">{group.category}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Subcategories</span>
            <div className="font-medium text-[#3d2b1f]">{group.subcategories?.join(", ") || "—"}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Purpose</span>
            <div className="font-medium text-[#3d2b1f]">{group.purpose?.join(", ") || "—"}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Acquisition Date</span>
            <div className="font-medium text-[#3d2b1f]">{group.acquisitionDate || "—"}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Source</span>
            <div className="font-medium text-[#3d2b1f]">{group.acquisitionSource || "—"}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Pricing Mode</span>
            <div className="font-medium text-[#3d2b1f] capitalize">{pricingMode}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Total Head Count</span>
            <div className="font-medium text-[#3d2b1f]">{totalHeads}</div>
          </div>
        </div>

        {group.notes && (
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Notes</span>
            <div className="text-sm text-[#3d2b1f] mt-0.5">{group.notes}</div>
          </div>
        )}

        <div className="border-t border-[#4a7c3f]/30 pt-3 space-y-1">
          {priceLines.map((line, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-[#3d2b1f]">
                {line.label} × {line.quantity}
              </span>
              <span className="font-semibold text-[#4a7c3f]">{fmt(line.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-[#4a7c3f]/30 pt-1 mt-1">
            <span className="text-[#3d2b1f]">Avg / Head</span>
            <span className="text-[#3d2b1f]">{totalHeads > 0 ? fmt(avgPerHead) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-[#3d2b1f]">Grand Total</span>
            <span className="text-[#4a7c3f] text-lg">{fmt(totalValue)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Click <strong>Save Group</strong> to store this group. All data is saved locally.
      </p>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

interface GroupCardProps {
  group: LivestockGroup;
  expenses: GroupExpense[];
  sales: SaleRecord[];
  onEdit: (group: LivestockGroup) => void;
  onDelete: (id: string) => void;
}

function GroupCard({ group, expenses, sales, onEdit, onDelete }: GroupCardProps) {
  const multipleClasses = group.priceLines.length > 1;

  const totalExpenses = expenses.filter((e) => e.isActual).reduce((s, e) => s + e.amount, 0);
  const totalIncome = sales.filter((s) => s.isActual).reduce((s, r) => s + r.totalAmount, 0);
  const netPnL = totalIncome - totalExpenses - group.totalValue;

  const statusLabel = group.status === "sold" ? "Sold Out" : group.status === "partial" ? "Partially Sold" : "Active";
  const statusColor = group.status === "sold" ? "bg-gray-200 text-gray-600" : group.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-[#4a7c3f]";

  return (
    <div className="card-rustic p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{group.categoryEmoji}</span>
          <div>
            <div className="font-bold text-[#3d2b1f] text-base leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {group.name}
            </div>
            <div className="text-xs text-gray-500">{group.acquisitionDate ? `Acquired ${group.acquisitionDate}` : ""}</div>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
          <button
            onClick={() => onEdit(group)}
            className="p-1.5 rounded hover:bg-amber-50 text-[#c8922a] hover:text-[#3d2b1f] transition-colors text-sm"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(group.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors text-sm"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="bg-[#4a7c3f]/15 text-[#4a7c3f] text-xs font-semibold px-2 py-0.5 rounded-full">
          {group.category}
        </span>
        {group.subcategories.map((s) => (
          <span key={s} className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
        {group.purpose.map((p) => (
          <span key={p} className="bg-[#3d2b1f]/10 text-[#3d2b1f] text-xs font-medium px-2 py-0.5 rounded-full">
            {p}
          </span>
        ))}
      </div>

      {/* Head count breakdown */}
      <div className="text-sm text-[#3d2b1f]">
        {multipleClasses ? (
          <div className="space-y-0.5">
            {group.priceLines.map((l) => (
              <div key={l.label} className="flex justify-between">
                <span>{l.label}: <strong>{l.quantity}</strong></span>
                <span className="text-gray-500">{fmt(l.subtotal)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span>
            <strong>{group.totalHeadCount}</strong> head
          </span>
        )}
      </div>

      {/* Pricing summary */}
      <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm">
        {group.pricingMode === "simple" && group.priceLines[0] && (
          <span className="text-[#3d2b1f]">
            {fmt(group.priceLines[0].pricePerHead ?? 0)}/head
          </span>
        )}
        {group.pricingMode === "byClass" && (
          <span className="text-[#3d2b1f]">
            {group.priceLines.map((l) => `${l.label} ${fmt(l.pricePerHead ?? 0)}`).join(" · ")}
          </span>
        )}
        {group.pricingMode === "liveWeight" && (
          <span className="text-[#3d2b1f]">
            {group.priceLines.map((l) => `${l.label} ${fmt(l.pricePerLb ?? 0)}/lb live`).join(" · ")}
          </span>
        )}
        {group.pricingMode === "hangingWeight" && (
          <span className="text-[#3d2b1f]">
            {group.priceLines.map((l) => `${l.label} ${fmt(l.pricePerLb ?? 0)}/lb hanging`).join(" · ")}
          </span>
        )}
        {group.pricingMode === "custom" && (
          <span className="text-[#3d2b1f]">Custom pricing</span>
        )}
      </div>

      {/* Total value + P&L */}
      <div className="space-y-1 border-t border-[#c8922a]/20 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Acquisition Value</span>
          <span className="font-bold text-[#4a7c3f] text-base">{fmt(group.totalValue)}</span>
        </div>
        {(totalExpenses > 0 || totalIncome > 0) && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Expenses</span>
              <span className="text-[#c0392b] font-medium">−{fmt(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Income</span>
              <span className="text-[#4a7c3f] font-medium">+{fmt(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#c8922a]/10 pt-1">
              <span className="font-semibold text-[#3d2b1f]">Net P&amp;L</span>
              <span className={`font-bold ${netPnL >= 0 ? "text-[#4a7c3f]" : "text-[#c0392b]"}`}>{fmt(netPnL)}</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/admin/business/livestock/${group.id}`}
          className="flex-1 text-center text-xs font-semibold bg-[#4a7c3f] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d6835] transition-colors"
        >
          View Details
        </Link>
        <Link
          href={`/admin/business/livestock/${group.id}?tab=expenses`}
          className="flex-1 text-center text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
        >
          Log Expense
        </Link>
        <Link
          href={`/admin/business/livestock/${group.id}?tab=sales`}
          className="flex-1 text-center text-xs font-semibold bg-[#3d2b1f]/10 text-[#3d2b1f] px-3 py-1.5 rounded-lg hover:bg-[#3d2b1f]/20 transition-colors"
        >
          Record Sale
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LivestockManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<LivestockGroup[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LivestockGroup | null>(null);

  // Form state
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [purpose, setPurpose] = useState<string[]>([]);
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionSource, setAcquisitionSource] = useState("");
  const [notes, setNotes] = useState("");
  const [pricingMode, setPricingMode] = useState<"simple" | "byClass" | "liveWeight" | "hangingWeight" | "custom">("simple");
  const [priceLines, setPriceLines] = useState<PriceLine[]>([]);

  // ── Auth ──
  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token !== "authenticated") {
      router.replace("/admin");
      return;
    }
    const raw = localStorage.getItem(LIVESTOCK_KEY);
    if (raw) {
      try { setGroups(JSON.parse(raw)); } catch { /* ignore */ }
    }
    const rawExp = localStorage.getItem(EXPENSES_KEY);
    if (rawExp) {
      try { setExpenses(JSON.parse(rawExp)); } catch { /* ignore */ }
    }
    const rawSales = localStorage.getItem(SALES_KEY);
    if (rawSales) {
      try { setSales(JSON.parse(rawSales)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, [router]);

  // ── Save to localStorage ──
  const saveGroups = useCallback((updated: LivestockGroup[]) => {
    setGroups(updated);
    localStorage.setItem(LIVESTOCK_KEY, JSON.stringify(updated));
  }, []);

  // ── Reset form ──
  const resetForm = useCallback(() => {
    setStep(1);
    setSelectedCategory("");
    setCustomCategory("");
    setSelectedSubcategories([]);
    setGroupName("");
    setPurpose([]);
    setAcquisitionDate("");
    setAcquisitionSource("");
    setNotes("");
    setPricingMode("simple");
    setPriceLines([]);
    setEditingGroup(null);
  }, []);

  // ── Open drawer for new group ──
  const openNewGroup = () => {
    resetForm();
    setDrawerOpen(true);
  };

  // ── Open drawer to edit ──
  const openEditGroup = (group: LivestockGroup) => {
    setEditingGroup(group);
    setStep(1);
    setSelectedCategory(group.category);
    setCustomCategory(group.category === "Other" ? group.name : "");
    setSelectedSubcategories(group.subcategories);
    setGroupName(group.name);
    setPurpose(group.purpose);
    setAcquisitionDate(group.acquisitionDate);
    setAcquisitionSource(group.acquisitionSource);
    setNotes(group.notes);
    setPricingMode(group.pricingMode);
    setPriceLines(group.priceLines.map((l) => ({ ...l })));
    setDrawerOpen(true);
  };

  // ── Delete group ──
  const deleteGroup = (id: string) => {
    if (!confirm("Delete this livestock group?")) return;
    saveGroups(groups.filter((g) => g.id !== id));
  };

  // ── Category select ──
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategories([]);
    if (cat !== "Other") {
      setGroupName(autoGroupName(cat));
    }
  };

  // ── Subcategory toggle ──
  const handleToggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // ── Step 2 field changes ──
  const handleDetailsChange = (field: string, value: string | string[]) => {
    if (field === "groupName") setGroupName(value as string);
    else if (field === "purpose") setPurpose(value as string[]);
    else if (field === "acquisitionDate") setAcquisitionDate(value as string);
    else if (field === "acquisitionSource") setAcquisitionSource(value as string);
    else if (field === "notes") setNotes(value as string);
  };

  // ── Pricing mode change — rebuild price lines ──
  const handlePricingModeChange = (mode: "simple" | "byClass" | "liveWeight" | "hangingWeight" | "custom") => {
    setPricingMode(mode);

    if (mode === "custom") {
      // Keep existing custom lines or start with one blank
      if (priceLines.length === 0) {
        setPriceLines([{ label: "", quantity: 0, pricePerHead: 0, subtotal: 0 }]);
      }
      return;
    }

    // Rebuild lines from subcategories
    if (mode === "simple") {
      // Single line: "All" aggregated but we show each subcategory row
      const existing = priceLines.reduce<Record<string, PriceLine>>((acc, l) => {
        acc[l.label] = l;
        return acc;
      }, {});
      const sharedPrice = priceLines[0]?.pricePerHead ?? 0;
      const lines = selectedSubcategories.map((sub) => ({
        label: sub,
        quantity: existing[sub]?.quantity ?? 0,
        pricePerHead: sharedPrice,
        subtotal: 0,
      }));
      if (lines.length === 0) {
        lines.push({ label: "All", quantity: 0, pricePerHead: 0, subtotal: 0 });
      }
      setPriceLines(lines);
    } else {
      const existing = priceLines.reduce<Record<string, PriceLine>>((acc, l) => {
        acc[l.label] = l;
        return acc;
      }, {});
      const subs = selectedSubcategories.length > 0 ? selectedSubcategories : ["All"];
      const lines = subs.map((sub) => ({
        label: sub,
        quantity: existing[sub]?.quantity ?? 0,
        pricePerHead: existing[sub]?.pricePerHead ?? 0,
        pricePerLb: existing[sub]?.pricePerLb ?? 0,
        avgWeightLbs: existing[sub]?.avgWeightLbs ?? 0,
        yieldPct: existing[sub]?.yieldPct ?? 60,
        subtotal: 0,
      }));
      setPriceLines(lines);
    }
  };

  // ── Price line field change ──
  const handlePriceLineChange = (index: number, field: keyof PriceLine, value: string | number) => {
    setPriceLines((prev) => {
      const updated = prev.map((l, i) => {
        if (i !== index) return l;
        const next = { ...l, [field]: value };

        // For simple mode: propagate price to all rows
        if (pricingMode === "simple" && field === "pricePerHead") {
          return next; // we'll handle propagation below
        }
        return next;
      });

      // For simple mode, if user changed pricePerHead on any row, apply to all
      if (pricingMode === "simple" && field === "pricePerHead") {
        const newPrice = value as number;
        return updated.map((l) => ({ ...l, pricePerHead: newPrice }));
      }

      return updated;
    });
  };

  // ── Add custom line ──
  const handleAddCustomLine = () => {
    setPriceLines((prev) => [...prev, { label: "", quantity: 0, pricePerHead: 0, subtotal: 0 }]);
  };

  // ── Remove custom line ──
  const handleRemoveCustomLine = (idx: number) => {
    setPriceLines((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Next step ──
  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      alert("Please select a species.");
      return;
    }
    if (step === 1 && selectedCategory !== "Other" && selectedSubcategories.length === 0 && SUBCATEGORIES[selectedCategory]?.length > 0) {
      alert("Please select at least one subcategory.");
      return;
    }
    if (step === 1) {
      // Initialize price lines when advancing from step 1
      const subs = selectedSubcategories.length > 0 ? selectedSubcategories : ["All"];
      const existing = priceLines.reduce<Record<string, PriceLine>>((acc, l) => {
        acc[l.label] = l;
        return acc;
      }, {});
      setPriceLines(
        subs.map((sub) => ({
          label: sub,
          quantity: existing[sub]?.quantity ?? 0,
          pricePerHead: existing[sub]?.pricePerHead ?? 0,
          pricePerLb: existing[sub]?.pricePerLb ?? 0,
          avgWeightLbs: existing[sub]?.avgWeightLbs ?? 0,
          yieldPct: existing[sub]?.yieldPct ?? 60,
          subtotal: 0,
        }))
      );
    }
    if (step === 3) {
      // Finalize subtotals before review
      setPriceLines((prev) =>
        prev.map((l) => ({ ...l, subtotal: calcSubtotal(l, pricingMode) }))
      );
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  // ── Save group ──
  const handleSave = () => {
    const finalLines = priceLines.map((l) => ({ ...l, subtotal: calcSubtotal(l, pricingMode) }));
    const totalHeadCount = finalLines.reduce((s, l) => s + (l.quantity || 0), 0);
    const totalValue = finalLines.reduce((s, l) => s + l.subtotal, 0);
    const avgPricePerHead = totalHeadCount > 0 ? totalValue / totalHeadCount : 0;

    const catEmoji = SPECIES.find((s) => s.category === selectedCategory)?.emoji ?? "🐾";
    const now = new Date().toISOString();

    const catName = selectedCategory === "Other" ? (customCategory || "Other") : selectedCategory;

    const newGroup: LivestockGroup = {
      id: editingGroup?.id ?? generateId(),
      name: groupName || autoGroupName(catName),
      category: catName,
      categoryEmoji: catEmoji,
      subcategories: selectedSubcategories,
      purpose,
      acquisitionDate,
      acquisitionSource,
      notes,
      pricingMode,
      priceLines: finalLines,
      totalHeadCount,
      totalValue,
      avgPricePerHead,
      createdAt: editingGroup?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingGroup) {
      saveGroups(groups.map((g) => (g.id === editingGroup.id ? newGroup : g)));
    } else {
      saveGroups([...groups, newGroup]);
    }

    setDrawerOpen(false);
    resetForm();
  };

  // ── Filtered groups ──
  const filteredGroups =
    filterTab === "All"
      ? groups
      : groups.filter((g) => g.category === filterTab);

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
      {/* ── Header ── */}
      <header className="wood-texture shadow" style={{ backgroundColor: "var(--color-farm-brown)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span
                className="text-[var(--color-farm-cream)] font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Webb&apos;s Wild Acres — Livestock Manager
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/business"
                className="text-[var(--color-farm-tan-light)] text-xs hover:text-[var(--color-farm-gold)] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "var(--font-lato), Georgia, serif" }}
              >
                Business Center
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-[#3d2b1f]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Livestock Manager
            </h1>
            <p className="text-sm text-gray-600 mt-0.5" style={{ fontFamily: "var(--font-lato), Georgia, serif" }}>
              Manage all your livestock groups across species
            </p>
          </div>
          <button
            onClick={openNewGroup}
            className="btn-rustic px-5 py-2 text-sm font-semibold"
          >
            + New Group
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 flex-wrap mb-6 bg-white border border-[#c8922a]/20 rounded-xl p-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterTab === tab
                  ? "bg-[#4a7c3f] text-white shadow-sm"
                  : "text-[#3d2b1f] hover:bg-amber-50"
              }`}
            >
              {tab === "All" ? "All" : `${SPECIES.find((s) => s.category === tab)?.emoji ?? ""} ${tab}`}
            </button>
          ))}
        </div>

        {/* ── Group Cards Grid ── */}
        {filteredGroups.length === 0 ? (
          <div className="card-rustic p-12 text-center">
            <div className="text-5xl mb-4">🐾</div>
            <h2
              className="text-xl font-bold text-[#3d2b1f] mb-2"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              No livestock groups yet
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {filterTab !== "All"
                ? `No ${filterTab} groups found. Switch to "All" or add a new group.`
                : "Click New Group to get started tracking your livestock."}
            </p>
            <button onClick={openNewGroup} className="btn-rustic px-6 py-2 text-sm">
              + New Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                expenses={expenses.filter((e) => e.groupId === group.id)}
                sales={sales.filter((s) => s.groupId === group.id)}
                onEdit={openEditGroup}
                onDelete={deleteGroup}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Drawer Backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => { setDrawerOpen(false); resetForm(); }}
        />
      )}

      {/* ── Drawer Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8922a]/20 bg-[#3d2b1f]">
          <div>
            <h2
              className="text-white font-bold text-base"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {editingGroup ? "Edit Group" : "New Livestock Group"}
            </h2>
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s <= step ? "bg-[#c8922a] w-8" : "bg-white/30 w-4"
                  }`}
                />
              ))}
              <span className="text-white/60 text-xs ml-1">Step {step} of 4</span>
            </div>
          </div>
          <button
            onClick={() => { setDrawerOpen(false); resetForm(); }}
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <Step1SpeciesType
              selectedCategory={selectedCategory}
              selectedSubcategories={selectedSubcategories}
              customCategory={customCategory}
              onSelectCategory={handleSelectCategory}
              onToggleSubcategory={handleToggleSubcategory}
              onCustomCategory={setCustomCategory}
            />
          )}
          {step === 2 && (
            <Step2GroupDetails
              groupName={groupName}
              purpose={purpose}
              acquisitionDate={acquisitionDate}
              acquisitionSource={acquisitionSource}
              notes={notes}
              onChange={handleDetailsChange}
            />
          )}
          {step === 3 && (
            <Step3HeadCountPricing
              subcategories={selectedSubcategories}
              pricingMode={pricingMode}
              priceLines={priceLines}
              onPricingModeChange={handlePricingModeChange}
              onPriceLineChange={handlePriceLineChange}
              onAddCustomLine={handleAddCustomLine}
              onRemoveCustomLine={handleRemoveCustomLine}
            />
          )}
          {step === 4 && (
            <Step4Review
              group={{
                name: groupName,
                category: selectedCategory === "Other" ? (customCategory || "Other") : selectedCategory,
                categoryEmoji: SPECIES.find((s) => s.category === selectedCategory)?.emoji ?? "🐾",
                subcategories: selectedSubcategories,
                purpose,
                acquisitionDate,
                acquisitionSource,
                notes,
              }}
              priceLines={priceLines.map((l) => ({ ...l, subtotal: calcSubtotal(l, pricingMode) }))}
              pricingMode={pricingMode}
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-[#c8922a]/20 flex items-center justify-between bg-amber-50/60">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1}
            className="text-sm font-medium text-[#3d2b1f] disabled:opacity-30 px-4 py-2 rounded-lg hover:bg-amber-100 disabled:hover:bg-transparent transition-colors"
          >
            ← Back
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="btn-rustic px-6 py-2 text-sm"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold bg-[#4a7c3f] text-white rounded-lg hover:bg-[#3d6835] transition-colors shadow"
            >
              {editingGroup ? "Update Group" : "Save Group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
