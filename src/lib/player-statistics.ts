export type StatMatch = { id: string; status: string; potm_player_id: string | null };
export type StatGoal = { match_id: string; scorer_id: string; assist_id: string | null; is_penalty: boolean; is_own_goal: boolean };
export type StatLineup = { match_id: string; player_id: string; played: boolean; is_replacement: boolean };
export type StatCard = { match_id: string; player_id: string; card_type: string };
export type StatPenalty = { match_id: string; player_id: string; event_type: string };

export function calculatePlayerStatistics(playerId: string, data: { matches: StatMatch[]; goals: StatGoal[]; lineups: StatLineup[]; cards: StatCard[]; penaltyEvents: StatPenalty[] }) {
  const completed = new Set(data.matches.filter((m) => m.status === "completed").map((m) => m.id));
  const replacements = new Set(data.lineups.filter((l) => l.player_id === playerId && l.is_replacement).map((l) => l.match_id));
  const eligible = (matchId: string) => completed.has(matchId) && !replacements.has(matchId);
  const goals = data.goals.filter((g) => eligible(g.match_id) && !g.is_own_goal);
  const scored = goals.filter((g) => g.scorer_id === playerId);
  const cards = data.cards.filter((c) => c.player_id === playerId && eligible(c.match_id));
  const penalties = data.penaltyEvents.filter((e) => e.player_id === playerId && eligible(e.match_id));
  const penaltyGoals = scored.filter((g) => g.is_penalty).length;
  const penaltiesMissed = penalties.filter((e) => e.event_type === "missed").length;
  const attempts = penaltyGoals + penaltiesMissed;
  return {
    appearances: new Set(data.lineups.filter((l) => l.player_id === playerId && l.played && eligible(l.match_id)).map((l) => l.match_id)).size,
    goals: scored.length,
    assists: goals.filter((g) => g.assist_id === playerId).length,
    potm: data.matches.filter((m) => m.potm_player_id === playerId && eligible(m.id)).length,
    penaltyGoals,
    penaltiesMissed,
    penaltiesEarned: penalties.filter((e) => e.event_type === "earned").length,
    penaltyConversion: attempts ? penaltyGoals / attempts * 100 : null,
    yellowCards: cards.reduce((total, card) => total + (card.card_type === "second_yellow_red" ? 2 : card.card_type === "yellow" ? 1 : 0), 0),
    redCards: cards.filter((c) => c.card_type === "red" || c.card_type === "second_yellow_red").length,
  };
}