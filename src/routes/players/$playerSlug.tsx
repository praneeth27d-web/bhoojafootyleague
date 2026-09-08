import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { PlayerContributions, PlayerStatGrid } from "@/components/player-sheet";
import { teamName } from "@/lib/league";
import { useLeague } from "@/lib/league-data";

const prettify = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

export const Route = createFileRoute("/players/$playerSlug")({
  head: ({ params }) => {
    const name = prettify(params.playerSlug);
    return {
      meta: [
        { title: `${name} — BFL Stats` },
        {
          name: "description",
          content: `Player profile for ${name} in the Bhooja Football League: goals, assists, G/A and POTM.`,
        },
        { property: "og:title", content: `${name} — BFL` },
        { property: "og:description", content: `Goals, assists, G/A and POTM for ${name}.` },
      ],
    };
  },
  component: PlayerProfile,
});

function PlayerProfile() {
  const { playerSlug } = Route.useParams();
  const { getPlayer, loading } = useLeague();
  const player = getPlayer(playerSlug);

  if (!player) {
    return (
      <AppShell title={prettify(playerSlug)} back>
        <Card>
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {loading ? "Loading player…" : "This player could not be found."}
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={player.name} subtitle={teamName(player.teamSlug)} back>
      <div className="max-w-2xl space-y-5">
        <Card title="Season stats">
          <div className="px-4 py-4">
            <PlayerStatGrid slug={player.slug} />
          </div>
        </Card>
        <Card title="Recent contributions">
          <div className="px-4 py-4">
            <PlayerContributions slug={player.slug} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
