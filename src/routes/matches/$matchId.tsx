import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { formatKickoff, getMatch, teamName } from "@/lib/league";

export const Route = createFileRoute("/matches/$matchId")({
  loader: ({ params }) => {
    if (!getMatch(params.matchId)) throw notFound();
  },
  head: ({ params }) => ({
    meta: getMatch(params.matchId)
      ? [
          { title: `${teamName(getMatch(params.matchId)!.homeSlug)} vs ${teamName(getMatch(params.matchId)!.awaySlug)} — BFL` },
          { name: "description", content: `Match details for ${teamName(getMatch(params.matchId)!.homeSlug)} vs ${teamName(getMatch(params.matchId)!.awaySlug)}.` },
          { property: "og:title", content: `${teamName(getMatch(params.matchId)!.homeSlug)} vs ${teamName(getMatch(params.matchId)!.awaySlug)}` },
          { property: "og:description", content: `Matchday ${getMatch(params.matchId)!.matchday} in the Bhooja Football League.` },
        ]
      : [{ title: "Match not found" }, { name: "robots", content: "noindex" }],
  }),
  component: MatchDetail,
});

function MatchDetail() {
  const { matchId } = Route.useParams();
  const m = getMatch(matchId);
  if (!m) return null;
  return (
    <AppShell title={`${teamName(m.homeSlug)} vs ${teamName(m.awaySlug)}`} subtitle={`Matchday ${m.matchday}`} badge={m.status === "upcoming" ? "Upcoming" : "Full time"}>
      <div className="max-w-2xl space-y-5">
        <Card>
          <div className="px-4 py-6 text-center">
            <div className="text-sm text-muted-foreground">{formatKickoff(m.date)}</div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-lg font-bold">{teamName(m.homeSlug)}</div>
              <div className="num rounded-md bg-surface-muted px-4 py-2 text-2xl font-bold">
                {m.status === "completed" ? `${m.homeGoals}–${m.awayGoals}` : "vs"}
              </div>
              <div className="text-lg font-bold">{teamName(m.awaySlug)}</div>
            </div>
            {m.venue && <div className="mt-4 text-sm text-muted-foreground">{m.venue}</div>}
          </div>
        </Card>

        <Card title="Match events">
          {m.status === "completed" && m.events && m.events.length > 0 ? (
            <ul className="divide-y divide-border px-4 py-2">
              {m.events.map((e, i) => (
                <li key={i} className="py-2 text-sm">
                  <span className="num text-muted-foreground">{e.minute}&apos;</span> {e.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Lineups and events will appear after the match is completed.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
