import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSeason } from "@/components/season-context";
import { calculatePlayerStatistics } from "@/lib/player-statistics";
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
  jersey_number: number | null;
  position: string | null;
  market_value: string | null;
  preferred_foot: string | null;
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
  home_formation: string;
  away_formation: string;
};

type RawGoal = {
  id: string;
  match_id: string;
  minute: number | null;
  scorer_id: string;
  assist_id: string | null;
  is_penalty: boolean;
  is_own_goal: boolean;
};

type RawLineup = { id: string; match_id: string; player_id: string; side: "home" | "away"; role: "starter" | "substitute"; position_index: number; played: boolean; is_replacement: boolean };
type RawCard = { id: string; match_id: string; player_id: string; minute: number | null; card_type: "yellow" | "red" | "second_yellow_red" };
type RawPenaltyEvent = { id: string; match_id: string; player_id: string; minute: number | null; event_type: "earned" | "missed" };

type RawTransfer = {
  id: string;
  player_id: string;
  from_slug: string | null;
  to_slug: string;
  happened_on: string;
  note: string | null;
};

export type RawSnapshot = {
  players: RawPlayer[];
  matches: RawMatch[];
  goals: RawGoal[];
  transfers: RawTransfer[];
  lineups: RawLineup[];
  cards: RawCard[];
  penaltyEvents: RawPenaltyEvent[];
};

async function fetchLeague(): Promise<RawSnapshot> {
  const [playersRes, matchesRes, goalsRes, transfersRes, lineupsRes, cardsRes, penaltyEventsRes] = await Promise.all([
    supabase.from("players").select("*").order("name"),
    supabase.from("matches").select("*").order("kickoff"),
    supabase.from("match_goals").select("*").order("minute", { nullsFirst: true }),
    supabase.from("transfers").select("*").order("happened_on", { ascending: false }),
    supabase.from("match_lineups").select("*").order("position_index"),
    supabase.from("match_cards").select("*").order("minute", { nullsFirst: true }),
    supabase.from("match_penalty_events").select("*").order("minute", { nullsFirst: true }),
  ]);

  return {
    players: (playersRes.data ?? []) as RawPlayer[],
    matches: (matchesRes.data ?? []) as RawMatch[],
    goals: (goalsRes.data ?? []) as RawGoal[],
    transfers: (transfersRes.data ?? []) as RawTransfer[],
    lineups: (lineupsRes.data ?? []) as RawLineup[],
    cards: (cardsRes.data ?? []) as RawCard[],
    penaltyEvents: (penaltyEventsRes.data ?? []) as RawPenaltyEvent[],
  };
}

const empty: RawSnapshot = { players: [], matches: [], goals: [], transfers: [], lineups: [], cards: [], penaltyEvents: [] };

// One shared realtime channel for the whole app.
let liveChannel: ReturnType<typeof supabase.channel> | null = null;
const liveListeners = new Set<() => void>();

/**
 * League data for the season the visitor is viewing.
 * Pass "all" to work across every season (used by the admin area).
 */
