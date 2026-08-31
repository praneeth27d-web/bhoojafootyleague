export type Team = {
  slug: string;
  name: string;
  short: string;
};

export type Player = {
  slug: string;
  name: string;
  teamSlug: string;
  goals: number;
  assists: number;
  potm: number;
};

export type MatchEvent = {
  minute: number;
  type: "goal" | "assist" | "potm";
  playerSlug: string;
  label: string;
};

export type Match = {
  id: string;
  matchday: number;
  date: string; // ISO
  homeSlug: string;
  awaySlug: string;
  venue?: string;
  status: "completed" | "upcoming";
  homeGoals?: number;
  awayGoals?: number;
  events?: MatchEvent[];
};

export const teams: Team[] = [
  { slug: "chelsea", name: "Chelsea", short: "CHE" },
  { slug: "ac-milan", name: "AC Milan", short: "MIL" },
  { slug: "real-madrid", name: "Real Madrid", short: "RMA" },
  { slug: "arsenal", name: "Arsenal", short: "ARS" },
  { slug: "juventus", name: "Juventus", short: "JUV" },
];

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const rawPlayers: Array<[string, string, number, number, number]> = [
  ["Noah Bennett", "chelsea", 3, 1, 1],
  ["Lucas Morgan", "chelsea", 2, 2, 0],
  ["Ethan Carter", "chelsea", 1, 3, 1],
  ["Mason Reed", "chelsea", 2, 0, 0],
  ["Oliver Hayes", "chelsea", 0, 1, 0],
  ["Daniel Brooks", "chelsea", 1, 1, 0],
  ["Matteo Rossi", "ac-milan", 4, 1, 2],
  ["Luca Bianchi", "ac-milan", 2, 2, 0],
  ["Marco Conti", "ac-milan", 1, 2, 1],
  ["Andrea Romano", "ac-milan", 2, 0, 0],
  ["Enzo Moretti", "ac-milan", 0, 1, 0],
  ["Giovanni Ferri", "ac-milan", 1, 0, 0],
  ["Alejandro Cruz", "real-madrid", 5, 2, 2],
  ["Mateo Silva", "real-madrid", 2, 3, 1],
  ["Diego Torres", "real-madrid", 2, 1, 0],
  ["Javier León", "real-madrid", 1, 1, 0],
  ["Sergio Vega", "real-madrid", 0, 1, 0],
  ["Nico Santos", "real-madrid", 1, 0, 0],
  ["William Grant", "arsenal", 3, 2, 1],
  ["Henry Collins", "arsenal", 2, 1, 0],
  ["Jack Foster", "arsenal", 1, 2, 1],
  ["Charlie Ward", "arsenal", 2, 0, 0],
  ["George Ellis", "arsenal", 0, 1, 0],
  ["Leo Turner", "arsenal", 1, 1, 0],
  ["Alessandro Ricci", "juventus", 4, 1, 1],
  ["Lorenzo Costa", "juventus", 2, 2, 1],
  ["Davide Marchetti", "juventus", 1, 2, 0],
  ["Federico Gallo", "juventus", 2, 0, 0],
  ["Tommaso Riva", "juventus", 0, 1, 0],
  ["Paolo De Luca", "juventus", 1, 0, 0],
];

export const players: Player[] = rawPlayers.map(([name, teamSlug, goals, assists, potm]) => ({
  slug: slugify(name),
  name,
  teamSlug,
  goals,
  assists,
  potm,
}));

export const getTeam = (slug: string) => teams.find((t) => t.slug === slug);
export const getPlayer = (slug: string) => players.find((p) => p.slug === slug);
export const teamName = (slug: string) => getTeam(slug)?.name ?? slug;
export const squad = (teamSlug: string) => players.filter((p) => p.teamSlug === teamSlug);

const ev = (minute: number, type: MatchEvent["type"], playerName: string, label: string): MatchEvent => ({
  minute,
  type,
  playerSlug: slugify(playerName),
  label,
});

