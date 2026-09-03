import { Link } from "@tanstack/react-router";
import { formatShortDate, getPlayer, playerContributions } from "@/lib/league";
import { TeamBadge } from "@/components/team-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function PlayerStatGrid({ slug }: { slug: string }) {
  const player = getPlayer(slug);
  if (!player) return null;
  const stats = [
    { label: "Goals", value: player.goals },
    { label: "Assists", value: player.assists },
    { label: "G/A", value: player.goals + player.assists },
    { label: "POTM", value: player.potm },
  ];
  return (
    <dl className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-md border border-border bg-surface-muted px-2 py-3 text-center"
        >
          <dd className="num text-xl font-bold">{s.value}</dd>
          <dt className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

export function PlayerContributions({ slug }: { slug: string }) {
  const rows = playerContributions(slug);
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No recorded contributions yet.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map(({ match, events }) => (
        <li key={match.id} className="py-3">
          <Link
            to="/matches/$matchId"
            params={{ matchId: match.id }}
            className="text-sm font-semibold hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <TeamBadge slug={match.homeSlug} />
              <span className="num">
                {match.homeGoals}–{match.awayGoals}
              </span>
              <TeamBadge slug={match.awaySlug} />
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            MD{match.matchday} · {formatShortDate(match.date)}
          </p>
          <ul className="mt-1 space-y-0.5">
            {events.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {e.minute}&apos; {e.label}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function PlayerSheet({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const player = slug ? getPlayer(slug) : undefined;
  return (
    <Sheet open={!!player} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-surface sm:max-w-lg">
        {player && (
          <>
            <SheetHeader className="px-0">
              <SheetTitle className="text-xl font-extrabold">{player.name}</SheetTitle>
              <TeamBadge slug={player.teamSlug} showName className="text-sm text-muted-foreground" />
            </SheetHeader>
            <div className="mt-4 space-y-5">
              <PlayerStatGrid slug={player.slug} />
              <div>
                <h3 className="mb-1 text-sm font-bold">Recent contributions</h3>
                <PlayerContributions slug={player.slug} />
              </div>
              <Link
                to="/players/$playerSlug"
                params={{ playerSlug: player.slug }}
                className="inline-flex rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Open full profile
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
