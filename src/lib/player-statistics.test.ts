import { describe, expect, test } from "bun:test";
import { calculatePlayerStatistics, compareStatisticValues, type StatGoal } from "./player-statistics";

const goal = (match_id: string, scorer_id: string, is_own_goal = true): StatGoal => ({
  match_id, scorer_id, is_own_goal, assist_id: null, is_penalty: false,
});

describe("Own Goals", () => {
  test("counts own goals separately from goals and G/A in completed matches", () => {
    const stats = calculatePlayerStatistics("player", {
      matches: [{ id: "done", status: "completed", potm_player_id: null }, { id: "next", status: "upcoming", potm_player_id: null }],
      goals: [goal("done", "player"), goal("done", "player"), goal("done", "player", false), goal("done", "other"), goal("next", "player")],
      lineups: [], cards: [], penaltyEvents: [],
    });
    expect(stats.ownGoals).toBe(2);
    expect(stats.goals + stats.assists).toBe(1);
  });

  test("excludes own goals scored as a replacement", () => {
    const stats = calculatePlayerStatistics("player", {
      matches: [{ id: "done", status: "completed", potm_player_id: null }],
      goals: [goal("done", "player")],
      lineups: [{ match_id: "done", player_id: "player", played: true, is_replacement: true }],
      cards: [], penaltyEvents: [],
    });
    expect(stats.ownGoals).toBe(0);
  });

  test("ranks fewer own goals first and treats equal counts as tied", () => {
    expect([3, 0, 1].sort((a, b) => compareStatisticValues(a, b, "lower"))).toEqual([0, 1, 3]);
    expect(compareStatisticValues(1, 1, "lower")).toBe(0);
  });
});