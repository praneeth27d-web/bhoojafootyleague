import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { teams, teamName, slugify, type Match } from "@/lib/league";
import { leagueQueryKey, useLeague } from "@/lib/league-data";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "League Admin — Bhooja Football League" },
      { name: "description", content: "Update BFL results, goalscorers, squads and transfers." },
      { property: "og:title", content: "BFL League Admin" },
      { property: "og:description", content: "Private league management area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";
const btnClass =
  "rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60";
const ghostBtn =
  "rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

const tabs = ["matches", "squads", "transfers"] as const;
type Tab = (typeof tabs)[number];

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const league = useLeague("all");
  const [tab, setTab] = useState<Tab>("matches");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: leagueQueryKey });

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/table", replace: true });
  }

  return (
    <AppShell
      title="League admin"
      subtitle={user?.email ?? "Update results, squads and transfers"}
      badge={isAdmin === false ? "No access" : "Editing"}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-semibold capitalize transition-colors",
                t === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <button type="button" onClick={signOut} className={ghostBtn}>
          Sign out
        </button>
      </div>

      {isAdmin === false && (
        <Card className="mb-5">
          <p className="px-4 py-4 text-sm text-destructive">
            This account is not the league admin, so changes will be rejected.
          </p>
        </Card>
      )}

      <div className="space-y-5">
        {tab === "matches" && <MatchesAdmin league={league} refresh={refresh} />}
        {tab === "squads" && <SquadsAdmin league={league} refresh={refresh} />}
        {tab === "transfers" && <TransfersAdmin league={league} refresh={refresh} />}
      </div>
    </AppShell>
  );
}

type League = ReturnType<typeof useLeague>;
type AdminProps = { league: League; refresh: () => void };

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="text-sm font-semibold text-destructive">{error}</p>;
}

const seasonOptions = [2, 1];

