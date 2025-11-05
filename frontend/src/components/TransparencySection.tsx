"use client";

export function TransparencySection() {
  return (
    <section className="space-y-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Transparency &amp; Methodology</h2>
        <p className="text-sm text-slate-300">
          This dashboard is driven by a lightweight analytics pipeline bundled in the open-source
          repository. Below is a concise explanation of the inputs, scoring logic, and refresh
          cadence so that analysts and residents can understand how parcel risk is determined.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <article className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <h3 className="text-lg font-semibold text-white">Data Sources</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              • Municipal court cases (last 180 days) mapped to parcel addresses.
            </li>
            <li>
              • Code complaints with open/closed status.
            </li>
            <li>
              • Building permits, including valuation and status flags (pending, issued).
            </li>
            <li>
              • Parcel roll (TAXPIN, owner, land use) to anchor all other signals.
            </li>
          </ul>
        </article>

        <article className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <h3 className="text-lg font-semibold text-white">Risk Formula</h3>
          <p className="text-sm text-slate-300">
            Parcels receive a weighted score in <code>backend/scripts/ingest_metrics.py</code>:
          </p>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>• 2.0 × number of court cases at the address.</li>
            <li>• 1.5 × code complaints (open complaints get an extra 0.5 multiplier).</li>
            <li>• 3.0 × high-valuation permits (≥ $100K).</li>
            <li>• 2.5 × stalled permits (Pending or Issued - Hold).</li>
          </ul>
          <p className="text-xs text-slate-400">
            Scores ≥ 12 → Critical, ≥ 7 → High, ≥ 4 → Moderate, otherwise Low. The weights are
            documented and can be tuned in the repo.
          </p>
        </article>

        <article className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <h3 className="text-lg font-semibold text-white">Refresh &amp; Quality</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              • Data is materialised nightly by running{" "}
              <code>python backend/scripts/ingest_metrics.py</code> prior to deployment.
            </li>
            <li>
              • The pipeline removes direct PII, keeping parcel- and owner-level context only.
            </li>
            <li>
              • GitHub Actions run pytest + Next.js build on every push for regression coverage.
            </li>
            <li>
              • Full blueprint, weights, and sample CSVs are committed to{" "}
              <a
                className="underline decoration-dotted text-slate-200"
                href="https://github.com/mcmanusandmcmanus/arlingtontx_opendata_01"
                target="_blank"
                rel="noopener noreferrer"
              >
                the open-source repository
              </a>
              .
            </li>
          </ul>
        </article>
      </div>

      <footer className="text-xs text-slate-400">
        Have suggestions on the scoring weights or want to plug in additional datasets? File an issue
        or submit a pull request—this project is intentionally transparent so it can grow with the
        community.
      </footer>
    </section>
  );
}

