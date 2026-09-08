-- Replace the SECURITY DEFINER has_role() calls in policies with inline checks
-- against user_roles (own-row select policy already allows this).
DROP POLICY IF EXISTS "goals admin write" ON public.match_goals;
DROP POLICY IF EXISTS "matches admin write" ON public.matches;
DROP POLICY IF EXISTS "players admin write" ON public.players;
DROP POLICY IF EXISTS "transfers admin write" ON public.transfers;

CREATE POLICY "goals admin write" ON public.match_goals FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "matches admin write" ON public.matches FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "players admin write" ON public.players FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

CREATE POLICY "transfers admin write" ON public.transfers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Live updates on the public site when an admin edits data.
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfers;