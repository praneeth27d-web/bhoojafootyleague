import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";

export const Route = createFileRoute("/teams/$teamSlug/table")({
  component: TeamTable,
});

function TeamTable() {
  return (
    <Card>
      <StandingsTable />
    </Card>
  );
}
