import { TeamCrest } from "@/components/team-badge";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import assistBootLight from "@/assets/assist-boot-light.png";
import assistBootDark from "@/assets/assist-boot-dark.png";
import ownGoalIcon from "@/assets/own-goal.png";
import penaltyEarnedIcon from "@/assets/penalty-earned.png";
import penaltyMissedIcon from "@/assets/penalty-missed.png";
import { teamName, type Match, type MatchLineup } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

function SpecialBadge({ count, label, icon, tone }: { count: number; label: string; icon: string; tone: "earned" | "missed" | "own" }) {
  if (!count) return null;
  const color = tone === "earned" ? "bg-event-earned" : tone === "missed" ? "bg-event-missed" : "bg-event-own";
  const earned = tone === "earned";
  return <span title={`${label}${count > 1 ? ` ×${count}` : ""}`} aria-label={`${count} ${label}`} className={`num flex shrink-0 items-center gap-1 rounded-sm border border-event-ink/30 text-[10px] font-black text-event-ink ${earned ? "min-h-8 px-1 py-0.5 shadow-sm" : "h-6 px-0.5"} ${color}`}>
    <span className={`flex items-center justify-center rounded-sm bg-event-icon-surface ${earned ? "size-6" : "size-4"}`}><img src={icon} alt="" className={`${earned ? "size-5" : "size-3.5"} object-contain`} /></span>
    {earned && <span className="w-9 whitespace-normal text-[9px] leading-tight">Penalty earned</span>}
    {count > 1 && <span>{count}</span>}
  </span>;
}

