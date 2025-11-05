"use client";

import { PermitWatchlistRecord } from "@/types";

type Props = {
  permits: PermitWatchlistRecord[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PermitWatchlist({ permits }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Development Watchlist
          </h2>
          <p className="text-sm text-slate-400">
            High-valuation or stalled permits for proactive coordination with
            planning and inspections.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-xl">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/90 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Permit</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Valuation</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {permits.map((permit) => (
              <tr key={permit.permit_id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-200">
                  <div className="flex flex-col">
                    <span className="font-medium">{permit.permit_id}</span>
                    <span className="text-xs text-slate-500">
                      {permit.property_id ?? "No parcel link"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-200">{permit.address}</td>
                <td className="px-4 py-3 text-slate-300">
                  {permit.permit_type}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                    {permit.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-100">
                  {currency.format(permit.valuation)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {permit.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="inline-flex items-center rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-xs text-rose-100"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {permits.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  All permits are within normal thresholds. Great job!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

