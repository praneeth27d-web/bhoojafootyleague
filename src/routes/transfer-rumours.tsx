import { createFileRoute } from "@tanstack/react-router";
import { AppShell, EmptyState } from "@/components/app-shell";

export const Route = createFileRoute("/transfer-rumours")({
  head: () => ({
    meta: [
      { title: "Transfer Rumours — Bhooja Football League" },
      {
        name: "description",
        content: "Transfer rumours and speculation around the Bhooja Football League.",
      },
      { property: "og:title", content: "BFL Transfer Rumours" },
      { property: "og:description", content: "Transfer rumours from the Bhooja Football League." },
    ],
  }),
  component: TransferRumours,
});

function TransferRumours() {
  return (
    <AppShell title="Transfer Rumours">
      <EmptyState message="No transfer rumours published yet." />
    </AppShell>
  );
}
