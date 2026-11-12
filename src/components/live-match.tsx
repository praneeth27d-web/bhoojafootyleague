import { useEffect, useState } from "react";
import type { Match } from "@/lib/league";
import { formatClock, HALF_MINUTES, liveScore, liveSeconds, periodLabel } from "@/lib/live-match";

export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-destructive-foreground" />
      Live
    </span>
  );
}

/** Clock text such as "07:32", "10:00 +2'", "Half time". */
export function LiveClock({ match }: { match: Match }) {
  const running = match.status === "live" && (match.livePeriod === "first" || match.livePeriod === "second");
  const now = useNow(running);
  if (match.livePeriod === "half_time") return <span>Half time</span>;
  const secs = liveSeconds(match.livePeriod, match.periodStartedAt, now);
  const extra = match.livePeriod === "second" ? match.extraTimeSecond : match.extraTimeFirst;
  const cap = (match.livePeriod === "second" ? 2 : 1) * HALF_MINUTES * 60;
  return (
    <span className="num">
      {formatClock(secs)}
      {extra > 0 && <span className="text-destructive"> +{extra}'</span>}
      {secs >= cap && <span className="text-muted-foreground"> · {periodLabel(match.livePeriod)} stoppage</span>}
    </span>
  );
}

export function liveScoreOf(match: Match) {
  return liveScore(match);
}
