import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/app-shell";
import { PlayerRows } from "@/components/league-tables";
import { PlayerSheet } from "@/components/player-sheet";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/teams/$teamSlug/squad")({
  component: TeamSquad,
});

function TeamSquad() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { squad, loading } = useLeague();
  const list = squad(teamSlug);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Card title="Squad">
      {loading && list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading squad…</p>
      ) : (
        <PlayerRows players={list} onSelect={setSelected} showTeam={false} />
      )}
      <PlayerSheet slug={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
