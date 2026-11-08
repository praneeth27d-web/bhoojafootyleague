ALTER TABLE public.players ADD COLUMN loan_from_slug text, ADD COLUMN loan_until date;
ALTER TABLE public.season_rosters ADD COLUMN loan_from_slug text, ADD COLUMN loan_until date;
ALTER TABLE public.transfers ADD COLUMN loan_until date;
ALTER TABLE public.transfers DROP CONSTRAINT transfer_deal_type_valid;
ALTER TABLE public.transfers ADD CONSTRAINT transfer_deal_type_valid CHECK (deal_type IN ('legacy','cash','swap','loan','loan_return'));
CREATE OR REPLACE FUNCTION public.record_loan(p_season integer, p_player_id uuid, p_to_slug text, p_fee_cr numeric DEFAULT 0, p_loan_until date DEFAULT NULL, p_happened_on date DEFAULT CURRENT_DATE, p_note text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE source_slug text; current_loan text; new_id uuid; latest_season integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin') THEN RAISE EXCEPTION 'Only league admins can record loans'; END IF;
 PERFORM pg_advisory_xact_lock(746291);
 SELECT max(number) INTO latest_season FROM public.seasons;
 IF NOT EXISTS (SELECT 1 FROM public.seasons WHERE number=p_season) THEN RAISE EXCEPTION 'Choose a valid season'; END IF;
 IF p_to_slug NOT IN ('ac-milan','real-madrid','juventus','chelsea','arsenal') THEN RAISE EXCEPTION 'Choose a valid club'; END IF;
 IF p_fee_cr IS NULL OR p_fee_cr < 0 OR p_fee_cr <> round(p_fee_cr,2) THEN RAISE EXCEPTION 'Enter a valid loan fee'; END IF;
 IF p_loan_until IS NOT NULL AND p_loan_until < p_happened_on THEN RAISE EXCEPTION 'Loan end date must be after the start'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.season_rosters WHERE season=p_season) THEN
  INSERT INTO public.season_rosters(season,player_id,team_slug,captain,vice_captain)
  SELECT p_season,player_id,team_slug,captain,vice_captain FROM public.season_rosters WHERE season=(SELECT max(season) FROM public.season_rosters WHERE season<p_season);
 END IF;
 SELECT team_slug, loan_from_slug INTO source_slug, current_loan FROM public.season_rosters WHERE season=p_season AND player_id=p_player_id FOR UPDATE;
 IF source_slug IS NULL THEN RAISE EXCEPTION 'Player is not in this season squad'; END IF;
 IF current_loan IS NOT NULL THEN RAISE EXCEPTION 'Player is already on loan; end the loan first'; END IF;
 IF source_slug=p_to_slug THEN RAISE EXCEPTION 'Player is already at this club'; END IF;
 INSERT INTO public.transfers(season,player_id,from_slug,to_slug,happened_on,note,deal_type,fee_cr,fee_payer_slug,loan_until)
 VALUES(p_season,p_player_id,source_slug,p_to_slug,p_happened_on,nullif(trim(p_note),''),'loan',p_fee_cr,CASE WHEN p_fee_cr>0 THEN p_to_slug END,p_loan_until) RETURNING id INTO new_id;
 UPDATE public.season_rosters SET team_slug=p_to_slug,captain=false,vice_captain=false,loan_from_slug=source_slug,loan_until=p_loan_until WHERE season=p_season AND player_id=p_player_id;
 IF p_season=latest_season THEN UPDATE public.players SET team_slug=p_to_slug,captain=false,vice_captain=false,loan_from_slug=source_slug,loan_until=p_loan_until WHERE id=p_player_id; END IF;
 RETURN new_id;
END $$;
CREATE OR REPLACE FUNCTION public.end_loan(p_season integer, p_player_id uuid, p_happened_on date DEFAULT CURRENT_DATE) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE cur_slug text; parent text; new_id uuid; latest_season integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin') THEN RAISE EXCEPTION 'Only league admins can end loans'; END IF;
 PERFORM pg_advisory_xact_lock(746291);
 SELECT max(number) INTO latest_season FROM public.seasons;
 SELECT team_slug, loan_from_slug INTO cur_slug, parent FROM public.season_rosters WHERE season=p_season AND player_id=p_player_id FOR UPDATE;
 IF parent IS NULL THEN RAISE EXCEPTION 'Player is not on loan'; END IF;
 INSERT INTO public.transfers(season,player_id,from_slug,to_slug,happened_on,deal_type) VALUES(p_season,p_player_id,cur_slug,parent,p_happened_on,'loan_return') RETURNING id INTO new_id;
 UPDATE public.season_rosters SET team_slug=parent,captain=false,vice_captain=false,loan_from_slug=NULL,loan_until=NULL WHERE season=p_season AND player_id=p_player_id;
 IF p_season=latest_season THEN UPDATE public.players SET team_slug=parent,captain=false,vice_captain=false,loan_from_slug=NULL,loan_until=NULL WHERE id=p_player_id; END IF;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.record_loan(integer,uuid,text,numeric,date,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_loan(integer,uuid,text,numeric,date,date,text) TO authenticated;
REVOKE ALL ON FUNCTION public.end_loan(integer,uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.end_loan(integer,uuid,date) TO authenticated;