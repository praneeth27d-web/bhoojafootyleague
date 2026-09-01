import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { PlayerSheet } from "@/components/player-sheet";
import { players, teamName } from "@/lib/league";
import { Link } from "@tanstack/react-router";

const sortKeys = ["player", "team", "goals", "assists", "ga", "potm"] as const;
type SortKey = (typeof sortKeys)[number];
type Search = { sort: SortKey; dir: "asc" | "desc" };

export const Route = createFileRoute("/stats")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    sort: sortKeys.includes(search["sort"] as SortKey) ? (search["sort"] as SortKey) : "ga",
    dir: search["dir"] === "asc" ? "asc" : "desc",
  }),
  head: () => ({
    meta: [
      { title: "Player Stats — Bhooja Football League" },
      {
        name: "description",
        content: "Sortable BFL player statistics: goals, assists, G/A and Player of the Match awards.",
      },
      { property: "og:title", content: "BFL Player Stats" },
      { property: "og:description", content: "Goals, assists, G/A and POTM awards for every BFL player." },
    ],
  }),
  component: StatsPage,
});

const columns: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "player", label: "Player" },
  { key: "team", label: "Team" },
  { key: "goals", label: "Goals", numeric: true },
  { key: "assists", label: "Assists", numeric: true },
  { key: "ga", label: "G/A", numeric: true },
  { key: "potm", label: "POTM", numeric: true },
];

function StatsPage() {
  const { sort, dir } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [selected, setSelected] = useState<string | null>(null);

  const value = (p: (typeof players)[number], key: SortKey) => {
    switch (key) {
      case "player":
        return p.name;
      case "team":
        return teamName(p.teamSlug);
      case "ga":
        return p.goals + p.assists;
      default:
        return p[key];
    }
  };

  const rows = [...players].sort((a, b) => {
    const av = value(a, sort);
    const bv = value(b, sort);
    const cmp =
      typeof av === "string" && typeof bv === "string"
        ? av.localeCompare(bv)
        : Number(av) - Number(bv);
    return dir === "asc" ? cmp || a.name.localeCompare(b.name) : -cmp || a.name.localeCompare(b.name);
  });

  const toggle = (key: SortKey) =>
    navigate({
      search: (prev) => ({
        ...prev,
        sort: key,
        dir: prev.sort === key && prev.dir === "desc" ? "asc" : "desc",
      }),
      replace: true,
    });

  return (
    <AppShell title="Player Stats" subtitle="Tap a column to sort · tap a player for their profile">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={sort === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}
                    className={c.numeric ? "px-3 py-2 text-right" : "px-4 py-2"}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={
                        "inline-flex items-center gap-1 font-semibold uppercase " +
                        (sort === c.key ? "text-primary" : "hover:text-foreground")
                      }
                      aria-label={`Sort by ${c.label}`}
                    >
                      {c.label}
                      {sort === c.key &&
                        (dir === "asc" ? (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        ))}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.slug} className="border-b border-border last:border-0 hover:bg-accent">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(p.slug)}
                      className="font-semibold hover:text-primary"
                      aria-label={`Open profile for ${p.name}`}
                    >
                      {p.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link
                      to="/teams/$teamSlug/squad"
                      params={{ teamSlug: p.teamSlug }}
                      className="hover:text-primary"
                    >
                      {teamName(p.teamSlug)}
                    </Link>
                  </td>
                  <td className="num px-3 py-3 text-right">{p.goals}</td>
                  <td className="num px-3 py-3 text-right">{p.assists}</td>
                  <td className="num px-3 py-3 text-right font-bold">{p.goals + p.assists}</td>
                  <td className="num px-3 py-3 text-right">{p.potm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <PlayerSheet slug={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}
