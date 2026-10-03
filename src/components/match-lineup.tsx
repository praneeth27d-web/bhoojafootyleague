import { TeamCrest } from "@/components/team-badge";
import ownGoalIcon from "@/assets/own-goal.png";
import penaltyEarnedIcon from "@/assets/penalty-earned.png";
import penaltyMissedIcon from "@/assets/penalty-missed.png";
import { teamName, type Match, type MatchLineup } from "@/lib/league";

function Marker({ entry, match }: { entry: MatchLineup; match: Match }) {
  const goals = match.goals.filter((goal) => goal.scorerId === entry.playerId).length;
  const assists = match.goals.filter((goal) => goal.assistId === entry.playerId).length;
  return <div className="flex min-w-0 flex-col items-center text-center">
    <span className="num flex size-10 items-center justify-center rounded-full border-2 border-primary bg-surface text-sm font-black shadow-sm">{entry.jerseyNumber ?? "–"}</span>
    <span className="mt-1 max-w-24 truncate text-xs font-semibold">{entry.playerName}</span>
    {(goals > 0 || assists > 0) && <span className="num text-[10px] text-muted-foreground">{goals > 0 ? `⚽ ${goals}` : ""}{goals > 0 && assists > 0 ? " · " : ""}{assists > 0 ? `A ${assists}` : ""}</span>}
  </div>;
}

function Side({ side, match }: { side: "home" | "away"; match: Match }) {
  const starters = match.lineups.filter((entry) => entry.side === side && entry.role === "starter").sort((a,b) => a.positionIndex-b.positionIndex);
  const substitutes = match.lineups.filter((entry) => entry.side === side && entry.role === "substitute").sort((a,b) => a.positionIndex-b.positionIndex);
  const slug = side === "home" ? match.homeSlug : match.awaySlug;
  const formation = side === "home" ? match.homeFormation : match.awayFormation;
  return <section className="min-w-0">
    <div className="mb-3 flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-bold"><TeamCrest slug={slug} className="size-7" />{teamName(slug)}</span><span className="num text-xs text-muted-foreground">{formation}</span></div>
    <div className="grid min-h-72 grid-cols-2 content-around gap-5 rounded-md border border-primary/30 bg-primary/5 p-4 sm:grid-cols-3">{starters.map((entry) => <Marker key={entry.id} entry={entry} match={match} />)}{starters.length === 0 && <p className="col-span-full self-center text-center text-sm text-muted-foreground">Lineup not added yet.</p>}</div>
    <div className="mt-3"><h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Substitutes</h4><div className="flex flex-wrap gap-4">{substitutes.map((entry) => <Marker key={entry.id} entry={entry} match={match} />)}{substitutes.length === 0 && <span className="text-sm text-muted-foreground">No substitutes listed.</span>}</div></div>
  </section>;
}

export function MatchLineupView({ match }: { match: Match }) {
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-2"><Side side="home" match={match} /><Side side="away" match={match} /></div><MatchExtraEvents match={match} /></div>;
}

export function MatchExtraEvents({ match }: { match: Match }) {
  if (!match.cards.length && !match.penaltyEvents.length && !match.goals.some((goal) => goal.isOwnGoal)) return null;
  return <div className="border-t border-border pt-4"><h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Other events</h3><ul className="space-y-2 text-sm">{match.goals.filter((goal) => goal.isOwnGoal).map((goal) => <li key={goal.id} className="flex items-center gap-2"><img src={ownGoalIcon} alt="Own goal" className="size-5 object-contain" />{goal.scorerName} · own goal</li>)}{match.cards.map((event) => <li key={event.id} className="flex items-center gap-2"><span className={event.cardType === "yellow" ? "size-4 rounded-sm bg-pos-mid" : "size-4 rounded-sm bg-pos-low"} />{event.playerName} · {event.cardType === "second_yellow_red" ? "second yellow, red" : event.cardType === "red" ? "straight red" : "yellow card"}</li>)}{match.penaltyEvents.map((event) => <li key={event.id} className="flex items-center gap-2"><img src={event.eventType === "earned" ? penaltyEarnedIcon : penaltyMissedIcon} alt="" className="size-5 object-contain" />{event.playerName} · penalty {event.eventType}</li>)}</ul></div>;
}