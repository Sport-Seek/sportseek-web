"use client";

import { useSports } from "@/app/contexts/SportsContext";
import type { Sport } from "@/app/types/sports";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const SportLogo = ({ sport }: { sport: Sport }) => {
  if (sport.logoSvg) {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: sport.logoSvg }}
      />
    );
  }

  return (
    <span
      className="text-[10px] font-semibold uppercase"
      style={{ color: sport.color }}
      aria-hidden="true"
    >
      {getInitials(sport.name)}
    </span>
  );
};

export default function SportsChips() {
  const { sports, isLoading } = useSports();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={`sport-skeleton-${index}`}
            className="h-9 w-28 animate-pulse rounded-full border border-slate-200/60 bg-white/70"
          />
        ))}
      </div>
    );
  }

  if (!sports.length) {
    return (
      <p className="text-sm text-slate-500">
        Aucun sport disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sports.map((sport) => (
        <span
          key={sport.id}
          className="inline-flex items-center gap-2 rounded-full border bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          style={{ borderColor: sport.color }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-slate-200/60">
            <SportLogo sport={sport} />
          </span>
          <span className="whitespace-nowrap">{sport.name}</span>
        </span>
      ))}
    </div>
  );
}
