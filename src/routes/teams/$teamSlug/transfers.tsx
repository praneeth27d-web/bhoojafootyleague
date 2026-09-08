import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";
import { TransferRows } from "@/components/transfer-rows";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/teams/$teamSlug/transfers")({
  component: TeamTransfers,
});

function TeamTransfers() {
  const { teamSlug } = useParams({ from: "/teams/$teamSlug" });
  const { transfers } = useLeague();
  const rows = transfers.filter((t) => t.fromSlug === teamSlug || t.toSlug === teamSlug);

  return (
    <Card title="Transfers">
      {rows.length > 0 ? (
        <TransferRows transfers={rows} />
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">No transfers yet</p>
          <p className="mt-1">
            Completed transfers will appear here and will update the squad list.
          </p>
        </div>
      )}
    </Card>
  );
}
