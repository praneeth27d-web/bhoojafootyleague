import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { marketValueAmount, superAverageValue } from "./market-value";

const p = (marketValue: string | null) => ({ marketValue });

describe("market-value", () => {
  it("parses crore and lakh display text numerically", () => {
    assert.equal(marketValueAmount("₹35cr"), 350_000_000);
    assert.equal(marketValueAmount("50 lakhs"), 5_000_000);
    assert.equal(marketValueAmount(null), -1);
    assert.equal(marketValueAmount("not set"), -1);
  });

  it("super average is the mean of the five highest-valued players", () => {
    const squad = [p("40cr"), p("35cr"), p("30cr"), p("25cr"), p("20cr"), p("5cr")];
    // (40+35+30+25+20) / 5 = 30cr; the ₹5cr player is excluded.
    assert.equal(superAverageValue(squad), 300_000_000);
  });

  it("super average uses all players when the squad has fewer than five", () => {
    assert.equal(superAverageValue([p("30cr"), p("20cr")]), 250_000_000);
    assert.equal(superAverageValue([]), 0);
  });

  it("super average treats unset values as zero", () => {
    const squad = [p("50cr"), p(null), p(null), p(null), p(null), p(null)];
    assert.equal(superAverageValue(squad), 100_000_000);
  });
});
