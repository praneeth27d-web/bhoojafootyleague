import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { StandingsTable } from "@/components/league-tables";
import { useSeason } from "@/components/season-context";
import { PositionLegend, Season1Knockouts, Season1Table } from "@/components/season1-views";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TeamForm } from "@/components/team-form";
import { getTeam } from "@/lib/league";

export const Route = createFileRoute("/teams/$teamSlug/table")({
  head: ({ params }) => {
    const name = getTeam(params.teamSlug)?.name ?? "Team";
    const title = `${name} Table & Form — Bhooja Football League`;
    const description = `${name}'s recent form and league standings in the Bhooja Football League.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: TeamTable,
});

function TeamTable() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { season } = useSeason();
  const [compact, setCompact] = useState(true);
  const controls = <div className="mb-3 flex justify-end gap-2"><Button size="sm" variant={!compact ? "default" : "outline"} onClick={() => setCompact(false)}>Full</Button><Button size="sm" variant={compact ? "default" : "outline"} onClick={() => setCompact(true)}>Compact</Button></div>;

  if (season === "1") {
    return (
      <>
        <TeamForm teamSlug={teamSlug} />
        {controls}
        <Card title="Season 1 table">
          <Season1Table highlight={teamSlug} compact={compact} />
        </Card>
        <PositionLegend />
        <Season1Knockouts />
      </>
    );
  }

  return <><TeamForm teamSlug={teamSlug} />{controls}<Card title={compact ? "Compact table" : "Full table"}><StandingsTable highlight={teamSlug} compact={compact} /></Card></>;
}
