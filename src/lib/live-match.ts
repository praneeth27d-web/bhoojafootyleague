import type { Match } from "./league";

export const HALF_MINUTES = 10;

/** Live score from recorded goals: own goals count for the opposing side. */
export function liveScore(match: Pick<Match, "goals" | "lineups" | "homeSlug" | "awaySlug">) {
  let home = 0;
  let away = 0;
  for (const g of match.goals) {
    const side =
      match.lineups.find((l) => l.playerId === g.scorerId)?.side ??
      (g.scorerTeamSlug === match.awaySlug ? "away" : "home");
    const forHome = g.isOwnGoal ? side === "away" : side === "home";
    if (forHome) home++;
    else away++;
  }
  return { home, away };
}

/** Elapsed match seconds (first half counts from 0, second half from 10:00). */
export function liveSeconds(
  period: Match["livePeriod"],
  startedAt: string | null,
  now: number,
): number {
  if (period === "half_time") return HALF_MINUTES * 60;
  if (period === "full_time") return HALF_MINUTES * 2 * 60;
  const base = period === "second" ? HALF_MINUTES * 60 : 0;
  if (!startedAt) return base;
  return base + Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Minute shown on events, e.g. 7 or "10+2". */
export function eventMinute(period: Match["livePeriod"], seconds: number): number {
  return Math.floor(seconds / 60) + 1;
}

export function periodLabel(period: Match["livePeriod"]) {
  return period === "first" ? "1st half" : period === "second" ? "2nd half" : period === "half_time" ? "Half time" : "Full time";
}
