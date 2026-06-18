-- Application documents column
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS document_type TEXT,
  ADD COLUMN IF NOT EXISTS document_path TEXT;

-- Private bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies: applicants own folder
CREATE POLICY "Applicants upload own docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Applicants read own docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'operacao'::app_role)
    )
  );

CREATE POLICY "Applicants update own docs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Applicants delete own docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Apartment photos: staff manages
CREATE POLICY "Staff uploads apartment photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'apartment-photos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role))
  );

CREATE POLICY "Staff updates apartment photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'apartment-photos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role))
  );

CREATE POLICY "Staff deletes apartment photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'apartment-photos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role))
  );