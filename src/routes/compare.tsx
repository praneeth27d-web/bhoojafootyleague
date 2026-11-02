import { Fragment, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest } from "@/components/team-badge";
import { teamName, type Player } from "@/lib/league";
import { useLeague } from "@/lib/league-data";
import { marketValueAmount } from "@/lib/market-value";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Players — Bhooja Football League" },
      {
        name: "description",
        content: "Compare BFL players side by side across appearances, goals, assists, penalties and discipline.",
      },
      { property: "og:title", content: "BFL Player Comparison" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Side-by-side player comparison for the Bhooja Football League.",
      },
    ],
  }),
  component: ComparePage,
});

const selectClass =
  "appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus-visible:outline-none";

type StatDef = {
  label: string;
  value: (p: Player) => number | null;
  display?: (p: Player) => ReactNode;
  better: "higher" | "lower";
};

const statGroups: { title: string; info?: { label: string; render: (p: Player) => ReactNode }[]; stats?: StatDef[] }[] = [
  {
    title: "Player Information",
    info: [
      { label: "Team", render: (p) => teamName(p.teamSlug) },
      { label: "Position", render: (p) => p.position ?? "Not set" },
      { label: "Preferred Foot", render: (p) => p.preferredFoot ?? "Not set" },
      { label: "Jersey Number", render: (p) => (p.jerseyNumber === null ? "Not set" : p.jerseyNumber) },
    ],
    stats: [
      {
        label: "Market Value",
        value: (p) => (p.marketValue ? marketValueAmount(p.marketValue) : null),
        display: (p) => p.marketValue ?? "Not set",
        better: "higher",
      },
    ],
  },
  {
    title: "Performance",
    stats: [
      { label: "Appearances", value: (p) => p.appearances, better: "higher" },
      { label: "Total POTM", value: (p) => p.potm, better: "higher" },
    ],
  },
  {
    title: "Attacking",
    stats: [
      { label: "Goals", value: (p) => p.goals, better: "higher" },
      { label: "Assists", value: (p) => p.assists, better: "higher" },
      { label: "Total G/A", value: (p) => p.goals + p.assists, better: "higher" },
    ],
  },
  {
    title: "Penalties",
    stats: [
      { label: "Penalty Goals", value: (p) => p.penaltyGoals, better: "higher" },
      { label: "Penalties Earned", value: (p) => p.penaltiesEarned, better: "higher" },
      { label: "Penalties Missed", value: (p) => p.penaltiesMissed, better: "lower" },
    ],
  },
  {
    title: "Discipline",
    stats: [
      { label: "Yellow Cards", value: (p) => p.yellowCards, better: "lower" },
      { label: "Red Cards", value: (p) => p.redCards, better: "lower" },
      { label: "Warnings", value: (p) => p.warnings, better: "lower" },
      { label: "Matches Banned", value: (p) => p.matchesBanned, better: "lower" },
    ],
  },
];

function ComparePage() {
  const { players } = useLeague();
  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));
  const [count, setCount] = useState(2);
  const [picked, setPicked] = useState<(Player | null)[]>([null, null]);

  function changeCount(next: number) {
    setCount(next);
    setPicked((prev) => {
      const trimmed = prev.slice(0, next);
      while (trimmed.length < next) trimmed.push(null);
      return trimmed;
    });
  }

  function pick(index: number, slug: string) {
    setPicked((prev) => prev.map((p, i) => (i === index ? sorted.find((player) => player.slug === slug) ?? null : p)));
  }

  const chosen = picked.filter((p): p is Player => p !== null);
  const ready = chosen.length === count && count >= 2;
  const taken = new Set(picked.filter(Boolean).map((p) => (p as Player).id));

  function bestValues() {
    const best = new Map<string, number | null>();
    for (const group of statGroups) {
      for (const stat of group.stats ?? []) {
        const values = chosen.map(stat.value).filter((v): v is number => v !== null);
        if (values.length === 0) {
          best.set(stat.label, null);
          continue;
        }
        best.set(stat.label, stat.better === "higher" ? Math.max(...values) : Math.min(...values));
      }
    }
    return best;
  }
  const best = ready ? bestValues() : null;

  return (
    <AppShell title="Compare Players" subtitle="Side-by-side player comparison" back>
      <Card title="Select players">
        <div className="space-y-3 px-4 py-4">
          <label className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            Players
            <select
              className={selectClass}
              value={count}
              onChange={(e) => changeCount(Number(e.target.value))}
              aria-label="Number of players to compare"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {picked.map((p, index) => (
              <select
                key={index}
                className={selectClass}
                value={p?.slug ?? ""}
                onChange={(e) => pick(index, e.target.value)}
                aria-label={`Player ${index + 1}`}
              >
                <option value="">Player {index + 1}</option>
                {sorted
                  .filter((player) => player.id === p?.id || !taken.has(player.id))
                  .map((player) => (
                    <option key={player.id} value={player.slug}>
                      {player.name} · {teamName(player.teamSlug)}
                    </option>
                  ))}
              </select>
            ))}
          </div>
          {!ready && chosen.length === count && count === 2 && (
            <p className="text-xs text-muted-foreground">Pick two different players to compare.</p>
          )}
        </div>
      </Card>

      {ready && chosen.length >= 2 && (
        <Card title="Comparison">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-2 font-semibold">
                    Stat
                  </th>
                  {chosen.map((p) => (
                    <th key={p.id} scope="col" className="px-3 py-2 font-semibold">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <TeamCrest slug={p.teamSlug} className="size-5" />
                        {p.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statGroups.map((group) => (
                  <Fragment key={group.title}>
                    <tr>
                      <th
                        colSpan={chosen.length + 1}
                        scope="colgroup"
                        className="bg-surface-muted px-4 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {group.title}
                      </th>
                    </tr>
                    {group.info?.map((info) => (
                      <tr key={info.label} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 text-muted-foreground">{info.label}</td>
                        {chosen.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 font-medium">
                            {info.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {group.stats?.map((stat) => (
                      <tr key={stat.label} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 text-muted-foreground">{stat.label}</td>
                        {chosen.map((p) => {
                          const value = stat.value(p);
                          const isBest =
                            best !== null &&
                            best.get(stat.label) !== null &&
                            value !== null &&
                            value === best.get(stat.label);
                          return (
                            <td key={p.id} className="px-3 py-2.5">
                              {isBest ? (
                                <span
                                  className={`num inline-flex rounded-full border px-2 py-0.5 font-bold ${
                                    stat.better === "higher"
                                      ? "border-primary/30 bg-primary/15 text-primary"
                                      : "border-pos-low/30 bg-pos-low/10 text-pos-low"
                                  }`}
                                >
                                  {value}
                                </span>
                              ) : (
                                <span className="num">{value ?? "—"}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 pb-3 text-xs text-muted-foreground">
            Green marks the best value (higher is better for attacking stats, lower is better for penalties missed and cards). Ties are all marked.
          </p>
        </Card>
      )}
    </AppShell>
  );
}
