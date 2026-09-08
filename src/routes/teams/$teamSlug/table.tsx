import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { useSeason } from "@/components/season-context";
import { PositionLegend, Season1Knockouts, Season1Table } from "@/components/season1-views";

export const Route = createFileRoute("/teams/$teamSlug/table")({
  component: TeamTable,
});

function TeamTable() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { season } = useSeason();

  if (season === "1") {
    return (
      <>
        <Card title="Season 1 table">
          <Season1Table highlight={teamSlug} />
        </Card>
        <PositionLegend />
        <Season1Knockouts />
      </>
    );
  }

  return (
    <Card title="Full table">
      <StandingsTable highlight={teamSlug} />
    </Card>
  );
}
