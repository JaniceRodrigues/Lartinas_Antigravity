
-- 1. Expand room_status enum
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'alugada';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'aguardando_vistoria';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'desativado';

-- 2. Create apartment_status enum
DO $$ BEGIN
  CREATE TYPE public.apartment_status AS ENUM ('disponivel','alugada','aguardando_vistoria','desativado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Add status column to apartments
ALTER TABLE public.apartments
  ADD COLUMN IF NOT EXISTS status public.apartment_status NOT NULL DEFAULT 'disponivel';

UPDATE public.apartments SET status = 'desativado' WHERE active = false AND status = 'disponivel';
