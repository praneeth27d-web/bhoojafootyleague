import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { useSeason } from "@/components/season-context";
import { PositionLegend, Season1Knockouts, Season1Table } from "@/components/season1-views";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TablePage,
});

function TablePage() {
  const { season } = useSeason();
  const [compact, setCompact] = useState(true);

  const tableControls = (
    <div className="mb-3 flex justify-end gap-2">
      <Button size="sm" variant={!compact ? "default" : "outline"} onClick={() => setCompact(false)}>Full</Button>
      <Button size="sm" variant={compact ? "default" : "outline"} onClick={() => setCompact(true)}>Compact</Button>
    </div>
  );

  if (season === "1") {
    return (
      <AppShell title="League Table" subtitle="Season 1 — final positions and points">
        {tableControls}
        <Card>
          <Season1Table compact={compact} />
        </Card>
        <PositionLegend />
        <Season1Knockouts />
      </AppShell>
    );
  }

  return (
    <AppShell title="League Table" subtitle="Sorted by Pts, GD, GF">
      {tableControls}
      <Card>
        <StandingsTable compact={compact} />
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
