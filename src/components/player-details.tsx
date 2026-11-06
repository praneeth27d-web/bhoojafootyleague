import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamBadge } from "@/components/team-badge";
import type { Player } from "@/lib/league";

type StatValue = string | number | React.ReactNode;

function StatRow({ label, value }: { label: string; value: StatValue }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold">{value}</dd>
    </div>
  );
}

function StatSection({ title, rows }: { title: string; rows: { label: string; value: StatValue }[] }) {
  return (
    <section>
      <h3 className="pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-primary">{title}</h3>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
    </section>
  );
}

export function PlayerDetails({ player }: { player: Player }) {
  const [expanded, setExpanded] = useState(false);
  const teamValue = <TeamBadge slug={player.teamSlug} className="justify-end" />;
  const conversion =
    player.penaltyConversion === null ? "—" : `${Number(player.penaltyConversion.toFixed(1))}%`;

  const basic = [
    { label: "Team", value: teamValue },
    { label: "Position", value: player.position || "Not set" },
    { label: "Market Value", value: player.marketValue || "Not set" },
    { label: "Preferred Foot", value: player.preferredFoot ? player.preferredFoot.charAt(0).toUpperCase() + player.preferredFoot.slice(1) : "Not set" },
    { label: "Appearances", value: player.appearances },
    { label: "Total G/A", value: player.goals + player.assists },
  ];

  const sections = [
    {
      title: "Player Information",
      rows: [
        { label: "Team", value: teamValue },
        { label: "Position", value: player.position || "Not set" },
        { label: "Market Value", value: player.marketValue || "Not set" },
        { label: "Preferred Foot", value: player.preferredFoot ? player.preferredFoot.charAt(0).toUpperCase() + player.preferredFoot.slice(1) : "Not set" },
        { label: "Jersey Number", value: player.jerseyNumber ?? "Not set" },
      ],
    },
    {
      title: "Performance",
      rows: [
        { label: "Appearances", value: player.appearances },
        { label: "Total POTM", value: player.potm },
      ],
    },
    {
      title: "Attacking",
      rows: [
        { label: "Goals", value: player.goals },
        { label: "Assists", value: player.assists },
        { label: "Total G/A", value: player.goals + player.assists },
      ],
    },
    {
      title: "Penalties",
      rows: [
        { label: "Penalty Goals", value: player.penaltyGoals },
        { label: "Penalties Missed", value: player.penaltiesMissed },
        { label: "Penalties Earned", value: player.penaltiesEarned },
        { label: "Penalty Conversion", value: conversion },
      ],
    },
    {
      title: "Discipline",
      rows: [
        { label: "Own Goals", value: player.ownGoals },
        { label: "Yellow Cards", value: player.yellowCards },
        { label: "Red Cards", value: player.redCards },
        { label: "Warnings", value: player.warnings },
        { label: "Matches Banned", value: player.matchesBanned },
      ],
    },
  ];

  return (
    <div>
      <dl id={`player-details-${player.slug}`} className="divide-y divide-border">
        {basic.map((stat) => (
          <StatRow key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </dl>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border">
          {sections.map((section) => (
            <StatSection key={section.title} title={section.title} rows={section.rows} />
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-auto w-full whitespace-normal py-2"
        aria-expanded={expanded}
        aria-controls={`player-details-${player.slug}`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
        {expanded ? "View fewer stats" : "View more detailed stats"}
      </Button>
    </div>
  );
}
