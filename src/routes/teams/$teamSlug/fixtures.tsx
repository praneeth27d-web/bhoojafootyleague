import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { MatchRows } from "@/components/league-tables";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/teams/$teamSlug/fixtures")({
  component: TeamFixtures,
});

function TeamFixtures() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { teamMatches } = useLeague();
  const fixtures = teamMatches(teamSlug).filter((m) => m.status === "upcoming");
  return (
    <Card title="Upcoming fixtures">
      <MatchRows matches={fixtures} />
    </Card>
  );
}
