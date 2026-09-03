import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell, Card } from "@/components/app-shell";
import { standings, teamMatches } from "@/lib/league";
import { TeamBadge } from "@/components/team-badge";

export const Route = createFileRoute("/teams/")({
  head: () => ({
    meta: [
      { title: "Teams — Bhooja Football League" },
      {
        name: "description",
        content:
          "All five BFL clubs with their league position, points and links to fixtures, results and squads.",
      },
      { property: "og:title", content: "BFL Teams" },
      {
        property: "og:description",
        content: "Club pages with league position, fixtures, results and squads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const rows = standings();

  return (
    <AppShell title="Teams" subtitle="Club pages with position, fixtures, results and squad">
      <Card>
        <ul className="divide-y divide-border">
          {rows.map((r) => {
            const all = teamMatches(r.team.slug);
            const upcoming = all.filter((m) => m.status === "upcoming").length;
            return (
              <li key={r.team.slug}>
                <Link
                  to="/teams/$teamSlug/table"
                  params={{ teamSlug: r.team.slug }}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-accent"
                >
                  <span className="num flex size-8 items-center justify-center rounded-md bg-surface-muted text-sm font-bold">
                    {r.pos}
                  </span>
                  <span className="min-w-0 flex-1">
                    <TeamBadge
                      slug={r.team.slug}
                      showName
                      className="text-sm font-bold"
                      crestClassName="size-7"
                    />
                    <span className="block text-xs text-muted-foreground">
                      <span className="num">{r.points}</span> pts ·{" "}
                      <span className="num">{r.played}</span> played ·{" "}
                      <span className="num">{upcoming}</span> to play
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </AppShell>
  );
}
