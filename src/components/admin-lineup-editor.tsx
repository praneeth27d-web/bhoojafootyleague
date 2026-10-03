import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { teamName, type Match, type Player } from "@/lib/league";

const inputClass = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

export function AdminLineupEditor({ match, players, refresh }: { match: Match; players: Player[]; refresh: () => Promise<void> }) {
  const [playerId, setPlayerId] = useState("");
  const [side, setSide] = useState<"home" | "away">("home");
  const [role, setRole] = useState<"starter" | "substitute">("starter");
  const [played, setPlayed] = useState(true);
  const [replacement, setReplacement] = useState(false);
  const [eventPlayer, setEventPlayer] = useState("");
  const [eventKind, setEventKind] = useState<"yellow" | "red" | "second_yellow_red" | "earned" | "missed">("yellow");
  const [minute, setMinute] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addLineup() {
    if (!playerId || saving) return;
    setSaving(true); setMessage(null);
    const positionIndex = match.lineups.filter((entry) => entry.side === side && entry.role === role).length;
    const { error } = await supabase.from("match_lineups").upsert({ match_id: match.id, player_id: playerId, side, role, played, is_replacement: replacement, position_index: positionIndex }, { onConflict: "match_id,player_id,side" });
    setSaving(false);
    if (error) setMessage(error.message); else { setPlayerId(""); await refresh(); setMessage("Lineup published."); }
  }

  async function removeLineup(id: string) {
    const { error } = await supabase.from("match_lineups").delete().eq("id", id);
    if (error) setMessage(error.message); else await refresh();
  }

  async function addEvent() {
    if (!eventPlayer || saving) return;
    setSaving(true); setMessage(null);
    const row = { match_id: match.id, player_id: eventPlayer, minute: minute ? Number(minute) : null };
    const result = eventKind === "earned" || eventKind === "missed"
      ? await supabase.from("match_penalty_events").insert({ ...row, event_type: eventKind })
      : await supabase.from("match_cards").insert({ ...row, card_type: eventKind });
    setSaving(false);
    if (result.error) setMessage(result.error.message); else { setEventPlayer(""); setMinute(""); await refresh(); setMessage("Match event published."); }
  }

  async function removeEvent(table: "match_cards" | "match_penalty_events", id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setMessage(error.message); else await refresh();
  }

  return <div className="space-y-4 border-t border-border pt-4">
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Lineup</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <select className={inputClass} value={playerId} onChange={(e) => setPlayerId(e.target.value)}><option value="">Player from any club</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name} · {teamName(p.teamSlug)}</option>)}</select>
        <select className={inputClass} value={side} onChange={(e) => setSide(e.target.value as "home" | "away")}><option value="home">{teamName(match.homeSlug)}</option><option value="away">{teamName(match.awaySlug)}</option></select>
        <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as "starter" | "substitute")}><option value="starter">Starter</option><option value="substitute">Substitute</option></select>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={played} onChange={(e) => setPlayed(e.target.checked)} />Played</label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={replacement} onChange={(e) => setReplacement(e.target.checked)} />Replacement</label>
        <Button type="button" onClick={addLineup} disabled={!playerId || saving}>Add / update</Button>
      </div>
      <ul className="mt-3 divide-y divide-border">{match.lineups.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span><b>{entry.playerName}</b> · {entry.side} · {entry.role}{entry.played ? " · played" : ""}{entry.isReplacement ? " · Replacement" : ""}</span><Button type="button" size="sm" variant="outline" onClick={() => removeLineup(entry.id)}>Remove</Button></li>)}</ul>
    </div>
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Cards & penalties</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select className={inputClass} value={eventPlayer} onChange={(e) => setEventPlayer(e.target.value)}><option value="">Player from any club</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name} · {teamName(p.teamSlug)}</option>)}</select>
        <select className={inputClass} value={eventKind} onChange={(e) => setEventKind(e.target.value as typeof eventKind)}><option value="yellow">Yellow card</option><option value="red">Straight red</option><option value="second_yellow_red">Second-yellow red</option><option value="earned">Penalty earned</option><option value="missed">Penalty missed</option></select>
        <input className={inputClass} type="number" min={1} placeholder="Minute (optional)" value={minute} onChange={(e) => setMinute(e.target.value)} />
        <Button type="button" onClick={addEvent} disabled={!eventPlayer || saving}>Add event</Button>
      </div>
      <ul className="mt-3 divide-y divide-border">{match.cards.map((event) => <li key={event.id} className="flex justify-between py-2 text-sm"><span>{event.playerName} · {event.cardType.replaceAll("_", " ")}</span><Button size="sm" variant="outline" onClick={() => removeEvent("match_cards", event.id)}>Remove</Button></li>)}{match.penaltyEvents.map((event) => <li key={event.id} className="flex justify-between py-2 text-sm"><span>{event.playerName} · penalty {event.eventType}</span><Button size="sm" variant="outline" onClick={() => removeEvent("match_penalty_events", event.id)}>Remove</Button></li>)}</ul>
    </div>
    {message && <p className="text-sm font-semibold text-primary">{message}</p>}
  </div>;
}