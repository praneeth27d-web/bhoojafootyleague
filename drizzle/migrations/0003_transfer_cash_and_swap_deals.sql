ALTER TABLE public.transfers ADD COLUMN deal_type text NOT NULL DEFAULT 'legacy', ADD COLUMN fee_cr numeric(14,2), ADD COLUMN fee_payer_slug text, ADD COLUMN swap_player_id uuid REFERENCES public.players(id);
ALTER TABLE public.transfers ADD CONSTRAINT transfer_deal_type_valid CHECK (deal_type IN ('legacy','cash','swap')), ADD CONSTRAINT transfer_fee_valid CHECK (fee_cr IS NULL OR fee_cr >= 0), ADD CONSTRAINT transfer_swap_valid CHECK (deal_type <> 'swap' OR (swap_player_id IS NOT NULL AND swap_player_id <> player_id)), ADD CONSTRAINT transfer_cash_valid CHECK (deal_type <> 'cash' OR (fee_cr > 0 AND fee_payer_slug = to_slug AND swap_player_id IS NULL));
ALTER TABLE public.season_rosters ADD COLUMN vice_captain boolean NOT NULL DEFAULT false;
INSERT INTO public.season_rosters (season,player_id,team_slug,captain,vice_captain)
SELECT (SELECT max(number) FROM public.seasons),id,team_slug,captain,vice_captain FROM public.players
ON CONFLICT (season,player_id) DO UPDATE SET team_slug=EXCLUDED.team_slug,captain=EXCLUDED.captain,vice_captain=EXCLUDED.vice_captain;
CREATE OR REPLACE FUNCTION public.record_transfer_deal(p_season integer, p_player_id uuid, p_to_slug text, p_deal_type text, p_fee_cr numeric, p_fee_payer_slug text, p_swap_player_id uuid, p_happened_on date, p_note text) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE source_slug text; swap_slug text; new_id uuid; latest_season integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin') THEN RAISE EXCEPTION 'Only league admins can record transfers'; END IF;
 PERFORM pg_advisory_xact_lock(746291);
 SELECT max(number) INTO latest_season FROM public.seasons;
 IF NOT EXISTS (SELECT 1 FROM public.seasons WHERE number=p_season) THEN RAISE EXCEPTION 'Choose a valid season'; END IF;
 IF p_to_slug NOT IN ('ac-milan','real-madrid','juventus','chelsea','arsenal') THEN RAISE EXCEPTION 'Choose a valid club'; END IF;
 IF p_deal_type NOT IN ('cash','swap') THEN RAISE EXCEPTION 'Choose cash or swap'; END IF;
 IF p_happened_on IS NULL THEN RAISE EXCEPTION 'Choose a transfer date'; END IF;
 IF p_fee_cr IS NULL OR p_fee_cr < 0 OR p_fee_cr <> round(p_fee_cr,2) THEN RAISE EXCEPTION 'Enter a valid fee with at most two decimals'; END IF;
 -- Materialize a new season from the previous season before applying either leg.
 IF NOT EXISTS (SELECT 1 FROM public.season_rosters WHERE season=p_season) THEN
 INSERT INTO public.season_rosters(season,player_id,team_slug,captain,vice_captain)
 SELECT p_season,player_id,team_slug,captain,vice_captain FROM public.season_rosters WHERE season=(SELECT max(season) FROM public.season_rosters WHERE season<p_season);
 END IF;
 SELECT team_slug INTO source_slug FROM public.season_rosters WHERE season=p_season AND player_id=p_player_id FOR UPDATE;
 IF source_slug IS NULL THEN RAISE EXCEPTION 'Player is not in this season squad'; END IF;
 IF source_slug=p_to_slug THEN RAISE EXCEPTION 'Player is already at this club'; END IF;
 IF p_deal_type='cash' THEN
 IF p_fee_cr<=0 OR p_swap_player_id IS NOT NULL OR p_fee_payer_slug IS DISTINCT FROM p_to_slug THEN RAISE EXCEPTION 'Cash deals require a positive fee paid by the joining club'; END IF;
 ELSE
 IF p_swap_player_id IS NULL OR p_swap_player_id=p_player_id THEN RAISE EXCEPTION 'Choose a different swap player'; END IF;
 SELECT team_slug INTO swap_slug FROM public.season_rosters WHERE season=p_season AND player_id=p_swap_player_id FOR UPDATE;
 IF swap_slug IS DISTINCT FROM p_to_slug THEN RAISE EXCEPTION 'Swap player must belong to the other club'; END IF;
 IF p_fee_cr>0 AND (p_fee_payer_slug IS NULL OR p_fee_payer_slug NOT IN (source_slug,p_to_slug)) THEN RAISE EXCEPTION 'Choose the club paying the swap fee'; END IF;
 END IF;
 INSERT INTO public.transfers(season,player_id,from_slug,to_slug,happened_on,note,deal_type,fee_cr,fee_payer_slug,swap_player_id)
 VALUES(p_season,p_player_id,source_slug,p_to_slug,p_happened_on,nullif(trim(p_note),''),p_deal_type,p_fee_cr,CASE WHEN p_fee_cr>0 THEN p_fee_payer_slug ELSE NULL END,p_swap_player_id) RETURNING id INTO new_id;
 UPDATE public.season_rosters SET team_slug=p_to_slug,captain=false,vice_captain=false WHERE season=p_season AND player_id=p_player_id;
 IF p_deal_type='swap' THEN UPDATE public.season_rosters SET team_slug=source_slug,captain=false,vice_captain=false WHERE season=p_season AND player_id=p_swap_player_id; END IF;
 IF p_season=latest_season THEN
 UPDATE public.players SET team_slug=p_to_slug,captain=false,vice_captain=false WHERE id=p_player_id;
 IF p_deal_type='swap' THEN UPDATE public.players SET team_slug=source_slug,captain=false,vice_captain=false WHERE id=p_swap_player_id; END IF;
 END IF;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.record_transfer_deal(integer,uuid,text,text,numeric,text,uuid,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_transfer_deal(integer,uuid,text,text,numeric,text,uuid,date,text) TO authenticated;