import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Footprints, Goal, Hand, ShieldHalf, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { useLeague } from "@/lib/league-data";
import { computeAwards, type AwardKey } from "@/lib/awards";

export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      { title: "Awards — Bhooja Football League" },
      { name: "description", content: "BFL season awards: Golden Boot, Golden Playmaker, Golden Crown, Player of the Tournament, Golden Glove and Golden Wall." },
      { property: "og:title", content: "BFL Awards" },
      { property: "og:description", content: "Who leads the race for every BFL award this season." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AwardsPage,
});

const awards: { key: AwardKey; title: string; criteria: string; icon: React.ElementType }[] = [
  { key: "tournament", title: "Player of the Tournament", criteria: "Best player: POTM ×3 + goals + assists", icon: Star },
  { key: "boot", title: "Golden Boot", criteria: "Most goals", icon: Goal },
  { key: "playmaker", title: "Golden Playmaker", criteria: "Most assists", icon: Footprints },
  { key: "crown", title: "Golden Crown", criteria: "Most goals + assists", icon: Crown },
  { key: "glove", title: "Golden Glove", criteria: "Best keeper: clean sheets, then fewest conceded per game", icon: Hand },
  { key: "wall", title: "Golden Wall", criteria: "Best defender: clean sheets, then fewest conceded per game", icon: ShieldHalf },
];

function AwardsPage() {
  const { players, matches } = useLeague();
  const results = computeAwards(players, matches);

  return (
    <AppShell title="Awards" subtitle="Live race for this season's honours">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {awards.map(({ key, title, criteria, icon: Icon }) => {
          const [leader, ...rest] = results[key];
          return (
            <section key={key} aria-label={title} className="overflow-hidden rounded-xl border border-border bg-surface">
              <header className="flex items-center gap-3 border-b border-border bg-primary/10 px-4 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/20 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold">{title}</h2>
                  <p className="text-xs text-muted-foreground">{criteria}</p>
                </div>
              </header>
              {leader ? (
                <>
                  <Link to="/players/$playerSlug" params={{ playerSlug: leader.player.slug }} className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-accent">
                    <div className="min-w-0">
                      <p className="text-lg font-bold">{leader.player.name}</p>
                      <TeamBadge slug={leader.player.teamSlug} />
                    </div>
                    <p className="num text-right text-sm font-bold text-primary">{leader.label}</p>
                  </Link>
                  <ol className="border-t border-border">
                    {rest.map((e, i) => (
                      <li key={e.player.id}>
                        <Link to="/players/$playerSlug" params={{ playerSlug: e.player.slug }} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent">
                          <span className="num w-4 text-muted-foreground">{i + 2}</span>
                          <span className="flex-1 font-medium">{e.player.name}</span>
                          <span className="num text-xs text-muted-foreground">{e.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground">No contenders yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
