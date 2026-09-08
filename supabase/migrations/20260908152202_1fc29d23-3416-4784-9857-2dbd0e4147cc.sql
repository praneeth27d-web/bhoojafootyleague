CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.grant_first_user_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER grant_first_user_admin_trg
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_user_admin();

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  team_slug text NOT NULL,
  captain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "players admin write" ON public.players FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matchday integer NOT NULL DEFAULT 1,
  kickoff timestamptz NOT NULL DEFAULT now(),
  venue text,
  home_slug text NOT NULL,
  away_slug text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  home_goals integer,
  away_goals integer,
  potm_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches public read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches admin write" ON public.matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.match_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute integer,
  scorer_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  assist_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_goals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_goals TO authenticated;
GRANT ALL ON public.match_goals TO service_role;
ALTER TABLE public.match_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals public read" ON public.match_goals FOR SELECT USING (true);
CREATE POLICY "goals admin write" ON public.match_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  from_slug text,
  to_slug text NOT NULL,
  happened_on date NOT NULL DEFAULT current_date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transfers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transfers public read" ON public.transfers FOR SELECT USING (true);
CREATE POLICY "transfers admin write" ON public.transfers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.players (slug, name, team_slug, captain) VALUES
  ('reyansh', 'Reyansh', 'ac-milan', true),
  ('shaurya', 'Shaurya', 'ac-milan', false),
  ('praneeth', 'Praneeth', 'ac-milan', false),
  ('rohit', 'Rohit', 'ac-milan', false),
  ('adrith', 'Adrith', 'ac-milan', false),
  ('vivek', 'Vivek', 'real-madrid', true),
  ('nirvaan', 'Nirvaan', 'real-madrid', false),
  ('areek', 'Areek', 'real-madrid', false),
  ('neil', 'Neil', 'real-madrid', false),
  ('rohan', 'Rohan', 'real-madrid', false),
  ('swanik', 'Swanik', 'juventus', true),
  ('rishik', 'Rishik', 'juventus', false),
  ('jai', 'Jai', 'juventus', false),
  ('ruhaan', 'Ruhaan', 'juventus', false),
  ('arjun', 'Arjun', 'juventus', false),
  ('ritwik', 'Ritwik', 'chelsea', true),
  ('neerav', 'Neerav', 'chelsea', false),
  ('aadvik', 'Aadvik', 'chelsea', false),
  ('suhit', 'Suhit', 'chelsea', false),
  ('advitya', 'Advitya', 'chelsea', false),
  ('ady', 'Ady', 'arsenal', true),
  ('avyaan', 'Avyaan', 'arsenal', false),
  ('dev', 'Dev', 'arsenal', false),
  ('abheek', 'Abheek', 'arsenal', false),
  ('cherry', 'Cherry', 'arsenal', false);