import { KpiStrip } from "@/components/KpiStrip";
import { PermitWatchlist } from "@/components/PermitWatchlist";
import { RiskTable } from "@/components/RiskTable";
import { TrendCharts } from "@/components/TrendCharts";
import { TransparencySection } from "@/components/TransparencySection";
import {
  fetchKPIs,
  fetchOffenseTrends,
  fetchParcelRisk,
  fetchPermitWatchlist,
} from "@/lib/api";
import { ParcelRisk } from "@/types";

export const dynamic = "force-dynamic";

const RISK_LEVEL_META: Record<
  ParcelRisk["risk_level"],
  { label: string; description: string; accent: string }
> = {
  Critical: {
    label: "Critical",
    description: "Immediate coordinated response",
    accent: "from-rose-600/90 to-rose-500/50",
  },
  High: {
    label: "High",
    description: "Schedule proactive inspection",
    accent: "from-orange-500/90 to-orange-500/40",
  },
  Moderate: {
    label: "Moderate",
    description: "Monitor after next complaint",
    accent: "from-amber-500/80 to-amber-500/30",
  },
  Low: {
    label: "Low",
    description: "In line with citywide baseline",
    accent: "from-emerald-500/70 to-emerald-500/20",
  },
};

export default async function HomePage() {
  const [kpis, parcels, permits, trends] = await Promise.all([
    fetchKPIs(),
    fetchParcelRisk(),
    fetchPermitWatchlist(),
    fetchOffenseTrends(),
  ]);

  const riskDistribution = parcels.reduce<Record<ParcelRisk["risk_level"], number>>(
    (acc, parcel) => {
      acc[parcel.risk_level] = (acc[parcel.risk_level] ?? 0) + 1;
      return acc;
    },
    { Critical: 0, High: 0, Moderate: 0, Low: 0 },
  );

  const topParcel = parcels.at(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <header className="space-y-6 rounded-3xl border border-white/5 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
                Public Safety · Arlington, TX Open Data
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Target the 20% of parcels creating 80% of enforcement work.
              </h1>
              <p className="text-base text-slate-300">
                Rapidly triage high-risk properties by blending municipal court
                activity, code complaints, and development signals. Built for
                inspectors, analysts, and cross-department action teams.
              </p>
            </div>
            {topParcel && (
              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-gradient-to-br from-rose-600/50 to-rose-500/20 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Current highest priority
                </p>
                <h2 className="text-xl font-semibold text-white">
                  {topParcel.address}
                </h2>
                <p className="text-sm text-white/70">
                  {topParcel.owner ?? "Owner unknown"}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-white/60">Risk Score</dt>
                    <dd className="text-2xl font-semibold text-white">
                      {topParcel.risk_score.toFixed(1)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Open Complaints</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.open_complaints}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Cases</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.case_count}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Permit Flags</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.high_value_permits + topParcel.stalled_permits}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(RISK_LEVEL_META).map(([level, meta]) => (
              <div
                key={level}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-4`}
              >
                <p className="text-xs uppercase tracking-wide text-white/70">
                  {meta.label}
                </p>
                <p className="text-3xl font-semibold text-white">
                  {riskDistribution[level as ParcelRisk["risk_level"]] ?? 0}
                </p>
                <p className="text-xs text-white/75">{meta.description}</p>
              </div>
            ))}
          </div>
        </header>

        <KpiStrip kpis={kpis} />

        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <RiskTable parcels={parcels} />
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg">
              <h3 className="text-lg font-semibold">80/20 Playbook</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>
                  • Focus field visits on the critical/high parcels above vanilla
                  averages.
                </li>
                <li>
                  • Pair high-valuation permits with recent complaints to prevent
                  redevelopment churn.
                </li>
                <li>
                  • Use weekly activity spikes to trigger multi-agency sweeps.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg">
              <h3 className="text-lg font-semibold">Data Sources</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Municipal court cases (open data extract)</li>
                <li>• Code compliance complaints</li>
                <li>• Building permits & valuations</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Pipeline regenerates nightly; override via backend script
                `python backend/scripts/ingest_metrics.py`.
              </p>
            </div>
          </aside>
        </section>

        <TrendCharts data={trends} />

        <PermitWatchlist permits={permits} />

        <TransparencySection />
      </main>
    </div>
  );
}
