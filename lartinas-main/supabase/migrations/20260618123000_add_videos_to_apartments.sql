-- Add videos column to apartments table
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';
