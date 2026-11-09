import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { validateTransferDeal, validateLoan, rosterForSeason, type DealInput } from "./transfer-deals";

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

describe("Loan rules", () => {
  const loan = { playerId: "a", fromSlug: "arsenal", toSlug: "chelsea", loanFromSlug: null, fee: "0", date: "2026-11-09", loanUntil: "2026-12-09" };
  test("loans allow no fee and an optional end date", () => {
    assert.equal(validateLoan(loan), null);
    assert.equal(validateLoan({ ...loan, loanUntil: "" }), null);
    assert.equal(validateLoan({ ...loan, fee: "5.50" }), null);
    assert.ok(validateLoan({ ...loan, fee: "-1" }));
  });
  test("players already on loan cannot be loaned again", () => {
    assert.ok(validateLoan({ ...loan, loanFromSlug: "juventus" }));
  });
  test("loan clubs must be different", () => {
    assert.ok(validateLoan({ ...loan, toSlug: "arsenal" }));
  });
  test("a loan cannot end before it begins", () => {
    assert.ok(validateLoan({ ...loan, loanUntil: "2026-11-08" }));
    assert.equal(validateLoan({ ...loan, loanUntil: "2026-11-09" }), null);
  });
  test("later-season loans preserve earlier-season clubs and loan status", () => {
    const rosters = [
      { season: 2, player_id: "a", team_slug: "arsenal", captain: false, vice_captain: false, loan_from_slug: null },
      { season: 3, player_id: "a", team_slug: "chelsea", captain: false, vice_captain: false, loan_from_slug: "arsenal" },
    ];
    assert.equal(rosterForSeason(rosters, 2)[0]?.team_slug, "arsenal");
    assert.equal(rosterForSeason(rosters, 2)[0]?.loan_from_slug, null);
    assert.equal(rosterForSeason(rosters, 3)[0]?.loan_from_slug, "arsenal");
  });
});