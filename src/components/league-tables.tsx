import { Link } from "@tanstack/react-router";
import { formatKickoff, standings, type Match, type Player } from "@/lib/league";
import { teamName } from "@/lib/league";
import { StatusPill } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";

export function StandingsTable({ highlight }: { highlight?: string }) {
  const rows = standings();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">League standings</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-semibold">
              Pos
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Team
            </th>
            {["P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-right font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.team.slug}
              className={
                "border-b border-border last:border-0 transition-colors hover:bg-accent " +
                (highlight === r.team.slug ? "bg-primary/5" : "")
              }
            >
              <td className="num px-4 py-3 text-muted-foreground">{r.pos}</td>
              <td className="px-4 py-3">
                <Link
                  to="/teams/$teamSlug/table"
                  params={{ teamSlug: r.team.slug }}
                  className="inline-flex hover:opacity-80"
                  aria-label={r.team.name}
                >
                  <TeamBadge slug={r.team.slug} crestClassName="size-7" />
                </Link>
              </td>
              {[r.played, r.won, r.drawn, r.lost, r.gf, r.ga].map((v, i) => (
                <td key={i} className="num px-3 py-3 text-right text-muted-foreground">
                  {v}
                </td>
              ))}
              <td className="num px-3 py-3 text-right text-muted-foreground">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
              <td className="num px-3 py-3 text-right font-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MatchRows({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No matches match these filters.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {matches.map((m) => (
        <li key={m.id}>
          <Link
            to="/matches/$matchId"
            params={{ matchId: m.id }}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
          >
            <span className="num w-12 shrink-0 text-xs text-muted-foreground">MD{m.matchday}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <TeamBadge slug={m.homeSlug} />
                <span className="text-muted-foreground">vs</span>
                <TeamBadge slug={m.awaySlug} />
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {formatKickoff(m.date)}
                {m.venue ? ` · ${m.venue}` : ""}
              </span>
            </span>
            {m.status === "completed" ? (
              <span className="num rounded-md bg-surface-muted px-2.5 py-1 text-sm font-bold">
                {m.homeGoals}–{m.awayGoals}
              </span>
            ) : (
              <StatusPill status="upcoming" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PlayerRows({
  players,
  onSelect,
}: {
  players: Player[];
  onSelect?: (slug: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-semibold">
              Player
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Team
            </th>
            {["G", "A", "G/A", "POTM"].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-right font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-accent">
              <td className="px-4 py-3">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(p.slug)}
                    className="font-semibold hover:text-primary"
                    aria-label={`Open profile for ${p.name}`}
                  >
                    {p.name}
                  </button>
                ) : (
                  <Link
                    to="/players/$playerSlug"
                    params={{ playerSlug: p.slug }}
                    className="font-semibold hover:text-primary"
                  >
                    {p.name}
                  </Link>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                <Link
                  to="/teams/$teamSlug/squad"
                  params={{ teamSlug: p.teamSlug }}
                  className="inline-flex hover:opacity-80"
                  aria-label={teamName(p.teamSlug)}
                >
                  <TeamBadge slug={p.teamSlug} />
                </Link>
              </td>
              <td className="num px-3 py-3 text-right">{p.goals}</td>
              <td className="num px-3 py-3 text-right">{p.assists}</td>
              <td className="num px-3 py-3 text-right font-bold">{p.goals + p.assists}</td>
              <td className="num px-3 py-3 text-right">{p.potm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
