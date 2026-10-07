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