function Marker({ entry, match }: { entry: MatchLineup; match: Match }) {
  const goals = match.goals.filter((goal) => goal.scorerId === entry.playerId && !goal.isOwnGoal).length;
  const assists = match.goals.filter((goal) => goal.assistId === entry.playerId && !goal.isOwnGoal).length;
  const ownGoals = match.goals.filter((goal) => goal.scorerId === entry.playerId && goal.isOwnGoal).length;
  const penaltiesEarned = match.penaltyEvents.filter((event) => event.playerId === entry.playerId && event.eventType === "earned").length;
  const penaltiesMissed = match.penaltyEvents.filter((event) => event.playerId === entry.playerId && event.eventType === "missed").length;
  const cards = match.cards.filter((card) => card.playerId === entry.playerId);
  const yellowCards = cards.filter((card) => card.cardType === "yellow").length;
  const redCards = cards.filter((card) => card.cardType === "red").length;
  const secondYellowReds = cards.filter((card) => card.cardType === "second_yellow_red").length;
  return (
    <Button asChild variant="ghost" className="h-auto min-w-0 max-w-28 flex-1 flex-col gap-0 whitespace-normal px-1 py-2 text-center text-foreground">
    <Link to="/players/$playerSlug" params={{ playerSlug: entry.playerSlug }} aria-label={`View stats for ${entry.playerName}`}>
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
        {assists > 0 && (
          <span
            className="num absolute -bottom-1.5 -right-2 flex min-h-5 min-w-5 items-center justify-center gap-0.5 rounded-full border border-border bg-surface px-1 text-[10px] font-black leading-none shadow-sm"
            aria-label={`${assists} ${assists === 1 ? "assist" : "assists"}`}
          >
            <img src={assistBootLight} alt="" className="size-3.5 object-contain dark:hidden" />
            <img src={assistBootDark} alt="" className="hidden size-3.5 object-contain dark:block" />
            {assists > 1 && <span>{assists}</span>}
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
      <span className="mt-3 flex w-full min-w-0 items-center justify-center gap-1 text-xs font-semibold">
        {entry.captain && <span className="num flex size-3.5 shrink-0 items-center justify-center rounded-full bg-foreground text-[8px] font-black text-background" aria-label="Captain">C</span>}
        <span className="truncate">{entry.playerName}</span>
        {match.potmId === entry.playerId && <span className="shrink-0 text-primary" aria-label="Player of the match" title="Player of the match">★</span>}
      </span>
      {(ownGoals > 0 || penaltiesEarned > 0 || penaltiesMissed > 0) && <span className="mt-1 flex max-w-full flex-wrap justify-center gap-1">
        <SpecialBadge count={ownGoals} label="Own goal" icon={ownGoalIcon} tone="own" />
        <SpecialBadge count={penaltiesEarned} label="Penalty earned" icon={penaltyEarnedIcon} tone="earned" />
        <SpecialBadge count={penaltiesMissed} label="Penalty missed" icon={penaltyMissedIcon} tone="missed" />
      </span>}
    </Link>
    </Button>
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
    <div className="relative flex min-h-32 items-center justify-center">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 h-16 w-32 -translate-x-1/2 border-x-2 border-primary/25 ${side === "home" ? "top-0 rounded-b-md border-b-2" : "bottom-0 rounded-t-md border-t-2"}`}
      />
      {goalkeeper && <div className="relative z-10 flex w-28 justify-center"><Marker entry={goalkeeper} match={match} /></div>}
    </div>
  );
  const outfieldRows = rows.map((row, index) => (
    <div key={`${side}-${index}`} className="flex min-h-28 items-center justify-evenly gap-1">
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
  const { getPlayerById } = useLeague();
  const playerLink = (playerId: string | null, name: string | null) => {
    const player = playerId ? getPlayerById(playerId) : undefined;
    if (!player) return <span>{name ?? "Unknown"}</span>;
    return <Button asChild variant="link" className="h-auto min-w-0 whitespace-normal p-0 text-left text-sm text-foreground"><Link to="/players/$playerSlug" params={{ playerSlug: player.slug }} aria-label={`View stats for ${player.name}`}>{name ?? player.name}</Link></Button>;
  };
  const displayedPlayers = new Set(match.lineups.map((entry) => entry.playerId));
  const goals = match.goals.filter((goal) => !displayedPlayers.has(goal.scorerId));
  const cards = match.cards.filter((event) => !displayedPlayers.has(event.playerId));
  const penalties = match.penaltyEvents.filter((event) => !displayedPlayers.has(event.playerId));
  const assists = match.goals.filter((goal) => goal.assistId && !displayedPlayers.has(goal.assistId) && !goal.isOwnGoal);
  if (!goals.length && !cards.length && !penalties.length && !assists.length) return null;
  return <div className="border-t border-border pt-4"><h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Additional match events</h3><ul className="space-y-2 text-sm">
    {goals.map((goal) => <li key={goal.id} className="flex items-center gap-2">{goal.isOwnGoal ? <SpecialBadge count={1} label="Own goal" icon={ownGoalIcon} tone="own" /> : <span aria-label="Goal">⚽</span>}{playerLink(goal.scorerId, goal.scorerName)} · {goal.isOwnGoal ? "own goal" : "goal"}</li>)}
    {assists.map((goal) => <li key={`assist-${goal.id}`} className="flex items-center gap-2"><img src={assistBootLight} alt="Assist" className="size-5 object-contain dark:hidden" /><img src={assistBootDark} alt="Assist" className="hidden size-5 object-contain dark:block" />{playerLink(goal.assistId, goal.assistName)} · assist</li>)}
    {cards.map((event) => <li key={event.id} className="flex items-center gap-2"><span className="relative block h-5 w-5">{event.cardType === "second_yellow_red" && <span className="absolute left-0 top-0 h-5 w-3 -rotate-6 rounded-sm bg-pos-mid" />}<span className={`absolute right-0 top-0 h-5 w-3 rounded-sm ${event.cardType === "yellow" ? "bg-pos-mid" : "bg-pos-low"} ${event.cardType === "second_yellow_red" ? "rotate-6" : ""}`} /></span>{playerLink(event.playerId, event.playerName)} · {event.cardType === "second_yellow_red" ? "second yellow, red" : event.cardType === "red" ? "straight red" : "yellow card"}</li>)}
    {penalties.map((event) => <li key={event.id} className="flex items-center gap-2"><SpecialBadge count={1} label={`Penalty ${event.eventType}`} icon={event.eventType === "earned" ? penaltyEarnedIcon : penaltyMissedIcon} tone={event.eventType} />{playerLink(event.playerId, event.playerName)} · penalty {event.eventType}</li>)}
  </ul></div>;
}