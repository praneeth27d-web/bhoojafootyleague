import { Trophy } from "lucide-react";
import { useSeason, type Season } from "@/components/season-context";

export function SeasonSwitcher({ className }: { className?: string }) {
  const { season, setSeason } = useSeason();

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
        onChange={(e) => setSeason(e.target.value as Season)}
        className="w-full cursor-pointer bg-transparent text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="2">Season 2</option>
        <option value="1">Season 1</option>
      </select>
    </label>
  );
}
