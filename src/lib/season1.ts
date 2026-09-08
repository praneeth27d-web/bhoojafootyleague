// Season 1 archive. Squads are identical to Season 2; only the results differ.
// AC Milan competed as Manchester City in Season 1.

export const season1Names: Record<string, string> = {
  "ac-milan": "Manchester City",
};

export const season1Name = (slug: string) => season1Names[slug];

export type Season1Row = {
  pos: number;
  slug: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  points: number;
};

export const season1Table: Season1Row[] = [
  { pos: 1, slug: "chelsea", played: 4, won: 4, drawn: 0, lost: 0, gd: 16, points: 12 },
  { pos: 2, slug: "real-madrid", played: 4, won: 3, drawn: 0, lost: 1, gd: 21, points: 9 },
  { pos: 3, slug: "juventus", played: 4, won: 2, drawn: 0, lost: 2, gd: 9, points: 6 },
  { pos: 4, slug: "ac-milan", played: 4, won: 0, drawn: 1, lost: 3, gd: -9, points: 1 },
  { pos: 5, slug: "arsenal", played: 4, won: 0, drawn: 1, lost: 3, gd: -30, points: 1 },
];

/** Playoff outcome for a club in Season 1. `final` comes from the live database. */
export function season1Playoff(
  slug: string,
  final?: { homeSlug: string; awaySlug: string; homeGoals?: number | null; awayGoals?: number | null } | null,
): string {
  const row = season1Table.find((r) => r.slug === slug);
  if (!row) return "—";
  if (row.pos >= 4) return `${row.pos}th`;
  if (slug === "juventus") return "Bronze";
  if (
    !final ||
    final.homeGoals === null ||
    final.homeGoals === undefined ||
    final.awayGoals === null ||
    final.awayGoals === undefined
  ) {
    return "Final — result pending";
  }
  const winner = final.homeGoals > final.awayGoals ? final.homeSlug : final.awaySlug;
  return slug === winner ? "Champion" : "Silver";
}


export function season1LeagueFinish(slug: string): string {
  const row = season1Table.find((r) => r.slug === slug);
  if (!row) return "—";
  const suffix = row.pos === 1 ? "st" : row.pos === 2 ? "nd" : row.pos === 3 ? "rd" : "th";
  return `${row.pos}${suffix} · ${row.points} pts`;
}
