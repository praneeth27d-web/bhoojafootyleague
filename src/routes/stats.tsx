import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { PlayerSheet } from "@/components/player-sheet";
import { Button } from "@/components/ui/button";
import { TeamBadge } from "@/components/team-badge";
import { teamName, type Player } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

const metrics = ["goals", "assists", "ga", "potm", "appearances", "marketValue", "jerseyNumber", "penaltyGoals", "penaltiesMissed", "penaltiesEarned", "penaltyConversion", "yellowCards", "redCards"] as const;
type Metric = (typeof metrics)[number];
type Search = { metric: Metric };

const metricLabel: Record<Metric, string> = {
  goals: "Goals",
  assists: "Assists",
  ga: "Total G/A",
  potm: "Total POTM",
  appearances: "Appearances",
  marketValue: "Market Value",
  jerseyNumber: "Jersey Number",
  penaltyGoals: "Penalty Goals",
  penaltiesMissed: "Penalties Missed",
  penaltiesEarned: "Penalties Earned",
  penaltyConversion: "Penalty Conversion",
  yellowCards: "Yellow Cards",
  redCards: "Red Cards",
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
        content: "BFL player profiles, appearances, goals, assists, penalties, cards and Player of the Match awards.",
      },
      { property: "og:title", content: "BFL Player Stats" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

  const { players } = useLeague();

  const value = (p: Player) => (metric === "marketValue" ? 0 : metric === "ga" ? p.goals + p.assists : p[metric] ?? -1);
  const displayValue = (p: Player) => metric === "penaltyConversion" ? (p.penaltyConversion === null ? "—" : `${Number(p.penaltyConversion.toFixed(1))}%`) : metric === "ga" ? p.goals + p.assists : p[metric] ?? "—";

  const rows = [...players]
    .sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name))
    .map((p, i) => ({ ...p, pos: i + 1 }));

  return (
    <AppShell title="Player Stats">
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
                <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-accent active:bg-accent/70">
                  <td className="num px-4 py-3 text-muted-foreground">{p.pos}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setSelected(p.slug)}
                      className="h-auto justify-start px-0 font-semibold hover:bg-transparent hover:text-primary"
                      aria-label={`Open profile for ${p.name}${p.captain ? ", captain" : ""}`}
                    >
                      {p.name}
                      {p.captain && (
                        <span className="num rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          C
                        </span>
                      )}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link
                      to="/teams/$teamSlug/squad"
                      params={{ teamSlug: p.teamSlug }}
                      className="inline-flex hover:opacity-80"
                      aria-label={teamName(p.teamSlug)}
                    >
                      <TeamBadge slug={p.teamSlug} />
                    </Link>
                  </td>
                  <td className="num px-3 py-3 text-right font-bold">
                    {displayValue(p)}
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
