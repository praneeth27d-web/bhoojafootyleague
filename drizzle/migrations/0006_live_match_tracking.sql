ALTER TABLE public.matches DROP CONSTRAINT matches_status_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_status_check CHECK (status = ANY (ARRAY['upcoming','live','completed']));
ALTER TABLE public.matches ADD COLUMN live_period text NOT NULL DEFAULT 'first' CHECK (live_period IN ('first','half_time','second','full_time'));
ALTER TABLE public.matches ADD COLUMN period_started_at timestamptz;
ALTER TABLE public.matches ADD COLUMN extra_time_first integer NOT NULL DEFAULT 0;
ALTER TABLE public.matches ADD COLUMN extra_time_second integer NOT NULL DEFAULT 0;