import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Bhooja Football League — Standings" },
    { name: "description", content: "Follow Bhooja Football League standings, teams and match results." },
    { property: "og:title", content: "Bhooja Football League — Standings" },
    { property: "og:description", content: "League tables, clubs and results from the Bhooja Football League." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/table" });
  },
});
