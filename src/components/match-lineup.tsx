import { TeamCrest } from "@/components/team-badge";
import assistBootLight from "@/assets/assist-boot-light.png";
import assistBootDark from "@/assets/assist-boot-dark.png";
import ownGoalIcon from "@/assets/own-goal.png";
import penaltyEarnedIcon from "@/assets/penalty-earned.png";
import penaltyMissedIcon from "@/assets/penalty-missed.png";
import { teamName, type Match, type MatchLineup } from "@/lib/league";

function Marker({ entry, match }: { entry: MatchLineup; match: Match }) {
  const goals = match.goals.filter((goal) => goal.scorerId === entry.playerId).length;
  const assists = match.goals.filter((goal) => goal.assistId === entry.playerId).length;
  const cards = match.cards.filter((card) => card.playerId === entry.playerId);
  const yellowCards = cards.filter((card) => card.cardType === "yellow").length;
  const redCards = cards.filter((card) => card.cardType === "red").length;
  const secondYellowReds = cards.filter((card) => card.cardType === "second_yellow_red").length;
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <span className="relative">
        <span className="num flex size-11 items-center justify-center rounded-full border-2 border-primary bg-surface text-sm font-black shadow-sm">
          {entry.jerseyNumber ?? "–"}
        </span>
        {goals > 0 && (
          <span
            className="num absolute -bottom-1.5 -left-2 flex min-h-5 min-w-5 items-center justify-center gap-0.5 rounded-full border border-border bg-surface px-1 text-[10px] font-black leading-none shadow-sm"
            aria-label={`${goals} ${goals === 1 ? "goal" : "goals"}`}
          >
            <span aria-hidden="true">⚽</span>{goals > 1 && <span>{goals}</span>}
          </span>
        )}
        {(yellowCards > 0 || redCards > 0 || secondYellowReds > 0) && (
          <span className="absolute -right-2 -top-1 flex items-start gap-0.5" aria-label={`${yellowCards} yellow, ${redCards} red, ${secondYellowReds} second-yellow red cards`}>
            {Array.from({ length: yellowCards }).map((_, index) => <span key={`yellow-${index}`} className="block h-4 w-2.5 rounded-[2px] border border-border bg-pos-mid shadow-sm" />)}
            {Array.from({ length: redCards }).map((_, index) => <span key={`red-${index}`} className="block h-4 w-2.5 rounded-[2px] border border-border bg-pos-low shadow-sm" />)}
            {Array.from({ length: secondYellowReds }).map((_, index) => (
              <span key={`second-yellow-${index}`} className="relative block h-4 w-4" title="Second yellow card, red card">
                <span className="absolute left-0 top-0 block h-4 w-2.5 -rotate-6 rounded-[2px] border border-border bg-pos-mid shadow-sm" />
                <span className="absolute right-0 top-0 block h-4 w-2.5 rotate-6 rounded-[2px] border border-border bg-pos-low shadow-sm" />
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="mt-1 max-w-24 truncate text-xs font-semibold">{entry.playerName}</span>
      {assists > 0 && (
        <span className="num mt-0.5 flex min-h-4 items-center justify-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-0.5" aria-label={`${assists} assists`}>
            <img src={assistBootLight} alt="" className="size-3.5 object-contain dark:hidden" />
            <img src={assistBootDark} alt="" className="hidden size-3.5 object-contain dark:block" />
            {assists}
          </span>
        </span>
      )}
    </div>
  );
}

function formationRows(formation: string, players: MatchLineup[]) {
  const counts = formation.match(/\d+/g)?.map(Number).filter((count) => count > 0) ?? [];
  const validCounts = counts.reduce((total, count) => total + count, 0) === 4 ? counts : [2, 2];
  let offset = 0;
  return validCounts.map((count) => {
    const row = players.slice(offset, offset + count);
    offset += count;
    return row;
  });
}

function PitchHalf({ side, match }: { side: "home" | "away"; match: Match }) {
  const starters = match.lineups
    .filter((entry) => entry.side === side && entry.role === "starter")
    .sort((a, b) => a.positionIndex - b.positionIndex)
    .slice(0, 5);
  const formation = side === "home" ? match.homeFormation : match.awayFormation;
  const goalkeeper = starters[0];
  const rows = formationRows(formation, starters.slice(1));

  const goalkeeperRow = (
    <div className="flex min-h-20 items-center justify-center">
      {goalkeeper && <Marker entry={goalkeeper} match={match} />}
    </div>
  );
  const outfieldRows = rows.map((row, index) => (
    <div key={`${side}-${index}`} className="flex min-h-20 items-center justify-evenly gap-2">
      {row.map((entry) => <Marker key={entry.id} entry={entry} match={match} />)}
    </div>
  ));

  if (starters.length === 0) {
    return <div className="flex min-h-72 items-center justify-center px-4 text-center text-sm text-muted-foreground">Lineup not added yet.</div>;
  }

  return (
    <div className="flex min-h-80 flex-col justify-evenly px-3 py-3">
      {side === "home" ? <>{goalkeeperRow}{outfieldRows}</> : <>{[...outfieldRows].reverse()}{goalkeeperRow}</>}
    </div>
  );
}

function TeamHeader({ side, match }: { side: "home" | "away"; match: Match }) {
  const slug = side === "home" ? match.homeSlug : match.awaySlug;
  const formation = side === "home" ? match.homeFormation : match.awayFormation;
  return (
    <div className="flex items-center justify-between gap-2 py-3">
      <span className="flex min-w-0 items-center gap-2 font-bold"><TeamCrest slug={slug} className="size-7" /><span className="truncate">{teamName(slug)}</span></span>
      <span className="num shrink-0 text-xs text-muted-foreground">{formation}</span>
    </div>
  );
}

function Substitutes({ side, match }: { side: "home" | "away"; match: Match }) {
  const substitutes = match.lineups
    .filter((entry) => entry.side === side && entry.role === "substitute")
    .sort((a, b) => a.positionIndex - b.positionIndex);
  const slug = side === "home" ? match.homeSlug : match.awaySlug;
  return (
    <section className="min-w-0">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><TeamCrest slug={slug} className="size-5" />{teamName(slug)} substitutes</h4>
      <div className="flex min-h-16 flex-wrap gap-4">
        {substitutes.map((entry) => <Marker key={entry.id} entry={entry} match={match} />)}
        {substitutes.length === 0 && <span className="text-sm text-muted-foreground">No substitutes listed.</span>}
      </div>
    </section>
  );
}

export function MatchLineupView({ match }: { match: Match }) {
  return (
    <div className="space-y-5">
      <div>
        <TeamHeader side="home" match={match} />
        <div className="relative overflow-hidden rounded-md border border-primary/40 bg-surface-muted">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-primary/30" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30" />
          <PitchHalf side="home" match={match} />
          <PitchHalf side="away" match={match} />
        </div>
        <TeamHeader side="away" match={match} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Substitutes side="home" match={match} />
        <Substitutes side="away" match={match} />
      </div>
      <MatchExtraEvents match={match} />
    </div>
  );
}

export function MatchExtraEvents({ match }: { match: Match }) {
  if (!match.cards.length && !match.penaltyEvents.length && !match.goals.some((goal) => goal.isOwnGoal)) return null;
  return <div className="border-t border-border pt-4"><h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Other events</h3><ul className="space-y-2 text-sm">{match.goals.filter((goal) => goal.isOwnGoal).map((goal) => <li key={goal.id} className="flex items-center gap-2"><img src={ownGoalIcon} alt="Own goal" className="size-5 object-contain" />{goal.scorerName} · own goal</li>)}{match.cards.map((event) => <li key={event.id} className="flex items-center gap-2"><span className={event.cardType === "yellow" ? "size-4 rounded-sm bg-pos-mid" : "size-4 rounded-sm bg-pos-low"} />{event.playerName} · {event.cardType === "second_yellow_red" ? "second yellow, red" : event.cardType === "red" ? "straight red" : "yellow card"}</li>)}{match.penaltyEvents.map((event) => <li key={event.id} className="flex items-center gap-2"><img src={event.eventType === "earned" ? penaltyEarnedIcon : penaltyMissedIcon} alt="" className="size-5 object-contain" />{event.playerName} · penalty {event.eventType}</li>)}</ul></div>;
}