export function useLeague(scope: "season" | "all" = "season") {
  const queryClient = useQueryClient();
  const { season } = useSeason();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: leagueQueryKey,
    queryFn: fetchLeague,
    staleTime: 0,
    refetchOnMount: "always",
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
      for (const table of ["players", "matches", "match_goals", "transfers", "match_lineups", "match_cards", "match_penalty_events"] as const) {
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

  const raw = data ?? empty;
  const seasonNumber = Number(season);

  return useMemo(() => {
    const byId = new Map(raw.players.map((p) => [p.id, p]));

    const buildGoals = (matchId: string): MatchGoal[] =>
      raw.goals
        .filter((g) => g.match_id === matchId)
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
            isPenalty: g.is_penalty,
            isOwnGoal: g.is_own_goal,
          };
        })
        .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

    const toMatch = (m: RawMatch): Match => {
      const potm = m.potm_player_id ? byId.get(m.potm_player_id) : undefined;
      return {
        id: m.id,
        season: m.season,
        round: m.round,
        matchday: m.matchday,
        date: m.kickoff,
        homeSlug: m.home_slug,
        awaySlug: m.away_slug,
        venue: m.venue,
        status: m.status === "completed" ? "completed" : "upcoming",
        homeGoals: m.home_goals,
        awayGoals: m.away_goals,
        goals: buildGoals(m.id),
        lineups: raw.lineups.filter((entry) => entry.match_id === m.id).map((entry) => {
          const player = byId.get(entry.player_id);
          return { id: entry.id, playerId: entry.player_id, playerSlug: player?.slug ?? "", playerName: player?.name ?? "Unknown", playerTeamSlug: player?.team_slug ?? null, jerseyNumber: player?.jersey_number ?? null, captain: player?.captain ?? false, side: entry.side, role: entry.role, positionIndex: entry.position_index, played: entry.played, isReplacement: entry.is_replacement };
        }),
        cards: raw.cards.filter((entry) => entry.match_id === m.id).map((entry) => {
          const player = byId.get(entry.player_id);
          const side = raw.lineups.find((lineup) => lineup.match_id === m.id && lineup.player_id === entry.player_id)?.side ?? (player?.team_slug === m.away_slug ? "away" : "home");
          return { id: entry.id, playerId: entry.player_id, playerName: player?.name ?? "Unknown", side, minute: entry.minute, cardType: entry.card_type };
        }),
        penaltyEvents: raw.penaltyEvents.filter((entry) => entry.match_id === m.id).map((entry) => {
          const player = byId.get(entry.player_id);
          const side = raw.lineups.find((lineup) => lineup.match_id === m.id && lineup.player_id === entry.player_id)?.side ?? (player?.team_slug === m.away_slug ? "away" : "home");
          return { id: entry.id, playerId: entry.player_id, playerName: player?.name ?? "Unknown", side, minute: entry.minute, eventType: entry.event_type };
        }),
        homeFormation: m.home_formation,
        awayFormation: m.away_formation,
        potmId: m.potm_player_id,
        potmSlug: potm?.slug ?? null,
        potmName: potm?.name ?? null,
        potmTeamSlug: potm?.team_slug ?? null,
      };
    };

    const allMatches = raw.matches.map(toMatch);
    const matches =
      scope === "all" ? allMatches : allMatches.filter((m) => m.season === seasonNumber);

    // Player stats only count the matches in scope.
    const statData = { ...raw, matches: raw.matches.filter((m) => scope === "all" || m.season === seasonNumber) };

    const players: Player[] = raw.players.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      teamSlug: p.team_slug,
      captain: p.captain,
      jerseyNumber: p.jersey_number,
      position: p.position ?? null,
      marketValue: p.market_value ?? null,
      preferredFoot: p.preferred_foot ?? null,
      ...calculatePlayerStatistics(p.id, statData),
    }));

    const transfers: Transfer[] = raw.transfers.map((t) => {
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

    // League matches feed the table; knockouts (rounds) are listed separately.
    const leagueMatches = matches.filter((m) => !m.round);
    const knockouts = matches.filter((m) => !!m.round);

    return {
      loading: isLoading,
      refreshing: isFetching,
      season: seasonNumber,
      players,
      matches: leagueMatches,
      allMatches,
      knockouts,
      transfers,
      standings: computeStandings(leagueMatches),
      matchdays: [...new Set(leagueMatches.map((m) => m.matchday))].sort((a, b) => a - b),
      completedMatches: leagueMatches.filter((m) => m.status === "completed"),
      upcomingMatches: leagueMatches.filter((m) => m.status === "upcoming"),
      getPlayer: (slug: string) => players.find((p) => p.slug === slug),
      getPlayerById: (id: string) => players.find((p) => p.id === id),
      getMatch: (id: string) => allMatches.find((m) => m.id === id),
      squad: (teamSlug: string) => players.filter((p) => p.teamSlug === teamSlug),
      teamMatches: (teamSlug: string) =>
        leagueMatches.filter((m) => m.homeSlug === teamSlug || m.awaySlug === teamSlug),
      playerContributions: (slug: string) =>
        matches
          .filter(
            (m) =>
              m.status === "completed" &&
              !m.lineups.some((entry) => entry.playerSlug === slug && entry.isReplacement) &&
              (m.goals.some((g) => g.scorerSlug === slug || g.assistSlug === slug) ||
                m.potmSlug === slug ||
                m.cards.some((event) => event.playerId === players.find((p) => p.slug === slug)?.id) ||
                m.penaltyEvents.some((event) => event.playerId === players.find((p) => p.slug === slug)?.id)),
          )
          .map((m) => ({
            match: m,
            lines: [
              ...m.goals
                .filter((g) => g.scorerSlug === slug)
                .map((g) => ({ minute: g.minute, label: g.isOwnGoal ? "Own goal" : g.isPenalty ? "Penalty goal" : "Goal" })),
              ...m.goals
                .filter((g) => g.assistSlug === slug && !g.isOwnGoal)
                .map((g) => ({ minute: g.minute, label: `Assist · ${g.scorerName}` })),
              ...(m.potmSlug === slug ? [{ minute: null, label: "Player of the match" }] : []),
              ...m.cards.filter((event) => event.playerId === players.find((p) => p.slug === slug)?.id).map((event) => ({ minute: event.minute, label: event.cardType === "second_yellow_red" ? "Second yellow, red card" : event.cardType === "red" ? "Red card" : "Yellow card" })),
              ...m.penaltyEvents.filter((event) => event.playerId === players.find((p) => p.slug === slug)?.id).map((event) => ({ minute: event.minute, label: `Penalty ${event.eventType}` })),
            ],
          })),
    };
  }, [raw, isLoading, isFetching, scope, seasonNumber]);
}
