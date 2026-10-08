import { Link } from "@tanstack/react-router";
import { useLeague } from "@/lib/league-data";
import { formatShortDate, getTeam } from "@/lib/league";
import { completedTeamMatches, teamResult, teamResultStyles } from "@/lib/team-form";
import { cn } from "@/lib/utils";
import { TeamCrest } from "@/components/team-badge";

export function TeamForm({ teamSlug }: { teamSlug: string }) {
  const { teamMatches, knockouts, loading } = useLeague();
  const recent = completedTeamMatches([...teamMatches(teamSlug), ...knockouts], teamSlug).slice(0, 5).reverse();

  return (
    <section aria-label="Recent team form" className="mb-5 border-b border-border pb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Team form</h2>
        {recent.length > 0 && <span className="text-xs text-muted-foreground">Latest →</span>}
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">{loading ? "Loading…" : "No completed matches"}</p>
      ) : (
        <div className="flex items-start justify-between gap-3 overflow-x-auto">
          {recent.map((match) => {
            const result = teamResult(match, teamSlug);
            const opponentSlug = match.homeSlug === teamSlug ? match.awaySlug : match.homeSlug;
            const description = `${teamResultStyles[result].label} · ${getTeam(opponentSlug)?.name ?? opponentSlug} · ${match.homeGoals}–${match.awayGoals} · ${formatShortDate(match.date)}`;
            return (
              <Link key={match.id} to="/matches/$matchId" params={{ matchId: match.id }}
                aria-label={description} title={description}
                className="flex shrink-0 flex-col items-center gap-2.5 transition-opacity hover:opacity-80">
                <span className={cn("num flex h-6 min-w-12 items-center justify-center rounded px-2 text-xs font-bold", teamResultStyles[result].classes)}>
                  {match.homeGoals}–{match.awayGoals}
                </span>
                <TeamCrest slug={opponentSlug} className="size-7" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}