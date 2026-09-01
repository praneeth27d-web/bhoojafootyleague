import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { MatchRows } from "@/components/league-tables";
import { teamMatches } from "@/lib/league";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamSlug/results")({
  component: TeamResults,
});

function TeamResults() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const results = teamMatches(teamSlug)
    .filter((m) => m.status === "completed")
    .reverse();
  return (
    <Card title="Results">
      <MatchRows matches={results} />
    </Card>
  );
}
