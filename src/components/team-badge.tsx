import acMilan from "@/assets/ac-milan.png.asset.json";
import realMadrid from "@/assets/real-madrid.png.asset.json";
import juventus from "@/assets/juventus.png.asset.json";
import chelsea from "@/assets/chelsea.png.asset.json";
import arsenal from "@/assets/arsenal.png.asset.json";
import manCity from "@/assets/man-city.png.asset.json";
import { useSeason } from "@/components/season-context";
import { season1Name } from "@/lib/season1";
import { teamName } from "@/lib/league";
import { cn } from "@/lib/utils";

const crests: Record<string, string> = {
  "ac-milan": acMilan.url,
  "real-madrid": realMadrid.url,
  juventus: juventus.url,
  chelsea: chelsea.url,
  arsenal: arsenal.url,
};

const season1Crests: Record<string, string> = {
  "ac-milan": manCity.url,
};

/** Team name for the currently selected season (Season 1 rebrands apply). */
export function useTeamName(slug: string) {
  const { season } = useSeason();
  return (season === "1" ? season1Name(slug) : undefined) ?? teamName(slug);
}

export function TeamCrest({ slug, className }: { slug: string; className?: string | undefined }) {
  const { season } = useSeason();
  const name = useTeamName(slug);
  const src = (season === "1" ? season1Crests[slug] : undefined) ?? crests[slug];
  if (!src) return <span className="font-semibold">{name}</span>;
  return (
    <img
      src={src}
      alt={`${name} crest`}
      title={name}
      loading="lazy"
      className={cn(
        "size-6 shrink-0 object-contain",
        slug === "juventus" && "dark:invert",
        className,
      )}
    />
  );
}

export function TeamBadge({
  slug,
  showName = true,
  nameFirst = false,
  className,
  crestClassName,
}: {
  slug: string;
  showName?: boolean;
  nameFirst?: boolean;
  className?: string | undefined;
  crestClassName?: string | undefined;
}) {
  const label = useTeamName(slug);
  const name = <span className="truncate font-semibold">{label}</span>;
  const crest = <TeamCrest slug={slug} className={crestClassName} />;
  const hiddenName = <span className="sr-only">{label}</span>;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showName ? (
        nameFirst ? (
          <>
            {name}
            {crest}
          </>
        ) : (
          <>
            {crest}
            {name}
          </>
        )
      ) : (
        <>
          {crest}
          {hiddenName}
        </>
      )}
    </span>
  );
}
