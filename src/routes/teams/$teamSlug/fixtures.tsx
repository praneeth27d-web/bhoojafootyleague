import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { MatchRows } from "@/components/league-tables";
import { teamMatches } from "@/lib/league";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamSlug/fixtures")({
  component: TeamFixtures,
});

function TeamFixtures() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const fixtures = teamMatches(teamSlug).filter((m) => m.status === "upcoming");
  return (
    <Card title="Upcoming fixtures">
      <MatchRows matches={fixtures} />
    </Card>
  );
}
