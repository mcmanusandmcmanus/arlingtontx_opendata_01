import type { ComponentType, ReactNode, SVGProps } from "react";

import clsx from "clsx";

import { CheckIcon } from "@/components/icons";

type BulletAccent = "accent" | "info";

type BulletListItemProps = {
  children: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: BulletAccent;
};

const toneClasses: Record<BulletAccent, string> = {
  accent: "bg-emerald-500/20 text-emerald-200",
  info: "bg-sky-500/20 text-sky-200",
};

type BulletListProps = {
  children: ReactNode;
  className?: string;
};

export function BulletList({ children, className }: BulletListProps) {
  return <ul className={clsx("space-y-2", className)}>{children}</ul>;
}

export function BulletListItem({
  children,
  icon: Icon = CheckIcon,
  tone = "accent",
}: BulletListItemProps) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-300">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full ${toneClasses[tone]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="leading-5">{children}</span>
    </li>
  );
}
