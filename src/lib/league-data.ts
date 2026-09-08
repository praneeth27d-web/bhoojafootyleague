import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  computeStandings,
  slugify,
  type Match,
  type MatchGoal,
  type Player,
  type Transfer,
} from "@/lib/league";

export const leagueQueryKey = ["league"] as const;

type RawPlayer = {
  id: string;
  slug: string;
  name: string;
  team_slug: string;
  captain: boolean;
};

type RawMatch = {
  id: string;
  season: number;
  round: string | null;
  matchday: number;
  kickoff: string;
  venue: string | null;
  home_slug: string;
  away_slug: string;
  status: string;
  home_goals: number | null;
  away_goals: number | null;
  potm_player_id: string | null;
};


type RawGoal = {
  id: string;
  match_id: string;
  minute: number | null;
  scorer_id: string;
  assist_id: string | null;
};

type RawTransfer = {
  id: string;
  player_id: string;
  from_slug: string | null;
  to_slug: string;
  happened_on: string;
  note: string | null;
};

export type LeagueSnapshot = {
  players: Player[];
  matches: Match[];
  transfers: Transfer[];
};

async function fetchLeague(): Promise<LeagueSnapshot> {
  const [playersRes, matchesRes, goalsRes, transfersRes] = await Promise.all([
    supabase.from("players").select("*").order("name"),
    supabase.from("matches").select("*").order("kickoff"),
    supabase.from("match_goals").select("*").order("minute", { nullsFirst: true }),
    supabase.from("transfers").select("*").order("happened_on", { ascending: false }),
  ]);

  const rawPlayers = (playersRes.data ?? []) as RawPlayer[];
  const rawMatches = (matchesRes.data ?? []) as RawMatch[];
  const rawGoals = (goalsRes.data ?? []) as RawGoal[];
  const rawTransfers = (transfersRes.data ?? []) as RawTransfer[];

  const byId = new Map(rawPlayers.map((p) => [p.id, p]));

  const players: Player[] = rawPlayers.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    teamSlug: p.team_slug,
    captain: p.captain,
    goals: rawGoals.filter((g) => g.scorer_id === p.id).length,
    assists: rawGoals.filter((g) => g.assist_id === p.id).length,
    potm: rawMatches.filter((m) => m.potm_player_id === p.id).length,
  }));

  const matches: Match[] = rawMatches.map((m) => {
    const potm = m.potm_player_id ? byId.get(m.potm_player_id) : undefined;
    const goals: MatchGoal[] = rawGoals
      .filter((g) => g.match_id === m.id)
      .map((g) => {
        const scorer = byId.get(g.scorer_id);
        const assist = g.assist_id ? byId.get(g.assist_id) : undefined;
        return {
          id: g.id,
          minute: g.minute,
          scorerId: g.scorer_id,
          scorerSlug: scorer?.slug ?? "",
          scorerName: scorer?.name ?? "Unknown",
          scorerTeamSlug: scorer?.team_slug ?? null,
          assistId: g.assist_id,
          assistSlug: assist?.slug ?? null,
          assistName: assist?.name ?? null,
        };
      })
      .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

    return {
      id: m.id,
      matchday: m.matchday,
      date: m.kickoff,
      homeSlug: m.home_slug,
      awaySlug: m.away_slug,
      venue: m.venue,
      status: m.status === "completed" ? "completed" : "upcoming",
      homeGoals: m.home_goals,
      awayGoals: m.away_goals,
      goals,
      potmId: m.potm_player_id,
      potmSlug: potm?.slug ?? null,
      potmName: potm?.name ?? null,
      potmTeamSlug: potm?.team_slug ?? null,
    };
  });

  const transfers: Transfer[] = rawTransfers.map((t) => {
    const p = byId.get(t.player_id);
    return {
      id: t.id,
      playerId: t.player_id,
      playerName: p?.name ?? "Unknown",
      playerSlug: p?.slug ?? slugify(p?.name ?? "unknown"),
      fromSlug: t.from_slug,
      toSlug: t.to_slug,
      date: t.happened_on,
      note: t.note,
    };
  });

  return { players, matches, transfers };
}

const empty: LeagueSnapshot = { players: [], matches: [], transfers: [] };

// One shared realtime channel for the whole app.
let liveChannel: ReturnType<typeof supabase.channel> | null = null;
const liveListeners = new Set<() => void>();

export function useLeague() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: leagueQueryKey,
    queryFn: fetchLeague,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  // Live updates: any change an admin makes shows up without a refresh.
  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: leagueQueryKey });
    };
    liveListeners.add(invalidate);
    if (!liveChannel) {
      const channel = supabase.channel("league-live");
      for (const table of ["players", "matches", "match_goals", "transfers"] as const) {
        channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
          liveListeners.forEach((fn) => fn());
        });
      }
      liveChannel = channel;
      channel.subscribe();
    }
    return () => {
      liveListeners.delete(invalidate);
      if (liveListeners.size === 0 && liveChannel) {
        const channel = liveChannel;
        liveChannel = null;
        void supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  const snapshot = data ?? empty;

  return useMemo(() => {
    const { players, matches, transfers } = snapshot;
    return {
      loading: isLoading,
      refreshing: isFetching,
      players,
      matches,
      transfers,
      standings: computeStandings(matches),
      matchdays: [...new Set(matches.map((m) => m.matchday))].sort((a, b) => a - b),
      completedMatches: matches.filter((m) => m.status === "completed"),
      upcomingMatches: matches.filter((m) => m.status === "upcoming"),
      getPlayer: (slug: string) => players.find((p) => p.slug === slug),
      getPlayerById: (id: string) => players.find((p) => p.id === id),
      getMatch: (id: string) => matches.find((m) => m.id === id),
      squad: (teamSlug: string) => players.filter((p) => p.teamSlug === teamSlug),
      teamMatches: (teamSlug: string) =>
        matches.filter((m) => m.homeSlug === teamSlug || m.awaySlug === teamSlug),
      playerContributions: (slug: string) =>
        matches
          .filter(
            (m) =>
              m.status === "completed" &&
              (m.goals.some((g) => g.scorerSlug === slug || g.assistSlug === slug) ||
                m.potmSlug === slug),
          )
          .map((m) => ({
            match: m,
            lines: [
              ...m.goals
                .filter((g) => g.scorerSlug === slug)
                .map((g) => ({ minute: g.minute, label: "Goal" })),
              ...m.goals
                .filter((g) => g.assistSlug === slug)
                .map((g) => ({ minute: g.minute, label: `Assist · ${g.scorerName}` })),
              ...(m.potmSlug === slug ? [{ minute: null, label: "Player of the match" }] : []),
            ],
          })),
    };
  }, [snapshot, isLoading, isFetching]);
}
