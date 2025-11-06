import type { ReactNode } from "react";

import { BulletList, BulletListItem } from "@/components/BulletList";
import { CheckIcon, ShieldIcon, SparkleIcon } from "@/components/icons";

type TransparencyCard = {
  title: string;
  description?: string;
  items: string[];
  icon: typeof ShieldIcon;
  tone?: "accent" | "info";
  footnote?: ReactNode;
};

const TRANSPARENCY_CARDS: TransparencyCard[] = [
  {
    title: "Data Sources",
    icon: ShieldIcon,
    tone: "info",
    items: [
      "Municipal court cases (last 180 days) mapped to parcel addresses.",
      "Code compliance complaints with open and closed status flags.",
      "Building permit valuations and status indicators (Pending, Issued - Hold).",
      "Parcel master roll with TAXPIN, owner, and land-use classifications.",
    ],
  },
  {
    title: "Risk Formula",
    icon: SparkleIcon,
    items: [
      "2.0 x number of court cases at the address.",
      "1.5 x complaint count (open complaints add an extra 0.5 weight).",
      "3.0 x high-valuation permits (valuation >= $100,000).",
      "2.5 x stalled permits (Pending or Issued - Hold).",
    ],
    description:
      "Weights are applied in backend/scripts/ingest_metrics.py to materialise the leaderboard.",
    footnote:
      "Scoring guide: >= 12 Critical, >= 7 High, >= 4 Moderate, otherwise Low.",
  },
  {
    title: "Refresh & Quality",
    icon: CheckIcon,
    items: [
      "Materialise nightly via python backend/scripts/ingest_metrics.py before deployment.",
      "Derived JSON drops direct PII while preserving parcel and owner context for staff.",
      "CI runs pytest and Next.js lint/build on every push to guard regressions.",
    ],
    footnote: (
      <>
        Reference docs and sample datasets live in{" "}
        <a
          className="underline decoration-dotted text-slate-200"
          href="https://github.com/mcmanusandmcmanus/arlingtontx_opendata_01"
          target="_blank"
          rel="noopener noreferrer"
        >
          the public repository
        </a>
        .
      </>
    ),
  },
];

export function TransparencySection() {
  return (
    <section className="space-y-6 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <header className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Transparency &amp; Methodology</h2>
        <p className="text-sm text-slate-300">
          The dashboard ships with the full analytics pipeline, datasets, and scoring logic so
          analysts and residents can follow how parcel risk is derived.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {TRANSPARENCY_CARDS.map((card) => (
          <article
            key={card.title}
            className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
              <card.icon className="h-4 w-4 text-white/80" />
              {card.title}
            </span>
            {card.description && (
              <p className="text-sm text-slate-300">{card.description}</p>
            )}
            <BulletList className="space-y-2">
              {card.items.map((item) => (
                <BulletListItem key={item} icon={card.icon} tone={card.tone ?? "accent"}>
                  {item}
                </BulletListItem>
              ))}
            </BulletList>
            {card.footnote && <p className="text-xs text-slate-400">{card.footnote}</p>}
          </article>
        ))}
      </div>

      <footer className="text-xs text-slate-400">
        Have ideas for additional signals or want to adjust the weights? Open an issue or submit a
        pull request so the community can review improvements in the open.
      </footer>
    </section>
  );
}

