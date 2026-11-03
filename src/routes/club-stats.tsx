import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { computeStandings, teams } from "@/lib/league";
import { useLeague } from "@/lib/league-data";
import { formatCr, marketValueAmount } from "@/lib/market-value";
import { useSeasons } from "@/lib/seasons";

export const Route = createFileRoute("/club-stats")({
  head: () => ({
    meta: [
      { title: "Club Stats — Bhooja Football League" },
      {
        name: "description",
        content: "Squad values, goals, season finishes and total points for every BFL club.",
      },
      { property: "og:title", content: "BFL Club Stats" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Total market value, goals, season finishes and total points for every BFL club.",
      },
    ],
  }),
  component: ClubStatsPage,
});

const selectClass =
  "appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus-visible:outline-none";

type Row = {
  slug: string;
  totalValue: number;
  averageValue: number;
  superValue: number;
  goals: number;
  goalsConceded: number;
  gold: number;
  silver: number;
  bronze: number;
  points: number;
};

function ClubStatsPage() {
  const { seasons } = useSeasons();
  const { allMatches, players, loading } = useLeague("all");
  const [scope, setScope] = useState<"all" | number>("all");

  // Season 1 data is inaccurate and deliberately excluded; future seasons appear automatically.
  const seasonNumbers = useMemo(() => {
    const set = new Set<number>(seasons.map((s) => s.number));
    for (const m of allMatches) set.add(m.season);
    return [...set].filter((n) => n >= 2).sort((a, b) => b - a);
  }, [seasons, allMatches]);

  const rows = useMemo<Row[]>(() => {
    const inScope =
      scope === "all" ? allMatches.filter((m) => m.season >= 2) : allMatches.filter((m) => m.season === scope);
    const league = inScope.filter((m) => !m.round);
    const standings = computeStandings(league);

    // Medals count seasons whose league fixtures are all completed.
    const medals = new Map(teams.map((t) => [t.slug, { gold: 0, silver: 0, bronze: 0 }]));
    for (const season of new Set(league.map((m) => m.season))) {
      const seasonMatches = league.filter((m) => m.season === season);
      if (seasonMatches.length === 0 || !seasonMatches.every((m) => m.status === "completed")) continue;
      for (const r of computeStandings(seasonMatches)) {
        const medal = medals.get(r.team.slug);
        if (!medal) continue;
        if (r.pos === 1) medal.gold++;
        else if (r.pos === 2) medal.silver++;
        else if (r.pos === 3) medal.bronze++;
      }
    }

    return teams.map((t) => {
      const squad = players.filter((p) => p.teamSlug === t.slug);
      const total = squad.reduce((sum, p) => sum + Math.max(0, marketValueAmount(p.marketValue)), 0);
      const row = standings.find((r) => r.team.slug === t.slug);
      const medal = medals.get(t.slug) ?? { gold: 0, silver: 0, bronze: 0 };
      return {
        slug: t.slug,
        totalValue: total,
        averageValue: squad.length > 0 ? total / squad.length : 0,
        superValue: total / 5,
        goals: row?.gf ?? 0,
        goalsConceded: row?.ga ?? 0,
        gold: medal.gold,
        silver: medal.silver,
        bronze: medal.bronze,
        points: row?.points ?? 0,
      };
    }).sort((a, b) => b.points - a.points || b.gold - a.gold || a.slug.localeCompare(b.slug));
  }, [allMatches, players, scope]);

  return (
    <AppShell
      title="Club Stats"
      subtitle="Squad values, goals, season finishes and points. Season 1 is not included."
    >
      <Card
        title="Clubs"
        action={
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            Season
            <select
              className={selectClass}
              value={String(scope)}
              aria-label="Choose season"
              onChange={(e) => setScope(e.target.value === "all" ? "all" : Number(e.target.value))}
            >
              <option value="all">All seasons</option>
              {seasonNumbers.map((n) => (
                <option key={n} value={String(n)}>
                  Season {n}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading club stats…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <caption className="sr-only">Club statistics by season</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-2 font-semibold">Club</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Total Market Value</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Average Value</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Super Value</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Goals</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Goals Conceded</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Gold</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Silver</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Bronze</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug} className="border-b border-border last:border-0 hover:bg-accent">
                    <td className="px-4 py-3">
                      <Link
                        to="/teams/$teamSlug/table"
                        params={{ teamSlug: r.slug }}
                        className="inline-flex hover:opacity-80"
                        aria-label={`Open the ${r.slug} club page`}
                      >
                        <TeamBadge slug={r.slug} showName crestClassName="size-7" />
                      </Link>
                    </td>
                    <td className="num px-3 py-3 text-right">{formatCr(r.totalValue)}</td>
                    <td className="num px-3 py-3 text-right text-muted-foreground">{formatCr(r.averageValue)}</td>
                    <td className="num px-3 py-3 text-right text-muted-foreground">{formatCr(r.superValue)}</td>
                    <td className="num px-3 py-3 text-right">{r.goals}</td>
                    <td className="num px-3 py-3 text-right">{r.goalsConceded}</td>
                    <td className="num px-3 py-3 text-right">{r.gold}</td>
                    <td className="num px-3 py-3 text-right">{r.silver}</td>
                    <td className="num px-3 py-3 text-right">{r.bronze}</td>
                    <td className="num px-4 py-3 text-right font-bold">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Gold, silver and bronze count finished seasons ending 1st, 2nd and 3rd. Super Value is the total
          squad value divided by five.
        </p>
      </Card>
    </AppShell>
  );
}
