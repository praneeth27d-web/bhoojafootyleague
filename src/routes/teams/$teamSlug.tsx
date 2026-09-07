import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { TeamCrest } from "@/components/team-badge";
import { useSeason } from "@/components/season-context";
import { season1Name, season1Table } from "@/lib/season1";
import { getTeam, standings } from "@/lib/league";
import { cn } from "@/lib/utils";

import { notFound } from "@tanstack/react-router";

const tabs = [
  { id: "table", label: "Table", to: "/teams/$teamSlug/table" },
  { id: "fixtures", label: "Fixtures", to: "/teams/$teamSlug/fixtures" },
  { id: "results", label: "Results", to: "/teams/$teamSlug/results" },
  { id: "squad", label: "Squad", to: "/teams/$teamSlug/squad" },
  { id: "transfers", label: "Transfers", to: "/teams/$teamSlug/transfers" },
  { id: "history", label: "History", to: "/teams/$teamSlug/history" },
] as const;

export const Route = createFileRoute("/teams/$teamSlug")({
  loader: ({ params }) => {
    if (!getTeam(params.teamSlug)) throw notFound();
  },
  head: ({ params }) => ({
    meta: getTeam(params.teamSlug)
      ? [
          { title: `${getTeam(params.teamSlug)!.name} — Bhooja Football League` },
          {
            name: "description",
            content: `Team page for ${getTeam(params.teamSlug)!.name} in the BFL.`,
          },
          { property: "og:title", content: `${getTeam(params.teamSlug)!.name} — BFL` },
          {
            property: "og:description",
            content: `Fixtures, results and squad for ${getTeam(params.teamSlug)!.name}.`,
          },
        ]
      : [{ title: "Team not found" }, { name: "robots", content: "noindex" }],
  }),
  component: TeamLayout,
});

function TeamLayout() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { season } = useSeason();
  const team = getTeam(teamSlug);
  if (!team) return null;
  const position = standings().find((r) => r.team.slug === teamSlug);
  const s1 = season1Table.find((r) => r.slug === teamSlug);
  const label = (season === "1" ? season1Name(teamSlug) : undefined) ?? team.name;
  const visibleTabs =
    season === "1" ? tabs.filter((t) => t.id === "table" || t.id === "squad") : tabs;

  return (
    <AppShell
      title={
        <span className="inline-flex items-center gap-3">
          <TeamCrest slug={teamSlug} className="size-10" />
          {label}
        </span>
      }
      back
      subtitle={
        season === "1"
          ? `Season 1 · Position ${s1?.pos ?? "—"} · ${s1?.points ?? 0} pts`
          : `Position ${position?.pos ?? "—"} · ${position?.points ?? 0} pts · ${position?.played ?? 0} played`
      }
    >
      <div className="mb-5 border-b border-border">
        <div className="flex gap-1 overflow-x-auto pb-0">
          {visibleTabs.map((t) => (
            <Link
              key={t.id}
              to={t.to}
              params={{ teamSlug }}
              activeOptions={{ exact: true }}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                "data-[status=active]:border-primary data-[status=active]:text-primary",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <Outlet />

    </AppShell>
  );
}
