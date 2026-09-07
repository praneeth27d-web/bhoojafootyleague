import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest, useTeamName } from "@/components/team-badge";
import { getSeason1Knockout } from "@/lib/season1";

export const Route = createFileRoute("/season-1/$knockoutId")({
  loader: ({ params }) => {
    if (!getSeason1Knockout(params.knockoutId)) throw notFound();
  },
  head: ({ params }) => {
    const k = getSeason1Knockout(params.knockoutId);
    if (!k) return { meta: [{ title: "Match not found" }, { name: "robots", content: "noindex" }] };
    const title = `Season 1 ${k.round} — Bhooja Football League`;
    const description = `Score, scorers and details for the Season 1 ${k.round}.`;
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
  component: Season1KnockoutDetail,
});

function TeamColumn({ slug }: { slug: string }) {
  const name = useTeamName(slug);
  return (
    <span className="flex flex-1 flex-col items-center gap-2">
      <TeamCrest slug={slug} className="size-12" />
      <span className="text-sm font-semibold">{name}</span>
    </span>
  );
}

function Season1KnockoutDetail() {
  const { knockoutId } = Route.useParams();
  const k = getSeason1Knockout(knockoutId);
  if (!k) return null;
  const played = k.homeGoals !== undefined && k.awayGoals !== undefined;

  return (
    <AppShell title={k.round} subtitle="Season 1 knockouts" back badge={played ? "Full time" : "To be played"}>
      <div className="max-w-2xl space-y-5">
        <Card>
          <div className="px-4 py-6">
            <div className="flex items-center justify-center gap-4">
              <TeamColumn slug={k.homeSlug} />
              <div className="num rounded-md bg-surface-muted px-4 py-2 text-2xl font-bold">
                {played ? `${k.homeGoals}–${k.awayGoals}` : "vs"}
              </div>
              <TeamColumn slug={k.awaySlug} />
            </div>
          </div>
        </Card>

        <Card title="Goalscorers">
          {k.scorers && k.scorers.length > 0 ? (
            <ul className="divide-y divide-border">
              {k.scorers.map((s) => (
                <li key={s.name} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold">{s.name}</span>
                  <span className="num text-muted-foreground">
                    {s.goals} {s.goals === 1 ? "goal" : "goals"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {played ? "No scorers recorded for this match." : "This match has not been played yet."}
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
