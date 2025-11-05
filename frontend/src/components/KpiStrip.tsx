"use client";

import { KPISummary } from "@/types";
import { format } from "date-fns";
import { useMemo } from "react";

type KpiStripProps = {
  kpis: KPISummary;
};

const KPI_CONFIG = [
  {
    key: "total_cases",
    label: "Court Cases (30d)",
    accent: "from-blue-500/90 to-blue-500/40",
  },
  {
    key: "open_complaints",
    label: "Open Complaints",
    accent: "from-rose-500/90 to-rose-500/40",
  },
  {
    key: "high_risk_sites",
    label: "High Risk Parcels",
    accent: "from-amber-500/90 to-amber-500/40",
  },
  {
    key: "high_value_permits",
    label: "High Value Permits",
    accent: "from-emerald-500/90 to-emerald-500/40",
  },
] as const;

const numberFormatter = new Intl.NumberFormat("en-US");

export function KpiStrip({ kpis }: KpiStripProps) {
  const generated = useMemo(() => {
    try {
      return format(new Date(kpis.generated_at), "MMM d, yyyy HH:mm");
    } catch {
      return kpis.generated_at;
    }
  }, [kpis.generated_at]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Situational Awareness
          </h2>
          <p className="text-sm text-slate-400">
            Metrics auto-refreshed on {generated} UTC.
          </p>
        </div>
        <span className="rounded-full bg-slate-800/80 px-4 py-1 text-xs uppercase tracking-wide text-slate-300">
          MVP · 80/20 focus
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPI_CONFIG.map(({ key, label, accent }) => (
          <article
            key={key}
            className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${accent} p-5 shadow-lg`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
            <div className="relative z-10 space-y-1">
              <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                {label}
              </p>
              <p className="text-3xl font-semibold text-white">
                {numberFormatter.format(kpis[key])}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

