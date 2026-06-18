-- Restore EXECUTE on has_role for authenticated users.
-- has_role() is SECURITY DEFINER so it can safely read user_roles regardless of RLS;
-- however it must be EXECUTABLE by the calling role for RLS policies to work.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Add owner_id to apartments so proprietários can register their own houses
ALTER TABLE public.apartments
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_apartments_owner ON public.apartments(owner_id);

-- Allow proprietários to insert their own apartments (always inactive — pending review)
DROP POLICY IF EXISTS "Owner inserts own apartment" ON public.apartments;
CREATE POLICY "Owner inserts own apartment" ON public.apartments FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietario')
    AND owner_id = auth.uid()
    AND active = false
  );

-- Allow proprietários to read their own apartments (even when inactive)
DROP POLICY IF EXISTS "Owner reads own apartment" ON public.apartments;
CREATE POLICY "Owner reads own apartment" ON public.apartments FOR SELECT
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'proprietario'));

-- Allow proprietários to update their own apartments but never to set active=true
DROP POLICY IF EXISTS "Owner updates own apartment" ON public.apartments;
CREATE POLICY "Owner updates own apartment" ON public.apartments FOR UPDATE
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'proprietario'))
  WITH CHECK (
    owner_id = auth.uid()
    AND public.has_role(auth.uid(), 'proprietario')
    AND active = false
  );