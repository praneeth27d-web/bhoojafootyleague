import { Link } from "@tanstack/react-router";
import type { Match } from "@/lib/league";
import { completedTeamMatches, teamResult, teamResultStyles } from "@/lib/team-form";
import { cn } from "@/lib/utils";

export function TableForm({ matches, teamSlug }: { matches: Match[]; teamSlug: string }) {
  const recent = completedTeamMatches(matches, teamSlug).slice(0, 5).reverse();
  return (
    <div className="flex min-w-36 items-center justify-end gap-1.5" aria-label="Last five matches">
      {recent.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : recent.map((match, index) => {
        const result = teamResult(match, teamSlug);
        return (
          <Link key={match.id} to="/matches/$matchId" params={{ matchId: match.id }}
            title={`${teamResultStyles[result].label}: ${match.homeGoals}–${match.awayGoals}`}
            aria-label={`${teamResultStyles[result].label}: ${match.homeGoals}–${match.awayGoals}${index === recent.length - 1 ? ", latest match" : ""}`}
            className={cn("num relative flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold transition-opacity hover:opacity-80", teamResultStyles[result].classes)}>
            {result}
            {index === recent.length - 1 && <span aria-hidden="true" className="absolute -bottom-1 left-1 right-1 h-0.5 rounded bg-current" />}
          </Link>
        );
      })}
    </div>
  );
}