import { BulletList, BulletListItem } from "@/components/BulletList";
import { ShieldIcon, SparkleIcon } from "@/components/icons";
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
    accent: "from-rose-700/80 to-rose-500/30",
  },
  High: {
    label: "High",
    description: "Schedule proactive inspection",
    accent: "from-orange-500/80 to-orange-500/30",
  },
  Moderate: {
    label: "Moderate",
    description: "Monitor after next complaint",
    accent: "from-amber-500/60 to-amber-500/20",
  },
  Low: {
    label: "Low",
    description: "Aligned with citywide baseline",
    accent: "from-emerald-500/60 to-emerald-500/20",
  },
};

const PLAYBOOK_ITEMS = [
  "Focus inspections on parcels flagged Critical or High in the leaderboard.",
  "Pair high-valuation permits with recent complaints to reduce redevelopment churn.",
  "Trigger multi-agency sweeps when weekly offense volume spikes above baseline.",
] as const;

const DATA_SOURCE_ITEMS = [
  "Municipal court cases (last 180 days) mapped to parcel addresses.",
  "Code compliance complaints with live open/closed status tracking.",
  "Building permit valuations and status flags (Pending, Issued - Hold).",
] as const;

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

  const totalParcels = parcels.length;
  const topParcel = parcels.at(0);

  const heroHighlights = [
    { label: "High-risk parcels", value: kpis.high_risk_sites },
    { label: "Open complaints", value: kpis.open_complaints },
    { label: "Watchlist permits", value: permits.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <header className="space-y-8 rounded-3xl border border-white/5 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <SparkleIcon className="h-3.5 w-3.5 text-amber-300" />
                </span>
                <span>Public Safety | Arlington, TX Open Data</span>
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                  Target the parcels that generate the majority of enforcement work.
                </h1>
                <p className="text-base text-slate-300">
                  Blend court activity, code complaints, and development signals to steer
                  proactive inspections. Built for inspectors, analysts, and cross-department
                  action teams.
                </p>
              </div>
              <dl className="grid gap-3 text-xs sm:grid-cols-3">
                {heroHighlights.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                  >
                    <dt className="text-[0.65rem] uppercase tracking-wide text-white/70">
                      {label}
                    </dt>
                    <dd className="text-xl font-semibold text-white">
                      {value.toLocaleString("en-US")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {topParcel && (
              <section className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-rose-600/40 to-rose-500/15 p-6 shadow-xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
                  <span>Current highest priority</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[0.65rem] font-semibold text-white/80">
                    <ShieldIcon className="h-3.5 w-3.5 text-white/80" />
                    {topParcel.risk_level}
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">{topParcel.address}</h2>
                  <p className="text-sm text-white/70">
                    {topParcel.owner ?? "Owner unknown"}
                  </p>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-white/60">Risk score</dt>
                    <dd className="text-2xl font-semibold text-white">
                      {topParcel.risk_score.toFixed(1)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Open complaints</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.open_complaints}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Court cases</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.case_count}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Permit flags</dt>
                    <dd className="text-xl font-semibold text-white">
                      {topParcel.high_value_permits + topParcel.stalled_permits}
                    </dd>
                  </div>
                </dl>
                {topParcel.top_offenses.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-white/70">
                      Top offenses
                    </p>
                    <ul className="space-y-1.5 text-sm text-white/80">
                      {topParcel.top_offenses.slice(0, 3).map((offense) => (
                        <li
                          key={offense.offense_type}
                          className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-1.5"
                        >
                          <span className="text-xs uppercase tracking-wide text-white/70">
                            {offense.offense_type}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {offense.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-white/60">No recent offense history recorded.</p>
                )}
              </section>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(RISK_LEVEL_META).map(([level, meta]) => {
              const typedLevel = level as ParcelRisk["risk_level"];
              const count = riskDistribution[typedLevel] ?? 0;
              const share = totalParcels === 0 ? 0 : Math.round((count / totalParcels) * 100);
              return (
                <div
                  key={level}
                  className={`rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-4`}
                >
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    {meta.label}
                  </p>
                  <p className="text-3xl font-semibold text-white">
                    {count.toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-white/70">{share}% of leaderboard</p>
                  <p className="mt-3 text-xs text-white/80">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </header>

        <KpiStrip kpis={kpis} />

        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <RiskTable parcels={parcels} />
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-100">80/20 Playbook</h3>
              <BulletList className="mt-4 space-y-3">
                {PLAYBOOK_ITEMS.map((item) => (
                  <BulletListItem key={item}>{item}</BulletListItem>
                ))}
              </BulletList>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-100">Data Sources</h3>
              <BulletList className="mt-3 space-y-2">
                {DATA_SOURCE_ITEMS.map((item) => (
                  <BulletListItem key={item} icon={ShieldIcon} tone="info">
                    {item}
                  </BulletListItem>
                ))}
              </BulletList>
              <p className="mt-4 text-xs text-slate-500">
                Refresh nightly via{" "}
                <code className="font-mono text-slate-300">python backend/scripts/ingest_metrics.py</code>.
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
