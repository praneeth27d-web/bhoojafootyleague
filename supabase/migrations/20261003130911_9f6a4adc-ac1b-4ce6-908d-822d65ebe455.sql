ALTER TABLE public.players
  ADD COLUMN jersey_number integer;

ALTER TABLE public.matches
  ADD COLUMN home_formation text NOT NULL DEFAULT '2-2',
  ADD COLUMN away_formation text NOT NULL DEFAULT '2-2';

ALTER TABLE public.match_goals
  ADD COLUMN IF NOT EXISTS is_penalty boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_own_goal boolean NOT NULL DEFAULT false;

CREATE TABLE public.match_lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('home', 'away')),
  role text NOT NULL CHECK (role IN ('starter', 'substitute')),
  position_index integer NOT NULL DEFAULT 0 CHECK (position_index >= 0),
  played boolean NOT NULL DEFAULT true,
  is_replacement boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id, side)
);
GRANT SELECT ON public.match_lineups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.match_lineups TO authenticated;
GRANT ALL ON public.match_lineups TO service_role;
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lineups public read" ON public.match_lineups FOR SELECT TO public USING (true);
CREATE POLICY "lineups admin write" ON public.match_lineups FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role));
CREATE TRIGGER update_match_lineups_updated_at BEFORE UPDATE ON public.match_lineups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.match_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  minute integer,
  card_type text NOT NULL CHECK (card_type IN ('yellow', 'red', 'second_yellow_red')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_cards TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.match_cards TO authenticated;
GRANT ALL ON public.match_cards TO service_role;
ALTER TABLE public.match_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards public read" ON public.match_cards FOR SELECT TO public USING (true);
CREATE POLICY "cards admin write" ON public.match_cards FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role));

CREATE TABLE public.match_penalty_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  minute integer,
  event_type text NOT NULL CHECK (event_type IN ('earned', 'missed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_penalty_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.match_penalty_events TO authenticated;
GRANT ALL ON public.match_penalty_events TO service_role;
ALTER TABLE public.match_penalty_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "penalty events public read" ON public.match_penalty_events FOR SELECT TO public USING (true);
CREATE POLICY "penalty events admin write" ON public.match_penalty_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::public.app_role));