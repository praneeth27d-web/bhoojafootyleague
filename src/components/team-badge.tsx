import acMilan from "@/assets/ac-milan.png.asset.json";
import realMadrid from "@/assets/real-madrid.png.asset.json";
import juventus from "@/assets/juventus.png.asset.json";
import chelsea from "@/assets/chelsea.png.asset.json";
import arsenal from "@/assets/arsenal.png.asset.json";
import { teamName } from "@/lib/league";
import { cn } from "@/lib/utils";

const crests: Record<string, string> = {
  "ac-milan": acMilan.url,
  "real-madrid": realMadrid.url,
  juventus: juventus.url,
  chelsea: chelsea.url,
  arsenal: arsenal.url,
};

export function TeamCrest({ slug, className }: { slug: string; className?: string | undefined }) {
  const src = crests[slug];
  const name = teamName(slug);
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
  showName = false,
  className,
  crestClassName,
}: {
  slug: string;
  showName?: boolean;
  className?: string | undefined;
  crestClassName?: string | undefined;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <TeamCrest slug={slug} className={crestClassName} />
      {showName ? (
        <span className="truncate font-semibold">{teamName(slug)}</span>
      ) : (
        <span className="sr-only">{teamName(slug)}</span>
      )}
    </span>
  );

}

