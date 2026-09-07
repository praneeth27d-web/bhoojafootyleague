import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TeamCrest, useTeamName } from "@/components/team-badge";
import { players, slugify } from "@/lib/league";
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

function GoalRow({ name, goals, side }: { name: string; goals: number; side: "home" | "away" }) {
  const label = (
    <span className="flex items-center gap-2 text-sm">
      <span className="font-semibold">{name}</span>
      {goals > 1 && <span className="num text-muted-foreground">({goals})</span>}
    </span>
  );
  const ball = (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px]"
    >
      ⚽
    </span>
  );
  return (
    <li className="grid grid-cols-2 gap-3 px-4 py-2.5">
      {side === "home" ? (
        <span className="flex items-center gap-2">
          {ball}
          {label}
        </span>
      ) : (
        <span />
      )}
      {side === "away" ? (
        <span className="flex items-center justify-end gap-2 text-right">
          {label}
          {ball}
        </span>
      ) : (
        <span />
      )}
    </li>
  );
}

function Season1KnockoutDetail() {
  const { knockoutId } = Route.useParams();
  const k = getSeason1Knockout(knockoutId);
  if (!k) return null;
  const played = k.homeGoals !== undefined && k.awayGoals !== undefined;

  const scorers = (k.scorers ?? []).map((s) => {
    const p = players.find((pl) => pl.slug === slugify(s.name));
    const side: "home" | "away" = p?.teamSlug === k.awaySlug ? "away" : "home";
    return { ...s, side };
  });

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

        <Card title="Goals">
          {scorers.length > 0 ? (
            <ul className="divide-y divide-border">
              {scorers.map((s) => (
                <GoalRow key={s.name} name={s.name} goals={s.goals} side={s.side} />
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

