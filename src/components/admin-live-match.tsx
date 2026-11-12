import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { teamName, type Match } from "@/lib/league";
import { eventMinute, liveScore, liveSeconds } from "@/lib/live-match";
import { LiveBadge, LiveClock, useNow } from "@/components/live-match";

const inputClass = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

export function AdminLiveMatch({ match, refresh }: { match: Match; refresh: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [scorer, setScorer] = useState("");
  const [assist, setAssist] = useState("");
  const [ownGoal, setOwnGoal] = useState(false);
  const [penalty, setPenalty] = useState(false);
  const live = match.status === "live";
  const now = useNow(live);
  const score = liveScore(match);
  const lineup = match.lineups.filter((l) => l.played || l.role === "starter");
  const scorerEntry = lineup.find((l) => l.playerId === scorer);
  const assistOptions = lineup.filter((l) => l.playerId !== scorer && (!scorerEntry || l.side === scorerEntry.side));

  async function update(patch: TablesUpdate<"matches">, done: string) {
    if (saving) return;
    setSaving(true); setMessage(null);
    const { error } = await supabase.from("matches").update(patch).eq("id", match.id);
    setSaving(false);
    if (error) setMessage(error.message); else { await refresh(); setMessage(done); }
  }

  const nowIso = () => new Date().toISOString();
  const start = () => update({ status: "live", live_period: "first", period_started_at: nowIso(), extra_time_first: 0, extra_time_second: 0, home_goals: score.home, away_goals: score.away }, "Kick-off! Match is live.");
  const halfTime = () => update({ live_period: "half_time", period_started_at: null }, "Half time.");
  const secondHalf = () => update({ live_period: "second", period_started_at: nowIso() }, "Second half under way.");
  const addExtra = (n: number) => {
    const key = match.livePeriod === "second" ? "extra_time_second" : "extra_time_first";
    const cur = match.livePeriod === "second" ? match.extraTimeSecond : match.extraTimeFirst;
    return update({ [key]: Math.max(0, cur + n) }, "Extra time updated.");
  };
  const fullTime = () => {
    if (!window.confirm(`End the match at ${score.home}–${score.away}?`)) return;
    return update({ status: "completed", live_period: "full_time", period_started_at: null, home_goals: score.home, away_goals: score.away }, "Full time — the game is done.");
  };

  async function recordGoal() {
    if (!scorer || saving) return;
    setSaving(true); setMessage(null);
    const minute = eventMinute(match.livePeriod, liveSeconds(match.livePeriod, match.periodStartedAt, now));
    const { error } = await supabase.from("match_goals").insert({ match_id: match.id, scorer_id: scorer, assist_id: ownGoal ? null : assist || null, minute, is_own_goal: ownGoal, is_penalty: ownGoal ? false : penalty });
    if (!error) {
      const after = liveScore({ ...match, goals: [...match.goals, { scorerId: scorer, isOwnGoal: ownGoal } as Match["goals"][number]] });
      await supabase.from("matches").update({ home_goals: after.home, away_goals: after.away }).eq("id", match.id);
    }
    setSaving(false);
    if (error) setMessage(error.message);
    else { setScorer(""); setAssist(""); setOwnGoal(false); setPenalty(false); await refresh(); setMessage("Goal recorded."); }
  }

  async function undoLastGoal() {
    const last = [...match.goals].sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))[0];
    if (!last || !window.confirm(`Remove ${last.scorerName}'s goal?`)) return;
    setSaving(true);
    await supabase.from("match_goals").delete().eq("id", last.id);
    const after = liveScore({ ...match, goals: match.goals.filter((g) => g.id !== last.id) });
    await supabase.from("matches").update({ home_goals: after.home, away_goals: after.away }).eq("id", match.id);
    setSaving(false);
    await refresh();
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Live match (referee)</h3>
        {live && <LiveBadge />}
      </div>
      {match.status === "upcoming" && (
        <Button type="button" onClick={start} disabled={saving}>Start match (kick-off)</Button>
      )}
      {match.status === "completed" && <p className="text-sm text-muted-foreground">Full time — the game is done.</p>}
      {live && (
        <>
          <div className="flex items-center justify-center gap-4 rounded-md bg-surface-muted py-3 text-center">
            <span className="flex-1 text-sm font-semibold">{teamName(match.homeSlug)}</span>
            <span className="num text-3xl font-bold">{score.home}–{score.away}</span>
            <span className="flex-1 text-sm font-semibold">{teamName(match.awaySlug)}</span>
          </div>
          <p className="text-center text-lg font-bold"><LiveClock match={match} /></p>
          <div className="flex flex-wrap justify-center gap-2">
            {match.livePeriod === "first" && <Button type="button" variant="outline" onClick={halfTime} disabled={saving}>Call half time</Button>}
            {match.livePeriod === "half_time" && <Button type="button" onClick={secondHalf} disabled={saving}>Start 2nd half</Button>}
            {match.livePeriod !== "half_time" && <>
              <Button type="button" variant="outline" onClick={() => addExtra(1)} disabled={saving}>+1' extra time</Button>
              <Button type="button" variant="outline" onClick={() => addExtra(-1)} disabled={saving}>−1'</Button>
            </>}
            {match.livePeriod === "second" && <Button type="button" variant="destructive" onClick={fullTime} disabled={saving}>Call full time</Button>}
          </div>
          {lineup.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add the lineup below first — only lineup players can be picked for goals and assists.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <select className={inputClass} value={scorer} onChange={(e) => { setScorer(e.target.value); setAssist(""); }}>
                <option value="">Who scored?</option>
                {(["home", "away"] as const).map((side) => (
                  <optgroup key={side} label={teamName(side === "home" ? match.homeSlug : match.awaySlug)}>
                    {lineup.filter((l) => l.side === side).map((l) => <option key={l.id} value={l.playerId}>{l.playerName}</option>)}
                  </optgroup>
                ))}
              </select>
              <select className={inputClass} value={assist} onChange={(e) => setAssist(e.target.value)} disabled={ownGoal || !scorer}>
                <option value="">No assist</option>
                {assistOptions.map((l) => <option key={l.id} value={l.playerId}>{l.playerName}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={ownGoal} onChange={(e) => setOwnGoal(e.target.checked)} />Own goal (counts for the other team)</label>
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={penalty} disabled={ownGoal} onChange={(e) => setPenalty(e.target.checked)} />Penalty</label>
              <Button type="button" onClick={recordGoal} disabled={!scorer || saving}>Record goal</Button>
              <Button type="button" variant="outline" onClick={undoLastGoal} disabled={saving || match.goals.length === 0}>Undo last goal</Button>
            </div>
          )}
        </>
      )}
      {message && <p className="text-sm font-semibold text-primary">{message}</p>}
    </div>
  );
}
