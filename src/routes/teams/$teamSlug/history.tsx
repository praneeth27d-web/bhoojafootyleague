import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app-shell";

export const Route = createFileRoute("/teams/$teamSlug/history")({
  component: TeamHistory,
});

function TeamHistory() {
  return (
    <Card title="History">
      <div className="py-12 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">No history yet</p>
        <p className="mt-1">
          This is the club's first BFL season — honours and records will be
          listed here once played.
        </p>
      </div>
    </Card>
  );
}
