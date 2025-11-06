"use client";

import { ParcelRisk } from "@/types";
import clsx from "clsx";
import { useMemo, useState } from "react";

const riskColors: Record<ParcelRisk["risk_level"], string> = {
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Moderate: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  High: "bg-orange-500/25 text-orange-100 border-orange-500/40",
  Critical: "bg-rose-600/30 text-rose-100 border-rose-500/50",
};

type RiskTableProps = {
  parcels: ParcelRisk[];
};

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function RiskTable({ parcels }: RiskTableProps) {
  const [selectedLevel, setSelectedLevel] = useState<
    ParcelRisk["risk_level"] | "ALL"
  >("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return parcels.filter((parcel) => {
      if (
        selectedLevel !== "ALL" &&
        parcel.risk_level.toLowerCase() !== selectedLevel.toLowerCase()
      ) {
        return false;
      }
      if (!query) return true;
      const text = `${parcel.address} ${parcel.owner ?? ""} ${parcel.taxpin}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [parcels, query, selectedLevel]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            High-Risk Parcels (Top 25)
          </h2>
          <p className="text-sm text-slate-400">
            Weighted blend of court cases, code complaints, and permit flags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search address / owner / TAXPIN"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {(["ALL", "Critical", "High", "Moderate", "Low"] as const).map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={clsx(
                    "px-3 py-2 text-xs font-semibold uppercase tracking-wide transition",
                    selectedLevel === level
                      ? "bg-slate-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200",
                  )}
                >
                  {level}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-xl">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/90 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium text-right">Risk</th>
              <th className="px-4 py-3 font-medium text-right">Cases</th>
              <th className="px-4 py-3 font-medium text-right">Complaints</th>
              <th className="px-4 py-3 font-medium text-right">Permits</th>
              <th className="px-4 py-3 font-medium">Signals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {filtered.map((parcel) => (
              <tr
                key={parcel.taxpin}
                className="hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-slate-200">
                    <span className="font-medium">{parcel.address}</span>
                    <span className="text-xs text-slate-400">
                      {parcel.taxpin} / {parcel.land_use ?? "Land use n/a"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {parcel.owner ?? "Unknown"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                      riskColors[parcel.risk_level],
                    )}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-current"
                      aria-hidden
                    />
                    {parcel.risk_level}
                    <span className="text-white/70">
                      {formatter.format(parcel.risk_score)}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-200">
                  {parcel.case_count}
                </td>
                <td className="px-4 py-3 text-right text-slate-200">
                  {parcel.complaint_count}{" "}
                  <span className="text-xs text-slate-500">
                    ({parcel.open_complaints} open)
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-200">
                  {parcel.high_value_permits + parcel.stalled_permits}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {parcel.top_offenses.slice(0, 3).map((offense) => (
                      <span
                        key={offense.offense_type}
                        className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
                      >
                        {offense.offense_type}
                        <span className="ml-1 text-white/60">
                          {offense.count}
                        </span>
                      </span>
                    ))}
                    {parcel.top_offenses.length === 0 && (
                      <span className="text-xs text-slate-500">
                        No offense history
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No parcels match your filters. Adjust the risk level or search
                  criteria to widen the results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

