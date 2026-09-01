import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell, Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { standings } from "@/lib/league";

export const Route = createFileRoute("/table")({
  head: () => ({
    meta: [
      { title: "League Table — Bhooja Football League" },
      {
        name: "description",
        content:
          "BFL standings calculated from completed results, sorted by points, goal difference and goals scored.",
      },
      { property: "og:title", content: "BFL League Table" },
      { property: "og:description", content: "Live BFL standings for all five teams." },
    ],
  }),
  component: TablePage,
});

function TablePage() {
  const rows = standings();
  return (
    <AppShell title="League Table" subtitle="5 matches played of 10 · sorted by Pts, GD, GF">
      <div className="space-y-5">
        <Card>
          <StandingsTable />
        </Card>
        <Card title="Teams">
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.team.slug}>
                <Link
                  to="/teams/$teamSlug/table"
                  params={{ teamSlug: r.team.slug }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent"
                >
                  <span className="num w-5 text-xs text-muted-foreground">{r.pos}</span>
                  <span className="flex-1 text-sm font-semibold">{r.team.name}</span>
                  <span className="num text-sm text-muted-foreground">{r.points} pts</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
