import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { TransferRows } from "@/components/transfer-rows";
import { useLeague } from "@/lib/league-data";

export const Route = createFileRoute("/transfers")({
  head: () => ({
    meta: [
      { title: "Transfers — Bhooja Football League" },
      {
        name: "description",
        content:
          "Bhooja Football League cash transfers, player swaps and loans, with deal fees and club moves by season.",
      },
      { property: "og:title", content: "BFL Transfers" },
      {
        property: "og:description",
        content: "Transfer activity for the Bhooja Football League. Squads can change.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Transfers,
});

function Transfers() {
  const { transfers } = useLeague();
  return (
    <AppShell title="Transfers" subtitle="Squads can change through transfers">
      <div className="max-w-2xl space-y-5">
        <Card title="Latest transfers">
          {transfers.length > 0 ? (
            <TransferRows transfers={transfers} />
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No transfers completed yet.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
