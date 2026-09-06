import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { useSeason } from "@/components/season-context";
import { Season1Knockouts, Season1Table } from "@/components/season1-views";

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
  const { season } = useSeason();

  if (season === "1") {
    return (
      <AppShell title="League Table" subtitle="Season 1 — final positions and points">
        <Card>
          <Season1Table />
        </Card>
        <Season1Knockouts />
      </AppShell>
    );
  }

  return (
    <AppShell title="League Table" subtitle="Sorted by Pts, GD, GF">
      <Card>
        <StandingsTable />
      </Card>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="block h-4 w-1 rounded-r-sm bg-pos-top" />
          Green — Qualified
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="block h-4 w-1 rounded-r-sm bg-pos-mid" />
          Orange — Playoffs
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="block h-4 w-1 rounded-r-sm bg-pos-low" />
          Red — Disqualified
        </span>
      </div>
    </AppShell>
  );
}
