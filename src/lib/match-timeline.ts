import type { Match } from "./league";

export function hasMatchTimeline(match: Pick<Match, "status" | "livePeriod">) {
  return match.status === "completed" && match.livePeriod === "full_time";
}

export type TimelineEvent = {
  id: string;
  minute: number | null;
  side: "home" | "away";
  playerId: string;
  playerName: string;
  label: string;
  kind: "goal" | "own_goal" | "yellow" | "red" | "second_yellow_red" | "earned" | "missed";
  assistId?: string | null;
  assistName?: string | null;
};

export function matchTimeline(match: Match): TimelineEvent[] {
  const goals: TimelineEvent[] = match.goals.map((goal) => {
    const scorerSide = match.lineups.find((entry) => entry.playerId === goal.scorerId)?.side ??
      (goal.scorerTeamSlug === match.awaySlug ? "away" : "home");
    return {
      id: `goal-${goal.id}`, minute: goal.minute,
      side: goal.isOwnGoal ? (scorerSide === "home" ? "away" : "home") : scorerSide,
      playerId: goal.scorerId, playerName: goal.scorerName,
      label: goal.isOwnGoal ? "Own goal" : goal.isPenalty ? "Penalty goal" : "Goal",
      kind: goal.isOwnGoal ? "own_goal" : "goal",
      assistId: goal.isOwnGoal ? null : goal.assistId,
      assistName: goal.isOwnGoal ? null : goal.assistName,
    };
  });
  return [
    ...goals,
    ...match.cards.map((card): TimelineEvent => ({
      ...card, id: `card-${card.id}`, kind: card.cardType,
      label: card.cardType === "yellow" ? "Yellow card" : card.cardType === "red" ? "Red card" : "Second yellow · red card",
    })),
    ...match.penaltyEvents.map((event): TimelineEvent => ({
      ...event, id: `penalty-${event.id}`, kind: event.eventType,
      label: event.eventType === "earned" ? "Penalty earned" : "Penalty missed",
    })),
  ].sort((a, b) => (a.minute ?? Infinity) - (b.minute ?? Infinity));
}