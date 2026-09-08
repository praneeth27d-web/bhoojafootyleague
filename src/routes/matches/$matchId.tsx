import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest } from "@/components/team-badge";
import { formatKickoff, teamName } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/matches/$matchId")({
  head: () => ({
    meta: [
      { title: "Match — Bhooja Football League" },
      {
        name: "description",
        content: "Score, goalscorers, assists and player of the match for this BFL fixture.",
      },
      { property: "og:title", content: "BFL Match" },
      {
        property: "og:description",
        content: "Score, goalscorers, assists and player of the match.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchDetail,
});

function PlayerLink({ slug, name }: { slug: string | null; name: string }) {
  if (!slug) return <span className="font-semibold">{name}</span>;
  return (
    <Link
      to="/players/$playerSlug"
      params={{ playerSlug: slug }}
      className="font-semibold hover:underline"
    >
      {name}
    </Link>
  );
}

function GoalRow({
  side,
  minute,
  scorerName,
  scorerSlug,
  assistName,
  assistSlug,
}: {
  side: "home" | "away";
  minute: number | null;
  scorerName: string;
  scorerSlug: string | null;
  assistName: string | null;
  assistSlug: string | null;
}) {
  const content = (
    <span className={side === "away" ? "text-right" : ""}>
      <span className="text-sm">
        <PlayerLink slug={scorerSlug} name={scorerName} />
        {minute !== null && <span className="num text-muted-foreground"> {minute}&apos;</span>}
      </span>
      {assistName && (
        <span className="block text-xs text-muted-foreground">
          Assist: <PlayerLink slug={assistSlug} name={assistName} />
        </span>
      )}
    </span>
  );
  const ball = (
    <span
      aria-hidden="true"
      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px]"
    >
      ⚽
    </span>
  );
  return (
    <li className="grid grid-cols-2 gap-3 px-4 py-2.5">
      {side === "home" ? (
        <span className="flex items-start gap-2">
          {ball}
          {content}
        </span>
      ) : (
        <span />
      )}
      {side === "away" ? (
        <span className="flex items-start justify-end gap-2">
          {content}
          {ball}
        </span>
      ) : (
        <span />
      )}
    </li>
  );
}

function MatchDetail() {
  const { matchId } = Route.useParams();
  const { getMatch, loading } = useLeague();
  const m = getMatch(matchId);

  if (!m) {
    return (
      <AppShell title="Match" back>
        <Card>
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {loading ? "Loading match…" : "This match could not be found."}
          </p>
        </Card>
      </AppShell>
    );
  }

  const completed = m.status === "completed";
  const d = new Date(m.date);
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    d.getUTCDay()
  ];
  const parts = formatKickoff(m.date).split(", ");
  const datePart = parts[1] ?? "";
  const timePart = parts[2] ?? "";

  return (
    <AppShell
      title={`${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}`}
      subtitle={m.round ? `Season ${m.season} · ${m.round}` : `Season ${m.season} · Matchday ${m.matchday}`}

      badge={completed ? "Full time" : "Upcoming"}
      back
    >
      <div className="max-w-2xl space-y-5">
        <Card>
          <div className="px-4 py-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="flex flex-1 flex-col items-center gap-2">
                <TeamCrest slug={m.homeSlug} className="size-12" />
                <span className="text-sm font-semibold">{teamName(m.homeSlug)}</span>
              </span>
              <div className="num rounded-md bg-surface-muted px-4 py-2 text-2xl font-bold">
                {completed ? `${m.homeGoals}–${m.awayGoals}` : "vs"}
              </div>
              <span className="flex flex-1 flex-col items-center gap-2">
                <TeamCrest slug={m.awaySlug} className="size-12" />
                <span className="text-sm font-semibold">{teamName(m.awaySlug)}</span>
              </span>
            </div>
          </div>
        </Card>

        {completed ? (
          <>
            <Card title="Goals & assists">
              {m.goals.length > 0 ? (
                <ul className="divide-y divide-border">
                  {m.goals.map((g) => (
                    <GoalRow
                      key={g.id}
                      side={g.scorerTeamSlug === m.awaySlug ? "away" : "home"}
                      minute={g.minute}
                      scorerName={g.scorerName}
                      scorerSlug={g.scorerSlug || null}
                      assistName={g.assistName}
                      assistSlug={g.assistSlug}
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No goals in this match.
                </p>
              )}
            </Card>

            <Card title="Player of the match">
              {m.potmName ? (
                <div className="px-4 py-4 text-sm">
                  <PlayerLink slug={m.potmSlug ?? null} name={m.potmName} />
                  {m.potmTeamSlug && (
                    <span className="text-muted-foreground"> · {teamName(m.potmTeamSlug)}</span>
                  )}
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Not awarded for this match.
                </p>
              )}
            </Card>
          </>
        ) : (
          <Card title="Kick-off details">
            <dl className="divide-y divide-border text-sm">
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Day</dt>
                <dd className="font-semibold">{weekday}</dd>
              </div>
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="num font-semibold">{datePart}</dd>
              </div>
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Time</dt>
                <dd className="num font-semibold">{timePart} UTC</dd>
              </div>
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-semibold">{m.venue ?? "To be confirmed"}</dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
