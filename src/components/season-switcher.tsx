import { Trophy } from "lucide-react";
import { useSeason } from "@/components/season-context";
import { seasonLabel, useSeasons } from "@/lib/seasons";

export function SeasonSwitcher({ className }: { className?: string }) {
  const { season, setSeason } = useSeason();
  const { seasons } = useSeasons();

  return (
    <label
      className={
        "flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground " +
        (className ?? "")
      }
    >
      <Trophy className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Season</span>
      <select
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        className="w-full cursor-pointer bg-transparent text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {seasons.map((s) => (
          <option key={s.id} value={String(s.number)}>
            {seasonLabel(s)}
          </option>
        ))}
      </select>
    </label>
  );
}
