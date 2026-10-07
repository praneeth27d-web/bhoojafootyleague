import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamBadge } from "@/components/team-badge";
import type { Player } from "@/lib/league";

export function PlayerDetails({ player }: { player: Player }) {
  const [expanded, setExpanded] = useState(false);
  const stats = [
    { label: "Team", value: <TeamBadge slug={player.teamSlug} className="justify-end" /> },
    { label: "Position", value: player.position || "Not set" },
    { label: "Market Value", value: player.marketValue || "Not set" },
    { label: "Preferred Foot", value: player.preferredFoot ? player.preferredFoot.charAt(0).toUpperCase() + player.preferredFoot.slice(1) : "Not set" },
    { label: "Appearances", value: player.appearances },
    ...(expanded ? [{ label: "Goals", value: player.goals }, { label: "Assists", value: player.assists }] : []),
    { label: "Total G/A", value: player.goals + player.assists },
    ...(expanded ? [
      { label: "Total POTM", value: player.potm },
      { label: "Jersey Number", value: player.jerseyNumber ?? "Not set" },
      { label: "Penalty Goals", value: player.penaltyGoals },
      { label: "Penalties Missed", value: player.penaltiesMissed },
      { label: "Penalties Earned", value: player.penaltiesEarned },
      { label: "Penalty Conversion", value: player.penaltyConversion === null ? "—" : `${Number(player.penaltyConversion.toFixed(1))}%` },
      { label: "Yellow Cards", value: player.yellowCards },
      { label: "Red Cards", value: player.redCards },
    ] : []),
  ];
  return <div>
    <dl id={`player-details-${player.slug}`} className="divide-y divide-border">
      {stats.map((stat) => <div key={stat.label} className="flex items-center justify-between gap-4 py-3 text-sm">
        <dt className="shrink-0 text-muted-foreground">{stat.label}</dt>
        <dd className="min-w-0 break-words text-right font-semibold">{stat.value}</dd>
      </div>)}
    </dl>
    <Button type="button" variant="outline" className="mt-4 h-auto w-full whitespace-normal py-2" aria-expanded={expanded} aria-controls={`player-details-${player.slug}`} onClick={() => setExpanded(!expanded)}>
      {expanded ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
      {expanded ? "View fewer stats" : "View more detailed stats"}
    </Button>
  </div>;
}