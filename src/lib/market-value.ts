/** Numeric ordering only; preserve the administrator's original display text. */
export function marketValueAmount(value: string | null): number {
  if (!value) return -1;
  const text = value.toLowerCase().replace(/,/g, "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|lakh|l|billions?|bn|b|millions?|mn|m|thousands?|k)?\b/);
  if (!match) return -1;
  const amount = Number(match[1]);
  const unit = match[2] ?? "";
  const multiplier = /^(cr|crore)/.test(unit) ? 10_000_000
    : /^(l|lac|lakh)$/.test(unit) || /^(lakhs|lacs)$/.test(unit) ? 100_000
    : /^(b|bn|billion)/.test(unit) ? 1_000_000_000
    : /^(m|mn|million)/.test(unit) ? 1_000_000
    : /^(k|thousand)/.test(unit) ? 1_000 : 1;
  return amount * multiplier;
}

/** Average of the five highest-valued players, treating an unset market value as zero. */
export function superAverageValue(players: { marketValue: string | null }[]): number {
  const top5 = players
    .map((p) => Math.max(0, marketValueAmount(p.marketValue)))
    .sort((a, b) => b - a)
    .slice(0, 5);
  return top5.length > 0 ? top5.reduce((sum, v) => sum + v, 0) / top5.length : 0;
}

/** Squad value totals treat an unset market value as zero. */
export function squadValueStats(players: { marketValue: string | null }[]) {
  const total = players.reduce((sum, p) => sum + Math.max(0, marketValueAmount(p.marketValue)), 0);
  return {
    total,
    average: players.length > 0 ? total / players.length : 0,
    superAverage: superAverageValue(players),
  };
}

/** Rupee amount to the administrator's crores display format, e.g. ₹35.83cr */
export function formatCr(amount: number): string {
  const cr = Math.round((amount / 10_000_000) * 100) / 100;
  return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)}cr`;
}