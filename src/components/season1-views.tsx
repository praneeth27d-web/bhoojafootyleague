import { TeamBadge } from "@/components/team-badge";
import { Card } from "@/components/app-shell";
import { season1Knockouts, season1Table, season1TableNote } from "@/lib/season1";

export function Season1Table({ highlight }: { highlight?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[280px] text-sm">
        <caption className="sr-only">Season 1 final standings</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-semibold">
              Pos
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Team
            </th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">
              Pts
            </th>
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
                <TeamBadge slug={r.slug} showName crestClassName="size-7" />
              </td>
              <td className="num px-4 py-3 text-right font-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        {season1TableNote}
      </p>
    </div>
  );
}

export function Season1Knockouts() {
  return (
    <Card title="Knockouts" className="mt-6">
      <ul className="divide-y divide-border">
        {season1Knockouts.map((k) => (
          <li key={k.id} className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{k.round}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <TeamBadge slug={k.homeSlug} showName className="text-sm" />
              {k.homeGoals === undefined ? (
                <span className="text-xs font-semibold text-muted-foreground">vs</span>
              ) : (
                <span className="num rounded-md bg-surface-muted px-2.5 py-1 text-sm font-bold">
                  {k.homeGoals}–{k.awayGoals}
                </span>
              )}
              <TeamBadge slug={k.awaySlug} showName className="text-sm" />
            </div>
            {k.scorers && (
              <p className="mt-2 text-xs text-muted-foreground">
                Goals:{" "}
                {k.scorers.map((s, i) => (
                  <span key={s.name}>
                    {i > 0 && ", "}
                    {s.name} <span className="num">({s.goals})</span>
                  </span>
                ))}
              </p>
            )}
            {k.homeGoals === undefined && (
              <p className="mt-2 text-xs text-muted-foreground">Result to be added.</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
