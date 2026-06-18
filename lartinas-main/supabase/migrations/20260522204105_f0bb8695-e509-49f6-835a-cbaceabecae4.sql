
-- House manual sections
CREATE TABLE IF NOT EXISTS public.house_manual_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.house_manual_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages manual" ON public.house_manual_sections FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Residents read manual" ON public.house_manual_sections FOR SELECT
  USING (
    apartment_id IS NULL OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = auth.uid() AND c.apartment_id = house_manual_sections.apartment_id
        AND c.status = 'ativo'
    )
  );
CREATE TRIGGER trg_manual_updated BEFORE UPDATE ON public.house_manual_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Announcement reads
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own reads" ON public.announcement_reads FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Stay requests
DO $$ BEGIN
  CREATE TYPE public.stay_request_kind AS ENUM ('renovacao','saida');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.stay_request_status AS ENUM ('aberto','em_analise','aprovado','recusado','concluido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.stay_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  kind public.stay_request_kind NOT NULL,
  status public.stay_request_status NOT NULL DEFAULT 'aberto',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stay_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages stay requests" ON public.stay_requests FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Resident manages own stay requests" ON public.stay_requests FOR ALL
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE TRIGGER trg_stay_req_updated BEFORE UPDATE ON public.stay_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Community events & tips
CREATE TABLE IF NOT EXISTS public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  location text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages events" ON public.community_events FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Residents read events" ON public.community_events FOR SELECT
  USING (
    apartment_id IS NULL OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = auth.uid() AND c.apartment_id = community_events.apartment_id
    )
  );

CREATE TABLE IF NOT EXISTS public.community_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE CASCADE,
  author_id uuid,
  category text,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages tips" ON public.community_tips FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Residents read tips" ON public.community_tips FOR SELECT
  USING (
    apartment_id IS NULL OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = auth.uid() AND c.apartment_id = community_tips.apartment_id
    )
  );
CREATE POLICY "Residents create tips" ON public.community_tips FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Owner documents
CREATE TABLE IF NOT EXISTS public.owner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'outro',
  title text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages owner docs" ON public.owner_documents FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Owner reads own docs" ON public.owner_documents FOR SELECT
  USING (owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid()));
CREATE POLICY "Owner uploads own docs" ON public.owner_documents FOR INSERT
  WITH CHECK (owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid()));

-- Owner messages
CREATE TABLE IF NOT EXISTS public.owner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  from_staff boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
ALTER TABLE public.owner_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages owner messages" ON public.owner_messages FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Owner reads own thread" ON public.owner_messages FOR SELECT
  USING (owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid()));
CREATE POLICY "Owner writes in own thread" ON public.owner_messages FOR INSERT
  WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid())
    AND sender_id = auth.uid() AND from_staff = false
  );

-- Tickets extras
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS cost numeric,
  ADD COLUMN IF NOT EXISTS owner_approval text;

CREATE POLICY "Owner reads own tickets" ON public.tickets FOR SELECT
  USING (
    apartment_id IS NOT NULL AND apartment_id IN (
      SELECT a.id FROM public.apartments a
      JOIN public.owners o ON o.id = a.owner_id
      WHERE o.profile_id = auth.uid()
    )
  );

CREATE POLICY "Owner reads own inspections" ON public.inspections FOR SELECT
  USING (
    apartment_id IS NOT NULL AND apartment_id IN (
      SELECT a.id FROM public.apartments a
      JOIN public.owners o ON o.id = a.owner_id
      WHERE o.profile_id = auth.uid()
    )
  );

-- Storage bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('owner-documents', 'owner-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff manages owner-documents bucket" ON storage.objects FOR ALL
  USING (bucket_id = 'owner-documents' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao')))
  WITH CHECK (bucket_id = 'owner-documents' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao')));
CREATE POLICY "Owner reads own owner files" ON storage.objects FOR SELECT
  USING (bucket_id = 'owner-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner uploads own owner files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'owner-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
