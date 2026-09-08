ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS season integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS round text;

CREATE INDEX IF NOT EXISTS matches_season_idx ON public.matches (season);

-- Season 1 knockouts
INSERT INTO public.matches (season, round, matchday, kickoff, home_slug, away_slug, status, home_goals, away_goals)
SELECT 1, 'Semi-Final', 1, now(), 'real-madrid', 'juventus', 'completed', 13, 0
WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE season = 1 AND round = 'Semi-Final');

INSERT INTO public.matches (season, round, matchday, kickoff, home_slug, away_slug, status)
SELECT 1, 'Final', 2, now(), 'chelsea', 'real-madrid', 'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE season = 1 AND round = 'Final');

-- Semi-final scorers: Vivek 10, Nirvaan 2, Areek 1
INSERT INTO public.match_goals (match_id, scorer_id)
SELECT m.id, p.id
FROM public.matches m
CROSS JOIN LATERAL (
  SELECT p.id, g.n
  FROM public.players p
  JOIN (VALUES ('vivek', 10), ('nirvaan', 2), ('areek', 1)) AS g(slug, n) ON g.slug = p.slug
) p
CROSS JOIN LATERAL generate_series(1, p.n) AS s(i)
WHERE m.season = 1 AND m.round = 'Semi-Final'
  AND NOT EXISTS (SELECT 1 FROM public.match_goals mg WHERE mg.match_id = m.id);
