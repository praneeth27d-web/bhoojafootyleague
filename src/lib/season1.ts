// Season 1 archive. Squads are identical to Season 2; only the final standings differ.
// AC Milan competed as Manchester City in Season 1.

export const season1Names: Record<string, string> = {
  "ac-milan": "Manchester City",
};

export const season1Name = (slug: string) => season1Names[slug];

export type Season1Row = {
  pos: number;
  slug: string;
  points: number;
};

export const season1Table: Season1Row[] = [
  { pos: 1, slug: "chelsea", points: 12 },
  { pos: 2, slug: "real-madrid", points: 9 },
  { pos: 3, slug: "juventus", points: 6 },
  { pos: 4, slug: "ac-milan", points: 1 },
  { pos: 5, slug: "arsenal", points: 1 },
];

export const season1TableNote =
  "In the last league game Juventus beat Manchester City 14–11.";

export type Season1Knockout = {
  id: string;
  round: string;
  homeSlug: string;
  awaySlug: string;
  homeGoals?: number;
  awayGoals?: number;
  scorers?: Array<{ name: string; goals: number }>;
  note?: string;
};

export const season1Knockouts: Season1Knockout[] = [
  {
    id: "s1-semi-final",
    round: "Semi-Final",
    homeSlug: "real-madrid",
    awaySlug: "juventus",
    homeGoals: 13,
    awayGoals: 0,
    scorers: [
      { name: "Vivek", goals: 10 },
      { name: "Nirvaan", goals: 2 },
      { name: "Areek", goals: 1 },
    ],
  },
  {
    id: "s1-final",
    round: "Final",
    homeSlug: "chelsea",
    awaySlug: "real-madrid",
  },
];
