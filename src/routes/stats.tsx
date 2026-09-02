import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { PlayerSheet } from "@/components/player-sheet";
import { players, teamName } from "@/lib/league";

const metrics = ["goals", "assists", "ga", "potm"] as const;
type Metric = (typeof metrics)[number];
type Search = { metric: Metric };

const metricLabel: Record<Metric, string> = {
  goals: "Goals",
  assists: "Assists",
  ga: "Total G/A",
  potm: "POTM",
};

export const Route = createFileRoute("/stats")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    metric: metrics.includes(search["metric"] as Metric) ? (search["metric"] as Metric) : "goals",
  }),
  head: () => ({
    meta: [
      { title: "Player Stats — Bhooja Football League" },
      {
        name: "description",
        content: "BFL player statistics: goals, assists, total G/A and Player of the Match awards.",
      },
      { property: "og:title", content: "BFL Player Stats" },
      {
        property: "og:description",
        content: "Goals, assists, total G/A and POTM awards for every BFL player.",
      },
    ],
  }),
  component: StatsPage,
});

const selectClass =
  "appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus-visible:outline-none";

function StatsPage() {
  const { metric } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [selected, setSelected] = useState<string | null>(null);

  const value = (p: (typeof players)[number]) =>
    metric === "ga" ? p.goals + p.assists : p[metric];

  const rows = [...players]
    .sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name))
    .map((p, i) => ({ ...p, pos: i + 1 }));

  return (
    <AppShell title="Player Stats" subtitle="Tap a player for their profile">
      <Card
        title={metricLabel[metric]}
        action={
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            Filter
            <select
              className={selectClass}
              value={metric}
              onChange={(e) =>
                navigate({
                  to: ".",
                  search: (prev) => ({ ...prev, metric: e.target.value as Metric }),
                  replace: true,
                })
              }
            >
              {metrics.map((m) => (
                <option key={m} value={m}>
                  {metricLabel[m]}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-2 font-semibold">
                  Pos
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Team
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  {metricLabel[metric]}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-accent">
                  <td className="num px-4 py-3 text-muted-foreground">{p.pos}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(p.slug)}
                      className="font-semibold hover:text-primary"
                      aria-label={`Open profile for ${p.name}`}
                    >
                      {p.name}
                      {p.captain && <span className="text-muted-foreground"> (C)</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link
                      to="/teams/$teamSlug/squad"
                      params={{ teamSlug: p.teamSlug }}
                      className="hover:text-primary"
                    >
                      {teamName(p.teamSlug)}
                    </Link>
                  </td>
                  <td className="num px-3 py-3 text-right font-bold">
                    {metric === "ga" ? p.goals + p.assists : p[metric]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <PlayerSheet slug={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}
