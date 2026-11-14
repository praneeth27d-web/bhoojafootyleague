import { test } from "node:test";
import assert from "node:assert/strict";
import type { Match } from "./league";
import { hasMatchTimeline, matchTimeline } from "./match-timeline";

test("timeline only appears after a live-tracked match reaches full time", () => {
  assert.equal(hasMatchTimeline({ status: "completed", livePeriod: "full_time" }), true);
  assert.equal(hasMatchTimeline({ status: "completed", livePeriod: "first" }), false);
  assert.equal(hasMatchTimeline({ status: "live", livePeriod: "second" }), false);
  assert.equal(hasMatchTimeline({ status: "upcoming", livePeriod: "full_time" }), false);
});

const match = {
  homeSlug: "chelsea", awaySlug: "arsenal",
  lineups: [{ playerId: "p1", side: "home", isReplacement: true }],
  goals: [{ id: "g1", minute: 7, scorerId: "p1", scorerName: "Player", isOwnGoal: true, assistId: "p2" }],
  cards: [{ id: "c1", minute: 3, playerId: "p1", side: "home", cardType: "second_yellow_red" }],
  penaltyEvents: [{ id: "e1", minute: null, playerId: "p1", side: "home", eventType: "missed" }],
} as unknown as Match;

test("timeline orders recorded minutes and leaves untimed events last without inventing times", () => {
  assert.deepEqual(matchTimeline(match).map((event) => event.minute), [3, 7, null]);
});

test("own goals appear on the benefiting side and do not display assists", () => {
  const goal = matchTimeline(match).find((event) => event.id === "goal-g1");
  assert.equal(goal?.side, "away");
  assert.equal(goal?.assistId, null);
});

test("timeline retains replacement events and second-yellow dismissals", () => {
  const events = matchTimeline(match);
  assert.equal(events.some((event) => event.playerId === "p1" && event.kind === "own_goal"), true);
  assert.equal(events[0].kind, "second_yellow_red");
});