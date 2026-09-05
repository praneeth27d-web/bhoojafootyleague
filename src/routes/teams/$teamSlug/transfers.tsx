import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";

export const Route = createFileRoute("/teams/$teamSlug/transfers")({
  component: TeamTransfers,
});

function TeamTransfers() {
  return (
    <Card title="Transfers">
      <div className="py-12 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">No transfers yet</p>
        <p className="mt-1">
          Completed transfers will appear here and will update the squad list.
        </p>
      </div>
    </Card>
  );
}
