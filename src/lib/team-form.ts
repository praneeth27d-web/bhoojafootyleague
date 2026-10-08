import type { Match } from "@/lib/league";

export function completedTeamMatches(matches: Match[], teamSlug: string) {
  return matches
    .filter((match) =>
      match.status === "completed" &&
      (match.homeSlug === teamSlug || match.awaySlug === teamSlug) &&
      match.homeGoals != null && match.awayGoals != null,
    )
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id.localeCompare(a.id));
}

export function teamResult(match: Match, teamSlug: string): "W" | "D" | "L" {
  const home = match.homeGoals ?? 0;
  const away = match.awayGoals ?? 0;
  const difference = match.homeSlug === teamSlug ? home - away : away - home;
  return difference > 0 ? "W" : difference < 0 ? "L" : "D";
}