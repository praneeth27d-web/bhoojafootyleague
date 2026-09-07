import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { PlayerContributions, PlayerStatGrid } from "@/components/player-sheet";
import { getPlayer, teamName } from "@/lib/league";

export const Route = createFileRoute("/players/$playerSlug")({
  loader: ({ params }) => {
    if (!getPlayer(params.playerSlug)) throw notFound();
  },
  head: ({ params }) => ({
    meta: getPlayer(params.playerSlug)
      ? [
          { title: `${getPlayer(params.playerSlug)!.name} — BFL Stats` },
          {
            name: "description",
            content: `Player profile for ${getPlayer(params.playerSlug)!.name} in the Bhooja Football League.`,
          },
          { property: "og:title", content: `${getPlayer(params.playerSlug)!.name} — BFL` },
          {
            property: "og:description",
            content: `Goals, assists, G/A and POTM for ${getPlayer(params.playerSlug)!.name}.`,
          },
        ]
      : [{ title: "Player not found" }, { name: "robots", content: "noindex" }],
  }),
  component: PlayerProfile,
});

function PlayerProfile() {
  const { playerSlug } = Route.useParams();
  const player = getPlayer(playerSlug);
  if (!player) return null;
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
