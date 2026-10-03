import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { useSeason } from "@/components/season-context";
import { PositionLegend, Season1Knockouts, Season1Table } from "@/components/season1-views";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/teams/$teamSlug/table")({
  component: TeamTable,
});

function TeamTable() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { season } = useSeason();
  const [compact, setCompact] = useState(false);
  const controls = <div className="mb-3 flex justify-end gap-2"><Button size="sm" variant={!compact ? "default" : "outline"} onClick={() => setCompact(false)}>Full</Button><Button size="sm" variant={compact ? "default" : "outline"} onClick={() => setCompact(true)}>Compact</Button></div>;

  if (season === "1") {
    return (
      <>
        {controls}
        <Card title="Season 1 table">
          <Season1Table highlight={teamSlug} compact={compact} />
        </Card>
        <PositionLegend />
        <Season1Knockouts />
      </>
    );
  }

  return <>{controls}<Card title={compact ? "Compact table" : "Full table"}><StandingsTable highlight={teamSlug} compact={compact} /></Card></>;
}
