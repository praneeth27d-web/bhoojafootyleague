import { Link } from "@tanstack/react-router";
import { CircleDot, Flag, Goal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/team-badge";
import { teamName, type Match } from "@/lib/league";
import { useLeague } from "@/lib/league-data";
import { matchTimeline, type TimelineEvent } from "@/lib/match-timeline";

function EventIcon({ kind }: { kind: TimelineEvent["kind"] }) {
  if (kind === "yellow" || kind === "red" || kind === "second_yellow_red") {
    return <span className="relative flex h-5 w-5 shrink-0" aria-hidden="true">
      {kind === "second_yellow_red" && <span className="absolute left-0 top-0 h-4 w-2.5 -rotate-6 rounded-[2px] bg-pos-mid" />}
      <span className={`absolute right-0 top-0 h-4 w-2.5 rounded-[2px] ${kind === "yellow" ? "bg-pos-mid" : "bg-pos-low"} ${kind === "second_yellow_red" ? "rotate-6" : ""}`} />
    </span>;
  }
  const Icon = kind === "goal" ? Goal : kind === "own_goal" ? ShieldAlert : kind === "earned" ? Flag : CircleDot;
  return <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />;
}

export function MatchTimeline({ match }: { match: Match }) {
  const { getPlayerById } = useLeague();
  const events = matchTimeline(match);
  function playerLink(id: string, name: string) {
    const player = getPlayerById(id);
    if (!player) return <span className="font-semibold">{name}</span>;
    return <Button asChild variant="link" className="h-auto max-w-full whitespace-normal p-0 text-left text-sm text-foreground"><Link to="/players/$playerSlug" params={{ playerSlug: player.slug }}>{name}</Link></Button>;
  }
  return <section aria-label="Match timeline">
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-3">
      {[match.homeSlug, match.awaySlug].map((slug) => <span key={slug} className="flex min-w-0 items-center gap-2 text-xs font-bold"><TeamCrest slug={slug} className="size-6 shrink-0" /><span>{teamName(slug)}</span></span>)}
    </div>
    <p className="mb-4 text-center text-xs font-bold uppercase text-muted-foreground">Kick-off</p>
    {events.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No match events recorded.</p>}
    <ol className="space-y-1">
      {events.map((event) => <li key={event.id} className="grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-2 py-3">
        <span className="num col-start-2 row-start-1 flex min-h-8 items-center justify-center rounded-full border border-border bg-surface-muted text-xs font-bold" aria-label={event.minute === null ? "Time not recorded" : `Minute ${event.minute}`}>{event.minute === null ? "–" : `${event.minute}′`}</span>
        <div className={`row-start-1 flex min-w-0 items-start gap-2 ${event.side === "home" ? "col-start-1 flex-row-reverse text-right" : "col-start-3"}`}>
          <EventIcon kind={event.kind} />
          <div className="min-w-0 break-words text-sm">
            {playerLink(event.playerId, event.playerName)}
            <p className="mt-0.5 text-xs text-muted-foreground">{event.label}</p>
            {event.assistId && event.assistName && <div className="mt-1 text-xs text-muted-foreground">Assist · {playerLink(event.assistId, event.assistName)}</div>}
          </div>
        </div>
      </li>)}
    </ol>
    <p className="mt-4 border-t border-border pt-4 text-center text-xs font-bold uppercase text-muted-foreground">Full time · {match.homeGoals ?? 0}–{match.awayGoals ?? 0}</p>
  </section>;
}