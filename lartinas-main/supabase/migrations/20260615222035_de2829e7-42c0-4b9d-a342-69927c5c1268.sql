
-- Helper: user has access to an apartment (tenant with active contract or owner)
CREATE OR REPLACE FUNCTION public.user_has_apartment_access(_user uuid, _apt uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _user IS NOT NULL AND _apt IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = _user AND c.apartment_id = _apt AND c.status = 'ativo'
    )
    OR EXISTS (
      SELECT 1 FROM public.apartments a
      JOIN public.owners o ON o.id = a.owner_id
      WHERE a.id = _apt AND o.profile_id = _user
    )
  )
$$;

-- ANNOUNCEMENTS: scope reads by apartment + audience
DROP POLICY IF EXISTS "Authenticated reads announcements" ON public.announcements;
CREATE POLICY "Scoped reads announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(),'admin'::app_role)
  OR public.has_role(auth.uid(),'operacao'::app_role)
  OR (
    (apartment_id IS NULL OR public.user_has_apartment_access(auth.uid(), apartment_id))
    AND (
      audience = 'all'
      OR (audience = 'moradoras' AND EXISTS (
        SELECT 1 FROM public.contracts c
        WHERE c.tenant_id = auth.uid() AND c.status = 'ativo'
          AND (announcements.apartment_id IS NULL OR c.apartment_id = announcements.apartment_id)
      ))
      OR (audience = 'proprietarios' AND EXISTS (
        SELECT 1 FROM public.owners o WHERE o.profile_id = auth.uid()
      ))
    )
  )
);

-- COMMUNITY_TIPS: insert requires apartment access
DROP POLICY IF EXISTS "Residents create tips" ON public.community_tips;
CREATE POLICY "Residents create tips"
ON public.community_tips
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (apartment_id IS NULL OR public.user_has_apartment_access(auth.uid(), apartment_id))
);

-- ROOMS: restrict reads to staff, owners, tenants, and publicly available rooms
DROP POLICY IF EXISTS "Authenticated reads rooms" ON public.rooms;
CREATE POLICY "Scoped reads rooms"
ON public.rooms
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(),'admin'::app_role)
  OR public.has_role(auth.uid(),'operacao'::app_role)
  OR status = 'disponivel'
  OR public.user_has_apartment_access(auth.uid(), apartment_id)
);

-- TICKETS: insert requires active relationship to apartment_id (when provided)
DROP POLICY IF EXISTS "Authenticated creates ticket" ON public.tickets;
CREATE POLICY "Authenticated creates ticket"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reporter_id
  AND (apartment_id IS NULL OR public.user_has_apartment_access(auth.uid(), apartment_id))
);

-- OWNER_DOCUMENTS: allow owners to update and delete their own documents
CREATE POLICY "Owner updates own docs"
ON public.owner_documents
FOR UPDATE
TO authenticated
USING (
  owner_id IN (SELECT o.id FROM public.owners o WHERE o.profile_id = auth.uid())
)
WITH CHECK (
  owner_id IN (SELECT o.id FROM public.owners o WHERE o.profile_id = auth.uid())
);

CREATE POLICY "Owner deletes own docs"
ON public.owner_documents
FOR DELETE
TO authenticated
USING (
  owner_id IN (SELECT o.id FROM public.owners o WHERE o.profile_id = auth.uid())
);
