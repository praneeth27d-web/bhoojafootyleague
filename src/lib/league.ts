export type Team = {
  slug: string;
  name: string;
  short: string;
};

export type Player = {
  slug: string;
  name: string;
  teamSlug: string;
  captain: boolean;
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
  { slug: "ac-milan", name: "AC Milan", short: "MIL" },
  { slug: "real-madrid", name: "Real Madrid", short: "RMA" },
  { slug: "juventus", name: "Juventus", short: "JUV" },
  { slug: "chelsea", name: "Chelsea", short: "CHE" },
  { slug: "arsenal", name: "Arsenal", short: "ARS" },
];

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Confirmed squads. Captains marked with `true`. Transfers can change these.
const rawSquads: Array<[string, Array<[string, boolean]>]> = [
  [
    "ac-milan",
    [
      ["Reyansh", true],
      ["Shaurya", false],
      ["Praneeth", false],
      ["Rohit", false],
      ["Adrith", false],
    ],
  ],
  [
    "real-madrid",
    [
      ["Vivek", true],
      ["Nirvaan", false],
      ["Areek", false],
      ["Neil", false],
      ["Rohan", false],
    ],
  ],
  [
    "juventus",
    [
      ["Swanik", true],
      ["Rishik", false],
      ["Jai", false],
      ["Ruhaan", false],
      ["Arjun", false],
    ],
  ],
  [
    "chelsea",
    [
      ["Ritwik", true],
      ["Neerav", false],
      ["Aadvik", false],
      ["Suhit", false],
      ["Advitya", false],
    ],
  ],
  [
    "arsenal",
    [
      ["Ady", true],
      ["Avyaan", false],
      ["Dev", false],
      ["Abheek", false],
      ["Cherry", false],
    ],
  ],
];

export const players: Player[] = rawSquads.flatMap(([teamSlug, squadList]) =>
  squadList.map(([name, captain]) => ({
    slug: slugify(name),
    name,
    teamSlug,
    captain,
    goals: 0,
    assists: 0,
    potm: 0,
  })),
);

export const getTeam = (slug: string) => teams.find((t) => t.slug === slug);
export const getPlayer = (slug: string) => players.find((p) => p.slug === slug);
export const teamName = (slug: string) => getTeam(slug)?.name ?? slug;
export const squad = (teamSlug: string) => players.filter((p) => p.teamSlug === teamSlug);

// No matches have been played and no fixtures have been scheduled yet.
export const matches: Match[] = [];

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
    teams.map((t) => [t.slug, { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 }]),
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
        b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name),
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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatKickoff(iso: string) {
  const d = new Date(iso);
  const wd = weekdays[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${wd}, ${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

export const topScorers = () =>
  [...players].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name),
  );
