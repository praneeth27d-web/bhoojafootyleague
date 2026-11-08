export type DealType = "cash" | "swap";
export type DealInput = {
  dealType: DealType; playerId: string; fromSlug: string; toSlug: string;
  swapPlayerId: string; swapTeamSlug?: string; fee: string; feePayerSlug: string;
};

export function validateTransferDeal(deal: DealInput): string | null {
  if (!deal.playerId) return "Choose a player.";
  if (!deal.fromSlug || deal.fromSlug === deal.toSlug) return "Choose a different joining club.";
  if (!/^\d+(\.\d{1,2})?$/.test(deal.fee) || !Number.isFinite(Number(deal.fee))) return "Enter a non-negative fee with at most two decimal places.";
  const fee = Number(deal.fee);
  if (deal.dealType === "cash" && fee <= 0) return "Cash deals need a fee greater than zero.";
  if (deal.dealType === "swap" && (!deal.swapPlayerId || deal.swapPlayerId === deal.playerId || deal.swapTeamSlug !== deal.toSlug)) return "Choose a different player from the joining club for the swap.";
  if (fee > 0 && ![deal.fromSlug, deal.toSlug].includes(deal.feePayerSlug)) return "Choose the club paying the fee.";
  if (deal.dealType === "cash" && deal.feePayerSlug !== deal.toSlug) return "The joining club pays the cash fee.";
  return null;
}

export type SeasonRoster = { season: number; player_id: string; team_slug: string; captain: boolean; vice_captain: boolean; loan_from_slug?: string | null; loan_until?: string | null };

export function rosterForSeason(rosters: SeasonRoster[], season: number): SeasonRoster[] {
  const rosterSeason = Math.max(0, ...rosters.filter((r) => r.season <= season).map((r) => r.season));
  return rosters.filter((r) => r.season === rosterSeason);
}

export function transferFeeLabel(feeCr: number | null): string {
  return feeCr === null ? "Fee not recorded" : `₹${feeCr}cr`;
}