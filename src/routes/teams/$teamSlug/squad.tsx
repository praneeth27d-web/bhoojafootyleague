import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { PlayerRows } from "@/components/league-tables";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/teams/$teamSlug/squad")({
  component: TeamSquad,
});

function TeamSquad() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { squad, loading } = useLeague();
  const list = squad(teamSlug);
  return (
    <Card title="Squad">
      {loading && list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading squad…</p>
      ) : (
        <PlayerRows players={list} showTeam={false} />
      )}
    </Card>
  );
}
