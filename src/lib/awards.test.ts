import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { defensiveRecord, tournamentScore } from "./awards";
import type { Match, Player } from "./league";

const lineup = (playerId: string, side: "home" | "away", extra: Partial<Match["lineups"][number]> = {}) => ({
  id: playerId + side, playerId, playerSlug: playerId, playerName: playerId, playerTeamSlug: null, jerseyNumber: null,
  captain: false, viceCaptain: false, side, role: "starter" as const, positionIndex: 0, played: true, isReplacement: false, ...extra,
});
const match = (home: number, away: number, lineups: Match["lineups"]): Match => ({ livePeriod: "full_time", periodStartedAt: null, extraTimeFirst: 0, extraTimeSecond: 0,
  id: Math.random().toString(), season: 2, matchday: 1, date: "", homeSlug: "a", awaySlug: "b", status: "completed",
  homeGoals: home, awayGoals: away, goals: [], lineups, cards: [], penaltyEvents: [], homeFormation: "", awayFormation: "",
});

describe("awards", () => {
  it("counts keeper clean sheets and conceded, skipping replacement games", () => {
    const r = defensiveRecord("gk", [
      match(3, 0, [lineup("gk", "home")]),
      match(1, 2, [lineup("gk", "home")]),
      match(0, 5, [lineup("gk", "home", { isReplacement: true })]),
    ], true);
    assert.deepEqual(r, { played: 2, conceded: 2, cleanSheets: 1, perGame: 1 });
  });

  it("weights POTM three times in Player of the Tournament", () => {
    assert.equal(tournamentScore({ potm: 2, goals: 4, assists: 1 } as Player), 11);
  });
});