export const matches: Match[] = [
  {
    id: "chelsea-ac-milan-md1",
    matchday: 1,
    date: "2026-08-08T17:30:00Z",
    homeSlug: "chelsea",
    awaySlug: "ac-milan",
    venue: "Bhooja Arena",
    status: "completed",
    homeGoals: 2,
    awayGoals: 1,
    events: [
      ev(14, "goal", "Noah Bennett", "Goal — Noah Bennett (assist: Ethan Carter)"),
      ev(39, "goal", "Matteo Rossi", "Goal — Matteo Rossi"),
      ev(71, "goal", "Mason Reed", "Goal — Mason Reed (assist: Lucas Morgan)"),
      ev(90, "potm", "Noah Bennett", "Player of the Match — Noah Bennett"),
    ],
  },
  {
    id: "real-madrid-arsenal-md1",
    matchday: 1,
    date: "2026-08-09T15:00:00Z",
    homeSlug: "real-madrid",
    awaySlug: "arsenal",
    venue: "North Ground",
    status: "completed",
    homeGoals: 3,
    awayGoals: 2,
    events: [
      ev(9, "goal", "Alejandro Cruz", "Goal — Alejandro Cruz (assist: Mateo Silva)"),
      ev(23, "goal", "William Grant", "Goal — William Grant (assist: Jack Foster)"),
      ev(48, "goal", "Diego Torres", "Goal — Diego Torres"),
      ev(66, "goal", "Charlie Ward", "Goal — Charlie Ward"),
      ev(84, "goal", "Alejandro Cruz", "Goal — Alejandro Cruz"),
      ev(90, "potm", "Alejandro Cruz", "Player of the Match — Alejandro Cruz"),
    ],
  },
  {
    id: "juventus-chelsea-md2",
    matchday: 2,
    date: "2026-08-15T18:00:00Z",
    homeSlug: "juventus",
    awaySlug: "chelsea",
    venue: "Bhooja Arena",
    status: "completed",
    homeGoals: 1,
    awayGoals: 1,
    events: [
      ev(31, "goal", "Alessandro Ricci", "Goal — Alessandro Ricci (assist: Davide Marchetti)"),
      ev(77, "goal", "Ethan Carter", "Goal — Ethan Carter"),
      ev(90, "potm", "Lorenzo Costa", "Player of the Match — Lorenzo Costa"),
    ],
  },
  {
    id: "ac-milan-real-madrid-md2",
    matchday: 2,
    date: "2026-08-16T16:00:00Z",
    homeSlug: "ac-milan",
    awaySlug: "real-madrid",
    venue: "South Pitch",
    status: "completed",
    homeGoals: 2,
    awayGoals: 0,
    events: [
      ev(18, "goal", "Matteo Rossi", "Goal — Matteo Rossi (assist: Marco Conti)"),
      ev(59, "goal", "Andrea Romano", "Goal — Andrea Romano (assist: Luca Bianchi)"),
      ev(90, "potm", "Matteo Rossi", "Player of the Match — Matteo Rossi"),
    ],
  },
  {
    id: "arsenal-juventus-md3",
    matchday: 3,
    date: "2026-08-22T17:00:00Z",
    homeSlug: "arsenal",
    awaySlug: "juventus",
    venue: "North Ground",
    status: "completed",
    homeGoals: 2,
    awayGoals: 2,
    events: [
      ev(12, "goal", "Jack Foster", "Goal — Jack Foster"),
      ev(35, "goal", "Alessandro Ricci", "Goal — Alessandro Ricci (assist: Tommaso Riva)"),
      ev(57, "goal", "Henry Collins", "Goal — Henry Collins (assist: Leo Turner)"),
      ev(81, "goal", "Lorenzo Costa", "Goal — Lorenzo Costa"),
      ev(90, "potm", "William Grant", "Player of the Match — William Grant"),
    ],
  },
  {
    id: "chelsea-real-madrid-md3",
    matchday: 3,
    date: "2026-09-05T17:30:00Z",
    homeSlug: "chelsea",
    awaySlug: "real-madrid",
    venue: "Bhooja Arena",
    status: "upcoming",
  },
  {
    id: "arsenal-ac-milan-md4",
    matchday: 4,
    date: "2026-09-12T15:00:00Z",
    homeSlug: "arsenal",
    awaySlug: "ac-milan",
    venue: "North Ground",
    status: "upcoming",
  },
  {
    id: "real-madrid-juventus-md4",
    matchday: 4,
    date: "2026-09-13T18:00:00Z",
    homeSlug: "real-madrid",
    awaySlug: "juventus",
    venue: "South Pitch",
    status: "upcoming",
  },
  {
    id: "chelsea-arsenal-md5",
    matchday: 5,
    date: "2026-09-19T16:00:00Z",
    homeSlug: "chelsea",
    awaySlug: "arsenal",
    venue: "Bhooja Arena",
    status: "upcoming",
  },
  {
    id: "ac-milan-juventus-md5",
    matchday: 5,
    date: "2026-09-20T17:00:00Z",
    homeSlug: "ac-milan",
    awaySlug: "juventus",
    venue: "South Pitch",
    status: "upcoming",
  },
];

export const completedMatches = matches.filter((m) => m.status === "completed");
export const upcomingMatches = matches.filter((m) => m.status === "upcoming");
export const matchdays = [...new Set(matches.map((m) => m.matchday))].sort((a, b) => a - b);
export const getMatch = (id: string) => matches.find((m) => m.id === id);

export type StandingRow = {
  pos: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export function standings(): StandingRow[] {
  const base = new Map(
    teams.map((t) => [
      t.slug,
      { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    ]),
  );

  for (const m of completedMatches) {
    const home = base.get(m.homeSlug)!;
    const away = base.get(m.awaySlug)!;
    const hg = m.homeGoals ?? 0;
    const ag = m.awayGoals ?? 0;
    home.played++;
    away.played++;
    home.gf += hg;
    home.ga += ag;
    away.gf += ag;
    away.ga += hg;
    if (hg > ag) {
      home.won++;
      away.lost++;
    } else if (hg < ag) {
      away.won++;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
    }
  }

  return [...base.values()]
    .map((r) => ({
      ...r,
      gd: r.gf - r.ga,
      points: r.won * 3 + r.drawn,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.name.localeCompare(b.team.name),
    )
    .map((r, i) => ({ pos: i + 1, ...r }));
}

export const teamMatches = (teamSlug: string) =>
  matches.filter((m) => m.homeSlug === teamSlug || m.awaySlug === teamSlug);

export function playerContributions(playerSlug: string) {
  return completedMatches
    .filter((m) => m.events?.some((e) => e.playerSlug === playerSlug))
    .map((m) => ({
      match: m,
      events: m.events!.filter((e) => e.playerSlug === playerSlug),
    }));
}

export function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export const topScorers = () =>
  [...players].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name),
  );
