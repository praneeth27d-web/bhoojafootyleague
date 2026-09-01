import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { MatchRows, StandingsTable } from "@/components/league-tables";
import { completedMatches, topScorers, upcomingMatches } from "@/lib/league";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bhooja Football League — Standings, Fixtures & Stats" },
      {
        name: "description",
        content:
          "Live BFL dashboard: five-team standings calculated from results, upcoming fixtures, top scorers and player stats.",
      },
      { property: "og:title", content: "Bhooja Football League" },
      {
        property: "og:description",
        content: "Standings, fixtures, results and player stats for the Bhooja Football League.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const scorers = topScorers().slice(0, 6);
  const recent = [...completedMatches].reverse().slice(0, 4);

  return (
    <AppShell title="League Overview" subtitle="Season 2026 · Single round-robin">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card
            title="Standings"
            action={
              <Link to="/table" className="text-xs font-semibold text-primary hover:underline">
                Full table
              </Link>
            }
          >
            <StandingsTable />
          </Card>
          <Card
            title="Next fixtures"
            action={
              <Link to="/fixtures-results" className="text-xs font-semibold text-primary hover:underline">
                All fixtures
              </Link>
            }
          >
            <MatchRows matches={upcomingMatches.slice(0, 3)} />
          </Card>
        </div>
        <div className="space-y-5">
          <Card
            title="Top scorers"
            action={
              <Link to="/stats" search={{ sort: "ga", dir: "desc" }} className="text-xs font-semibold text-primary hover:underline">
                All stats
              </Link>
            }
          >
            <ul className="divide-y divide-border">
              {scorers.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    to="/players/$playerSlug"
                    params={{ playerSlug: p.slug }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent"
                  >
                    <span className="num w-5 text-xs text-muted-foreground">{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold">{p.name}</span>
                    <span className="num text-sm">{p.goals}G</span>
                    <span className="num text-sm text-muted-foreground">{p.assists}A</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Recent results">
            <MatchRows matches={recent} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
