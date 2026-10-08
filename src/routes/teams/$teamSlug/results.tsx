import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { MatchRows } from "@/components/league-tables";
import { useLeague } from "@/lib/league-data";
import { TeamForm } from "@/components/team-form";
import { completedTeamMatches } from "@/lib/team-form";
import { getTeam } from "@/lib/league";

export const Route = createFileRoute("/teams/$teamSlug/results")({
  head: ({ params }) => {
    const name = getTeam(params.teamSlug)?.name ?? "Team";
    const title = `${name} Results & Form — Bhooja Football League`;
    const description = `${name}'s latest results and recent form in the Bhooja Football League.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: TeamResults,
});

function TeamResults() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { teamMatches, knockouts } = useLeague();
  const results = completedTeamMatches([...teamMatches(teamSlug), ...knockouts], teamSlug);
  return (
    <>
    <TeamForm teamSlug={teamSlug} />
    <Card title="Results">
      <MatchRows matches={results} />
    </Card>
    </>
  );
}
