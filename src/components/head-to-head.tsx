import { Link } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { formatKickoff, formatShortDate, teamName, type Match } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

function RecordPill({
  count,
  label,
  name,
  pillClass,
}: {
  count: number;
  label: string;
  name?: string;
  pillClass: string;
}) {
  return (
    <div className="flex min-w-16 flex-col items-center gap-1">
      <span className={`num rounded-full px-4 py-1.5 text-sm font-bold ${pillClass}`}>{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {name && (
        <span className="max-w-28 truncate text-[11px] font-semibold text-muted-foreground">{name}</span>
      )}
    </div>
  );
}

/** Head-to-head block for an upcoming fixture: win/draw/win record and every meeting this season. */
export function HeadToHead({ match }: { match: Match }) {
  const { matches, knockouts } = useLeague();

  const meetings = [...matches, ...knockouts]
    .filter(
      (m) =>
        m.season === match.season &&
        m.id !== match.id &&
        ((m.homeSlug === match.homeSlug && m.awaySlug === match.awaySlug) ||
          (m.homeSlug === match.awaySlug && m.awaySlug === match.homeSlug)),
    )
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const completed = meetings.filter(
    (m) => m.status === "completed" && m.homeGoals != null && m.awayGoals != null,
  );
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  for (const m of completed) {
    const homeIsFixtureHome = m.homeSlug === match.homeSlug;
    const fixtureHomeGoals = homeIsFixtureHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0);
    const fixtureAwayGoals = homeIsFixtureHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0);
    if (fixtureHomeGoals > fixtureAwayGoals) homeWins++;
    else if (fixtureHomeGoals < fixtureAwayGoals) awayWins++;
    else draws++;
  }
  const total = homeWins + draws + awayWins;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <Card title="Head to head">
      <div className="px-4 py-4">
        {meetings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            These clubs have not met this season yet.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <RecordPill
                count={homeWins}
                label="Won"
                name={teamName(match.homeSlug)}
                pillClass="bg-foreground text-background"
              />
              <RecordPill count={draws} label="Drawn" pillClass="bg-muted-foreground/40 text-foreground" />
              <RecordPill
                count={awayWins}
                label="Won"
                name={teamName(match.awaySlug)}
                pillClass="bg-primary text-event-ink"
              />
            </div>
            <div
              role="img"
              aria-label={`${teamName(match.homeSlug)} ${homeWins} wins, ${draws} draws, ${teamName(match.awaySlug)} ${awayWins} wins`}
              className="mt-3 flex h-1.5 overflow-hidden rounded-full"
            >
              {homeWins > 0 && <span style={{ width: `${pct(homeWins)}%` }} className="bg-foreground" />}
              {draws > 0 && <span style={{ width: `${pct(draws)}%` }} className="bg-muted-foreground/40" />}
              {awayWins > 0 && <span style={{ width: `${pct(awayWins)}%` }} className="bg-primary" />}
            </div>

            <ul className="mt-4 divide-y divide-border border-t border-border text-sm">
              {meetings.map((m) => {
                const done = m.status === "completed" && m.homeGoals != null && m.awayGoals != null;
                return (
                  <li key={m.id}>
                    <Link
                      to="/matches/$matchId"
                      params={{ matchId: m.id }}
                      className="block py-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span>{formatShortDate(m.date)}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">
                          {m.round ?? `Matchday ${m.matchday}`}
                        </span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 font-semibold">
                        <TeamBadge slug={m.homeSlug} nameFirst className="min-w-0 justify-end" crestClassName="size-5" />
                        <span className="num">
                          {done ? `${m.homeGoals}–${m.awayGoals}` : `${formatKickoff(m.date).split(", ").pop()} IST`}
                        </span>
                        <TeamBadge slug={m.awaySlug} className="min-w-0" crestClassName="size-5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
