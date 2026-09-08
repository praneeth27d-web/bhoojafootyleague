import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { useLeague } from "@/lib/league-data";
import { season1LeagueFinish, season1Playoff, season1Table } from "@/lib/season1";

export const Route = createFileRoute("/teams/$teamSlug/history")({
  component: TeamHistory,
});

function TeamHistory() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { allMatches } = useLeague("all");
  const inSeason1 = season1Table.some((r) => r.slug === teamSlug);
  const final = allMatches.find((m) => m.season === 1 && m.round === "Final") ?? null;


  return (
    <Card title="History">
      {inSeason1 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <caption className="sr-only">Season by season history</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-2 font-semibold">
                  Season
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  League finish
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Playoffs
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">Season 1</td>
                <td className="num px-4 py-3 text-muted-foreground">
                  {season1LeagueFinish(teamSlug)}
                </td>
                <td className="px-4 py-3 font-semibold">{season1Playoff(teamSlug, final)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Season 2</td>
                <td className="px-4 py-3 text-muted-foreground">In progress</td>
                <td className="px-4 py-3 text-muted-foreground">To be played</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">No history yet</p>
          <p className="mt-1">Honours and records will be listed here once played.</p>
        </div>
      )}
    </Card>
  );
}
