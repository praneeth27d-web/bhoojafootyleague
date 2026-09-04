import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";


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
  return (
    <AppShell title="League Table" subtitle="Sorted by Pts, GD, GF">
      <Card>
        <StandingsTable />
      </Card>
    </AppShell>
  );
}

