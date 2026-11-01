ALTER TABLE public.players
  ADD COLUMN phone text,
  ADD COLUMN contact_preference text,
  ADD COLUMN warnings integer,
  ADD COLUMN matches_banned integer;

ALTER TABLE public.players
  ADD CONSTRAINT players_phone_format CHECK (phone IS NULL OR phone ~ '^[0-9]{10}$');

ALTER TABLE public.players
  ADD CONSTRAINT players_contact_preference_allowed CHECK (contact_preference IS NULL OR contact_preference IN ('call', 'whatsapp', 'both'));

COMMENT ON COLUMN public.players.phone IS '10-digit mobile number, without country code; shown on the public profile';
COMMENT ON COLUMN public.players.contact_preference IS 'call | whatsapp | both — how the contact number can be used';
COMMENT ON COLUMN public.players.warnings IS 'Admin-entered discipline statistic: warnings this season';
COMMENT ON COLUMN public.players.matches_banned IS 'Admin-entered discipline statistic: matches banned this season';