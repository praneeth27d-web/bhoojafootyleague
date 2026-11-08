import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeftRight, Banknote } from "lucide-react";
import { formatShortDate, teamName, type Transfer } from "@/lib/league";
import { transferFeeLabel } from "@/lib/transfer-deals";
import { TeamBadge } from "@/components/team-badge";

export function TransferRows({ transfers }: { transfers: Transfer[] }) {
  return (
    <ul className="divide-y divide-border">
      {transfers.map((t) => (
        <li key={t.id} className="px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            {t.dealType === "swap" ? <ArrowLeftRight className="size-3.5" /> : <Banknote className="size-3.5" />}
            {t.dealType === "swap" ? "Swap deal" : t.dealType === "cash" ? "All cash deal" : "Transfer"}
            <span className="text-foreground">{t.dealType === "swap" && t.feeCr === 0 ? "No additional fee" : transferFeeLabel(t.feeCr)}</span>
          </div>
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
          {t.dealType === "swap" && t.swapPlayerSlug && <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <Link to="/players/$playerSlug" params={{ playerSlug: t.swapPlayerSlug }} className="font-semibold hover:text-primary">{t.swapPlayerName}</Link>
            <TeamBadge slug={t.toSlug} showName /><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />{t.fromSlug && <TeamBadge slug={t.fromSlug} showName />}
          </div>}
          {t.feePayerSlug && Number(t.feeCr) > 0 && <p className="mt-2 text-xs text-muted-foreground">{teamName(t.feePayerSlug)} pays {transferFeeLabel(t.feeCr)} to {teamName(t.feePayerSlug === t.toSlug ? t.fromSlug ?? "" : t.toSlug)}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {formatShortDate(t.date)}
            {t.note ? ` · ${t.note}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
