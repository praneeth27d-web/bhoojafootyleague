export type Team = {
  slug: string;
  name: string;
  short: string;
};

export type Player = {
  id: string;
  slug: string;
  name: string;
  teamSlug: string;
  captain: boolean;
  goals: number;
  assists: number;
  potm: number;
};

export type MatchGoal = {
  id: string;
  minute: number | null;
  scorerId: string;
  scorerSlug: string;
  scorerName: string;
  scorerTeamSlug: string | null;
  assistId: string | null;
  assistSlug: string | null;
  assistName: string | null;
};

export type Match = {
  id: string;
  season: number;
  round?: string | null;
  matchday: number;
  date: string; // ISO

  homeSlug: string;
  awaySlug: string;
  venue?: string | null;
  status: "completed" | "upcoming";
  homeGoals?: number | null;
  awayGoals?: number | null;
  goals: MatchGoal[];
  potmId?: string | null;
  potmSlug?: string | null;
  potmName?: string | null;
  potmTeamSlug?: string | null;
};

export type Transfer = {
  id: string;
  playerId: string;
  playerName: string;
  playerSlug: string;
  fromSlug: string | null;
  toSlug: string;
  date: string;
  note: string | null;
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

export const getTeam = (slug: string) => teams.find((t) => t.slug === slug);
export const teamName = (slug: string) => getTeam(slug)?.name ?? slug;

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

export function computeStandings(matches: Match[]): StandingRow[] {
  const base = new Map(
    teams.map((t) => [t.slug, { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 }]),
  );

  for (const m of matches.filter((m) => m.status === "completed")) {
    const home = base.get(m.homeSlug);
    const away = base.get(m.awaySlug);
    if (!home || !away) continue;
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
