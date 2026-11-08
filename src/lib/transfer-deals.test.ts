import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { validateTransferDeal, rosterForSeason, type DealInput } from "./transfer-deals";

const cash: DealInput = { dealType: "cash", playerId: "a", fromSlug: "arsenal", toSlug: "chelsea", swapPlayerId: "", fee: "20", feePayerSlug: "chelsea" };
describe("Transfer deal rules", () => {
  test("cash purchase requires a positive fee from the buying club", () => {
    assert.equal(validateTransferDeal(cash), null);
    assert.ok(validateTransferDeal({ ...cash, fee: "0" }));
    assert.ok(validateTransferDeal({ ...cash, feePayerSlug: "arsenal" }));
  });
  test("swap trades different players from opposite clubs without requiring a fee", () => {
    const swap: DealInput = { ...cash, dealType: "swap", swapPlayerId: "b", swapTeamSlug: "chelsea", fee: "0" };
    assert.equal(validateTransferDeal(swap), null);
    assert.ok(validateTransferDeal({ ...swap, swapPlayerId: "a" }));
    assert.ok(validateTransferDeal({ ...swap, swapTeamSlug: "juventus" }));
  });
  test("swap can include money paid by either participating club", () => {
    const swap: DealInput = { ...cash, dealType: "swap", swapPlayerId: "b", swapTeamSlug: "chelsea", fee: "5.50" };
    assert.equal(validateTransferDeal(swap), null);
    assert.equal(validateTransferDeal({ ...swap, feePayerSlug: "arsenal" }), null);
    assert.ok(validateTransferDeal({ ...swap, feePayerSlug: "juventus" }));
    assert.ok(validateTransferDeal({ ...swap, fee: "-5" }));
  });
  test("season 3 transfers do not overwrite season 2 squad selection", () => {
    const rosters = [
      { season: 2, player_id: "a", team_slug: "arsenal", captain: true, vice_captain: false },
      { season: 3, player_id: "a", team_slug: "chelsea", captain: false, vice_captain: false },
    ];
    assert.equal(rosterForSeason(rosters, 2)[0]?.team_slug, "arsenal");
    assert.equal(rosterForSeason(rosters, 3)[0]?.team_slug, "chelsea");
    assert.equal(rosterForSeason(rosters, 4)[0]?.team_slug, "chelsea");
  });
});