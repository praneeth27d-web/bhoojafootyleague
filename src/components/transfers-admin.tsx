import { useState, type FormEvent } from "react";
import { ArrowLeftRight, Banknote, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { TransferRows } from "@/components/transfer-rows";
import { supabase } from "@/integrations/supabase/client";
import { teams, teamName } from "@/lib/league";
import { useLeague } from "@/lib/league-data";
import { validateTransferDeal, type DealType } from "@/lib/transfer-deals";

const inputClass = "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const labelClass = "block text-xs font-semibold text-muted-foreground";

export function TransfersAdmin({ league, refresh, activeSeason }: { league: ReturnType<typeof useLeague>; refresh: () => Promise<void>; activeSeason: number }) {
  const [dealType, setDealType] = useState<DealType>("cash");
  const [playerId, setPlayerId] = useState("");
  const [to, setTo] = useState(teams[0]?.slug ?? "");
  const [swapPlayerId, setSwapPlayerId] = useState("");
  const [fee, setFee] = useState("");
  const [payer, setPayer] = useState("joining");
  const [date, setDate] = useState(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const player = league.getPlayerById(playerId);
  const rows = league.transfers.filter((t) => t.season === activeSeason);
  const feePayerSlug = dealType === "cash" || payer === "joining" ? to : player?.teamSlug ?? "";

  async function record(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSuccess("");
    const feeValue = dealType === "swap" && !fee ? "0" : fee;
    const validation = validateTransferDeal({ dealType, playerId, fromSlug: player?.teamSlug ?? "", toSlug: to, swapPlayerId, swapTeamSlug: league.getPlayerById(swapPlayerId)?.teamSlug ?? "", fee: feeValue, feePayerSlug });
    setError(validation);
    if (validation) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.rpc("record_transfer_deal", {
        p_season: activeSeason, p_player_id: playerId, p_to_slug: to, p_deal_type: dealType,
        p_fee_cr: Number(feeValue), p_fee_payer_slug: feePayerSlug,
        ...(dealType === "swap" ? { p_swap_player_id: swapPlayerId } : {}),
        p_happened_on: date, p_note: note,
      });
      if (err) throw err;
      await refresh();
      setSuccess(`${dealType === "swap" ? "Swap deal" : "Cash deal"} saved for Season ${activeSeason}.`);
      setPlayerId(""); setSwapPlayerId(""); setFee(""); setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this transfer. Please try again.");
    } finally { setSaving(false); }
  }

  async function removeTransfer(id: string) {
    if (!window.confirm("Delete this transfer record? This does not reverse the squad changes. This cannot be undone.")) return;
    const { error: err } = await supabase.from("transfers").delete().eq("id", id);
    if (err) setError(err.message); else await refresh();
  }

  return <>
    <Card title="Record a transfer">
      <form onSubmit={record} className="space-y-4 px-4 py-4">
        <div className="flex flex-wrap gap-2" aria-label="Deal type">
          <Button type="button" variant={dealType === "cash" ? "default" : "outline"} aria-pressed={dealType === "cash"} onClick={() => { setDealType("cash"); setSwapPlayerId(""); setFee(""); }}><Banknote />All cash deal</Button>
          <Button type="button" variant={dealType === "swap" ? "default" : "outline"} aria-pressed={dealType === "swap"} onClick={() => { setDealType("swap"); setFee(""); }}><ArrowLeftRight />Swap deal</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>Player<select required className={inputClass} value={playerId} onChange={(e) => { setPlayerId(e.target.value); setSwapPlayerId(""); const selected = league.getPlayerById(e.target.value); if (selected?.teamSlug === to) setTo(teams.find((t) => t.slug !== selected.teamSlug)?.slug ?? ""); }}><option value="">Choose player</option>{league.players.map((p) => <option key={p.id} value={p.id}>{p.name} · {teamName(p.teamSlug)}</option>)}</select></label>
          <label className={labelClass}>Joining club<select className={inputClass} value={to} onChange={(e) => { setTo(e.target.value); setSwapPlayerId(""); }}>{teams.filter((t) => t.slug !== player?.teamSlug).map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
          {dealType === "swap" && <label className={labelClass}>Player exchanged<select required className={inputClass} value={swapPlayerId} onChange={(e) => setSwapPlayerId(e.target.value)}><option value="">Choose swap player</option>{league.players.filter((p) => p.teamSlug === to && p.id !== playerId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
          <label className={labelClass}>{dealType === "cash" ? "Transfer fee (₹cr)" : "Additional fee (₹cr, optional)"}<input type="number" required={dealType === "cash"} min={dealType === "cash" ? "0.01" : "0"} step="0.01" className={inputClass} value={fee} onChange={(e) => setFee(e.target.value)} placeholder={dealType === "swap" ? "0" : "Enter fee"} /></label>
          {dealType === "swap" && Number(fee) > 0 && <label className={labelClass}>Fee paid by<select className={inputClass} value={payer} onChange={(e) => setPayer(e.target.value)}><option value="joining">{teamName(to)}</option>{player && <option value="selling">{teamName(player.teamSlug)}</option>}</select></label>}
          <label className={labelClass}>Date<input required type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className={labelClass}>Note (optional)<input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        </div>
        <Button type="submit" disabled={saving}><Save />{saving ? "Saving…" : "Save transfer"}</Button>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {success && <p role="status" className="text-sm font-semibold text-primary">{success}</p>}
      </form>
    </Card>
    <Card title={`Transfers · Season ${activeSeason} (${rows.length})`}>
      {rows.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">No transfers yet.</p> : rows.map((t) => <div key={t.id} className="flex items-center justify-between gap-2 border-b border-border last:border-0"><div className="min-w-0 flex-1"><TransferRows transfers={[t]} /></div><Button type="button" variant="ghost" size="icon" className="mr-3 shrink-0" title="Delete transfer record" aria-label={`Delete transfer for ${t.playerName}`} onClick={() => removeTransfer(t.id)}><Trash2 /></Button></div>)}
    </Card>
  </>;
}