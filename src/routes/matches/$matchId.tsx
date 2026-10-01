import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest } from "@/components/team-badge";
import { Button } from "@/components/ui/button";
import assistBootLight from "@/assets/assist-boot-light.png";
import assistBootDark from "@/assets/assist-boot-dark.png";
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

function EventRow({
  home,
  away,
  kind,
}: {
  home?: MatchEvent | undefined;
  away?: MatchEvent | undefined;
  kind: "goal" | "assist";
}) {
  const icon = () =>
    kind === "goal" ? (
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center text-xs">
        ⚽
      </span>
    ) : (
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
        <img
          src={assistBootLight}
          alt=""
          className="size-5 object-contain dark:hidden"
        />
        <img
          src={assistBootDark}
          alt=""
          className="hidden size-5 object-contain dark:block"
        />
      </span>
    );

  const event = (item: MatchEvent, side: "home" | "away") => (
    <span className={side === "away" ? "flex items-center justify-end gap-2 text-right" : "flex items-center gap-2"}>
      {side === "home" && icon()}
      <span className="min-w-0 truncate text-sm">
        {item.count > 1 && <span className="num mr-1 font-bold text-muted-foreground">{item.count}×</span>}
        <PlayerLink slug={item.slug} name={item.name} />
      </span>
      {side === "away" && icon()}
    </span>
  );

  return (
    <li className="grid min-h-11 grid-cols-2 items-center gap-4 px-4 py-2.5">
      <span>{home ? event(home, "home") : null}</span>
      <span>{away ? event(away, "away") : null}</span>
    </li>
  );
}

type MatchEvent = {
  key: string;
  side: "home" | "away";
  name: string;
  slug: string | null;
  count: number;
};

function groupEvents(events: Omit<MatchEvent, "key" | "count">[]) {
  const grouped = new Map<string, MatchEvent>();
  for (const event of events) {
    const key = `${event.side}-${event.slug ?? event.name}`;
    const existing = grouped.get(key);
    if (existing) existing.count += 1;
    else grouped.set(key, { ...event, key, count: 1 });
  }
  return [...grouped.values()];
}

function MatchDetail() {
  const { matchId } = Route.useParams();
  const { getMatch, loading } = useLeague();
  const [view, setView] = useState<"goals" | "assists">("goals");
  const m = getMatch(matchId);

  const events = groupEvents((m?.goals ?? []).flatMap((g) => {
    const side = (slug: string | null) => (slug === m?.awaySlug ? "away" : "home") as "home" | "away";
    if (view === "goals") {
      return [
        {
          side: side(g.scorerTeamSlug),
          name: g.scorerName,
          slug: g.scorerSlug || null,
        },
      ];
    }
    if (!g.assistName) return [];
    return [
      {
        side: side(g.scorerTeamSlug),
        name: g.assistName,
        slug: g.assistSlug,
      },
    ];
  }));
  const homeEvents = events.filter((event) => event.side === "home");
  const awayEvents = events.filter((event) => event.side === "away");
  const eventRows = Array.from({ length: Math.max(homeEvents.length, awayEvents.length) }, (_, index) => ({
    home: homeEvents[index],
    away: awayEvents[index],
  }));

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
  const parts = formatKickoff(m.date).split(", ");
  const weekday = parts[0] ?? "";
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
            <Card>
              <div className="flex gap-2 border-b border-border px-4 py-3">
                {(["goals", "assists"] as const).map((v) => (
                  <Button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    size="sm"
                    variant={view === v ? "default" : "outline"}
                  >
                    {v === "goals" ? "Goals" : "Assists"}
                  </Button>
                ))}
              </div>
              {eventRows.length > 0 ? (
                <ul className="divide-y divide-border">
                  {eventRows.map((row, index) => (
                    <EventRow
                      key={`${row.home?.key ?? "empty"}-${row.away?.key ?? "empty"}-${index}`}
                      home={row.home}
                      away={row.away}
                      kind={view === "goals" ? "goal" : "assist"}
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {view === "goals" ? "No goals in this match." : "No assists in this match."}
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
                <dd className="num font-semibold">{timePart} IST</dd>
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
