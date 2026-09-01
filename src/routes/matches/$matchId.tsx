import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import {
  formatKickoff,
  getMatch,
  getPlayer,
  players,
  slugify,
  teamName,
  type Match,
} from "@/lib/league";

export const Route = createFileRoute("/matches/$matchId")({
  loader: ({ params }) => {
    if (!getMatch(params.matchId)) throw notFound();
  },
  head: ({ params }) => {
    const m = getMatch(params.matchId);
    if (!m) return { meta: [{ title: "Match not found" }, { name: "robots", content: "noindex" }] };
    const title = `${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)} — BFL`;
    const description =
      m.status === "completed"
        ? `Goals, assists and player of the match for ${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}.`
        : `Date, time and venue for ${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: MatchDetail,
});

const nameFromLabel = (label: string, prefix: string) =>
  label
    .replace(prefix, "")
    .replace(/\(.*\)/, "")
    .replace(/—/g, "")
    .trim();

function parseGoals(m: Match) {
  return (m.events ?? [])
    .filter((e) => e.type === "goal")
    .map((e) => {
      const assistMatch = /assist:\s*([^)]+)\)/.exec(e.label);
      const scorer = getPlayer(e.playerSlug);
      const assistName = assistMatch?.[1]?.trim();
      const assist = assistName
        ? (players.find((p) => p.slug === slugify(assistName)) ?? null)
        : null;
      return {
        minute: e.minute,
        scorerName: scorer?.name ?? nameFromLabel(e.label, "Goal"),
        scorerSlug: scorer?.slug ?? null,
        teamSlug: scorer?.teamSlug ?? null,
        assistName: assist?.name ?? assistName ?? null,
        assistSlug: assist?.slug ?? null,
      };
    })
    .sort((a, b) => a.minute - b.minute);
}

function PlayerLink({ slug, name }: { slug: string | null; name: string }) {
  if (!slug) return <span className="font-semibold">{name}</span>;
  return (
    <Link
      to="/players/$playerSlug"
      params={{ playerSlug: slug }}
      className="font-semibold text-primary hover:underline"
    >
      {name}
    </Link>
  );
}

function MatchDetail() {
  const { matchId } = Route.useParams();
  const m = getMatch(matchId);
  if (!m) return null;

  const completed = m.status === "completed";
  const goals = completed ? parseGoals(m) : [];
  const potmEvent = (m.events ?? []).find((e) => e.type === "potm");
  const potm = potmEvent ? getPlayer(potmEvent.playerSlug) : null;
  const d = new Date(m.date);
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    d.getUTCDay()
  ];
  const [datePart, timePart] = (() => {
    const parts = formatKickoff(m.date).split(", ");
    return [parts[1] ?? "", parts[2] ?? ""];
  })();

  return (
    <AppShell
      title={`${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}`}
      subtitle={`Matchday ${m.matchday}`}
      badge={completed ? "Full time" : "Upcoming"}
    >
      <div className="max-w-2xl space-y-5">
        <Card>
          <div className="px-4 py-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="text-lg font-bold">{teamName(m.homeSlug)}</div>
              <div className="num rounded-md bg-surface-muted px-4 py-2 text-2xl font-bold">
                {completed ? `${m.homeGoals}–${m.awayGoals}` : "vs"}
              </div>
              <div className="text-lg font-bold">{teamName(m.awaySlug)}</div>
            </div>
          </div>
        </Card>

        {completed ? (
          <>
            <Card title="Goals & assists">
              {goals.length > 0 ? (
                <ul className="divide-y divide-border">
                  {goals.map((g, i) => (
                    <li key={i} className="flex items-baseline gap-3 px-4 py-3 text-sm">
                      <span className="num w-10 shrink-0 text-muted-foreground">
                        {g.minute}&apos;
                      </span>
                      <span>
                        <PlayerLink slug={g.scorerSlug} name={g.scorerName} />
                        {g.teamSlug && (
                          <span className="text-muted-foreground"> · {teamName(g.teamSlug)}</span>
                        )}
                        <span className="block text-xs text-muted-foreground">
                          {g.assistName ? (
                            <>
                              Assist: <PlayerLink slug={g.assistSlug} name={g.assistName} />
                            </>
                          ) : (
                            "No assist"
                          )}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No goals in this match.
                </p>
              )}
            </Card>

            <Card title="Player of the match">
              {potm ? (
                <div className="px-4 py-4 text-sm">
                  <PlayerLink slug={potm.slug} name={potm.name} />
                  <span className="text-muted-foreground"> · {teamName(potm.teamSlug)}</span>
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
