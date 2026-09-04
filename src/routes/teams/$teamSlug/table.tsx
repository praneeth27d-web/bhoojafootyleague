import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";

export const Route = createFileRoute("/teams/$teamSlug/table")({
  component: TeamTable,
});

function TeamTable() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  return (
    <Card title="Full table">
      <StandingsTable highlight={teamSlug} />
    </Card>
  );
}
