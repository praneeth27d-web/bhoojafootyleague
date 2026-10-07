import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Player } from "@/lib/league";

const inputClass = "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground";

export function AdminPlayerDetails({ player, refresh }: { player: Player; refresh: () => Promise<void> }) {
  const [position, setPosition] = useState(player.position ?? "");
  const [marketValue, setMarketValue] = useState(player.marketValue ?? "");
  const [foot, setFoot] = useState(player.preferredFoot ?? "");
  const [jersey, setJersey] = useState(player.jerseyNumber?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setMessage(null); setFailed(false);
    try {
      const { data, error } = await supabase.from("players").update({ position: position.trim() || null, market_value: marketValue.trim() || null, preferred_foot: foot || "right", jersey_number: jersey === "" ? null : Number(jersey) }).eq("id", player.id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("Player details were not saved.");
      await refresh();
      setMessage("Player details published.");
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : "Unable to save player details.");
    } finally { setSaving(false); }
  }

  return <form onSubmit={save} aria-label={`Details for ${player.name}`} className="mt-3 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <label className="text-xs font-semibold text-muted-foreground">Position<input aria-label={`Position for ${player.name}`} className={inputClass} value={position} onChange={(e) => setPosition(e.target.value)} maxLength={80} /></label>
    <label className="text-xs font-semibold text-muted-foreground">Market Value<input aria-label={`Market value for ${player.name}`} className={inputClass} value={marketValue} onChange={(e) => setMarketValue(e.target.value)} maxLength={80} /></label>
    <label className="text-xs font-semibold text-muted-foreground">Preferred Foot<select aria-label={`Preferred foot for ${player.name}`} className={inputClass} value={foot} onChange={(e) => setFoot(e.target.value)}><option value="">Not set</option><option value="right">Right</option><option value="left">Left</option><option value="both">Both</option></select></label>
    <label className="text-xs font-semibold text-muted-foreground">Jersey Number<input aria-label={`Jersey number for ${player.name}`} className={inputClass} type="number" min={0} max={99} step={1} value={jersey} onChange={(e) => setJersey(e.target.value)} /></label>
    <div className="flex items-end"><Button type="submit" disabled={saving} aria-label={`Save details for ${player.name}`}>{saving ? "Saving…" : "Save details"}</Button></div>
    {message && <p role="status" className={`text-sm sm:col-span-2 lg:col-span-5 ${failed ? "text-destructive" : "text-primary"}`}>{message}</p>}
  </form>;
}