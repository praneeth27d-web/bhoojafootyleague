ALTER TABLE public.players ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS market_value text;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS preferred_foot text NOT NULL DEFAULT 'right';
COMMENT ON COLUMN public.players.market_value IS 'Admin-entered display value including currency when applicable; null means not supplied.';