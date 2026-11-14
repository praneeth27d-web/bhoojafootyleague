import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest } from "@/components/team-badge";
import { Button } from "@/components/ui/button";
import { HeadToHead } from "@/components/head-to-head";
import { MatchLineupView } from "@/components/match-lineup";
import { MatchTimeline } from "@/components/match-timeline";
import { hasMatchTimeline } from "@/lib/match-timeline";
import { LiveBadge, LiveClock } from "@/components/live-match";
import { liveScore } from "@/lib/live-match";
import { RedCardBlocks } from "@/components/league-tables";
import { formatKickoff, teamName } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/matches/$matchId")({
  head: () => ({
    meta: [
      { title: "Match — Bhooja Football League" },
      {
        name: "description",
        content: "Score, five-a-side lineups, match events and player of the match for this BFL fixture.",
      },
      { property: "og:title", content: "BFL Match" },
      {
        property: "og:description",
        content: "Score, lineups and every match event.",
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

function MatchDetail() {
  const { matchId } = Route.useParams();
  const { getMatch, loading } = useLeague();
  const [view, setView] = useState<"details" | "lineup" | "timeline">("details");
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

  const live = m.status === "live";
  const showTimeline = hasMatchTimeline(m);
  const completed = m.status === "completed" || live;
  const score = live ? liveScore(m) : { home: m.homeGoals, away: m.awayGoals };
  const parts = formatKickoff(m.date).split(", ");
  const weekday = parts[0] ?? "";
  const datePart = parts[1] ?? "";
  const timePart = parts[2] ?? "";

  return (
    <AppShell
      title={`${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}`}
      subtitle={m.round ? `Season ${m.season} · ${m.round}` : `Season ${m.season} · Matchday ${m.matchday}`}

      badge={live ? "Live" : completed ? "Full time" : "Upcoming"}
      back
    >
      <div className="max-w-2xl space-y-5">
        <Card>
          <div className="px-4 py-6 text-center">
            <div className="flex items-center justify-center gap-3">
              {completed && <RedCardBlocks cards={m.cards.filter((c) => c.side === "home" && c.cardType !== "yellow")} />}
              <span className="flex flex-1 flex-col items-center gap-2">
                <TeamCrest slug={m.homeSlug} className="size-12" />
                <span className="text-sm font-semibold">{teamName(m.homeSlug)}</span>
              </span>
              <div className="num rounded-md bg-surface-muted px-4 py-2 text-2xl font-bold">
                {completed ? `${score.home}–${score.away}` : "vs"}
              </div>
              <span className="flex flex-1 flex-col items-center gap-2">
                <TeamCrest slug={m.awaySlug} className="size-12" />
                <span className="text-sm font-semibold">{teamName(m.awaySlug)}</span>
              </span>
              {completed && <RedCardBlocks cards={m.cards.filter((c) => c.side === "away" && c.cardType !== "yellow")} />}
            </div>
            {live && <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold"><LiveBadge /><LiveClock match={m} /></div>}
            {m.livePeriod === "full_time" && m.status === "completed" && <p className="mt-3 text-sm font-semibold text-muted-foreground">Full time — the game is done</p>}
          </div>
        </Card>

        {completed ? (
          <>
            <Card title={showTimeline ? undefined : "Lineup"}>
              {showTimeline && <div role="tablist" aria-label="Match views" className="flex gap-1 border-b border-border px-4 pt-2">
                <Button type="button" role="tab" id="match-lineup-tab" aria-controls="match-events-panel" aria-selected={view !== "timeline"} onClick={() => setView("lineup")} variant="ghost" className={view !== "timeline" ? "rounded-none border-b-2 border-primary text-foreground" : "rounded-none border-b-2 border-transparent text-muted-foreground"}>Lineup</Button>
                <Button type="button" role="tab" id="match-timeline-tab" aria-controls="match-events-panel" aria-selected={view === "timeline"} onClick={() => setView("timeline")} variant="ghost" className={view === "timeline" ? "rounded-none border-b-2 border-primary text-foreground" : "rounded-none border-b-2 border-transparent text-muted-foreground"}>Timeline</Button>
              </div>}
              <div id="match-events-panel" role={showTimeline ? "tabpanel" : undefined} aria-labelledby={showTimeline ? view === "timeline" ? "match-timeline-tab" : "match-lineup-tab" : undefined} className="px-4 py-4">{showTimeline && view === "timeline" ? <MatchTimeline match={m} /> : <MatchLineupView match={m} />}</div>
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
          <>
          <Card>
            <div role="tablist" aria-label="Match views" className="flex gap-1 border-b border-border px-4 pt-2">
              <Button type="button" role="tab" aria-selected={view !== "lineup"} onClick={() => setView("details")} variant="ghost" className={view !== "lineup" ? "rounded-none border-b-2 border-primary text-foreground" : "rounded-none border-b-2 border-transparent text-muted-foreground"}>Details</Button>
              <Button type="button" role="tab" aria-selected={view === "lineup"} onClick={() => setView("lineup")} variant="ghost" className={view === "lineup" ? "rounded-none border-b-2 border-primary text-foreground" : "rounded-none border-b-2 border-transparent text-muted-foreground"}>Lineup</Button>
            </div>
            {view === "lineup" ? <div className="px-4 py-4"><MatchLineupView match={m} /></div> : <dl className="divide-y divide-border text-sm">
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
            </dl>}
          </Card>
          <HeadToHead match={m} />
          </>
        )}
      </div>
    </AppShell>
  );
}
