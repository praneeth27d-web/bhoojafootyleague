import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/app-shell";
import { PlayerRows } from "@/components/league-tables";
import { PlayerSheet } from "@/components/player-sheet";
import { squad } from "@/lib/league";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamSlug/squad")({
  component: TeamSquad,
});

function TeamSquad() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const list = squad(teamSlug);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Card title="Squad">
      <PlayerRows players={list} onSelect={setSelected} />
      <PlayerSheet slug={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
