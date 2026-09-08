import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { TeamBadge } from "@/components/team-badge";
import { Card } from "@/components/app-shell";
import { season1Knockouts, season1Table } from "@/lib/season1";

export function Season1Table({ highlight }: { highlight?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <caption className="sr-only">Season 1 final standings</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-semibold">
              Pos
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Team
            </th>
            {["MP", "W", "D", "L", "GD", "Pts"].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-right font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {season1Table.map((r) => (
            <tr
              key={r.slug}
              className={
                "border-b border-border last:border-0 transition-colors hover:bg-accent " +
                (highlight === r.slug ? "bg-primary/5" : "")
              }
            >
              <td className="py-3 pl-0 pr-4">
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      "block h-7 w-1 rounded-r-sm " +
                      (r.pos === 1 ? "bg-pos-top" : r.pos <= 3 ? "bg-pos-mid" : "bg-pos-low")
                    }
                  />
                  <span className="num text-muted-foreground">{r.pos}</span>
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  to="/teams/$teamSlug"
                  params={{ teamSlug: r.slug }}
                  className="inline-flex rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TeamBadge slug={r.slug} showName crestClassName="size-7" />
                </Link>
              </td>
              {[r.played, r.won, r.drawn, r.lost].map((v, i) => (
                <td key={i} className="num px-3 py-3 text-right text-muted-foreground">
                  {v}
                </td>
              ))}
              <td className="num px-3 py-3 text-right text-muted-foreground">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
              <td className="num px-3 py-3 text-right font-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PositionLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <span className="block h-4 w-1 rounded-r-sm bg-pos-top" />
        Green — Qualified
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="block h-4 w-1 rounded-r-sm bg-pos-mid" />
        Orange — Playoffs
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="block h-4 w-1 rounded-r-sm bg-pos-low" />
        Red — Disqualified
      </span>
    </div>
  );
}

export function Season1Knockouts() {
  return (
    <Card title="Knockouts" className="mt-6">
      <ul className="divide-y divide-border">
        {season1Knockouts.map((k) => (
          <li key={k.id}>
            <Link
              to="/season-1/$knockoutId"
              params={{ knockoutId: k.id }}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                  {k.round}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-3">
                  <TeamBadge slug={k.homeSlug} showName className="text-sm" />
                  {k.homeGoals === undefined ? (
                    <span className="text-xs font-semibold text-muted-foreground">vs</span>
                  ) : (
                    <span className="num rounded-md bg-surface-muted px-2.5 py-1 text-sm font-bold">
                      {k.homeGoals}–{k.awayGoals}
                    </span>
                  )}
                  <TeamBadge slug={k.awaySlug} showName className="text-sm" />
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
