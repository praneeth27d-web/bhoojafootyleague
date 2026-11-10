import type { Match, Player } from "@/lib/league";

export type AwardKey = "boot" | "playmaker" | "crown" | "tournament" | "glove" | "wall";
export type AwardEntry = { player: Player; value: number; label: string };

const DEFENSIVE = new Set(["CB", "LB", "RB", "CDM", "LWB", "RWB"]);

/** Clean sheets and goals conceded for matches a player actually played (replacement games excluded). */
export function defensiveRecord(playerId: string, matches: Match[], goalkeeperOnly: boolean) {
  let played = 0, conceded = 0, cleanSheets = 0;
  for (const m of matches) {
    if (m.status !== "completed") continue;
    const entry = m.lineups.find((l) => l.playerId === playerId && l.played && !l.isReplacement);
    if (!entry) continue;
    if (goalkeeperOnly && !(entry.role === "starter" && entry.positionIndex === 0)) continue;
    const against = (entry.side === "home" ? m.awayGoals : m.homeGoals) ?? 0;
    played += 1;
    conceded += against;
    if (against === 0) cleanSheets += 1;
  }
  return { played, conceded, cleanSheets, perGame: played ? conceded / played : 0 };
}

/** Player of the Tournament rating: POTM weighted 3, plus goals and assists. */
export const tournamentScore = (p: Player) => p.potm * 3 + p.goals + p.assists;

export function computeAwards(players: Player[], matches: Match[]): Record<AwardKey, AwardEntry[]> {
  const top = (list: AwardEntry[], cmp: (a: AwardEntry, b: AwardEntry) => number, keepTies = false) => {
    const sorted = list.sort((a, b) => cmp(a, b) || a.player.name.localeCompare(b.player.name));
    if (!keepTies || !sorted.length) return sorted.slice(0, 4);
    const leaders = sorted.filter((e) => e.value === sorted[0].value).length;
    return sorted.slice(0, leaders + 3);
  };
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  const boot = top(players.filter((p) => p.goals > 0).map((p) => ({ player: p, value: p.goals, label: plural(p.goals, "goal") })),
    (a, b) => b.value - a.value, true);
  const playmaker = top(players.filter((p) => p.assists > 0).map((p) => ({ player: p, value: p.assists, label: plural(p.assists, "assist") })),
    (a, b) => b.value - a.value, true);
  const crown = top(players.filter((p) => p.goals + p.assists > 0).map((p) => ({ player: p, value: p.goals + p.assists, label: `${p.goals + p.assists} G/A` })),
    (a, b) => b.value - a.value, true);
  const tournament = top(players.filter((p) => tournamentScore(p) > 0).map((p) => ({ player: p, value: tournamentScore(p), label: `${plural(p.potm, "POTM")} · ${p.goals + p.assists} G/A` })),
    (a, b) => b.value - a.value || b.player.potm - a.player.potm);

  const defensive = (keeper: boolean) => players
    .filter((p) => (keeper ? p.position === "GK" : DEFENSIVE.has((p.position ?? "").toUpperCase())))
    .map((p) => ({ p, r: defensiveRecord(p.id, matches, keeper) }))
    .filter(({ r }) => r.played > 0);
  const defLabel = (r: ReturnType<typeof defensiveRecord>) => `${plural(r.cleanSheets, "clean sheet")} · ${r.perGame.toFixed(2)} conceded/game`;
  const rankDef = (list: ReturnType<typeof defensive>) => list
    .sort((a, b) => b.r.cleanSheets - a.r.cleanSheets || a.r.perGame - b.r.perGame || b.r.played - a.r.played || a.p.name.localeCompare(b.p.name))
    .slice(0, 4)
    .map(({ p, r }) => ({ player: p, value: r.cleanSheets, label: defLabel(r) }));

  return { boot, playmaker, crown, tournament, glove: rankDef(defensive(true)), wall: rankDef(defensive(false)) };
}
