import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatShortDate, type Transfer } from "@/lib/league";
import { TeamBadge } from "@/components/team-badge";

export function TransferRows({ transfers }: { transfers: Transfer[] }) {
  return (
    <ul className="divide-y divide-border">
      {transfers.map((t) => (
        <li key={t.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to="/players/$playerSlug"
              params={{ playerSlug: t.playerSlug }}
              className="font-semibold hover:text-primary"
            >
              {t.playerName}
            </Link>
            {t.fromSlug ? <TeamBadge slug={t.fromSlug} showName /> : <span>Unattached</span>}
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <TeamBadge slug={t.toSlug} showName />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatShortDate(t.date)}
            {t.note ? ` · ${t.note}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
