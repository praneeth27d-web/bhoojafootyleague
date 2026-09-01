import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, EmptyState } from "@/components/app-shell";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — Bhooja Football League" },
      { name: "description", content: "Latest news and updates from the Bhooja Football League." },
      { property: "og:title", content: "BFL News" },
      { property: "og:description", content: "Latest news from the Bhooja Football League." },
    ],
  }),
  component: News,
});

function News() {
  return (
    <AppShell title="News">
      <EmptyState message="No news published yet." />
    </AppShell>
  );
}
