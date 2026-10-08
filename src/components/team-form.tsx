import { Link } from "@tanstack/react-router";
import { useLeague } from "@/lib/league-data";
import { formatShortDate, getTeam } from "@/lib/league";
import { completedTeamMatches, teamResult } from "@/lib/team-form";
import { cn } from "@/lib/utils";

const results = {
  W: { label: "Win", classes: "bg-pos-top text-event-ink" },
  D: { label: "Draw", classes: "bg-form-draw text-form-draw-foreground" },
  L: { label: "Loss", classes: "bg-destructive text-destructive-foreground" },
};

export function TeamForm({ teamSlug }: { teamSlug: string }) {
  const { teamMatches, knockouts, loading } = useLeague();
  const recent = completedTeamMatches([...teamMatches(teamSlug), ...knockouts], teamSlug).slice(0, 5);

  return (
    <section aria-label="Recent team form" className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">Form</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">{loading ? "Loading…" : "No completed matches"}</p>
      ) : (
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">Latest</span>
          {recent.map((match) => {
            const result = teamResult(match, teamSlug);
            const opponentSlug = match.homeSlug === teamSlug ? match.awaySlug : match.homeSlug;
            const description = `${results[result].label} · ${getTeam(opponentSlug)?.name ?? opponentSlug} · ${match.homeGoals}–${match.awayGoals} · ${formatShortDate(match.date)}`;
            return (
              <Link key={match.id} to="/matches/$matchId" params={{ matchId: match.id }}
                aria-label={description} title={description}
                className={cn("flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-opacity hover:opacity-80", results[result].classes)}>
                {result}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}