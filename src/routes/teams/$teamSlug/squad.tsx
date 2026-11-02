import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { PlayerRows } from "@/components/league-tables";
import { useLeague } from "@/lib/league-data";
import { formatCr, squadValueStats } from "@/lib/market-value";

export const Route = createFileRoute("/teams/$teamSlug/squad")({
  component: TeamSquad,
});

function TeamSquad() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { squad, loading } = useLeague();
  const list = squad(teamSlug);
  const values = squadValueStats(list);
  return (
    <Card title="Squad">
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
        <div className="px-2 py-3">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Total Value</span>
          <span className="num text-sm font-extrabold">{formatCr(values.total)}</span>
        </div>
        <div className="px-2 py-3">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Average Value</span>
          <span className="num text-sm font-extrabold">{formatCr(values.average)}</span>
        </div>
        <div className="px-2 py-3">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Super Average</span>
          <span className="num text-sm font-extrabold">{formatCr(values.superAverage)}</span>
        </div>
      </div>
      {loading && list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading squad…</p>
      ) : (
        <PlayerRows players={list} showTeam={false} />
      )}
    </Card>
  );
}
