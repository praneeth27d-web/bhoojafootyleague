import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const seasonsQueryKey = ["seasons"] as const;

export type SeasonRow = { id: string; number: number; label: string | null };

async function fetchSeasons(): Promise<SeasonRow[]> {
  const { data } = await supabase
    .from("seasons")
    .select("id, number, label")
    .order("number", { ascending: false });
  return (data ?? []) as SeasonRow[];
}

const fallback: SeasonRow[] = [
  { id: "static-2", number: 2, label: null },
  { id: "static-1", number: 1, label: null },
];

export function useSeasons() {
  const { data, isLoading } = useQuery({
    queryKey: seasonsQueryKey,
    queryFn: fetchSeasons,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
  const seasons = data && data.length > 0 ? data : fallback;
  return {
    seasons,
    numbers: seasons.map((s) => s.number),
    latest: Math.max(...seasons.map((s) => s.number)),
    loading: isLoading,
  };
}

export const seasonLabel = (s: SeasonRow) => s.label?.trim() || `Season ${s.number}`;
