import { test } from "node:test";
import assert from "node:assert/strict";
import { liveScore, liveSeconds } from "./live-match";

const base = { homeSlug: "a", awaySlug: "b", lineups: [
  { playerId: "p1", side: "home" }, { playerId: "p2", side: "away" },
] } as never as Parameters<typeof liveScore>[0];

test("normal goal counts for the scorer's side", () => {
  assert.deepEqual(liveScore({ ...base, goals: [{ scorerId: "p1", isOwnGoal: false }] as never }), { home: 1, away: 0 });
});

test("own goal after 1-0 makes it 1-1", () => {
  assert.deepEqual(liveScore({ ...base, goals: [{ scorerId: "p1", isOwnGoal: false }, { scorerId: "p1", isOwnGoal: true }] as never }), { home: 1, away: 1 });
});

test("second half clock restarts from the 10th minute", () => {
  const start = new Date(0).toISOString();
  assert.equal(liveSeconds("second", start, 30_000), 630);
  assert.equal(liveSeconds("half_time", start, 999_999), 600);
  assert.equal(liveSeconds("first", start, 65_000), 65);
});
