import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { MatchRows } from "@/components/league-tables";
import { teams } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

type Search = {
  team?: string | undefined;
  status?: "all" | "completed" | "upcoming" | undefined;
  matchday?: number | undefined;
};

export const Route = createFileRoute("/fixtures-results")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    team: typeof search["team"] === "string" ? search["team"] : undefined,
    status:
      search["status"] === "completed" || search["status"] === "upcoming"
        ? search["status"]
        : "all",
    matchday: search["matchday"] ? Number(search["matchday"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Fixtures & Results — Bhooja Football League" },
      {
        name: "description",
        content: "Every BFL fixture and result with filters by team, status and matchday.",
      },
      { property: "og:title", content: "BFL Fixtures & Results" },
      {
        property: "og:description",
        content: "Completed results and upcoming fixtures for the BFL.",
      },
    ],
  }),
  component: FixturesResults,
});

const selectClass =
  "appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus-visible:outline-none [&>option]:bg-surface [&>option]:text-foreground";

function FixturesResults() {
  const { team, status, matchday } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { matches, matchdays } = useLeague();

  const filtered = matches.filter(
    (m) =>
      (!team || m.homeSlug === team || m.awaySlug === team) &&
      (!status || status === "all" || m.status === status) &&
      (!matchday || m.matchday === matchday),
  );

  const update = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <AppShell title="Fixtures & Results" subtitle="Single round-robin · 10 matches">
      <Card title="Filters" className="mb-5">
        <div className="flex flex-wrap gap-3 px-4 py-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
            Team
            <select
              className={selectClass}
              value={team ?? ""}
              onChange={(e) => update({ team: e.target.value || undefined })}
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
            Status
            <select
              className={selectClass}
              value={status ?? "all"}
              onChange={(e) => update({ status: e.target.value as Search["status"] })}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
            Matchday
            <select
              className={selectClass}
              value={matchday ?? ""}
              onChange={(e) =>
                update({ matchday: e.target.value ? Number(e.target.value) : undefined })
              }
            >
              <option value="">All matchdays</option>
              {matchdays.map((md) => (
                <option key={md} value={md}>
                  Matchday {md}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>
      <Card title={`${filtered.length} match${filtered.length === 1 ? "" : "es"}`}>
        <MatchRows matches={filtered} />
      </Card>
    </AppShell>
  );
}
