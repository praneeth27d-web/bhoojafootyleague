import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player } from "@/lib/league";

/**
 * Public contact block shown on the player profile, directly under the
 * player name. The number is a 10-digit Indian mobile stored without
 * the country code.
 */
export function PlayerContact({ player }: { player: Player }) {
  if (!player.phone) return null;
  const tel = `tel:+91${player.phone}`;
  const whatsapp = `https://wa.me/91${player.phone}`;
  const preference = player.contactPreference ?? "both";
  const showCall = preference === "call" || preference === "both";
  const showWhatsapp = preference === "whatsapp" || preference === "both";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={`Contact ${player.name}`}>
      <span className="rounded-md bg-surface-muted px-2.5 py-1.5 text-sm">
        <span className="text-muted-foreground">Contact&nbsp;</span>
        <span className="num font-bold">+91 {player.phone}</span>
      </span>
      {showCall && (
        <Button asChild size="sm" variant="outline">
          <a href={tel} aria-label={`Call ${player.name}`}>
            <Phone className="size-3.5" aria-hidden="true" />
            Call
          </a>
        </Button>
      )}
      {showWhatsapp && (
        <Button asChild size="sm" variant="outline">
          <a href={whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${player.name}`}>
            <MessageCircle className="size-3.5" aria-hidden="true" />
            WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}
