ALTER TABLE public.players
  ADD COLUMN preferred_foot text NOT NULL DEFAULT 'right';

UPDATE public.players
SET preferred_foot = 'left'
WHERE lower(name) IN ('rishik', 'adrith', 'adraith', 'ruhaan');

ALTER TABLE public.players
  ADD CONSTRAINT players_preferred_foot_check CHECK (preferred_foot IN ('left', 'right'));

ALTER TABLE public.match_goals
  ADD COLUMN is_penalty boolean NOT NULL DEFAULT false,
  ADD COLUMN is_own_goal boolean NOT NULL DEFAULT false;

ALTER TABLE public.transfers
  ADD COLUMN season integer NOT NULL DEFAULT 2;

CREATE TABLE public.season_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season integer NOT NULL,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_slug text NOT NULL,
  captain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season, player_id)
);
GRANT SELECT ON public.season_rosters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.season_rosters TO authenticated;
GRANT ALL ON public.season_rosters TO service_role;
ALTER TABLE public.season_rosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "season rosters public read"
ON public.season_rosters FOR SELECT TO public USING (true);
CREATE POLICY "season rosters admin write"
ON public.season_rosters FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles r
  WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles r
  WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role
));

INSERT INTO public.season_rosters (season, player_id, team_slug, captain)
SELECT s.number, p.id, p.team_slug, p.captain
FROM public.seasons s
CROSS JOIN public.players p
ON CONFLICT (season, player_id) DO NOTHING;

CREATE INDEX season_rosters_season_team_idx
ON public.season_rosters (season, team_slug);

CREATE TRIGGER update_season_rosters_updated_at
BEFORE UPDATE ON public.season_rosters
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();