function MatchesAdmin({ league, refresh }: AdminProps) {
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState(2);
  const [round, setRound] = useState("");
  const [matchday, setMatchday] = useState(1);
  const [home, setHome] = useState(teams[0]!.slug);
  const [away, setAway] = useState(teams[1]!.slug);
  const [kickoff, setKickoff] = useState("");
  const [venue, setVenue] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  async function addMatch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (home === away) {
      setError("Pick two different teams.");
      return;
    }
    const { error: err } = await supabase.from("matches").insert({
      season,
      round: round.trim() || null,
      matchday,
      home_slug: home,
      away_slug: away,
      kickoff: kickoff ? new Date(kickoff).toISOString() : new Date().toISOString(),
      venue: venue || null,
      status: "upcoming",
    });
    if (err) setError(err.message);
    else {
      setVenue("");
      setKickoff("");
      setRound("");
      refresh();
    }
  }

  async function removeMatch(id: string) {
    const { error: err } = await supabase.from("matches").delete().eq("id", id);
    if (err) setError(err.message);
    else refresh();
  }

  return (
    <>
      <Card title="Add a fixture">
        <form onSubmit={addMatch} className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Season">
            <select
              className={inputClass}
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {seasonOptions.map((s) => (
                <option key={s} value={s}>
                  Season {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Round (leave empty for league games)">
            <input
              className={inputClass}
              placeholder="e.g. Final, Semi-Final"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </Field>
          <Field label="Matchday">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={matchday}
              onChange={(e) => setMatchday(Number(e.target.value))}
            />
          </Field>
          <Field label="Home team">
            <select className={inputClass} value={home} onChange={(e) => setHome(e.target.value)}>
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Away team">
            <select className={inputClass} value={away} onChange={(e) => setAway(e.target.value)}>
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kick-off (date & time)">
            <input
              type="datetime-local"
              className={inputClass}
              value={kickoff}
              onChange={(e) => setKickoff(e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className={inputClass}
              placeholder="e.g. Bhooja Ground"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={btnClass}>
              Add fixture
            </button>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorNote error={error} />
          </div>
        </form>
      </Card>

      {seasonOptions.map((s) => {
        const list = league.allMatches.filter((m) => m.season === s);
        return (
          <Card key={s} title={`Season ${s} matches (${list.length})`}>
            {list.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No matches for this season yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {list.map((m) => (
                  <li key={m.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        {m.round ? m.round : `MD${m.matchday}`} · {teamName(m.homeSlug)}{" "}
                        {m.status === "completed" ? m.homeGoals : ""}
                        {m.status === "completed" ? "–" : " vs "}
                        {m.status === "completed" ? m.awayGoals : ""} {teamName(m.awaySlug)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={ghostBtn}
                          onClick={() => setOpenId(openId === m.id ? null : m.id)}
                        >
                          {openId === m.id ? "Close" : "Edit match"}
                        </button>
                        <button type="button" className={ghostBtn} onClick={() => removeMatch(m.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {openId === m.id && <MatchEditor match={m} league={league} refresh={refresh} />}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </>
  );
}


function MatchEditor({ match, league, refresh }: { match: Match } & AdminProps) {
  const [error, setError] = useState<string | null>(null);
  const [homeGoals, setHomeGoals] = useState(match.homeGoals ?? 0);
  const [awayGoals, setAwayGoals] = useState(match.awayGoals ?? 0);
  const [status, setStatus] = useState(match.status);
  const [potm, setPotm] = useState(match.potmId ?? "");
  const [scorer, setScorer] = useState("");
  const [assist, setAssist] = useState("");
  const [minute, setMinute] = useState("");
  // Fixture details
  const [season, setSeason] = useState(match.season);
  const [round, setRound] = useState(match.round ?? "");
  const [matchday, setMatchday] = useState(match.matchday);
  const [home, setHome] = useState(match.homeSlug);
  const [away, setAway] = useState(match.awaySlug);
  const [kickoff, setKickoff] = useState(new Date(match.date).toISOString().slice(0, 16));
  const [venue, setVenue] = useState(match.venue ?? "");

  const involved = league.players.filter(
    (p) => p.teamSlug === match.homeSlug || p.teamSlug === match.awaySlug,
  );

  async function saveDetails() {
    setError(null);
    if (home === away) {
      setError("Pick two different teams.");
      return;
    }
    const { error: err } = await supabase
      .from("matches")
      .update({
        season,
        round: round.trim() || null,
        matchday,
        home_slug: home,
        away_slug: away,
        kickoff: new Date(kickoff).toISOString(),
        venue: venue || null,
      })
      .eq("id", match.id);
    if (err) setError(err.message);
    else refresh();
  }


  async function saveResult() {
    setError(null);
    const { error: err } = await supabase
      .from("matches")
      .update({
        status,
        home_goals: status === "completed" ? homeGoals : null,
        away_goals: status === "completed" ? awayGoals : null,
        potm_player_id: potm || null,
      })
      .eq("id", match.id);
    if (err) setError(err.message);
    else refresh();
  }

  async function addGoal() {
    setError(null);
    if (!scorer) {
      setError("Choose who scored.");
      return;
    }
    const { error: err } = await supabase.from("match_goals").insert({
      match_id: match.id,
      scorer_id: scorer,
      assist_id: assist || null,
      minute: minute ? Number(minute) : null,
    });
    if (err) setError(err.message);
    else {
      setScorer("");
      setAssist("");
      setMinute("");
      refresh();
    }
  }

  async function removeGoal(id: string) {
    const { error: err } = await supabase.from("match_goals").delete().eq("id", id);
    if (err) setError(err.message);
    else refresh();
  }

  return (
    <div className="mt-3 space-y-4 rounded-md border border-border bg-surface-muted p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as Match["status"])}
          >
            <option value="upcoming">Upcoming</option>
            <option value="completed">Played</option>
          </select>
        </Field>
        <Field label={`${teamName(match.homeSlug)} goals`}>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={homeGoals}
            onChange={(e) => setHomeGoals(Number(e.target.value))}
          />
        </Field>
        <Field label={`${teamName(match.awaySlug)} goals`}>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={awayGoals}
            onChange={(e) => setAwayGoals(Number(e.target.value))}
          />
        </Field>
        <Field label="Player of the match">
          <select className={inputClass} value={potm} onChange={(e) => setPotm(e.target.value)}>
            <option value="">Not awarded</option>
            {involved.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <button type="button" className={btnClass} onClick={saveResult}>
        Save result
      </button>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Goals
        </h3>
        {match.goals.length > 0 ? (
          <ul className="mb-3 divide-y divide-border">
            {match.goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>
                  {g.minute !== null ? `${g.minute}' ` : ""}
                  <span className="font-semibold">{g.scorerName}</span>
                  {g.assistName ? ` (assist: ${g.assistName})` : ""}
                </span>
                <button type="button" className={ghostBtn} onClick={() => removeGoal(g.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">No goals recorded.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Scorer">
            <select className={inputClass} value={scorer} onChange={(e) => setScorer(e.target.value)}>
              <option value="">Choose player</option>
              {involved.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {teamName(p.teamSlug)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assist (optional)">
            <select className={inputClass} value={assist} onChange={(e) => setAssist(e.target.value)}>
              <option value="">No assist</option>
              {involved.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Minute (optional)">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <button type="button" className={btnClass} onClick={addGoal}>
              Add goal
            </button>
          </div>
        </div>
      </div>
      <ErrorNote error={error} />
    </div>
  );
}

function SquadsAdmin({ league, refresh }: AdminProps) {
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [team, setTeam] = useState(teams[0]!.slug);
  const [captain, setCaptain] = useState(false);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error: err } = await supabase
      .from("players")
      .insert({ name: name.trim(), slug: slugify(name), team_slug: team, captain });
    if (err) setError(err.message);
    else {
      setName("");
      setCaptain(false);
      refresh();
    }
  }

  async function toggleCaptain(id: string, value: boolean) {
    const { error: err } = await supabase.from("players").update({ captain: value }).eq("id", id);
    if (err) setError(err.message);
    else refresh();
  }

  async function removePlayer(id: string) {
    const { error: err } = await supabase.from("players").delete().eq("id", id);
    if (err) setError(err.message);
    else refresh();
  }

  return (
    <>
      <Card title="Add a player">
        <form onSubmit={addPlayer} className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name">
            <input
              required
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Club">
            <select className={inputClass} value={team} onChange={(e) => setTeam(e.target.value)}>
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-end gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={captain}
              onChange={(e) => setCaptain(e.target.checked)}
              className="size-4"
            />
            Captain
          </label>
          <div className="flex items-end">
            <button type="submit" className={btnClass}>
              Add player
            </button>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <ErrorNote error={error} />
          </div>
        </form>
      </Card>

      {teams.map((t) => (
        <Card key={t.slug} title={t.name}>
          <ul className="divide-y divide-border">
            {league.squad(t.slug).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="font-semibold">
                  {p.name}
                  {p.captain && <span className="ml-2 text-xs text-primary">Captain</span>}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className={ghostBtn}
                    onClick={() => toggleCaptain(p.id, !p.captain)}
                  >
                    {p.captain ? "Remove captain" : "Make captain"}
                  </button>
                  <button type="button" className={ghostBtn} onClick={() => removePlayer(p.id)}>
                    Delete
                  </button>
                </span>
              </li>
            ))}
            {league.squad(t.slug).length === 0 && (
              <li className="px-4 py-4 text-sm text-muted-foreground">No players yet.</li>
            )}
          </ul>
        </Card>
      ))}
    </>
  );
}

function TransfersAdmin({ league, refresh }: AdminProps) {
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [to, setTo] = useState(teams[0]!.slug);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  async function record(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const player = league.getPlayerById(playerId);
    if (!player) {
      setError("Choose a player.");
      return;
    }
    if (player.teamSlug === to) {
      setError("That player is already at this club.");
      return;
    }
    const { error: insertErr } = await supabase.from("transfers").insert({
      player_id: player.id,
      from_slug: player.teamSlug,
      to_slug: to,
      happened_on: date,
      note: note || null,
    });
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    const { error: updateErr } = await supabase
      .from("players")
      .update({ team_slug: to, captain: false })
      .eq("id", player.id);
    if (updateErr) setError(updateErr.message);
    else {
      setNote("");
      setPlayerId("");
      refresh();
    }
  }

  async function removeTransfer(id: string) {
    const { error: err } = await supabase.from("transfers").delete().eq("id", id);
    if (err) setError(err.message);
    else refresh();
  }

  return (
    <>
      <Card title="Record a transfer">
        <form onSubmit={record} className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Player">
            <select
              className={inputClass}
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
            >
              <option value="">Choose player</option>
              {league.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {teamName(p.teamSlug)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Joining">
            <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Note (optional)">
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={btnClass}>
              Save transfer
            </button>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <ErrorNote error={error} />
          </div>
        </form>
      </Card>

      <Card title={`Transfers (${league.transfers.length})`}>
        {league.transfers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No transfers yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {league.transfers.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span>
                  <span className="font-semibold">{t.playerName}</span>{" "}
                  {t.fromSlug ? teamName(t.fromSlug) : "Unattached"} → {teamName(t.toSlug)}
                </span>
                <button type="button" className={ghostBtn} onClick={() => removeTransfer(t.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
